// Gắn sự kiện cho tất cả bàn có sẵn
document.querySelectorAll('.table-box').forEach(initTable);

// ======================= 1. LOCALSTORAGE =======================
function getTableState(tableKey) {
    const data = localStorage.getItem('tableState');
    return data ? JSON.parse(data)[tableKey] : null;
}

function saveTableState(tableKey, startTime, startDate) {
    const data = localStorage.getItem('tableState');
    const state = data ? JSON.parse(data) : {};
    state[tableKey] = { startTime, startDate };
    localStorage.setItem('tableState', JSON.stringify(state));
}

function clearTableState(tableKey) {
    const data = localStorage.getItem('tableState');
    if (data) {
        const state = JSON.parse(data);
        delete state[tableKey];
        localStorage.setItem('tableState', JSON.stringify(state));
    }
}

// ======================= 2. LOGIC BÀN =======================
function initTable(table) {
    const btnOpen = table.querySelector('.btn-mo');
    const btnCalc = table.querySelector('.btn-tinh');
    const btnDelete = table.querySelector('.btn-xoa');
    const timer = table.querySelector('.timer');

    const loaiBan = table.getAttribute('data-loai');
    const giaBan = table.getAttribute('data-gia');
    const nameHeader = table.querySelector('h3').textContent;
    const tableNum = parseInt(nameHeader.match(/\d+/)[0]);
    const tableKey = `${loaiBan}_${tableNum}`;

    let startTime = null;
    let interval = null;
    let startDate = null;

    // --- Đồng hồ ---
    const updateTimerDisplay = (startTs) => {
        const elapsed = Date.now() - startTs;
        const h = Math.floor(elapsed / 3600000);
        const m = Math.floor((elapsed % 3600000) / 60000);
        const s = Math.floor((elapsed % 60000) / 1000);
        
        timer.textContent = 
            `${h.toString().padStart(2, '0')}:` +
            `${m.toString().padStart(2, '0')}:` +
            `${s.toString().padStart(2, '0')}`;
    };

    const startTimerLoop = (startTs) => {
        if (interval) clearInterval(interval);
        updateTimerDisplay(startTs); 
        btnOpen.style.display = 'none';
        btnCalc.style.display = 'inline-block';
        interval = setInterval(() => { updateTimerDisplay(startTs); }, 1000);
    };

    // --- Load trạng thái ---
    const savedState = getTableState(tableKey);
    if (savedState) {
        startTime = savedState.startTime;
        startDate = new Date(savedState.startDate);
        table.classList.remove('trong');
        table.classList.remove('datcho');
        table.classList.add('dangchoi');
        startTimerLoop(startTime);
    } else {
        btnOpen.style.display = 'inline-block';
        btnCalc.style.display = 'none';
        timer.textContent = "00:00:00";
    }

    // 👉 NÚT MỞ
    btnOpen.addEventListener('click', () => {
        if (getTableState(tableKey)) return;
        startDate = new Date();
        startTime = Date.now();
        saveTableState(tableKey, startTime, startDate);
        table.classList.remove('trong');
        table.classList.remove('datcho');
        table.classList.add('dangchoi');
        startTimerLoop(startTime);
    });

    // 👉 NÚT TÍNH TIỀN
    btnCalc.addEventListener('click', () => {
        if (!startTime) return;

        if (!confirm(`Xác nhận tính tiền cho ${nameHeader}?`)) return;

        clearInterval(interval);
        interval = null;
        
        const finalTimeStr = timer.textContent.trim();
        const finalStartDate = startDate;
        const endDate = new Date();

        table.classList.remove('dangchoi');
        table.classList.add('trong');
        timer.textContent = "00:00:00";
        btnOpen.style.display = 'inline-block';
        btnCalc.style.display = 'none';

        clearTableState(tableKey);
        startTime = null;
        startDate = null;

        // --- TÍNH TOÁN ---
        const formatTime = (date) => date ? date.toTimeString().substring(0, 5) : '---';
        const [h, m, s] = finalTimeStr.split(':').map(Number);
        const totalHours = h + (m / 60) + (s / 3600);
        const pricePerHour = (loaiBan === 'LIBRE') ? 50000 : 60000;
        
        const rawBill = totalHours * pricePerHour;
        
        // --- SỬA Ở ĐÂY: LÀM TRÒN ĐẾN 100 VNĐ ---
        let billTimeAmount = 0;
        if (rawBill > 0) {
            // Chia 100 -> làm tròn lên -> nhân lại 100
            billTimeAmount = Math.ceil(rawBill / 100) * 100;
        }
        // ---------------------------------------

        // Tính tiền món
        const storedOrders = JSON.parse(localStorage.getItem('billiardOrders')) || {};
        const tableOrders = storedOrders[tableKey] || [];
        let serviceTotal = 0;
        
        // --- HIỂN THỊ LÊN BILL ---
        const setText = (id, val) => {
            const el = document.getElementById(id);
            if(el) el.textContent = val;
        };

        const elBillHeader = document.querySelector('#billContainer h3');
        if(elBillHeader) elBillHeader.textContent = `Hóa đơn ${nameHeader}`;

        setText('billLoai', loaiBan);
        setText('billGia', giaBan);
        setText('billStart', formatTime(finalStartDate));
        setText('billEnd', formatTime(endDate));
        setText('billTotalTime', finalTimeStr);

        const billListEl = document.getElementById('billListItems');
        if (billListEl) {
            billListEl.innerHTML = ''; 
            if (tableOrders.length > 0) {
                tableOrders.forEach(item => {
                    serviceTotal += item.totalPrice;
                    const p = document.createElement('p');
                    p.style.marginBottom = "4px"; 
                    p.innerHTML = `+ <b>${item.name}</b> (${item.quantity}) <span style="float:right">${item.totalPrice.toLocaleString()} đ</span>`;
                    billListEl.appendChild(p);
                });
            } else {
                billListEl.innerHTML = '<i>(Không có món nào)</i>';
            }
        }
        
        setText('billServiceTotal', serviceTotal.toLocaleString('vi-VN'));

        const finalTotal = billTimeAmount + serviceTotal;
        setText('billTotal', `${finalTotal.toLocaleString('vi-VN')} VNĐ`);

        // Xóa order
        if (storedOrders[tableKey]) {
            delete storedOrders[tableKey];
            localStorage.setItem('billiardOrders', JSON.stringify(storedOrders));
        }
    });

    // 👉 NÚT XÓA
    btnDelete.addEventListener('click', () => {
        if (confirm(`Bạn có chắc muốn xóa ${nameHeader}?`)) {
            clearTableState(tableKey);
            table.remove();
        }
    });
}

// ... (Giữ nguyên phần Logic Thêm Bàn và Booking bên dưới) ...
// ======================= LOGIC THÊM BÀN MỚI =======================
document.querySelectorAll('.add-box').forEach(addBtn => {
    addBtn.addEventListener('click', () => {
        const container = addBtn.parentElement;
        const isLibre = container.id === 'libreContainer';
        const type = isLibre ? 'LIBRE' : 'LỖ';
        const priceDisplay = isLibre ? '50.000 VNĐ / GIỜ' : '60.000 VNĐ / GIỜ';
        
        const existingTables = container.querySelectorAll('.table-box');
        let newIndex = 1;
        const nums = Array.from(existingTables)
            .map(t => {
                const h3 = t.querySelector('h3');
                return h3 ? parseInt(h3.textContent.match(/\d+/)[0]) : 0;
            })
            .filter(n => !isNaN(n));
        if (nums.length > 0) newIndex = Math.max(...nums) + 1;

        const newTable = document.createElement('div');
        newTable.className = "table-box trong";
        newTable.setAttribute('data-loai', type);
        newTable.setAttribute('data-gia', isLibre ? '50.000/h' : '60.000/h');
        
        newTable.innerHTML = `
        <div class="table-header">
            <h3>Bàn ${newIndex}</h3>
            <button class="btn-xoa">❌</button>
        </div>
        <p class="table-info">${priceDisplay}</p>
        <button class="btn btn-mo">Mở bàn</button>
        <button class="btn btn-tinh" style="display:none">Tính tiền</button>
        <div class="timer">00:00:00</div>
        `;
        container.insertBefore(newTable, addBtn);
        initTable(newTable);
    });
});
// (Booking Code giữ nguyên)
let bookings = [{ id: 1, tableType: 'Libre', tableNumber: 2, name: 'Nguyễn Văn A', phone: '0901 234 567', time: '19:30', note: '2 lơ xanh...', date: 'Hôm nay' }];
let nextBookingId = bookings.length + 1;
const bookingListContainer = document.querySelector('#booking-schedule .booking-list');
const modal = document.getElementById('bookingModal');
const closeBtn = document.querySelector('.close-button');
const addBookingItem = document.querySelector('.booking-item.add-new-booking');
const saveBookingBtn = document.getElementById('saveBookingBtn');
const bookingTimeInput = document.getElementById('modal-time');
const now = new Date();
if (bookingTimeInput) { bookingTimeInput.value = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`; }
function switchTab(targetId) {
    document.querySelectorAll('.tabs .tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
    const targetTab = document.querySelector(`.tabs .tab[data-target="${targetId}"]`);
    const targetContent = document.getElementById(targetId);
    if (targetTab) targetTab.classList.add('active');
    if (targetContent) targetContent.classList.add('active');
}
document.querySelectorAll('.tabs .tab').forEach(tab => {
    tab.addEventListener('click', function(e) {
        e.preventDefault();
        const targetId = this.getAttribute('data-target');
        switchTab(targetId);
    });
});
function openTableFromBooking(bookingId, tableType, tableNumber) {
    const containerId = tableType === 'Libre' ? 'libreContainer' : 'loContainer';
    const container = document.getElementById(containerId);
    const tableEl = Array.from(container.querySelectorAll('.table-box')).find(
        t => t.querySelector('h3').textContent === `Bàn ${tableNumber}` && t.getAttribute('data-loai') === tableType.toUpperCase()
    );
    if (tableEl) {
        const btnOpen = tableEl.querySelector('.btn-mo');
        if (btnOpen) btnOpen.click();
    } else {
        alert(`Không tìm thấy Bàn ${tableNumber} loại ${tableType}.`);
        return;
    }
    deleteBooking(bookingId, false);
    switchTab('table-list');
}
function createBookingHtml(booking) {
    const item = document.createElement('div');
    item.className = 'booking-item';
    item.setAttribute('data-booking-id', booking.id);
    const tableDisplay = booking.tableNumber ? `Bàn **${booking.tableType}** ${booking.tableNumber}` : `Bàn **${booking.tableType}** (Chưa gán)`;
    item.innerHTML = `
        <div class="booking-header">
            <span class="booking-table-name">${tableDisplay}</span>
            <span class="booking-status datcho">Đã Đặt</span>
        </div>
        <p>Tên Khách: **${booking.name}**</p>
        <p>SĐT: **${booking.phone}**</p>
        <p>Giờ đặt: **${booking.time}** (${booking.date})</p>
        <div class="booking-note">
            <p class="note-title">Lưu ý:</p>
            <span class="note-content">${booking.note || 'Không có'}</span>
        </div>
        <div class="booking-actions">
            <button class="btn btn-mo btn-small btn-open-booking">Mở bàn</button>
            <button class="btn btn-cancel btn-small btn-huy">Hủy</button>
        </div>
    `;
    item.querySelector('.btn-huy').addEventListener('click', () => { deleteBooking(booking.id, true); });
    item.querySelector('.btn-open-booking').addEventListener('click', () => { openTableFromBooking(booking.id, booking.tableType, booking.tableNumber); });
    return item;
}
function renderBookings() {
    if (!bookingListContainer) return;
    bookingListContainer.querySelectorAll('.booking-item:not(.add-new-booking)').forEach(el => el.remove());
    const addBtn = document.querySelector('.booking-item.add-new-booking');
    bookings.forEach(booking => {
        if (addBtn) { bookingListContainer.insertBefore(createBookingHtml(booking), addBtn); } 
        else { bookingListContainer.appendChild(createBookingHtml(booking)); }
    });
}
function deleteBooking(id, needConfirm = true) {
    let confirmDeletion = true;
    if (needConfirm) confirmDeletion = confirm(`Bạn có chắc muốn hủy lịch đặt ID ${id}?`);
    if (confirmDeletion) {
        const bookingIndex = bookings.findIndex(b => b.id === id);
        if (bookingIndex !== -1) {
            const booking = bookings[bookingIndex];
            const containerId = booking.tableType === 'Libre' ? 'libreContainer' : 'loContainer';
            const container = document.getElementById(containerId);
            const tableEl = Array.from(container.querySelectorAll('.table-box')).find(
                t => t.querySelector('h3').textContent === `Bàn ${booking.tableNumber}` && t.classList.contains('datcho')
            );
            if (tableEl) { tableEl.classList.remove('datcho'); tableEl.classList.add('trong'); }
            bookings.splice(bookingIndex, 1);
            renderBookings(); 
        }
    }
}
if (saveBookingBtn) {
    saveBookingBtn.addEventListener('click', () => {
        const name = document.getElementById('modal-name').value.trim();
        const phone = document.getElementById('modal-phone').value.trim();
        const time = document.getElementById('modal-time').value.trim();
        const tableType = document.getElementById('modal-table-type').value;
        const note = document.getElementById('modal-note').value.trim();
        if (!name || !phone || !time) { alert('Vui lòng nhập Tên, Số Điện Thoại và Giờ Đặt.'); return; }
        const containerId = tableType === 'Libre' ? 'libreContainer' : 'loContainer';
        const firstAvailableTable = document.getElementById(containerId).querySelector('.table-box.trong');
        let assignedTableNumber = null;
        if (firstAvailableTable) {
            const header = firstAvailableTable.querySelector('h3').textContent;
            assignedTableNumber = parseInt(header.match(/\d+/)[0]);
            firstAvailableTable.classList.remove('trong');
            firstAvailableTable.classList.add('datcho'); 
        } else { alert(`Hiện tại không còn bàn ${tableType} trống nào.`); }
        const newBooking = { id: nextBookingId++, tableType: tableType, tableNumber: assignedTableNumber, name: name, phone: phone, time: time, note: note, date: 'Hôm nay' };
        bookings.push(newBooking);
        renderBookings(); 
        modal.classList.add('hidden');
        document.getElementById('modal-name').value = '';
        document.getElementById('modal-phone').value = '';
        document.getElementById('modal-note').value = '';
    });
}
if (addBookingItem) { addBookingItem.addEventListener('click', () => { if (modal) modal.classList.remove('hidden'); }); }
if (closeBtn) { closeBtn.addEventListener('click', () => { if (modal) modal.classList.add('hidden'); }); }
if (modal) { window.addEventListener('click', (event) => { if (event.target == modal) modal.classList.add('hidden'); }); }
renderBookings();
