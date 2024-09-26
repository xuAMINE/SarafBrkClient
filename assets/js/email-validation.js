function moveToNext(element, event) {
  // Clear validation message
  document.getElementById('validation-message').innerHTML = '';

  if (!/^\d$/.test(event.data)) {
      element.value = '';
      return;
  }

  if (event.inputType === "insertText" && element.value.length === element.maxLength) {
      let nextElement = element.parentElement.parentElement.nextElementSibling;
      if (nextElement && nextElement.querySelector('input')) {
          nextElement.querySelector('input').focus();
      }
  } else if (event.inputType === "deleteContentBackward") {
      if (element.value.length === 0) {
          let previousElement = element.parentElement.parentElement.previousElementSibling;
          if (previousElement && previousElement.querySelector('input')) {
              let previousInput = previousElement.querySelector('input');
              previousInput.focus();
              // Move cursor to the end of previous input
              previousInput.setSelectionRange(previousInput.value.length, previousInput.value.length);
          }
      }
  }
}



// Function to collect values and send GET request
async function collectValues(event) {
  event.preventDefault(); // Prevent default form submission

  let inputs = document.querySelectorAll('.form-control');
  let finalValue = '';
  inputs.forEach(input => {
      finalValue += input.value;
  });

  // Endpoint URL
  let endpoint = 'https://13.57.42.52:8088/api/v1/auth/activate-account';
  let url = `${endpoint}?verToken=${finalValue}`;

  try {
      let response = await fetch(url, {
          method: 'GET',
          headers: {
              'Content-Type': 'application/json'
          }
      });

      if (response.ok) {
          // Request was successful
          console.log('Activation request successful.');
          // Show the modal notification
          $('#exampleModalNotification').modal('show');
      } else if (response.status === 400) {
          let message = await response.text();
          document.getElementById('validation-message').innerHTML = 
              '<i class="fa fa-warning" aria-hidden="true" style="padding: 0 5px;"></i>' + message;
      } else {
          // Request failed
          console.error('Activation request failed.');
          // Handle error as needed
      }
  } catch (error) {
      console.error('Error making activation request:', error);
      // Handle error as needed
  }
}

  // Attach collectValues() function to form submit event
  document.getElementById('emailValidationForm').addEventListener('submit', collectValues);

  function resendEmail() {
    const email = sessionStorage.getItem('sb_email');
    if (email) {
      fetch('https://13.57.42.52:8088/api/v1/auth/resend-verification', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email: email })
      })
      .then(response => {
        if (response.ok) {
          // Success, display success message
          document.getElementById('validation-message').innerHTML = 
              '<i class="fa fa-check" aria-hidden="true" style="padding: 0 5px; color: green;"></i><span style="color: green;">Verification email has been resent.</span>';
          clearForm();
        } else {
          return response.text().then(text => { throw new Error(text); });
        }
      })
      .catch(error => {
        console.error('Error:', error);
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
