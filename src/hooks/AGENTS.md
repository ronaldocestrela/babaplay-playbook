# Camada `hooks`

Hooks React que encapsulam **React Query** (`useQuery`, `useMutation`, `useQueryClient`), **react-router-dom** e **auth**.

## Padrão

- Hooks de dados: `queryKey` estável, `queryFn` / `mutationFn` chamando **serviços** em `@/services/*`.
- Hooks de auth (`use-auth.ts`): mutations que chamam métodos do `useAuth()` do contexto; toasts de sucesso/erro conforme o caso.
- `use-mobile.tsx`: deteção de viewport (breakpoint).

## Convenções

- Nomes `useXxx` alinhados ao domínio (`use-associates.ts`, `use-checkins.ts`, …).
- Invalidar queries com `queryClient.invalidateQueries` após mutações que alteram listas.
- Comentários JSDoc úteis quando o fluxo depende de headers (`X-Tenant-Subdomain`) ou de interceptores.

## O que não colocar aqui

- Chamadas HTTP diretas sem passar por serviços (exceto casos muito pontuais já existentes).
- JSX de página; composição de layout → `src/pages/` e `src/components/`.
