# Especificação 07: Implementação da Aba de Configurações

## 1. Visão Geral
Implementar a interface para gerenciamento das configurações globais do aplicativo, focando na edição e persistência do `App Code`.

## 2. Requisitos Funcionais
- **Gerenciamento de App Code:** Visualização e edição do código alfanumérico do aplicativo.
- **Persistência Imediata:** Sincronização com o backend (`POST /config`).

## 3. Design e UX (M3)
- **Layout:** Formulário centralizado em um `Card` elevado.
- **Componentes:**
  - `TextField` para o código.
  - `Button` para salvar.
- **Feedback:** Notificação visual de "Configurações Salvas".

## 4. Camada de API (Backend)
- **Endpoints:** 
  - `GET /config`: Carrega as configurações atuais.
  - `POST /config`: Atualiza as configurações.

## 5. Estrutura do Componente `SettingsForm`
```text
src/components/business/
└── SettingsForm.tsx
    ├── Campo: App Code (com botão de salvar ao lado ou abaixo)
    └── Seção: Info do Sistema (Versão, Status da Conexão)
```
