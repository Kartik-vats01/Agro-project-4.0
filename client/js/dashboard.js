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

const renderProfile = (profile) => {
  const profileContainer = document.getElementById('profile-content');
  if (!profileContainer) return;

  profileContainer.innerHTML = `
    <div class="profile-block">
      <div class="profile-row"><strong>Name:</strong> ${profile.fullName || 'Farmer'}</div>
      <div class="profile-row"><strong>Email:</strong> ${profile.email || 'Not provided'}</div>
      <div class="profile-row"><strong>Registered:</strong> ${profile.createdAt ? new Date(profile.createdAt).toLocaleDateString() : 'Not available'}</div>
    </div>
  `;
};

const renderAssignments = (assignments) => {
  const container = document.getElementById('active-assignments');
  if (!container) return;

  if (!assignments.length) {
    container.innerHTML = '<p>No active crop assignments yet. Visit Home to create new field assignments.</p>';
    return;
  }

  const rows = assignments
    .map(
      (assignment) => `
        <tr>
          <td>${assignment.CropName}</td>
          <td>${assignment.FieldName}</td>
          <td>${assignment.Area ?? '—'}</td>
          <td>${new Date(assignment.AssignedAt).toLocaleDateString()}</td>
          <td>${assignment.Status || 'Active'}</td>
        </tr>
      `
    )
    .join('');

  container.innerHTML = `
    <div class="table-wrap">
      <table>
        <thead>
          <tr>
            <th>Crop</th>
            <th>Field</th>
            <th>Area</th>
            <th>Assigned</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>
    </div>
  `;
};

const renderHistory = (history) => {
  const container = document.getElementById('assignment-history');
  if (!container) return;

  if (!history.length) {
    container.innerHTML = '<p>No assignment history yet. Assign crops from Home to build history.</p>';
    return;
  }

  const rows = history
    .map(
      (item) => `
        <tr>
          <td>${item.CropName}</td>
          <td>${item.FieldName}</td>
          <td>${item.Area ?? '—'}</td>
          <td>${new Date(item.AssignedAt).toLocaleDateString()}</td>
          <td>${item.Status || 'Completed'}</td>
        </tr>
      `
    )
    .join('');

  container.innerHTML = `
    <div class="table-wrap">
      <table>
        <thead>
          <tr>
            <th>Crop</th>
            <th>Field</th>
            <th>Area</th>
            <th>Assigned</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>
    </div>
  `;
};

const loadDashboard = async () => {
  const dashboardResponse = await apiRequest('/api/dashboard');
  if (!dashboardResponse.ok) {
    return redirectToLogin();
  }

  const { profile, activeAssignments } = dashboardResponse.data;
  renderProfile(profile || {});
  renderAssignments(activeAssignments || []);

  const historyResponse = await apiRequest('/api/crop-history');
  if (historyResponse.ok) {
    renderHistory(historyResponse.data.history || []);
  } else {
    document.getElementById('assignment-history').innerHTML = '<p>Unable to load assignment history.</p>';
  }
};

const logoutBtn = document.getElementById('logout-btn');
if (logoutBtn) {
  logoutBtn.addEventListener('click', () => {
    localStorage.removeItem('agrimitraToken');
    redirectToLogin();
  });
}

window.addEventListener('DOMContentLoaded', () => {
  if (!getAuthToken()) return redirectToLogin();
  loadDashboard();
});
