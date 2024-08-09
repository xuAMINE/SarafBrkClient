document.addEventListener('DOMContentLoaded', function () {
  const urlParams = new URLSearchParams(window.location.search);
  const fullName = urlParams.get('fullName');
  const ccpNumber = urlParams.get('ccpNumber');
  const doContact = urlParams.get('doContact');

  document.getElementById('fullName').textContent = decodeURIComponent(fullName);
  document.getElementById('ccpNumber').textContent = decodeURIComponent(ccpNumber);
  document.getElementById('doContact').textContent = decodeURIComponent(doContact);
});
