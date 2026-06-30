# Guia: Local + Remoto Simultâneamente

## 🚀 Passo 1: Iniciar Supabase Local

```bash
cd c:\develop\orcamentos
supabase start
```

Isso vai iniciar:
- 🗄️ PostgreSQL em `localhost:5432`
- 🔑 Supabase API em `http://localhost:54321`
- 🎨 Studio em `http://localhost:54323`

## 🐳 Passo 2: Iniciar Aplicação em Docker

```bash
docker-compose up --build
```

A aplicação estará em: **http://localhost:5173**

## 📡 Passo 3: Sincronizar com Supabase Remoto

### Pull (Local ← Remoto)
Trazer mudanças do remoto para local:
```bash
supabase db pull
```

### Push (Local → Remoto)
Enviar mudanças locais para remoto:
```bash
supabase db push
```

## 🔄 Como Funciona

A aplicação **detecta automaticamente**:
- 🏠 **Local**: `http://localhost:54321` (quando em desenvolvimento)
- ☁️ **Remoto**: `https://mkjznhswwuvtxrnoxmnv.supabase.co` (produção)

Veja o log do browser para confirmar qual está conectado!

## 💡 Fluxo Recomendado

1. **Desenvolvimento Local**
   ```bash
   supabase start
   docker-compose up --build
   ```

2. **Testar com dados locais**
   - Acesse http://localhost:5173
   - Crie/modifique dados

3. **Sincronizar Remoto**
   ```bash
   # Ver status
   supabase status
   
   # Pull mudanças remotas
   supabase db pull
   
   # Push suas mudanças locais
   supabase db push
   
   # Deploy para remoto
   supabase deploy
   ```

## 🛑 Parar Tudo

```bash
# Parar Supabase Local
supabase stop

# Parar Docker
docker-compose down

# Limpar volumes (se precisar resetar dados)
supabase stop --remove-volumes
```

## 📊 Acessar Studio (Interface Gráfica)

- **Local**: http://localhost:54323
- **Remoto**: https://app.supabase.com

## 🔑 Credenciais

### Local
- **URL**: http://localhost:54321
- **Key**: (gerado automaticamente)
- **Admin**: postgres / postgres

### Remoto
- **URL**: https://mkjznhswwuvtxrnoxmnv.supabase.co
- **Key**: sb_publishable_slpWGID7WQB6RYDH2qaJrQ_WcektktO
- **Admin**: Acesse https://app.supabase.com
