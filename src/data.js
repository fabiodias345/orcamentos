import { supabase } from './supabase.js';

export const Data = {
  // Usuário Atual
  user: null,

  async login(email, password) {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    this.user = data.user;
    return data;
  },

  async resetPassword(email) {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: window.location.origin,
    });
    if (error) throw error;
  },

  async signup(email, password) {
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) throw error;
    this.user = data.user;
    
    // Cria um resgistro na tabela empresa se não existir
    const { error: empError } = await supabase.from('empresas').insert([{ id: data.user.id }]);
    if (empError) console.error("Erro ao criar perfil empresa:", empError);

    return data;
  },

  async logout() {
    await supabase.auth.signOut();
    this.user = null;
  },

  async checkSession() {
    const { data } = await supabase.auth.getSession();
    if (data && data.session) {
      this.user = data.session.user;
      return true;
    }
    return false;
  },

  // EMPRESA
  async getEmpresa() {
    const { data, error } = await supabase.from('empresas').select('*').eq('id', this.user.id).single();
    if (error) throw error;
    return data;
  },

  async saveEmpresa(dados) {
    const { data, error } = await supabase.from('empresas').update(dados).eq('id', this.user.id);
    if (error) throw error;
    return data;
  },

  // CLIENTES
  async getClientes() {
    const { data, error } = await supabase.from('clientes').select('*').order('nome', { ascending: true });
    if (error) throw error;
    return data;
  },

  async saveCliente(dados) {
    dados.user_id = this.user.id;
    const { data, error } = await supabase.from('clientes').insert([dados]);
    if (error) throw error;
    return data;
  },

  async updateCliente(id, dados) {
    const { data, error } = await supabase.from('clientes').update(dados).eq('id', id);
    if (error) throw error;
    return data;
  },

  async deleteCliente(id) {
    const { data, error } = await supabase.from('clientes').delete().eq('id', id);
    if (error) throw error;
    return data;
  },

  // ORÇAMENTOS
  async getOrcamentos() {
    const { data, error } = await supabase
      .from('orcamentos')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) throw error;

    // Busca telefone/email dos clientes em batch
    const clienteIds = [...new Set(data.map(o => o.cliente_id).filter(Boolean))];
    let clientesMap = {};
    if (clienteIds.length > 0) {
      const { data: clientes } = await supabase
        .from('clientes')
        .select('id, tel, email')
        .in('id', clienteIds);
      if (clientes) clientes.forEach(c => { clientesMap[c.id] = c; });
    }

    return data.map(o => ({
      ...o,
      clientes: clientesMap[o.cliente_id] || null
    }));
  },

  async deleteOrcamento(id) {
    const { error } = await supabase.from('orcamentos').delete().eq('id', id);
    if (error) throw error;
  },

  async uploadPDF(blob, filename) {
    const path = `pdfs/${this.user.id}/${filename}`;
    const { error } = await supabase.storage.from('arquivos').upload(path, blob, {
      contentType: 'application/pdf',
      upsert: true
    });
    if (error) throw error;
    const { data } = supabase.storage.from('arquivos').getPublicUrl(path);
    return data.publicUrl;
  }
};
