const SPREADSHEET_ID = '1jD4yWj_pWQeugCF2i_Jg6E_8aM6PRhYcoWRWybiAn30';

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
  
  // Verifica se já existe
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

/**
 * Salva Dados da Empresa (Específico do Usuário)
 */
function salvarEmpresa(userId, dados) {
  const headers = ['ID_Usuario', 'Nome', 'CNPJ', 'Telefone', 'Email', 'Endereco', 'URL_Logo'];
  const sheet = getSheet('Empresa', headers);
  const data = sheet.getDataRange().getValues();
  
  let rowIndex = -1;
  for (let i = 1; i < data.length; i++) {
    if (data[i][0] === userId) { rowIndex = i + 1; break; }
  }
  
  const rowData = [userId, dados.nome, dados.cnpj, dados.tel, dados.email, dados.end, dados.logo];
  if (rowIndex > -1) {
    sheet.getRange(rowIndex, 1, 1, rowData.length).setValues([rowData]);
  } else {
    sheet.appendRow(rowData);
  }
  return { success: true };
}

function buscarEmpresa(userId) {
  const sheet = getSheet('Empresa');
  const data = sheet.getDataRange().getValues();
  for (let i = 1; i < data.length; i++) {
    if (data[i][0] === userId) {
      return { nome: data[i][1], cnpj: data[i][2], tel: data[i][3], email: data[i][4], end: data[i][5], logo: data[i][6] };
    }
  }
  return null;
}

/**
 * Salva e Busca Clientes
 */
function salvarCliente(userId, dados) {
  const sheet = getSheet('Cliente', ['ID_Usuario', 'ID_Cliente', 'Nome', 'Telefone', 'CEP', 'Endereco']);
  const idCliente = "CLI-" + new Date().getTime();
  sheet.appendRow([userId, idCliente, dados.nome, dados.tel, dados.cep, dados.end]);
  return { success: true, id: idCliente };
}

function listarClientes(userId) {
  const sheet = getSheet('Cliente');
  if (sheet.getLastRow() < 2) return [];
  const data = sheet.getDataRange().getValues();
  return data.filter(r => r[0] === userId).map(r => ({ id: r[1], nome: r[2], tel: r[3], cep: r[4], end: r[5] }));
}

/**
 * Busca Dados Globais (Catálogos)
 */
function getCatalogos() {
  const modulos = getSheet('Modulos').getDataRange().getValues().slice(1);
  const inversores = getSheet('Inversores').getDataRange().getValues().slice(1);
  const hsp = getSheet('Irradiacao').getDataRange().getValues().slice(1);
  const fin = getSheet('Parametros_Financeiros').getDataRange().getValues().slice(1);
  
  return { modulos, inversores, hsp, fin };
}
