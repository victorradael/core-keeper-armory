# AGENTS.md - Build Keeper Electron

## Arquitetura e Estrutura
- **Separation of Concerns:** Toda a regra de negócio e persistência deve residir no servidor Node.js. O frontend Electron deve ser estritamente uma camada de apresentação e interação.
- **Backend Isolarion:** O servidor Node.js deve rodar obrigatoriamente em um container Docker, garantindo ambiente determinístico.
- **Frontend Electron:** Utilize o processo de `Preload` para comunicação IPC segura e limite o acesso do processo de renderização a recursos do sistema.

## Código e Qualidade
- **TypeScript Only:** Proibido o uso de `any`. Todas as interfaces e tipos devem ser explicitamente definidos e compartilhados entre frontend e backend quando necessário.
- **Linting & Formatting:** O Biome é a única fonte da verdade para estilo de código. Todos os arquivos devem passar pela validação do Biome antes de qualquer alteração ser considerada finalizada.
- **Business Logic:** Validações de dados e transformações complexas devem ser implementadas no backend como funções puras e testáveis.

## Interface e Design (Material Design + Tailwind)
- **Aesthetic Consistency:** Utilize Tailwind CSS para implementar os princípios do Material Design 3 (M3). Foque em elevação, cores semânticas e estados interativos claros.
- **Componentization:** Extraia componentes UI reutilizáveis para manter o frontend DRY (Don't Repeat Yourself).
- **Responsive Desktop:** O design deve se adaptar a diferentes tamanhos de janela, mantendo a usabilidade em resoluções mínimas e telas ultra-wide.

## Dados e Persistência
- **JSON Stability:** Mantenha a estrutura de dados compatível com a versão anterior (`equipment_sets.json`). Alterações no schema devem ser incrementais e não-destrutivas.
- **Single Source of Truth:** O estado da aplicação deve ser sincronizado com o servidor de forma reativa para garantir que o que o usuário vê é sempre o dado persistido.

## Fluxo de Trabalho
- **Surgical Changes:** Realize modificações focadas e granulares. Cada alteração deve ter um propósito claro e documentado.
- **Validation First:** Sempre valide as mudanças no container do backend e no processo do Electron simultaneamente após qualquer alteração estrutural.
- **Zero Warn Policy:** Mantenha o console limpo de avisos de depreciação ou erros de linting.
