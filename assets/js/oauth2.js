// Function to initiate OAuth2 authentication process
function authenticate(provider) {
  window.location.href = `https://13.57.42.52:8088/oauth2/authorization/${provider}`;
}

// Function to store the OAuth2 token and handle redirect after successful login
function handleOAuth2Callback() {
  const urlParams = new URLSearchParams(window.location.search);
  const accessToken = urlParams.get('token');
  const refreshToken = urlParams.get('refreshToken');

  if (accessToken) {
    localStorage.setItem('sb_token', accessToken);
    localStorage.setItem('sb_refreshToken', refreshToken);
    // Clean up the URL to remove the token parameter
    window.history.replaceState({}, document.title, window.location.pathname);
  } else {
    console.error("No token received or token is invalid.");
  }
}

// Function to ensure the user is authenticated
function ensureAuthenticated() {
  const storedToken = localStorage.getItem('sb_token');

  if (!storedToken) {
    // No token found, redirect to the login page
    console.log("No token found in localStorage, redirecting to login page.");
    window.location.href = '../../login/';
  } else {
    console.log("User is authenticated with token:", storedToken);
    // Further checks for token validity can be added here
  }
}

// Initialize authentication check and handle OAuth2 callback if present
function initializeAuth() {
  if (window.location.search.includes('token')) {
    handleOAuth2Callback();  // Only called when redirected from OAuth2 provider
  }

  if (window.location.pathname.endsWith('/../recipient/')) {
    ensureAuthenticated();  // Ensure authentication on protected pages
  }
}

// Initialize authentication logic on page load
document.addEventListener('DOMContentLoaded', initializeAuth);
