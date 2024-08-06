document.addEventListener("DOMContentLoaded", function() {
  const rateElement = document.getElementById('rate-display');
  const duration = 1500; // Duration of the counting in milliseconds

  // Function to fetch the rate from the backend
  function fetchRate() {
    fetch('http://localhost:8088/api/v1/rate') // Replace with your actual endpoint
      .then(response => response.json())
      .then(data => {
        const targetNumber = data;
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

  // Fetch the rate when the DOM is fully loaded
  fetchRate();
});
