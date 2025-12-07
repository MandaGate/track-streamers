// ========================================
// STREAMER TRACKER APP
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
// UTILITY FUNCTIONS - LOADING & ERRORS
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

// ========================================
// INITIALIZATION
// ========================================
document.addEventListener('DOMContentLoaded', async () => {
  await loadStreamers();
  initializeEventListeners();
  renderDashboard();
  renderStreamersList();
  updateEmptyStates();
});

// ========================================
// DATA MANAGEMENT - API CALLS
// ========================================
async function loadStreamers() {
  try {
    showLoading(true);
    const response = await fetch(`${API_BASE}/streamers`);
    if (!response.ok) throw new Error('Failed to load streamers');
    streamers = await response.json();
  } catch (error) {
    console.error('Error loading streamers:', error);
    showError('Failed to load streamers. Make sure the server is running.');
    streamers = [];
  } finally {
    showLoading(false);
  }
}

async function createStreamer(name, platform, initialCount) {
  try {
    showLoading(true);
    const response = await fetch(`${API_BASE}/streamers`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, platform, initialCount })
    });
    
    if (!response.ok) throw new Error('Failed to create streamer');
    const newStreamer = await response.json();
    streamers.push(newStreamer);
    return newStreamer;
  } catch (error) {
    console.error('Error creating streamer:', error);
    showError('Failed to add streamer. Please try again.');
    throw error;
  } finally {
    showLoading(false);
  }
}

async function updateStreamer(id, name, platform) {
  try {
    showLoading(true);
    const response = await fetch(`${API_BASE}/streamers/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, platform })
    });
    
    if (!response.ok) throw new Error('Failed to update streamer');
    const updated = await response.json();
    
    // Update local state
    const index = streamers.findIndex(s => s.id === id);
    if (index !== -1) {
      streamers[index] = { ...streamers[index], ...updated };
    }
    return updated;
  } catch (error) {
    console.error('Error updating streamer:', error);
    showError('Failed to update streamer. Please try again.');
    throw error;
  } finally {
    showLoading(false);
  }
}

async function deleteStreamerAPI(id) {
  try {
    showLoading(true);
    const response = await fetch(`${API_BASE}/streamers/${id}`, {
      method: 'DELETE'
    });
    
    if (!response.ok) throw new Error('Failed to delete streamer');
    
    // Remove from local state
    streamers = streamers.filter(s => s.id !== id);
  } catch (error) {
    console.error('Error deleting streamer:', error);
    showError('Failed to delete streamer. Please try again.');
    throw error;
  } finally {
    showLoading(false);
  }
}

async function addSubscriberCount(id, count, timestamp) {
  try {
    showLoading(true);
    const response = await fetch(`${API_BASE}/streamers/${id}/subscribers`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ count, timestamp })
    });
    
    if (!response.ok) throw new Error('Failed to add subscriber count');
    
    // Update local state
    const streamer = streamers.find(s => s.id === id);
    if (streamer) {
      streamer.history.push({ count, timestamp });
    }
  } catch (error) {
    console.error('Error adding subscriber count:', error);
    showError('Failed to update subscriber count. Please try again.');
    throw error;
  } finally {
    showLoading(false);
  }
}

// ========================================
// EVENT LISTENERS
// ========================================
function initializeEventListeners() {
  // Navigation
  document.querySelectorAll('.nav-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const view = btn.dataset.view;
      switchView(view);
    });
  });

  // Add streamer form
  document.getElementById('add-streamer-form').addEventListener('submit', (e) => {
    e.preventDefault();
    addStreamer();
  });

  // Modal close on outside click
  document.querySelectorAll('.modal').forEach(modal => {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        modal.classList.remove('active');
      }
    });
  });
}

// ========================================
// VIEW MANAGEMENT
// ========================================
function switchView(viewName) {
  // Update navigation
  document.querySelectorAll('.nav-btn').forEach(btn => {
    btn.classList.remove('active');
    if (btn.dataset.view === viewName) {
      btn.classList.add('active');
    }
  });

  // Update views
  document.querySelectorAll('.view').forEach(view => {
    view.classList.remove('active');
  });
  document.getElementById(`${viewName}-view`).classList.add('active');

  // Refresh content
  if (viewName === 'dashboard') {
    renderDashboard();
  } else if (viewName === 'streamers') {
    renderStreamersList();
  }
}

// ========================================
// STREAMER MANAGEMENT
// ========================================
async function addStreamer() {
  const name = document.getElementById('streamer-name').value.trim();
  const platform = document.getElementById('streamer-platform').value;
  const initialSubs = parseInt(document.getElementById('initial-subs').value) || 0;

  if (!name || !platform) {
    alert('Please fill in all fields!');
    return;
  }

  try {
    await createStreamer(name, platform, initialSubs);

    // Celebration!
    createConfetti();

    // Reset form
    document.getElementById('add-streamer-form').reset();

    // Update UI
    renderStreamersList();
    renderDashboard();
    updateEmptyStates();
  } catch (error) {
    // Error already handled in createStreamer
  }
}

async function deleteStreamer(id) {
  const streamer = streamers.find(s => s.id === id);
  if (!streamer) return;

  if (confirm(`Are you sure you want to delete ${streamer.name}?`)) {
    try {
      await deleteStreamerAPI(id);
      renderStreamersList();
      renderDashboard();
      updateEmptyStates();
    } catch (error) {
      // Error already handled in deleteStreamerAPI
    }
  }
}

function openEditModal(id) {
  const streamer = streamers.find(s => s.id === id);
  if (!streamer) return;

  currentEditId = id;
  document.getElementById('edit-streamer-name').value = streamer.name;
  document.getElementById('edit-streamer-platform').value = streamer.platform;
  document.getElementById('edit-modal').classList.add('active');
}

function closeEditModal() {
  currentEditId = null;
  document.getElementById('edit-modal').classList.remove('active');
}

async function saveStreamerEdit() {
  if (!currentEditId) return;

  const name = document.getElementById('edit-streamer-name').value.trim();
  const platform = document.getElementById('edit-streamer-platform').value;

  if (!name || !platform) {
    alert('Please fill in all fields!');
    return;
  }

  try {
    await updateStreamer(currentEditId, name, platform);
    closeEditModal();
    renderStreamersList();
    renderDashboard();
  } catch (error) {
    // Error already handled in updateStreamer
  }
}

function openUpdateModal(id) {
  const streamer = streamers.find(s => s.id === id);
  if (!streamer) return;

  currentUpdateId = id;
  const currentSubs = streamer.history[streamer.history.length - 1].count;

  document.getElementById('modal-streamer-name').textContent = streamer.name;
  document.getElementById('modal-current-subs').textContent = currentSubs.toLocaleString();
  document.getElementById('new-subs').value = currentSubs;
  document.getElementById('update-modal').classList.add('active');
}

function closeUpdateModal() {
  currentUpdateId = null;
  document.getElementById('update-modal').classList.remove('active');
}

async function saveSubscriberUpdate() {
  if (!currentUpdateId) return;

  const streamer = streamers.find(s => s.id === currentUpdateId);
  if (!streamer) return;

  const newCount = parseInt(document.getElementById('new-subs').value) || 0;
  const oldCount = streamer.history[streamer.history.length - 1].count;
  const timestamp = Date.now();

  try {
    await addSubscriberCount(currentUpdateId, newCount, timestamp);

    // Celebration if increased!
    if (newCount > oldCount) {
      createConfetti();
    }

    closeUpdateModal();
    renderStreamersList();
    renderDashboard();
  } catch (error) {
    // Error already handled in addSubscriberCount
  }
}

// ========================================
// RENDERING - STREAMERS LIST
// ========================================
function renderStreamersList() {
  const container = document.getElementById('streamers-list');
  container.innerHTML = '';

  if (streamers.length === 0) {
    return;
  }

  streamers.forEach(streamer => {
    const currentSubs = streamer.history[streamer.history.length - 1].count;
    const growth = calculateGrowth(streamer);

    const item = document.createElement('div');
    item.className = 'streamer-item';
    item.style.borderLeftColor = getStreamerColor(streamer.platform);

    item.innerHTML = `
      <div class="streamer-header">
        <h3 class="streamer-name">${escapeHtml(streamer.name)}</h3>
        <span class="streamer-platform">${escapeHtml(streamer.platform)}</span>
      </div>
      <div class="streamer-stats">
        <div class="stat-item">
          <span class="stat-item-label">Current Subs</span>
          <span class="stat-item-value">${currentSubs.toLocaleString()}</span>
        </div>
        <div class="stat-item">
          <span class="stat-item-label">Total Updates</span>
          <span class="stat-item-value">${streamer.history.length}</span>
        </div>
        <div class="stat-item">
          <span class="stat-item-label">Growth</span>
          <span class="stat-item-value">${growth >= 0 ? '+' : ''}${growth.toLocaleString()}</span>
        </div>
      </div>
      <div class="streamer-actions">
        <button class="btn btn-success btn-sm" onclick="openUpdateModal('${streamer.id}')">📈 Update Subs</button>
        <button class="btn btn-info btn-sm" onclick="openEditModal('${streamer.id}')">✏️ Edit</button>
        <button class="btn btn-danger btn-sm" onclick="deleteStreamer('${streamer.id}')">🗑️ Delete</button>
      </div>
    `;

    container.appendChild(item);
  });
}

// ========================================
// RENDERING - DASHBOARD
// ========================================
function renderDashboard() {
  if (streamers.length === 0) {
    return;
  }

  updateGlobalStats();
  renderDistributionChart();
  renderComparisonChart();
  renderStreamerCharts();
}

function updateGlobalStats() {
  const totalSubs = streamers.reduce((sum, s) => {
    return sum + s.history[s.history.length - 1].count;
  }, 0);

  const avgSubs = streamers.length > 0 ? Math.round(totalSubs / streamers.length) : 0;

  const topStreamer = streamers.reduce((top, s) => {
    const subs = s.history[s.history.length - 1].count;
    const topSubs = top ? top.history[top.history.length - 1].count : 0;
    return subs > topSubs ? s : top;
  }, null);

  document.getElementById('total-subs').textContent = totalSubs.toLocaleString();
  document.getElementById('total-streamers').textContent = streamers.length;
  document.getElementById('avg-subs').textContent = avgSubs.toLocaleString();
  document.getElementById('top-streamer').textContent = topStreamer ? topStreamer.name : '-';
}

function renderDistributionChart() {
  const ctx = document.getElementById('distribution-chart');
  if (!ctx) return;

  // Destroy old chart
  if (charts.distribution) {
    charts.distribution.destroy();
  }

  const data = streamers.map(s => ({
    name: s.name,
    subs: s.history[s.history.length - 1].count
  }));

  charts.distribution = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: data.map(d => d.name),
      datasets: [{
        data: data.map(d => d.subs),
        backgroundColor: data.map((_, i) => getChartColor(i)),
        borderWidth: 3,
        borderColor: '#fff'
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'bottom',
          labels: {
            font: {
              family: "'Fredoka', cursive",
              size: 12
            },
            padding: 15
          }
        },
        tooltip: {
          callbacks: {
            label: function(context) {
              return context.label + ': ' + context.parsed.toLocaleString() + ' subs';
            }
          }
        }
      }
    }
  });
}

function renderComparisonChart() {
  const ctx = document.getElementById('comparison-chart');
  if (!ctx) return;

  // Destroy old chart
  if (charts.comparison) {
    charts.comparison.destroy();
  }

  const data = streamers.map(s => ({
    name: s.name,
    subs: s.history[s.history.length - 1].count
  })).sort((a, b) => b.subs - a.subs);

  charts.comparison = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: data.map(d => d.name),
      datasets: [{
        label: 'Subscribers',
        data: data.map(d => d.subs),
        backgroundColor: data.map((_, i) => getChartColor(i)),
        borderRadius: 10,
        borderSkipped: false
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false
        },
        tooltip: {
          callbacks: {
            label: function(context) {
              return 'Subscribers: ' + context.parsed.y.toLocaleString();
            }
          }
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            callback: function(value) {
              return value.toLocaleString();
            }
          }
        }
      }
    }
  });
}

function renderStreamerCharts() {
  const container = document.getElementById('streamer-charts');
  container.innerHTML = '';

  streamers.forEach((streamer, index) => {
    if (streamer.history.length < 2) {
      return; // Skip if no growth data
    }

    const chartContainer = document.createElement('div');
    chartContainer.className = 'chart-container';

    const canvas = document.createElement('canvas');
    canvas.id = `streamer-chart-${streamer.id}`;

    chartContainer.innerHTML = `<h3>📊 ${escapeHtml(streamer.name)}</h3>`;
    chartContainer.appendChild(canvas);
    container.appendChild(chartContainer);

    // Destroy old chart if exists
    if (charts.streamerCharts[streamer.id]) {
      charts.streamerCharts[streamer.id].destroy();
    }

    // Create chart
    charts.streamerCharts[streamer.id] = new Chart(canvas, {
      type: 'line',
      data: {
        labels: streamer.history.map((h, i) => `Update ${i + 1}`),
        datasets: [{
          label: 'Subscribers',
          data: streamer.history.map(h => h.count),
          borderColor: getChartColor(index),
          backgroundColor: getChartColor(index) + '33',
          fill: true,
          tension: 0.4,
          borderWidth: 3,
          pointRadius: 5,
          pointHoverRadius: 7
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false
          },
          tooltip: {
            callbacks: {
              label: function(context) {
                const date = new Date(streamer.history[context.dataIndex].timestamp);
                return [
                  'Subscribers: ' + context.parsed.y.toLocaleString(),
                  'Date: ' + date.toLocaleDateString()
                ];
              }
            }
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              callback: function(value) {
                return value.toLocaleString();
              }
            }
          }
        }
      }
    });
  });
}

// ========================================
// UTILITY FUNCTIONS
// ========================================
function calculateGrowth(streamer) {
  if (streamer.history.length < 2) return 0;
  const first = streamer.history[0].count;
  const last = streamer.history[streamer.history.length - 1].count;
  return last - first;
}

function getStreamerColor(platform) {
  const colors = {
    'YouTube': '#FF0000',
    'Twitch': '#9146FF',
    'TikTok': '#000000',
    'Instagram': '#E1306C',
    'Twitter': '#1DA1F2',
    'Facebook': '#1877F2',
    'Other': '#FF6B9D'
  };
  return colors[platform] || '#FF6B9D';
}

function getChartColor(index) {
  const colors = [
    '#FF6B9D',
    '#C44DFF',
    '#00B4FF',
    '#00D9A3',
    '#FFA800',
    '#FFD93D',
    '#FF6B6B',
    '#A78BFA',
    '#34D399',
    '#60A5FA'
  ];
  return colors[index % colors.length];
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

function updateEmptyStates() {
  const dashboardEmpty = document.getElementById('dashboard-empty');
  const streamersEmpty = document.getElementById('streamers-empty');
  const globalStats = document.getElementById('global-stats');
  const streamerCharts = document.getElementById('streamer-charts');

  if (streamers.length === 0) {
    dashboardEmpty.classList.remove('hidden');
    streamersEmpty.classList.remove('hidden');
    globalStats.style.display = 'none';
    document.querySelector('#dashboard-view .grid').style.display = 'none';
    if (streamerCharts.parentElement) {
      streamerCharts.parentElement.style.display = 'none';
    }
  } else {
    dashboardEmpty.classList.add('hidden');
    streamersEmpty.classList.add('hidden');
    globalStats.style.display = 'grid';
    document.querySelector('#dashboard-view .grid').style.display = 'grid';
    if (streamerCharts.parentElement) {
      streamerCharts.parentElement.style.display = 'block';
    }
  }
}

// ========================================
// CONFETTI ANIMATION
// ========================================
function createConfetti() {
  const colors = ['#FF6B9D', '#C44DFF', '#00B4FF', '#00D9A3', '#FFA800', '#FFD93D'];
  const confettiCount = 50;

  for (let i = 0; i < confettiCount; i++) {
    setTimeout(() => {
      const confetti = document.createElement('div');
      confetti.className = 'confetti';
      confetti.style.left = Math.random() * 100 + 'vw';
      confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
      confetti.style.animationDelay = Math.random() * 0.3 + 's';
      confetti.style.animationDuration = (Math.random() * 2 + 2) + 's';
      
      document.body.appendChild(confetti);

      setTimeout(() => {
        confetti.remove();
      }, 3000);
    }, i * 30);
  }
}
