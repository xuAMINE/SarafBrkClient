import { showSpinner, hideSpinner } from './spinner.js';

document.addEventListener('DOMContentLoaded', function () {
  const urlParams = new URLSearchParams(window.location.search);
  const ccpNumber = urlParams.get('ccpNumber');
  const doContact = urlParams.get('doContact');

  document.getElementById('ccpNumber').textContent = decodeURIComponent(ccpNumber);
  document.getElementById('doContact').textContent = decodeURIComponent(doContact);
});

document.addEventListener('DOMContentLoaded', function() {
  const form = document.getElementById('contact-form');

  form.addEventListener('submit', async (event) => {
    event.preventDefault(); // Prevent the default form submission
    showSpinner();
    // Gather form data
    const firstName = document.getElementById('firstName').value;
    const lastName = document.getElementById('lastName').value;
    const phoneNumber = '0' + document.getElementById('phoneNumber').value;
    const ccp = document.getElementById('ccpNumber').innerText.trim();
    const doContact = document.getElementById('doContact').checked;

    // Clear previous error messages
    document.getElementById('name-error').textContent = '';

    // Create the request body
    const requestBody = {
      firstName: firstName,
      lastName: lastName,
      phoneNumber: phoneNumber,
      doContact: doContact
    };

    const token = localStorage.getItem('sb_token');

    if (!token) {
      console.error('No token found');
      hideSpinner();
      return;
    }
    
    try {
      const response = await fetch(`http://localhost:8088/api/v1/recipient/${ccp}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + token
        },
        body: JSON.stringify(requestBody)
      });

      if (response.ok) {
        let modal = new bootstrap.Modal(document.getElementById('recipient-added'));
        modal.show();

        setTimeout(() => {
          window.location.href = 'recipients.html'; // Replace with your redirect URL
        }, 1500);
      } else if (response.status === 400) {
        const errors = await response.json();
        
        // Map the errors to the corresponding <p> elements
        if (errors.firstName || errors.lastName) {
          document.getElementById('name-error').innerHTML = '<i class="fa fa-warning" aria-hidden="true" style="padding: 0 5px;"></i>' + (errors.firstName ? errors.firstName : errors.lastName);
        }
      } else if (errorText === 'Duplicate key value violates unique constraint.') {
        let modal = new bootstrap.Modal(document.getElementById('recipient-exist'));
        modal.show();
      } else {
        alert('Error');
      }
    } catch (error) {
      console.error('Network or other error:', error);
    } {
      hideSpinner();
    }
  });
});

  // Format phone number as user types
document.addEventListener('DOMContentLoaded', function() {
  const phoneNumberInput = document.getElementById('phoneNumber');

  phoneNumberInput.addEventListener('input', function() {
    let value = this.value.replace(/\D/g, ''); // Remove all non-digit characters
    if (value.length > 3) {
        value = value.slice(0, 3) + ' ' + value.slice(3);
    }
    if (value.length > 6) {
        value = value.slice(0, 6) + ' ' + value.slice(6);
    }
    if (value.length > 9) {
        value = value.slice(0, 9) + ' ' + value.slice(9);
    }
    // Restrict to 12 characters
    if (value.length > 12) {
        value = value.slice(0, 12);
    }
    this.value = value;
  });
});