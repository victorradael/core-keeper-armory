# Especificação 01: Construção Inicial - Build Keeper Electron

## 1. Visão Geral
Reconstrução completa da ferramenta `Build Keeper` (originalmente em Streamlit/Python) utilizando uma arquitetura moderna baseada em **Electron**, **Tailwind CSS** e um servidor **Node.js** em container. O objetivo é oferecer uma experiência desktop nativa, performática e com design refinado baseado em **Material Design**.

## 2. Tecnologias
- **Frontend:** Electron (v33+), React (v19+), TypeScript.
- **Estilização:** Tailwind CSS (v4+), Material Design 3 (M3) components.
- **Backend:** Node.js (v23+), Fastify ou Express, TypeScript.
- **Linting/Formatting:** Biome (v1.9+).
- **Containerização:** Docker & Docker Compose.
- **Persistência:** JSON Files (mantendo compatibilidade com o formato original).

## 3. Funcionalidades Core (Paridade com Build Keeper v1)
### 3.1. Dashboard / Checklist
- Visualização de conjuntos (Builds) em cards expansíveis.
- Filtro de busca por nome e peças específicas.
- Barra de progresso visual para cada conjunto.
- Checklist de itens adquiridos com persistência imediata.
- Categorização visual entre tipos **R** (Regular) e **C** (Custom).
- Ações rápidas: Clonar, Editar e Excluir.

### 3.2. Cadastro de Conjuntos
- Formulário intuitivo para criação de novos builds.
- Seleção de peças (Capacete, Peitoral, Calças, Anel 1, Anel 2, Colar, Mochila, Mão Secundária).
- Atribuição de nomes customizados para cada peça.

### 3.3. Edição em Massa
- Interface de tabela (DataGrid) para edição rápida de múltiplos conjuntos simultaneamente.
- Toggle de presença de itens em cada build.
- Edição de nomes e tipos diretamente na linha.

### 3.4. Configurações
- Gerenciamento do `App Code` global.
- Persistência de preferências de interface.

## 4. Requisitos de Design (Material Design)
- **Cores:** Paleta Deep Purple/Violet (conforme o tema original), com suporte a Dark Mode.
- **Componentes:** Cards com elevação, Botões FAB (Floating Action Button) para criação, Inputs com labels flutuantes, Progress bars lineares.
- **Interatividade:** Transições suaves de expansão/colapso e feedback tátil/visual para ações de salvamento.

## 5. Arquitetura de Comunicação
- O Electron (Frontend) se comunica com o Servidor Node.js (Backend) via **HTTP/REST** ou **WebSockets**.
- O Backend roda em um container Docker, isolando a lógica de negócio e o acesso ao sistema de arquivos (data/).
- O Frontend Electron é empacotado como uma aplicação desktop tradicional.

## 6. Qualidade e Padrões
- **Linting:** Configuração rigorosa do Biome para garantir zero avisos de lint e formatação consistente.
- **Tipagem:** TypeScript em 100% do código (frontend e backend).
- **Testes:** Preparar estrutura para testes unitários na lógica de negócio do servidor.
