async function fetchAdminTransfers(page = 0, size = 20) {
  const token = localStorage.getItem('sb_token');

  const response = await fetch(`http://localhost:8088/api/v1/admin/transfers?page=${page}&size=${size}`, {
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

function updateTransfers(responseData) {
  const transfers = responseData.content; // Extract the list of transfers
  const tbody = document.querySelector('tbody');

  // Clear any existing rows
  tbody.innerHTML = '';

  transfers.forEach(transfer => {
    let tr = document.getElementById(`transfer-row-${transfer.id}`);
    if (!tr) {
      tr = document.createElement('tr');
      tr.id = `transfer-row-${transfer.id}`;
      tbody.appendChild(tr);
    }

    // Update the row content
    tr.innerHTML = `
      <td>
        <div class="d-flex px-2">
          <div>
            <img src="https://ui-avatars.com/api/?name=${transfer.recipientFullName.charAt(0)}&background=random&size=128" class="avatar avatar-xs rounded-circle me-2">
          </div>
          <div class="my-auto">
            <h6 class="mb-0 text-xs">${transfer.recipientFullName}</h6>
          </div>
        </div>
      </td>
      <td><p class="text-xs font-weight-bold mb-0">$${transfer.amount}</p></td>
      <td><p class="text-xs font-weight-bold mb-0">${transfer.amountReceived} DZD</p></td>
      <td>
        <span class="badge badge-dot me-0">
          <span class="badge rounded-pill ${getStatusClass(transfer.status)}">${transfer.status}</span>
        </span>
        <div class="dropdown d-inline">
          <button class="btn ${getStatusClass(transfer.status)} dropdown-toggle btn-xs m-n1 mx-n1" type="button" id="dropdownMenuButton-${transfer.id}" data-bs-toggle="dropdown" aria-expanded="false">
            <i class="fa-solid fa-grip" style="font-size: 1rem; padding: 0; vertical-align: middle; color: #e8e8e8;"></i>
          </button>
          <ul class="dropdown-menu px-0 py-0" aria-labelledby="dropdownMenuButton-${transfer.id}">
            <li><a class="dropdown-item border-radius-xs" href="javascript:;" data-status="PENDING">pending</a></li>
            <li><a class="dropdown-item border-radius-xs" href="javascript:;" data-status="PROCESSING">processing</a></li>
            <li><a class="dropdown-item border-radius-xs" href="javascript:;" data-status="RECEIVED">received</a></li>
            <li><a class="dropdown-item border-radius-xs" href="javascript:;" data-status="CANCELED">canceled</a></li>
          </ul>
        </div>
      </td>
      <td>
        <button type="button" class="btn btn-outline-dark btn-xs" style="margin: 0 0.9rem;" data-bs-toggle="modal" data-bs-target="#receiptModal" data-receipt="${transfer.receipt}" data-id="${transfer.id}">
          <i class="fa-solid fa-handshake-angle" style="font-size: 1rem; padding: 0; vertical-align: middle;"></i>
        </button>
        <button type="button" class="custom-button btn bg-gradient-dark btn-xs m-n1 mx-n1" style="margin: 0" data-id="${transfer.id}">
          <i class="fa-solid fa-upload" style="font-size: 1rem; padding: 0; vertical-align: middle;"></i>
        </button>
        <input class="form-check-label receipt-input" type="file" accept="image/*" style="display: none;">
      </td>
      <td>
        <button type="button" class="custom-button btn bg-gradient-secondary btn-xs ms-2" data-id="${transfer.id}">
          <i class="fa-solid fa-paper-plane" style="font-size: 1rem; padding: 0 1rem; vertical-align: middle;"></i>
        </button>
      </td>`;

    // Add event listeners for dropdown items
    const dropdownItems = tr.querySelectorAll('.dropdown-item');
    dropdownItems.forEach(item => {
      item.addEventListener('click', function () {
        const selectedStatus = this.getAttribute('data-status');

        // Show confirmation modal
        const confirmationModal = new bootstrap.Modal(document.getElementById('confirmationModal'));
        document.getElementById('newStatus').textContent = selectedStatus;
        document.getElementById('confirmChangeStatus').onclick = function() {
          // Make the request to change the status
          fetch(`http://localhost:8088/api/v1/admin/update-status`, {
            method: 'PATCH',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${localStorage.getItem('sb_token')}`
            },
            body: JSON.stringify({ id: transfer.id, status: selectedStatus })
          })
          .then(response => {
            if (response.ok) {
              return response.json();
            } else {
              throw new Error('Failed to update transfer status');
            }
          })
          .then(data => {
            console.log('Status updated successfully', data);
            // Update the specific row with the new status
            const badgeWrapper = tr.querySelector('.badge-dot');
            if (badgeWrapper) {
              const badge = badgeWrapper.querySelector('.badge');
              badge.className = `badge rounded-pill ${getStatusClass(selectedStatus)}`;
              badge.textContent = selectedStatus;
            }
            const dropdownToggle = tr.querySelector('.dropdown-toggle');
            if (dropdownToggle) 
              dropdownToggle.className = `btn ${getStatusClass(selectedStatus)} dropdown-toggle btn-xs m-n1 mx-n1`;
          
          })
          .catch(error => {
            console.error('Error:', error);
          });
          
          confirmationModal.hide();
        };

        confirmationModal.show();
      });
    });
  });

  // Helper function to get status class
  function getStatusClass(status) {
    switch (status) {
      case 'RECEIVED': return 'bg-success';
      case 'PROCESSING': return 'bg-info';
      case 'PENDING': return 'bg-secondary';
      case 'CANCELED': return 'bg-danger';
      default: return '';
    }
  }
}

const fileStorage = new Map(); // Stores transfer ID -> Array of files

document.querySelector("table").addEventListener("click", function (event) {
  const target = event.target;

  // Handle file input trigger
  if (target.closest(".custom-button") && target.closest(".custom-button").classList.contains("bg-gradient-dark")) {
    const button = target.closest(".custom-button");
    const fileInput = button.nextElementSibling;
    const transferId = button.getAttribute('data-id'); // Get transfer ID

    console.log('File input trigger, transferId:', transferId); // Debugging

    if (fileInput) {
      fileInput.click();

      // Add event listener for file input change
      fileInput.addEventListener("change", function () {
        if (fileInput.files.length > 0) {
          // Initialize the file array if not already present
          if (!fileStorage.has(transferId)) {
            fileStorage.set(transferId, []);
          }

          // Add new files to the existing array
          const filesArray = fileStorage.get(transferId);
          for (let i = 0; i < fileInput.files.length; i++) {
            filesArray.push(fileInput.files[i]);
          }
          fileStorage.set(transferId, filesArray);

          console.log('Files stored for transferId:', transferId, filesArray); // Debugging

          // Change the button class when files are selected
          button.classList.remove("bg-gradient-dark");
          button.classList.add("bg-gradient-danger");
        } else {
          fileStorage.delete(transferId); // Remove files if input is cleared
          button.classList.remove("bg-gradient-danger");
          button.classList.add("bg-gradient-dark");
        }
      });
    }
  }

  // Handle send button click
  if (target.closest(".btn.bg-gradient-secondary")) {
    const button = target.closest(".btn.bg-gradient-secondary");
    const transferId = button.getAttribute('data-id');
    console.log('Send button clicked, transferId:', transferId); // Debugging
    uploadStoredFiles(transferId);
  }
});

function uploadStoredFiles(transferId) {
  const files = fileStorage.get(transferId);

  console.log('Files to upload for transferId:', transferId, files); // Debugging

  if (files && files.length > 0) {
    const formData = new FormData();
    files.forEach(file => {
      formData.append('receipt', file);
    });

    fetch(`http://localhost:8088/api/v1/admin/upload-receipt/${transferId}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('sb_token')}`
      },
      body: formData
    })
    .then(response => {
      if (response.ok) {
        return response.json();
      } else {
        throw new Error('Failed to upload receipts');
      }
    })
    .then(data => {
      console.log('Receipts uploaded successfully', data);
      // Update UI or notify user of success
      const modal = new bootstrap.Modal(document.getElementById('receiptConfirmation'));
      modal.show();
      fileStorage.delete(transferId); // Clear files after successful upload
    })
    .catch(error => {
      console.error('Error:', error);
    });
  } else {
    console.log(fileStorage);
    alert('No files selected for this transfer.');
  }
}

// GET receipt URL.
document.addEventListener("DOMContentLoaded", function () {
  // Event delegation for showing receipt in modal
  document.querySelector("table").addEventListener("click", function (event) {
    if (event.target.closest("button[data-bs-target='#receiptModal']")) {
      const receiptButton = event.target.closest("button[data-bs-target='#receiptModal']");
      const receiptName = receiptButton.getAttribute("data-receipt");
      const modalImage = document.querySelector("#receiptModal img");
      const transferId = receiptButton.getAttribute("data-id");
      const token = localStorage.getItem('sb_token');

      if (!receiptName || receiptName === 'null') {
        modalImage.src = "https://live.staticflickr.com/65535/53920294662_136cda84df_c.jpg";
      } else {
        
        // Fetch the receipt URL using the transfer ID
        fetch(`http://localhost:8088/api/v1/transfer/receipt/${transferId}`, {
          headers: {
            'Authorization': `Bearer ${token}` // Include the token in the request header
          }
        })
          .then(response => {
            if (!response.ok) {
              throw new Error("Failed to fetch the receipt URL.");
            }
            return response.text();
          })
          .then(receiptUrl => {
            modalImage.src = receiptUrl;
          })
          .catch(error => {
            console.error("Error fetching receipt:", error);
            modalImage.src = "https://live.staticflickr.com/65535/53920294662_136cda84df_c.jpg"; // Default image if there's an error
          });
      }
    }
  });
});

// Display transfers.
document.addEventListener('DOMContentLoaded', async () => {
  try {
    const responseData = await fetchAdminTransfers();
    updateTransfers(responseData);
  } catch (error) {
    console.error('Error fetching transfers:', error);
  }
});