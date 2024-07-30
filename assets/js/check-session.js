document.getElementById('check-session').addEventListener('click', function() {
  const token = localStorage.getItem('sb_token');

  if (token) {
      fetch('http://localhost:8088/api/v1/auth/check-session', {
          method: 'GET',
          headers: {
              'Authorization': `Bearer ${token}`  // Include the "Bearer " prefix
          }
      })
      .then(response => response.json())
      .then(isValid => {
          if (isValid) {
              window.location.href = 'recipients.html';
          } else {
              window.location.href = 'sign-in.html';
          }
      })
      .catch(error => {
          console.error('Error verifying token:', error);
          window.location.href = 'sign-in.html';
      });
  } else {
      window.location.href = 'sign-in.html';
  }
});
