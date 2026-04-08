# Camada `test`

Testes automatizados (Vitest + Testing Library; configurados no projeto).

## Responsabilidades

- **`setup.ts`**: configuração global do ambiente de teste.
- Ficheiros `*.test.ts` / `*.test.tsx`: casos por domínio (ex.: autorização de check-ins).

## Ao adicionar testes

- Preferir testar comportamento observável (hooks, componentes, utilitários) em vez de detalhes de implementação dos serviços.
- Mockar `api` / módulos de rede quando necessário para isolar UI ou regras.

## O que não colocar aqui

- Código de produção que não seja especificamente utilitário de teste → pastas `src/` correspondentes.
