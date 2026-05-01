// client/js/main.js
// Homepage logic for crop recommendations and selection

const getAuthToken = () => localStorage.getItem('farmerToken');

const showMessage = (message, type = 'error') => {
  const msg = document.getElementById('auth-message');
  if (!msg) return;
  msg.style.display = 'block';
  msg.textContent = message;
  if (type === 'success') {
    msg.style.background = 'rgba(74,183,93,.12)';
    msg.style.color = 'var(--accent)';
    msg.style.border = '1px solid rgba(74,183,93,.25)';
  } else {
    msg.style.background = 'rgba(224,92,92,.12)';
    msg.style.color = 'var(--danger)';
    msg.style.border = '1px solid rgba(224,92,92,.25)';
  }
};

const clearMessage = () => {
  const msg = document.getElementById('auth-message');
  if (msg) {
    msg.style.display = 'none';
    msg.textContent = '';
  }
};

// Select crop function
async function selectCrop(cropName) {
  clearMessage();
  
  const token = getAuthToken();
  
  if (!token) {
    // Not logged in - redirect to login
    if (confirm('You need to login to select a crop. Go to login page?')) {
      window.location.href = 'login.html';
    }
    return;
  }
  
  // User is logged in - ask for land acres
  const landAcres = prompt(`You selected ${cropName}. Enter your land acres:`);
  
  if (!landAcres || isNaN(parseFloat(landAcres)) || parseFloat(landAcres) <= 0) {
    showMessage('Please enter a valid land area.');
    return;
  }
  
  try {
    const response = await fetch('http://localhost:5000/api/dashboard/select-crop', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        selected_crop: cropName,
        land_acres: parseFloat(landAcres)
      }),
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      showMessage(data.message || 'Failed to save crop selection.');
      return;
    }
    
    alert(`Crop "${cropName}" saved successfully!`);
    window.location.href = 'dashboard.html';
    
  } catch (error) {
    showMessage('Unable to connect to server.');
    console.error('Error:', error);
  }
}