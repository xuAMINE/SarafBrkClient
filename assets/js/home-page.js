import apiClient from './apiClient.js';

document.addEventListener("DOMContentLoaded", function() {
  const rateElement = document.getElementById('rate-display');
  const duration = 1500; // Duration of the counting in milliseconds
  const dropdownMenuAccount = document.getElementById('accountName'); 

  function fetchRate() {
    apiClient.get('/api/v1/rate')
      .then(response => {
        const targetNumber = response.data; // Assuming the API response is a number
        animateCountUp(targetNumber);
      })
      .catch(error => {
        console.error('Error fetching rate:', error);
      });
  }

  // Function to animate the count up
  function animateCountUp(targetNumber) {
    let start = 0;
    const increment = targetNumber / (duration / 10);

    function countUp() {
      start += increment;
      if (start > targetNumber) {
        start = targetNumber;
        rateElement.textContent = Math.floor(start);
      } else {
        rateElement.textContent = Math.floor(start);
        requestAnimationFrame(countUp);
      }
    }

    countUp();
  }

  async function getName() {
    try {
      const response = await apiClient.get('/api/v1/user/name');
      
      // Fix typo from 'response.date' to 'response.data'
      const name = response.data;
      
      dropdownMenuAccount.textContent = name; // Set the username in the dropdown
    } catch (error) {
      if (error.response) {
        console.log('Invalid token:', error.response.data.message);
      } else {
        console.error('Error:', error.message);
      }
    }
  }

  getName();
  fetchRate();
});
