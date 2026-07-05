(function() {
  // ============ DOM REFS ============
  const gridContainer = document.getElementById('customerGridContainer');
  const form = document.getElementById('customerForm');
  const editIdInput = document.getElementById('editId');
  const formTitle = document.getElementById('formTitle');
  const editIdDisplay = document.getElementById('editIdDisplay');
  const searchInput = document.getElementById('searchInput');
  const statsWrapper = document.getElementById('statsWrapper');
  const toggleIcon = document.getElementById('toggleIcon');

  const fName = document.getElementById('custName');
  const fMobile = document.getElementById('custMobile');
  const fAddress = document.getElementById('custAddress');
  const fImg = document.getElementById('custImg');
  const fLoanTaken = document.getElementById('loanTaken');
  const fLoanDate = document.getElementById('loanDate');
  const fPurpose = document.getElementById('loanPurpose');
  const fRepayDate = document.getElementById('repayDate');
  const fPaid = document.getElementById('paidAmount');
  const fInterest = document.getElementById('interestRate');

  // Stats
  const elTotalCust = document.getElementById('totalCustomers');
  const elTotalMoney = document.getElementById('totalMoney');
  const elTotalInterest = document.getElementById('totalInterest');
  const elTotalProfit = document.getElementById('totalProfit');
  const elTotalLoss = document.getElementById('totalLoss');

  // ============ DASHBOARD TOGGLE ============
  let dashboardVisible = false;
  statsWrapper.classList.add('hidden');
  toggleIcon.className = 'fas fa-chevron-right';

  document.getElementById('dashboardToggle').addEventListener('click', function() {
    dashboardVisible = !dashboardVisible;
    if (dashboardVisible) {
      statsWrapper.classList.remove('hidden');
      toggleIcon.className = 'fas fa-chevron-down';
    } else {
      statsWrapper.classList.add('hidden');
      toggleIcon.className = 'fas fa-chevron-right';
    }
  });

  // ============ CALCULATIONS ============
  function calcRemaining(cust) {
    const loan = parseFloat(cust.loanTaken) || 0;
    const interest = parseFloat(cust.interestRate) || 0;
    const paid = parseFloat(cust.paidAmount) || 0;
    const interestAmount = loan * (interest / 100);
    const remaining = loan + interestAmount - paid;
    return Math.max(0, remaining);
  }

  // ============ RENDER CUSTOMERS ============
  function renderCustomers(snapshot) {
    const customers = [];
    snapshot.forEach(doc => {
      const data = doc.data();
      data.id = doc.id;
      customers.push(data);
    });

    const searchTerm = searchInput.value.toLowerCase().trim();
    const filtered = searchTerm ? customers.filter(c => c.name && c.name.toLowerCase().includes(searchTerm)) : customers;

    // Render Cards
    if (filtered.length === 0) {
      gridContainer.innerHTML = `<div style="grid-column:1/-1; padding:2rem; text-align:center; color:#8f7e68;">No customers found.</div>`;
    } else {
      let html = '';
      filtered.forEach((c) => {
        const remaining = calcRemaining(c);
        const isPaid = remaining <= 0.01;
        const imgSrc = c.imgUrl && c.imgUrl.trim() !== '' ? c.imgUrl : `https://ui-avatars.com/api/?name=${encodeURIComponent(c.name || 'User')}&background=b8860b&color=fff&size=40`;
        const statusHtml = isPaid 
          ? `<span class="status-badge paid"><i class="fas fa-check-circle"></i> PAID</span> <span class="status-badge congrats"><i class="fas fa-trophy"></i> Congrats!</span>`
          : `<span class="status-badge"><i class="fas fa-hourglass-half"></i> baki</span>`;
        html += `
          <div class="customer-card" data-id="${c.id}">
            <div class="top-row">
              <img src="${imgSrc}" alt="img" onerror="this.src='https://ui-avatars.com/api/?name=${encodeURIComponent(c.name || 'User')}&background=b8860b&color=fff&size=40'">
              <span class="name">${c.name || '-'}</span>
            </div>
            <div class="detail-row">
              <span class="label">Mobile</span><span class="value">${c.mobile || '-'}</span>
              <span class="label">Address</span><span class="value">${c.address || '-'}</span>
              <span class="label">Loan (₹)</span><span class="value">${c.loanTaken || 0}</span>
              <span class="label">Kab lia</span><span class="value">${c.loanDate || '-'}</span>
              <span class="label">Purpose</span><span class="value">${c.purpose || '-'}</span>
              <span class="label">Kab dega</span><span class="value">${c.repayDate || '-'}</span>
              <span class="label">Paid (₹)</span><span class="value">${c.paidAmount || 0}</span>
              <span class="label">Interest %</span><span class="value">${c.interestRate || 0}%</span>
              <span class="label">Baki (₹)</span><span class="value ${remaining < 1 ? 'remaining-zero' : ''}">${remaining.toFixed(2)}</span>
              <span class="label">Status</span><span class="value">${statusHtml}</span>
            </div>
            <div class="actions">
              <button class="btn btn-gold btn-sm edit-btn" data-id="${c.id}"><i class="fas fa-edit"></i> Edit</button>
              <button class="btn btn-danger btn-sm delete-btn" data-id="${c.id}"><i class="fas fa-trash-alt"></i> Del</button>
              ${!isPaid ? `<button class="btn btn-primary btn-sm pay-btn" data-id="${c.id}" style="background:#3d6b6b;"><i class="fas fa-hand-holding-usd"></i> Pay</button>` : ''}
            </div>
          </div>
        `;
      });
      gridContainer.innerHTML = html;
    }

    // Stats
    let totalCust = customers.length;
    let totalLoan = 0, totalInterest = 0, totalPaid = 0;
    customers.forEach(c => {
      totalLoan += parseFloat(c.loanTaken) || 0;
      totalInterest += (parseFloat(c.loanTaken) || 0) * ((parseFloat(c.interestRate) || 0) / 100);
      totalPaid += parseFloat(c.paidAmount) || 0;
    });
    const totalProfit = totalInterest;
    const totalLoss = 0;

    elTotalCust.textContent = totalCust;
    elTotalMoney.textContent = `₹${totalLoan.toFixed(0)}`;
    elTotalInterest.textContent = `₹${totalInterest.toFixed(0)}`;
    elTotalProfit.textContent = `₹${totalProfit.toFixed(0)}`;
    elTotalLoss.textContent = `₹${totalLoss.toFixed(0)}`;

    // Attach events
    document.querySelectorAll('.edit-btn').forEach(btn => btn.addEventListener('click', onEdit));
    document.querySelectorAll('.delete-btn').forEach(btn => btn.addEventListener('click', onDelete));
    document.querySelectorAll('.pay-btn').forEach(btn => btn.addEventListener('click', onPay));
  }

  // ============ FIRESTORE LISTENER ============
  let lastSnapshot = null;
  function listenCustomers() {
    db.collection('customers').orderBy('name', 'asc').onSnapshot(snapshot => {
      lastSnapshot = snapshot;
      renderCustomers(snapshot);
    }, error => {
      console.error('Firestore error:', error);
      gridContainer.innerHTML = `<div style="grid-column:1/-1; padding:2rem; color:#b13e3e;">⚠️ Error loading data. Check Firebase config.</div>`;
    });
  }

  // ============ CRUD FUNCTIONS ============
  function addOrUpdateCustomer(e) {
    e.preventDefault();
    const name = fName.value.trim();
    const mobile = fMobile.value.trim();
    const address = fAddress.value.trim();
    const imgUrl = fImg.value.trim();
    const loanTaken = parseFloat(fLoanTaken.value) || 0;
    const loanDate = fLoanDate.value;
    const purpose = fPurpose.value.trim();
    const repayDate = fRepayDate.value;
    const paidAmount = parseFloat(fPaid.value) || 0;
    const interestRate = parseFloat(fInterest.value) || 0;

    if (!name || !mobile || loanTaken <= 0 || !loanDate) {
      alert('Required: Name, Mobile, Loan amount, and Date (Kab lia)');
      return;
    }

    const data = { name, mobile, address, imgUrl, loanTaken, loanDate, purpose, repayDate, paidAmount, interestRate };
    const editId = editIdInput.value;

    if (editId) {
      db.collection('customers').doc(editId).update(data).then(() => resetForm()).catch(err => alert('Update error: '+err.message));
    } else {
      db.collection('customers').add(data).then(() => resetForm()).catch(err => alert('Add error: '+err.message));
    }
  }

  function onEdit(e) {
    const id = e.currentTarget.dataset.id;
    db.collection('customers').doc(id).get().then(doc => {
      if (!doc.exists) return;
      const c = doc.data();
      fName.value = c.name || '';
      fMobile.value = c.mobile || '';
      fAddress.value = c.address || '';
      fImg.value = c.imgUrl || '';
      fLoanTaken.value = c.loanTaken || '';
      fLoanDate.value = c.loanDate || '';
      fPurpose.value = c.purpose || '';
      fRepayDate.value = c.repayDate || '';
      fPaid.value = c.paidAmount || 0;
      fInterest.value = c.interestRate || 12;
      editIdInput.value = id;
      formTitle.innerHTML = 'Edit customer';
      editIdDisplay.textContent = '✏️ ' + c.name;
      window.scrollTo({ top: document.getElementById('addEditCard').offsetTop - 20, behavior: 'smooth' });
    });
  }

  function onDelete(e) {
    const id = e.currentTarget.dataset.id;
    if (!confirm('Delete this customer?')) return;
    db.collection('customers').doc(id).delete().catch(err => alert('Delete error: '+err.message));
  }

  function onPay(e) {
    const id = e.currentTarget.dataset.id;
    db.collection('customers').doc(id).get().then(doc => {
      if (!doc.exists) return;
      const c = doc.data();
      const remaining = calcRemaining(c);
      if (remaining <= 0.01) { alert('Already paid! 🎉'); return; }
      let payAmount = prompt(`Enter payment (₹) \nRemaining: ₹${remaining.toFixed(2)}`, Math.min(remaining, 1000).toFixed(0));
      if (payAmount === null) return;
      payAmount = parseFloat(payAmount);
      if (isNaN(payAmount) || payAmount <= 0) { alert('Invalid amount'); return; }
      const newPaid = (parseFloat(c.paidAmount) || 0) + payAmount;
      const maxPay = parseFloat(c.loanTaken) + (parseFloat(c.loanTaken) * (parseFloat(c.interestRate)/100));
      const finalPaid = Math.min(newPaid, maxPay);
      db.collection('customers').doc(id).update({ paidAmount: finalPaid }).catch(err => alert('Pay error: '+err.message));
    });
  }

  function resetForm() {
    form.reset();
    editIdInput.value = '';
    formTitle.innerHTML = 'Add customer';
    editIdDisplay.textContent = '';
    fInterest.value = 12;
  }

  // ============ EVENT LISTENERS ============
  searchInput.addEventListener('input', () => {
    if (lastSnapshot) renderCustomers(lastSnapshot);
  });

  form.addEventListener('submit', addOrUpdateCustomer);
  document.getElementById('clearFormBtn').addEventListener('click', resetForm);

  // ============ START ============
  listenCustomers();
  console.log('✅ Maa Laxmi Admin with Firebase + Dashboard + Cards ready.');
})();
