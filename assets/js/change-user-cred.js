import { showSpinner, hideSpinner } from './spinner.js';
import apiClient from './apiClient.js';

// Check session
document.getElementById('check-session').addEventListener('click', async function () {
  const token = localStorage.getItem('sb_token');

  if (token) {
    showSpinner();
    try {
      const response = await apiClient.get('/api/v1/auth/check-session');
      const result = response.data;  // Assuming the server returns plain text in response.data

      hideSpinner();
      if (result === 'User session valid') {
        window.location.href = './recipient/';
      } else if (result === 'Admin session valid') {
        window.location.href = './admin-transfer/index.html';  // Redirect to admin page
      } else {
        window.location.href = './login/';
      }
    } catch (error) {
      console.error('Error verifying session:', error);
      window.location.href = './login/';
      hideSpinner();
    }
  } else {
    window.location.href = './login/';
  }
});

// Load change Password modal when open from a diff page
document.addEventListener('DOMContentLoaded', function () {
  const urlParams = new URLSearchParams(window.location.search);
  const changePasswordModal = urlParams.get('showChangePasswordModal');
  const updateNumberModal = urlParams.get('showUpdatePhoneNumberModal');

  if (changePasswordModal) {
    // Trigger the modal to open
    const modalElement = document.getElementById('exampleModalSignup');
    const passwordModal = new bootstrap.Modal(modalElement);

    modalElement.addEventListener('shown.bs.modal', function () {
      // Focus on the first input field after the modal is fully visible
      document.getElementById('currentPassword').focus();

      // Reset the form inputs to be empty
      document.getElementById('currentPassword').value = '';
      document.getElementById('newPassword').value = '';
      document.getElementById('confirmNewPassword').value = '';
    });

    passwordModal.show();
  }

  if (updateNumberModal) {
    // Trigger the modal to open
    const modalElement = document.getElementById('PhoneNumberModal');
    const updateNumberModal = new bootstrap.Modal(modalElement);

    updateNumberModal.show();
  }
});

// PATCH change-password
document.getElementById('changePassword').addEventListener('click', async (event) => {
  event.preventDefault();

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
      const changePasswordModalElement = document.getElementById('exampleModalSignup');
      const changePasswordModal = bootstrap.Modal.getInstance(changePasswordModalElement);
      changePasswordModal.hide();

      const passwordChangedModal = new bootstrap.Modal(document.getElementById('passwordChangedModal'));
      passwordChangedModal.show();
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

// POST log out
document.getElementById('logoutButton').addEventListener('click', async function () {
  const token = localStorage.getItem('sb_token');

  if (token) {
    try {
      await apiClient.post('/api/v1/auth/logout', { token });
      // Remove the token from localStorage after the request
      localStorage.removeItem('sb_token');
      window.location.href = './login/'; // Redirect to login page after logout
    } catch (error) {
      console.error('Error during logout:', error);
      window.location.href = './login/'; // Redirect to login page after logout
    }
  } else {
    alert('You are already logged out');
    window.location.href = './login/'; // Redirect to login page after logout
  }
});

// Load Account Drop Down
document.addEventListener("DOMContentLoaded", function () {
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

// Update Phone Number
document.getElementById("addPhoneNumber").addEventListener("click", function () {
  // Get the phone number from the input field
  const phoneNumberInput = document.getElementById("phoneInput").value;

  // Remove all spaces from the phone number input
  const cleanedPhoneNumber = phoneNumberInput.replace(/\s+/g, '');
  console.log(cleanedPhoneNumber);

  // Encode the cleaned phone number for URL
  const encodedPhoneNumber = encodeURIComponent(cleanedPhoneNumber);

  // Define the endpoint URL with the encoded phone number
  const url = `/api/v1/user/update-phone?phoneNumber=${encodedPhoneNumber}`;

  // Send PUT request using axios (or apiClient)
  apiClient.put(url)
    .then(response => {
      console.log("Phone number updated successfully:", response.data);

      const changePhoneElemnt = document.getElementById('PhoneNumberModal');
      const changePhoneModal = bootstrap.Modal.getInstance(changePhoneElemnt);
      changePhoneModal.hide();

      const phoneChangedModal = new bootstrap.Modal(document.getElementById('phoneChangedModal'));
      phoneChangedModal.show();

    })
    .catch(error => {
      console.error("Error updating phone number:", error);
      // Optionally display an error message
    });
});
