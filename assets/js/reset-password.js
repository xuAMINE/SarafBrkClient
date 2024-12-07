import { showSpinner, hideSpinner } from './spinner.js';
import apiClient from './apiClient.js';

async function resetPassword() {
  const urlParams = new URLSearchParams(window.location.search);
  const token = urlParams.get('token');

  const newPassword = document.getElementById('password').value;
  const confirmPassword = document.getElementById('password-confirmation').value;

  const body = {
    newPassword: newPassword,
    confirmPassword: confirmPassword
  };

  try {
    showSpinner();
    
    // Use apiClient for the POST request
    const response = await apiClient.post(`/api/v1/user/reset-password?token=${token}`, body);

    if (response.status === 200) { // Assuming 200 OK for a successful password reset
      document.getElementById('resetPasswordSucess').innerHTML = `
        Password was changed successfully. 
        <a href="../../login/" style="text-decoration: underline; color: blue;">Login page?</a>`;
    } 
  } catch (error) {
    if (error.response) {
      // Handle specific status codes
      if (error.response.status === 400) {
        const errors = error.response.data;
        if (errors.message) {
          document.getElementById('resetPassword').innerHTML = '<i class="fa fa-warning" aria-hidden="true" style="padding: 0 5px;"></i>' + errors.message;
        } else {
          document.getElementById('resetPassword').innerHTML = '<i class="fa fa-warning" aria-hidden="true" style="padding: 0 5px;"></i>' + errors.newPassword;
        }
      } else {
        const errorData = error.response.data;
        console.error('Error:', errorData);
        alert(errorData);
      }
    } else {
      // Handle network or unexpected errors
      console.error('Network error:', error);
    }
  } finally {
    hideSpinner();
  }
}


document.getElementById('reset-password-btn').addEventListener('click', resetPassword);
