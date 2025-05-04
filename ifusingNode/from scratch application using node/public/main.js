// Initialize app with debug info if needed
function initApp() {
    if (process.env.NODE_ENV !== 'production') {
        showMessage('Application initialized in development mode', 'info');
    }
}

// UI Functions
function toggleForms(formType = 'login') {
    const forms = {
        'login': document.getElementById('login-form'),
        'register': document.getElementById('register-form'),
        'forgot-password': document.getElementById('forgot-password-form'),
        'reset-password': document.getElementById('reset-password-form')
    };

    // Hide all forms
    Object.values(forms).forEach(form => form.style.display = 'none');
    
    // Show selected form
    forms[formType].style.display = 'block';
}

function showMessage(message, type = 'info') {
    const container = document.querySelector('.container');
    const existingMessage = document.querySelector('.alert');
    if (existingMessage) {
        existingMessage.remove();
    }
    
    const alert = document.createElement('div');
    alert.className = `alert alert-${type}`;
    alert.textContent = message;
    container.insertBefore(alert, container.firstChild);
    
    setTimeout(() => alert.remove(), 5000);
}

// Show error message to user
function showError(message) {
    const errorDiv = document.createElement('div');
    errorDiv.className = 'alert alert-error';
    errorDiv.textContent = message;
    document.querySelector('.container').insertBefore(errorDiv, document.querySelector('.auth-form'));
    setTimeout(() => errorDiv.remove(), 5000);
}

// Show success message to user
function showSuccess(message) {
    const successDiv = document.createElement('div');
    successDiv.className = 'alert alert-success';
    successDiv.textContent = message;
    document.querySelector('.container').insertBefore(successDiv, document.querySelector('.auth-form'));
    setTimeout(() => successDiv.remove(), 5000);
}

function setLoading(form, isLoading) {
    const button = form.querySelector('button[type="submit"]');
    const inputs = form.querySelectorAll('input');
    
    if (isLoading) {
        button.disabled = true;
        button.innerHTML = '<span class="spinner"></span> Loading...';
        inputs.forEach(input => input.disabled = true);
    } else {
        button.disabled = false;
        button.textContent = button.getAttribute('data-original-text') || button.textContent.replace('Loading...', '').trim();
        inputs.forEach(input => input.disabled = false);
    }
}

// Save original button text
document.querySelectorAll('form').forEach(form => {
    const button = form.querySelector('button[type="submit"]');
    if (button) {
        button.setAttribute('data-original-text', button.textContent);
    }
});

function showProfile(userData) {
    document.getElementById('auth-section').style.display = 'none';
    document.getElementById('profile-section').style.display = 'block';
    document.getElementById('username').textContent = userData.username;
    document.getElementById('user-email').textContent = userData.email;
}

function showVerificationMessage(message) {
    const authSection = document.getElementById('auth-section');
    const existingMessage = document.getElementById('verification-message');
    if (existingMessage) {
        existingMessage.remove();
    }
    
    const messageDiv = document.createElement('div');
    messageDiv.id = 'verification-message';
    messageDiv.className = 'message';
    messageDiv.innerHTML = `
        ${message}
        <button onclick="handleResendVerification()" class="resend-button">
            Resend Verification Email
        </button>
    `;
    
    authSection.insertBefore(messageDiv, authSection.firstChild);
}

// Error handling wrapper for fetch calls
async function fetchWithErrorHandling(url, options = {}) {
    try {
        const response = await fetch(url, options);
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.error?.message || 'An error occurred');
        }
        
        return data;
    } catch (error) {
        showError(error.message);
        throw error; // Re-throw for the calling function to handle if needed
    }
}

async function handleApiError(error) {
    const message = error.response?.data?.error?.message || error.message || 'An error occurred';
    showError(message);
}

// Update visibility of UI sections based on auth state
function updateUIState(isAuthenticated) {
    document.getElementById('auth-section').style.display = isAuthenticated ? 'none' : 'block';
    document.getElementById('profile-section').style.display = isAuthenticated ? 'block' : 'none';
}

// API Functions
async function handleRegister(event) {
    event.preventDefault();
    const form = event.target;
    
    try {
        setLoading(form, true);
        const data = await fetchWithErrorHandling('/api/users/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                username: form.username.value,
                email: form.email.value,
                password: form.password.value
            })
        });
        
        showSuccess(data.message);
        form.reset();
        window.registeredEmail = form.email.value;
    } catch (error) {
        handleApiError(error);
    } finally {
        setLoading(form, false);
    }
}

async function handleLogin(event) {
    event.preventDefault();
    const form = event.target;
    
    try {
        setLoading(form, true);
        const data = await fetchWithErrorHandling('/api/users/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: form.email.value,
                password: form.password.value
            })
        });
        
        showProfile(data.user);
        showSuccess('Logged in successfully');
    } catch (error) {
        handleApiError(error);
    } finally {
        setLoading(form, false);
    }
}

async function handleLogout() {
    try {
        await fetchWithErrorHandling('/api/users/logout', { method: 'POST' });
        updateUIState(false);
        showSuccess('Logged out successfully');
    } catch (error) {
        handleApiError(error);
    }
}

async function handleResendVerification() {
    try {
        const email = window.registeredEmail;
        if (!email) {
            throw new Error('No email address found. Please register again.');
        }
        
        await fetchWithErrorHandling('/api/users/resend-verification', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email })
        });
        
        showSuccess('Verification email has been resent. Please check your inbox.');
    } catch (error) {
        handleApiError(error);
    }
}

// Password Reset Functions
async function handleForgotPassword(event) {
    event.preventDefault();
    const form = event.target;
    
    try {
        setLoading(form, true);
        const data = await fetchWithErrorHandling('/api/users/forgot-password', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: form.email.value
            })
        });
        
        showSuccess(data.message);
        toggleForms('login');
    } catch (error) {
        handleApiError(error);
    } finally {
        setLoading(form, false);
    }
}

async function handleResetPassword(event) {
    event.preventDefault();
    const form = event.target;
    
    if (form.password.value !== form.confirmPassword.value) {
        showError("Passwords don't match!");
        return;
    }
    
    try {
        setLoading(form, true);
        // Get token from URL
        const urlParams = new URLSearchParams(window.location.search);
        const token = urlParams.get('token');
        
        if (!token) {
            throw new Error('Reset token is missing');
        }
        
        const data = await fetchWithErrorHandling('/api/users/reset-password', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                token,
                password: form.password.value
            })
        });
        
        showSuccess(data.message);
        // Remove token from URL and redirect to login
        window.history.replaceState({}, document.title, '/');
        toggleForms('login');
    } catch (error) {
        handleApiError(error);
    } finally {
        setLoading(form, false);
    }
}

// Check authentication status on page load
async function checkAuth() {
    try {
        const userData = await fetchWithErrorHandling('/api/users/profile');
        showProfile(userData);
    } catch (error) {
        updateUIState(false); // Not authenticated, show login form
    }
}

// Check URL for reset token on page load
function checkResetToken() {
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');
    
    if (token) {
        toggleForms('reset-password');
    }
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    initApp();
    checkAuth();
    checkResetToken();
});