import { showSpinner } from './spinner.js';
import apiClient from './apiClient.js';

document.addEventListener('DOMContentLoaded', async function() {
  try {
    const initialData = await fetchAdminTransfers(0);
    const totalPages = initialData.totalPages;

    const paginationContainer = document.getElementById('pagination-container');

    const maxVisiblePages = 6;

    // Initially generate pagination items and render the first page
    generatePaginationItems(totalPages, 0);

    function generatePaginationItems(totalPages, currentPage) {
      paginationContainer.innerHTML = '';

      // Add "Previous" button
      const prevItem = document.createElement('li');
      prevItem.classList.add('page-item');
      prevItem.innerHTML = `
        <a class="page-link" href="#" aria-label="Previous">
          <span aria-hidden="true">&laquo;</span>
        </a>`;
      prevItem.addEventListener('click', function(event) {
        event.preventDefault();
        if (currentPage > 0) {
          const newPage = currentPage - 1;
          updatePage(newPage);
        }
      });
      paginationContainer.appendChild(prevItem);

      // Determine the range of pages to display
      let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2) + 1);
      let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

      // Adjust start and end pages if they don't fill maxVisiblePages
      if (endPage - startPage < maxVisiblePages - 1) {
        startPage = Math.max(1, endPage - maxVisiblePages + 1);
      }

      // Add page number buttons
      for (let i = startPage; i <= endPage; i++) {
        const pageItem = document.createElement('li');
        pageItem.classList.add('page-item');
        if (i === currentPage + 1) {
          pageItem.classList.add('active');
        }
        pageItem.innerHTML = `<a class="page-link" href="#">${i}</a>`;
        pageItem.addEventListener('click', function(event) {
          event.preventDefault();
          updatePage(i - 1);
        });
        paginationContainer.appendChild(pageItem);
      }

      // Add "Next" button
      const nextItem = document.createElement('li');
      nextItem.classList.add('page-item');
      nextItem.innerHTML = `
        <a class="page-link" href="#" aria-label="Next">
          <span aria-hidden="true">&raquo;</span>
        </a>`;
      nextItem.addEventListener('click', function(event) {
        event.preventDefault();
        if (currentPage < totalPages - 1) {
          const newPage = currentPage + 1;
          updatePage(newPage);
        }
      });
      paginationContainer.appendChild(nextItem);
    }

    async function updatePage(page) {
      // Update the pagination controls to reflect the new current page
      generatePaginationItems(totalPages, page);
      const responseData = await fetchAdminTransfers(page);
      updateTransfers(responseData);
    }

  } catch (error) {
    console.error('Error fetching initial data:', error);
  }
});

async function fetchAdminTransfers(page = 0, size = 18) {
  try {
    // Use the apiClient to make the request
    const response = await apiClient.get(`/api/v1/admin/transfers`, {
      params: {
        page: page,
        size: size
      }
    });

    // The Axios response will already be JSON, so no need to parse
    return response.data;

  } catch (error) {
    console.error('Error fetching transfers:', error);
    throw new Error('Network response was not ok ' + error.response?.statusText || error.message);
  }
}

// MAP TRANSFERS
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
        <button type="button" class="custom-button btn bg-gradient-secondary btn-xs m-n1" data-id="${transfer.id}" style="margin-left: 0.6rem !important;">
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
          // Make the request to change the status using Axios
          apiClient.patch('/api/v1/admin/update-status', 
            { id: transfer.id, status: selectedStatus },
            {
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('sb_token')}`
              }
            })
            .then(response => {
              console.log('Status updated successfully', response.data);
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

// Display transfers.
document.addEventListener('DOMContentLoaded', async () => {
  try {
    const responseData = await fetchAdminTransfers();
    updateTransfers(responseData);

  } catch (error) {
    console.error('Error fetching transfers:', error);
  }
});

const fileStorage = new Map(); // Stores transfer ID -> Array of files

// Upload a file to local storage
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

// Upload file to S3 Bucket
function uploadStoredFiles(transferId) {
  const files = fileStorage.get(transferId);

  console.log('Files to upload for transferId:', transferId, files); // Debugging

  if (files && files.length > 0) {
    const formData = new FormData();
    files.forEach(file => {
      formData.append('receipt', file);
    });

    apiClient.post(`/api/v1/admin/upload-receipt/${transferId}`, formData, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('sb_token')}`,
        'Content-Type': 'multipart/form-data'
      }
    })
    .then(response => {
      console.log('Receipts uploaded successfully', response.data);
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
        
        // Fetch the receipt URL using Axios
        apiClient.get(`/api/v1/transfer/receipt/${transferId}`, {
          headers: {
            'Authorization': `Bearer ${token}` // Include the token in the request header
          }
        })
        .then(response => {
          modalImage.src = response.data;
        })
        .catch(error => {
          console.error("Error fetching receipt:", error);
          modalImage.src = "https://live.staticflickr.com/65535/53920294662_136cda84df_c.jpg"; // Default image if there's an error
        });
      }
    }
  });
});
