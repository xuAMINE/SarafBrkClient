import apiClient from './apiClient.js';

async function fetchTransfers() {
  try {
    const response = await apiClient.get('api/v1/transfer');

    return response.data;

  } catch (error) {
    throw new Error('Network response was not ok ' + response.statusText);
  }
}

async function fetchReceipt(transfer_id) {
  try {
    const response = await apiClient.get(`api/v1/transfer/receipt/${transfer_id}`);
    return response.data;
  } catch (error) {
    console.error('Network or other error:', error);
    throw new Error('Network response was not ok: ' + error.message);
  }
}

// MAP TRANSFERS
async function updateTransfers(transfers) {
  const tbody = document.querySelector('tbody');
  tbody.innerHTML = ''; // Clear any existing rows

  for (const transfer of transfers) {
      const tr = document.createElement('tr');

      if (transfer.recipientFullName === "One Time Transfer") {
          tr.classList.add('grayed-out');
      }

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

      const amountTd = document.createElement('td');
      amountTd.innerHTML = `<p class="text-xs font-weight-bold mb-0">$${transfer.amount}</p>`;
      tr.appendChild(amountTd);

      const amountReceivedTd = document.createElement('td');
      amountReceivedTd.innerHTML = `<p class="text-xs font-weight-bold mb-0">${transfer.amountReceived} DZD</p>`;
      tr.appendChild(amountReceivedTd);

      const statusTd = document.createElement('td');
      const statusClass = transfer.status === 'RECEIVED' ? 'bg-success' : 
                          transfer.status === 'PROCESSING' ? 'bg-info' :
                          transfer.status === 'PENDING' ? 'bg-secondary' : 'bg-danger';
      statusTd.innerHTML = `
          <span class="badge badge-dot me-4">
              <span class="badge rounded-pill ${statusClass}">${transfer.status}</span>
          </span>`;
      tr.appendChild(statusTd);

      const dateTd = document.createElement('td');
      dateTd.classList.add('align-middle', 'text-center');
      dateTd.innerHTML = `<div class="d-flex align-items-center"><p class="text-xs font-weight-bold mb-0">${new Date(transfer.transferDate).toLocaleDateString()}</p></div>`;
      tr.appendChild(dateTd);
      
      // Fetch the receipt URL and add the receipt button
      try {
          const url = await fetchReceipt(transfer.id);

          // Add receipt button column
          const receiptTd = document.createElement('td');
          receiptTd.innerHTML = `
              <button type="button" class="btn btn-outline-dark btn-xs" style="margin: 0 0.9rem;" 
                  data-bs-toggle="modal" data-bs-target="#receiptModal" 
                  data-receipt="${url}">
                  <i class="fa-solid fa-handshake-angle" style="font-size: 1rem; padding: 0 0.3rem; vertical-align: middle;"></i>
              </button>`;
          tr.appendChild(receiptTd);
      } catch (error) {
          console.error('Error fetching receipt:', error);
      }

      tbody.appendChild(tr);
  }
}


document.addEventListener('DOMContentLoaded', async () => {
  try {
      const transfers = await fetchTransfers();
      updateTransfers(transfers);
  } catch (error) {
      console.error('Error fetching transfers:', error);
  }

  var receiptModal = document.getElementById('receiptModal');
    receiptModal.addEventListener('show.bs.modal', function (event) {
      var button = event.relatedTarget;
      var receiptImageSrc = button.getAttribute('data-receipt');
      var modalImage = receiptModal.querySelector('#receiptImage');
      
      // Check if data-receipt is empty or undefined and set default image if needed
      if (!receiptImageSrc || receiptImageSrc === 'null') {
        modalImage.src = 'https://live.staticflickr.com/65535/53920294662_136cda84df_c.jpg'; // Replace with your default image path
      } else {
        modalImage.src = receiptImageSrc;
      }
    });
});

