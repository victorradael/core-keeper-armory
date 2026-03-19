# Especificação 03: Construção do Frontend Desktop (Electron + React)

## 1. Visão Geral
Implementação da interface de usuário da aplicação **Build Keeper Electron**, utilizando **React 19**, **Tailwind CSS v4** e seguindo rigorosamente os padrões de **Material Design 3 (M3)**. A interface será imersiva, com navegação por abas e componentes customizados.

## 2. Experiência e Layout (M3 Imersivo)

### 2.1. Barra de Título Customizada (Imersiva)
- **Visual:** Integrada ao fundo do app, sem bordas nativas.
- **Funcionalidade:** Área de arraste (`-webkit-app-region: drag`) e botões de controle (Minimizar, Maximizar, Fechar) estilizados em M3.
- **Branding:** Nome do app e ícone centralizados ou à esquerda na barra.

### 2.2. Navegação por Abas (Primary Tabs)
- **Posição:** Logo abaixo da barra de título.
- **Abas:**
  1. **🎯 Checklist** (Dashboard principal)
  2. **📋 Cadastro** (Criação de novos conjuntos)
  3. **📝 Edição em Massa** (Tabela de gerenciamento)
  4. **⚙️ Configurações** (Ajustes globais)
- **Interatividade:** Indicador de aba ativa (Pill/Underline M3) com transição suave.

## 3. Design System (Tailwind v4 + M3 Custom)
A estilização será feita manualmente com Tailwind v4, focando em tokens de design M3:

### 3.1. Tokens de Tema (Deep Purple)
- `background`: `#1C1B1F` (Dark)
- `surface`: `#2B2930` (Cards e Abas)
- `primary`: `#D0BCFF` (Ações principais)
- `secondary`: `#CCC2DC` (Elementos de apoio)
- `tertiary`: `#EFB8C8` (Destaques)
- `error`: `#F2B8B5`

### 3.2. Componentização Manual
- **M3 Card:** Bordas `rounded-[24px]`, fundo `bg-surface`, padding generoso.
- **M3 Button:** `rounded-full` para botões de ação, `rounded-xl` para botões de formulário.
- **M3 Checkbox:** Customizado com ícone do Lucide e animação de escala.
- **M3 Input:** Estilo "Outlined" com foco em `primary`.

## 4. Integração e Estado
- **Roteamento Interno:** Uso de `state` simples para troca de abas ou `react-router-dom` (MemoryRouter) para navegação isolada no Electron.
- **IPC Bridge:** A barra de título customizada enviará comandos via `window.electronAPI` para o processo Main controlar a janela.
- **Data Fetching:** React Query para todas as operações no backend.

## 5. Estrutura de Componentes
```text
src/
├── components/
│   ├── layout/
│   │   ├── TitleBar.tsx      (Controles de janela e Arraste)
│   │   ├── TabBar.tsx        (Navegação superior)
│   │   └── MainContainer.tsx (Área de conteúdo com transições)
│   ├── ui/
│   │   ├── Card.tsx
│   │   ├── Button.tsx
│   │   ├── Checkbox.tsx
│   │   └── TextField.tsx
│   └── business/             (Componentes específicos do domínio)
│       ├── BuildCard.tsx
│       └── BulkEditTable.tsx
```

## 6. Qualidade
- **Biome:** Execução automática no save para linting e formatação.
- **Type Safety:** Propriedades de componentes estritamente tipadas.
- **Zero JS:** Nenhuma lógica de negócio complexa no frontend; tudo via chamadas de API.
