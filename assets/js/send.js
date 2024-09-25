import { showSpinner, hideSpinner } from './spinner.js';
import apiClient from './apiClient.js';

let globalAmount;
let globalRip;
let paymentOption;
let paymentCode;

// Check Transfer
document.addEventListener('DOMContentLoaded', function () {
  // Handle both form submission (ENTER key) and button click
  document.querySelectorAll('form').forEach(form => {
    form.addEventListener('submit', function (event) {
      event.preventDefault(); // Prevent the default form submission
      handleTransfer(this.getAttribute('id')); // Trigger the send transfer logic
    });
  });

  document.querySelectorAll('.send-transfer').forEach(button => {
    button.addEventListener('click', function () {
      const formId = this.getAttribute('data-form');
      handleTransfer(formId); // Trigger the send transfer logic
    });
  });

  // Function to handle transfer logic
  async function handleTransfer(formId) {
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

      const response = await apiClient.post('/api/v1/transfer/check-transfer-credentials', body);

      // Check if the response is successful
      if (response.status === 200 || response.status === 201) {
        // Show the appropriate modal or trigger PayPal
        let selectedOption = document.querySelector('input[name="modalOption"]:checked');
        if (selectedOption) {
          let paymentMethod = selectedOption.value;

          paymentOption = paymentMethod.slice(5);
          console.log('payment method: ', paymentOption); // delete
          paymentCode = generateRandomFourDigit();
          document.getElementById(paymentMethod + 'Code').innerText = 'Code: ' + paymentCode;

          if (paymentMethod === 'modalVENMO') {
            document.getElementById('venmo-me').addEventListener('click', function () {
              const venmoUrlDesktop = `https://venmo.com/?txn=pay&recipients=${encodeURIComponent('@Uhammud')}&amount=${encodeURIComponent(globalAmount)}&note=${encodeURIComponent('DZD Exchange')}`;
              const venmoUrlMobile = `venmo://paycharge?txn=pay&recipients=${encodeURIComponent('@Uhammud')}&amount=${encodeURIComponent(globalAmount)}&note=${encodeURIComponent('DZD Exchange')}`;
              const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
              const venmoUrl = isMobile ? venmoUrlMobile : venmoUrlDesktop;

              window.open(venmoUrl, '_blank');
            });
          }

          let modal = new bootstrap.Modal(document.getElementById(paymentMethod));
          modal.show();
        } else {
          alert('Please select a payment option.');
        }
      }
    } catch (error) {
      if (error.response && error.response.status === 400) {
        const errorData = error.response.data;

        if (errorData.amount) {
          document.getElementById('amount-error').innerHTML = '<i class="fa fa-warning" aria-hidden="true" style="padding: 0 5px;"></i>' + errorData.amount;
        }
        if (errorData.ccp) {
          document.getElementById('ccp-error').innerHTML = '<i class="fa fa-warning" aria-hidden="true" style="padding: 0 5px;"></i>' + errorData.ccp;
        }
      } else {
        // Handle other errors
        document.getElementById('amount-error').innerText = 'An error occurred. Please try again.';
      }
    } finally {
      hideSpinner();
    }
  }
});

// send the transfer when user clicks GOT IT
document.querySelectorAll('.make-transfer').forEach(button => {
  button.addEventListener('click', async function () {
    // Get token from local storage

    // Use globalAmount and globalRip variables
    const body = {
      amount: parseFloat(globalAmount),
      ccp: globalRip,
      paymentMethod: paymentOption,
      code: paymentCode
    };

    // Send the POST request
    try {
      showSpinner();
      const response = await apiClient.post('/api/v1/transfer/add', body);

      if (response.status === 201) {

        // Ensure modal element is found correctly
        const modalElement = document.getElementById('transferSucessModal');
        if (!modalElement) {
          return;
        }

        // Initialize and show the Bootstrap modal
        const modal = new bootstrap.Modal(modalElement);
        modal.show();

        setTimeout(() => {
          window.location.href = '../transfer/'; // Fixed typo here as well
        }, 1500);
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


// compy Phone Number
document.getElementById('copyNumber').addEventListener('click', () => {
  navigator.clipboard.writeText('925-496-8027').then(function () {
    var copiedMessage = document.getElementById('copyNumber');
    copiedMessage.textContent = 'copied!';
    setTimeout(function () {
      copiedMessage.textContent = 'copie number';
    }, 1200);
  }, function (err) {
    console.error('Could not copy text: ', err);
  });
})

function generateRandomFourDigit() {
  return Math.floor(1000 + Math.random() * 9000);
}