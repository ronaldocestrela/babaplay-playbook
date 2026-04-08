# Camada `components`

Componentes React **reutilizáveis** e shell da aplicação.

## Estrutura

- **Raiz**: componentes de app (`ProtectedRoute.tsx`, `NavLink.tsx`).
- **`layouts/`**: `AppShell` — navegação lateral / estrutura das rotas autenticadas.
- **`ui/`**: primitives estilo shadcn/Radix (botões, dialog, tabela, formulário, etc.). Preferir composição e tokens do design system existente; evitar estilos ad-hoc nas páginas quando já existe primitive.

## Dependências

- Podem usar `@/hooks/*`, `@/contexts/auth-context`, `@/lib/utils` (`cn`).
- Não implementar chamadas REST aqui; receber dados via props ou usar hooks apenas quando o componente for o “owner” do dado.

## O que não colocar aqui

- Ecrãs completos de rota → `src/pages/`.
- Serviços HTTP → `src/services/`.

## `ProtectedRoute`

Envolve rotas que exigem `isAuthenticated`; redireciona para `/login` com `state.from` para eventual retorno.
