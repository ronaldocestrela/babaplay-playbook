# BabaPlay — Frontend (visão geral)

SPA React (Vite + TypeScript) para gestão de associações desportivas: autenticação multi-tenant, associados, check-ins, equipas, mensalidades, caixa, etc.

## Camadas e ficheiros de orientação

| Camada | Pasta | Ficheiro |
|--------|--------|----------|
| Entrada HTTP, envelope API, storage | `src/api/` | `src/api/AGENTS.md` |
| Chamadas ao backend por domínio | `src/services/` | `src/services/AGENTS.md` |
| Estado global de sessão | `src/contexts/` | `src/contexts/AGENTS.md` |
| Hooks (React Query, UI) | `src/hooks/` | `src/hooks/AGENTS.md` |
| Rotas e ecrãs | `src/pages/` | `src/pages/AGENTS.md` |
| Componentes partilhados e UI | `src/components/` | `src/components/AGENTS.md` |
| Utilitários | `src/lib/` | `src/lib/AGENTS.md` |
| Testes | `src/test/` | `src/test/AGENTS.md` |
| Nginx / Docker (assets) | `docker/` | `docker/AGENTS.md` |

## Fluxo de dados

1. **Páginas** compõem UI e chamam **hooks** ou **contexto**.
2. **Hooks** usam **serviços** e `@tanstack/react-query`.
3. **Serviços** usam `api` / `apiClient` de **`src/api`** (URLs `/api/...`).
4. **`axios-instance`** intercepta respostas: envelope `{ success, data, error, errors }`, JWT, `X-Tenant-Subdomain`, toasts e 401 → `/login`.

## Variáveis e alias

- `VITE_API_BASE_URL` — base URL da API (sem barra final).
- Alias TypeScript/Vite: `@/` → `src/`.

## Documentação de API

Contratos e convenções do backend: `docs/backend/` (Markdown neste repositório).
