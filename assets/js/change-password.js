import { showSpinner, hideSpinner } from './spinner.js';
import apiClient from './apiClient.js';

document.getElementById('check-session').addEventListener('click', async function() {
  const token = localStorage.getItem('sb_token');

  if (token) {
    showSpinner();
    try {
      const response = await apiClient.get('/api/v1/auth/check-session');
      const result = response.data;  // Assuming the server returns plain text in response.data

      hideSpinner();
      if (result === 'User session valid') {
        window.location.href = 'recipients.html';
      } else if (result === 'Admin session valid') {
        window.location.href = 'manage-transfers.html';  // Redirect to admin page
      } else {
        window.location.href = 'sign-in.html';
      }
    } catch (error) {
      console.error('Error verifying session:', error);
      window.location.href = 'sign-in.html';
      hideSpinner();
    }
  } else {
    window.location.href = 'sign-in.html';
  }
});

// Load password change when clicked on other pages.
window.onload = function() {
  const urlParams = new URLSearchParams(window.location.search);
  const showModal = urlParams.get('showChangePasswordModal');

  if (showModal) {
      // Trigger the modal to open
      const passwordModal = new bootstrap.Modal(document.getElementById('exampleModalSignup'));
      passwordModal.show();
  }
};


document.getElementById('changePassword').addEventListener('click', async () => {
  const currentPassword = document.getElementById('currentPassword').value;
  const newPassword = document.getElementById('newPassword').value;
  const confirmNewPassword = document.getElementById('confirmNewPassword').value;

  const requestBody = {
    currentPassword: currentPassword,
    newPassword: newPassword,
    confirmationPassword: confirmNewPassword
  };

  try {
    showSpinner();
    console.log('start change');
    const response = await apiClient.patch('/api/v1/user', requestBody);
    hideSpinner();

    if (response.status === 200) {
      alert('Password changed successfully');
    } 
  } catch (error) {
    hideSpinner();

    // Check if error has a response with data
    if (error.response && error.response.data) {
      displayErrorMessages(error.response.data);
    } else {
      console.error('Error:', error);
    }
  }
});

function displayErrorMessages(errorData) {
  const passwordError = document.getElementById('password-error');
  const newPasswordError = document.getElementById('new-password-error');
  const icon = '<i class="fa fa-warning" aria-hidden="true" style="padding: 0 5px;"></i>';

  // Clear previous errors
  passwordError.innerHTML = '';
  newPasswordError.innerHTML = '';

  if (errorData.message) {
    if (errorData.message === "Incorrect password") {
      passwordError.innerHTML = icon + errorData.message;
    } else {
      newPasswordError.innerHTML = icon + errorData.message;
    }
  }

  if (errorData.newPassword) {
      newPasswordError.innerHTML = icon + errorData.newPassword;
  }
}


document.getElementById('logoutButton').addEventListener('click', async function() {
  const token = localStorage.getItem('sb_token');

  if (token) {
    try {
      await apiClient.post('/api/v1/auth/logout', { token });
      // Remove the token from localStorage after the request
      localStorage.removeItem('sb_token');
      window.location.href = 'sign-in.html'; // Redirect to login page after logout
    } catch (error) {
      console.error('Error during logout:', error);
      window.location.href = 'sign-in.html'; // Redirect to login page after logout
    }
  } else {
    alert('You are already logged out');
    window.location.href = 'sign-in.html'; // Redirect to login page after logout
  }
});

// Load Account Drop Down
document.addEventListener("DOMContentLoaded", function() {
  const accountButton = document.getElementById('accountDropDown');

  // Function to check session validity
  async function checkSession() {
    const token = localStorage.getItem('sb_token');

    if (!token) {
      accountButton.style.display = 'none';
      return;
    }

    try {
      const response = await apiClient.get('/api/v1/auth/check-session');
      const isValid = response.data; // Assuming the server returns plain text

      if (isValid === 'User session valid' || isValid === 'Admin session valid') {
        accountButton.style.display = 'block';
      } else {
        accountButton.style.display = 'none';
      }
    } catch (error) {
      console.error('Error checking session:', error);
      accountButton.style.display = 'none';
    }
  }

  checkSession();
});