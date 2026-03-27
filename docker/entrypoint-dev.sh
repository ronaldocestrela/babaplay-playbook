#!/bin/sh
set -e
cd /app

# Com o volume nomeado em node_modules, na primeira execução a pasta pode estar vazia
if [ ! -d node_modules/react ]; then
  echo "[dev] A instalar dependências (npm ci)..."
  npm ci
fi

exec npm run dev -- --host 0.0.0.0 --port 8080
