// ========================================
// STREAMER TRACKER APP - WITH POSTGRESQL BACKEND
// ========================================

// Global state
let streamers = [];
let currentEditId = null;
let currentUpdateId = null;
let charts = {
  distribution: null,
  comparison: null,
  streamerCharts: {}
};

// API Configuration
const API_BASE = window.location.origin + '/api';

// ========================================
// LOADING & ERROR HANDLING
// ========================================
function showLoading(show) {
  // Console logging for now - can add visual spinner later
  if (show) {
    console.log('⏳ Loading...');
  }
}

function showError(message) {
  // Simple alert for now - can replace with toast notification
  console.error('❌ Error:', message);
  alert(message);
}
