import './style.css';
import { Data } from './data.js';
import { Router } from './ui.js';
import { supabase } from './supabase.js';

// Setup de Listeners para a tela de Auth
function setupAuthListeners() {
  const btnLogin       = document.getElementById('btn-login');
  const btnSignup      = document.getElementById('btn-signup');
  const btnReset       = document.getElementById('btn-reset');
  const btnNewPass     = document.getElementById('btn-newpass');
  const linkToSignup   = document.getElementById('link-to-signup');
  const linkToLogin    = document.getElementById('link-to-login');
  const linkToReset    = document.getElementById('link-to-reset');
  const linkBackToLogin= document.getElementById('link-back-to-login');

  const ALL_BOXES = ['auth-login-box','auth-signup-box','auth-reset-box','auth-newpass-box'];

  function showBox(id) {
    ALL_BOXES.forEach(b => document.getElementById(b).classList.toggle('hidden', b !== id));
    document.getElementById('auth-message').classList.add('hidden');
  }

  function showMsg(text, type = 'error') {
    const msg = document.getElementById('auth-message');
    msg.classList.remove('hidden');
    msg.className = type === 'ok'
      ? 'mt-4 p-3 rounded-lg text-sm text-center bg-green-900/50 text-green-400'
      : type === 'info'
        ? 'mt-4 p-3 rounded-lg text-sm text-center bg-slate-800 text-slate-300'
        : 'mt-4 p-3 rounded-lg text-sm text-center bg-red-900/50 text-red-400';
    msg.innerText = text;
  }

  // ── Login ──
  btnLogin?.addEventListener('click', async () => {
    showMsg('Autenticando...', 'info');
    const email = document.getElementById('login-email').value;
    const pass  = document.getElementById('login-pass').value;
    try {
      await Data.login(email, pass);
      window.location.reload();
    } catch (e) {
      showMsg('Erro: ' + e.message);
    }
  });

  // ── Cadastro ──
  btnSignup?.addEventListener('click', async () => {
    showMsg('Criando conta...', 'info');
    const email = document.getElementById('signup-email').value;
    const pass  = document.getElementById('signup-pass').value;
    try {
      await Data.signup(email, pass);
      window.location.reload();
    } catch (e) {
      showMsg('Erro: ' + e.message);
    }
  });

  // ── Navegação entre boxes ──
  linkToSignup?.addEventListener('click',    (e) => { e.preventDefault(); showBox('auth-signup-box'); });
  linkToLogin?.addEventListener('click',     (e) => { e.preventDefault(); showBox('auth-login-box'); });
  linkToReset?.addEventListener('click',     (e) => { e.preventDefault(); showBox('auth-reset-box'); });
  linkBackToLogin?.addEventListener('click', (e) => { e.preventDefault(); showBox('auth-login-box'); });

  // ── Enviar e-mail de recuperação ──
  btnReset?.addEventListener('click', async () => {
    const email = document.getElementById('reset-email').value.trim();
    if (!email) { showMsg('Informe seu e-mail.'); return; }
    showMsg('Enviando...', 'info');
    try {
      await Data.resetPassword(email);
      showMsg('Link enviado! Verifique seu e-mail (pode estar no spam).', 'ok');
    } catch(e) {
      showMsg('Erro: ' + e.message);
    }
  });

  // ── Salvar nova senha ──
  btnNewPass?.addEventListener('click', async () => {
    const pass    = document.getElementById('newpass-input').value;
    const confirm = document.getElementById('newpass-confirm').value;
    if (!pass || pass.length < 6) { showMsg('A senha deve ter ao menos 6 caracteres.'); return; }
    if (pass !== confirm)          { showMsg('As senhas não coincidem.'); return; }
    showMsg('Salvando...', 'info');
    try {
      const { error } = await supabase.auth.updateUser({ password: pass });
      if (error) throw error;
      showMsg('Senha alterada com sucesso! Entrando...', 'ok');
      setTimeout(() => window.location.replace(window.location.origin), 1500);
    } catch(e) {
      showMsg('Erro: ' + e.message);
    }
  });

  // ── Detectar link expirado na URL ──
  const hash = new URLSearchParams(window.location.hash.replace('#', '?'));
  if (hash.get('error_code') === 'otp_expired') {
    showBox('auth-reset-box');
    showMsg('O link expirou. Solicite um novo abaixo.', 'error');
  }
}

async function initApp() {
  // Detectar retorno do link de recuperação de senha
  supabase.auth.onAuthStateChange((event) => {
    if (event === 'PASSWORD_RECOVERY') {
      Router.render('auth');
      // Pequeno delay para o DOM renderizar
      setTimeout(() => {
        const ALL_BOXES = ['auth-login-box','auth-signup-box','auth-reset-box','auth-newpass-box'];
        ALL_BOXES.forEach(b => document.getElementById(b)?.classList.toggle('hidden', b !== 'auth-newpass-box'));
        document.getElementById('auth-subtitle').innerText = 'Defina sua nova senha';
        setupAuthListeners();
      }, 100);
    }
  });

  const isLogged = await Data.checkSession();

  if (isLogged) {
    Router.render('dashboard');
  } else {
    Router.render('auth');
    setupAuthListeners();
  }
}

window.addEventListener('load', initApp);
