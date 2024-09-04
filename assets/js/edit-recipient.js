import { showSpinner, hideSpinner } from './spinner.js';
import apiClient from './apiClient.js';

document.addEventListener('DOMContentLoaded', function () {
  const urlParams = new URLSearchParams(window.location.search);
  
  const firstName = urlParams.get('firstName');
  const lastName = urlParams.get('lastName');
  const ccpNumber = urlParams.get('ccpNumber');
  const phoneNumber = urlParams.get('phoneNumber');
  const doContact = urlParams.get('doContact');

  if (firstName) 
    document.getElementById('firstName').value = decodeURIComponent(firstName);
  if (lastName)
    document.getElementById('lastName').value = decodeURIComponent(lastName);
  if (ccpNumber)
    document.getElementById('ccpNumber').textContent = decodeURIComponent(ccpNumber);
  if (doContact)
    document.getElementById('doContact').textContent = decodeURIComponent(doContact);
  if (phoneNumber)
    document.getElementById('phoneNumber').value = decodeURIComponent(phoneNumber.substring(1));
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
    
    try {
      const response = await apiClient.put(`/api/v1/recipient/${ccp}`, requestBody);

      if (response.status === 200 || response.status === 201) {
        let modal = new bootstrap.Modal(document.getElementById('recipient-added'));
        modal.show();

        setTimeout(() => {
          window.location.href = 'recipients.html'; // Replace with your redirect URL
        }, 1500);
      }
    } catch (error) {
      if (error.response && error.response.status === 400) {
        const errors = error.response.data;

        // Map the errors to the corresponding <p> elements
        if (errors.firstName || errors.lastName) {
          document.getElementById('name-error').innerHTML = '<i class="fa fa-warning" aria-hidden="true" style="padding: 0 5px;"></i>' + (errors.firstName ? errors.firstName : errors.lastName);
        }
      } else if (error.response && error.response.data === 'Duplicate key value violates unique constraint.') {
        let modal = new bootstrap.Modal(document.getElementById('recipient-exist'));
        modal.show();
      } else {
        alert('Error: ' + error.message);
      }
    } finally {
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