// =========================================================
const canvas = document.getElementById("chart");
const ctx = canvas.getContext("2d");

ctx.strokeStyle = "#00ffd0";
ctx.lineWidth = 3;

ctx.beginPath();
ctx.moveTo(20, 120);
ctx.lineTo(80, 80);
ctx.lineTo(140, 100);
ctx.lineTo(200, 60);
ctx.lineTo(260, 90);
ctx.stroke();
// =========================================================
// --- 1. Dữ liệu Tự động Khởi tạo cho 150 Bàn ---

/**
 * Hàm tạo dữ liệu giả lập cho N bàn thuộc một loại cụ thể.
 * @param {string} type - Loại bàn (pool, snooker, libre).
 * @param {string} prefix - Tiền tố ID (P, S, L).
 * @param {number} count - Số lượng bàn cần tạo (50).
 * @returns {Array} Mảng các đối tượng bàn chơi.
 */
function createDummyTables(type, prefix, count) {
    const tables = [];
    for (let i = 1; i <= count; i++) {
        // Tạo ID bàn (ví dụ: P01, P50)
        const id = `${prefix}${String(i).padStart(2, '0')}`;
        
        // Giả lập trạng thái: khoảng 1/3 bàn đang chơi, còn lại trống
        const isOccupied = i % 3 === 0; 
        const status = isOccupied ? 'occupied' : 'available';
        
        // Tạo thời gian ngẫu nhiên nếu đang chơi
        const time = isOccupied 
            ? `${String(Math.floor(Math.random() * 2)).padStart(2, '0')}:${String(Math.floor(Math.random() * 60)).padStart(2, '0')}:${String(Math.floor(Math.random() * 60)).padStart(2, '0')}` 
            : '00:00:00';
            
        // Tạo tên hiển thị trong dropdown
        const name = `${type.charAt(0).toUpperCase()}${type.slice(1)} ${i} (${status === 'occupied' ? 'Đang chơi' : 'Trống'})`;

        tables.push({ id, name, time, status });
    }
    return tables;
}

// Tạo dữ liệu cho 50 bàn mỗi loại và gán vào tableData
const tableData = {
    pool: createDummyTables('Pool', 'P', 50),
    snooker: createDummyTables('Snooker', 'S', 50),
    libre: createDummyTables('Libre', 'L', 50)
};

// -----------------------------------------------------------

/**
 * 2. Hàm Điền dữ liệu vào thẻ Select (Dropdown)
 * @param {string} type - Loại bàn (pool, snooker, libre)
 */
function fillTableSelect(type) {
    const selectElement = document.getElementById(`select-${type}`);
    // Đảm bảo phần tử tồn tại trước khi thao tác
    if (!selectElement) return; 
    
    const data = tableData[type];

    // Thêm tùy chọn mặc định và hiển thị tổng số bàn
    selectElement.innerHTML = `<option value="">--- Chọn Bàn ${type.toUpperCase()} (${data.length} bàn) ---</option>`;

    // Lặp qua mảng 50 bàn và tạo các thẻ <option>
    data.forEach(table => {
        const option = document.createElement('option');
        option.value = table.id;
        option.textContent = table.name;
        option.dataset.status = table.status; 
        selectElement.appendChild(option);
    });

    // Gán sự kiện lắng nghe 'change' cho thẻ select
    selectElement.addEventListener('change', () => {
        updateTableTime(type);
    });
}

/**
 * 3. Hàm Cập nhật thông tin thời gian chơi khi chọn bàn
 * @param {string} type - Loại bàn (pool, snooker, libre)
 */
function updateTableTime(type) {
    const selectElement = document.getElementById(`select-${type}`);
    const displayElement = document.getElementById(`time-${type}`);
    
    if (!selectElement || !displayElement) return;

    const selectedTableId = selectElement.value;

    // Xử lý khi chọn tùy chọn mặc định (Không chọn bàn nào)
    if (!selectedTableId) {
        displayElement.innerHTML = 'Chọn bàn để xem giờ chơi hiện tại...';
        displayElement.className = 'result-display-card'; 
        return;
    }

    // Tìm dữ liệu của bàn đã chọn trong mảng 50 bàn
    const selectedTable = tableData[type].find(table => table.id === selectedTableId);

    if (selectedTable) {
        // Cập nhật nội dung hiển thị thời gian/trạng thái
        displayElement.innerHTML = `
            <p>Bàn: <b>${selectedTable.id}</b></p>
            <p>Trạng thái: <span class="status-${selectedTable.status}">
                ${selectedTable.status === 'occupied' ? 'ĐANG CHƠI' : 'TRỐNG'}
            </span></p>
            <p>Thời gian: <b>${selectedTable.time}</b></p>
        `;
        
        // Cập nhật class để thay đổi màu sắc hiển thị (cần CSS)
        displayElement.className = `result-display-card status-${selectedTable.status}`;
    }
}

// 4. Khởi tạo chức năng khi trang được tải (DOMContentLoaded)
document.addEventListener('DOMContentLoaded', () => {
    fillTableSelect('pool');
    fillTableSelect('snooker');
    fillTableSelect('libre');
});

// =========================================================
// === CÁC HÀM VÀ DỮ LIỆU CHUNG (GIỮ NGUYÊN) ===
// =========================================================

const MENU_DATA_KEY = 'editableMenuStats';

// Dữ liệu mẫu ban đầu (Giữ nguyên)
const defaultMenuData = {
    food: [
        { name: "Bò Khô Lắc", quantity: 125, price: 20000 }, 
        { name: "Mỳ Tôm Trứng", quantity: 160, price: 12000 },
        { name: "Bánh Mì Kẹp", quantity: 145, price: 10000 },
        { name: "Snack Khoai Tây", quantity: 90, price: 10000 },
        { name: "Hạt Hướng Dương", quantity: 180, price: 4000 },
        { name: "Trái Cây Thập Cẩm", quantity: 60, price: 10000 },
        { name: "Khô Mực", quantity: 45, price: 12000 },
        { name: "Phở Gà", quantity: 30, price: 15000 },
        { name: "Bia Gạo", quantity: 20, price: 15000 },
        { name: "Chả Giò", quantity: 15, price: 15000 }
    ],
    drink: [
        { name: "Cà Phê Sữa Đá", quantity: 210, price: 20000 },
        { name: "Bia Tiger Lạnh", quantity: 350, price: 15000 },
        { name: "Trà Chanh", quantity: 400, price: 7000 },
        { name: "Nước Suối Lavie", quantity: 510, price: 5000 },
        { name: "Nước Ngọt Coca", quantity: 280, price: 8000 },
        { name: "Nước Ép Cam", quantity: 150, price: 12000 },
        { name: "Bia Sài Gòn", quantity: 180, price: 9000 },
        { name: "Sữa Chua Đá", quantity: 90, price: 15000 },
        { name: "Rượu Soju", quantity: 20, price: 60000 },
        { name: "Trà Đào", quantity: 80, price: 12000 }
    ]
};

function formatCurrency(amount) {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(amount);
}

function loadMenuData() {
    const savedData = localStorage.getItem(MENU_DATA_KEY);
    return savedData ? JSON.parse(savedData) : defaultMenuData;
}


// =========================================================
// === HÀM XỬ LÝ CHÍNH: RENDER, THÊM, XÓA, LƯU ===
// =========================================================

// Hàm tạo một hàng dữ liệu mới (td)
function createDataRow(tbody, item, index) {
    // Tính toán Tổng
    const currentPrice = parseInt(item.price) || 0;
    const currentQuantity = parseInt(item.quantity) || 0;
    const totalRevenue = currentPrice * currentQuantity;
    
    // Tìm hàng tổng để chèn hàng mới trước nó
    const totalRow = tbody.querySelector('.total-row');
    const row = tbody.insertRow(totalRow ? totalRow.rowIndex - 1 : -1); 
    row.dataset.index = index; 

    // Cột STT (Không chỉnh sửa)
    row.insertCell().textContent = index + 1;
    
    // Cột Tên Món (Có thể chỉnh sửa)
    const nameCell = row.insertCell();
    nameCell.textContent = item.name;
    nameCell.contentEditable = "true";
    
    // Cột Số Lượng (Có thể chỉnh sửa)
    const qtyCell = row.insertCell();
    qtyCell.textContent = currentQuantity.toLocaleString('vi-VN');
    qtyCell.contentEditable = "true";
    
    // CỘT GIÁ (Có thể chỉnh sửa)
    const priceCell = row.insertCell();
    priceCell.textContent = formatCurrency(currentPrice).replace(' ₫', '').trim(); 
    priceCell.contentEditable = "true";
    
    // CỘT TỔNG (Được tính toán)
    const totalCell = row.insertCell();
    totalCell.textContent = formatCurrency(totalRevenue).replace(' ₫', '').trim();
    totalCell.style.color = '#4CAF50'; 
    totalCell.classList.add('calculated-total'); // Thêm class để dễ dàng định dạng

    // CỘT NÚT XÓA (MỚI)
    const deleteCell = row.insertCell();
    deleteCell.innerHTML = `<button class="delete-button">Xóa</button>`;
    deleteCell.querySelector('.delete-button').addEventListener('click', deleteRow);

    return { totalRevenue: totalRevenue, totalQuantity: currentQuantity };
}

// Hàm render toàn bộ bảng
function renderEditableTable(tbodyId, data) {
    const tbody = document.getElementById(tbodyId);
    if (!tbody) return;
    
    tbody.innerHTML = ''; 
    
    let totalQuantity = 0;
    let grandTotalRevenue = 0;

    data.forEach((item, index) => {
        const { totalRevenue, totalQuantity: itemQty } = createDataRow(tbody, item, index);
        grandTotalRevenue += totalRevenue;
        totalQuantity += itemQty;
    });

    // === CHÈN HÀNG TỔNG (TOTAL ROW) ===
    const totalRow = tbody.insertRow();
    totalRow.classList.add('total-row'); 
    
    const headerCell = totalRow.insertCell();
    headerCell.colSpan = 2; 
    headerCell.textContent = "TỔNG CỘNG:";
    
    const totalQtyCell = totalRow.insertCell();
    totalQtyCell.textContent = totalQuantity.toLocaleString('vi-VN'); 
    totalQtyCell.classList.add('total-figure');
    
    totalRow.insertCell().textContent = ""; // Cột Giá (Trống)
    
    const totalRevCell = totalRow.insertCell();
    totalRevCell.textContent = formatCurrency(grandTotalRevenue).replace(' ₫', '').trim();
    totalRevCell.classList.add('total-figure');
    totalRevCell.style.color = '#00FFFF'; 

    totalRow.insertCell().textContent = ""; // Cột Xóa (Trống)
}

// Hàm XÓA HÀNG
function deleteRow(event) {
    if (!confirm("Bạn có chắc chắn muốn xóa món hàng này?")) return;
    
    const row = event.target.closest('tr');
    const tbody = row.closest('tbody');
    
    // Xóa hàng khỏi DOM
    row.remove();
    
    // Bắt buộc phải lưu lại dữ liệu sau khi xóa để cập nhật STT và tổng
    saveEditedMenuData(tbody.id);
}

// Hàm THÊM HÀNG MỚI
function addRow(tbodyId) {
    // 1. Lấy dữ liệu hiện tại từ Local Storage hoặc Default
    const data = loadMenuData();
    const isFood = tbodyId === 'food-tbody';
    const currentList = isFood ? data.food : data.drink;

    // 2. Định nghĩa mục mới
    const newItem = {
        name: isFood ? "Món Ăn Mới" : "Đồ Uống Mới",
        quantity: 0,
        price: 0
    };

    // 3. Thêm mục mới vào danh sách và lưu lại
    currentList.push(newItem);
    localStorage.setItem(MENU_DATA_KEY, JSON.stringify(data));

    // 4. Render lại toàn bộ bảng để cập nhật STT và Tổng
    initializeMenuEditing(); 
}

// Hàm đọc dữ liệu từ bảng HTML và lưu vào Local Storage
function saveEditedMenuData() {
    const newData = { food: [], drink: [] };
    const cleanAndParse = (text) => parseInt(text.replace(/\./g, '').trim()) || 0;

    // Lấy dữ liệu từ bảng Đồ Ăn (Bỏ qua hàng tổng .total-row)
    document.querySelectorAll('#food-tbody tr:not(.total-row)').forEach(row => {
        const cells = row.querySelectorAll('td');
        if (cells.length > 4) { 
            newData.food.push({
                name: cells[1].textContent.trim(),
                quantity: cleanAndParse(cells[2].textContent), 
                price: cleanAndParse(cells[3].textContent)    
            });
        }
    });

    // Lấy dữ liệu từ bảng Đồ Uống
    document.querySelectorAll('#drink-tbody tr:not(.total-row)').forEach(row => {
        const cells = row.querySelectorAll('td');
        if (cells.length > 4) {
            newData.drink.push({
                name: cells[1].textContent.trim(),
                quantity: cleanAndParse(cells[2].textContent),
                price: cleanAndParse(cells[3].textContent)
            });
        }
    });

    localStorage.setItem(MENU_DATA_KEY, JSON.stringify(newData));
    
    // Thông báo và Render lại để tính toán lại tổng
    initializeMenuEditing();
    // alert('✅ Dữ liệu menu đã được lưu và cập nhật.'); // Có thể bỏ qua alert này nếu muốn giao diện mượt mà hơn
}


// Khởi tạo trang và gắn sự kiện
function initializeMenuEditing() {
    const data = loadMenuData();
    renderEditableTable('food-tbody', data.food);
    renderEditableTable('drink-tbody', data.drink);
}

document.addEventListener('DOMContentLoaded', () => {
    initializeMenuEditing();
    
    // Gắn sự kiện cho nút Lưu (Vẫn là hàm chính để cập nhật)
    document.getElementById('save-menu-data').addEventListener('click', saveEditedMenuData);

    // Gắn sự kiện cho nút THÊM HÀNG
    document.getElementById('add-food-row').addEventListener('click', () => addRow('food-tbody'));
    document.getElementById('add-drink-row').addEventListener('click', () => addRow('drink-tbody'));
    
    // Gắn sự kiện cho các ô chỉnh sửa để khi có bất kỳ thay đổi nào, nó sẽ tự động lưu lại (để cập nhật lại tổng)
    document.querySelectorAll('#food-table, #drink-table').forEach(table => {
        table.addEventListener('blur', (event) => {
            // Nếu người dùng vừa chỉnh sửa một ô có thể chỉnh sửa
            if (event.target.contentEditable === 'true') {
                // Tự động gọi hàm lưu khi người dùng thoát khỏi ô chỉnh sửa
                saveEditedMenuData(); 
            }
        }, true); // Sử dụng event capturing
    });
});