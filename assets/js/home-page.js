import apiClient from './apiClient.js';

document.addEventListener("DOMContentLoaded", function() {
  const rateElement = document.getElementById('rate-display');
  const duration = 1500; // Duration of the counting in milliseconds

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

  fetchRate();
});
