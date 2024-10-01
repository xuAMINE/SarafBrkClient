import { showSpinner } from './spinner.js';
import apiClient from './apiClient.js';

document.addEventListener('DOMContentLoaded', function () {
  const loadingScreen = document.getElementById('loading-screen');
  const body = document.body;

  // Show the loading screen immediately
  loadingScreen.style.visibility = 'visible';

  // Function to check if the user is authenticated
  async function isAuthenticated() {
    try {
      const response = await apiClient.get('/api/v1/auth/check-session');
      
      // Check if the response is ok and session is valid
      const result = response.data;
      console.log(result);
      return result === 'Admin session valid';
    } catch (error) {
      console.error('Error checking session:', error);
      return false;
    }
  }

  // Add a small delay before starting the authentication check
  setTimeout(() => {
    isAuthenticated().then(authenticated => {
      // Add a delay before hiding the loading screen for better user experience
      setTimeout(() => {
        if (authenticated) {
          body.classList.remove('hidden-content');
          loadingScreen.style.visibility = 'hidden';
        } else {
          window.location.href = '../login/';
        } 
      }, 300); // Adjust this value to control the delay before hiding the loading screen (in milliseconds)
    });
  }, 300); // Adjust this value to control the initial delay before starting the authentication check (in milliseconds)
});

// Logout Functionality
document.querySelectorAll('.logoutButton').forEach(button => {
  button.addEventListener('click', async function() {
    try {
      const response = await apiClient.post('/api/v1/auth/logout', {});

      if (response.status === 200) {
        // Remove the tokens from localStorage after the request
        localStorage.removeItem('sb_token');
        localStorage.removeItem('sb_refreshToken');
        window.location.href = '../login/'; // Redirect to login page after logout
      } else {
        alert('Logout failed');
      }
    } catch (error) {
      console.error('Error during logout:', error);
      alert('Error during logout');
    }
  });
});


