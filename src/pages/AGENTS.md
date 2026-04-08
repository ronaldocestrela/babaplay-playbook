# Camada `pages`

Componentes de **rota** (ecrãs completos). Cada ficheiro corresponde tipicamente a um path em `App.tsx`.

## Responsabilidades

- Compor layouts, formulários e tabelas usando `@/components/*`.
- Orquestrar **hooks** para dados e mutações; ler `useAuth()` quando precisar de utilizador/tenant.
- Navegação com `react-router-dom` (`useNavigate`, parâmetros de rota).

## Rotas públicas vs protegidas

- Rotas **fora** de `ProtectedRoute`: `/`, `/login`, `/cadastro`, `/convite/:token`.
- Área autenticada (filhas de `AppShell`): `/dashboard`, `/associados`, `/associacao`, `/check-ins`, `/equipas`, `/mensalidades`, `/caixa`, `/categorias`, `/posicoes`, etc.

## O que não colocar aqui

- Lógica HTTP repetida → **serviços**.
- Definição de cliente Axios ou tipos de envelope → **`src/api/`**.

## Ficheiros auxiliares

- `NotFound.tsx`, `PlaceholderPage.tsx`, `Index.tsx` — comportamento de entrada ou fallback.
