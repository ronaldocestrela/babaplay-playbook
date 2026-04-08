# Camada `lib`

Utilitários **agnósticos de domínio** (sem chamadas à API).

## Conteúdo atual

- **`utils.ts`**: helpers genéricos (ex.: `cn` para classes Tailwind com `clsx` + `tailwind-merge`).

## O que colocar aqui

- Funções puras, formatadores partilhados, constantes UI não ligadas a um único ecrã.

## O que não colocar aqui

- Tipos DTO da API → `src/api/api-response.ts`.
- Cliente HTTP → `src/api/axios-instance.ts`.
