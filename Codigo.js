const SPREADSHEET_ID = '1jD4yWj_pWQeugCF2i_Jg6E_8aM6PRhYcoWRWybiAn30';
const FOLDER_PROPOSTAS_ID = '1DugtNoeSottYB50-6249Huh-6wsk3oXt';

function doGet() {
  return HtmlService.createTemplateFromFile('index')
      .evaluate()
      .setTitle('Solar PRO - Orçamentos')
      .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL)
      .addMetaTag('viewport', 'width=device-width, initial-scale=1');
}

/** 
 * Inclui arquivos HTML no shell principal
 */
function include(filename) {
  return HtmlService.createHtmlOutputFromFile(filename).getContent();
}

/**
 * Utilitário: Pega ou cria aba com colunas específicas
 */
function getSheet(name, headers = []) {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  let sheet = ss.getSheetByName(name);
  if (!sheet) {
    sheet = ss.insertSheet(name);
    if (headers.length > 0) sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  }
  return sheet;
}

// ==========================================
// SISTEMA DE AUTENTICAÇÃO E USUÁRIOS
// ==========================================

function login(usuario, senha) {
  if (usuario === 'admin' && senha === 'Gabi2010') {
    return { success: true, userId: 'ADMIN-MASTER', nome: 'Chefia' };
  }

  const sheet = getSheet('Usuarios', ['ID_Usuario', 'Usuario', 'Senha', 'Nome']);
  const data = sheet.getDataRange().getValues();
  for (let i = 1; i < data.length; i++) {
    if (data[i][1] === usuario && data[i][2] === senha) {
      return { success: true, userId: data[i][0], nome: data[i][3] };
    }
  }
  return { success: false, message: "Usuário ou senha inválidos." };
}

function signup(nome, usuario, senha) {
  const sheet = getSheet('Usuarios', ['ID_Usuario', 'Usuario', 'Senha', 'Nome']);
  const data = sheet.getDataRange().getValues();
  for (let i = 1; i < data.length; i++) {
    if (data[i][1] === usuario) return { success: false, message: "Este nome de usuário já existe." };
  }
  const userId = "USR-" + new Date().getTime();
  sheet.appendRow([userId, usuario, senha, nome]);
  return { success: true, userId: userId, nome: nome };
}

// ==========================================
// GESTÃO DE DADOS (ISOLADA POR USERID)
// ==========================================

function salvarEmpresa(userId, dados) {
  const headers = ['ID_Usuario', 'Nome', 'CNPJ', 'Telefone', 'Email', 'Endereco', 'URL_Logo'];
  const sheet = getSheet('Empresa', headers);
  const data = sheet.getDataRange().getValues();
  let rowIndex = -1;
  for (let i = 1; i < data.length; i++) {
    if (data[i][0] === userId) { rowIndex = i + 1; break; }
  }
  const rowData = [userId, dados.nome, dados.cnpj, dados.tel, dados.email, dados.end, dados.logo];
  if (rowIndex > -1) sheet.getRange(rowIndex, 1, 1, rowData.length).setValues([rowData]);
  else sheet.appendRow(rowData);
  return { success: true };
}

function buscarEmpresa(userId) {
  const sheet = getSheet('Empresa');
  const data = sheet.getDataRange().getValues();
  for (let i = 1; i < data.length; i++) {
    if (data[i][0] === userId) return { nome: data[i][1], cnpj: data[i][2], tel: data[i][3], email: data[i][4], end: data[i][5], logo: data[i][6] };
  }
  // Dados padrões fixos da empresa 
  return { 
    nome: 'ECCON ENGENHARIA E ASSESSORIA LTDA', 
    cnpj: '00.508.968/0001-23', 
    tel: '', 
    email: '', 
    end: 'Rua Gago Coutinho, 695, Londrina - PR, 86.039-170', 
    logo: '' 
  };
}

function salvarCliente(userId, dados) {
  const sheet = getSheet('Cliente', ['ID_Usuario', 'ID_Cliente', 'Nome', 'Telefone', 'CEP', 'Endereco', 'Email']);
  const idCliente = "CLI-" + new Date().getTime();
  sheet.appendRow([userId, idCliente, dados.nome, dados.tel, dados.cep, dados.end, dados.email || '']);
  return { success: true, id: idCliente };
}

function listarClientes(userId) {
  const sheet = getSheet('Cliente');
  if (sheet.getLastRow() < 2) return [];
  const data = sheet.getDataRange().getValues();
  return data.filter(r => r[0] === userId).map(r => ({ id: r[1], nome: r[2], tel: r[3], cep: r[4], end: r[5], email: r[6] || '' }));
}

function excluirCliente(userId, idCliente) {
  const sheet = getSheet('Cliente');
  const data = sheet.getDataRange().getValues();
  for (let i = 1; i < data.length; i++) {
    if (data[i][0] === userId && data[i][1] === idCliente) {
      sheet.deleteRow(i + 1);
      return { success: true };
    }
  }
  return { success: false, message: "Cliente não encontrado" };
}

function atualizarCliente(userId, idCliente, dados) {
  const sheet = getSheet('Cliente');
  const data = sheet.getDataRange().getValues();
  for (let i = 1; i < data.length; i++) {
    if (data[i][0] === userId && data[i][1] === idCliente) {
      sheet.getRange(i + 1, 3, 1, 5).setValues([[dados.nome, dados.tel, dados.cep, dados.end, dados.email || '']]);
      return { success: true };
    }
  }
  return { success: false, message: "Cliente não encontrado" };
}

function listarOrcamentos(userId) {
  const sheet = getSheet('Orcamentos');
  if (sheet.getLastRow() < 2) return [];
  const data = sheet.getDataRange().getValues();
  // Headers: ID_Usuario, ID_Orcamento, Data, Cliente, kWp, Valor, URL
  return data.filter(r => r[0] === userId).map(r => ({ id: r[1], data: r[2], cliente: r[3], kwp: r[4], valor: r[5], url: r[6] }));
}

// ==========================================
// CATÁLOGOS E DIMENSIONAMENTO
// ==========================================

function getCatalogos() {
  const mapData = (sheetName) => {
    let sheet = getSheet(sheetName);
    if(sheet.getLastRow() < 2) return [];
    let values = sheet.getDataRange().getValues();
    let colunas = values[0];
    let data = values.slice(1);
    return data.map(row => {
      let obj = {};
      colunas.forEach((col, idx) => obj[col] = row[idx]);
      return obj;
    });
  }
  
  return {
    modulos: mapData('Modulos'),
    inversores: mapData('Inversores'),
    hsp: mapData('Irradiacao'),
    financeiro: mapData('Parametros_Financeiros')[0] || {} // Pegamos a primeira linha de dados pro setup global
  };
}

// ==========================================
// GERAÇÃO DE PDF E PROPOSTA
// ==========================================

function gerarProposta(userId, orcamentoData) {
  try {
    const empresaInfo = buscarEmpresa(userId);
    
    // Injeta os dados da empresa e orçamento no HTML do template
    const template = HtmlService.createTemplateFromFile('PropostaTemplate');
    template.empresa = empresaInfo || {};
    template.orcamento = orcamentoData;
    
    const htmlOutput = template.evaluate().getContent();
    
    // Converte HTML para Blob / PDF (usando o gerador padrão do Google Drive)
    const blobHtml = Utilities.newBlob(htmlOutput, MimeType.HTML, "temp.html");
    const pdfBlob = blobHtml.getAs(MimeType.PDF).setName(`Proposta - ${orcamentoData.cliente.nome}.pdf`);
    
    // Tenta salvar na pasta global definida pelo usuário (se ele tiver permissão nela e ela estiver descompartilhada ok)
    let folder;
    try {
      folder = DriveApp.getFolderById(FOLDER_PROPOSTAS_ID);
    } catch(e) {
      // Fallback para a raiz se a pasta falhar (por não ser dono ou link corrompido)
      folder = DriveApp.getRootFolder();
    }
    
    const pdfFile = folder.createFile(pdfBlob);
    
    // Permissão pública para leitura
    pdfFile.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
    const pdfUrl = pdfFile.getUrl();
    
    // Salva o histórico na aba de orçamentos
    const sheet = getSheet('Orcamentos', ['ID_Usuario', 'ID_Orcamento', 'Data', 'Cliente', 'kWp', 'Investimento', 'Link_PDF']);
    const idOrcamento = "ORC-" + new Date().getTime();
    sheet.appendRow([
      userId, 
      idOrcamento, 
      new Date().toLocaleDateString('pt-BR'), 
      orcamentoData.cliente.nome, 
      orcamentoData.kwp, 
      orcamentoData.valor, 
      pdfUrl
    ]);
    
    return { success: true, url: pdfUrl };
    
  } catch (err) {
    return { success: false, message: "Erro ao gerar PDF: " + err.toString() };
  }
}
