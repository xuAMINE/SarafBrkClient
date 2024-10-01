import apiClient from './apiClient.js';

document.getElementById('registerForm').addEventListener('submit', async function(event) {
  event.preventDefault();

  // Clear previous error messages
  document.querySelectorAll('small.text-danger').forEach(el => el.innerText = '');

  const formData = {
    firstname: document.getElementById('firstname').value,
    lastname: document.getElementById('lastname').value,
    email: document.getElementById('email').value,
    password: document.getElementById('password').value,
  };

  try {
    const response = await apiClient.post('/api/v1/auth/register', formData);

    if (response.status === 201) { // Assuming 201 Created for successful registration
      sessionStorage.setItem('sb_email', formData.email);
      window.location.href = './email-validation.html';
    }
  } catch (error) {
    if (error.response) {
      // Handle specific status codes
      if (error.response.status === 409) { // Handle email already in use
        let modalText = document.getElementById('modal-email');
        modalText.innerHTML = `An account with Email <strong>${formData.email}</strong> already exists`;
        $('#userExist').modal('show');
      } else if (error.response.status === 400) {
        const errorMessages = error.response.data;
        // Display error messages
        for (const [field, message] of Object.entries(errorMessages)) {
          document.getElementById(`${field}-error`).innerHTML = '<i class="fa fa-warning" aria-hidden="true" style="padding: 0 5px;"></i>' + message;
        }
      } else {
        // Handle other errors
        console.error('An error occurred:', error.response.statusText);
      }
    } else {
      // Handle network or unexpected errors
      console.error('An error occurred:', error);
    }
  }
});


// Add event listeners to clear error messages when input fields are changed
document.querySelectorAll('#registerForm input').forEach(input => {
  input.addEventListener('input', function() {
    document.getElementById(`${this.id}-error`).innerText = '';
  });
});
