document.getElementById('registerForm').addEventListener('submit', async function(event) {
    event.preventDefault();

    // Clear previous error messages
    document.querySelectorAll('small.text-danger').forEach(el => el.innerText = '');

    const formData = {
      firstname: document.getElementById('firstname').value,
      lastname: document.getElementById('lastname').value,
      email: document.getElementById('email').value,
      password: document.getElementById('password').value,
    };

    try {
      const response = await fetch('http://localhost:8088/api/v1/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        // Registration successful, redirect to login page or show success message
        window.location.href = './email-validation.html';
      } else if (response.status === 400) {
        const errorMessages = await response.json();
        // Display error messages
        for (const [field, message] of Object.entries(errorMessages)) {
          document.getElementById(`${field}-error`).innerHTML = '<i class="fa fa-warning" aria-hidden="true" style="padding: 0 5px;"></i>' + message;
        }
      } else {
        // Handle other errors
        console.error('An error occurred:', response.statusText);
      }
    } catch (error) {
      console.error('An error occurred:', error);
    }
  });