import apiClient from './apiClient.js';

document.addEventListener('DOMContentLoaded', async function() {
  try {
    const initialData = await fetchTransfers(0);
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

// MAP TRANSFERS
async function updateTransfers(responseData) {
  const transfers = responseData.content;
  const tbody = document.querySelector('tbody');
  tbody.innerHTML = ''; // Clear any existing rows

  for (const transfer of transfers) {
    const tr = document.createElement('tr');

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
                data-receipt="${transfer.receipt}" data-id="${transfer.id}">
                <i class="fa-solid fa-handshake-angle" style="font-size: 1rem; padding: 0 0.3rem; vertical-align: middle;"></i>
            </button>`;
    tr.appendChild(receiptTd);

    tbody.appendChild(tr);
  }
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

