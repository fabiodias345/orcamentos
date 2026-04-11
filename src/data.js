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
    const { data, error } = await supabase.auth.getSession();
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
    const { data, error } = await supabase.from('orcamentos').select('*').order('created_at', { ascending: false });
    if (error) throw error;
    return data;
  }
};
