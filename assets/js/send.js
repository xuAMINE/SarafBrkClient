import { showSpinner, hideSpinner } from './spinner.js';

let globalAmount;
let globalRip;

document.querySelectorAll('.send-transfer').forEach(button => {
  button.addEventListener('click', async function() {
    // Get token from local storage
    const token = localStorage.getItem('sb_token');
    
    // Get the form id
    const formId = this.getAttribute('data-form');
    
    // Get the input values
    if (formId === 'form-guest') {
      globalAmount = document.getElementById('amount').value;
      const ccp = document.getElementById('ccp').value;
      const cle = document.getElementById('cle').value;
      globalRip = ccp + cle;
    } else if (formId === 'form-user') {
      globalAmount = document.getElementById('amount-input').value;
      globalRip = document.getElementById('ccpNumber').innerText.trim();
    }

    // Create the JSON body
    const body = {
      amount: parseFloat(globalAmount),
      ccp: globalRip
    };

    // Send the POST request
    try {
      showSpinner();
      const response = await fetch('http://localhost:8088/api/v1/transfer/check-transfer-credentials', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(body)
      });

      if (!response.ok) {
        // If response status is not OK, handle error
        if (response.status === 400) {
          const errorData = await response.json();
          if (errorData.amount) {
            document.getElementById('amount-error').innerHTML = '<i class="fa fa-warning" aria-hidden="true" style="padding: 0 5px;"></i>' + errorData.amount;
          }
          if (errorData.ccp) {
            document.getElementById('ccp-error').innerHTML = '<i class="fa fa-warning" aria-hidden="true" style="padding: 0 5px;"></i>' + errorData.ccp;
          }
        } else {
          // Handle other status codes if necessary
          document.getElementById('amount-error').innerText = 'An error occurred. Please try again.';
        }
      } else {
        // Show the appropriate modal
        let selectedOption = document.querySelector('input[name="modalOption"]:checked');
        if (selectedOption) {
          let modalId = selectedOption.value;
          let modal = new bootstrap.Modal(document.getElementById(modalId));
          modal.show();

          document.getElementById('venmo-me').addEventListener('click', function() {
            // Venmo URL for Desktop
            const venmoUrlDesktop = `https://venmo.com/?txn=pay&recipients=${encodeURIComponent('@Uhammud')}&amount=${encodeURIComponent(globalAmount)}&note=${encodeURIComponent('DZD Exchange')}`;
            // Venmo URL for Mobile (iOS/Android)
            const venmoUrlMobile = `venmo://paycharge?txn=pay&recipients=${encodeURIComponent('@Uhammud')}&amount=${encodeURIComponent(globalAmount)}&note=${encodeURIComponent('DZD Exchange')}`;

            // Check if the user is on a mobile device
            const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
            const venmoUrl = isMobile ? venmoUrlMobile : venmoUrlDesktop;

            // Redirect to Venmo URL
            window.open(venmoUrl, '_blank');
          });
        } else {
          alert('Please select an option.');
        }
      }
    } catch (error) {
      console.error('Error:', error);
      document.getElementById('amount-error').innerText = 'An error occurred. Please try again.';
    } finally {
      hideSpinner();
    }
  });
});

// send the transfer when user clicks GOT IT
document.querySelectorAll('.make-transfer').forEach(button => {
  button.addEventListener('click', async function() {
    // Get token from local storage
    const token = localStorage.getItem('sb_token');
    
    // Use globalAmount and globalRip variables
    const body = {
        amount: parseFloat(globalAmount),
        ccp: globalRip
    };

    // Send the POST request
    try {
      showSpinner();
        const response = await fetch('http://localhost:8088/api/v1/transfer/add', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(body)
        });

        if (response.ok) {
            // Redirect to transfer-details.html after successful request
            window.location.href = 'transfer-details.html';
        } else {
            // Handle other status codes if necessary
            alert('An error occurred. Please try again.');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('An error occurred. Please try again.');
    } finally {
      hideSpinner();
    }
  });
});

function clearErrorMessage(id) {
  document.getElementById(id).textContent = '';
}

// Add event listeners to inputs to clear error messages on change
document.addEventListener('DOMContentLoaded', function () {
  const inputs = document.querySelectorAll('input');
  
  inputs.forEach(input => {
    input.addEventListener('input', function () {
      switch (input.id) {
        case 'ccp':
          clearErrorMessage('ccp-error');
          break;
        case 'amount':
          clearErrorMessage('amount-error');
          break;
        // Add cases for other inputs as needed
      }
    });
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