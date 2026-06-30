# Solar PRO - Docker Setup

## 🚀 Quick Start

### Opção 1: Com Supabase Local (Recomendado para Desenvolvimento)

```bash
# Windows
run-docker.bat

# Linux/Mac
bash run-docker.sh
```

Depois escolha a opção **1**.

### Opção 2: Rodar Apenas a Aplicação

```bash
docker-compose up --build solar-pro
```

### Opção 3: Parar os Containers

```bash
docker-compose down
```

## 📍 Acessar a Aplicação

- **URL:** http://localhost:5173
- **Banco de Dados (Supabase Local):** localhost:5432

## 🛠️ Configuração

### Variáveis de Ambiente

Se precisar usar Supabase remoto, configure:

```bash
docker-compose up --build \
  -e VITE_SUPABASE_URL=https://seu-projeto.supabase.co \
  -e VITE_SUPABASE_KEY=sua-chave-publica
```

Ou crie um arquivo `.env`:

```env
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_KEY=sua-chave-publica
```

## 📦 Estrutura

- **Dockerfile** — Imagem da aplicação (Vite)
- **docker-compose.yml** — Orquestração dos serviços
- **.dockerignore** — Arquivos ignorados no build
- **run-docker.sh / run-docker.bat** — Scripts de inicialização

## ⚙️ Hot Reload

O Vite está configurado para hot-reload automático durante o desenvolvimento. Basta editar os arquivos e salvar!

## 🐛 Troubleshooting

**Porta 5173 já em uso?**
```bash
docker-compose up --build -e port=3000 solar-pro
```

**Banco de dados não conecta?**
```bash
docker-compose logs supabase-db
```

**Limpar tudo e recomeçar?**
```bash
docker-compose down -v
docker system prune -a
```
