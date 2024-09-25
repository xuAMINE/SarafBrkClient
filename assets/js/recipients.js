import apiClient from './apiClient.js';

document.addEventListener('DOMContentLoaded', function () {
  fetchRecipients();

  // Function to fetch recipients
  async function fetchRecipients() {
    try {
      // Retrieve the token from local storage (or other storage mechanism)
      const token = localStorage.getItem('sb_token'); // Adjust this line based on where you store the token

      // Set the Authorization header using apiClient defaults
      apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;

      // Make the GET request to fetch recipients
      const response = await apiClient.get('/api/v1/recipient/current-user');

      // Handle the response data (assuming response.data is the list of recipients)
      const recipients = response.data;
      recipients.forEach(recipient => createRecipientCard(recipient));

    } catch (error) {
      // Handle any errors
      console.error('Error fetching recipients:', error);
    }
  }


  // Function to create a recipient card
  function createRecipientCard(recipient) {
    const colDiv = document.createElement('div');
    colDiv.classList.add('col-lg-4', 'col-12');

    const cardDiv = document.createElement('div');
    cardDiv.classList.add('card-color-tr', 'card', 'card-profile', 'mt-lg-5', 'mt-5');
    cardDiv.style.position = 'relative';

    const rowDiv = document.createElement('div');
    rowDiv.classList.add('row', 'align-items-center');

    const imgColDiv = document.createElement('div');
    imgColDiv.classList.add('col-lg-4', 'col-md-6', 'col-6', 'mt-n5');

    const imgLink = document.createElement('a');
    imgLink.classList.add('send-user-fw');
    imgLink.style.cursor = 'pointer';

    const imgWrapperDiv = document.createElement('div');
    imgWrapperDiv.classList.add('p-3', 'pe-md-0');

    const img = document.createElement('img');
    img.classList.add('w-100', 'border-radius-md', 'shadow-lg');
    const initials = `${recipient.firstname.charAt(0).toUpperCase()}${recipient.lastname.charAt(0).toUpperCase()}`;
    img.src = `https://ui-avatars.com/api/?name=${initials}&background=random&size=128`;
    img.alt = 'image';

    imgWrapperDiv.appendChild(img);
    imgLink.appendChild(imgWrapperDiv);
    imgColDiv.appendChild(imgLink);

    const textColDiv = document.createElement('div');
    textColDiv.classList.add('col-lg-8', 'col-md-6', 'col-6', 'mt-n5');

    const cardBodyDiv = document.createElement('div');
    cardBodyDiv.classList.add('card-body', 'ps-lg-5');

    const nameLink = document.createElement('a');
    nameLink.classList.add('send-user-fw');
    nameLink.style.cursor = 'pointer';

    const nameHeading = document.createElement('h5');
    nameHeading.classList.add('mb-0', 'profile-text');
    nameHeading.textContent = `${recipient.firstname} ${recipient.lastname}`;

    const ccpHeading = document.createElement('h6');
    ccpHeading.classList.add('ccp', 'text-info', 'profile-text-b2');
    ccpHeading.textContent = recipient.ccp;

    nameLink.appendChild(nameHeading);
    cardBodyDiv.appendChild(nameLink);
    cardBodyDiv.appendChild(ccpHeading);
    textColDiv.appendChild(cardBodyDiv);

    rowDiv.appendChild(imgColDiv);
    rowDiv.appendChild(textColDiv);
    cardDiv.appendChild(rowDiv);

    // Add edit icon to the top right of the card
    const editIcon = document.createElement('i');
    editIcon.classList.add('fa-solid', 'fa-user-pen', 'position-absolute');
    editIcon.style.top = '10px';
    editIcon.style.right = '10px';
    editIcon.style.cursor = 'pointer';
    editIcon.style.color = ' #2a2a60';
    editIcon.addEventListener('click', () => editRecipient(recipient));
    cardDiv.appendChild(editIcon);

    // Add delete icon to the bottom right of the card
    const deleteIcon = document.createElement('i');
    deleteIcon.classList.add('fas', 'fa-trash-alt', 'position-absolute');
    deleteIcon.style.bottom = '10px';
    deleteIcon.style.right = '10px';
    deleteIcon.style.color = '#ff6161';
    deleteIcon.style.cursor = 'pointer';
    deleteIcon.addEventListener('click', () => deleteRecipient(recipient));
    cardDiv.appendChild(deleteIcon);

    colDiv.appendChild(cardDiv);

    nameLink.addEventListener('click', () => {
      const fullName = encodeURIComponent(`${recipient.firstname} ${recipient.lastname}`);
      const ccpNumber = encodeURIComponent(recipient.ccp);
      const doContact = recipient.doContact ? '- recipient will be contacted.' : '- recipient will not be contacted.';
      const doContactEncoded = encodeURIComponent(doContact);

      window.location.href = `../send-user/index.html?fullName=${fullName}&ccpNumber=${ccpNumber}&doContact=${doContactEncoded}`;
    });

    imgLink.addEventListener('click', () => {
      const fullName = encodeURIComponent(`${recipient.firstname} ${recipient.lastname}`);
      const ccpNumber = encodeURIComponent(recipient.ccp);
      const doContact = recipient.doContact ? '- recipient will be contacted.' : '- recipient will not be contacted.';
      const doContactEncoded = encodeURIComponent(doContact);

      window.location.href = `../send-user/index.html?fullName=${fullName}&ccpNumber=${ccpNumber}&doContact=${doContactEncoded}`;
    });

    document.getElementById('recipient-container').appendChild(colDiv);
  }

  // Function to handle editing a recipient
  function editRecipient(recipient) {
    const firstName = encodeURIComponent(recipient.firstname);
    const lastName = encodeURIComponent(recipient.lastname);
    const ccpNumber = encodeURIComponent(recipient.ccp);
    const phoneNumber = encodeURIComponent(recipient.phoneNumber);
    const doContact = encodeURIComponent(recipient.doContact);

    window.location.href = `../edit-recipient/index.html?firstName=${firstName}&lastName=${lastName}&ccpNumber=${ccpNumber}&phoneNumber=${phoneNumber}&doContact=${doContact}`;
}

  // Function to handle deleting a recipient
  function deleteRecipient(recipient) {
    // Show the delete confirmation modal
    let modal = new bootstrap.Modal(document.getElementById('deleteRecipientModal'));
    modal.show();

    // Get the confirm button inside the modal
    const confirmButton = document.getElementById('delete-recepient');
    const token = localStorage.getItem('sb_token');

    // Attach a one-time event listener to the confirm button
    confirmButton.addEventListener('click', async function handleDelete(event) {
      event.preventDefault();

      try {
        const response = await fetch(`http://localhost:8088/api/v1/recipient/deactivate/${recipient.ccp}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
        });

        if (response.ok) {
          // Handle success
          modal.hide(); // Close the modal
          location.reload(); // Refresh the page
        } else {
          alert("Something went wrong. Please try again later.");
        }
      } catch (error) {
        // Handle network or unexpected errors
        console.error('Error:', error);
        alert("Unable to connect to the server. Please try again later.");
      }

      // Remove the event listener after handling the delete action
      confirmButton.removeEventListener('click', handleDelete);
    }, { once: true }); // Ensure the listener is only triggered once
  }

});