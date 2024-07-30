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
      window.location.href = 'recipients.html';
  } else {
    const error = await response.json();
    if (error.message === 'Email not verified') {
        alert('Please verify your email before logging in.');
        window.location.href = 'email-validation.html';

    } else if (error.message === 'Invalid credentials') {
        alert('Please check your email or password.');
    } else {
      alert('Login failed');
    }
  }
});


