import { showSpinner, hideSpinner } from './spinner.js';

document.getElementById('check-session').addEventListener('click', function() {
  const token = localStorage.getItem('sb_token');

  if (token) {
      showSpinner();
      fetch('http://localhost:8088/api/v1/auth/check-session', {
          method: 'GET',
          headers: {
              'Authorization': `Bearer ${token}`  // Include the "Bearer " prefix
          }
      })
      .then(response => response.text())  // Use .text() to handle plain text response
      .then(result => {
          hideSpinner();
          if (result === 'true') {
              window.location.href = 'recipients.html';
          } else if (result === 'Admin session valid') {
              window.location.href = './admin/manage-transfers.html';  // Redirect to admin page
          } else {
              window.location.href = 'sign-in.html';
          }
      })
      .catch(error => {
          console.error('Error verifying session:', error);
          window.location.href = 'sign-in.html';
          hideSpinner();
      });
  } else {
      window.location.href = 'sign-in.html';
  }
});


document.getElementById('changePassword').addEventListener('click', async () => {
  const currentPassword = document.getElementById('currentPassword').value;
  const newPassword = document.getElementById('newPassword').value;
  const confirmNewPassword = document.getElementById('confirmNewPassword').value;
  const token = localStorage.getItem('sb_token'); 

  const requestBody = {
    currentPassword: currentPassword,
    newPassword: newPassword,
    confirmationPassword: confirmNewPassword
  };
  
  try {
    showSpinner();
    const response = await fetch('http://localhost:8088/api/v1/users', {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(requestBody)
    });

    hideSpinner();

    if (response.status === 200) {
      alert('Password changed successfully');
    } else if (response.status === 400) {
      const errorText = await response.json();
      displayErrorMessages(errorText);
    }
  } catch (error) {
    hideSpinner();
    console.error('Error:', error);
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

  



document.getElementById('logoutButton').addEventListener('click', function() {
    const token = localStorage.getItem('sb_token');

    if (token) {
        fetch('http://localhost:8088/api/v1/auth/logout', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}` // Include the token in the request headers
        },
        body: JSON.stringify({ token }) // Optionally include the token in the request body if needed
        })
        .then(response => {
        if (response.ok) {
            // Remove the token from localStorage after the request
            localStorage.removeItem('sb_token');
            window.location.href = 'sign-in.html'; // Redirect to login page after logout
        } else {
            window.location.href = 'sign-in.html'; // Redirect to login page after logout
        }
        })
        .catch(error => {
        console.error('Error during logout:', error);
        });
    } else {
        alert('Your already logged out');
        window.location.href = 'sign-in.html'; // Redirect to login page after logout
    }
});

// Hide account button when user is not logged in
document.addEventListener("DOMContentLoaded", function() {
    const accountButton = document.getElementById('account-button');
  
    // Function to check session validity
    async function checkSession() {
      const token = localStorage.getItem('sb_token'); // Replace with your method of retrieving the token
  
      if (!token) {
        accountButton.style.display = 'none';
        return;
      }
  
      try {
        const response = await fetch('http://localhost:8088/api/v1/auth/check-session', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
  
        const isValid = await response.json();
  
        if (isValid) {
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


function togglePasswordVisibility(inputId, toggleIconId) {
    const input = document.getElementById(inputId);
    const icon = document.getElementById(toggleIconId);
    if (input.type === 'password') {
      input.type = 'text';
      icon.classList.remove('fa-eye');
      icon.classList.add('fa-eye-slash');
    } else {
      input.type = 'password';
      icon.classList.remove('fa-eye-slash');
      icon.classList.add('fa-eye');
    }
  }