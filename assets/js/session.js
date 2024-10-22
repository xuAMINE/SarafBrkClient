import { showSpinner } from './spinner.js';
import apiClient from './apiClient.js';

document.addEventListener('DOMContentLoaded', function () {
  const loadingScreen = document.getElementById('loading-screen');
  const body = document.body;
  const dropdownMenuAccount = document.getElementById('accountName'); // Select the account dropdown

  // Show the loading screen immediately
  loadingScreen.style.visibility = 'visible';

  // Function to check if the user is authenticated
  async function isAuthenticated() {
    try {
      const response = await apiClient.get('/api/v1/auth/check-session');
      
      // Check if the response is ok and session is valid
      const result = response.data;
      console.log(result);
      return result === 'User session valid' || result === 'Admin session valid';
    } catch (error) {
      console.error('Error checking session:', error);
      return false;
    }
  }

  // Function to get and display the username
  async function getName() {
    try {
      const response = await apiClient.get('/api/v1/user/name');
      
      // Fix typo from 'response.date' to 'response.data'
      const name = response.data;
      
      dropdownMenuAccount.textContent = name; // Set the username in the dropdown
    } catch (error) {
      if (error.response) {
        console.log('Invalid token:', error.response.data.message);
      } else {
        console.error('Error:', error.message);
      }
    }
  }

  // Wait for the user to be authenticated and then show the page
  setTimeout(() => {
    isAuthenticated().then(authenticated => {
      setTimeout(async () => {
        if (authenticated) {
          body.classList.remove('hidden-content');
          loadingScreen.style.visibility = 'hidden';

          // Call getName() to set the username in the dropdown
          await getName();
        } else {
          window.location.href = '../login/';
        } 
      }, 300); 
    });
  }, 300); 
});

// Logout Function
document.querySelectorAll('.logoutButton').forEach(button => {
  button.addEventListener('click', async function() {
    try {
      const response = await apiClient.post('/api/v1/auth/logout', {});

      if (response.status === 200) {
        localStorage.removeItem('sb_token');
        localStorage.removeItem('sb_refreshToken');
        window.location.href = '../login/';
      } else {
        alert('Logout failed');
      }
    } catch (error) {
      console.error('Error during logout:', error);
      alert('Error during logout');
    }
  });
});
