// Hide both forms by default, then show admin form on page load
window.addEventListener('DOMContentLoaded', function() {
    document.querySelectorAll('.login-form').forEach(form => {
        form.classList.remove('active');
        form.style.display = 'none';
    });
    // Show admin form by default
    const adminForm = document.getElementById('admin-form');
    if (adminForm) {
        adminForm.classList.add('active');
        adminForm.style.display = '';
    }
});

// Tab switching functionality
function switchTab(tabName) {
    // Remove active class and hide all forms
    document.querySelectorAll('.tab-button').forEach(tab => {
        tab.classList.remove('active');
    });
    document.querySelectorAll('.login-form').forEach(form => {
        form.classList.remove('active');
        form.style.display = 'none';
    });
    // Add active class to selected tab and show its form
    document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');
    const form = document.getElementById(`${tabName}-form`);
    if (form) {
        form.classList.add('active');
        form.style.display = '';
    }
    // Add subtle animation feedback
    const activeTab = document.querySelector(`[data-tab="${tabName}"]`);
    activeTab.style.transform = 'scale(0.95)';
    setTimeout(() => {
        activeTab.style.transform = '';
    }, 150);
}

// Password visibility toggle
function togglePassword(inputId) {
    const passwordInput = document.getElementById(inputId);
    const toggleButton = passwordInput.nextElementSibling.nextElementSibling;
    const eyeIcon = toggleButton.querySelector('.eye-icon');
    
    if (passwordInput.type === 'password') {
        passwordInput.type = 'text';
        eyeIcon.textContent = '🙈';
        toggleButton.setAttribute('aria-label', 'Hide password');
    } else {
        passwordInput.type = 'password';
        eyeIcon.textContent = '👁️';
        toggleButton.setAttribute('aria-label', 'Show password');
    }
}

// Loading overlay control
function showLoading() {
    const overlay = document.getElementById('loading-overlay');
    overlay.classList.add('active');
}

function hideLoading() {
    const overlay = document.getElementById('loading-overlay');
    overlay.classList.remove('active');
}

// Form validation
function validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

function validateEmployeeId(employeeId) {
    // Assuming employee ID should be alphanumeric and 4-8 characters
    const idRegex = /^[a-zA-Z0-9]{4,8}$/;
    return idRegex.test(employeeId);
}

function validatePassword(password) {
    // Password should be at least 8 characters
    return password.length >= 8;
}

// Show form errors
function showError(inputId, message) {
    const input = document.getElementById(inputId);
    const formGroup = input.parentElement;
    
    // Remove existing error
    const existingError = formGroup.querySelector('.error-message');
    if (existingError) {
        existingError.remove();
    }
    
    // Add error styling
    input.style.borderColor = '#ff4757';
    input.style.boxShadow = '0 0 0 3px rgba(255, 71, 87, 0.1)';
    
    // Add error message
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.textContent = message;
    errorDiv.style.cssText = `
        color: #ff4757;
        font-size: 12px;
        margin-top: 5px;
        animation: fadeInUp 0.3s ease;
    `;
    
    formGroup.appendChild(errorDiv);
    
    // Remove error after user starts typing
    input.addEventListener('input', function clearError() {
        input.style.borderColor = '';
        input.style.boxShadow = '';
        if (errorDiv.parentElement) {
            errorDiv.remove();
        }
        input.removeEventListener('input', clearError);
    });
}

// Success notification
function showSuccess(message) {
    const successDiv = document.createElement('div');
    successDiv.className = 'success-notification';
    successDiv.textContent = message;
    successDiv.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: linear-gradient(135deg, #2ed573, #7bed9f);
        color: white;
        padding: 15px 20px;
        border-radius: 10px;
        box-shadow: 0 10px 30px rgba(46, 213, 115, 0.15);
        z-index: 99999;
        font-size: 15px;
        font-weight: 600;
        animation: fadeInDown 0.5s;
    `;
    document.body.appendChild(successDiv);
    setTimeout(() => {
        successDiv.style.opacity = '0';
        setTimeout(() => {
            if (successDiv.parentElement) successDiv.remove();
        }, 400);
    }, 2000);
} 