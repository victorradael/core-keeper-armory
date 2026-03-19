# Especificação 04: Integração Backend-Frontend e Tela de Checklist

## 1. Visão Geral
Estabelecer a camada de comunicação entre o Frontend (Electron/React) e o Backend (Node.js API em Container), implementando a funcionalidade principal de **Checklist (Dashboard)** com sincronização em tempo real e atualizações otimistas.

## 2. Camada de Comunicação (API Client)
- **Tecnologia:** Axios.
- **Configuração:** Instância centralizada com `baseURL: http://localhost:3000`.
- **Tratamento de Erros:** Interceptadores para capturar falhas de conexão com o container e exibir feedbacks visuais (Toasts/Snackbars).

## 3. Gerenciamento de Estado de Servidor (React Query)
Utilizar o `@tanstack/react-query` para gerenciar o ciclo de vida dos dados:
- **Query Keys:** `['sets']`, `['catalog']`, `['config']`.
- **Stale Time:** 1 minuto para evitar refetching excessivo durante a navegação entre abas.
- **Refetch on Window Focus:** Desativado (comportamento desktop controlado).

## 4. Funcionalidade: Checklist (Dashboard)

### 4.1. Fluxo de Dados
1. O Frontend solicita `GET /sets` e `GET /catalog`.
2. Os dados são processados para exibição em cards expansíveis.
3. Filtros de busca (nome/peça) são aplicados localmente no frontend para máxima velocidade.

### 4.2. Atualizações Otimistas (Optimistic Updates)
Ao marcar um item como "adquirido" (`PATCH /sets/:id/items/:key`):
1. O React Query atualiza o cache local instantaneamente.
2. A UI reflete a mudança (barra de progresso e checkbox) antes da resposta do servidor.
3. Se a requisição falhar, o estado anterior é restaurado e o usuário é notificado.

## 5. Componentes de Negócio

### 5.1. `BuildCard` (M3 Elevated Card)
- **Header:** Nome do Build, Badge de Tipo (R/C) e Indicador de "Completo" (🏆).
- **Progress:** Barra de progresso linear animada.
- **Expandable Content:** Lista de equipamentos com checkboxes customizados.
- **Actions:** Menu de contexto ou botões rápidos para Clonar, Editar e Excluir.

### 5.2. `EmptyState`
- Visualização amigável quando não houver builds cadastrados, com CTA para a aba de Cadastro.

## 6. Sincronização de Configurações
- O `App Code` deve ser carregado no boot da aplicação e ficar disponível globalmente via Contexto ou Hook.

## 7. Passos de Implementação
1. Instalação e configuração do `QueryClientProvider`.
2. Criação do serviço `api.ts` e hooks customizados (`useSets`, `useToggleItem`).
3. Implementação do `BuildCard` com animações do Tailwind v4.
4. Montagem do Grid no Dashboard com suporte a filtros.
