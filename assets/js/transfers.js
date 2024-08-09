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
  
        tbody.appendChild(tr);
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

