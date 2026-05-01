// client/js/auth.js
// Handles login and register API calls

// ── Token key — must match script.js and dashboard.js ──
const getAuthToken  = () => localStorage.getItem('agrimitraToken');
const setAuthToken  = (t) => localStorage.setItem('agrimitraToken', t);
const clearAuthToken = () => localStorage.removeItem('agrimitraToken');

const showAuthMessage = (message, type = 'error') => {
  const msg = document.getElementById('auth-message');
  if (!msg) return;
  msg.style.display = 'block';
  msg.textContent   = message;
  if (type === 'success') {
    msg.style.background = 'rgba(74,183,93,.12)';
    msg.style.color      = 'var(--accent)';
    msg.style.border     = '1px solid rgba(74,183,93,.25)';
  } else {
    msg.style.background = 'rgba(224,92,92,.12)';
    msg.style.color      = 'var(--danger)';
    msg.style.border     = '1px solid rgba(224,92,92,.25)';
  }
};

const clearAuthMessage = () => {
  const msg = document.getElementById('auth-message');
  if (msg) { msg.style.display = 'none'; msg.textContent = ''; }
};

const redirectToLogin     = () => { window.location.href = 'login.html'; };
const redirectToDashboard = () => { window.location.href = 'dashboard.html'; };

/* ── REGISTER ── */
const registerForm = document.getElementById('register-form');
if (registerForm) {
  registerForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    clearAuthMessage();

    const payload = {
      name:       document.getElementById('register-name')?.value.trim(),
      email:      document.getElementById('register-email')?.value.trim(),
      password:   document.getElementById('register-password')?.value,
      phone:      document.getElementById('register-phone')?.value.trim(),
      location:   document.getElementById('register-location')?.value.trim(),
      landArea:   document.getElementById('register-landArea')?.value.trim(),
      soilType:   document.getElementById('register-soilType')?.value.trim(),
      soilPH:     document.getElementById('register-soilPH')?.value.trim(),
      irrigation: document.getElementById('register-irrigation')?.value.trim(),
    };

    if (Object.values(payload).some((v) => !v)) {
      return showAuthMessage('Please fill in all registration fields.');
    }

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await response.json();
      if (!response.ok) return showAuthMessage(data.message || 'Unable to register.');
      showAuthMessage('Registration complete! Redirecting to login…', 'success');
      setTimeout(() => redirectToLogin(), 1400);
    } catch {
      showAuthMessage('Unable to connect to server.');
    }
  });
}

/* ── LOGIN ── */
const loginForm = document.getElementById('login-form');
if (loginForm) {
  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    clearAuthMessage();

    const email    = document.getElementById('login-email')?.value.trim();
    const password = document.getElementById('login-password')?.value;

    if (!email || !password) return showAuthMessage('Email and password are required.');

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await response.json();
      if (!response.ok) return showAuthMessage(data.message || 'Unable to login.');

      setAuthToken(data.token);
      redirectToDashboard();
    } catch {
      showAuthMessage('Unable to connect to server.');
    }
  });
}

/* ── HAMBURGER ── */
const hamburger = document.getElementById('hamburger');
const mainNav   = document.getElementById('main-nav');
if (hamburger && mainNav) {
  hamburger.addEventListener('click', () => {
    const open = mainNav.classList.toggle('open');
    hamburger.setAttribute('aria-expanded', open);
    document.body.style.overflow = open ? 'hidden' : '';
  });
  mainNav.querySelectorAll('.nav-link').forEach((link) => {
    link.addEventListener('click', () => {
      mainNav.classList.remove('open');
      hamburger.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
    });
  });
}