// Check authentication on page load
document.addEventListener('DOMContentLoaded', async () => {
    // Check if user is logged in
    if (!isLoggedIn()) {
        window.location.href = 'login.html';
        return;
    }

    // Load user data
    await loadUserProfile();
});

// Load user profile data
async function loadUserProfile() {
    try {
        const response = await authFetch('/api/auth/me');
        
        if (response.status === 401) {
            logout();
            return;
        }

        if (!response.ok) {
            throw new Error('Failed to load user data');
        }

        const data = await response.json();
        
        // Populate email field
        document.getElementById('email').value = data.data.email;

    } catch (error) {
        console.error('Error loading profile:', error);
        showError('Failed to load profile data');
    }
}

// Handle form submission
document.getElementById('profileForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const currentPassword = document.getElementById('currentPassword').value;
    const newPassword = document.getElementById('newPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;

    // Clear previous messages
    hideMessages();

    // Validate password fields
    if (!currentPassword || !newPassword || !confirmPassword) {
        showError('All password fields are required');
        return;
    }

    if (newPassword !== confirmPassword) {
        showError('New passwords do not match');
        return;
    }

    if (newPassword.length < 6) {
        showError('New password must be at least 6 characters long');
        return;
    }

    try {
        // Send password update request
        const response = await authFetch('/api/auth/update-profile', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                currentPassword,
                newPassword
            })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'Failed to update password');
        }

        // Show success message
        showSuccess('Password updated successfully');

        // Clear password fields
        document.getElementById('currentPassword').value = '';
        document.getElementById('newPassword').value = '';
        document.getElementById('confirmPassword').value = '';

    } catch (error) {
        console.error('Error updating password:', error);
        showError(error.message || 'Failed to update password');
    }
});

// Helper functions for showing/hiding messages
function showSuccess(message) {
    const successElement = document.getElementById('successMessage');
    successElement.textContent = message;
    successElement.style.display = 'block';
}

function showError(message) {
    const errorElement = document.getElementById('errorMessage');
    errorElement.textContent = message;
    errorElement.style.display = 'block';
}

function hideMessages() {
    document.getElementById('successMessage').style.display = 'none';
    document.getElementById('errorMessage').style.display = 'none';
} 