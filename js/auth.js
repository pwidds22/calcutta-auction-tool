// Authentication utilities

// Check if user is logged in by making a request to the server
async function isLoggedIn() {
    try {
        const response = await fetch('/api/auth/me', {
            credentials: 'include'  // Important: include cookies
        });
        return response.ok;
    } catch (error) {
        console.error('Auth check failed:', error);
        return false;
    }
}

// Get token from localStorage (backup only)
function getToken() {
    return localStorage.getItem('token');
}

// Logout user
async function logout() {
    try {
        // Call logout endpoint
        await fetch('/api/auth/logout', {
            method: 'POST',
            credentials: 'include'
        });
    } catch (error) {
        console.error('Logout error:', error);
    }
    
    // Clear localStorage
    localStorage.removeItem('token');
    
    // Redirect to login
    window.location.href = 'login.html';
}

// Check authentication status and redirect if not logged in
async function checkAuth() {
    const loggedIn = await isLoggedIn();
    if (!loggedIn) {
        window.location.href = 'login.html';
    }
}

// Add authentication header to fetch requests
function authFetch(url, options = {}) {
    // Add credentials and merge with existing options
    const authOptions = {
        ...options,
        credentials: 'include',  // Always include credentials
        headers: {
            ...options.headers,
            'Content-Type': 'application/json'
        }
    };
    
    // Add backup token from localStorage if available
    const token = getToken();
    if (token) {
        authOptions.headers['Authorization'] = `Bearer ${token}`;
    }
    
    return fetch(url, authOptions).then(response => {
        if (response.status === 401) {
            // Redirect to login on unauthorized
            console.error('Unauthorized, redirecting to login');
            window.location.href = 'login.html';
        }
        return response;
    });
}

// Load user data from server
async function loadUserData() {
    try {
        const response = await authFetch('/api/data');
        
        if (response.status === 401) {
            console.error('Unauthorized access, redirecting to login');
            logout();
            return null;
        }
        
        if (!response.ok) {
            const errorText = await response.text();
            console.error(`Server error (${response.status}):`, errorText);
            throw new Error(`Failed to load user data: ${response.statusText}`);
        }
        
        const data = await response.json();
        if (!data || !data.data) {
            console.error('Invalid data format received from server');
            throw new Error('Invalid data format received from server');
        }
        
        return data.data;
    } catch (error) {
        console.error('Error loading user data:', error.message);
        throw error; // Re-throw to handle in the calling function
    }
}

// Save user data to server
async function saveUserData(userData) {
    try {
        if (!userData) {
            throw new Error('No data provided to save');
        }
        
        const response = await authFetch('/api/data', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(userData)
        });
        
        if (response.status === 401) {
            console.error('Unauthorized access, redirecting to login');
            logout();
            return false;
        }
        
        if (!response.ok) {
            const errorText = await response.text();
            console.error(`Server error (${response.status}):`, errorText);
            throw new Error(`Failed to save user data: ${response.statusText}`);
        }
        
        return true;
    } catch (error) {
        console.error('Error saving user data:', error.message);
        throw error; // Re-throw to handle in the calling function
    }
} 