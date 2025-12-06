// Gắn sự kiện cho tất cả bàn có sẵn
document.querySelectorAll('.table-box').forEach(initTable);

// ======================= BIẾN VÀ DỮ LIỆU LỊCH ĐẶT =======================

// Mảng ảo để lưu trữ lịch đặt bàn
let bookings = [
    { id: 1, tableType: 'Libre', tableNumber: 2, name: 'Nguyễn Văn A', phone: '0901 234 567', time: '19:30', note: '2 lơ xanh, 2 cơ riêng, 1 khăn lạnh', date: 'Hôm nay' },
    { id: 2, tableType: 'Lỗ', tableNumber: 3, name: 'Trần Thị B', phone: '0987 654 321', time: '21:00', note: 'Đã bao gồm nước suối 3 chai', date: 'Ngày mai' }
];
let nextBookingId = bookings.length + 1;

// Khai báo các biến liên quan đến Modal
const bookingListContainer = document.querySelector('#booking-schedule .booking-list');
const modal = document.getElementById('bookingModal');
const closeBtn = document.querySelector('.close-button');
const addBookingItem = document.querySelector('.booking-item.add-new-booking');
const saveBookingBtn = document.getElementById('saveBookingBtn');
const bookingTimeInput = document.getElementById('modal-time');

// Cài đặt Giờ đặt mặc định là giờ hiện tại
const now = new Date();
if (bookingTimeInput) {
    bookingTimeInput.value = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
}


// ======================= CHỨC NĂNG CHUYỂN TAB =======================

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


// ======================= CHỨC NĂNG QUẢN LÝ LỊCH ĐẶT =======================

// Hàm tìm và đánh dấu bàn tương ứng là "ĐANG CHƠI"
function openTableFromBooking(bookingId, tableType, tableNumber) {
    // 1. Tìm bàn trong danh sách bàn
    const containerId = tableType === 'Libre' ? 'libreContainer' : 'loContainer';
    const container = document.getElementById(containerId);
    
    const tableEl = Array.from(container.querySelectorAll('.table-box')).find(
        t => t.querySelector('h3').textContent === `Bàn ${tableNumber}` && t.getAttribute('data-loai') === tableType.toUpperCase()
    );
    
    if (tableEl) {
        // 2. Kích hoạt nút "Mở bàn" của bàn đó
        const btnOpen = tableEl.querySelector('.btn-mo');
        if (btnOpen) {
            btnOpen.click();
        }
    } else {
        alert(`Không tìm thấy Bàn ${tableNumber} loại ${tableType} để mở. Bàn này có thể đã bị xóa.`);
        return;
    }

    // 3. Xóa lịch đặt khỏi danh sách (vì đã mở bàn)
    deleteBooking(bookingId, false);

    // 4. Chuyển sang tab Danh sách bàn
    switchTab('table-list');
}

// Hàm tạo HTML cho 1 lịch đặt
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
    
    // Gắn sự kiện Hủy lịch đặt
    item.querySelector('.btn-huy').addEventListener('click', () => {
        deleteBooking(booking.id, true); // true = cần confirm
    });
    
    // Gắn sự kiện Mở bàn và CHUYỂN TAB
    item.querySelector('.btn-open-booking').addEventListener('click', () => {
        openTableFromBooking(booking.id, booking.tableType, booking.tableNumber);
    });

    return item;
}

// Hàm render lại toàn bộ lịch đặt
function renderBookings() {
    if (!bookingListContainer) return;

    bookingListContainer.querySelectorAll('.booking-item:not(.add-new-booking)').forEach(el => el.remove());
    
    const addBtn = document.querySelector('.booking-item.add-new-booking');
    bookings.forEach(booking => {
        if (addBtn) {
            bookingListContainer.insertBefore(createBookingHtml(booking), addBtn);
        } else {
            bookingListContainer.appendChild(createBookingHtml(booking));
        }
    });
}

// Hàm XÓA (Hủy) lịch đặt
function deleteBooking(id, needConfirm = true) {
    let confirmDeletion = true;
    if (needConfirm) {
        confirmDeletion = confirm(`Bạn có chắc muốn hủy lịch đặt ID ${id}?`);
    }

    if (confirmDeletion) {
        // Tìm và xóa khỏi mảng dữ liệu
        const bookingIndex = bookings.findIndex(b => b.id === id);
        if (bookingIndex !== -1) {
            const booking = bookings[bookingIndex];
            
            // Tìm bàn đã gán để chuyển về trạng thái trống
            const containerId = booking.tableType === 'Libre' ? 'libreContainer' : 'loContainer';
            const container = document.getElementById(containerId);

            // Logic tìm bàn dựa trên số bàn và loại bàn
            const tableEl = Array.from(container.querySelectorAll('.table-box')).find(
                t => t.querySelector('h3').textContent === `Bàn ${booking.tableNumber}` && t.classList.contains('datcho')
            );
            
            if (tableEl) {
                 tableEl.classList.remove('datcho');
                 tableEl.classList.add('trong');
            }

            bookings.splice(bookingIndex, 1);
            renderBookings(); 
        }
    }
}

// Hàm LƯU lịch đặt mới (khi bấm nút trong modal)
if (saveBookingBtn) {
    saveBookingBtn.addEventListener('click', () => {
        const name = document.getElementById('modal-name').value.trim();
        const phone = document.getElementById('modal-phone').value.trim();
        const time = document.getElementById('modal-time').value.trim();
        const tableType = document.getElementById('modal-table-type').value;
        const note = document.getElementById('modal-note').value.trim();

        if (!name || !phone || !time) {
            alert('Vui lòng nhập Tên, Số Điện Thoại và Giờ Đặt.');
            return;
        }
        
        // Logic tìm bàn trống (tìm bàn trống đầu tiên)
        const containerId = tableType === 'Libre' ? 'libreContainer' : 'loContainer';
        const firstAvailableTable = document.getElementById(containerId).querySelector('.table-box.trong');
        
        let assignedTableNumber = null;
        if (firstAvailableTable) {
            const header = firstAvailableTable.querySelector('h3').textContent;
            assignedTableNumber = parseInt(header.match(/\d+/)[0]);
            // Đánh dấu bàn là Đã đặt (datcho)
            firstAvailableTable.classList.remove('trong');
            firstAvailableTable.classList.add('datcho'); 
        } else {
             alert(`Hiện tại không còn bàn ${tableType} trống nào. Vẫn tạo lịch đặt, nhưng bàn sẽ chưa được gán.`);
        }

        const newBooking = {
            id: nextBookingId++,
            tableType: tableType,
            tableNumber: assignedTableNumber, 
            name: name,
            phone: phone,
            time: time,
            note: note,
            date: 'Hôm nay' 
        };

        bookings.push(newBooking);
        
        // Cập nhật giao diện
        renderBookings(); 
        
        // Đóng modal và reset form
        modal.classList.add('hidden');
        document.getElementById('modal-name').value = '';
        document.getElementById('modal-phone').value = '';
        document.getElementById('modal-note').value = '';
    });
}

// Gắn sự kiện cho nút THÊM LỊCH ĐẶT MỚI (Hiện Modal)
if (addBookingItem) {
    addBookingItem.addEventListener('click', () => {
        if (modal) {
            modal.classList.remove('hidden');
        }
    });
}

// Gắn sự kiện ĐÓNG MODAL
if (closeBtn) {
    closeBtn.addEventListener('click', () => {
        if (modal) modal.classList.add('hidden');
    });
}
if (modal) {
    window.addEventListener('click', (event) => {
        if (event.target == modal) {
            modal.classList.add('hidden');
        }
    });
}

// Khởi tạo lần đầu
renderBookings();


// ======================= CHỨC NĂNG QUẢN LÝ BÀN (Giữ nguyên) =======================
function initTable(table) {
  const btnOpen = table.querySelector('.btn-mo');
  const btnCalc = table.querySelector('.btn-tinh');
  const btnDelete = table.querySelector('.btn-xoa');
  const timer = table.querySelector('.timer');

  const loaiBan = table.getAttribute('data-loai');
  const giaBan = table.getAttribute('data-gia');
  
  let startTime = null;
  let interval = null;
  let startDate = null;

  // 👉 Mở bàn
  btnOpen.addEventListener('click', () => {
    if (interval) return; 

    startDate = new Date();
    startTime = Date.now();
    
    table.classList.remove('trong');
    table.classList.remove('datcho');
    table.classList.add('dangchoi');

    interval = setInterval(() => {
      const elapsed = Date.now() - startTime;

      const h = Math.floor(elapsed / 3600000);
      const m = Math.floor((elapsed % 3600000) / 60000);
      const s = Math.floor((elapsed % 60000) / 1000);

      timer.textContent = 
        `${h.toString().padStart(2, '0')}:` +
        `${m.toString().padStart(2, '0')}:` +
        `${s.toString().padStart(2, '0')}`;
    }, 1000);
  });

  // 👉 Tính tiền
  btnCalc.addEventListener('click', () => {
    if (!interval) return;

    clearInterval(interval);
    interval = null;
    
    table.classList.remove('dangchoi');
    table.classList.add('trong');

    const totalTimeStr = timer.textContent;
    const name = table.querySelector('h3').textContent;
    const endDate = new Date();
    
    const formatTime = (date) => {
        return date.toTimeString().split(' ')[0].substring(0, 5);
    }
    
    document.querySelector('#billContainer h3').textContent = `Hóa đơn ${name}`;
    document.getElementById('billLoai').textContent = loaiBan;
    document.getElementById('billGia').textContent = giaBan;
    document.getElementById('billStart').textContent = startDate ? formatTime(startDate) : '---';
    document.getElementById('billEnd').textContent = formatTime(endDate);
    document.getElementById('billTotalTime').textContent = totalTimeStr;
    
    const [h, m, s] = totalTimeStr.split(':').map(Number);
    const totalHours = h + m / 60 + s / 3600;
    const pricePerHour = loaiBan === 'LIBRE' ? 50000 : 60000;
    const totalBill = Math.ceil(totalHours) * pricePerHour;
    
    document.getElementById('billTotal').textContent = `${totalBill.toLocaleString('vi-VN')} VNĐ`;

    document.getElementById('billMon1').textContent = 'Nước ngọt (2) - 30.000 VNĐ';
    document.getElementById('billMon2').textContent = 'Khăn lạnh (3) - 15.000 VNĐ';

    timer.textContent = "00:00:00";
    startDate = null;
  });

  // 👉 Xóa bàn
  btnDelete.addEventListener('click', () => {
    const name = table.querySelector('h3').textContent;
    if (confirm(`Bạn có chắc muốn xóa ${name}?`)) {
      table.remove();
    }
  });
}

// Logic thêm bàn mới (Giữ nguyên)
document.querySelectorAll('.add-box').forEach(addBtn => {
    addBtn.addEventListener('click', () => {
        const container = addBtn.parentElement;
        const isLibre = container.id === 'libreContainer';
        const type = isLibre ? 'LIBRE' : 'LỖ';
        const price = isLibre ? '50.000/h' : '60.000/h';
        const priceDisplay = isLibre ? '50.000 VNĐ / GIỜ' : '60.000 VNĐ / GIỜ';
        
        const existingTables = container.querySelectorAll('.table-box');
        let newIndex = 1;
        if (existingTables.length > 0) {
            const tableNumbers = Array.from(existingTables).map(t => {
                const header = t.querySelector('h3').textContent;
                return parseInt(header.match(/\d+/)[0]);
            }).filter(n => !isNaN(n));
            
            if (tableNumbers.length > 0) {
                newIndex = Math.max(...tableNumbers) + 1;
            }
        }
  
  
        const newTable = document.createElement('div');
        newTable.className = "table-box trong";
        newTable.setAttribute('data-loai', type);
        newTable.setAttribute('data-gia', price);
        
        newTable.innerHTML = `
        <div class="table-header">
            <h3>Bàn ${newIndex}</h3>
            <button class="btn-xoa">❌</button>
        </div>
        <p class="table-info">${priceDisplay}</p>
        <button class="btn btn-mo">Mở bàn</button>
        <div class="timer">00:00:00</div>
        <button class="btn btn-tinh">Tính tiền</button>
        `;
  
        container.insertBefore(newTable, addBtn);
        initTable(newTable);
    });
});