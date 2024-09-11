import apiClient from './apiClient.js';

// Pagination controlls
document.addEventListener('DOMContentLoaded', async function() {
  try {
    let isPendingFilterActive = false; 
    const initialData = await fetchTransfers(0);
    const totalPages = initialData.totalPages;

    const paginationContainer = document.getElementById('pagination-container');
    const pendingFilterButton = document.getElementById('sortIcon');

    const maxVisiblePages = 6;

    // Handle pending filter button click
    pendingFilterButton.addEventListener('click', async function() {
      console.log(isPendingFilterActive);
      isPendingFilterActive = !isPendingFilterActive;  // Toggle filter
      const responseData = await (isPendingFilterActive ? fetchNonCanceledTransfers(0) : fetchTransfers(0));
      updateTransfers(responseData);
    });

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
        pageItem.innerHTML = `<a class="page-link text-dark text-bold" href="#">${i}</a>`;
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
      const responseData = await fetchTransfers(page);
      updateTransfers(responseData);
    }

  } catch (error) {
    console.error('Error fetching initial data:', error);
  }
});

async function fetchTransfers(page = 0, size = 15) {
  try {
    const response = await apiClient.get(`api/v1/transfer`, {
      params: { page: page, size: size }
    });

    return response.data;
  } catch (error) {
    throw new Error('Network response was not ok: ' + error.message);
  }
}

async function fetchNonCanceledTransfers(page = 0, size = 15) {
  try {
    const response = await apiClient.get(`api/v1/transfer/NonCancelled`, {
      params: { page: page, size: size }
    });

    return response.data;
  } catch (error) {
    throw new Error('Network response was not ok: ' + error.message);
  }
}

// MAP TRANSFERS
async function updateTransfers(responseData) {
  const transfers = responseData.content;
  const tbody = document.querySelector('tbody');
  tbody.innerHTML = ''; // Clear any existing rows

  for (const transfer of transfers) {
    const tr = document.createElement('tr');
    tr.id = `transfer-row-${transfer.id}`;

    if (transfer.recipientFullName === "One Time Transfer") {
      tr.classList.add('grayed-out');
    }

    const recipientTd = document.createElement('td');
    let fullName = window.innerWidth <= 768 ? transfer.recipientFullName.split(' ')[0] : transfer.recipientFullName;
    fullName = fullName === 'One' ? 'Guest' : fullName;
    recipientTd.innerHTML = `
          <div class="d-flex px-2">
              <div>
                  <img src="https://ui-avatars.com/api/?name=${transfer.recipientFullName.charAt(0)}&background=random&size=128" class="avatar avatar-xs rounded-circle me-2">
              </div>
              <div class="my-auto">
                  <h6 class="mb-0 text-xs">${fullName}</h6>
              </div>
          </div>`;
    tr.appendChild(recipientTd);

    const amountTd = document.createElement('td');
    amountTd.innerHTML = `<p class="text-xs font-weight-bold mb-0 text-center">$${transfer.amount}</p>`;
    tr.appendChild(amountTd);

    const statusTd = document.createElement('td');
    const statusClass = transfer.status === 'RECEIVED' ? 'bg-success' :
      transfer.status === 'PROCESSING' ? 'bg-info' :
        transfer.status === 'PENDING' ? 'bg-secondary' : 'bg-danger';
        statusTd.classList.add('align-middle', 'text-center');
        statusTd.innerHTML = `
          <span class="badge badge-dot">
            <span class="badge rounded-pill ${statusClass}">${transfer.status}</span>
          </span>`;
        tr.appendChild(statusTd);

    const amountReceivedTd = document.createElement('td');
    amountReceivedTd.innerHTML = `<p class="text-xs font-weight-bold mb-0 text-center">${transfer.amountReceived} DZD</p>`;
    tr.appendChild(amountReceivedTd);

    const dateTd = document.createElement('td');
    dateTd.classList.add('align-middle', 'text-center');
    dateTd.innerHTML = `<div class="align-items-center"><p class="text-xs font-weight-bold mb-0 text-center">${new Date(transfer.transferDate).toLocaleDateString()}</p></div>`;
    tr.appendChild(dateTd);

    // Add receipt button column
    const receiptTd = document.createElement('td');
    receiptTd.classList.add('align-middle', 'text-center');
    receiptTd.innerHTML = `
           <button type="button" class="btn btn-outline-dark btn-xs" style="margin: 0 0.9rem;" 
                data-bs-toggle="modal" data-bs-target="#receiptModal" 
                data-receipt="${transfer.receipt}" 
                data-id="${transfer.id}"
                data-recipient="${transfer.recipientFullName}"
                data-amount="${transfer.amount}"
                data-tobereceived="${transfer.amountReceived}"
                data-transferdatetime="${new Date(transfer.transferDate).toLocaleString()}"
                data-status="${transfer.status}"
                data-completedat="${transfer.completedAt || 'N/A'}"
                data-paymentmethod="${transfer.paymentMethod || 'N/A'}">
                <i class="fa-solid fa-handshake-angle" style="font-size: 1rem; padding: 0 0.3rem; vertical-align: middle;"></i>
            </button>`;
    tr.appendChild(receiptTd);

    // Add smaller ellipsis icon with cancel option
    const optionsTd = document.createElement('td');
    optionsTd.classList.add('align-middle', 'text-center');
    optionsTd.style.width = '70px'; // Set a fixed smaller width for the column
    optionsTd.innerHTML = `
      <div class="dropdown">
        <button class="btn btn-link text-dark p-0 mb-n1" type="button" data-bs-toggle="dropdown" aria-expanded="false" style="font-size: 1.5rem;">
          <i class="fa-solid fa-ellipsis-vertical"></i>
        </button>
        <ul class="dropdown-menu dropdown-menu-end p-1" style="min-width: 80px; font-size: 0.9rem;">
          <li><a class="dropdown-item cancel-transfer" href="#" transfer-id="${transfer.id}">Cancel</a></li>
        </ul>
      </div>`;
    tr.appendChild(optionsTd);

    const cancelButton = tr.querySelector('.cancel-transfer');
    cancelButton.addEventListener('click', function () {
      const transferId = this.getAttribute('transfer-id');
      showCancelModal(transferId); // Call the external function here
    });

    tbody.appendChild(tr);
  }
}

// Show the confirmation modal for cancel
function showCancelModal(transferId) {
  const cancelModal = new bootstrap.Modal(document.getElementById('cancelTransferModal'));
  
  // Clear any previous error messages when the modal is shown
  document.getElementById('cancel-error').innerHTML = '';
  
  // Show the modal
  cancelModal.show();

  // Handle the cancel button click in the modal
  document.getElementById('confirmCancelTransfer').onclick = function () {
    // Make PATCH request to cancel the transfer
    apiClient.patch(`/api/v1/transfer/cancel/${transferId}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('sb_token')}`
      }
    })
    .then(response => {
      // Optionally update the row status to canceled
      const badgeWrapper = document.querySelector(`#transfer-row-${transferId} .badge-dot`);
      if (badgeWrapper) {
        const badge = badgeWrapper.querySelector('.badge');
        badge.className = 'badge rounded-pill bg-danger';
        badge.textContent = 'CANCELED';
      }
      // Hide the modal
      cancelModal.hide();
    })
    .catch(error => {
      console.error('Error canceling transfer:', error);
      document.getElementById('cancel-error').innerHTML = 'only <strong>PENDING</strong> transfers can be canceled';
    });
  };
}


// Display transfers.
document.addEventListener('DOMContentLoaded', async () => {
  try {
    const responseData = await fetchTransfers();
    updateTransfers(responseData);
  } catch (error) {
    console.error('Error fetching transfers:', error);
  }
});

// GET receipt URL.
document.addEventListener("DOMContentLoaded", function () {
  // Event delegation for showing receipt and details in modal
  document.querySelector("table").addEventListener("click", function (event) {
    if (event.target.closest("button[data-bs-target='#receiptModal']")) {
      const receiptButton = event.target.closest("button[data-bs-target='#receiptModal']");

      // Get all the necessary transfer data from the button's data attributes
      const receiptName = receiptButton.getAttribute("data-receipt");
      const transferId = receiptButton.getAttribute("data-id");
      const recipient = receiptButton.getAttribute("data-recipient");
      const amount = receiptButton.getAttribute("data-amount");
      const toBeReceived = receiptButton.getAttribute("data-tobereceived");
      const transferDateTime = receiptButton.getAttribute("data-transferdatetime");
      const status = receiptButton.getAttribute("data-status");
      const completedAt = receiptButton.getAttribute("data-completedat");
      const paymentMethod = receiptButton.getAttribute("data-paymentmethod");
      const modalImage = document.getElementById('receiptImage');

      // Update modal fields with the transfer data
      document.getElementById("transferId").textContent = transferId;
      document.getElementById("recipient").textContent = recipient;
      document.getElementById("amount").textContent = `$${amount}`;
      document.getElementById("toBeReceived").textContent = `${toBeReceived} DZD`;
      document.getElementById("transferDateTime").textContent = transferDateTime;
      document.getElementById("status").textContent = status;
      document.getElementById("completedAt").textContent = completedAt;
      document.getElementById("paymentMethod").textContent = paymentMethod;

      if (!receiptName || receiptName === 'null') {
        modalImage.src = "https://live.staticflickr.com/65535/53920294662_136cda84df_c.jpg";
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
            modalImage.src = "https://live.staticflickr.com/65535/53920294662_136cda84df_c.jpg"; // Default image if there's an error
          });
      }
    }
  });
});

function showFirstNameForMobile() {
  if (window.innerWidth <= 768) { // Only run for screens 768px or less
    document.querySelectorAll('#recipientFullName').forEach(function(nameElement) {
      let fullName = nameElement.textContent.trim();
      let firstName = fullName.split(' ')[0]; // Split at the first space
      nameElement.textContent = firstName; // Display only the first name
    });
  }
}

// Call the function on page load and window resize
window.addEventListener('load', showFirstNameForMobile);
window.addEventListener('resize', showFirstNameForMobile);

// Show add phone number MODAL
document.addEventListener('DOMContentLoaded', () => {
  function checkUserPhoneNumber() {

    if (localStorage.getItem('dismissedPhoneModal') === 'true') 
      return;

    apiClient.get('/api/v1/user/has-phone')
      .then(response => {
        if (!response.data) {
          const phoneModal = new bootstrap.Modal(document.getElementById('addPhoneNumberModal'));
          phoneModal.show();

          // Event listener for the "Don't show anymore" button
          const dontShowAgainBtn = document.getElementById('dontShowAgainBtn');
          dontShowAgainBtn.addEventListener('click', () => {
            localStorage.setItem('dismissedPhoneModal', 'true');
            phoneModal.hide();
          });
        }
      })
      .catch(error => {
        console.error('Error checking phone number:', error);
      });
  }

  checkUserPhoneNumber();
});
