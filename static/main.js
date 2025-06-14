// Main JavaScript for ZakatPay
// Handles CRUD, modal, table rendering, notifications

document.addEventListener('DOMContentLoaded', () => {
  const payersTableWrap = document.getElementById('payersTableWrap');
  const noti = document.getElementById('noti');
  const addPayerBtn = document.getElementById('addPayerBtn');
  const payerModal = document.getElementById('payerModal');
  const payerForm = document.getElementById('payerForm');
  const cancelBtn = document.getElementById('cancelBtn');
  const modalTitle = document.getElementById('modalTitle');
  const payerIdInput = document.getElementById('payerId');
  const confirmDialog = document.getElementById('confirmDialog');
  const confirmText = document.getElementById('confirmText');
  const confirmYes = document.getElementById('confirmYes');
  const confirmNo = document.getElementById('confirmNo');

  let editingId = null;
  let payers = [];

  function showNoti(msg, error = false) {
    noti.textContent = msg;
    noti.className = error ? 'error' : '';
    noti.classList.remove('hidden');
    setTimeout(() => noti.classList.add('hidden'), 2200);
  }

  function formatRupiah(num) {
    return 'Rp' + Number(num).toLocaleString('id-ID');
  }

  function formatDate(dateStr) {
    const d = new Date(dateStr);
    return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
  }

  function renderTable() {
    if (!payers.length) {
      payersTableWrap.innerHTML = `
        <div class="card-empty">
          {% include '_icon_empty.svg' %}
          <div class="mt-2 text-green font-bold">Belum ada data pembayar Zakat.<br>Silakan tambahkan data baru.</div>
        </div>
      `;
      return;
    }
    let rows = payers.map(p => `
      <tr>
        <td>${p.name}</td>
        <td>${formatRupiah(p.amount)}</td>
        <td>${formatDate(p.pay_date)}</td>
        <td>
          <button class="action-btn" data-edit="${p.id}" title="Ubah">{% include '_icon_pencil.svg' %}</button>
          <button class="action-btn" data-del="${p.id}" title="Hapus">{% include '_icon_trash2.svg' %}</button>
        </td>
      </tr>
    `).join('');
    payersTableWrap.innerHTML = `
      <table>
        <thead>
          <tr><th>Nama</th><th>Jumlah</th><th>Tanggal</th><th>Aksi</th></tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>
    `;
  }

  function fetchPayers() {
    fetch('/api/payers').then(r => r.json()).then(data => {
      payers = data;
      renderTable();
    });
  }

  function openModal(edit = false, data = null) {
    payerModal.classList.remove('hidden');
    payerForm.reset();
    payerIdInput.value = '';
    editingId = null;
    if (edit && data) {
      modalTitle.textContent = 'Ubah Pembayar';
      payerForm.name.value = data.name;
      payerForm.amount.value = data.amount;
      payerForm.pay_date.value = data.pay_date;
      payerIdInput.value = data.id;
      editingId = data.id;
    } else {
      modalTitle.textContent = 'Tambah Pembayar';
    }
  }

  function closeModal() {
    payerModal.classList.add('hidden');
    editingId = null;
  }

  function openConfirmDialog(text, cb) {
    confirmText.textContent = text;
    confirmDialog.classList.remove('hidden');
    confirmYes.onclick = () => { confirmDialog.classList.add('hidden'); cb(); };
    confirmNo.onclick = () => confirmDialog.classList.add('hidden');
  }

  addPayerBtn.onclick = () => openModal();
  cancelBtn.onclick = closeModal;

  payerForm.onsubmit = function(e) {
    e.preventDefault();
    const name = payerForm.name.value.trim();
    const amount = payerForm.amount.value;
    const pay_date = payerForm.pay_date.value;
    if (name.length < 2) return showNoti('Nama minimal 2 karakter', true);
    if (!amount || amount <= 0) return showNoti('Jumlah harus lebih dari 0', true);
    if (!pay_date) return showNoti('Tanggal wajib diisi', true);
    const payload = { name, amount, pay_date };
    if (editingId) {
      fetch(`/api/payers/${editingId}`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload)
      }).then(r => r.json()).then(res => {
        if (res.error) return showNoti(res.error, true);
        showNoti(`Data pembayar ${res.name} berhasil diperbarui.`);
        closeModal();
        fetchPayers();
      });
    } else {
      fetch('/api/payers', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload)
      }).then(r => r.json()).then(res => {
        if (res.error) return showNoti(res.error, true);
        showNoti(`Data pembayar ${res.name} berhasil ditambahkan.`);
        closeModal();
        fetchPayers();
      });
    }
  };

  payersTableWrap.onclick = function(e) {
    const editBtn = e.target.closest('[data-edit]');
    const delBtn = e.target.closest('[data-del]');
    if (editBtn) {
      const id = editBtn.getAttribute('data-edit');
      const payer = payers.find(p => p.id == id);
      openModal(true, payer);
    } else if (delBtn) {
      const id = delBtn.getAttribute('data-del');
      const payer = payers.find(p => p.id == id);
      openConfirmDialog(`Apakah Anda yakin ingin menghapus data ${payer.name}? Tindakan ini tidak dapat dibatalkan.`, () => {
        fetch(`/api/payers/${id}`, { method: 'DELETE' })
          .then(r => r.json())
          .then(res => {
            showNoti(`Data pembayar ${payer.name} berhasil dihapus.`);
            fetchPayers();
          });
      });
    }
  };

  // Modal close on outside click
  payerModal.onclick = e => { if (e.target === payerModal) closeModal(); };
  confirmDialog.onclick = e => { if (e.target === confirmDialog) confirmDialog.classList.add('hidden'); };

  fetchPayers();
});
