const getAuthToken = () => localStorage.getItem('agrimitraToken');
const redirectToLogin = () => { window.location.href = 'login.html'; };

const apiRequest = async (url, options = {}) => {
  const headers = { 'Content-Type': 'application/json', ...(options.headers || {}) };
  const token = getAuthToken();
  if (token) headers.Authorization = `Bearer ${token}`;

  const response = await fetch(url, { ...options, headers });
  const data = await response.json();
  return { ok: response.ok, status: response.status, data };
};

const scoreParam = (value, min, max) => {
  const numeric = Number(value);
  if (Number.isNaN(numeric)) return 1;
  if (numeric >= min && numeric <= max) return 3;
  const distance = Math.min(Math.abs(numeric - min), Math.abs(numeric - max));
  return Math.max(0, 3 - distance / 10);
};

const recommendCrops = (params) => {
  const crops = [
    { name: 'Wheat', emoji: '🌾' },
    { name: 'Rice', emoji: '🌾' },
    { name: 'Maize', emoji: '🌽' },
  ];

  return crops
    .map((crop) => {
      const score =
        scoreParam(params.temperature, 18, 32) +
        scoreParam(params.rainfall, crop.name === 'Rice' ? 100 : 50, crop.name === 'Wheat' ? 100 : 120) +
        scoreParam(params.ph, 5.5, 7) +
        scoreParam(params.humidity, 50, 90);

      return {
        ...crop,
        score,
        match: Math.min(99, Math.round(50 + score * 6)),
      };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, 3);
};

const renderCropRecommendations = (crops) => {
  const container = document.getElementById('recommendation-output');
  if (!container) return;

  container.innerHTML = `
    <div class="rec-panel">
      <div class="rec-panel-header">
        <div>
          <div class="section-label">Recommendation Result</div>
          <h2>Recommended Crops</h2>
          <p>Select a crop and assign it to your fields.</p>
        </div>
      </div>
      <div class="rec-grid" id="recommendation-cards"></div>
      <div id="crop-selection-area"></div>
    </div>
  `;

  const cardsContainer = document.getElementById('recommendation-cards');
  crops.forEach((crop) => {
    const card = document.createElement('div');
    card.className = 'rec-card';
    card.innerHTML = `
      <div class="rec-card-header">
        <div class="rec-crop-name">${crop.emoji} ${crop.name}</div>
        <span class="rec-badge">${crop.match}% Match</span>
      </div>
      <p class="rec-meta">A quick crop suggestion based on soil and weather inputs.</p>
      <button class="btn secondary select-crop-btn" data-crop="${crop.name}">Select Crop</button>
    `;
    cardsContainer.appendChild(card);
  });

  cardsContainer.querySelectorAll('.select-crop-btn').forEach((button) => {
    button.addEventListener('click', () => showFieldSelection(button.dataset.crop));
  });
};

const showMessage = (message, containerId = 'recommendation-output') => {
  const container = document.getElementById(containerId);
  if (!container) return;
  container.innerHTML = `<div class="alert-message">${message}</div>`;
};

const showFieldSelection = async (cropName) => {
  const token = getAuthToken();
  if (!token) {
    if (confirm('You need to login to assign crops. Go to login page?')) {
      return redirectToLogin();
    }
    return;
  }

  const { ok, data } = await apiRequest('/api/fields');
  if (!ok) {
    return showMessage(data.message || 'Unable to load your fields.');
  }

  renderFieldSelection(cropName, data.fields);
};

const renderFieldSelection = (cropName, fields) => {
  const area = document.getElementById('crop-selection-area');
  if (!area) return;

  const fieldRows = fields.length
    ? fields
        .map(
          (field) => `
            <label class="field-checkbox">
              <input type="checkbox" name="fieldId" value="${field.FieldID}">
              <span>${field.FieldName} — ${field.Area} acres</span>
            </label>
          `
        )
        .join('')
    : '<p class="field-empty">No saved fields found. Add a new field to assign this crop.</p>';

  area.innerHTML = `
    <div class="selection-panel">
      <div class="selection-header">
        <h3>Assign Fields for ${cropName}</h3>
        <p>Select one or multiple fields below.</p>
      </div>
      <div class="fields-list">${fieldRows}</div>
      <div class="selection-actions">
        <button class="btn primary" id="save-assignment-btn">Assign ${cropName}</button>
      </div>
      <div class="border-divider"></div>
      <div class="new-field-card">
        <h4>Add New Field</h4>
        <form id="new-field-form" class="field-form">
          <div class="form-field">
            <label for="field-name">Field Name</label>
            <input id="field-name" type="text" required placeholder="Field A">
          </div>
          <div class="form-field">
            <label for="field-area">Area (acres)</label>
            <input id="field-area" type="number" min="0.1" step="0.1" required placeholder="e.g. 2.5">
          </div>
          <button class="btn secondary" type="submit">Add Field</button>
        </form>
      </div>
    </div>
  `;

  const saveButton = document.getElementById('save-assignment-btn');
  if (saveButton) {
    saveButton.addEventListener('click', () => {
      const checkedFields = Array.from(document.querySelectorAll('input[name="fieldId"]:checked')).map((input) => Number(input.value));
      if (checkedFields.length === 0) {
        return showMessage('Please select at least one field.', 'crop-selection-area');
      }
      assignCrop(cropName, checkedFields);
    });
  }

  const fieldForm = document.getElementById('new-field-form');
  if (fieldForm) {
    fieldForm.addEventListener('submit', async (event) => {
      event.preventDefault();
      const fieldName = document.getElementById('field-name')?.value.trim();
      const fieldArea = document.getElementById('field-area')?.value;
      if (!fieldName || !fieldArea || parseFloat(fieldArea) <= 0) {
        return showMessage('Please enter a valid field name and area.', 'crop-selection-area');
      }
      const { ok, data } = await apiRequest('/api/fields', {
        method: 'POST',
        body: JSON.stringify({ fieldName, area: parseFloat(fieldArea) }),
      });
      if (!ok) {
        return showMessage(data.message || 'Unable to add field.', 'crop-selection-area');
      }
      showFieldSelection(cropName);
    });
  }
};

const assignCrop = async (cropName, fieldIds, forceReplace = false) => {
  const { ok, status, data } = await apiRequest('/api/assign-crop', {
    method: 'POST',
    body: JSON.stringify({ cropName, fieldIds, forceReplace }),
  });

  if (ok) {
    alert('Crop assignments saved successfully.');
    window.location.href = 'dashboard.html';
    return;
  }

  if (status === 409 && data.conflicts) {
    const fieldNames = data.conflicts.map((item) => item.FieldID).join(', ');
    const confirmReplace = confirm(
      `This field already has an active assignment: ${fieldNames}.\nSelect Replace Existing Crop to complete the previous assignment and assign the new crop.`
    );
    if (confirmReplace) {
      return assignCrop(cropName, fieldIds, true);
    }
  }

  showMessage(data.message || 'Unable to assign crop.');
};

const handleRecommendation = async () => {
  const params = {
    nitrogen: document.getElementById('nitrogen')?.value,
    phosphorus: document.getElementById('phosphorus')?.value,
    potassium: document.getElementById('potassium')?.value,
    ph: document.getElementById('ph')?.value,
    humidity: document.getElementById('humidity')?.value,
    rainfall: document.getElementById('rainfall')?.value,
    temperature: document.getElementById('temperature')?.value,
  };

  const crops = recommendCrops(params);
  renderCropRecommendations(crops);

  if (getAuthToken()) {
    await apiRequest('/api/recommendations', {
      method: 'POST',
      body: JSON.stringify(params),
    });
  }
};

window.addEventListener('DOMContentLoaded', () => {
  const recButton = document.getElementById('get-recommendation');
  if (recButton) {
    recButton.addEventListener('click', handleRecommendation);
  }
});