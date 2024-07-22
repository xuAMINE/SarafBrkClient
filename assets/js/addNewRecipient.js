document.getElementById('contact-form').addEventListener('submit', function(event) {
  event.preventDefault();

  const firstName = document.getElementById('firstName').value;
  const lastName = document.getElementById('lastName').value;
  const accountNumber = document.getElementById('ccp').value;
  const phoneNumber = document.getElementById('phoneNumber').value;
  const doContact = document.getElementById('doContact').checked;

  const data = {
    firstName,
    lastName,
    accountNumber,
    phoneNumber,
    doContact
  };

  fetch('/add-to-table', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(data)
  })
  .then(response => response.json())
  .then(result => {
    console.log('Success:', result);
    // Optionally, update the UI or provide feedback to the user
  })
  .catch(error => {
    console.error('Error:', error);
  });
});