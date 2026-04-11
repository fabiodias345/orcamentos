import { Data } from './data.js';
import { Calc, HSP_CIDADES } from './sizing.js';

export const AppState = {
  activeTab: 'empresa',
  clientes: []
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

      // Attach tab events
      document.querySelectorAll('.nav-tab').forEach(el => {
        el.addEventListener('click', (e) => {
          Router.to(e.target.dataset.tab);
        });
      });

      // Attach logout event
      document.getElementById('btn-logout').addEventListener('click', async () => {
        await Data.logout();
        window.location.reload();
      });

      document.getElementById('loader').classList.add('hidden');
      container.classList.remove('hidden');
      
      Router.renderTab(AppState.activeTab);
    }
  },
  to: (tab) => {
    AppState.activeTab = tab;
    Router.renderTab(tab);
    document.querySelectorAll('.nav-tab').forEach(el => {
      el.classList.remove('active');
      if (el.dataset.tab === tab) el.classList.add('active');
    });
  },
  renderTab: (tab) => {
    const container = document.getElementById('tab-content');
    container.innerHTML = `<div class="p-12 text-center text-slate-500">Carregando...</div>`;
    switch (tab) {
      case 'empresa': UI.renderEmpresa(); break;
      case 'clientes': UI.renderClientes(); break;
      case 'sizing': UI.renderSizing(); break;
      case 'orcamentos': UI.renderOrcamentos(); break;
    }
  }
};

export const UI = {
  // ---------- ABA EMPRESA ----------
  async renderEmpresa() {
    const container = document.getElementById('tab-content');
    try {
      const d = await Data.getEmpresa() || {};
      container.innerHTML = `
        <div class="glass p-8 rounded-2xl max-w-2xl mx-auto animate-fade-in">
          <h2 class="text-2xl font-bold mb-6 text-yellow-400">Minha Empresa</h2>
          <div class="space-y-4">
            <input type="text" id="emp-nome" placeholder="Nome Comercial" class="input-glass p-3 rounded-lg w-full" value="${d.nome || ''}">
            <div class="grid grid-cols-2 gap-4">
              <input type="text" id="emp-cnpj" placeholder="CNPJ" class="input-glass p-3 rounded-lg" value="${d.cnpj || ''}">
              <input type="text" id="emp-tel" placeholder="Telefone" class="input-glass p-3 rounded-lg" value="${d.tel || ''}">
            </div>
            <input type="text" id="emp-email" placeholder="E-mail" class="input-glass p-3 rounded-lg w-full" value="${d.email || ''}">
            <input type="text" id="emp-end" placeholder="Endereço Completo" class="input-glass p-3 rounded-lg w-full" value="${d.endereco || ''}">
            <input type="text" id="emp-logo" placeholder="URL da Logomarca (Png/Jpg)" class="input-glass p-3 rounded-lg w-full" value="${d.logo || ''}">
            <button id="btn-save-emp" class="btn-primary w-full py-3 rounded-xl mt-4">SALVAR MINHA EMPRESA</button>
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
    document.getElementById('tab-content').innerHTML = `
      <div class="glass p-8 rounded-2xl mb-8">
          <h2 class="text-xl font-bold mb-6 text-yellow-400">Cadastrar/Editar Cliente</h2>
          <input type="hidden" id="cli-id" value="">
          <div class="space-y-6">
            <div>
                <h3 class="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4 border-b border-white/5 pb-2">Informações Pessoais</h3>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div class="flex flex-col"><label class="text-xs text-slate-500 mb-1 ml-1 font-semibold">NOME COMPLETO</label><input type="text" id="cli-nome" placeholder="Ex: João da Silva" class="input-glass p-3 rounded-lg text-white"></div>
                  <div class="flex flex-col"><label class="text-xs text-slate-500 mb-1 ml-1 font-semibold">E-MAIL</label><input type="email" id="cli-email" placeholder="email@cliente.com" class="input-glass p-3 rounded-lg text-white"></div>
                </div>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  <div class="flex flex-col"><label class="text-xs text-slate-500 mb-1 ml-1 font-semibold">WHATSAPP / TELEFONE</label><input type="text" id="cli-tel" placeholder="(43) 99999-9999" class="input-glass p-3 rounded-lg text-white"></div>
                </div>
            </div>
            <div>
                <h3 class="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4 mt-6 border-b border-white/5 pb-2">Localização</h3>
                <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div class="flex flex-col"><label class="text-xs text-yellow-500/80 mb-1 ml-1 font-semibold">CEP (Digite para preencher)</label><input type="text" id="cli-cep" placeholder="00000-000" class="input-glass p-3 rounded-lg font-bold text-yellow-400"></div>
                </div>
                <div class="grid grid-cols-1 md:grid-cols-12 gap-4">
                  <div class="flex flex-col md:col-span-9"><label class="text-xs text-slate-500 mb-1 ml-1 font-semibold">RUA / LOGRADOURO</label><input type="text" id="cli-rua" placeholder="Nome da Rua" class="input-glass p-3 rounded-lg text-white"></div>
                  <div class="flex flex-col md:col-span-3"><label class="text-xs text-slate-500 mb-1 ml-1 font-semibold">NÚMERO</label><input type="text" id="cli-num" placeholder="123" class="input-glass p-3 rounded-lg text-white"></div>
                </div>
                <div class="grid grid-cols-1 md:grid-cols-12 gap-4 mt-4">
                  <div class="flex flex-col md:col-span-4"><label class="text-xs text-slate-500 mb-1 ml-1 font-semibold">BAIRRO</label><input type="text" id="cli-bairro" placeholder="Bairro" class="input-glass p-3 rounded-lg text-white"></div>
                  <div class="flex flex-col md:col-span-6"><label class="text-xs text-slate-500 mb-1 ml-1 font-semibold">CIDADE</label><input type="text" id="cli-cidade" placeholder="Cidade" class="input-glass p-3 rounded-lg text-white"></div>
                  <div class="flex flex-col md:col-span-2"><label class="text-xs text-slate-500 mb-1 ml-1 font-semibold">UF</label><input type="text" id="cli-uf" placeholder="PR" class="input-glass p-3 rounded-lg text-white"></div>
                </div>
            </div>
            <div class="flex space-x-4">
              <button id="btn-save-cli" class="btn-primary flex-1 py-4 rounded-xl mt-8 text-sm font-bold">SALVAR CLIENTE</button>
              <button id="btn-clean-cli" class="py-4 px-6 rounded-xl mt-8 text-sm font-bold border border-white/10 hover:bg-white/5">LIMPAR / NOVO</button>
            </div>
          </div>
      </div>
      <div class="glass p-8 rounded-2xl">
        <h2 class="text-xl font-bold mb-6 text-yellow-400">Meus Clientes Cadastrados</h2>
        <table class="w-full text-left">
          <thead><tr class="text-slate-500 text-xs uppercase tracking-widest border-b border-white/5"><th class="pb-3">Nome</th><th class="pb-3">Contato</th><th class="pb-3">Endereço</th><th class="pb-3">Ações</th></tr></thead>
          <tbody id="lista-clientes"><tr><td colspan="4" class="py-4 text-center text-slate-500">Carregando...</td></tr></tbody>
        </table>
      </div>
    `;

    document.getElementById('btn-save-cli').addEventListener('click', () => UI.saveCliente());
    document.getElementById('btn-clean-cli').addEventListener('click', () => UI.limparFormCliente());
    
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
        h = '<tr><td colspan="4" class="py-4 text-center text-slate-500">Nenhum cliente cadastrado ainda.</td></tr>';
      } else {
        h = list.map(c => {
          const contato = (c.tel||'') + (c.email ? '<br><span class="text-xs text-blue-400">' + c.email + '</span>' : '');
          const acoes = `<button data-action="edit" data-id="${c.id}" class="text-xs mr-3 text-blue-400 hover:text-blue-300 uppercase font-bold">Editar</button><button data-action="del" data-id="${c.id}" class="text-xs text-red-500 hover:text-red-400 uppercase font-bold">Deletar</button>`;
          return `<tr class="border-b border-white/5 hover:bg-white/5"><td class="py-4 font-semibold text-white">${c.nome}</td><td class="py-4 text-slate-400">${contato}</td><td class="py-4 text-slate-400 max-w-xs truncate" title="${c.endereco || ''}">${c.endereco || ''}</td><td class="py-4">${acoes}</td></tr>`;
        }).join('');
      }
      document.getElementById('lista-clientes').innerHTML = h;

      document.querySelectorAll('#lista-clientes button').forEach(b => {
        b.addEventListener('click', (e) => {
          const id = e.target.dataset.id;
          if (e.target.dataset.action === 'edit') UI.editCliente(id);
          if (e.target.dataset.action === 'del') UI.deleteCliente(id);
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
    // Garante que clientes estao carregados
    if (AppState.clientes.length === 0) {
      AppState.clientes = await Data.getClientes() || [];
    }

    const optEstados = Object.keys(HSP_CIDADES).map(e => `<option value="${e}">${e}</option>`).join('');

    let optClientes = '<option value="">Selecione um cliente cadastrado...</option>';
    if (AppState.clientes.length > 0) {
      optClientes += AppState.clientes.map(c => `<option value="${c.id}">${c.nome}</option>`).join('');
    }

    document.getElementById('tab-content').innerHTML = `
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        <div class="lg:col-span-2 space-y-8">
          <div class="glass p-8 rounded-2xl">
              <h2 class="text-xl font-bold mb-6 text-yellow-400">Atribuir a um Cliente</h2>
              <select id="prop-cliente-select" class="input-glass p-4 rounded-xl w-full text-white font-semibold mb-6">
                ${optClientes}
              </select>
              <div class="grid grid-cols-1 md:grid-cols-12 gap-4">
                <div class="md:col-span-12"><label class="text-xs text-slate-500 mb-1 ml-1 font-semibold">NOME</label><input type="text" id="prop-cliente-nome" class="input-glass p-3 rounded-lg bg-white/5 opacity-70 w-full" disabled></div>
              </div>
              <div class="grid grid-cols-1 md:grid-cols-12 gap-4 mt-4">
                <div class="md:col-span-9"><label class="text-xs text-slate-500 mb-1 ml-1 font-semibold">RUA</label><input type="text" id="prop-cliente-rua" class="input-glass p-3 rounded-lg bg-white/5 opacity-70 w-full" disabled></div>
                <div class="md:col-span-3"><label class="text-xs text-slate-500 mb-1 ml-1 font-semibold">Nº</label><input type="text" id="prop-cliente-num" class="input-glass p-3 rounded-lg bg-white/5 opacity-70 w-full" disabled></div>
              </div>
              <div class="grid grid-cols-1 md:grid-cols-12 gap-4 mt-4">
                <div class="md:col-span-5"><label class="text-xs text-slate-500 mb-1 ml-1 font-semibold">BAIRRO</label><input type="text" id="prop-cliente-bairro" class="input-glass p-3 rounded-lg bg-white/5 opacity-70 w-full" disabled></div>
                <div class="md:col-span-5"><label class="text-xs text-slate-500 mb-1 ml-1 font-semibold">CIDADE</label><input type="text" id="prop-cliente-cidade" class="input-glass p-3 rounded-lg bg-white/5 opacity-70 w-full" disabled></div>
                <div class="md:col-span-2"><label class="text-xs text-slate-500 mb-1 ml-1 font-semibold">UF</label><input type="text" id="prop-cliente-uf" class="input-glass p-3 rounded-lg bg-white/5 opacity-70 w-full" disabled></div>
              </div>
          </div>

          <div class="glass p-8 rounded-2xl">
            <h2 class="text-xl font-bold mb-6 text-yellow-400">Dados do Projeto</h2>
            <div class="space-y-6">
              <div>
                <label class="block text-xs font-bold text-slate-500 uppercase mb-2">Consumo Médio Atual (kWh/mês)</label>
                <input type="number" id="calc-kwh" class="input-glass w-full p-4 rounded-xl text-2xl font-bold text-yellow-400" placeholder="Ex: 600">
              </div>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label class="block text-xs font-bold text-slate-500 uppercase mb-2">Estado</label>
                  <select id="calc-estado" class="input-glass w-full p-4 rounded-xl">
                    <option value="">Selecione o Estado...</option>
                    ${optEstados}
                  </select>
                </div>
                <div>
                  <label class="block text-xs font-bold text-slate-500 uppercase mb-2">Cidade</label>
                  <select id="calc-cidade" class="input-glass w-full p-4 rounded-xl" disabled>
                    <option value="">Primeiro selecione o estado...</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="glass p-8 rounded-2xl sticky top-24 self-start">
          <h3 class="text-lg font-bold mb-4 uppercase text-slate-400 border-b border-white/5 pb-2">Resultado</h3>
          <div class="space-y-6">
            <div>
              <p class="text-xs uppercase font-bold text-slate-400 mb-2">Pela localidade, o cliente precisa de:</p>
              <div class="text-4xl font-bold text-yellow-500"><span id="res-kwp">0.00</span> <span class="text-xl">kWp</span></div>
            </div>
            <div class="p-4 bg-white/5 rounded-xl text-sm text-center text-slate-400">
              <p>O dimensionamento calcula a potência do arranjo fotovoltaico necessário para suprir o consumo mensal.</p>
            </div>
          </div>
        </div>
      </div>
    `;

    document.getElementById('prop-cliente-select').addEventListener('change', () => UI.populateSizingClient());
    document.getElementById('calc-kwh').addEventListener('input', () => Calc.update());
    document.getElementById('calc-estado').addEventListener('change', () => Calc.carregarCidades());
    document.getElementById('calc-cidade').addEventListener('change', () => Calc.update());
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
    document.getElementById('tab-content').innerHTML = `
      <div class="glass p-8 rounded-2xl">
        <h2 class="text-2xl font-bold mb-6 text-yellow-400">Histórico de Propostas</h2>
        <table class="w-full text-left">
          <thead><tr class="text-slate-500 text-xs uppercase tracking-widest border-b border-white/5"><th class="pb-3">Data</th><th class="pb-3">Cliente</th><th class="pb-3">Valor</th><th class="pb-3">PDF</th></tr></thead>
          <tbody id="lista-orca"><tr><td colspan="4" class="py-4 text-center text-slate-500">Carregando...</td></tr></tbody>
        </table>
      </div>
    `;
    try {
      const list = await Data.getOrcamentos() || [];
      const h = list.length === 0 ? `<tr><td colspan="4" class="py-4 text-center text-slate-500">Nenhum orçamento gerado.</td></tr>` : 
      list.map(o => {
        const d = new Date(o.created_at).toLocaleDateString('pt-BR');
        return `<tr class="border-b border-white/5 hover:bg-white/5"><td class="py-4 text-slate-400">${d}</td><td class="py-4 font-bold text-white">${o.cliente_nome || '-'}</td><td class="py-4 text-green-400">R$ ${o.valor_total || '0,00'}</td><td class="py-4"><a href="${o.pdf_url||'#'}" target="_blank" class="text-yellow-400 font-bold hover:underline">Ver PDF</a></td></tr>`;
      }).join('');
      document.getElementById('lista-orca').innerHTML = h;
    } catch(e) {
      console.error(e);
      document.getElementById('lista-orca').innerHTML = `<tr><td colspan="4" class="py-4 text-center text-red-500">Erro ao carregar orçamentos</td></tr>`;
    }
  }
};
