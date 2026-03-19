# Especificação 05: Implementação da Aba de Cadastro

## 1. Visão Geral
Implementar a funcionalidade de criação de novos conjuntos de equipamentos (Builds), com um formulário intuitivo que siga os padrões de **Material Design 3**, incluindo seleção de peças e atribuição de nomes customizados.

## 2. Requisitos Funcionais
- **Nome do Conjunto:** Campo obrigatório com validação de duplicidade (tratada no backend).
- **Tipo de Conjunto:** Seleção entre **R** (Regular) e **C** (Custom).
- **Seleção de Equipamentos:** Grid de itens do catálogo onde o usuário escolhe quais peças compõem o set.
- **Nomes Customizados:** Opção de dar um nome específico para cada peça selecionada (ex: "Capacete de Vidro").

## 3. Design e UX (M3)
- **Layout:** Formulário centralizado em um `Card` elevado.
- **Interatividade:** 
  - O campo de "Nome Específico" de uma peça só deve ser habilitado se o checkbox daquela peça estiver marcado.
  - Feedback visual de "Salvando..." no botão principal.
  - Limpeza do formulário e notificação de sucesso após a criação.

## 4. Camada de API (Backend)
- **Endpoint:** `POST /sets`.
- **Validação:** Garantir que o payload siga a interface `EquipmentSet`.
- **TDD:** Adicionar testes unitários para garantir que o conjunto criado tenha um ID único e que o nome seja ajustado pela lógica `getUniqueName` caso já exista.

## 5. Implementação no Frontend
- **Formulário:** Utilizar `react-hook-form` para gerenciar o estado e validações.
- **Mutação:** Hook `useCreateSet` integrado ao React Query para atualização instantânea do Dashboard após a criação.

## 6. Estrutura do Componente `RegistrationForm`
```text
src/components/business/
└── RegistrationForm.tsx
    ├── Seção: Informações Básicas (Nome, Tipo)
    ├── Seção: Seleção de Peças (Grid com Checkbox + TextField por linha)
    └── Ação: Botão "Criar Conjunto" (M3 Filled Button)
```
