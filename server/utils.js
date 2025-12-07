// ========================================
// UTILITY FUNCTIONS
// ========================================

// Show/hide loading indicator
function showLoading(show) {
  // For now, just console log. Can add a visual spinner later
  if (show) {
    console.log('⏳ Loading...');
  }
}

// Show error message to user
function showError(message) {
  // Simple alert for now. Can be replaced with toast notification
  console.error('❌ Error:', message);
  alert(message);
}
