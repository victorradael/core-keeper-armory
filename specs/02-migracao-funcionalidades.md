# Especificação 02: Migração de Funcionalidades e TDD

## 1. Objetivo
Migrar integralmente a lógica de negócio do projeto `build_keeper` (Python) para a nova API Node.js, garantindo paridade funcional e robustez através de uma abordagem **Test-First**.

## 2. Estratégia de Desenvolvimento (TDD)
O desenvolvimento de cada funcionalidade na API **deve** seguir este fluxo obrigatório:
1. **Definição de Tipos:** Criar as interfaces TypeScript para os dados envolvidos.
2. **Testes Unitários:** Escrever casos de teste para a lógica de negócio isolada (helpers, cálculos, transformações).
3. **Implementação da Lógica:** Desenvolver o código necessário para fazer os testes passarem.
4. **Integração na Rota:** Expor a lógica validada através dos endpoints do Fastify.

## 3. Módulos de Migração (Core Business)

### 3.1. Gerenciador de Equipamentos (`EquipmentManager`)
Transpor a lógica do `equipment_manager.py` para `backend/src/core/equipment-manager.ts`.
- **Geração de Nomes Únicos:** Função `getUniqueName` para evitar duplicatas (ex: "Set 1", "Set 2").
- **Cálculo de Progresso:** Função `prepareSetForDisplay` que calcula `_total_items`, `_acquired_items` e `_is_complete`.
- **Clonagem de Conjuntos:** Lógica para duplicar um set com um novo ID e nome ajustado.
- **Edição em Massa:** Lógica para processar o payload da tabela e atualizar múltiplos sets.

### 3.2. Catálogo e Configuração
- **Catálogo:** Migrar `equipment_catalog.py` para um objeto tipado no backend.
- **App Code:** Lógica de persistência e validação do código global do app.

## 4. Endpoints da API (Paridade Funcional)

| Funcionalidade | Endpoint | Lógica Original |
| :--- | :--- | :--- |
| Listar Builds | `GET /sets` | `load_equipment_sets` + `prepare_set_for_display` |
| Criar Build | `POST /sets` | `add_equipment_set` + `get_unique_name` |
| Clonar Build | `POST /sets/:id/clone` | `clone_equipment_set` |
| Atualizar Item | `PATCH /sets/:id/items/:key` | `update_equipment_acquisition` |
| Edição em Massa | `PUT /sets/bulk` | `bulk_update_from_dataframe` |
| App Config | `GET/POST /config` | `load_config` / `save_config` |

## 5. Ferramental de Testes
- **Framework:** Vitest (v3+).
- **Cobertura:** Mínimo de 90% para as funções do `EquipmentManager`.
- **Ambiente:** Os testes devem rodar tanto localmente quanto dentro do container de desenvolvimento.

## 6. Critérios de Aceite
- Todos os testes unitários passando.
- Paridade de comportamento com a versão Python (mesmo formato de JSON e mesma lógica de incremento de nomes).
- Zero regressões nas regras de "has_in_set" e "acquired".
