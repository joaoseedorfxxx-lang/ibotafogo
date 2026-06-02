#!/bin/bash

echo "🌟 Iniciando o IBOTAFOGO APP..."

# 1. Encerra processos antigos (evita erro de 'porta já em uso')
lsof -ti:3000 | xargs kill -9 2>/dev/null
lsof -ti:5173 | xargs kill -9 2>/dev/null

# 2. Inicia o Backend em segundo plano
cd /Users/asasgil/Desktop/ibotafogo-app/backend
node server.js &

# 3. Aguarda 2 segundos e abre o navegador automaticamente
sleep 2
open http://localhost:5173 &

# 4. Inicia o Frontend (mantém a janela rodando)
cd /Users/asasgil/Desktop/ibotafogo-app/frontend
npm run dev