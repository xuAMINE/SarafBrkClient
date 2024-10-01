import { showSpinner, hideSpinner } from './spinner.js';
import apiClient from './apiClient.js';

document.getElementById('loginForm').addEventListener('submit', async (e) => {
  e.preventDefault();

  // Clear previous error message
  document.getElementById('password-error').innerHTML = ''; 

  showSpinner();  // Start the spinner right before making the request

  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;

  try {
    const response = await apiClient.post('/api/v1/auth/authenticate', {
      email,
      password
    });

    // Successful login
    const data = response.data;
    localStorage.setItem('sb_token', data.access_token);
    localStorage.setItem('sb_refreshToken', data.refresh_token);
    if (data.role === 'ADMIN' || data.role === 'MANAGER') {
      window.location.href = '../admin-transfer/';
    } else {
      window.location.href = '../recipient/';
    }
  } catch (error) {
    // Check if the error has a response
    if (error.response) {
      const errorData = error.response.data;
      console.log("errot data", errorData);

      // Handle specific error messages
      if (errorData.message) {
        if (errorData.message === 'Email not verified') {
          sessionStorage.setItem('sb_email', email);
          document.getElementById('password-error').innerHTML = `
            Please verify your email before logging in. 
            <a href="../email-validation/" style="text-decoration: underline; color: blue;">Verify Email</a>`;
        } else if (errorData.message === 'Invalid credentials') {
          document.getElementById('password-error').innerHTML = `
            The email or password you’ve entered is incorrect. 
            <a href="#" data-bs-toggle="modal" data-bs-target="#passwordResetModal" style="text-decoration: underline; color: blue;">Forgot Password?</a>`;
        } else {
          alert('Login failed: ' + errorData.message);
        }
      } else {
        alert('An unexpected error occurred. Please try again.');
      }
    } else {
      console.error('Error during Axios request:', error);
      alert("An error occurred while trying to log in. Please try again.");
    }
  } finally {
    hideSpinner();  // Hide the spinner no matter what happens
  }
});

document.getElementById('requestPasswordReset').addEventListener('click', async function (event) {
  event.preventDefault();

  const email = document.getElementById('resetEmail').value;

  try {
    const response = await apiClient.post('/api/v1/user/forgot-password', {
      email: email
    });

    // Handle success
    document.getElementById('email-reset').innerText = 'A reset password link has been sent to your email.';

  } catch (error) {
    if (error.response) {
      // Server responded with a status other than 2xx
      document.getElementById('email-reset').innerHTML = 
        '<i class="fa fa-warning" aria-hidden="true" style="padding: 0 5px;"></i> An account with this email does not exist in our system.';
    } else {
      // Handle network or unexpected errors
      console.error('Error:', error);
      alert("Unable to connect to the server. Please try again later.");
    }
  }
});


// prevent default submit
document.getElementById('passwordResetForm').addEventListener('submit', function (event) {
  event.preventDefault();
  document.getElementById('requestPasswordReset').click(); // Trigger button click
});


