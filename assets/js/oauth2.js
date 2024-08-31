// Function to handle authentication response
function handleAuthResponse(response) {
  if (response.accessToken) {
      // Store the token in localStorage
      localStorage.setItem('sb_token', response.accessToken);
      // Redirect the user to a protected route
      window.location.href = '/transfer-details.html';
  } else {
      // Handle error or redirect back to the login page
      window.location.href = '/sign-in.html';
  }
}

// Function to initiate OAuth2 authentication process
function authenticate(provider) {
  // Redirect the user to the OAuth2 provider's authorization page
  window.location.href = `http://localhost:8088/oauth2/authorization/${provider}`;
}

// Function to handle OAuth2 callback
async function handleOAuth2Callback() {
  const urlParams = new URLSearchParams(window.location.search);
  const accessToken = urlParams.get('access_token'); // Replace with the actual key if different

  if (accessToken) {
      // Store the token in localStorage
      localStorage.setItem('sb_token', accessToken);
      // Redirect the user to a protected route
      window.location.href = '/transfer-details.html';
  } else {
      // Handle error or redirect back to the login page
      window.location.href = '/sign-in.html';
  }
}

// Call handleOAuth2Callback on page load if it's an OAuth2 callback
document.addEventListener('DOMContentLoaded', () => {
  if (window.location.pathname === '/oauth2/callback') { // Adjust this path as needed
      handleOAuth2Callback();
  }
});
