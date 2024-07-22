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

// Function to collect values and send GET request
function collectValues(event) {
    event.preventDefault(); // Prevent default form submission
  
    let inputs = document.querySelectorAll('.form-control');
    let finalValue = '';
    inputs.forEach(input => {
        finalValue += input.value;
    });
  
    // AJAX request
    let endpoint = 'http://localhost:8088/api/v1/auth/activate-account';
    let url = `${endpoint}?verToken=${finalValue}`;
  
    let xhr = new XMLHttpRequest();
    xhr.open('GET', url, true);
  
    xhr.onload = function() {
      if (xhr.status === 200) {
        // Request was successful
        console.log('Activation request successful.');
        // Show the modal notification
        $('#exampleModalNotification').modal('show');
      } else {
        // Request failed
        console.error('Activation request failed.');
        // Handle error as needed
      }
    };
  
    xhr.onerror = function() {
      // Request errored out
      console.error('Error making activation request.');
      // Handle error as needed
    };
  
    xhr.send();
  
    return false; // Prevent form submission
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
  