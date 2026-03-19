# Especificação 06: Implementação da Aba de Edição em Massa

## 1. Visão Geral
Implementar uma interface de tabela (DataGrid) que permita gerenciar múltiplos conjuntos simultaneamente, facilitando a edição rápida de nomes, tipos e a presença de equipamentos em cada build.

## 2. Requisitos Funcionais
- **Visualização Tabular:** Linhas representando conjuntos e colunas representando atributos (Nome, Tipo) e Peças (Checkboxes).
- **Edição Inline:** Alterações feitas diretamente nas células da tabela.
- **Persistência em Lote:** Botão centralizado para salvar todas as alterações pendentes de uma vez (`PUT /sets/bulk`).

## 3. Design e UX (M3)
- **Tabela M3:** Fundo `bg-surface`, cabeçalhos destacados com `text-primary`.
- **Interatividade:**
  - Checkboxes para cada peça de equipamento.
  - Campos de texto minimalistas para Nome.
  - Select/Toggle para Tipo (R/C).
- **Feedback:** Barra de progresso ou estado de carregamento global durante o salvamento em lote.

## 4. Camada de API (Backend)
- **Endpoint:** `PUT /sets/bulk`.
- **Lógica:** A função `bulkUpdateSets` (já implementada e testada) processará o array de objetos enviados pelo frontend.

## 5. Estrutura do Componente `BulkEditTable`
```text
src/components/business/
└── BulkEditTable.tsx
    ├── Cabeçalho: Nome, Tipo, [Ícones de Equipamento...]
    ├── Corpo: Linhas editáveis por Conjunto
    └── Rodapé: Botão "Salvar Alterações em Massa"
```
