function moveToNext(element, event) {
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

// Function to clear the error message
function clearErrorMessage() {
  document.getElementById('validation-error').innerHTML = '';
}

// Attach the clearErrorMessage function to input change events
document.querySelectorAll('.form-control').forEach(input => {
  input.addEventListener('input', clearErrorMessage);
});

// Function to collect values and send GET request
async function collectValues(event) {
  event.preventDefault(); // Prevent default form submission

  // Clear previous error messages
  clearErrorMessage();

  let inputs = document.querySelectorAll('.form-control');
  let finalValue = '';
  inputs.forEach(input => {
      finalValue += input.value;
  });

  // Endpoint URL
  let endpoint = 'http://localhost:8088/api/v1/auth/activate-account';
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
          document.getElementById('validation-error').innerHTML = 
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
    const email = sessionStorage.getItem('userEmail');
    if (email) {
      fetch('http://localhost:8088/api/v1/auth/resend-verification', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email: email })
      })
      .then(response => response.json())
      .then(data => {
        console.log('Success:', data);
      })
      .catch(error => {
        console.error('Error:', error);
      });
    } else {
      console.error('No email found in session storage.');
    }
  }
  