import { Data } from './data.js';
import { Calc, HSP_CIDADES } from './sizing.js';

export const AppState = {
  activeTab: 'clientes',
  clientes: [],
  propostaItems: [],
  propostaTotal: 0
};

export const Router = {
  render: (view) => {
    const container = document.getElementById('main-content');
    if (view === 'auth') {
      const tpl = document.getElementById('tpl-auth').content.cloneNode(true);
      container.innerHTML = '';
      container.appendChild(tpl);
      document.getElementById('loader').classList.add('hidden');
      container.classList.remove('hidden');
    } else {
      const tpl = document.getElementById('tpl-dashboard').content.cloneNode(true);
      container.innerHTML = '';
      container.appendChild(tpl);
      
      document.getElementById('nav-user-name').innerText = Data.user?.email || 'Usuário';
      document.getElementById('avatar-initial').innerText = (Data.user?.email || 'U').charAt(0).toUpperCase();

      // Attach tab events
      document.querySelectorAll('.nav-tab').forEach(el => {
        el.addEventListener('click', (e) => {
          const tab = e.currentTarget.dataset.tab;
          Router.to(tab);
        });
      });

      // Attach settings event
      document.getElementById('btn-settings').addEventListener('click', () => {
        Router.to('empresa');
      });

      // Attach logout event
      document.getElementById('btn-logout').addEventListener('click', async () => {
        await Data.logout();
        window.location.reload();
      });

      document.getElementById('loader').classList.add('hidden');
      container.classList.remove('hidden');

      Router.renderTab(AppState.activeTab);

      // Carrega contadores da sidebar em background
      Router.updateSidebarCounts();
    }
  },
  to: (tab) => {
    AppState.activeTab = tab;
    Router.renderTab(tab);

    // Update active state in sidebar
    document.querySelectorAll('.nav-tab').forEach(el => {
      el.classList.remove('active', 'bg-white/10', 'text-yellow-400');
      if (el.dataset.tab === tab) {
        el.classList.add('active', 'bg-white/10', 'text-yellow-400');
      }
    });

    // Update Header Title
    const titles = {
      'home': '',
      'empresa': 'Empresa',
      'clientes': 'Gestão de Clientes',
      'sizing': 'Dimensionamento',
      'orcamentos': 'Orçamentos'
    };
    document.getElementById('active-tab-title').innerText = titles[tab] ?? tab;
  },
  updateSidebarCounts: async () => {
    try {
      const clientes = await Data.getClientes();
      const el = document.getElementById('sidebar-count-clientes');
      if (el) el.textContent = `${clientes?.length || 0} cadastrado${(clientes?.length || 0) !== 1 ? 's' : ''}`;
    } catch(e) {}
    try {
      const orcamentos = await Data.getOrcamentos();
      const el = document.getElementById('sidebar-count-orcamentos');
      if (el) el.textContent = `${orcamentos?.length || 0} proposta${(orcamentos?.length || 0) !== 1 ? 's' : ''}`;
    } catch(e) {}
  },
  renderTab: (tab) => {
    const container = document.getElementById('tab-content');
    container.innerHTML = `
      <div class="flex flex-col items-center justify-center p-20 text-slate-500 animate-pulse">
        <div class="w-12 h-12 border-2 border-yellow-400/20 border-t-yellow-400 rounded-full animate-spin mb-4"></div>
        <p class="text-xs font-bold uppercase tracking-widest">Carregando Seção...</p>
      </div>
    `;
    switch (tab) {
      case 'empresa': UI.renderEmpresa(); break;
      case 'clientes': UI.renderClientes(); break;
      case 'sizing': UI.renderSizing(); break;
      case 'orcamentos': UI.renderOrcamentos(); break;
    }
  }
};

export const UI = {
  // ---------- HOME / BOAS-VINDAS ----------
  async renderHome() {
    document.getElementById('header-actions').innerHTML = '';
    document.getElementById('active-tab-title').innerText = '';

    const emailRaw = Data.user?.email || '';
    const userName = emailRaw.split('@')[0] || 'Usuário';
    const hora = new Date().getHours();
    const saudacao = hora < 12 ? 'Bom dia' : hora < 18 ? 'Boa tarde' : 'Boa noite';

    let totalClientes = 0;
    let totalOrcamentos = 0;
    try {
      const c = await Data.getClientes();
      totalClientes = c?.length || 0;
    } catch(e) {}
    try {
      const o = await Data.getOrcamentos();
      totalOrcamentos = o?.length || 0;
    } catch(e) {}

    const container = document.getElementById('tab-content');
    container.innerHTML = `
      <div class="flex flex-col justify-end animate-fade-in" style="min-height: calc(100vh - 5rem); padding-bottom: 4rem;">
        <div class="max-w-2xl">
          <p class="text-yellow-400 text-xs font-semibold tracking-[0.3em] uppercase mb-5">Sistema de Orçamentos Solares</p>
          <h1 class="font-bold leading-none text-white mb-4" style="font-size: clamp(2.8rem, 5vw, 4.5rem);">
            ${saudacao},<br><span class="text-yellow-400">${userName}</span>
          </h1>
          <p class="text-slate-400 text-lg mb-10">O que vamos fazer hoje?</p>

          <div class="grid grid-cols-3 gap-4 max-w-lg">
            <button data-go="clientes" class="group text-left p-5 rounded-2xl border border-white/8 bg-[#020617]/70 backdrop-blur-sm hover:border-yellow-400/50 hover:bg-[#020617]/90 transition-all duration-300">
              <div class="w-9 h-9 bg-yellow-400/10 rounded-lg flex items-center justify-center mb-3 group-hover:bg-yellow-400/20 transition-colors">
                <svg class="w-4 h-4 text-yellow-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
              </div>
              <p class="text-white text-sm font-semibold mb-0.5">Clientes</p>
              <p class="text-slate-500 text-xs">${totalClientes} cadastrado${totalClientes !== 1 ? 's' : ''}</p>
            </button>

            <button data-go="sizing" class="group text-left p-5 rounded-2xl border border-white/8 bg-[#020617]/70 backdrop-blur-sm hover:border-yellow-400/50 hover:bg-[#020617]/90 transition-all duration-300">
              <div class="w-9 h-9 bg-yellow-400/10 rounded-lg flex items-center justify-center mb-3 group-hover:bg-yellow-400/20 transition-colors">
                <svg class="w-4 h-4 text-yellow-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3v19"/><path d="M5 8h14"/><path d="M15 1l-3 3 3 3"/><path d="m9 23 3-3-3-3"/></svg>
              </div>
              <p class="text-white text-sm font-semibold mb-0.5">Dimensionamento</p>
              <p class="text-slate-500 text-xs">Calcular sistema</p>
            </button>

            <button data-go="orcamentos" class="group text-left p-5 rounded-2xl border border-white/8 bg-[#020617]/70 backdrop-blur-sm hover:border-yellow-400/50 hover:bg-[#020617]/90 transition-all duration-300">
              <div class="w-9 h-9 bg-yellow-400/10 rounded-lg flex items-center justify-center mb-3 group-hover:bg-yellow-400/20 transition-colors">
                <svg class="w-4 h-4 text-yellow-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/><path d="M12 7v5l4 2"/></svg>
              </div>
              <p class="text-white text-sm font-semibold mb-0.5">Orçamentos</p>
              <p class="text-slate-500 text-xs">${totalOrcamentos} proposta${totalOrcamentos !== 1 ? 's' : ''}</p>
            </button>
          </div>
        </div>
      </div>
    `;

    container.querySelectorAll('[data-go]').forEach(btn => {
      btn.addEventListener('click', () => Router.to(btn.dataset.go));
    });
  },

  // ---------- ABA EMPRESA ----------
  async renderEmpresa() {
    const container = document.getElementById('tab-content');
    try {
      const d = await Data.getEmpresa() || {};
      container.innerHTML = `
        <div class="glass p-10 rounded-3xl max-w-4xl mx-auto shadow-2xl relative overflow-hidden border border-white/5">
          <div class="absolute top-0 right-0 w-64 h-64 bg-yellow-400/5 blur-[100px] pointer-events-none"></div>
          
          <div class="flex items-center gap-4 mb-10">
            <div class="w-12 h-12 bg-yellow-400/10 rounded-2xl flex items-center justify-center text-yellow-400">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="16" height="20" x="4" y="2" rx="2" ry="2"/><path d="M9 22v-4h6v4"/><path d="M8 6h.01"/><path d="M16 6h.01"/><path d="M12 6h.01"/><path d="M12 10h.01"/><path d="M12 14h.01"/><path d="M16 10h.01"/><path d="M16 14h.01"/><path d="M8 10h.01"/><path d="M8 14h.01"/></svg>
            </div>
            <div>
              <h2 class="text-2xl font-bold tracking-tight">Identidade Corporativa</h2>
              <p class="text-slate-500 text-sm">Configure como sua empresa aparece nos orçamentos e propostas.</p>
            </div>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div class="space-y-6">
              <div class="space-y-2">
                <label class="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Nome Comercial</label>
                <input type="text" id="emp-nome" placeholder="Ex: SolarTech Solutions" class="input-glass w-full" value="${d.nome || ''}">
              </div>
              <div class="grid grid-cols-1 gap-6">
                <div class="space-y-2">
                  <label class="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">CNPJ</label>
                  <input type="text" id="emp-cnpj" placeholder="00.000.000/0000-00" class="input-glass w-full" value="${d.cnpj || ''}">
                </div>
                <div class="space-y-2">
                  <label class="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Telefone de Contato</label>
                  <input type="text" id="emp-tel" placeholder="(00) 00000-0000" class="input-glass w-full" value="${d.tel || ''}">
                </div>
              </div>
            </div>

            <div class="space-y-6">
              <div class="space-y-2">
                <label class="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">E-mail Corporativo</label>
                <input type="text" id="emp-email" placeholder="contato@empresa.com" class="input-glass w-full" value="${d.email || ''}">
              </div>
              <div class="space-y-2">
                <label class="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Logomarca (URL)</label>
                <div class="flex gap-4 items-start">
                  <input type="text" id="emp-logo" placeholder="https://..." class="input-glass flex-1" value="${d.logo || ''}">
                  ${d.logo ? `<div class="w-12 h-12 rounded-lg bg-white/5 border border-white/10 p-1 flex items-center justify-center overflow-hidden"><img src="${d.logo}" class="max-w-full max-h-full object-contain"></div>` : ''}
                </div>
              </div>
            </div>

            <div class="md:col-span-2 space-y-2">
              <label class="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Endereço da Sede</label>
              <input type="text" id="emp-end" placeholder="Rua, Número, Bairro, Cidade - UF" class="input-glass w-full" value="${d.endereco || ''}">
            </div>
          </div>

          <div class="mt-12 flex justify-end gap-4 border-t border-white/5 pt-10">
            <button id="btn-save-emp" class="btn-primary flex items-center gap-2 group">
              <span>Salvar Alterações</span>
              <svg class="w-4 h-4 group-hover:translate-x-1 transition-transform" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
            </button>
          </div>
        </div>
      `;
      document.getElementById('btn-save-emp').addEventListener('click', () => UI.saveEmpresa());
    } catch (e) {
      container.innerHTML = `<div class="p-12 text-center text-red-500">Erro ao carregar dados da empresa.</div>`;
    }
  },

  async saveEmpresa() {
    const dados = {
      nome: document.getElementById('emp-nome').value,
      cnpj: document.getElementById('emp-cnpj').value,
      tel: document.getElementById('emp-tel').value,
      email: document.getElementById('emp-email').value,
      endereco: document.getElementById('emp-end').value,
      logo: document.getElementById('emp-logo').value
    };
    try {
      await Data.saveEmpresa(dados);
      alert('Configurações Salvas!');
    } catch (e) {
      alert('Erro ao salvar: ' + e.message);
    }
  },

  // ---------- ABA CLIENTES ----------
  async renderClientes() {
    document.getElementById('header-actions').innerHTML = `
      <button id="btn-open-add-cli" class="btn-primary text-sm h-10 px-6">
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
        Novo Cliente
      </button>
    `;

    document.getElementById('tab-content').innerHTML = `
      <div id="cli-form-container" class="hidden mb-12">
        <div class="glass p-8 rounded-3xl border border-yellow-500/20 shadow-2xl relative overflow-hidden">
            <div class="absolute top-0 right-0 w-32 h-32 bg-yellow-400/5 blur-3xl"></div>
            <div class="flex justify-between items-center mb-8">
              <h2 class="text-xl font-bold tracking-tight">Ficha do Cliente</h2>
              <button onclick="document.getElementById('cli-form-container').classList.add('hidden')" class="text-slate-500 hover:text-white p-2">✕</button>
            </div>
            <input type="hidden" id="cli-id" value="">
            <div class="space-y-8">
              <div>
                  <h3 class="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] mb-4">Informações de Contato</h3>
                  <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div class="space-y-2"><label class="text-xs text-slate-500 font-semibold ml-1">Nome Completo</label><input type="text" id="cli-nome" placeholder="Ex: João da Silva" class="input-glass w-full"></div>
                    <div class="space-y-2"><label class="text-xs text-slate-500 font-semibold ml-1">E-mail</label><input type="email" id="cli-email" placeholder="email@cliente.com" class="input-glass w-full"></div>
                  </div>
                  <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                    <div class="space-y-2"><label class="text-xs text-slate-500 font-semibold ml-1">WhatsApp / Telefone</label><input type="text" id="cli-tel" placeholder="(43) 99999-9999" class="input-glass w-full"></div>
                  </div>
              </div>
              <div>
                  <h3 class="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] mb-4">Localização Técnica</h3>
                  <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                    <div class="space-y-2"><label class="text-xs text-yellow-500/80 font-bold ml-1 tracking-wider uppercase">CEP de Instalação</label><input type="text" id="cli-cep" placeholder="00000-000" class="input-glass w-full font-bold text-yellow-500 placeholder:text-yellow-900/50"></div>
                  </div>
                  <div class="grid grid-cols-1 md:grid-cols-12 gap-6">
                    <div class="md:col-span-9 space-y-2"><label class="text-xs text-slate-500 font-semibold ml-1">Logradouro</label><input type="text" id="cli-rua" placeholder="Rua/Avenida" class="input-glass w-full"></div>
                    <div class="md:col-span-3 space-y-2"><label class="text-xs text-slate-500 font-semibold ml-1">Número</label><input type="text" id="cli-num" placeholder="123" class="input-glass w-full"></div>
                  </div>
                  <div class="grid grid-cols-1 md:grid-cols-12 gap-6 mt-6">
                    <div class="md:col-span-4 space-y-2"><label class="text-xs text-slate-500 font-semibold ml-1">Bairro</label><input type="text" id="cli-bairro" placeholder="Bairro" class="input-glass w-full"></div>
                    <div class="md:col-span-6 space-y-2"><label class="text-xs text-slate-500 font-semibold ml-1">Cidade</label><input type="text" id="cli-cidade" placeholder="Cidade" class="input-glass w-full"></div>
                    <div class="md:col-span-2 space-y-2"><label class="text-xs text-slate-500 font-semibold ml-1">UF</label><input type="text" id="cli-uf" placeholder="PR" class="input-glass w-full"></div>
                  </div>
              </div>
              <div class="flex gap-4 pt-4">
                <button id="btn-save-cli" class="btn-primary flex-1">Confirmar e Salvar</button>
                <button id="btn-clean-cli" class="px-8 rounded-xl bg-white/5 hover:bg-white/10 text-white font-medium transition-all">Cancelar</button>
              </div>
            </div>
        </div>
      </div>

      <div class="glass rounded-3xl overflow-hidden border border-white/5 animate-slide-up">
        <header class="px-8 py-6 border-b border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900/40">
          <div>
            <h2 class="text-lg font-bold tracking-tight">Meus Clientes</h2>
            <p class="text-xs text-slate-500 font-medium mt-0.5">Gerencie os interessados e leads do sistema.</p>
          </div>
          <div class="relative w-full md:w-64">
            <input type="text" id="cli-search" placeholder="Pesquisar cliente..." class="w-full bg-white/5 border border-white/10 rounded-full px-4 py-2 text-xs focus:ring-1 focus:ring-yellow-400 outline-none transition-all">
          </div>
        </header>
        
        <div class="overflow-x-auto">
          <table class="w-full text-left border-collapse">
            <thead>
              <tr class="text-[10px] uppercase tracking-[0.1em] font-bold text-slate-500 bg-slate-900/60">
                <th class="px-8 py-4 font-bold border-b border-white/5 w-1/3">Identificação</th>
                <th class="px-8 py-4 font-bold border-b border-white/5">Canal de Contato</th>
                <th class="px-8 py-4 font-bold border-b border-white/5">Localidade</th>
                <th class="px-8 py-4 font-bold border-b border-white/5 text-right whitespace-nowrap">Ações de Gestão</th>
              </tr>
            </thead>
            <tbody id="lista-clientes" class="divide-y divide-white/[0.03]">
              <!-- Gerado via JS -->
            </tbody>
          </table>
        </div>
      </div>
    `;

    document.getElementById('btn-open-add-cli').addEventListener('click', () => {
      UI.limparFormCliente();
      document.getElementById('cli-form-container').classList.remove('hidden');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
    
    document.getElementById('btn-save-cli').addEventListener('click', () => UI.saveCliente());
    document.getElementById('btn-clean-cli').addEventListener('click', () => {
      document.getElementById('cli-form-container').classList.add('hidden');
    });
    
    const cepInput = document.getElementById('cli-cep');
    cepInput.addEventListener('keyup', () => { if(cepInput.value.replace(/\D/g,'').length>=8) UI.fetchCEP() });
    cepInput.addEventListener('blur', () => UI.fetchCEP());

    await UI.loadClientesList();
  },

  async loadClientesList() {
    try {
      const list = await Data.getClientes() || [];
      AppState.clientes = list;
      let h = '';
      if (list.length === 0) {
        h = '<tr><td colspan="4" class="p-16 text-center text-slate-600 font-medium">Nenhum cliente cadastrado ainda.</td></tr>';
      } else {
        h = list.map(c => {
          const initials = c.nome.split(' ').map(n=>n[0]).join('').substring(0,2).toUpperCase();
          const acoes = `
            <div class="flex justify-end gap-2">
              <button data-action="edit" data-id="${c.id}" class="p-2 bg-white/5 hover:bg-white/10 rounded-lg text-blue-400 transition-all border border-white/5">✏️</button>
              <button data-action="del" data-id="${c.id}" class="p-2 bg-white/5 hover:bg-white/10 rounded-lg text-red-400 transition-all border border-white/5">🗑️</button>
            </div>
          `;
          return `
            <tr class="data-table-row group">
              <td class="px-8 py-5">
                <div class="flex items-center gap-4">
                  <div class="w-10 h-10 rounded-full bg-slate-800 border border-white/5 flex items-center justify-center text-xs font-bold text-slate-300">${initials}</div>
                  <div>
                    <p class="font-bold text-white text-sm group-hover:text-yellow-400 transition-colors">${c.nome}</p>
                    <p class="text-[10px] text-slate-500 font-bold uppercase tracking-wider">ID: ${c.id.substring(0,8)}</p>
                  </div>
                </div>
              </td>
              <td class="px-8 py-5">
                <p class="text-sm font-medium text-slate-300">${c.tel || '–'}</p>
                <p class="text-xs text-blue-500/80 font-medium truncate max-w-[180px]">${c.email || '–'}</p>
              </td>
              <td class="px-8 py-5">
                <div class="flex items-center gap-2">
                  <span class="badge badge-yellow">📍</span>
                  <p class="text-xs text-slate-400 font-medium truncate max-w-[200px]" title="${c.endereco || ''}">${c.endereco || 'Endereço não informado'}</p>
                </div>
              </td>
              <td class="px-8 py-5">${acoes}</td>
            </tr>
          `;
        }).join('');
      }
      document.getElementById('lista-clientes').innerHTML = h;

      document.querySelectorAll('#lista-clientes button').forEach(b => {
        b.addEventListener('click', (e) => {
          const target = e.currentTarget;
          const id = target.dataset.id;
          if (target.dataset.action === 'edit') UI.editCliente(id);
          if (target.dataset.action === 'del') UI.deleteCliente(id);
        });
      });
    } catch (e) {
      console.error(e);
    }
  },

  limparFormCliente() {
    ['cli-id','cli-nome','cli-email','cli-tel','cli-cep','cli-rua','cli-num','cli-bairro','cli-cidade','cli-uf'].forEach(id => document.getElementById(id).value = '');
    document.getElementById('btn-save-cli').innerText = "SALVAR NOVO CLIENTE";
  },

  editCliente(id) {
    const cli = AppState.clientes.find(c => c.id === id);
    if (!cli) return;
    document.getElementById('cli-id').value = cli.id;
    document.getElementById('cli-nome').value = cli.nome || '';
    document.getElementById('cli-email').value = cli.email || '';
    document.getElementById('cli-tel').value = cli.tel || '';
    document.getElementById('cli-cep').value = cli.cep || '';
    
    try {
      const end = cli.endereco || '';
      const p = end.split(' - ');
      const rn = (p[0]||'').split(', ');
      const bc = (p[1]||'').split(', ');
      document.getElementById('cli-rua').value = rn[0] || '';
      document.getElementById('cli-num').value = rn[1] || '';
      document.getElementById('cli-bairro').value = bc[0] || '';
      document.getElementById('cli-cidade').value = bc[1] || '';
      document.getElementById('cli-uf').value = p[2] || '';
    } catch (e) {
      document.getElementById('cli-rua').value = cli.endereco || '';
    }
    document.getElementById('btn-save-cli').innerText = "ATUALIZAR CLIENTE";
    window.scrollTo(0, 0);
  },

  async deleteCliente(id) {
    if (!confirm("Tem certeza que deseja excluir esse cliente?")) return;
    await Data.deleteCliente(id);
    await UI.loadClientesList();
  },

  async fetchCEP() {
    let cep = document.getElementById('cli-cep').value.replace(/\D/g, '');
    if (cep.length === 8) {
      try {
        let res = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
        let data = await res.json();
        if (!data.erro) {
          document.getElementById('cli-rua').value = data.logradouro || '';
          document.getElementById('cli-bairro').value = data.bairro || '';
          document.getElementById('cli-cidade').value = data.localidade || '';
          document.getElementById('cli-uf').value = data.uf || '';
          document.getElementById('cli-num').focus();
        }
      } catch (e) { console.error("Erro ViaCEP"); }
    }
  },

  async saveCliente() {
    const id = document.getElementById('cli-id').value;
    const endMontado = `${document.getElementById('cli-rua').value}, ${document.getElementById('cli-num').value} - ${document.getElementById('cli-bairro').value}, ${document.getElementById('cli-cidade').value} - ${document.getElementById('cli-uf').value}`;
    const dados = {
      nome: document.getElementById('cli-nome').value,
      tel: document.getElementById('cli-tel').value,
      email: document.getElementById('cli-email').value,
      cep: document.getElementById('cli-cep').value,
      endereco: endMontado
    };
    if (!dados.nome) return alert("Por favor adicione um nome.");
    
    const btn = document.getElementById('btn-save-cli');
    btn.innerText = "Salvando...";
    btn.disabled = true;

    try {
      if (id) {
        await Data.updateCliente(id, dados);
      } else {
        await Data.saveCliente(dados);
      }
      UI.limparFormCliente();
      await UI.loadClientesList();
    } catch (e) {
      alert("Erro ao salvar: " + e.message);
    } finally {
      btn.innerText = "SALVAR CLIENTE";
      btn.disabled = false;
    }
  },

  // ---------- ABA DIMENSIONAMENTO ----------
  async renderSizing() {
    if (AppState.clientes.length === 0) {
      AppState.clientes = await Data.getClientes() || [];
    }

    const optEstados = Object.keys(HSP_CIDADES).map(e => `<option value="${e}">${e}</option>`).join('');
    let optClientes = '<option value="">Vincular a um cliente existente...</option>';
    if (AppState.clientes.length > 0) {
      optClientes += AppState.clientes.map(c => `<option value="${c.id}">${c.nome}</option>`).join('');
    }

    document.getElementById('header-actions').innerHTML = `
      <div class="flex gap-3">
        <button id="btn-salvar-orc-topo" class="px-6 h-10 rounded-xl bg-yellow-400 hover:bg-white text-slate-950 font-bold text-xs transition-all shadow-lg shadow-yellow-400/10 uppercase tracking-wider">
          Gerar Proposta PDF
        </button>
      </div>
    `;

    document.getElementById('tab-content').innerHTML = `
      <div class="grid grid-cols-1 xl:grid-cols-12 gap-10">
        
        <!-- Formulário de Engenharia -->
        <div class="xl:col-span-8 space-y-10">
          
          <!-- Seção 1: Cliente e Localização -->
          <section class="glass p-8 rounded-3xl border border-white/5 relative overflow-hidden group">
            <div class="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
              <svg xmlns="http://www.w3.org/2000/svg" width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
            </div>
            
            <header class="mb-8">
              <span class="text-[10px] font-bold text-yellow-500 uppercase tracking-[0.2em] mb-2 block">Passo 01</span>
              <h3 class="text-xl font-bold tracking-tight">Definição do Cliente</h3>
            </header>

            <div class="space-y-6">
              <div class="space-y-2">
                <label class="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Selecionar Cliente</label>
                <select id="prop-cliente-select" class="input-glass w-full text-sm font-semibold h-12">
                  ${optClientes}
                </select>
              </div>

              <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div class="space-y-2">
                  <label class="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Estado de Instalação</label>
                  <select id="calc-estado" class="input-glass w-full h-12">
                    <option value="">Selecione o Estado...</option>
                    ${optEstados}
                  </select>
                </div>
                <div class="space-y-2">
                  <label class="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Cidade / Índice Irradiação (HSP)</label>
                  <select id="calc-cidade" class="input-glass w-full h-12" disabled>
                    <option value="">Aguardando estado...</option>
                  </select>
                </div>
              </div>
            </div>
          </section>

          <!-- Seção 2: Consumo e Necessidade -->
          <section class="glass p-8 rounded-3xl border border-white/5 relative overflow-hidden group">
             <div class="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
              <svg xmlns="http://www.w3.org/2000/svg" width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2v10"/><path d="M18.4 4.6a10 10 0 1 1-12.8 0"/></svg>
            </div>

            <header class="mb-8">
              <span class="text-[10px] font-bold text-yellow-500 uppercase tracking-[0.2em] mb-2 block">Passo 02</span>
              <h3 class="text-xl font-bold tracking-tight">Análise de Consumo</h3>
            </header>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div class="bg-slate-900/50 border-2 border-white/5 rounded-2xl p-6 flex flex-col justify-between transition-all" id="box-kwh">
                <span class="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-4 block">Consumo Médio Mensal</span>
                <div class="relative">
                  <input type="number" id="calc-kwh" class="sizing-field w-full bg-transparent border-none outline-none text-5xl font-bold text-yellow-400 placeholder:text-slate-800 pr-20" placeholder="000">
                  <span class="absolute right-0 top-1/2 -translate-y-1/2 text-slate-600 font-bold text-lg uppercase tracking-widest">kWh</span>
                </div>
              </div>

              <div class="glass bg-yellow-400/[0.03] border-yellow-400/20 p-6 rounded-2xl flex flex-col justify-between">
                <span class="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-4 block">Potência de Pico Necessária</span>
                <div>
                  <div class="flex items-baseline gap-2">
                    <span id="res-kwp-local" class="text-5xl font-bold text-white tracking-tighter">0.00</span>
                    <span class="text-xl font-bold text-yellow-400">kWp</span>
                  </div>
                  <p class="text-[10px] text-slate-500 mt-2 font-medium">Dimensionamento Técnico Sugerido</p>
                </div>
              </div>
            </div>
            
            <div class="p-4 bg-blue-500/5 border border-blue-500/10 rounded-2xl flex items-start gap-3">
              <span class="text-lg bg-blue-500/10 w-8 h-8 rounded-lg flex items-center justify-center">💡</span>
              <p class="text-xs text-slate-400 leading-relaxed pt-1">
                  <b>Nota Técnica:</b> O cálculo utiliza uma eficiência global de 83% (padrão para módulos N-Type) e o índice solarimétrico médio da cidade selecionada para determinar a potência de pico (kWp) necessária.
                </p>
              </div>
            </div>
          </section>

          <!-- Seção 3: Itens da Proposta -->
          <section class="glass p-8 rounded-3xl border border-yellow-500/10 relative overflow-hidden bg-slate-900/10">
            <header class="mb-8 flex justify-between items-center">
              <div>
                <span class="text-[10px] font-bold text-yellow-500 uppercase tracking-[0.2em] mb-2 block">Passo 03</span>
                <h3 class="text-xl font-bold tracking-tight text-white">Composição de Equipamentos</h3>
              </div>
              <div id="ocr-status" class="hidden text-[10px] font-bold text-blue-400 bg-blue-500/10 px-3 py-1 rounded-full animate-pulse border border-blue-500/20"></div>
            </header>

            <div class="space-y-6">
              <label id="label-img-import" class="group flex flex-col items-center justify-center w-full p-8 border-2 border-dashed border-white/10 rounded-3xl cursor-pointer hover:border-yellow-400/30 hover:bg-yellow-400/5 transition-all">
                <div class="w-12 h-12 bg-white/5 rounded-xl flex items-center justify-center text-2xl group-hover:scale-110 group-hover:bg-yellow-400/10 transition-all mb-3 text-slate-400">⚡</div>
                <div class="text-center">
                  <p class="text-sm font-bold text-white mb-1">Importar Orçamento da Distribuidora</p>
                  <p class="text-xs text-slate-500">Cole uma imagem (Ctrl+V) ou arraste o PDF oficial para extração inteligente.</p>
                </div>
                <input type="file" id="input-img-import" accept="image/*,application/pdf" class="hidden">
              </label>

              <div class="border border-white/5 rounded-2xl bg-black/20 overflow-hidden">
                <table class="w-full text-left text-xs">
                  <thead>
                    <tr class="bg-white/5 text-slate-500 uppercase font-bold tracking-wider">
                      <th class="px-6 py-4 w-16">Qtd</th>
                      <th class="px-6 py-4">Descrição do Equipamento</th>
                      <th class="px-6 py-4 w-10"></th>
                    </tr>
                  </thead>
                  <tbody id="lista-materiais" class="divide-y divide-white/5"></tbody>
                </table>
              </div>

              <div class="flex gap-3">
                <input type="number" id="mat-add-qtd" placeholder="Qty" class="input-glass w-20 text-center font-bold">
                <input type="text" id="mat-add-desc" placeholder="Adicionar item ou acessório manual..." class="input-glass flex-1 font-medium italic">
                <button id="btn-add-mat" class="w-12 h-12 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold transition-all border border-white/10 flex items-center justify-center">＋</button>
              </div>
            </div>
          </section>

          <!-- Seção 4: Financeiro -->
          <section class="glass p-8 rounded-3xl border border-white/5 relative overflow-hidden group">
            <header class="mb-8">
              <span class="text-[10px] font-bold text-yellow-500 uppercase tracking-[0.2em] mb-2 block">Passo 04</span>
              <h3 class="text-xl font-bold tracking-tight">Custos e Preço de Venda</h3>
            </header>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
              <div class="space-y-2">
                <label class="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Custo do Kit (Distribuidora)</label>
                <div class="flex items-center bg-slate-950/50 border border-white/10 rounded-xl overflow-hidden focus-within:border-yellow-400/40 transition-all group/input">
                  <div class="px-4 py-3 bg-white/5 border-r border-white/5 text-slate-500 font-bold text-xs group-focus-within/input:text-yellow-400/70 transition-colors">R$</div>
                  <input type="number" id="prop-custo-kit" class="bg-transparent border-none w-full p-3 font-bold text-white outline-none prop-calc" placeholder="0,00">
                </div>
              </div>
              <div class="space-y-2">
                <label class="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Serviços e Instalação</label>
                <div class="flex items-center bg-slate-950/50 border border-white/10 rounded-xl overflow-hidden focus-within:border-yellow-400/40 transition-all group/input">
                  <div class="px-4 py-3 bg-white/5 border-r border-white/5 text-slate-500 font-bold text-xs group-focus-within/input:text-yellow-400/70 transition-colors">R$</div>
                  <input type="number" id="prop-custo-mo" class="bg-transparent border-none w-full p-3 font-bold text-white outline-none prop-calc" placeholder="0,00">
                </div>
              </div>
              <div class="space-y-2">
                <label class="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Engenharia e Taxas</label>
                <div class="flex items-center bg-slate-950/50 border border-white/10 rounded-xl overflow-hidden focus-within:border-yellow-400/40 transition-all group/input">
                  <div class="px-4 py-3 bg-white/5 border-r border-white/5 text-slate-500 font-bold text-xs group-focus-within/input:text-yellow-400/70 transition-colors">R$</div>
                  <input type="number" id="prop-custo-eng" class="bg-transparent border-none w-full p-3 font-bold text-white outline-none prop-calc" placeholder="0,00">
                </div>
              </div>
              <div class="space-y-2">
                <label class="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Logística / Extras</label>
                <div class="flex items-center bg-slate-950/50 border border-white/10 rounded-xl overflow-hidden focus-within:border-yellow-400/40 transition-all group/input">
                  <div class="px-4 py-3 bg-white/5 border-r border-white/5 text-slate-500 font-bold text-xs group-focus-within/input:text-yellow-400/70 transition-colors">R$</div>
                  <input type="number" id="prop-custo-extra" class="bg-transparent border-none w-full p-3 font-bold text-white outline-none prop-calc" placeholder="0,00">
                </div>
              </div>
            </div>
            
            <div class="mt-10 p-4 border border-blue-500/10 bg-blue-500/5 rounded-2xl flex items-center justify-between">
              <span class="text-xs font-bold text-blue-400 uppercase tracking-widest">Valor da Conta do Cliente</span>
              <div class="flex items-center bg-slate-950/50 border border-white/10 rounded-lg overflow-hidden focus-within:border-blue-400/50 transition-all w-40">
                <div class="px-3 py-2 bg-white/5 border-r border-white/5 text-blue-600 font-bold text-[10px]">R$</div>
                <input type="number" id="prop-conta-energia" class="bg-transparent border-none w-full p-2 text-sm font-bold text-blue-400 outline-none" placeholder="0,00">
              </div>
            </div>
          </section>

          <div class="h-20"></div> <!-- Espaço buffer -->
        </div>

        <!-- Barra Lateral de Resultados -->
        <div class="xl:col-span-4 space-y-8">
          <div class="sticky top-28 space-y-8">
            
            <!-- Resultado de Engenharia -->
            <div class="glass p-8 rounded-[2.5rem] border border-yellow-400/20 shadow-2xl shadow-yellow-400/5 relative overflow-hidden">
              <div class="absolute -top-10 -right-10 w-40 h-40 bg-yellow-400/10 blur-3xl pointer-events-none"></div>
              
              <p class="text-[10px] font-bold text-slate-500 uppercase tracking-[0.3em] mb-4">Dimensionamento</p>
              <div class="flex items-baseline gap-2 mb-2">
                <span id="res-kwp" class="text-6xl font-bold text-white tracking-tighter">0.00</span>
                <span class="text-2xl font-bold text-yellow-400">kWp</span>
              </div>
              <p class="text-xs text-slate-500 font-medium mb-10">Necessário para suprir 100% do consumo.</p>

              <p class="text-[10px] font-bold text-slate-500 uppercase tracking-[0.3em] mb-4">Investimento Total</p>
              <div class="flex items-baseline gap-2 mb-10">
                <span class="text-xl font-bold text-slate-400">R$</span>
                <span id="prop-valor-total" class="text-4xl font-bold text-white tracking-tight">0,00</span>
              </div>

              <button id="btn-salvar-orc" class="btn-primary w-full h-14 text-sm font-bold uppercase tracking-widest gap-3 shadow-xl shadow-yellow-400/10">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><path d="M12 18v-6"/><path d="m9 15 3 3 3-3"/></svg>
                Finalizar Orçamento
              </button>
            </div>

            <!-- Inteligência de Mercado -->
            <div class="glass p-8 rounded-3xl border border-blue-500/10 bg-blue-500/[0.02]">
              <div class="flex items-center gap-3 mb-6">
                <div class="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center text-lg">🤖</div>
                <div>
                  <h4 class="text-sm font-bold text-white">Market Intelligence</h4>
                  <p class="text-[10px] text-blue-500 uppercase tracking-widest font-bold">Bot Solar v1.4</p>
                </div>
              </div>
              
              <p class="text-xs text-slate-500 leading-relaxed mb-6">
                O agente irá buscar preços reais na região de <b><span id="lbl-market-cidade">...</span></b> para produtos similares e comparar sua margem.
              </p>

              <button id="btn-analisar-mercado" class="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all flex items-center justify-center gap-2 group">
                <svg class="w-4 h-4 group-hover:rotate-12 transition-transform" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
                Fazer Varredura Local
              </button>

              <div id="agente-status" class="hidden mt-4 text-[10px] text-center text-blue-400 font-bold uppercase tracking-wider py-2 bg-blue-500/5 rounded-lg border border-blue-500/10 animate-pulse">
                Iniciando Varredura...
              </div>

              <div id="agente-resultado" class="hidden mt-6 space-y-4">
                <!-- Resultado -->
              </div>
            </div>

          </div>
        </div>

      </div>
    `;

    // Re-attach all events
    document.getElementById('prop-cliente-select').addEventListener('change', (e) => {
      UI.populateSizingClient();
      const sel = e.target;
      if (sel.value) {
        const cli = AppState.clientes.find(c => c.id === sel.value);
        if (cli) {
          document.getElementById('lbl-market-cidade').innerText = cli.endereco?.split(' - ')[1]?.split(', ')[1] || 'sua região';
        }
      }
    });

    const kwhInput = document.getElementById('calc-kwh');
    const boxKwh   = document.getElementById('box-kwh');
    kwhInput.addEventListener('input', () => {
      Calc.update();
      const filled = kwhInput.value.trim() !== '';
      boxKwh.classList.toggle('border-yellow-400/60', filled);
      boxKwh.classList.toggle('border-white/5',       !filled);
    });

    document.getElementById('calc-estado').addEventListener('change', () => Calc.carregarCidades());
    document.getElementById('calc-cidade').addEventListener('change', () => Calc.update());
    document.getElementById('btn-analisar-mercado').addEventListener('click', () => UI.rodarAgenteMarket());
    document.getElementById('btn-add-mat').addEventListener('click', () => UI.addMaterialManual());
    document.querySelectorAll('.prop-calc').forEach(el => el.addEventListener('input', () => UI.calcProposalTotal()));
    
    document.getElementById('btn-salvar-orc').addEventListener('click', () => import('./pdf.js').then(m => m.salvarOrcamento()));
    document.getElementById('btn-salvar-orc-topo').addEventListener('click', () => import('./pdf.js').then(m => m.salvarOrcamento()));

    document.getElementById('input-img-import').addEventListener('change', (e) => {
      const file = e.target.files?.[0];
      if (!file) return;
      file.type === 'application/pdf' ? UI.parsePdfFile(file) : UI.parseImportImage(file);
    });

    UI.renderMateriaisList();
  },

  parseImportText(textoExterno) {
    const text = textoExterno ?? '';
    if (!text.trim()) return 0;

    let adicionados = 0;
    const lines = text.split('\n');

    lines.forEach(line => {
      line = line.trim();
      if (!line) return;

      // Remove lixo comum de PDF/OCR: linhas só com preços, totais, cabeçalhos
      if (/^(cod|código|cód|item|qtd|quantidade|descrição|valor|total|subtotal|r\$|unitário|unit)/i.test(line)) return;
      if (/^\s*[-=]{3,}\s*$/.test(line)) return;

      // Formatos suportados:
      // "1 GERADOR EDELTEC 33kWp..."                → qty=1
      // "001 1 INVERSOR SAJ 30kW..."                → code=001 qty=1
      // "INVERSOR SAJ 30kW ... 1 UN R$1.000"        → desc primeiro, qty no final
      // "1x PAINEL 550W"                            → qty=1 (com "x")

      let qty = null, desc = null;

      // Padrão 1: começa com número(s) seguido de espaço e texto (formato Edeltec/Aldo)
      // Ex: "1 GERADOR..." ou "02 1 INVERSOR..."
      let m = line.match(/^(\d+)\s+(\d+)\s+(.{5,})$/);
      if (m) { qty = parseInt(m[2]); desc = m[3]; }

      if (!qty) {
        m = line.match(/^(\d+)[xX]?\s+(.{5,})$/);
        if (m) { qty = parseInt(m[1]); desc = m[2]; }
      }

      // Padrão 2: número no final "PAINEL 550W BIFACIAL 10 UN"
      if (!qty) {
        m = line.match(/^(.{5,})\s+(\d+)\s*(un|und|unid|pc|pcs|cx)?$/i);
        if (m && parseInt(m[2]) <= 500) { qty = parseInt(m[2]); desc = m[1]; }
      }

      if (!qty || !desc) return;

      // Corrige formato Edeltec/Aldo: OCR lê "60087 —1 GERADOR..." onde
      // 60087 é o código (virou qty errado) e "—1" é a qty real embutida na desc
      {
        const dashQty = desc.match(/^[—–-]\s*(\d{1,3})\s+(.{4,})$/);
        if (dashQty) { qty = parseInt(dashQty[1]); desc = dashQty[2]; }
      }

      // Limpa a descrição
      desc = desc
        .replace(/r\$[\d.,\s]+/gi, '')          // remove preços R$
        .replace(/\ba\s*partir\s*de\b.*/gi, '')  // remove "a partir de..."
        .replace(/\btotal\b.*/gi, '')            // remove "total..."
        .replace(/\s{2,}/g, ' ')                // espaços duplos
        .trim();

      if (desc.length > 4) {
        AppState.propostaItems.push({ qtd: qty, desc });
        adicionados++;
      }
    });

    if (adicionados > 0) UI.renderMateriaisList();
    return adicionados;
  },

  addMaterialManual() {
    const q = document.getElementById('mat-add-qtd').value;
    const d = document.getElementById('mat-add-desc').value;
    if(q && d) {
      AppState.propostaItems.push({ qtd: parseInt(q), desc: d.trim() });
      document.getElementById('mat-add-qtd').value = '';
      document.getElementById('mat-add-desc').value = '';
      UI.renderMateriaisList();
    }
  },

  renderMateriaisList() {
    if (!AppState.propostaItems) AppState.propostaItems = [];
    const tbody = document.getElementById('lista-materiais');
    let h = '';

    if (AppState.propostaItems.length === 0) {
      h = '<tr><td colspan="3" class="p-3 text-center text-xs text-slate-500">Nenhum item adicionado.</td></tr>';
    } else {
      AppState.propostaItems.forEach((it, idx) => {
        h += `
          <tr class="border-t border-white/5 hover:bg-white/5" data-row="${idx}">
            <td class="p-3 font-bold text-white w-16">${it.qtd}</td>
            <td class="p-3 text-slate-300 text-sm">${it.desc}</td>
            <td class="p-2 text-right whitespace-nowrap w-20">
              <button data-edit="${idx}" class="btn-edit-mat text-blue-400 hover:text-blue-300 px-2 py-1 bg-blue-500/10 rounded text-xs font-bold mr-1">✏</button>
              <button data-idx="${idx}"  class="btn-del-mat  text-red-500  hover:text-red-400  px-2 py-1 bg-red-500/10  rounded text-xs font-bold">✕</button>
            </td>
          </tr>`;
      });
    }

    tbody.innerHTML = h;

    // Deletar
    tbody.querySelectorAll('.btn-del-mat').forEach(b => {
      b.addEventListener('click', (e) => {
        AppState.propostaItems.splice(parseInt(e.currentTarget.dataset.idx), 1);
        UI.renderMateriaisList();
      });
    });

    // Editar inline
    tbody.querySelectorAll('.btn-edit-mat').forEach(b => {
      b.addEventListener('click', (e) => {
        const idx = parseInt(e.currentTarget.dataset.edit);
        const it  = AppState.propostaItems[idx];
        const row = tbody.querySelector(`tr[data-row="${idx}"]`);

        row.innerHTML = `
          <td class="p-2 w-16">
            <input id="eq-${idx}" type="number" value="${it.qtd}"
              class="input-glass w-14 p-1 rounded text-center font-bold text-white text-sm">
          </td>
          <td class="p-2">
            <input id="ed-${idx}" type="text" value="${it.desc}"
              class="input-glass w-full p-1 rounded text-slate-200 text-sm">
          </td>
          <td class="p-2 text-right whitespace-nowrap w-20">
            <button data-save="${idx}" class="btn-save-mat text-green-400 hover:text-green-300 px-2 py-1 bg-green-500/10 rounded text-xs font-bold mr-1">✓</button>
            <button data-cancel class="btn-cancel-mat text-slate-400 hover:text-slate-200 px-2 py-1 bg-white/5 rounded text-xs font-bold">✕</button>
          </td>`;

        // Focar no campo de descrição
        const descInput = document.getElementById(`ed-${idx}`);
        descInput.focus();
        descInput.setSelectionRange(descInput.value.length, descInput.value.length);

        // Salvar ao pressionar Enter
        row.querySelector('input').addEventListener('keydown', ev => {
          if (ev.key === 'Enter') row.querySelector('.btn-save-mat').click();
        });
        descInput.addEventListener('keydown', ev => {
          if (ev.key === 'Enter') row.querySelector('.btn-save-mat').click();
          if (ev.key === 'Escape') row.querySelector('.btn-cancel-mat').click();
        });

        row.querySelector('.btn-save-mat').addEventListener('click', () => {
          AppState.propostaItems[idx] = {
            qtd:  parseInt(document.getElementById(`eq-${idx}`).value) || it.qtd,
            desc: document.getElementById(`ed-${idx}`).value.trim()    || it.desc,
          };
          UI.renderMateriaisList();
        });

        row.querySelector('.btn-cancel-mat').addEventListener('click', () => {
          UI.renderMateriaisList();
        });
      });
    });
  },

  async parseImportImage(file) {
    const statusEl = document.getElementById('ocr-status');
    const label = document.getElementById('label-img-import');
    statusEl.classList.remove('hidden');
    statusEl.textContent = 'Lendo imagem com OCR... 0%';
    label.classList.add('opacity-50', 'pointer-events-none');

    try {
      const { createWorker } = await import('tesseract.js');
      const worker = await createWorker('por', 1, {
        logger: (m) => {
          if (m.status === 'recognizing text') {
            statusEl.textContent = `Reconhecendo texto... ${Math.round(m.progress * 100)}%`;
          }
        }
      });

      const { data: { text } } = await worker.recognize(file);
      await worker.terminate();

      // Extrai direto — sem precisar clicar em botão
      const adicionados = UI.parseImportText(text);
      if (adicionados > 0) {
        statusEl.textContent = `✅ OCR concluído! ${adicionados} item(ns) adicionado(s) automaticamente.`;
      } else {
        statusEl.textContent = '⚠️ OCR concluído mas nenhum item reconhecido. Tente com uma imagem mais nítida.';
      }
      statusEl.classList.remove('text-slate-400');
      statusEl.classList.add('text-green-400');
    } catch (e) {
      statusEl.textContent = 'Erro ao processar imagem: ' + e.message;
      statusEl.classList.add('text-red-400');
      console.error(e);
    } finally {
      label.classList.remove('opacity-50', 'pointer-events-none');
      document.getElementById('input-img-import').value = '';
    }
  },

  async parsePdfFile(file) {
    const statusEl = document.getElementById('ocr-status');
    const label    = document.getElementById('label-img-import');
    statusEl.classList.remove('hidden', 'text-green-400', 'text-red-400', 'text-yellow-400');
    statusEl.classList.add('text-slate-400');
    statusEl.textContent = 'Extraindo texto do PDF...';
    label.classList.add('opacity-50', 'pointer-events-none');

    try {
      const pdfjsLib = await import('pdfjs-dist');
      // Worker bundled pelo Vite
      pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
        'pdfjs-dist/build/pdf.worker.mjs', import.meta.url
      ).toString();

      const buffer = await file.arrayBuffer();
      const pdf    = await pdfjsLib.getDocument({ data: buffer }).promise;

      let fullText = '';
      for (let p = 1; p <= pdf.numPages; p++) {
        const page    = await pdf.getPage(p);
        const content = await page.getTextContent();
        // Agrupa itens por linha (posição Y) para reconstruir colunas
        const byY = {};
        content.items.forEach(it => {
          const y = Math.round(it.transform[5]);
          if (!byY[y]) byY[y] = [];
          byY[y].push(it);
        });
        Object.keys(byY).map(Number).sort((a, b) => b - a).forEach(y => {
          const line = byY[y]
            .sort((a, b) => a.transform[4] - b.transform[4])
            .map(i => i.str).join(' ').trim();
          if (line) fullText += line + '\n';
        });
      }

      const adicionados = UI.parseImportText(fullText);
      statusEl.classList.remove('text-slate-400');
      if (adicionados > 0) {
        statusEl.classList.add('text-green-400');
        statusEl.textContent = `✅ PDF lido! ${adicionados} item(ns) adicionado(s).`;
      } else {
        statusEl.classList.add('text-yellow-400');
        statusEl.textContent = '⚠️ PDF processado, mas nenhum item reconhecido. Tente pela imagem.';
      }
    } catch (e) {
      statusEl.classList.add('text-red-400');
      statusEl.textContent = 'Erro ao processar PDF: ' + e.message;
      console.error(e);
    } finally {
      label.classList.remove('opacity-50', 'pointer-events-none');
      document.getElementById('input-img-import').value = '';
    }
  },

  async rodarAgenteMarket() {
    const kwpTxt  = document.getElementById('res-kwp')?.innerText;
    const kwp     = parseFloat(kwpTxt);
    const cidadeEl = document.getElementById('calc-cidade');
    const cidade  = cidadeEl?.options[cidadeEl.selectedIndex]?.text || '';
    const estado  = document.getElementById('calc-estado')?.value || '';
    const preco   = AppState.propostaTotal || 0;

    if (!kwp || kwp <= 0) return alert('Calcule o dimensionamento primeiro.');
    if (!cidade || !estado) return alert('Selecione a cidade e estado do cliente.');

    const btn       = document.getElementById('btn-analisar-mercado');
    const statusEl  = document.getElementById('agente-status');
    const resultEl  = document.getElementById('agente-resultado');

    btn.disabled = true;
    btn.innerHTML = '<span class="animate-spin">⏳</span> Analisando...';
    statusEl.classList.remove('hidden');
    resultEl.classList.add('hidden');
    resultEl.innerHTML = '';

    try {
      const agentModule = await import('./agent.js');
      const analise = await agentModule.analisarMercado(
        { kwp, cidade, estado, precoIntegrador: preco },
        (msg) => { statusEl.textContent = msg; }
      );
      statusEl.classList.add('hidden');
      UI.renderAgentResult(analise, kwp, preco);
    } catch (e) {
      statusEl.textContent = '❌ Erro: ' + e.message;
      statusEl.classList.remove('animate-pulse');
      console.error(e);
    } finally {
      btn.disabled = false;
      btn.innerHTML = '<span>🔍</span> Analisar Mercado';
    }
  },

  renderAgentResult(a, kwp, precoIntegrador) {
    const resultEl = document.getElementById('agente-resultado');

    const fmtR = (v) => v != null
      ? 'R$ ' + Math.round(v).toLocaleString('pt-BR')
      : '–';

    const posColors = {
      'abaixo do mercado':   { bg: 'bg-green-500/15', border: 'border-green-500/40', text: 'text-green-400', icon: '⬇️' },
      'dentro do mercado':   { bg: 'bg-blue-500/15',  border: 'border-blue-500/40',  text: 'text-blue-400',  icon: '✅' },
      'acima do mercado':    { bg: 'bg-orange-500/15',border: 'border-orange-500/40',text: 'text-orange-400',icon: '⬆️' },
      'sem dados suficientes':{ bg: 'bg-white/5',     border: 'border-white/20',     text: 'text-slate-400', icon: '❓' },
    };
    const col = posColors[a.posicao] ?? posColors['sem dados suficientes'];

    const confColor = { alta: 'text-green-400', média: 'text-yellow-400', baixa: 'text-red-400' };

    const diffHTML = a.economia_vs_media != null && precoIntegrador > 0
      ? `<div class="flex justify-between text-xs py-1 border-b border-white/5">
           <span class="text-slate-400">Diferença vs média</span>
           <span class="${a.economia_vs_media > 0 ? 'text-orange-400' : 'text-green-400'} font-bold">
             ${a.economia_vs_media > 0 ? '+' : ''}${fmtR(a.economia_vs_media)}
             (${a.percentual_vs_media > 0 ? '+' : ''}${a.percentual_vs_media?.toFixed(1) ?? '–'}%)
           </span>
         </div>`
      : '';

    const fontesHTML = a.fontes?.length
      ? `<div class="mt-3 pt-3 border-t border-white/10">
           <p class="text-xs text-slate-500 mb-1">Fontes consultadas:</p>
           <div class="space-y-1">
             ${a.fontes.map(u => `<a href="${u}" target="_blank" rel="noopener"
               class="block text-xs text-blue-400/70 hover:text-blue-400 truncate">${u}</a>`).join('')}
           </div>
         </div>`
      : '';

    resultEl.innerHTML = `
      <!-- Badge de posicionamento -->
      <div class="${col.bg} ${col.border} border rounded-xl p-4">
        <div class="flex items-center justify-between mb-2">
          <span class="text-sm font-bold ${col.text}">${col.icon} ${a.posicao.toUpperCase()}</span>
          <span class="text-xs ${confColor[a.confiabilidade] ?? 'text-slate-400'}">
            confiabilidade ${a.confiabilidade ?? '–'}
          </span>
        </div>
        ${a.analise ? `<p class="text-xs text-slate-300 leading-relaxed">${a.analise}</p>` : ''}
        ${a.dica ? `<p class="text-xs text-blue-300 mt-2 italic">💡 ${a.dica}</p>` : ''}
      </div>

      <!-- Faixas de preço -->
      <div class="bg-white/5 rounded-xl p-4 space-y-2">
        <p class="text-xs font-bold text-slate-400 uppercase mb-3">
          Mercado — ${kwp.toFixed(1)} kWp / ${document.getElementById('calc-cidade')?.options[document.getElementById('calc-cidade').selectedIndex]?.text ?? ''}
        </p>
        <div class="flex justify-between text-xs py-1 border-b border-white/5">
          <span class="text-slate-400">Faixa mínima</span>
          <span class="text-white font-bold">${fmtR(a.faixa_min)}</span>
        </div>
        <div class="flex justify-between text-xs py-1 border-b border-white/5">
          <span class="text-slate-400">Média regional</span>
          <span class="text-yellow-400 font-bold">${fmtR(a.media_regiao)}</span>
        </div>
        <div class="flex justify-between text-xs py-1 border-b border-white/5">
          <span class="text-slate-400">Faixa máxima</span>
          <span class="text-white font-bold">${fmtR(a.faixa_max)}</span>
        </div>
        <div class="flex justify-between text-xs py-1 border-b border-white/5">
          <span class="text-slate-400">Preço/kWp médio</span>
          <span class="text-white font-bold">${a.preco_por_kwp != null ? 'R$ ' + Math.round(a.preco_por_kwp).toLocaleString('pt-BR') + '/kWp' : '–'}</span>
        </div>
        ${precoIntegrador > 0 ? `
        <div class="flex justify-between text-xs py-1 border-b border-white/5">
          <span class="text-slate-400">Seu preço</span>
          <span class="${col.text} font-bold">${fmtR(precoIntegrador)}</span>
        </div>` : ''}
        ${diffHTML}
        ${a.baseado_em_referencia ? `<p class="text-xs text-slate-500 mt-2 italic">* Baseado em referência nacional — poucos dados locais encontrados.</p>` : ''}
      </div>
      ${fontesHTML}`;

    resultEl.classList.remove('hidden');
  },

  calcProposalTotal() {
    const k = parseFloat(document.getElementById('prop-custo-kit').value) || 0;
    const m = parseFloat(document.getElementById('prop-custo-mo').value) || 0;
    const e = parseFloat(document.getElementById('prop-custo-eng').value) || 0;
    const x = parseFloat(document.getElementById('prop-custo-extra').value) || 0;
    const total = k + m + e + x;
    document.getElementById('prop-valor-total').innerText = total.toLocaleString('pt-BR', {minimumFractionDigits: 2, maximumFractionDigits: 2});
    AppState.propostaTotal = total;
  },

  populateSizingClient() {
    const id = document.getElementById('prop-cliente-select').value;
    const campos = ['prop-cliente-nome','prop-cliente-rua','prop-cliente-num','prop-cliente-bairro','prop-cliente-cidade','prop-cliente-uf'];
    if (!id) { campos.forEach(c => document.getElementById(c).value = ''); return; }
    const cli = AppState.clientes.find(c => c.id === id);
    if (cli) {
      document.getElementById('prop-cliente-nome').value = cli.nome || '';
      try {
        const end = cli.endereco || '';
        const p = end.split(' - ');
        const rn = (p[0]||'').split(', ');
        const bc = (p[1]||'').split(', ');
        document.getElementById('prop-cliente-rua').value = rn[0] || '';
        document.getElementById('prop-cliente-num').value = rn[1] || '';
        document.getElementById('prop-cliente-bairro').value = bc[0] || '';
        document.getElementById('prop-cliente-cidade').value = bc[1] || '';
        document.getElementById('prop-cliente-uf').value = p[2] || '';
      } catch (e) {
        document.getElementById('prop-cliente-rua').value = cli.endereco || '';
      }
    }
  },

  // ---------- ABA ORÇAMENTOS ----------
  async renderOrcamentos() {
    document.getElementById('header-actions').innerHTML = ``;
    
    document.getElementById('tab-content').innerHTML = `
      <div class="max-w-5xl mx-auto space-y-8">
        <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 class="text-2xl font-bold tracking-tight text-white">Histórico de Propostas</h2>
            <p class="text-sm text-slate-500 font-medium">Visualize e gerencie todos os orçamentos técnicos gerados pelo sistema.</p>
          </div>
          <div class="flex gap-3">
             <div class="relative w-full md:w-64">
              <input type="text" id="orc-search" placeholder="Buscar por cliente..." class="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-xs focus:ring-1 focus:ring-yellow-400 outline-none transition-all">
            </div>
          </div>
        </div>

        <div id="lista-orca" class="grid grid-cols-1 gap-4">
          <div class="flex flex-col items-center justify-center p-20 glass rounded-3xl border border-white/5 text-slate-500">
            <div class="w-10 h-10 border-2 border-yellow-400/20 border-t-yellow-400 rounded-full animate-spin mb-4"></div>
            <p class="text-xs font-bold uppercase tracking-widest">Sincronizando com o Banco...</p>
          </div>
        </div>
      </div>
    `;

    try {
      const list = await Data.getOrcamentos() || [];
      const container = document.getElementById('lista-orca');
      
      if (list.length === 0) {
        container.innerHTML = `
          <div class="flex flex-col items-center justify-center p-20 glass rounded-3xl border border-white/5 text-center">
            <div class="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center text-3xl mb-4">📂</div>
            <h3 class="text-lg font-bold text-white mb-1">Nenhum registro encontrado</h3>
            <p class="text-sm text-slate-500 max-w-xs">Você ainda não gerou nenhuma proposta técnica. Inicie um dimensionamento para começar.</p>
          </div>
        `;
        return;
      }

      const renderList = (items) => {
        container.innerHTML = items.map(o => {
          const dt = new Date(o.created_at);
          const dataFmt = dt.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });
          const horaFmt = dt.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
          
          const valorFmt = o.valor_total
            ? Number(o.valor_total).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
            : 'R$ 0,00';
            
          const kwpFmt = o.potencia_kwp ? `${o.potencia_kwp} kWp` : '–';
          const cidade = o.dados_proposta?.cidade || '';
          const estado = o.dados_proposta?.estado || '';
          const local  = cidade && estado ? `${cidade}, ${estado}` : 'Local não informado';
          
          const emailCliente = o.clientes?.email || '';
          const telLimpo = (o.clientes?.tel || '').replace(/\D/g, '');

          return `
            <div class="glass p-6 rounded-3xl border border-white/5 hover:border-yellow-400/20 transition-all group relative overflow-hidden">
              <div class="absolute top-0 right-0 w-32 h-32 bg-yellow-400/[0.02] blur-3xl group-hover:bg-yellow-400/[0.05] transition-all"></div>
              
              <div class="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
                
                <div class="flex items-center gap-5">
                   <div class="w-14 h-14 rounded-2xl bg-slate-900/50 border border-white/5 flex flex-col items-center justify-center text-center">
                      <span class="text-[10px] uppercase font-bold text-yellow-500/80 leading-none mb-1">${dt.toLocaleDateString('pt-BR', { month: 'short' }).replace('.','')}</span>
                      <span class="text-xl font-bold text-white leading-none">${dt.getDate()}</span>
                   </div>
                   <div>
                      <div class="flex items-center gap-2 mb-1">
                        <h3 class="font-bold text-white group-hover:text-yellow-400 transition-colors">${o.cliente_nome || 'Cliente Sem Nome'}</h3>
                        <span class="text-[10px] px-2 py-0.5 rounded-full bg-yellow-400/10 text-yellow-500 font-bold border border-yellow-400/10">${kwpFmt}</span>
                      </div>
                      <div class="flex items-center gap-3 text-xs text-slate-500 font-medium">
                        <span class="flex items-center gap-1">📍 ${local}</span>
                        <span class="w-1 h-1 rounded-full bg-slate-800"></span>
                        <span>🕒 ${horaFmt}</span>
                      </div>
                   </div>
                </div>

                <div class="flex flex-col md:items-end gap-1">
                  <span class="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Valor do Projeto</span>
                  <span class="text-xl font-bold text-white tracking-tight">${valorFmt}</span>
                </div>

                <div class="flex items-center gap-2 border-t md:border-t-0 pt-4 md:pt-0 border-white/5">
                  ${o.pdf_url ? `
                    <a href="${o.pdf_url}" target="_blank" class="w-10 h-10 rounded-xl bg-white/5 hover:bg-white/10 flex items-center justify-center text-lg transition-all border border-white/5" title="Ver PDF">📄</a>
                  ` : `
                    <button data-gerar="${o.id}" class="w-10 h-10 rounded-xl bg-yellow-400/10 hover:bg-yellow-400/20 text-yellow-500 flex items-center justify-center text-lg transition-all border border-yellow-400/10" title="Gerar PDF">⚡</button>
                  `}
                  
                  ${emailCliente ? `
                    <button onclick="window.location.href='mailto:${emailCliente}'" class="w-10 h-10 rounded-xl bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 flex items-center justify-center text-lg transition-all border border-blue-500/10" title="Enviar E-mail">📧</button>
                  ` : ''}

                  ${telLimpo ? `
                    <a href="https://wa.me/55${telLimpo}" target="_blank" class="w-10 h-10 rounded-xl bg-green-500/10 hover:bg-green-500/20 text-green-400 flex items-center justify-center text-lg transition-all border border-green-500/10" title="WhatsApp">💬</a>
                  ` : ''}

                  <button data-del="${o.id}" class="w-10 h-10 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 flex items-center justify-center text-lg transition-all border border-red-500/10" title="Excluir">🗑️</button>
                </div>

              </div>
            </div>
          `;
        }).join('');

        // Listeners
        container.querySelectorAll('[data-del]').forEach(btn => {
          btn.addEventListener('click', async (e) => {
            if (!confirm('Excluir esta proposta permanentemente?')) return;
            const id = e.currentTarget.dataset.del;
            try {
              await Data.deleteOrcamento(id);
              UI.renderOrcamentos();
            } catch(err) { alert('Erro: ' + err.message); }
          });
        });

        container.querySelectorAll('[data-gerar]').forEach(btn => {
          btn.addEventListener('click', async (e) => {
            const id = e.currentTarget.dataset.gerar;
            const { gerarPDFDeOrcamento } = await import('./pdf.js');
            gerarPDFDeOrcamento(id);
          });
        });
      };

      renderList(list);

      // Busca local
      document.getElementById('orc-search').addEventListener('input', (e) => {
        const q = e.target.value.toLowerCase();
        const filtered = list.filter(o => 
          (o.cliente_nome || '').toLowerCase().includes(q) ||
          (o.dados_proposta?.cidade || '').toLowerCase().includes(q)
        );
        renderList(filtered);
      });

    } catch(e) {
      container.innerHTML = `<div class="p-20 text-center text-red-500 glass rounded-3xl border border-red-500/20">Erro crítico ao carregar histórico: ${e.message}</div>`;
    }
  }
};
