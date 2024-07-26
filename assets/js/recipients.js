  document.addEventListener('DOMContentLoaded', function () {
    // Function to fetch recipients
    function fetchRecipients() {
      fetch('http://localhost:8088/api/v1/recipient')
        .then(response => response.json())
        .then(data => {
          // Function to create a card for each recipient
          data.forEach(recipient => createRecipientCard(recipient));
        })
        .catch(error => console.error('Error fetching recipients:', error));
    }

    // Function to create a recipient card
    function createRecipientCard(recipient) {
      // Create card elements
      const colDiv = document.createElement('div');
      colDiv.classList.add('col-lg-6', 'col-12');

      const cardDiv = document.createElement('div');
      cardDiv.classList.add('card', 'card-profile', 'mt-lg-5', 'mt-5');

      const rowDiv = document.createElement('div');
      rowDiv.classList.add('row', 'align-items-center');

      const imgColDiv = document.createElement('div');
      imgColDiv.classList.add('col-lg-4', 'col-md-6', 'col-6', 'mt-n5');

      const imgLink = document.createElement('a');
      imgLink.href = 'javascript:;';

      const imgWrapperDiv = document.createElement('div');
      imgWrapperDiv.classList.add('p-3', 'pe-md-0');

      const img = document.createElement('img');
      img.classList.add('w-100', 'border-radius-md', 'shadow-lg');
      img.src = '../assets/img/bruce-mars.jpg'; // Placeholder image source, replace as needed
      img.alt = 'image';

      imgWrapperDiv.appendChild(img);
      imgLink.appendChild(imgWrapperDiv);
      imgColDiv.appendChild(imgLink);

      const textColDiv = document.createElement('div');
      textColDiv.classList.add('col-lg-8', 'col-md-6', 'col-6', 'mt-n5');

      const cardBodyDiv = document.createElement('div');
      cardBodyDiv.classList.add('card-body', 'ps-lg-5');

      const nameHeading = document.createElement('h5');
      nameHeading.classList.add('mb-0', 'profile-text');
      nameHeading.textContent = `${recipient.firstname} ${recipient.lastname}`;

      const ccpHeading = document.createElement('h6');
      ccpHeading.classList.add('ccp', 'text-info', 'profile-text-b2');
      ccpHeading.textContent = recipient.ccp;

      cardBodyDiv.appendChild(nameHeading);
      cardBodyDiv.appendChild(ccpHeading);
      textColDiv.appendChild(cardBodyDiv);

      rowDiv.appendChild(imgColDiv);
      rowDiv.appendChild(textColDiv);

      cardDiv.appendChild(rowDiv);
      colDiv.appendChild(cardDiv);

      // Append the card to the container
      document.getElementById('recipient-container').appendChild(colDiv);
    }

    // Fetch recipients when the page loads
    fetchRecipients();
  });
