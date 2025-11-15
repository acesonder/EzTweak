// Authentication related JavaScript

// Password strength indicator
function checkPasswordStrength(password) {
    let strength = 0;
    
    if (password.length >= 6) strength++;
    if (password.length >= 10) strength++;
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength++;
    if (/\d/.test(password)) strength++;
    if (/[^a-zA-Z0-9]/.test(password)) strength++;
    
    return {
        score: strength,
        label: ['Very Weak', 'Weak', 'Fair', 'Good', 'Strong'][Math.min(strength, 4)]
    };
}

// Show password strength indicator
function initPasswordStrength() {
    const passwordInput = document.getElementById('password');
    if (!passwordInput) return;
    
    const strengthIndicator = document.createElement('div');
    strengthIndicator.className = 'password-strength';
    strengthIndicator.style.marginTop = '8px';
    strengthIndicator.style.fontSize = '14px';
    
    passwordInput.parentNode.appendChild(strengthIndicator);
    
    passwordInput.addEventListener('input', function() {
        const strength = checkPasswordStrength(this.value);
        const colors = ['#dc3545', '#fd7e14', '#ffc107', '#28a745', '#20c997'];
        
        strengthIndicator.textContent = `Password Strength: ${strength.label}`;
        strengthIndicator.style.color = colors[Math.min(strength.score, 4)];
    });
}

// Confirm password validation
function initPasswordConfirmation() {
    const passwordInput = document.getElementById('password');
    const confirmInput = document.getElementById('confirm_password');
    
    if (!passwordInput || !confirmInput) return;
    
    const matchIndicator = document.createElement('div');
    matchIndicator.className = 'password-match';
    matchIndicator.style.marginTop = '8px';
    matchIndicator.style.fontSize = '14px';
    
    confirmInput.parentNode.appendChild(matchIndicator);
    
    function checkMatch() {
        if (confirmInput.value === '') {
            matchIndicator.textContent = '';
            return;
        }
        
        if (passwordInput.value === confirmInput.value) {
            matchIndicator.textContent = '✓ Passwords match';
            matchIndicator.style.color = '#28a745';
        } else {
            matchIndicator.textContent = '✗ Passwords do not match';
            matchIndicator.style.color = '#dc3545';
        }
    }
    
    passwordInput.addEventListener('input', checkMatch);
    confirmInput.addEventListener('input', checkMatch);
}

// Toggle password visibility
function initPasswordToggle() {
    const passwordInputs = document.querySelectorAll('input[type="password"]');
    
    passwordInputs.forEach(input => {
        const toggleBtn = document.createElement('button');
        toggleBtn.type = 'button';
        toggleBtn.innerHTML = '👁️';
        toggleBtn.className = 'password-toggle';
        toggleBtn.style.cssText = `
            position: absolute;
            right: 12px;
            top: 50%;
            transform: translateY(-50%);
            background: none;
            border: none;
            cursor: pointer;
            font-size: 18px;
            padding: 4px;
        `;
        
        const wrapper = document.createElement('div');
        wrapper.style.position = 'relative';
        wrapper.style.display = 'inline-block';
        wrapper.style.width = '100%';
        
        input.parentNode.insertBefore(wrapper, input);
        wrapper.appendChild(input);
        wrapper.appendChild(toggleBtn);
        
        toggleBtn.addEventListener('click', function() {
            if (input.type === 'password') {
                input.type = 'text';
                toggleBtn.innerHTML = '🙈';
            } else {
                input.type = 'password';
                toggleBtn.innerHTML = '👁️';
            }
        });
    });
}

// Session timeout warning
let sessionTimeoutWarning;
let sessionTimeout;

function initSessionTimeout() {
    const TIMEOUT_WARNING = 5 * 60 * 1000; // 5 minutes before timeout
    const TIMEOUT_DURATION = 30 * 60 * 1000; // 30 minutes
    
    function resetTimeout() {
        clearTimeout(sessionTimeoutWarning);
        clearTimeout(sessionTimeout);
        
        sessionTimeoutWarning = setTimeout(() => {
            showNotification('Your session will expire in 5 minutes', 'warning', 10000);
        }, TIMEOUT_DURATION - TIMEOUT_WARNING);
        
        sessionTimeout = setTimeout(() => {
            showNotification('Session expired. Please log in again.', 'error', 5000);
            setTimeout(() => {
                window.location.href = 'login.php?expired=1';
            }, 2000);
        }, TIMEOUT_DURATION);
    }
    
    // Reset timeout on user activity
    ['mousedown', 'keydown', 'scroll', 'touchstart'].forEach(event => {
        document.addEventListener(event, resetTimeout, true);
    });
    
    resetTimeout();
}

// Auto-fill demo credentials
function initDemoCredentials() {
    const demoInfo = document.querySelector('.demo-info');
    if (!demoInfo) return;
    
    const fillBtn = document.createElement('button');
    fillBtn.type = 'button';
    fillBtn.textContent = 'Use Demo Credentials';
    fillBtn.className = 'auth-button secondary';
    fillBtn.style.marginTop = '12px';
    fillBtn.style.padding = '8px 16px';
    fillBtn.style.fontSize = '14px';
    
    fillBtn.addEventListener('click', function() {
        const usernameInput = document.getElementById('username');
        const passwordInput = document.getElementById('password');
        
        if (usernameInput) usernameInput.value = 'admin';
        if (passwordInput) passwordInput.value = 'admin123';
        
        showNotification('Demo credentials filled', 'info', 2000);
    });
    
    demoInfo.appendChild(fillBtn);
}

// Initialize auth page features
document.addEventListener('DOMContentLoaded', function() {
    initPasswordStrength();
    initPasswordConfirmation();
    initPasswordToggle();
    initDemoCredentials();
    
    // Only init session timeout if not on auth pages
    if (!window.location.pathname.includes('login') && 
        !window.location.pathname.includes('register') &&
        !window.location.pathname.includes('forgot_password')) {
        initSessionTimeout();
    }
});
