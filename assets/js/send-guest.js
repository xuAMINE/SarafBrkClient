document.getElementById('send-guest').addEventListener('click', async function() {
  console.log('test');
  // Get token from local storage
  const token = localStorage.getItem('sb_token');
  
  // Get the input values
  const amount = document.getElementById('amount').value;
  const ccp = document.getElementById('ccp').value;
  const cle = document.getElementById('cle').value;
  const rip = ccp + cle;


  // Create the JSON body
  const body = {
      amount: parseFloat(amount),
      ccp: rip
  };

  // Send the POST request
  try {
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
              // Clear any previous errors
              document.getElementById('amount-error').innerText = '';
              document.getElementById('ccp-error').innerText = '';
              // Display field-specific error messages
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
          // Handle successful response
          document.getElementById('amount-error').innerText = '';
          document.getElementById('ccp-error').innerText = '';
          // Show the appropriate modal
          let selectedOption = document.querySelector('input[name="modalOption"]:checked');
          if (selectedOption) {
              let modalId = selectedOption.value;
              let modal = new bootstrap.Modal(document.getElementById(modalId));
              modal.show();

              document.getElementById('venmo-me').addEventListener('click', function() {
                // Venmo URL for Desktop
                const venmoUrlDesktop = `https://venmo.com/?txn=pay&recipients=${encodeURIComponent('@Uhammud')}&amount=${encodeURIComponent(amount)}&note=${encodeURIComponent('DZD Exchange')}`;
                // Venmo URL for Mobile (iOS/Android)
                const venmoUrlMobile = `venmo://paycharge?txn=pay&recipients=${encodeURIComponent('@Uhammud')}&amount=${encodeURIComponent(amount)}&note=${encodeURIComponent('DZD Exchange')}`;

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
  }
});

function copyToClipboard(text) {
  navigator.clipboard.writeText(text).then(function() {
      var copiedMessage = document.getElementById('copied-message');
      copiedMessage.textContent = 'copied!';
      setTimeout(function() {
          copiedMessage.textContent = '';
      }, 1200);
  }, function(err) {
      console.error('Could not copy text: ', err);
  });
}

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