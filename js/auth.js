// Authentication utilities

// Check if user is logged in
function isLoggedIn() {
    // Check for token in cookies
    const cookies = document.cookie.split(';');
    const tokenCookie = cookies.find(cookie => cookie.trim().startsWith('token='));
    return tokenCookie !== undefined;
}

// Get token
function getToken() {
    // Get token from cookies
    const cookies = document.cookie.split(';');
    const tokenCookie = cookies.find(cookie => cookie.trim().startsWith('token='));
    if (tokenCookie) {
        return tokenCookie.split('=')[1];
    }
    return null;
}

// Logout user
function logout() {
    // Clear token cookie by setting it to expire in the past
    document.cookie = 'token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
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
    
    // Add credentials and merge with existing options
    const authOptions = {
        ...options,
        credentials: 'include',  // Always include credentials
        headers: {
            ...options.headers,
            'Content-Type': 'application/json'
        }
    };
    
    // Only add Authorization header if we have a token
    if (token) {
        authOptions.headers['Authorization'] = `Bearer ${token}`;
    }
    
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