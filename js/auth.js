// Authentication utilities

// Check if user is logged in
function isLoggedIn() {
    return localStorage.getItem('token') !== null;
}

// Get token
function getToken() {
    return localStorage.getItem('token');
}

// Logout user
function logout() {
    localStorage.removeItem('token');
    window.location.href = 'login.html';
}

// Check authentication status and redirect if not logged in
function checkAuth() {
    if (!isLoggedIn()) {
        window.location.href = 'login.html';
    }
}

// Add authentication header to fetch requests
function authFetch(url, options = {}) {
    const token = getToken();
    
    if (!token) {
        console.warn('No authentication token found');
        return fetch(url, options);
    }
    
    // Add authorization header
    const authOptions = {
        ...options,
        headers: {
            ...options.headers,
            'Authorization': `Bearer ${token}`
        }
    };
    
    return fetch(url, authOptions).then(response => {
        if (response.status === 401) {
            // Clear token and redirect to login on unauthorized
            console.error('Token expired or invalid, redirecting to login');
            logout();
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