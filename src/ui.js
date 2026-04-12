import { Data } from './data.js';
import { Calc, HSP_CIDADES } from './sizing.js';

export const AppState = {
  activeTab: 'empresa',
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
      
      <!-- GERADOR DE PROPOSTAS -->
      <div class="glass p-8 rounded-2xl animate-fade-in mt-8 w-full border border-yellow-500/20 shadow-[0_0_15px_rgba(234,179,8,0.1)]">
        <h2 class="text-2xl font-bold mb-2 text-yellow-400">Construtor da Proposta</h2>
        <p class="text-sm text-slate-400 mb-6">Importe os itens da distribuidora e defina sua margem e custos de venda (Chave na Mão).</p>
        
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <!-- ITENS -->
          <div class="space-y-4">
            <h3 class="text-sm font-bold text-slate-400 uppercase tracking-wider border-b border-white/5 pb-2">1. Lista de Materiais</h3>
            
            <div class="space-y-2">
              <label class="text-xs text-yellow-500/80 mb-1 ml-1 font-semibold">Importe o orçamento da Distribuidora</label>
              <label id="label-img-import" class="flex flex-col items-center justify-center w-full p-4 border-2 border-dashed border-white/20 rounded-lg cursor-pointer hover:border-yellow-500/50 hover:bg-yellow-500/5 transition-all">
                <span class="text-2xl mb-1">📄</span>
                <span class="text-xs text-slate-400">Clique, arraste ou <kbd class="bg-white/10 px-1 py-0.5 rounded text-xs">Ctrl+V</kbd> para colar</span>
                <span class="text-xs text-slate-600 mt-1">PDF, JPG ou PNG</span>
                <input type="file" id="input-img-import" accept="image/jpeg,image/jpg,image/png,application/pdf" class="hidden">
              </label>
              <div id="ocr-status" class="hidden text-xs text-center py-2 px-3 rounded-lg bg-white/5 text-slate-400"></div>
            </div>

            <div class="mt-4 border border-white/10 rounded-xl overflow-hidden bg-white/5">
              <table class="w-full text-left text-sm">
                <thead><tr class="bg-black/20 text-slate-400 text-xs uppercase"><th class="p-3 w-16">Qtd</th><th class="p-3">Descrição do Equipamento</th><th class="p-3 w-10"></th></tr></thead>
                <tbody id="lista-materiais">
                  <!-- Gerado JS -->
                </tbody>
              </table>
            </div>
            
            <div class="flex gap-2 mt-2">
              <input type="number" id="mat-add-qtd" placeholder="Qtd" class="input-glass p-2 rounded-lg w-20 text-center">
              <input type="text" id="mat-add-desc" placeholder="Adicionar item manualmente..." class="input-glass p-2 rounded-lg flex-1">
              <button id="btn-add-mat" class="py-2 px-4 rounded-lg bg-blue-500 hover:bg-blue-600 text-white font-bold">+</button>
            </div>
          </div>

          <!-- FINANCEIRO -->
          <div class="space-y-4">
            <h3 class="text-sm font-bold text-slate-400 uppercase tracking-wider border-b border-white/5 pb-2">2. Composição do Preço Final</h3>
            
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div class="flex flex-col"><label class="text-xs text-slate-500 mb-1 ml-1 font-semibold">Distr. / Custo do Kit (R$)</label>
                <input type="number" id="prop-custo-kit" class="input-glass p-3 rounded-lg font-bold text-white prop-calc" placeholder="0.00"></div>
              <div class="flex flex-col"><label class="text-xs text-slate-500 mb-1 ml-1 font-semibold">Mão de Obra (R$)</label>
                <input type="number" id="prop-custo-mo" class="input-glass p-3 rounded-lg font-bold text-white prop-calc" placeholder="0.00"></div>
              <div class="flex flex-col"><label class="text-xs text-slate-500 mb-1 ml-1 font-semibold">Engenharia/Homologação (R$)</label>
                <input type="number" id="prop-custo-eng" class="input-glass p-3 rounded-lg font-bold text-white prop-calc" placeholder="0.00"></div>
              <div class="flex flex-col"><label class="text-xs text-slate-500 mb-1 ml-1 font-semibold">Peças Extras / Frete (R$)</label>
                <input type="number" id="prop-custo-extra" class="input-glass p-3 rounded-lg font-bold text-white prop-calc" placeholder="0.00"></div>
            </div>
            <div class="flex flex-col mt-2">
              <label class="text-xs text-yellow-500/80 mb-1 ml-1 font-semibold">Valor Médio da Conta de Energia do Cliente (R$/mês)</label>
              <input type="number" id="prop-conta-energia" class="input-glass p-3 rounded-lg font-bold text-yellow-300" placeholder="Ex: 1200.00">
            </div>

            <div class="p-6 bg-yellow-500/10 border border-yellow-500/30 rounded-xl mt-6 text-center">
              <p class="text-xs uppercase font-bold text-yellow-500/80 mb-1">Valor Venda (Chave na Mão)</p>
              <div class="text-4xl font-bold text-yellow-400">R$ <span id="prop-valor-total">0,00</span></div>
            </div>

            <button id="btn-salvar-orc" class="btn-primary w-full py-4 rounded-xl mt-4 font-bold uppercase tracking-wider shadow-lg">SALVAR ORÇAMENTO</button>
          </div>
        </div>
      </div>
    `;

    document.getElementById('prop-cliente-select').addEventListener('change', () => UI.populateSizingClient());
    document.getElementById('calc-kwh').addEventListener('input', () => Calc.update());
    document.getElementById('calc-estado').addEventListener('change', () => Calc.carregarCidades());
    document.getElementById('calc-cidade').addEventListener('change', () => Calc.update());

    // Proposal logic events
    document.getElementById('btn-add-mat').addEventListener('click', () => UI.addMaterialManual());
    document.querySelectorAll('.prop-calc').forEach(el => el.addEventListener('input', () => UI.calcProposalTotal()));
    document.getElementById('btn-salvar-orc').addEventListener('click', () => {
      import('./pdf.js').then(m => m.salvarOrcamento());
    });
    document.getElementById('input-img-import').addEventListener('change', (e) => {
      const file = e.target.files?.[0];
      if (!file) return;
      file.type === 'application/pdf' ? UI.parsePdfFile(file) : UI.parseImportImage(file);
    });
    const dropZone = document.getElementById('label-img-import');
    dropZone.addEventListener('dragover', (e) => { e.preventDefault(); dropZone.classList.add('border-yellow-500/70'); });
    dropZone.addEventListener('dragleave', () => dropZone.classList.remove('border-yellow-500/70'));
    dropZone.addEventListener('drop', (e) => {
      e.preventDefault();
      dropZone.classList.remove('border-yellow-500/70');
      const file = e.dataTransfer.files[0];
      if (!file) return;
      file.type === 'application/pdf' ? UI.parsePdfFile(file) : UI.parseImportImage(file);
    });

    // Colar imagem com Ctrl+V (ativo enquanto a página de proposta estiver aberta)
    if (UI._pasteHandler) document.removeEventListener('paste', UI._pasteHandler);
    UI._pasteHandler = (e) => {
      if (!document.getElementById('label-img-import')) return; // saiu da página
      const items = e.clipboardData?.items;
      if (!items) return;
      for (const item of items) {
        if (item.type.startsWith('image/')) {
          const file = item.getAsFile();
          if (file) { e.preventDefault(); UI.parseImportImage(file); return; }
        }
      }
    };
    document.addEventListener('paste', UI._pasteHandler);
    
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
    document.getElementById('tab-content').innerHTML = `
      <div class="glass p-8 rounded-2xl">
        <h2 class="text-2xl font-bold mb-2 text-yellow-400">Histórico de Propostas</h2>
        <p class="text-sm text-slate-400 mb-6">Propostas geradas ficam salvas aqui. Você pode baixar o PDF ou enviar pelo WhatsApp.</p>
        <div id="lista-orca" class="space-y-3">
          <div class="py-8 text-center text-slate-500">Carregando...</div>
        </div>
      </div>
    `;
    try {
      const list = await Data.getOrcamentos() || [];
      const container = document.getElementById('lista-orca');
      if (list.length === 0) {
        container.innerHTML = `<div class="py-8 text-center text-slate-500">Nenhuma proposta gerada ainda.</div>`;
        return;
      }

      container.innerHTML = list.map(o => {
        const data  = new Date(o.created_at).toLocaleDateString('pt-BR');
        const hora  = new Date(o.created_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
        const valor = o.valor_total
          ? 'R$ ' + Number(o.valor_total).toLocaleString('pt-BR', { minimumFractionDigits: 2 })
          : '–';
        const kwp   = o.potencia_kwp ? `${o.potencia_kwp} kWp` : '–';
        const cidade = o.dados_proposta?.cidade || '';
        const estado = o.dados_proposta?.estado || '';
        const local  = cidade && estado ? `${cidade}/${estado}` : '–';
        const tel    = o.clientes?.tel || '';

        // Botão E-mail
        const emailCliente = o.clientes?.email || '';
        const assunto = encodeURIComponent(`Proposta de Energia Solar – ${o.cliente_nome}`);
        const corpoEmail = encodeURIComponent(
          `Olá ${o.cliente_nome},\n\nSegue sua proposta comercial de energia solar fotovoltaica:\n\n` +
          `• Sistema: ${kwp}\n• Investimento: ${valor}\n• Local: ${local}\n\n` +
          (o.pdf_url ? `Acesse sua proposta completa em PDF:\n${o.pdf_url}\n\n` : '') +
          `Qualquer dúvida estamos à disposição.\n\nAtenciosamente.`
        );
        const mailtoUrl = `mailto:${emailCliente}?subject=${assunto}&body=${corpoEmail}`;
        const btnEmail = `<a href="${mailtoUrl}"
             class="flex items-center gap-1 px-3 py-2 rounded-lg bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 text-xs font-bold transition-all">
             📧 E-mail
           </a>`;

        // Botão WhatsApp
        const telLimpo = tel.replace(/\D/g, '');
        const msgWpp = encodeURIComponent(
          `Olá ${o.cliente_nome}! ☀️\n\nSegue sua proposta de energia solar:\n\n` +
          `⚡ Sistema: ${kwp}\n💰 Investimento: ${valor}\n📍 Local: ${local}\n\n` +
          (o.pdf_url ? `📄 Proposta completa em PDF:\n${o.pdf_url}\n\n` : '') +
          `Qualquer dúvida estou à disposição!`
        );
        const wppUrl = telLimpo
          ? `https://wa.me/55${telLimpo}?text=${msgWpp}`
          : `https://wa.me/?text=${msgWpp}`;
        const btnWpp = `<a href="${wppUrl}" target="_blank"
             class="flex items-center gap-1 px-3 py-2 rounded-lg bg-green-500/10 hover:bg-green-500/20 text-green-400 text-xs font-bold transition-all">
             💬 WhatsApp
           </a>`;

        // Botão download PDF (secundário, só ícone)
        const btnDownload = o.pdf_url
          ? `<a href="${o.pdf_url}" target="_blank" title="Baixar PDF"
               class="px-3 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 text-xs font-bold transition-all">
               📄 PDF
             </a>`
          : '';

        // Botão Gerar PDF
        const btnPdf = o.pdf_url
          ? `<a href="${o.pdf_url}" target="_blank" class="flex items-center gap-1 px-3 py-2 rounded-lg bg-yellow-500/10 hover:bg-yellow-500/20 text-yellow-400 text-xs font-bold transition-all">📄 PDF</a>`
          : `<button data-gerar="${o.id}" class="flex items-center gap-1 px-3 py-2 rounded-lg bg-yellow-500/10 hover:bg-yellow-500/20 text-yellow-400 text-xs font-bold transition-all">📄 Gerar PDF</button>`;

        return `
          <div class="border border-white/5 rounded-xl p-5 hover:bg-white/5 transition-all" data-id="${o.id}">
            <div class="flex items-start justify-between gap-4 flex-wrap">
              <div class="flex-1">
                <div class="flex items-center gap-3 mb-2">
                  <span class="text-xs text-slate-500">${data} às ${hora}</span>
                  <span class="text-xs px-2 py-0.5 rounded-full bg-yellow-500/10 text-yellow-400 font-bold">${kwp}</span>
                </div>
                <p class="font-bold text-white text-lg">${o.cliente_nome || '–'}</p>
                <p class="text-slate-400 text-sm">${local}</p>
              </div>
              <div class="text-right">
                <p class="text-xs text-slate-500 mb-1">Valor Total</p>
                <p class="text-2xl font-bold text-green-400">${valor}</p>
              </div>
            </div>
            <div class="flex items-center gap-2 mt-4 pt-4 border-t border-white/5 flex-wrap">
              ${btnPdf}
              ${btnEmail}
              ${btnWpp}
              ${btnDownload}
              <button data-del="${o.id}"
                class="flex items-center gap-1 px-3 py-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 text-xs font-bold transition-all ml-auto">
                🗑️ Excluir
              </button>
            </div>
          </div>`;
      }).join('');

      container.querySelectorAll('[data-del]').forEach(btn => {
        btn.addEventListener('click', async (e) => {
          if (!confirm('Excluir esta proposta?')) return;
          const id = e.currentTarget.dataset.del;
          try {
            await Data.deleteOrcamento(id);
            UI.renderOrcamentos();
          } catch(err) {
            alert('Erro ao excluir: ' + err.message);
          }
        });
      });

      container.querySelectorAll('[data-gerar]').forEach(btn => {
        btn.addEventListener('click', async (e) => {
          const id = e.currentTarget.dataset.gerar;
          const { gerarPDFDeOrcamento } = await import('./pdf.js');
          gerarPDFDeOrcamento(id);
        });
      });

    } catch(e) {
      console.error(e);
      document.getElementById('lista-orca').innerHTML =
        `<div class="py-8 text-center text-red-500">Erro ao carregar orçamentos.</div>`;
    }
  }
};
