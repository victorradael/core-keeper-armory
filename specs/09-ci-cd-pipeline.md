# Especificação 09: CI/CD Pipeline — Testes, Semantic Release e Distribuição Electron

## 1. Visão Geral

Implementar um pipeline de integração e entrega contínua usando **GitHub Actions** que garanta qualidade a cada merge na `main` e gere instaladores Electron (Windows e Linux) automaticamente com versionamento semântico derivado dos próprios commits, sem intervenção manual.

O pipeline tem três responsabilidades distintas:

1. **CI** — validar qualidade do código (lint, typecheck, testes) em todo push/PR
2. **Release** — determinar a versão automaticamente via `semantic-release` e criar o GitHub Release com changelog
3. **Build** — compilar os instaladores Electron para Linux e Windows e anexá-los ao release

---

## 2. Contexto e Decisões Arquiteturais

### O que é distribuído
Apenas o **frontend Electron**. O backend (Docker/Fastify) é infraestrutura de servidor — devs o sobem separadamente. Usuários finais recebem o instalador do Electron e configuram a URL do servidor pela interface (feature já implementada na `SettingsForm`).

### Versionamento automático
`semantic-release` analisa os commits desde o último tag e determina o tipo de bump:
- `fix:` → patch (1.0.0 → 1.0.1)
- `feat:` → minor (1.0.0 → 1.1.0)
- `feat!:` ou `BREAKING CHANGE:` → major (1.0.0 → 2.0.0)

O dev não precisa gerenciar versões manualmente — basta seguir Conventional Commits (já adotados no projeto).

### Cross-platform builds
electron-builder deve rodar nativamente em cada plataforma alvo:
- **Linux** → runner `ubuntu-latest` → gera `.AppImage` e `.deb`
- **Windows** → runner `windows-latest` → gera instalador `.exe` (NSIS)

Os dois jobs rodam em paralelo após o `semantic-release` criar o release.

---

## 3. Estrutura de Arquivos a Criar

```
.github/
└── workflows/
    ├── ci.yml          # Roda em todo push e PR — lint, typecheck, testes
    └── release.yml     # Roda só em push na main — semantic-release + builds

frontend/
└── package.json        # Adicionar seção "build" do electron-builder

.releaserc.json         # Configuração do semantic-release (raiz do repo)
```

---

## 4. Workflow CI (`ci.yml`)

**Trigger:** `push` em qualquer branch + `pull_request` apontando para `main`

### Jobs

#### `lint-and-typecheck` (ubuntu-latest)
Roda em paralelo para backend e frontend.

**Backend:**
```
cd backend → npm ci → npm run lint → npm run build (tsc)
```

**Frontend:**
```
cd frontend → npm ci → npm run lint → npx tsc --noEmit
```
> O `tsc --noEmit` valida tipos sem gerar arquivos. O `npm run lint` usa Biome.

#### `test-backend` (ubuntu-latest) — depende de `lint-and-typecheck`
```
cd backend → npm ci → npm test
```
Roda `vitest run` — testes unitários das funções puras de `src/core/`.

> **Nota:** o frontend não tem testes de componentes neste momento — apenas lint + typecheck. Essa decisão pode ser revisada numa spec futura.

---

## 5. Workflow Release (`release.yml`)

**Trigger:** `push` na branch `main` (apenas)

### Job `release` (ubuntu-latest)

1. Checkout com `fetch-depth: 0` (semantic-release precisa de todo o histórico git)
2. Setup Node.js
3. `npm ci` na raiz (instala semantic-release e plugins)
4. Rodar `npx semantic-release`

O semantic-release executa os seguintes passos em ordem:
1. Analisa commits desde o último tag
2. Se nenhum commit relevante → encerra sem criar release
3. Se há commits relevantes → determina nova versão
4. Atualiza `CHANGELOG.md`
5. Faz bump no `version` do `frontend/package.json`
6. Commita o changelog e o package.json (`[skip ci]` para não disparar loop)
7. Cria tag git (ex: `v1.2.0`)
8. Cria **GitHub Release** com as release notes geradas

### Job `build` (matrix) — depende de `release` e só roda se houve release

**Matrix:**
```yaml
os: [ubuntu-latest, windows-latest]
```

Cada runner executa:
1. Checkout do tag recém-criado
2. Setup Node.js
3. `cd frontend && npm ci`
4. `npx vite build` (compila o React)
5. `npx electron-builder --publish=always` com `GH_TOKEN` no ambiente

O electron-builder com `--publish=always` e `GH_TOKEN` detecta o release existente pelo tag e anexa os artefatos a ele.

---

## 6. Configuração do `semantic-release` (`.releaserc.json`)

```json
{
  "branches": ["main"],
  "plugins": [
    "@semantic-release/commit-analyzer",
    "@semantic-release/release-notes-generator",
    ["@semantic-release/changelog", {
      "changelogFile": "CHANGELOG.md"
    }],
    ["@semantic-release/npm", {
      "npmPublish": false,
      "pkgRoot": "frontend"
    }],
    ["@semantic-release/git", {
      "assets": ["CHANGELOG.md", "frontend/package.json"],
      "message": "chore(release): ${nextRelease.version} [skip ci]\n\n${nextRelease.notes}"
    }],
    "@semantic-release/github"
  ]
}
```

**Dependências a instalar na raiz:**
```
semantic-release
@semantic-release/changelog
@semantic-release/git
@semantic-release/github
@semantic-release/npm
@semantic-release/commit-analyzer
@semantic-release/release-notes-generator
```

---

## 7. Configuração do `electron-builder` (`frontend/package.json`)

Adicionar a chave `"build"` ao `package.json` do frontend:

```json
"build": {
  "appId": "com.victorradael.core-keeper-armory",
  "productName": "Core Keeper Armory",
  "directories": {
    "output": "release"
  },
  "publish": {
    "provider": "github",
    "owner": "victorradael",
    "repo": "core-keeper-armory"
  },
  "linux": {
    "target": ["AppImage", "deb"],
    "category": "Utility"
  },
  "win": {
    "target": "nsis",
    "icon": "public/icon.ico"
  },
  "nsis": {
    "oneClick": false,
    "allowToChangeInstallationDirectory": true
  }
}
```

> **Pré-requisito:** arquivo `public/icon.ico` (Windows) e `public/icon.png` (Linux) precisam existir. Se não existirem, o electron-builder vai usar o ícone padrão ou falhar — isso deve ser tratado antes da primeira execução do pipeline.

---

## 8. Segredos necessários no GitHub

| Secret | Uso |
|--------|-----|
| `GH_TOKEN` | Usado pelo semantic-release e electron-builder para criar releases e fazer upload de artefatos. Precisa de permissão `contents: write` no repo. |

> O `GITHUB_TOKEN` nativo do Actions tem permissões suficientes para isso se configurado corretamente — pode ser usado como `GH_TOKEN` sem precisar de PAT externo.

---

## 9. Escopo dos Testes Backend a Implementar

O backend já tem Vitest configurado (`npm test` → `vitest run`). As funções em `src/core/equipment-manager.ts` são puramente funcionais (sem I/O) e devem ser cobertas:

| Função | Casos a testar |
|--------|---------------|
| `prepareSetForDisplay` | set vazio, set parcial, set completo |
| `getUniqueName` | nome único, nome duplicado simples, nome duplicado com número |
| `createSet` | campos obrigatórios, unicidade de ID, nome gerado |
| `cloneSet` | novo ID gerado, nome com "(Clone)", dados copiados |
| `updateEquipmentAcquisition` | item existente, item inexistente (deve lançar erro) |
| `bulkUpdateSets` | múltiplos sets, set não encontrado |

Criar em: `backend/src/__tests__/equipment-manager.test.ts`

---

## 10. Fluxo Completo (Resumo Visual)

```
dev faz commit (feat/fix/chore) → push → PR → merge na main
                                                      │
                              ┌───────────────────────┤
                              │                       │
                         ci.yml roda               release.yml roda
                    (lint + test sempre)        (semantic-release analisa)
                                                       │
                                          commits relevantes? ──não──► fim
                                                       │ sim
                                              determina versão
                                              atualiza CHANGELOG
                                              bump frontend/package.json
                                              commita [skip ci]
                                              cria tag vX.Y.Z
                                              cria GitHub Release
                                                       │
                                         ┌─────────────┴────────────┐
                                    ubuntu-latest              windows-latest
                                    vite build                 vite build
                                    electron-builder           electron-builder
                                    → .AppImage + .deb         → .exe (NSIS)
                                         └─────────────┬────────────┘
                                                 upload para
                                              GitHub Release vX.Y.Z
```

---

## 11. Dependências e Pré-requisitos

Antes da implementação:

1. **Repositório remoto no GitHub** criado e configurado como `origin`
2. **Ícone da aplicação** — `frontend/public/icon.ico` (Windows) e `frontend/public/icon.png` (Linux)
3. **Permissões do GITHUB_TOKEN** — no repo → Settings → Actions → General → Workflow permissions → "Read and write permissions"
4. **Primeiro tag manual** — se o repo não tem nenhuma tag, o semantic-release assume que está na versão `1.0.0` pela primeira vez. Pode-se criar `git tag v1.0.0` antes de ativar o pipeline para estabelecer a baseline.

---

## 12. O que NÃO está no escopo desta spec

- Testes de componentes React no frontend (decisão: só lint + typecheck por ora)
- Code signing dos executáveis (assinatura digital para evitar alertas de "publisher unknown" no Windows — pode ser spec futura)
- Auto-update dentro do app Electron (electron-updater — pode ser spec futura)
- Build para macOS
- Deploy do backend (é responsabilidade do dev/operação)
