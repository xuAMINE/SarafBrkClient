document.getElementById('loginForm').addEventListener('submit', async (e) => {
  e.preventDefault();

  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;

  const response = await fetch('http://localhost:8088/api/v1/auth/authenticate', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ email, password })
  });

  if (response.ok) {
    const data = await response.json();
    localStorage.setItem('sb_token', data.access_token);
    if (data.role === 'ADMIN' || data.role === 'MANAGER') {
      window.location.href = './admin/manage-transfers.html';
    } else {
      window.location.href = 'recipients.html';
    }
  } else {
    const error = await response.json();
    if (error.message === 'Email not verified') {
      // alert('Please verify your email before logging in.');
      // window.location.href = 'email-validation.html';
      document.getElementById('password-error').innerHTML = `
        Please verify your email before logging in. 
        <a href="email-validation.html" style="text-decoration: underline; red: blue;">Verify Email</a>`;

    } else if (error.message === 'Invalid credentials') {
      document.getElementById('password-error').innerHTML = `
          The password you’ve entered is incorrect. 
          <a href="#" data-bs-toggle="modal" data-bs-target="#passwordResetModal" style="text-decoration: underline; color: blue;">Forgot Password?</a>`;
    } else {
      alert('Login failed');
    }
  }
});

document.getElementById('requestPasswordReset').addEventListener('click', async function (event) {
  event.preventDefault();

  const email = document.getElementById('resetEmail').value;

  try {
    const response = await fetch('http://localhost:8088/api/v1/user/forgot-password', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email: email })
    });

    if (response.ok) {
      // Handle success
      document.getElementById('email-reset').innerText = 'A reset password link has been sent to your email if it exists in our system.';
    } else {
      alert("Something went wrong. Please try again later.");
    }
  } catch (error) {
    // Handle network or unexpected errors
    console.error('Error:', error);
    alert("Unable to connect to the server. Please try again later.");
  }
});

