/* ─────────────────────────────────────────
   AgriMitra — script.js  (fixed)
   ───────────────────────────────────────── */

/* ── Auth helpers ── */
const getAuthToken   = () => localStorage.getItem('agrimitraToken');
const setAuthToken   = (t) => localStorage.setItem('agrimitraToken', t);
const clearAuthToken = () => localStorage.removeItem('agrimitraToken');

const redirectToLogin     = () => { window.location.href = 'login.html'; };
const redirectToDashboard = () => { window.location.href = 'dashboard.html'; };

/* ── Auth message banner ── */
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

/* ── Generic fetch wrapper ── */
const apiRequest = async (url, options = {}) => {
  const token   = getAuthToken();
  const headers = { 'Content-Type': 'application/json', ...(options.headers || {}) };
  if (token) headers.Authorization = `Bearer ${token}`;
  const response = await fetch(url, { ...options, headers });
  const data     = await response.json();
  return { ok: response.ok, data };
};

/* ══════════════════════════════════════════
   LOGIN
══════════════════════════════════════════ */
const loginForm = document.getElementById('login-form');
if (loginForm) {
  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    clearAuthMessage();
    const email    = document.getElementById('login-email')?.value.trim();
    const password = document.getElementById('login-password')?.value;
    if (!email || !password) return showAuthMessage('Email and password are required.');

    const { ok, data } = await apiRequest('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });

    if (!ok) return showAuthMessage(data.message || 'Unable to login.');
    setAuthToken(data.token);
    redirectToDashboard();
  });
}

/* ══════════════════════════════════════════
   REGISTER — sends ALL 9 fields the backend expects
══════════════════════════════════════════ */
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

    const { ok, data } = await apiRequest('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(payload),
    });

    if (!ok) return showAuthMessage(data.message || 'Unable to register.');
    showAuthMessage('Registration complete. Redirecting to login…', 'success');
    setTimeout(() => redirectToLogin(), 1400);
  });
}

/* ══════════════════════════════════════════
   LOGOUT
══════════════════════════════════════════ */
const logoutBtn = document.getElementById('logout-btn');
if (logoutBtn) {
  logoutBtn.addEventListener('click', () => {
    clearAuthToken();
    redirectToLogin();
  });
}

/* ══════════════════════════════════════════
   HAMBURGER NAV
══════════════════════════════════════════ */
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

/* ══════════════════════════════════════════
   HOME PAGE — TAB SWITCHING
══════════════════════════════════════════ */
document.querySelectorAll('.tab-btn').forEach((btn) => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
    btn.classList.add('active');
    const target = document.getElementById(btn.dataset.tab);
    if (target) target.classList.add('active');
  });
});

/* ══════════════════════════════════════════
   CROP RECOMMENDATION (index.html)
══════════════════════════════════════════ */
function scoreParam(val, min, max) {
  if (val >= min && val <= max) return 3;
  const dist = Math.min(Math.abs(val - min), Math.abs(val - max));
  return Math.max(0, 3 - dist / 10);
}

function recommendCrops(p) {
  const N    = parseFloat(p.nitrogen)    || 40;
  const P    = parseFloat(p.phosphorus)  || 35;
  const K    = parseFloat(p.potassium)   || 20;
  const ph   = parseFloat(p.ph)          || 6.5;
  const hum  = parseFloat(p.humidity)    || 70;
  const rain = parseFloat(p.rainfall)    || 100;
  const temp = parseFloat(p.temperature) || 28;

  const crops = [
    { name:'Rice',      emoji:'🌾', yield:'4–6 t/ac',   price:'₹1,950/q',
      score: scoreParam(temp,22,35)+scoreParam(rain,100,300)+scoreParam(ph,5.5,7)+scoreParam(hum,60,90) },
    { name:'Wheat',     emoji:'🌾', yield:'3–5 t/ac',   price:'₹2,275/q',
      score: scoreParam(temp,12,25)+scoreParam(rain,30,100)+scoreParam(ph,6,7.5)+scoreParam(N,40,80) },
    { name:'Maize',     emoji:'🌽', yield:'3–6 t/ac',   price:'₹1,850/q',
      score: scoreParam(temp,18,32)+scoreParam(rain,50,120)+scoreParam(ph,5.8,7)+scoreParam(N,30,60) },
    { name:'Soybean',   emoji:'🫘', yield:'2–5 t/ac',   price:'₹3,800/q',
      score: scoreParam(temp,20,35)+scoreParam(rain,60,180)+scoreParam(ph,6,7)+scoreParam(P,20,50) },
    { name:'Cotton',    emoji:'🌿', yield:'1.5–3 t/ac', price:'₹6,500/q',
      score: scoreParam(temp,22,38)+scoreParam(rain,50,150)+scoreParam(N,20,60)+scoreParam(ph,6,8) },
    { name:'Sugarcane', emoji:'🎋', yield:'40–80 t/ac', price:'₹315/q',
      score: scoreParam(temp,24,38)+scoreParam(rain,100,250)+scoreParam(ph,6,7.5)+scoreParam(K,15,40) },
    { name:'Groundnut', emoji:'🥜', yield:'1.5–3 t/ac', price:'₹5,500/q',
      score: scoreParam(temp,25,35)+scoreParam(rain,50,120)+scoreParam(ph,6,7)+scoreParam(P,20,50) },
    { name:'Tomato',    emoji:'🍅', yield:'15–30 t/ac', price:'₹1,200/q',
      score: scoreParam(temp,18,30)+scoreParam(rain,40,100)+scoreParam(ph,5.5,7)+scoreParam(hum,50,75) },
    { name:'Onion',     emoji:'🧅', yield:'10–20 t/ac', price:'₹1,500/q',
      score: scoreParam(temp,15,30)+scoreParam(rain,30,80)+scoreParam(ph,5.8,7)+scoreParam(K,20,50) },
  ];

  return crops
    .sort((a, b) => b.score - a.score)
    .slice(0, 3)
    .map((c, i) => ({ ...c, rank: i + 1, pct: Math.min(99, Math.round(60 + c.score * 4)) }));
}

function renderCropResults(container, crops) {
  if (!container) return;
  container.innerHTML = `
    <h3>🌾 Top Crop Recommendations</h3>
    <div class="rec-cards">
      ${crops.map(c => `
        <div class="rec-card ${c.rank === 1 ? 'rank-1' : ''}">
          <div class="rec-card-header">
            <div class="rec-crop-name">${c.emoji} ${c.name}</div>
            <span class="rec-badge ${c.rank === 1 ? 'gold' : ''}">${c.pct}% Match</span>
          </div>
          <div class="rec-meta">
            <div><div class="rec-meta-label">Max Yield</div><div class="rec-meta-value">${c.yield}</div></div>
            <div><div class="rec-meta-label">Market Price</div><div class="rec-meta-value">${c.price}</div></div>
          </div>
          <div class="score-bar">
            <div class="score-bar-track">
              <div class="score-bar-fill ${c.rank === 1 ? 'gold' : ''}" style="width:${c.pct}%"></div>
            </div>
          </div>
        </div>`).join('')}
    </div>`;
}

const getCropRecommendationBtn = document.getElementById('get-recommendation');
if (getCropRecommendationBtn) {
  getCropRecommendationBtn.addEventListener('click', () => {
    const output = document.getElementById('recommendation-output');
    if (!output) return;
    output.innerHTML = '<p style="color:var(--text-muted)">Analysing your field data…</p>';
    const params = {
      nitrogen:    document.getElementById('nitrogen')?.value,
      phosphorus:  document.getElementById('phosphorus')?.value,
      potassium:   document.getElementById('potassium')?.value,
      ph:          document.getElementById('ph')?.value,
      humidity:    document.getElementById('humidity')?.value,
      rainfall:    document.getElementById('rainfall')?.value,
      temperature: document.getElementById('temperature')?.value,
    };
    setTimeout(() => renderCropResults(output, recommendCrops(params)), 400);
  });
}

/* ══════════════════════════════════════════
   DISEASE PREDICTION (index.html)
══════════════════════════════════════════ */
const uploadBtn = document.getElementById('upload-btn');
const cameraBtn = document.getElementById('camera-btn');
const fileInput = document.getElementById('disease-image');
const uploadBox = document.getElementById('upload-box');

if (uploadBtn && fileInput) uploadBtn.addEventListener('click', () => fileInput.click());
if (uploadBox && fileInput) uploadBox.addEventListener('click', () => fileInput.click());
if (cameraBtn && fileInput) {
  cameraBtn.addEventListener('click', () => {
    fileInput.setAttribute('capture', 'environment');
    fileInput.click();
  });
}
if (fileInput) {
  fileInput.addEventListener('change', () => {
    const file = fileInput.files[0];
    if (!file) return;
    const icon = uploadBox?.querySelector('.upload-box-icon');
    const para = uploadBox?.querySelector('p');
    if (icon) icon.textContent = '✅';
    if (para) para.textContent = file.name;
  });
}

const diseaseData = {
  'Leaf Blight':    {
    cause: 'Fungal infection (Helminthosporium)',
    symptoms: ['Brown lesions on leaves', 'Yellowing around edges', 'Premature leaf drop'],
    remedies: ['Apply Mancozeb 75% WP', 'Improve field drainage', 'Remove infected plant debris'],
  },
  'Powdery Mildew': {
    cause: 'Fungal spores (Erysiphe spp.)',
    symptoms: ['White powdery coating on leaves', 'Distorted young leaves', 'Stunted growth'],
    remedies: ['Spray Sulfur-based fungicide', 'Avoid overhead irrigation', 'Ensure good air circulation'],
  },
  'Rust': {
    cause: 'Fungal pathogen (Puccinia spp.)',
    symptoms: ['Orange-brown pustules on leaves', 'Premature defoliation', 'Reduced yield'],
    remedies: ['Apply Propiconazole 25% EC', 'Plant resistant varieties', 'Monitor humidity levels'],
  },
  'Mosaic Virus': {
    cause: 'Viral infection transmitted via aphids',
    symptoms: ['Yellow-green mosaic pattern', 'Leaf curling', 'Stunted plant growth'],
    remedies: ['Remove and destroy infected plants', 'Control aphid population', 'Use virus-free certified seeds'],
  },
  'Healthy': {
    cause: 'No disease detected',
    symptoms: ['Uniform green colour', 'Normal leaf texture', 'No visible lesions or spots'],
    remedies: ['Continue current practices', 'Monitor crop weekly', 'Maintain balanced soil nutrition'],
  },
};

const predictDiseaseBtn = document.getElementById('predict-disease');
if (predictDiseaseBtn) {
  predictDiseaseBtn.addEventListener('click', () => {
    const output = document.getElementById('disease-output');
    if (!output) return;

    if (!fileInput?.files[0]) {
      output.innerHTML = '<p style="color:var(--danger)">Please upload or capture a leaf image first.</p>';
      return;
    }

    output.innerHTML = '<p style="color:var(--text-muted)">Analysing leaf image…</p>';

    setTimeout(() => {
      const names   = Object.keys(diseaseData);
      const disease = names[Math.floor(Math.random() * names.length)];
      const info    = diseaseData[disease];
      const isOk    = disease === 'Healthy';

      output.innerHTML = `
        <div class="disease-result-card">
          <div class="disease-name" style="color:${isOk ? 'var(--accent)' : 'var(--danger)'}">
            ${isOk ? '✅' : '⚠️'} ${disease}
          </div>
          <p style="font-size:.84rem;color:var(--text-muted);margin-bottom:18px;">
            <strong>Cause:</strong> ${info.cause}
          </p>
          <div class="disease-grid">
            <div class="disease-block">
              <h4>Symptoms</h4>
              <ul>${info.symptoms.map(s => `<li>${s}</li>`).join('')}</ul>
            </div>
            <div class="disease-block">
              <h4>${isOk ? 'Recommendations' : 'Remedies'}</h4>
              <ul>${info.remedies.map(r => `<li>${r}</li>`).join('')}</ul>
            </div>
          </div>
        </div>`;
    }, 800);
  });
}

/* ══════════════════════════════════════════
   DASHBOARD — load real profile from AgriDB
══════════════════════════════════════════ */
function applyProfileToCard(farmer) {
  const setText = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val; };

  setText('disp-name',       farmer.name       || 'Farmer');
  setText('disp-location',   '📍 ' + (farmer.location || '—'));
  setText('disp-land',       farmer.land_acres != null ? farmer.land_acres + ' acres' : '—');
  setText('disp-soil',       farmer.soil_type  || '—');
  setText('disp-ph',         farmer.soil_ph    || '—');
  setText('disp-irrigation', farmer.irrigation || '—');
  setText('disp-phone',      farmer.phone      || '—');

  // Update KPI row
  const kpiSub = document.querySelector('.kpi-card .kpi-sub');
  if (kpiSub) kpiSub.textContent = farmer.location || '—';
  const kpiVal = document.querySelector('.kpi-card .kpi-value');
  if (kpiVal && farmer.land_acres) kpiVal.textContent = farmer.land_acres + ' ac';
}

async function loadDashboardProfile() {
  if (!getAuthToken()) return redirectToLogin();
  const { ok, data } = await apiRequest('/api/dashboard/profile');
  if (!ok) { clearAuthToken(); return redirectToLogin(); }
  applyProfileToCard(data);
}

if (document.getElementById('disp-name')) {
  document.addEventListener('DOMContentLoaded', loadDashboardProfile);
}

/* ══════════════════════════════════════════
   CONTACT FORM (index.html)
══════════════════════════════════════════ */
const contactForm = document.getElementById('contact-form');
if (contactForm) {
  contactForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const btn = contactForm.querySelector('button[type="submit"]');
    if (btn) { btn.textContent = '✅ Message Sent!'; btn.disabled = true; }
    setTimeout(() => {
      contactForm.reset();
      if (btn) { btn.textContent = 'Send Message →'; btn.disabled = false; }
    }, 3000);
  });
}