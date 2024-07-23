document.getElementById('check-session').addEventListener('click', function() {
  // Replace 'authToken' with the key you are using to store the login token
  const token = localStorage.getItem('sb_token');
  
  if (token) {
      // User is logged in, navigate to another page
      window.location.href = 'recipients.html';
  } else {
      // User is not logged in, navigate to the login page
      window.location.href = 'sign-in.html';
  }
});
