# Camada `api`

Cliente HTTP, convenções do envelope da API e persistência mínima de chaves em `localStorage`.

## Responsabilidades

- **`axios-instance.ts`**: `apiClient` (Axios), interceptores de pedido/resposta, helpers `api.get/post/put/patch/delete` que devolvem já `data` extraído.
- **`api-response.ts`**: tipos do envelope `ApiResponse<T>`, DTOs e payloads alinhados com o backend (auth, tenants, associados, check-ins, etc.).
- **`storage-keys.ts`**: chaves e helpers para token, tenant, roles, permissions; `clearSessionAuth` / `clearAuthStorage`.

## Regras importantes

- Respostas com envelope `success: false` são rejeitadas; o interceptor pode mostrar `toast.error` (exceto se `skipEnvelopeErrorToast`).
- Pedidos para rotas que **não** começam por `/api/platform/` enviam `X-Tenant-Subdomain` a partir do storage (quando definido).
- Rotas **platform** não enviam header de tenant.
- `ApiRequestConfig` suporta `skipAuth`, `skipErrorToast`, `skipEnvelopeErrorToast`, `skipAuthRedirect` (ex.: fluxos públicos como convite).

## O que não colocar aqui

- Lógica de negócio por domínio → `src/services/`.
- Hooks React ou React Query → `src/hooks/`.
- Componentes ou páginas → `src/components/`, `src/pages/`.

## Ao alterar tipos em `api-response.ts`

Manter consistência com `docs/backend/*` e com os serviços que consomem esses tipos.
