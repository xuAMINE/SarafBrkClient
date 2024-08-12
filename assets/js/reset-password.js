import { showSpinner, hideSpinner } from './spinner.js';

async function resetPassword() {
  const urlParams = new URLSearchParams(window.location.search);
  const token = urlParams.get('token');

  const newPassword = document.getElementById('password').value;
  const confirmPassword = document.getElementById('password-confirmation').value;

  const body = {
      newPassword: newPassword,
      confirmPassword: confirmPassword
  };

  try {
        showSpinner();
      const response = await fetch(`http://localhost:8088/api/v1/user/reset-password?token=${token}`, {
          method: 'POST',
          headers: {
              'Content-Type': 'application/json'
          },
          body: JSON.stringify(body)
      });

      if (response.ok) {
        document.getElementById('resetPassword').innerHTML = `
          Password was successfully changed. 
          <a href="sign-in.html" style="text-decoration: underline; color: blue;">Login page?</a>`;

      } else if (response.status === 400) {
            const errors = await response.json();
            if (errors.message) {
                document.getElementById('resetPassword').innerHTML = '<i class="fa fa-warning" aria-hidden="true" style="padding: 0 5px;"></i>' + errors.message;
            } else {
                document.getElementById('resetPassword').innerHTML = '<i class="fa fa-warning" aria-hidden="true" style="padding: 0 5px;"></i>' + errors.newPassword;
            }
      } else {
          const errorData = await response.json();
          console.error('Error:', errorData);
          alert(errorData);
      }
  } catch (error) {
      console.error('Network error:', error);
  } finally {
    hideSpinner();
  }
}

document.getElementById('reset-password-btn').addEventListener('click', resetPassword);
