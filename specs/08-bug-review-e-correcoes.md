# 08 — Bug Review e Correções

> Review completo do projeto. Documenta todos os problemas encontrados, a causa raiz de cada um, e o que precisa ser feito para ter todas as funcionalidades operantes.

---

## Contexto: o sintoma principal

A aplicação exibe um "flicker" leve ao tentar criar ou editar — a UI muda por um instante e volta ao estado original, sem persistir nada.

O padrão do flicker é causado pela combinação de **optimistic update** do React Query + **requisição que falha** no backend:

1. `onMutate` → aplica a mudança localmente (usuário vê a mudança)
2. API retorna erro (4xx / 5xx) ou dado inconsistente
3. `onError` → reverte ao estado anterior
4. `onSettled` → invalida queries, refetch traz dado antigo do servidor

---

## BUG #1 — Rotas ausentes no backend (CRÍTICO)

**Arquivo:** `backend/src/index.ts`

O frontend chama 4 endpoints que simplesmente não existem no backend. As funções de lógica estavam implementadas e importadas no arquivo, mas nunca conectadas a rotas HTTP.

| Rota esperada pelo frontend | Hook | Status antes do fix |
|---|---|---|
| `DELETE /sets/:id` | `useDeleteSet()` | ❌ 404 |
| `POST /sets/:id/clone` | `useCloneSet()` | ❌ 404 |
| `PUT /sets/bulk` | `useBulkUpdate()` | ❌ 404 |
| `POST /config` | `useConfig().updateConfig` | ❌ 404 |

**Consequência exata:** o axios recebe 404, a mutation vai para `onError`/`onSettled`, o optimistic update é revertido. O "flicker" é exatamente esse ciclo.

**Status:** rotas adicionadas em sessão anterior. Ver BUG #2 sobre por que pode ainda não ter efeito.

**O que validar após correção:**
- Deletar um set → set some da lista imediatamente
- Clonar um set → cópia aparece com sufixo ` (Clone)` ou numeração
- Salvar o Master Ledger → dados persistem após reload
- Salvar config → campo retorna com o valor salvo

---

## BUG #2 — Container não reiniciando após mudanças de código (CRÍTICO OPERACIONAL)

**Arquivos:** `compose.yml`, `backend/package.json`

O `compose.yml` usa volume bind mount:
```yaml
volumes:
  - ./backend/src:/app/src
```

O comando de desenvolvimento usa `nodemon`:
```
nodemon --watch src --ext ts --exec npx tsx src/index.ts
```

**Problema:** No Linux, `nodemon` dentro de Docker frequentemente **não detecta mudanças** em arquivos editados pelo host via bind mount. Os eventos `inotify` não são propagados para dentro do container de forma confiável. O servidor continua rodando o código antigo mesmo depois do arquivo ter sido salvo no host.

**Por que o 204 aparece nos logs:** o `@fastify/cors` responde requisições OPTIONS (CORS preflight) com `204 No Content`. Isso é comportamento normal e não indica que a rota real funcionou. O log 204 é do preflight, não da requisição POST/PATCH/DELETE.

**Solução:**

Após qualquer mudança no código do backend, reiniciar manualmente:

```bash
docker compose restart backend
```

Ou, se mudanças estruturais (Dockerfile, dependências):

```bash
docker compose up -d --build
```

**Alternativa permanente:** configurar nodemon com polling para funcionar corretamente em bind mounts:

```json
// backend/nodemon.json (criar arquivo)
{
  "watch": ["src"],
  "ext": "ts",
  "exec": "npx tsx src/index.ts",
  "legacyWatch": true,
  "poll": 1000
}
```

E atualizar o script:
```json
// backend/package.json
"dev": "nodemon"
```

---

## BUG #3 — ConfigManager escreve no caminho errado (MÉDIO)

**Arquivo:** `backend/src/core/config-manager.ts`

```typescript
const CONFIG_FILE = path.join(__dirname, '..', 'data', 'app_config.json');
```

`config-manager.ts` está em `/app/src/core/`. O `__dirname` resolve para `/app/src/core/`.

Portanto:
- `CONFIG_FILE` = `/app/src/core/../data/app_config.json` = **`/app/src/data/app_config.json`**

O volume Docker mapeia `./data:/app/data`. O arquivo de config é salvo em `/app/src/data/`, que está dentro do volume do **código-fonte** (`./backend/src`), não do volume de dados.

Isso significa:
1. A config é salva/lida de `./backend/src/data/app_config.json` (dentro do source)
2. Ao fazer `docker compose down && up --build`, se o `COPY . .` do Dockerfile não incluir esse arquivo, a config é perdida
3. O arquivo de config fica no repositório (risco de commitar dados)

**O `DATA_FILE` em `index.ts` está correto** porque `index.ts` fica em `/app/src/` e usa `__dirname` = `/app/src/`, resultando em `/app/data/` — caminho correto.

**Correção:** usar um caminho absoluto fixo ou uma variável de ambiente:

```typescript
// config-manager.ts
const DATA_DIR = process.env.DATA_DIR || path.join(__dirname, '..', '..', 'data');
const CONFIG_FILE = path.join(DATA_DIR, 'app_config.json');
```

E no `index.ts` (para manter consistência):
```typescript
const DATA_DIR = process.env.DATA_DIR || path.join(__dirname, '..', 'data');
const DATA_FILE = path.join(DATA_DIR, 'equipment_sets.json');
```

---

## BUG #4 — `updateEquipmentAcquisition` falha silenciosamente (BAIXO)

**Arquivo:** `backend/src/core/equipment-manager.ts`

```typescript
export function updateEquipmentAcquisition(set, equipmentKey, acquiredStatus) {
  if (set.equipment[equipmentKey]) { // se undefined → não atualiza
    return { ...set, equipment: { ... } };
  }
  return set; // retorna set inalterado, sem erro
}
```

Se a chave não existir no `equipment` do set, a função retorna o set sem modificação. O backend responde 200 com dado inalterado, o frontend invalida as queries, refetch traz o dado antigo → parece que "nada aconteceu".

Na prática isso pode ocorrer se um set foi criado sem um item que depois aparece no catálogo, ou por inconsistência de dados.

**Correção:** retornar erro explícito para a rota identificar e responder 404 ou 400:

```typescript
export function updateEquipmentAcquisition(set, equipmentKey, acquiredStatus) {
  if (!set.equipment[equipmentKey]) {
    throw new Error(`Item '${equipmentKey}' não encontrado no set '${set.id}'`);
  }
  return { ...set, equipment: { ... } };
}
```

E na rota:
```typescript
try {
  const updatedSet = updateEquipmentAcquisition(targetSet, key, acquired);
  // ...
} catch (e) {
  return reply.status(400).send({ error: (e as Error).message });
}
```

---

## BUG #5 — Dockerfile tem `|| true` na compilação TypeScript (BAIXO)

**Arquivo:** `backend/Dockerfile`

```dockerfile
RUN npm run build || true
```

O `|| true` faz com que erros de compilação TypeScript sejam silenciados. Se o `tsc` falhar, o build do Docker continua. O app em dev usa `tsx` (sem compilação), então erros de tipo só aparecem nesse step do Dockerfile — e atualmente são ignorados.

**Correção:** remover o `|| true`. Se o TypeScript tiver erros reais, o build deve falhar para que os erros sejam visíveis:

```dockerfile
RUN npm run build
```

---

## BUG #6 — Sem feedback visual para erros de mutations (UX)

**Arquivos:** `frontend/src/hooks/useSets.ts`, todos os componentes de negócio

Nenhuma mutation tem tratamento de erro visível para o usuário. Quando uma requisição falha:
- O optimistic update é revertido (flicker)
- Nenhuma mensagem é exibida
- O usuário não sabe o que aconteceu

Hooks afetados: `useDeleteSet`, `useCloneSet`, `useBulkUpdate`, `useCreateSet`, `useConfig`.

**Correção sugerida:** adicionar `onError` com um toast/notificação simples. Exemplo para `useDeleteSet`:

```typescript
onError: () => {
  // disparar um toast: "Falha ao deletar. Verifique a conexão com o backend."
}
```

Qualquer solução de notificação serve (estado local, biblioteca de toast, etc). O importante é que o usuário tenha feedback quando algo falha.

---

## Inconsistência — `id` opcional no backend, obrigatório no frontend

**Arquivos:** `backend/src/types/index.ts`, `frontend/src/types/index.ts`

```typescript
// Backend
interface EquipmentSet {
  id?: string; // opcional
  ...
}

// Frontend
interface EquipmentSet {
  id: string; // obrigatório
  ...
}
```

O backend cria o `id` via `createSet()` (sempre garante um UUID), mas o tipo não reflete isso. Isso pode gerar divergências de tipagem se o TypeScript for usado com `strict: true` em operações que dependem do `id`.

**Correção:** tornar `id` obrigatório no backend também, ou criar um tipo `NewEquipmentSet` (sem id) separado do `EquipmentSet` (com id garantido).

---

## Checklist de validação pós-correções

Após aplicar todas as correções e reiniciar o container:

- [ ] **Forge (criação):** preencher nome + selecionar itens + clicar FORGE BLUEPRINT → set aparece na aba Armory Tracking
- [ ] **Armory Tracking (item toggle):** expandir um set → marcar/desmarcar checkbox → mudança persiste após reload
- [ ] **Armory Tracking (clone):** hover em um card → clicar ícone de cópia → cópia aparece com sufixo
- [ ] **Armory Tracking (delete):** hover em um card → clicar ícone de lixeira → confirmar → set some
- [ ] **Master Ledger (bulk edit):** alterar nome/tipo/equipamentos → COMMIT CHANGES → mudanças persistem após mudar de aba e voltar
- [ ] **Core Config:** alterar app code → SAVE CONFIGURATION → mensagem de sucesso aparece → recarregar e verificar que o valor foi salvo

---

## Ordem de execução das correções

1. **Imediato** — reiniciar o container para aplicar as rotas já adicionadas ao `index.ts`:
   ```bash
   docker compose restart backend
   ```

2. **Curto prazo** — configurar nodemon com polling (BUG #2) para evitar o problema de detecção de mudanças no futuro

3. **Curto prazo** — corrigir o caminho do `CONFIG_FILE` no `config-manager.ts` (BUG #3)

4. **Médio prazo** — adicionar feedback de erro nas mutations (BUG #6)

5. **Médio prazo** — corrigir a falha silenciosa do `updateEquipmentAcquisition` (BUG #4)

6. **Opcional** — remover `|| true` do Dockerfile (BUG #5) e corrigir inconsistência de tipos (Inconsistência)
