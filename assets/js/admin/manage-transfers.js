async function fetchTransfers() {
  const token = localStorage.getItem('sb_token'); // Adjust this line based on where you store the token

  const response = await fetch('http://localhost:8088/api/v1/transfer', {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });

  if (!response.ok) {
    throw new Error('Network response was not ok ' + response.statusText);
  }

  const data = await response.json();
  return data;
}

function updateTransfers(transfers) {
  const tbody = document.querySelector('tbody');
  tbody.innerHTML = ''; // Clear any existing rows

  transfers.forEach(transfer => {
    const tr = document.createElement('tr');

    if (transfer.recipientFullName === "One Time Transfer") {
      tr.classList.add('grayed-out');
    }

    // Recipient Name and Avatar
    const recipientTd = document.createElement('td');
    recipientTd.innerHTML = `
            <div class="d-flex px-2">
                <div>
                    <img src="https://ui-avatars.com/api/?name=${transfer.recipientFullName.charAt(0)}&background=random&size=128" class="avatar avatar-xs rounded-circle me-2">
                </div>
                <div class="my-auto">
                    <h6 class="mb-0 text-xs">${transfer.recipientFullName}</h6>
                </div>
            </div>`;
    tr.appendChild(recipientTd);

    // Amount
    const amountTd = document.createElement('td');
    amountTd.innerHTML = `<p class="text-xs font-weight-bold mb-0">$${transfer.amount}</p>`;
    tr.appendChild(amountTd);

    // Amount Received
    const amountReceivedTd = document.createElement('td');
    amountReceivedTd.innerHTML = `<p class="text-xs font-weight-bold mb-0">${transfer.amountReceived} DZD</p>`;
    tr.appendChild(amountReceivedTd);

    // Status and Dropdown
    const statusTd = document.createElement('td');
    const statusClass = transfer.status === 'RECEIVED' ? 'bg-success' :
      transfer.status === 'PROCESSING' ? 'bg-info' :
        transfer.status === 'PENDING' ? 'bg-secondary' : 'bg-danger';
    statusTd.innerHTML = `
            <span class="badge badge-dot me-0">
                <span class="badge rounded-pill ${statusClass}">${transfer.status}</span>
            </span>
            <div class="dropdown d-inline">
                <button class="btn ${statusClass} dropdown-toggle btn-xs m-n1 mx-n1" type="button" id="dropdownMenuButton-${transfer.id}" data-bs-toggle="dropdown" aria-expanded="false">
                    <i class="fa-solid fa-grip" style="font-size: 1rem; padding: 0; vertical-align: middle; color: #e8e8e8;"></i>
                </button>
                <ul class="dropdown-menu px-0 py-0" aria-labelledby="dropdownMenuButton-${transfer.id}">
                    <li><a class="dropdown-item border-radius-xs" href="javascript:;" data-status="PENDING">pending</a></li>
                    <li><a class="dropdown-item border-radius-xs" href="javascript:;" data-status="PROCESSING">processing</a></li>
                    <li><a class="dropdown-item border-radius-xs" href="javascript:;" data-status="RECEIVED">received</a></li>
                    <li><a class="dropdown-item border-radius-xs" href="javascript:;" data-status="CANCELED">canceled</a></li>
                </ul>
            </div>`;
    tr.appendChild(statusTd);

    // Receipt Button and Upload
    const receiptTd = document.createElement('td');
    receiptTd.innerHTML = `
            <button type="button" class="btn btn-outline-dark btn-xs" style="margin: 0 0.9rem;" data-bs-toggle="modal" data-bs-target="#receiptModal" data-receipt="${transfer.receipt}">
                <i class="fa-solid fa-handshake-angle" style="font-size: 1rem; padding: 0; vertical-align: middle;"></i>
            </button>
            <button type="button" class="custom-button btn bg-gradient-dark btn-xs m-n1 mx-n1" style="margin: 0">
                <i class="fa-solid fa-upload" style="font-size: 1rem; padding: 0; vertical-align: middle;"></i>
            </button>
            <input class="form-check-label receipt-input" type="file" accept="image/*" style="display: none;">`;
    tr.appendChild(receiptTd);

    // New Column with Button
    const newColumnTd = document.createElement('td');
    newColumnTd.innerHTML = `
            <button type="button" class="custom-button btn bg-gradient-secondary btn-xs ms-2">
                <i class="fa-solid fa-paper-plane" style="font-size: 1rem; padding: 0 1rem; vertical-align: middle;"></i>
            </button>`;
    tr.appendChild(newColumnTd);

    tbody.appendChild(tr);

    // Add event listeners for dropdown items
    const dropdownItems = statusTd.querySelectorAll('.dropdown-item');
    const dropdownButton = statusTd.querySelector('.dropdown-toggle');
    const badge = statusTd.querySelector('.badge.rounded-pill');

    dropdownItems.forEach(item => {
      item.addEventListener('click', function () {
        const selectedStatus = this.getAttribute('data-status');

        // Clear existing background classes only for the dropdown button
        dropdownButton.classList.remove('bg-success', 'bg-info', 'bg-secondary', 'bg-danger');

        // Apply new background class based on the selected status to the dropdown button
        switch (selectedStatus) {
          case 'PENDING':
            dropdownButton.classList.add('bg-secondary');
            break;
          case 'PROCESSING':
            dropdownButton.classList.add('bg-info');
            break;
          case 'RECEIVED':
            dropdownButton.classList.add('bg-success');
            break;
          case 'CANCELED':
            dropdownButton.classList.add('bg-danger');
            break;
          default:
            dropdownButton.classList.add('bg-gradient-dark');
        }

        // Update the badge status text without changing its color
        dropdownButton = selectedStatus;
      });
    });
  });
}


document.addEventListener('DOMContentLoaded', async () => {
  try {
    const transfers = await fetchTransfers();
    updateTransfers(transfers);
  } catch (error) {
    console.error('Error fetching transfers:', error);
  }
});

document.addEventListener("DOMContentLoaded", function () {
  // Event delegation for showing receipt in modal
  document.querySelector("table").addEventListener("click", function (event) {
    if (event.target.closest("button[data-bs-target='#receiptModal']")) {
      const receiptButton = event.target.closest("button[data-bs-target='#receiptModal']");
      const receiptUrl = receiptButton.getAttribute("data-receipt");
      const modalImage = document.querySelector("#receiptModal img");

      if (receiptUrl) {
        modalImage.src = receiptUrl;
      } else {
        modalImage.src = "https://live.staticflickr.com/65535/53920294662_136cda84df_c.jpg"; // Handle case with no receipt
      }
    }
  });

  // Event delegation for file upload buttons
  // Event delegation for file upload buttons
  document.querySelector("table").addEventListener("click", function (event) {
    if (event.target.closest(".custom-button")) {
      const uploadButton = event.target.closest(".custom-button");
      const fileInput = uploadButton.nextElementSibling;

      if (fileInput) {
        fileInput.click();

        // Add event listener for file input change
        fileInput.addEventListener("change", function () {
          if (fileInput.files.length > 0) {
            // Change the button class when a file is selected
            uploadButton.classList.remove("bg-gradient-dark");
            uploadButton.classList.add("bg-gradient-danger");
          } else {
            uploadButton.classList.remove("bg-gradient-danger");
            uploadButton.classList.add("bg-gradient-dark");
          }
        });
      }
    }
  });
});

