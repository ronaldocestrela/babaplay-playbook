# BabaPlay Frontend

SPA React + Vite + TypeScript para gestão de associações desportivas.

## Visão geral

Este projeto é o front-end do BabaPlay, uma aplicação de gestão para associações desportivas com foco em:

- autenticação multi-tenant
- gestão de associados
- check-ins e presença
- equipas e posições
- mensalidades e pagamentos
- caixa e categorias financeiras
- permissões e roles

## Stack principal

- React 18
- Vite
- TypeScript
- Tailwind CSS
- React Router DOM
- TanStack Query
- Axios
- Zod
- Radix UI
- Vitest + Playwright para testes

## Estrutura importante

- `src/api/` — cliente HTTP, armazenamento local e definições de resposta
- `src/services/` — chamadas de backend por domínio
- `src/hooks/` — hooks de negócio e React Query
- `src/contexts/` — estado global de autenticação
- `src/pages/` — páginas e rotas principais
- `src/components/` — UI compartilhada e layouts
- `src/lib/` — utilitários gerais
- `docs/backend/` — documentação de API e contratos de backend

## Variáveis de ambiente

- `VITE_API_BASE_URL` — base URL da API (sem barra final)

## Executando localmente

Instale dependências e inicie o servidor de desenvolvimento:

```bash
npm install
npm run dev
```

Abra `http://localhost:5173` no navegador.

## Build

Gerar artefato de produção:

```bash
npm run build
```

Pré-visualizar o build:

```bash
npm run preview
```

## Testes

Executar testes unitários:

```bash
npm run test
```

Cobertura atual relevante inclui:

- autorização de ownership para check-ins (`use-checkins`)
- mensagens de erro da camada API (`extractErrorMessage`)
- utilitários de storage/autenticação (`readJsonStorage`, `clearSessionAuth`, `clearAuthStorage`)
- contratos de chamadas dos serviços `auth.service` e `checkins.service`

Executar testes em modo observável:

```bash
npm run test:watch
```

## Lint

Verificar o código com ESLint:

```bash
npm run lint
```

## Docker / desenvolvimento local

O repositório contém arquivos para Docker e Docker Compose:

- `Dockerfile`
- `Dockerfile.dev`
- `docker-compose.yml`
- `docker-compose.dev.yml`

## Documentação da API

A documentação de backend está disponível em `docs/backend/` e descreve os contratos usados pelo frontend.

- `docs/backend/api-conventions.md`
- `docs/backend/auth-controller.md`
- `docs/backend/associations-controller.md`
- `docs/backend/checkins-controller.md`
- `docs/backend/cashentries-controller.md`

> O frontend consome APIs REST com envelope padrão: `{ success, data, error, errors }`.

## Convenções de código

- Alias TypeScript/Vite: `@/` → `src/`
- O cliente `axios-instance.ts` trata autenticação, headers de tenant e respostas de erro globais.

## Observações

- O projeto já inclui suporte a funções de autenticação, gestão de associações, membros, equipas, caixas e relatórios.
- Use `src/hooks/` para acesso a dados com `@tanstack/react-query`.
- Use `src/services/` para encapsular todas as chamadas ao backend.
