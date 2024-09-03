import { showSpinner, hideSpinner } from './spinner.js';
import apiClient from './apiClient.js';

function toggleTextColor() {
  const checkbox = document.getElementById('doContact');
  const label = document.getElementById('contactLabel');
  if (checkbox.checked) {
    label.classList.remove('text-danger');
    label.classList.add('text-success');
  } else {
    label.classList.remove('text-success');
    label.classList.add('text-danger');
  }
}
  
// Initial call to set the correct color on page load
document.addEventListener('DOMContentLoaded', (event) => {
  toggleTextColor();
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

document.addEventListener('DOMContentLoaded', function() {
  const form = document.getElementById('contact-form');

  form.addEventListener('submit', async (event) => {
    event.preventDefault(); // Prevent the default form submission
    showSpinner();

    // Gather form data
    const firstName = document.getElementById('firstName').value;
    const lastName = document.getElementById('lastName').value;
    const ccp = document.getElementById('ccp').value;
    const cle = document.getElementById('cle').value;
    const rip = ccp + cle;
    const phoneNumber = '0' + document.getElementById('phoneNumber').value;
    const doContact = document.getElementById('doContact').checked;

    // Clear previous error messages
    document.getElementById('name-error').textContent = '';
    document.getElementById('ccp-error').textContent = '';

    // Create the request body
    const requestBody = {
      firstName: firstName,
      lastName: lastName,
      ccp: rip,
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
      const response = await apiClient.post('/api/v1/recipient/add', requestBody, {
        headers: {
          'Authorization': 'Bearer ' + token
        }
      });

      if (response.status === 201) {
        let modal = new bootstrap.Modal(document.getElementById('recipient-added'));
        modal.show();

        setTimeout(() => {
          window.location.href = 'recipients.html'; // Replace with your redirect URL
        }, 1500);
      }
    } catch (error) {
      if (error.response) {
        // Axios-specific error handling
        const { status, data } = error.response;

        if (status === 400) {
          // Map the errors to the corresponding <p> elements
          if (data.firstName || data.lastName) {
            document.getElementById('name-error').innerHTML = '<i class="fa fa-warning" aria-hidden="true" style="padding: 0 5px;"></i>' + (data.firstName ? data.firstName : data.lastName);
          }
          if (data.ccp) {
            document.getElementById('ccp-error').innerHTML = '<i class="fa fa-warning" aria-hidden="true" style="padding: 0 5px;"></i>' + data.ccp;
          }
        } else if (status === 409) {
          let modal = new bootstrap.Modal(document.getElementById('recipient-exist'));
          modal.show();
        } else {
          alert('Error');
        }
      } else {
        // Network or other errors
        console.error('Network or other error:', error);
      }
    } finally {
      hideSpinner();
    }
  });
});

  
  // Restrict input to digits only and limit length
  document.addEventListener('DOMContentLoaded', function() {
    function restrictInput(inputId, maxLength) {
      const inputElement = document.getElementById(inputId);
  
      inputElement.addEventListener('input', function(e) {
        // Remove non-numeric characters
        this.value = this.value.replace(/[^0-9]/g, '');
  
        // Limit to the specified number of digits
        if (this.value.length > maxLength) {
          this.value = this.value.slice(0, maxLength);
        }
      });
    }
  
    // Apply the restriction to specific input fields
    restrictInput('cle', 2); // Limits to 2 digits
    restrictInput('ccp', 12); // Limits to 10 digits
  });
