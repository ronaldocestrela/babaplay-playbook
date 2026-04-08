# Camada `services`

Funções assíncronas que mapeiam **recursos REST** para chamadas `api` / `apiClient`, uma unidade por ficheiro (domínio).

## Padrão

- Importar tipos de `@/api/api-response` e o cliente de `@/api/axios-instance`.
- Exportar funções nomeadas (`login`, `listAssociates`, etc.) que devolvem Promises com o tipo de dados já “limpo” (o interceptor já extrai `data` do envelope em sucesso).
- Usar `api.post(..., { skipAuth: true })` ou outras flags em `ApiRequestConfig` quando o fluxo exige (rotas anónimas, sem toast, etc.).

## Ficheiros típicos

- `auth.service.ts`, `associates.service.ts`, `associations.service.ts`, `checkins.service.ts`, `teams.service.ts`, `memberships.service.ts`, `cash-entries.service.ts`, `categories.service.ts`, `positions.service.ts`, `plans.service.ts`, `tenants.service.ts`, `permissions.service.ts`, `roles.service.ts`.

## O que não colocar aqui

- Estado React ou `useMutation` / `useQuery` → `src/hooks/`.
- Persistência de sessão após login → `src/contexts/auth-context.tsx` (pode chamar serviços).
- Componentes ou formatação de UI.

## Ao adicionar endpoints

1. Confirmar path e corpo em `docs/backend/`.
2. Tipos em `api-response.ts` se necessário.
3. Função fina no serviço; tratamento de UX (toast, navegação) nos hooks ou páginas.
