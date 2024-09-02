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
        // Show the appropriate modal or trigger PayPal
        let selectedOption = document.querySelector('input[name="modalOption"]:checked');
        if (selectedOption) {
          let paymentMethod = selectedOption.value;
          
          if (paymentMethod === 'paypal') {
            // If PayPal is selected, trigger the PayPal form submission
            window.open('https://www.paypal.com/cgi-bin/webscr?cmd=_s-xclick&hosted_button_id=5UL8W5K7BB24G', '_blank');
          } else {
            // Handle other payment methods (Zelle, Venmo)
            let modal = new bootstrap.Modal(document.getElementById(paymentMethod));
            modal.show();

            if (paymentMethod === 'modal2') {
              document.getElementById('venmo-me').addEventListener('click', function() {
                const venmoUrlDesktop = `https://venmo.com/?txn=pay&recipients=${encodeURIComponent('@Uhammud')}&amount=${encodeURIComponent(globalAmount)}&note=${encodeURIComponent('DZD Exchange')}`;
                const venmoUrlMobile = `venmo://paycharge?txn=pay&recipients=${encodeURIComponent('@Uhammud')}&amount=${encodeURIComponent(globalAmount)}&note=${encodeURIComponent('DZD Exchange')}`;
                const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
                const venmoUrl = isMobile ? venmoUrlMobile : venmoUrlDesktop;

                window.open(venmoUrl, '_blank');
              });
            }
          }
        } else {
          alert('Please select a payment option.');
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
    restrictInput('cle', 2);
    restrictInput('ccp', 12);
  });



document.getElementById('copyNumber').addEventListener('click', () => {
  navigator.clipboard.writeText('925-496-8027').then(function() {
    var copiedMessage = document.getElementById('copyNumber');
    copiedMessage.textContent = 'copied!';
    setTimeout(function() {
        copiedMessage.textContent = 'copie number';
    }, 1200);
  }, function(err) {
      console.error('Could not copy text: ', err);
  });
})