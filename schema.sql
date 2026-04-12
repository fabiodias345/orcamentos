-- ==========================================
-- SOLAR PRO - SCRIPT DE CRIAÇÃO DO BANCO
-- ==========================================
-- Instruções:
-- 1. Abra o painel do Supabase.
-- 2. Vá em no menu lateral "SQL Editor".
-- 3. Crie uma nova query (New Query), cole todo este código e clique em RUN.

-- 1. TABELA DE EMPRESA (Perfil do Usuário)
CREATE TABLE public.empresas (
    id UUID REFERENCES auth.users(id) PRIMARY KEY,
    nome TEXT,
    cnpj TEXT,
    tel TEXT,
    email TEXT,
    endereco TEXT,
    logo TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);
-- Habilita segurança
ALTER TABLE public.empresas ENABLE ROW LEVEL SECURITY;
-- Permite que o usuário veja e altere apenas sua própria empresa
CREATE POLICY "Usuários gerenciam própria empresa" ON public.empresas FOR ALL USING (auth.uid() = id);

-- 2. TABELA DE CLIENTES
CREATE TABLE public.clientes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) NOT NULL,
    nome TEXT NOT NULL,
    email TEXT,
    tel TEXT,
    cep TEXT,
    endereco TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);
ALTER TABLE public.clientes ENABLE ROW LEVEL SECURITY;
-- Permite gerenciar apenas clientes que ele mesmo criou
CREATE POLICY "Usuários gerenciam próprios clientes" ON public.clientes FOR ALL USING (auth.uid() = user_id);

-- 3. TABELA DE ORÇAMENTOS/PROPOSTAS
CREATE TABLE public.orcamentos (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) NOT NULL,
    cliente_id UUID REFERENCES public.clientes(id) ON DELETE CASCADE,
    cliente_nome TEXT,
    valor_total NUMERIC,
    potencia_kwp NUMERIC,
    dados_proposta JSONB,
    pdf_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);
ALTER TABLE public.orcamentos ENABLE ROW LEVEL SECURITY;
-- Permite gerenciar apenas orçamentos que ele mesmo criou
CREATE POLICY "Usuários gerenciam próprios orçamentos" ON public.orcamentos FOR ALL USING (auth.uid() = user_id);

-- 4. BUCKET PARA ARMAZENAMENTO DE LOGOS E EVENTUAIS PDFs
-- Isso cria um repositório chamado 'arquivos' para salvar as imagens publicamente
insert into storage.buckets (id, name, public) values ('arquivos', 'arquivos', true);
create policy "Public Access" on storage.objects for select using ( bucket_id = 'arquivos' );
create policy "Auth Insert" on storage.objects for insert with check ( bucket_id = 'arquivos' and auth.role() = 'authenticated' );
