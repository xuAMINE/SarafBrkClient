function toggleTextColor() {
  const checkbox = document.getElementById('doContact');
  const label = document.getElementById('contactLabel');
  if (checkbox.checked) {
      label.classList.remove('text-danger');
      label.classList.add('text-success');
  } else {
      label.classList.remove('text-success');
      label.classList.add('text-danger');
  }
}

// Initial call to set the correct color on page load
document.addEventListener('DOMContentLoaded', (event) => {
  toggleTextColor();
});


// Add new recipient
document.addEventListener('DOMContentLoaded', function() {
  const form = document.getElementById('contact-form');

  form.addEventListener('submit', async (event) => {
      event.preventDefault(); // Prevent the default form submission

      // Gather form data
      const firstName = document.getElementById('firstName').value;
      const lastName = document.getElementById('lastName').value;
      const ccp = document.getElementById('ccp').value;
      const phoneNumber = document.getElementById('phoneNumber').value;
      const doContact = document.getElementById('doContact').checked;

      // Create the request body
      const requestBody = {
          firstName: firstName,
          lastName: lastName,
          ccp: ccp,
          phoneNumber: phoneNumber,
          doContact: doContact
      };

      const token = localStorage.getItem('token');

      if (!token) {
          console.error('No token found');
          return;
      }
      try {
        const response = await fetch('http://localhost:8088/api/v1/recipient/add', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + token
            },
            body: JSON.stringify(requestBody)
        });

        if (response.ok) {
            alert('success');
        } else {
            const errorText = await response.text();
            if (errorText === 'Duplicate key value violates unique constraint.') {
                const modal = new bootstrap.Modal(document.getElementById('recipient-modal'));
                modal.show();
                alert('recipien already excists!');
            } else {
                alert('Error');
            }
        }
      } catch (error) {
        console.error('Network or other error:', error);
        alert('An unexpected error occurred.');
    }
  });
});

document.addEventListener('DOMContentLoaded', function() {
    const phoneNumberInput = document.getElementById('phoneNumber');

    // Restrict input to only allow numbers
    phoneNumberInput.addEventListener('input', function(e) {
        this.value = this.value.replace(/[^0-9]/g, '');
    });

});

document.addEventListener('DOMContentLoaded', function() {
    const phoneNumberInput = document.getElementById('ccp');

    // Restrict input to only allow numbers
    phoneNumberInput.addEventListener('input', function(e) {
        this.value = this.value.replace(/[^0-9]/g, '');
    });
});