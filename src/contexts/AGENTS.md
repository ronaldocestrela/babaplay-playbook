# Camada `contexts`

Estado global da aplicação via React Context.

## `auth-context.tsx`

- **`AuthProvider`**: lê estado inicial de `localStorage` (token, userId, roles, permissions, tenant).
- Expõe `login`, `register`, `registerWithInvitation`, `logout`, `logoutAll`, `setTenantSubdomain`.
- Delega chamadas HTTP a `@/services/auth.service` e persiste `AuthData` após sucesso.
- Consumir com `useAuth()` (nunca usar o contexto “nu” fora do provider).

## Dependências

- `@/api/storage-keys`, `@/api/api-response` (tipos).
- `@/services/auth.service`.

## O que não colocar aqui

- Queries de listagens por domínio (associados, equipas, etc.) → preferir **hooks** + React Query.
- Novos contextos só se houver estado verdadeiramente global partilhado; evitar duplicar o que o TanStack Query já cobre.
