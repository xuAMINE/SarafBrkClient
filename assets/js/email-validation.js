import apiClient from './apiClient.js';

document.addEventListener('DOMContentLoaded', () => {
  // Select all input elements inside the form
  const inputs = document.querySelectorAll('#emailValidationForm input[type="text"]');

  inputs.forEach(input => {
    input.addEventListener('input', (event) => moveToNext(input, event));
    input.addEventListener('keydown', (event) => handleBackspace(input, event));
    input.addEventListener('paste', handlePaste);
  });
});

function moveToNext(element, event) {
  // Clear validation message
  document.getElementById('validation-message').innerHTML = '';

  // Only allow digits (0-9)
  if (!/^\d$/.test(event.data)) {
    element.value = '';
    return;
  }

  // Move to next input when a digit is entered
  if (event.inputType === "insertText" && element.value.length === element.maxLength) {
    let nextElement = element.parentElement.parentElement.nextElementSibling;
    if (nextElement && nextElement.querySelector('input')) {
      nextElement.querySelector('input').focus();
    }
  }
}

function handleBackspace(element, event) {
  // Check if the backspace key is pressed
  if (event.key === 'Backspace' && element.value.length === 0) {
    let previousElement = element.parentElement.parentElement.previousElementSibling;
    if (previousElement && previousElement.querySelector('input')) {
      let previousInput = previousElement.querySelector('input');
      previousInput.value = ''; // Clear the previous input
      previousInput.focus();
      // Move cursor to the end of previous input
      previousInput.setSelectionRange(previousInput.value.length, previousInput.value.length);
      event.preventDefault(); // Prevent default backspace behavior
    }
  }
}

function handlePaste(event) {
  // Get the pasted text
  const pastedData = (event.clipboardData || window.clipboardData).getData('text');

  // Only allow digits in pasted data
  if (!/^\d+$/.test(pastedData)) {
    event.preventDefault();
    return;
  }

  // Get all the input fields in the form
  const inputs = Array.from(document.querySelectorAll('#emailValidationForm input[type="text"]'));

  // Fill the inputs with the pasted data
  inputs.forEach((input, index) => {
    input.value = pastedData[index] || ''; // Use character from pasted data or clear if no more characters
  });

  // Focus the next empty input field, if any
  const nextEmptyInput = inputs.find(input => input.value === '');
  if (nextEmptyInput) {
    nextEmptyInput.focus();
  }

  // Prevent default paste behavior
  event.preventDefault();
}

async function collectValues(event) {
  event.preventDefault(); // Prevent default form submission

  let inputs = document.querySelectorAll('.form-control');
  let finalValue = '';
  inputs.forEach(input => {
    finalValue += input.value;
  });

  // Endpoint URL
  let endpoint = '/api/v1/auth/activate-account';
  let url = `${endpoint}?verToken=${finalValue}`;

  try {
    let response = await apiClient.get(url);
    console.log('Response received:', response);

    // Request was successful
    console.log('Activation request successful.');
    let modal = new bootstrap.Modal(document.getElementById('exampleModalNotification'));
    modal.show();

  } catch (error) {
    if (error.response) {
      if (error.response.status === 400) {
        let message = error.response.data;
        document.getElementById('validation-message').innerHTML =
          '<i class="fa fa-warning" aria-hidden="true" style="padding: 0 5px;"></i>' + message;
      } else {
        // Request failed
        console.error('Activation request failed with status:', error.response.status);
      }
    } else {
      // The request was made but no response was received or there was an error in setting up the request
      console.error('Error making activation request:', error.message);
    }
  }
}

document.getElementById('valid2').addEventListener('click', showVaid2);

function showVaid2() {
  let modal = new bootstrap.Modal(document.getElementById('exampleModalNotification'));
  modal.show();
}

// Attach collectValues() function to form submit event
document.getElementById('emailValidationForm').addEventListener('submit', collectValues);
document.getElementById('resenEmail').addEventListener('click', resendEmail);

function resendEmail() {
  const email = sessionStorage.getItem('sb_email');
  if (email) {
    apiClient.post('/api/v1/auth/resend-verification', { email: email })
      .then(response => {
        // Success, display success message
        document.getElementById('validation-message').innerHTML =
          '<i class="fa fa-check" aria-hidden="true" style="padding: 0 5px; color: green;"></i><span style="color: green;">Verification email has been resent.</span>';
        clearForm();
      })
      .catch(error => {
        if (error.response) {
          // The request was made and the server responded with a status code
          // that falls out of the range of 2xx
          console.error('Error:', error.response.data);
          document.getElementById('validation-message').innerHTML =
            '<i class="fa fa-warning" aria-hidden="true" style="padding: 0 5px;"></i>' + error.response.data;
        } else {
          // The request was made but no response was received
          console.error('Error making request:', error.message);
        }
      });
  } else {
    console.error('No email found in session storage.');
  }
}

function clearForm() {
  const form = document.getElementById('emailValidationForm');
  const firstInput = form.querySelector('input[type="text"]');

  // Clear all input fields
  form.reset();

  // Focus on the first input field
  firstInput.focus();
}
