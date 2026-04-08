# Pasta `docker`

Configuração de **nginx** e scripts auxiliares para imagens Docker do frontend.

## Ficheiros

- **`nginx.conf`**: servidor estático para o build Vite (`/usr/share/nginx/html`), copiado no `Dockerfile` para `/etc/nginx/conf.d/default.conf`.
- **`entrypoint-dev.sh`**: usado em fluxos de desenvolvimento com Docker (se aplicável ao `Dockerfile.dev`).

## Relação com o build

- `VITE_API_BASE_URL` é **injetada no bundle na fase `npm run build`** (ARG/ENV no `Dockerfile`). O browser chama essa URL; não confundir com URL interna entre contentores salvo que seja a mesma vista pelo cliente.

## O que não colocar aqui

- Código React ou TypeScript da app → `src/`.
- Orquestração de serviços completa → ficheiros `docker-compose*.yml` na **raiz** do repositório frontend.
