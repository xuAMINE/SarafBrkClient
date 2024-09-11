import { showSpinner, hideSpinner } from './spinner.js';
import apiClient from './apiClient.js';

document.getElementById('contact-form').addEventListener('submit', async function (e) {
  e.preventDefault();

  const name = document.querySelector('input[name="name"]').value;
  const email = document.querySelector('input[name="email"]').value;
  const message = document.querySelector('textarea[name="message"]').value;

  const payload = {
    name: name,
    email: email,
    message: message
  };

  showSpinner();

  try {
    const response = await apiClient.post('/api/v1/contact', payload);

    if (response.status === 200) {
      hideSpinner();

      document.querySelector('input[name="name"]').value = '';
      document.querySelector('input[name="email"]').value = '';
      document.querySelector('textarea[name="message"]').value = '';

      document.getElementById('confirmingContact').innerHTML =
        `<i class="fa-solid fa-circle-check" style="color: #ff004c;"></i> ${response.data}`;
    }
  } catch (error) {
    hideSpinner();

    if (error.response) {
      console.error('Error: ' + error.response.data.message || 'Failed to send message. Please try again.');
    } else {
      console.error('An error occurred. Please try again later.');
    }
    console.error('Error:', error);
  }
});
