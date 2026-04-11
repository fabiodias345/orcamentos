import './style.css';
import { Data } from './data.js';
import { Router } from './ui.js';

// Setup de Listeners para a tela de Auth
function setupAuthListeners() {
  const btnLogin = document.getElementById('btn-login');
  const btnSignup = document.getElementById('btn-signup');
  const linkToSignup = document.getElementById('link-to-signup');
  const linkToLogin = document.getElementById('link-to-login');

  if(btnLogin) {
    btnLogin.addEventListener('click', async () => {
      const msg = document.getElementById('auth-message');
      msg.classList.remove('hidden');
      msg.className = 'mt-4 p-3 rounded-lg text-sm text-center bg-slate-800 text-slate-300';
      msg.innerText = 'Autenticando...';
      
      const email = document.getElementById('login-email').value;
      const pass = document.getElementById('login-pass').value;

      try {
        await Data.login(email, pass);
        window.location.reload(); // Recarrega para iniciar a sessão na Home
      } catch (e) {
        msg.className = 'mt-4 p-3 rounded-lg text-sm text-center bg-red-900/50 text-red-400';
        msg.innerText = 'Erro: ' + e.message;
      }
    });
  }

  if(btnSignup) {
    btnSignup.addEventListener('click', async () => {
      const msg = document.getElementById('auth-message');
      msg.classList.remove('hidden');
      msg.className = 'mt-4 p-3 rounded-lg text-sm text-center bg-slate-800 text-slate-300';
      msg.innerText = 'Criando conta...';
      
      const email = document.getElementById('signup-email').value;
      const pass = document.getElementById('signup-pass').value;

      try {
        await Data.signup(email, pass);
        window.location.reload();
      } catch (e) {
        msg.className = 'mt-4 p-3 rounded-lg text-sm text-center bg-red-900/50 text-red-400';
        msg.innerText = 'Erro: ' + e.message;
      }
    });
  }

  if(linkToSignup) {
    linkToSignup.addEventListener('click', (e) => {
      e.preventDefault();
      document.getElementById('auth-login-box').classList.add('hidden');
      document.getElementById('auth-signup-box').classList.remove('hidden');
    });
  }

  if(linkToLogin) {
    linkToLogin.addEventListener('click', (e) => {
      e.preventDefault();
      document.getElementById('auth-signup-box').classList.add('hidden');
      document.getElementById('auth-login-box').classList.remove('hidden');
    });
  }
}

async function initApp() {
  const isLogged = await Data.checkSession();
  
  if (isLogged) {
    Router.render('dashboard');
  } else {
    Router.render('auth');
    setupAuthListeners();
  }
}

window.addEventListener('load', initApp);
