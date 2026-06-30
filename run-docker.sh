#!/bin/bash
# Script para iniciar o projeto com Docker localmente

echo "🚀 Iniciando Solar PRO com Docker..."
echo ""

# Opções
echo "Escolha uma opção:"
echo "1) Rodar com Supabase Local (PostgreSQL)"
echo "2) Rodar apenas a aplicação (sem banco local)"
echo "3) Parar containers"
echo ""
read -p "Digite a opção (1-3): " option

case $option in
  1)
    echo "📦 Iniciando com Supabase Local..."
    docker-compose up --build
    ;;
  2)
    echo "⚡ Iniciando apenas a aplicação..."
    docker-compose up --build solar-pro
    ;;
  3)
    echo "🛑 Parando containers..."
    docker-compose down
    ;;
  *)
    echo "❌ Opção inválida"
    ;;
esac
