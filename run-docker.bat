@echo off
REM Script para iniciar o projeto com Docker localmente (Windows)

echo.
echo 🚀 Iniciando Solar PRO com Docker...
echo.
echo Escolha uma opcao:
echo 1) Rodar com Supabase Local (PostgreSQL)
echo 2) Rodar apenas a aplicacao (sem banco local)
echo 3) Parar containers
echo.

set /p option="Digite a opcao (1-3): "

if "%option%"=="1" (
    echo.
    echo 📦 Iniciando com Supabase Local...
    docker-compose up --build
) else if "%option%"=="2" (
    echo.
    echo ⚡ Iniciando apenas a aplicacao...
    docker-compose up --build solar-pro
) else if "%option%"=="3" (
    echo.
    echo 🛑 Parando containers...
    docker-compose down
) else (
    echo.
    echo ❌ Opcao invalida
)
