// client/js/dashboard.js
// Handles dashboard, crop recommendations, hover UI, and selection

// Utility functions
const getAuthToken = () => localStorage.getItem('farmerToken');
const clearAuthToken = () => localStorage.removeItem('farmerToken');
const clearFarmerData = () => localStorage.removeItem('farmerData');

const redirectToLogin = () => { window.location.href = 'login.html'; };

// API request helper
const apiRequest = async (url, options = {}) => {
  const token = getAuthToken();
  const headers = { 'Content-Type': 'application/json', ...(options.headers || {}) };
  if (token) headers.Authorization = `Bearer ${token}`;
  const response = await fetch(url, { ...options, headers });
  const data = await response.json();
  return { ok: response.ok, data };
};

// Logout handler
const logoutBtn = document.getElementById('logout-btn');
if (logoutBtn) {
  logoutBtn.addEventListener('click', () => {
    clearAuthToken();
    clearFarmerData();
    redirectToLogin();
  });
}

// Load farmer profile on page load
const loadProfile = async () => {
  const { ok, data } = await apiRequest('/api/dashboard/profile');
  if (!ok) {
    clearAuthToken();
    clearFarmerData();
    return redirectToLogin();
  }

  // Update profile display
  document.getElementById('disp-name').textContent = data.name || 'Farmer';
  document.getElementById('disp-email').textContent = data.email || 'No email';
  document.getElementById('disp-crop').textContent = data.selected_crop || 'Not selected';
  document.getElementById('disp-land').textContent = data.land_acres ? `${data.land_acres} acres` : 'Not set';
};

// Get crop recommendations button
const getRecommendationsBtn = document.getElementById('get-recommendations-btn');
if (getRecommendationsBtn) {
  getRecommendationsBtn.addEventListener('click', () => {
    showCropCards();
  });
}

// Show crop cards with hover interaction
const showCropCards = () => {
  const crops = ['Wheat', 'Rice', 'Maize'];
  const container = document.getElementById('crop-cards');
  container.innerHTML = '';

  crops.forEach((crop) => {
    const card = document.createElement('div');
    card.className = 'rec-card';
    card.style.position = 'relative';
    card.style.padding = '18px';
    card.style.cursor = 'pointer';
    card.style.transition = 'transform .2s';
    card.addEventListener('mouseenter', () => card.style.transform = 'translateY(-3px)');
    card.addEventListener('mouseleave', () => card.style.transform = 'translateY(0)');

    const title = document.createElement('div');
    title.className = 'rec-crop-name';
    title.textContent = crop;
    card.appendChild(title);

    const hint = document.createElement('div');
    hint.style.marginTop = '10px';
    hint.style.color = 'var(--text-muted)';
    hint.style.fontSize = '.84rem';
    hint.textContent = 'Hover to select this crop';
    card.appendChild(hint);

    const selectBtn = document.createElement('button');
    selectBtn.className = 'btn primary';
    selectBtn.type = 'button';
    selectBtn.textContent = 'Select Crop';
    selectBtn.style.marginTop = '14px';
    selectBtn.style.display = 'none';
    selectBtn.addEventListener('click', () => selectCrop(crop, card));
    card.appendChild(selectBtn);

    card.addEventListener('mouseenter', () => { selectBtn.style.display = 'inline-flex'; });
    card.addEventListener('mouseleave', () => { selectBtn.style.display = 'none'; });

    container.appendChild(card);
  });

  container.style.display = 'grid';
};

// Handle crop selection
const selectCrop = (cropName, card) => {
  // Remove existing form if any
  const existingForm = card.querySelector('.crop-selection-form');
  if (existingForm) return;

  const form = document.createElement('form');
  form.className = 'crop-selection-form';
  form.style.marginTop = '16px';
  form.innerHTML = `
    <div class="form-field" style="margin-bottom:12px;">
      <label>Enter land in acres</label>
      <input type="number" min="0.1" step="0.1" name="land_acres" placeholder="e.g. 15.5" required>
    </div>
    <button type="submit" class="btn secondary">Save</button>
  `;
  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    const input = form.querySelector('input[name="land_acres"]');
    const landAcres = input?.value;
    if (!landAcres || parseFloat(landAcres) <= 0) {
      alert('Enter a valid land area in acres.');
      return;
    }
    await saveCropSelection(cropName, landAcres);
  });

  card.appendChild(form);
};

// Save crop selection to backend
const saveCropSelection = async (crop, acres) => {
  const { ok, data } = await apiRequest('/api/dashboard/select-crop', {
    method: 'POST',
    body: JSON.stringify({ selected_crop: crop, land_acres: acres }),
  });

  if (!ok) {
    alert(data.message || 'Unable to save crop selection.');
    return;
  }

  // Update profile instantly
  loadProfile();

  // Show success message
  alert('Crop selected successfully!');

  // Hide crop cards
  document.getElementById('crop-cards').style.display = 'none';
};

// Check authentication on page load
if (!getAuthToken()) {
  redirectToLogin();
} else {
  loadProfile();
}

// Hamburger menu
const hamburger = document.getElementById('hamburger');
const mainNav = document.getElementById('main-nav');
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