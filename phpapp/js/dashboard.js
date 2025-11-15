// Dashboard specific JavaScript

// Auto-refresh dashboard stats every 60 seconds
let dashboardRefreshInterval;

document.addEventListener('DOMContentLoaded', function() {
    if (window.location.pathname.includes('dashboard.php')) {
        dashboardRefreshInterval = setInterval(refreshDashboardStats, 60000);
    }
});

async function refreshDashboardStats() {
    try {
        const data = await EzTweak.fetchJSON('api.php?action=get_dashboard_stats');
        
        if (data.success && data.stats) {
            updateStatCards(data.stats);
        }
    } catch (error) {
        console.error('Error refreshing dashboard stats:', error);
    }
}

function updateStatCards(stats) {
    for (const [key, value] of Object.entries(stats)) {
        const element = document.querySelector(`[data-stat="${key}"] h3`);
        if (element) {
            element.textContent = value;
        }
    }
}

// Clear interval when navigating away
window.addEventListener('beforeunload', function() {
    if (dashboardRefreshInterval) {
        clearInterval(dashboardRefreshInterval);
    }
});
