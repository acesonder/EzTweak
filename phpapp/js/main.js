// Main JavaScript file for EzTweak PHP App

// Initialize theme on page load
document.addEventListener('DOMContentLoaded', function() {
    initTheme();
    checkNotifications();
    
    // Check for notifications every 30 seconds
    setInterval(checkNotifications, 30000);
});

// Theme Management
function initTheme() {
    const savedTheme = localStorage.getItem('theme') || 'medicine-wheel';
    document.body.setAttribute('data-theme', savedTheme);
    updateThemeIcon();
    updateThemeLogo();
}

function toggleTheme() {
    const currentTheme = document.body.getAttribute('data-theme');
    const newTheme = currentTheme === 'medicine-wheel' ? 'neon' : 'medicine-wheel';
    
    document.body.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    
    // Save to server if logged in
    saveThemeToServer(newTheme);
    
    updateThemeIcon();
    updateThemeLogo();
    showNotification('Theme changed to ' + (newTheme === 'medicine-wheel' ? 'Medicine Wheel' : 'Neon'), 'success');
}

function updateThemeIcon() {
    const icon = document.getElementById('theme-icon');
    if (icon) {
        const theme = document.body.getAttribute('data-theme');
        icon.textContent = theme === 'medicine-wheel' ? '🌙' : '☀️';
    }
}

function updateThemeLogo() {
    const logo = document.getElementById('theme-logo');
    if (logo) {
        const theme = document.body.getAttribute('data-theme');
        logo.src = theme === 'medicine-wheel' 
            ? 'https://github.com/user-attachments/assets/3fa3dc03-5260-469a-80cc-a6c392ca3e9a'
            : 'https://github.com/user-attachments/assets/6fb90b90-9f9e-40f1-add7-0f44e0766dad';
    }
}

async function saveThemeToServer(theme) {
    try {
        const formData = new FormData();
        formData.append('ajax', '1');
        formData.append('action', 'set_theme');
        formData.append('theme', theme);
        
        await fetch('api.php', {
            method: 'POST',
            body: formData
        });
    } catch (error) {
        console.error('Error saving theme:', error);
    }
}

// Notification System
function showNotification(message, type = 'info', duration = 3000) {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOutRight 0.3s ease';
        setTimeout(() => {
            notification.remove();
        }, 300);
    }, duration);
}

// Check for unread notifications
async function checkNotifications() {
    // Only check if we're logged in (check if we're not on auth pages)
    if (window.location.pathname.includes('login') || 
        window.location.pathname.includes('register') ||
        window.location.pathname.includes('forgot_password')) {
        return;
    }
    
    try {
        const response = await fetch('api.php?action=get_notifications');
        if (response.ok) {
            const data = await response.json();
            
            if (data.success && data.notifications && data.notifications.length > 0) {
                updateNotificationBadge(data.notifications.length);
                
                // Show popup for new notifications
                data.notifications.slice(0, 3).forEach(notification => {
                    showNotification(notification.message, notification.type, 5000);
                });
            }
        }
    } catch (error) {
        console.error('Error checking notifications:', error);
    }
}

function updateNotificationBadge(count) {
    const badge = document.getElementById('notification-badge');
    if (badge) {
        badge.textContent = count;
        badge.style.display = count > 0 ? 'inline-block' : 'none';
    }
}

async function markNotificationRead(notificationId) {
    try {
        const formData = new FormData();
        formData.append('ajax', '1');
        formData.append('action', 'mark_notification_read');
        formData.append('notification_id', notificationId);
        
        await fetch('api.php', {
            method: 'POST',
            body: formData
        });
        
        checkNotifications(); // Refresh notification count
    } catch (error) {
        console.error('Error marking notification as read:', error);
    }
}

// AJAX Helper Functions
async function fetchJSON(url, options = {}) {
    try {
        const response = await fetch(url, {
            ...options,
            headers: {
                'X-Requested-With': 'XMLHttpRequest',
                ...options.headers
            }
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        return await response.json();
    } catch (error) {
        console.error('Fetch error:', error);
        throw error;
    }
}

async function postJSON(url, data) {
    const formData = new FormData();
    formData.append('ajax', '1');
    
    for (const key in data) {
        if (Array.isArray(data[key])) {
            data[key].forEach(item => formData.append(key + '[]', item));
        } else {
            formData.append(key, data[key]);
        }
    }
    
    return fetchJSON(url, {
        method: 'POST',
        body: formData
    });
}

// Form Validation Helper
function validateForm(formElement) {
    const inputs = formElement.querySelectorAll('[required]');
    let isValid = true;
    
    inputs.forEach(input => {
        if (!input.value.trim()) {
            input.classList.add('error');
            isValid = false;
        } else {
            input.classList.remove('error');
        }
    });
    
    return isValid;
}

// Loading State Helper
function setLoadingState(button, isLoading) {
    const text = button.querySelector('.button-text');
    const loading = button.querySelector('.button-loading');
    
    button.disabled = isLoading;
    
    if (text && loading) {
        text.style.display = isLoading ? 'none' : 'inline';
        loading.style.display = isLoading ? 'inline' : 'none';
    }
}

// Format Date Helper
function formatDate(dateString) {
    const date = new Date(dateString);
    const options = { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    };
    return date.toLocaleDateString('en-US', options);
}

// Debounce Helper
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Export functions for use in other scripts
window.EzTweak = {
    showNotification,
    toggleTheme,
    fetchJSON,
    postJSON,
    validateForm,
    setLoadingState,
    formatDate,
    debounce,
    markNotificationRead
};
