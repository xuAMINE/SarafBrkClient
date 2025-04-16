import { showSpinner } from './spinner.js';
import apiClient from './apiClient.js';

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

async function fetchPendingTransfers(page = 0, size = 18) {
  try {
    const response = await apiClient.get(`/api/v1/admin/transfers/pending`, {
      params: {
        page: page,
        size: size
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching pending transfers:', error);
    throw new Error('Network response was not ok ' + (error.response?.statusText || error.message));
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

    let transferCode = transfer.paymentMethod === 'ZELLE' ? 'SRZ' + transfer.code
      : transfer.paymentMethod === 'VENMO' ? 'SRV' + transfer.code
        : 'SRP' + transfer.code;

    // Update the row content
    tr.innerHTML = `
      <td>
        <p class="text-xs font-weight-bold text-dark-cus mb-0 text-center">${transferCode}</p>
      </td>
      <td>
        <div class="d-flex">
          <div>
            <img src="https://ui-avatars.com/api/?name=${transfer.recipientFullName.charAt(0)}&background=random&size=128" class="avatar avatar-xs rounded-circle me-2">
          </div>
          <div class="my-auto text-center">
            <h6 class="mb-0 text-xs">${transfer.firstName} ${transfer.lastName}</h6>
          </div>
        </div>
      </td>
      <td><p class="text-xs font-weight-bold mb-0 text-center">$${transfer.amount}</p></td>
      <td><p class="text-xs font-weight-bold mb-0 text-center">${transfer.amountReceived} DZD</p></td>
      <td class="text-center">
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
      <td class="text-center">
         <button type="button" class="btn btn-outline-dark btn-xs" style="margin: 0 0.9rem;" 
                data-bs-toggle="modal" data-bs-target="#receiptModal" 
                data-receipt="${transfer.receipt}"
                data-code="${transfer.code}" 
                data-id="${transfer.id}"
                data-recipient="${transfer.recipientFullName}"
                data-recipient-ccp="${transfer.recipientCCP}"
                data-amount="${transfer.amount}"
                data-tobereceived="${transfer.amountReceived}"
                data-transferdatetime="${new Date(transfer.transferDate).toISOString()}"
                data-status="${transfer.status}"
                data-completedat="${transfer.completedAt || 'N/A'}"
                data-paymentmethod="${transfer.paymentMethod || 'N/A'}">
                <i class="fa-solid fa-handshake-angle" style="font-size: 1rem; padding: 0 0.3rem; vertical-align: middle;"></i>
            </button>
        <button type="button" class="custom-button btn bg-gradient-dark btn-xs m-n1 mx-n1" style="margin: 0" data-id="${transfer.id}">
          <i class="fa-solid fa-upload" style="font-size: 1rem; padding: 0; vertical-align: middle;"></i>
        </button>
        <input class="form-check-label receipt-input" type="file" accept="image/*" style="display: none;">
      </td>
      <td class="text-center">
        <button type="button" class="custom-button btn bg-gradient-secondary btn-xs m-n1" data-id="${transfer.id}">
          <i class="fa-solid fa-paper-plane" style="font-size: 1rem; padding: 0 1rem; vertical-align: middle;"></i>
        </button>
      </td>
      <td class="text-center" style="padding: 0; margin: 0">
        <a href="#" class="phone-action" transfer-id="${transfer.id}" style="font-size: 1.9rem;">
          <i class="fa-solid fa-square-phone-flip"></i>
        </a>
      </td>`;

    // Add event listeners for dropdown items
    const dropdownItems = tr.querySelectorAll('.dropdown-item');
    dropdownItems.forEach(item => {
      item.addEventListener('click', function () {
        const selectedStatus = this.getAttribute('data-status');

        // Show confirmation modal
        const confirmationModal = new bootstrap.Modal(document.getElementById('confirmationModal'));
        document.getElementById('newStatus').textContent = selectedStatus;
        document.getElementById('confirmChangeStatus').onclick = function () {
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
              const badgeWrapper = document.querySelector(`#transfer-row-${transfer.id} .badge-dot`);
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

    // Attach click event listener to the <a> tag
    const phoneAction = tr.querySelector('.phone-action');
    phoneAction.addEventListener('click', function (event) {
      event.preventDefault();  // Prevent the default action of the link
      const transferId = this.getAttribute('transfer-id');

      // Make the API request using apiClient
      apiClient.get(`/api/v1/transfer/user-phone/${transferId}`)
        .then(response => {
          document.getElementById('userPhoneNumber').innerText = response.data;

          const phoneNumberModal = new bootstrap.Modal(document.getElementById('phoneNumberModal'));
          phoneNumberModal.show();

          console.log(`Transfer ID: ${transferId}`, response.data); // Log the results
        })
        .catch(error => {
          if (error.status === 404) {
            document.getElementById('userPhoneNumber').innerText = 'معندوش تيليفون حبيبنا';
            const phoneNumberModal = new bootstrap.Modal(document.getElementById('phoneNumberModal'));
            phoneNumberModal.show();
          }
          console.error('Request failed', error);
        });
    });

  });

  // get status class
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
  // Event delegation for showing receipt and details in modal
  document.querySelector("table").addEventListener("click", function (event) {
    if (event.target.closest("button[data-bs-target='#receiptModal']")) {
      const receiptButton = event.target.closest("button[data-bs-target='#receiptModal']");

      // Get all the necessary transfer data from the button's data attributes
      const receiptName = receiptButton.getAttribute("data-receipt");
      const receiptCode = receiptButton.getAttribute("data-code");
      const transferId = receiptButton.getAttribute("data-id");
      const recipient = receiptButton.getAttribute("data-recipient");
      const recipientCCP = receiptButton.getAttribute("data-recipient-ccp");
      const amount = receiptButton.getAttribute("data-amount");
      const toBeReceived = receiptButton.getAttribute("data-tobereceived");
      const transferDateTimeString = receiptButton.getAttribute("data-transferdatetime");
      const transferDateTime = new Date(transferDateTimeString);
      const status = receiptButton.getAttribute("data-status");
      const completedAt = receiptButton.getAttribute("data-completedat");
      const paymentMethod = receiptButton.getAttribute("data-paymentmethod");
      const modalImage = document.getElementById('receiptImage');

      const pstFormatter = new Intl.DateTimeFormat('en-US', {
        timeZone: 'America/Los_Angeles',
        dateStyle: 'short',
        timeStyle: 'short'
      });
      const pstTime = pstFormatter.format(transferDateTime);

      const gmt1Formatter = new Intl.DateTimeFormat('en-US', {
        timeZone: 'Etc/GMT-1', // GMT-1 time zone
        timeStyle: 'short'
      });
      const gmt1Time = gmt1Formatter.format(transferDateTime);

      // Update modal fields with the transfer data
      document.getElementById("transferCode").textContent = receiptCode;
      document.getElementById("transferId").textContent = transferId;
      document.getElementById("recipient").textContent = recipient;
      document.getElementById("recipientCCP").textContent = recipientCCP;
      document.getElementById("amount").textContent = `$${amount}`;
      document.getElementById("toBeReceived").textContent = `${toBeReceived} DZD`;
      document.getElementById("transferDateTime").textContent = `${pstTime} | DZ: ${gmt1Time}`;
      document.getElementById("status").textContent = status;
      document.getElementById("completedAt").textContent = completedAt;
      document.getElementById("paymentMethod").textContent = paymentMethod;

      if (!receiptName || receiptName === 'null') {
        modalImage.src = "../assets/img/NullReceipt.png";
      } else {
        // Fetch the receipt URL using Axios
        const token = localStorage.getItem('sb_token');
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
            modalImage.src = "../assets/img/NullReceipt.png"; // Default image if there's an error
          });
      }
    }
  });
});

// Pagination controlls
document.addEventListener('DOMContentLoaded', async function () {
  try {
    let isPendingFilterActive = false;  // Flag to toggle between all and pending transfers
    const initialData = await fetchAdminTransfers(0);
    const totalPages = initialData.totalPages;

    const paginationContainer = document.getElementById('pagination-container');
    const pendingFilterButton = document.getElementById('sortIcon');  // Assuming there's a button in your UI

    const maxVisiblePages = 6;

    // Handle pending filter button click
    pendingFilterButton.addEventListener('click', async function () {
      console.log(isPendingFilterActive);
      isPendingFilterActive = !isPendingFilterActive;  // Toggle filter
      const responseData = await (isPendingFilterActive ? fetchPendingTransfers(0) : fetchAdminTransfers(0));
      updateTransfers(responseData);
    });

    // Generate pagination items and render the first page
    generatePaginationItems(totalPages, 0);

    function generatePaginationItems(totalPages, currentPage) {
      paginationContainer.innerHTML = '';

      const prevItem = document.createElement('li');
      prevItem.classList.add('page-item');
      prevItem.innerHTML = `
        <a class="page-link" href="#" aria-label="Previous">
          <span aria-hidden="true">&laquo;</span>
        </a>`;
      prevItem.addEventListener('click', function (event) {
        event.preventDefault();
        if (currentPage > 0) {
          const newPage = currentPage - 1;
          updatePage(newPage);
        }
      });
      paginationContainer.appendChild(prevItem);

      let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2) + 1);
      let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

      if (endPage - startPage < maxVisiblePages - 1) {
        startPage = Math.max(1, endPage - maxVisiblePages + 1);
      }

      for (let i = startPage; i <= endPage; i++) {
        const pageItem = document.createElement('li');
        pageItem.classList.add('page-item');
        if (i === currentPage + 1) {
          pageItem.classList.add('active');
        }
        pageItem.innerHTML = `<a class="page-link text-dark text-bold" href="#">${i}</a>`;
        pageItem.addEventListener('click', function (event) {
          event.preventDefault();
          updatePage(i - 1);
        });
        paginationContainer.appendChild(pageItem);
      }

      const nextItem = document.createElement('li');
      nextItem.classList.add('page-item');
      nextItem.innerHTML = `
        <a class="page-link" href="#" aria-label="Next">
          <span aria-hidden="true">&raquo;</span>
        </a>`;
      nextItem.addEventListener('click', function (event) {
        event.preventDefault();
        if (currentPage < totalPages - 1) {
          const newPage = currentPage + 1;
          updatePage(newPage);
        }
      });
      paginationContainer.appendChild(nextItem);
    }

    async function updatePage(page) {
      generatePaginationItems(totalPages, page);
      const responseData = await (isPendingFilterActive ? fetchPendingTransfers(page) : fetchAdminTransfers(page));
      updateTransfers(responseData);
    }

  } catch (error) {
    console.error('Error fetching initial data:', error);
  }
});

// Add event listener to the input field to clear error on input change
document.getElementById("newRate").addEventListener("input", clearErrorMessage);

document.getElementById("changeRate").addEventListener("click", function() {
  const newRate = document.getElementById("newRate").value;

  if (newRate === "") {
    document.getElementById('rate-error').innerHTML = '<i class="fa fa-warning" aria-hidden="true" style="padding: 0 5px;"></i>' + 'Please enter a rate.';
    return;
  }

  // Send an API request using Axios
  apiClient.post(`api/v1/rate?newRate=${newRate}`)
    .then(response => {
      if (response.status === 201) {
        // Hide the changeRateModal first
        const changeRateModal = bootstrap.Modal.getInstance(document.getElementById('changeRateModal'));
        changeRateModal.hide();

        // Show the receiptConfirmation modal
        const receiptConfirmationModal = new bootstrap.Modal(document.getElementById('receiptConfirmation'));
        receiptConfirmationModal.show();
      }
    })
    .catch(error => {
      document.getElementById('rate-error').innerHTML = '<i class="fa fa-warning" aria-hidden="true" style="padding: 0 5px;"></i>' + error.response.data.message;
      console.error("Error changing rate:", error);
    });
});

function clearErrorMessage() {
  document.getElementById('rate-error').innerHTML = '';
}
