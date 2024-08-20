document.addEventListener('DOMContentLoaded', function () {
  const loadingScreen = document.getElementById('loading-screen');
  const body = document.body;

  // Show the loading screen immediately
  loadingScreen.style.visibility = 'visible';

  // Function to check if the user is authenticated
  async function isAuthenticated() {
    const token = localStorage.getItem('sb_token');
    if (!token) {
      return false;
    }

    try {
      const response = await fetch('http://localhost:8088/api/v1/auth/check-session', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      // Check if the response is ok and session is valid
      if (response.ok) {
        const result = await response.text();
        return result === 'Admin session valid'; // Check if the response text is "true"
      } else {
        return false;
      }
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
          window.location.href = '../sign-in.html';
        } 
      }, 300); // Adjust this value to control the delay before hiding the loading screen (in milliseconds)
    });
  }, 300); // Adjust this value to control the initial delay before starting the authentication check (in milliseconds)
});