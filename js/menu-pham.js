// 1. KHỞI TẠO: Thử lấy dữ liệu từ bộ nhớ trình duyệt, nếu không có thì dùng mảng rỗng
let menuData = JSON.parse(localStorage.getItem('myMenuData')) || [];

let currentTab = 'food'; 
let selectedItemForOrder = null;

// Chuyển Tab
function switchTab(tab) {
    currentTab = tab;
    
    // Cập nhật UI nút tab
    const btns = document.querySelectorAll('.tab-btn');
    if (tab === 'food') {
        btns[0].classList.add('active');
        btns[1].classList.remove('active');
    } else {
        btns[0].classList.remove('active');
        btns[1].classList.add('active');
    }
    
    renderMenu();
}

// Render danh sách món
function renderMenu() {
    const container = document.getElementById('menuContainer');
    container.innerHTML = '';

    const itemsToShow = menuData.filter(item => item.category === currentTab);

    if (itemsToShow.length === 0) {
        container.innerHTML = '<div class="empty-msg">Danh sách đang trống. Vui lòng thêm món mới!</div>';
        return;
    }

    itemsToShow.forEach(item => {
        // Kiểm tra ảnh, nếu người dùng không nhập thì dùng ảnh mặc định
        const imgSrc = (item.image && item.image.trim() !== "") ? item.image : 'https://via.placeholder.com/300x200?text=No+Image';

        const card = document.createElement('div');
        card.className = 'card';
        card.innerHTML = `
            <img src="${imgSrc}" alt="${item.name}" class="card-img" onerror="this.src='https://via.placeholder.com/300x200?text=Error'">
            <div class="card-body">
                <div>
                    <div class="card-title">${item.name}</div>
                    <div class="card-price">${parseInt(item.price).toLocaleString()} VNĐ</div>
                </div>
                <div class="card-actions" style="display:flex; gap:5px; margin-top:5px;">
                     <button class="btn-order" onclick="openOrderModal('${item.id}', '${item.name}')" style="flex:1">Đặt Món</button>
                     <button class="btn-delete" onclick="deleteMenuItem('${item.id}')" style="background:#dc3545; color:white; border:none; border-radius:4px; cursor:pointer; padding:5px 10px;">Xóa</button>
                </div>
            </div>
        `;
        container.appendChild(card);
    });
}

// --- THÊM MÓN (Cập nhật lưu vào localStorage) ---
function openAddModal() {
    document.getElementById('addModal').style.display = 'flex';
}

function addItem() {
    const name = document.getElementById('inputName').value;
    const price = document.getElementById('inputPrice').value;
    const image = document.getElementById('inputImage').value;
    const category = document.getElementById('inputCategory').value;

    if (!name || !price) {
        alert("Vui lòng nhập tên món và giá!");
        return;
    }

    const newItem = {
        id: Date.now().toString(),
        name: name,
        price: price,
        image: image,
        category: category
    };

    menuData.push(newItem);

    // QUAN TRỌNG: Lưu danh sách mới vào localStorage
    localStorage.setItem('myMenuData', JSON.stringify(menuData));
    
    // Reset inputs
    document.getElementById('inputName').value = '';
    document.getElementById('inputPrice').value = '';
    document.getElementById('inputImage').value = '';
    document.getElementById('orderQuantity').value = '';

    closeModal('addModal');
    
    // Chuyển sang tab chứa món vừa thêm để hiển thị ngay
    if(category !== currentTab) {
        switchTab(category);
    } else {
        renderMenu();
    }
    
    showToast(`Đã thêm mới món: ${name}`);
}

// --- XÓA MÓN ĂN (Tính năng bổ sung cần thiết) ---
function deleteMenuItem(id) {
    if(confirm("Bạn có chắc muốn xóa món này khỏi thực đơn không?")) {
        // Lọc bỏ món có id tương ứng
        menuData = menuData.filter(item => item.id !== id);
        
        // Cập nhật lại bộ nhớ
        localStorage.setItem('myMenuData', JSON.stringify(menuData));
        
        // Vẽ lại giao diện
        renderMenu();
        showToast("Đã xóa món ăn!");
    }
}

// --- ORDER (Giữ nguyên logic đã sửa ở bước trước) ---
function openOrderModal(id, name) {
    selectedItemForOrder = menuData.find(i => i.id === id) || { id, name, price: 0 }; 
    document.getElementById('orderItemName').innerText = `Đang chọn: ${name}`;
    document.getElementById('orderModal').style.display = 'flex';
    document.getElementById('orderQuantity').focus();
}

function confirmOrder() {
    const tableType = document.getElementById('orderTableType').value; 
    const tableNum = document.getElementById('orderTable').value;
    const quantity = parseInt(document.getElementById('orderQuantity').value);

    if (!tableNum || !quantity) {
        alert("Vui lòng nhập số bàn và số lượng!");
        return;
    }

    const tableKey = `${tableType}_${tableNum}`;

    const newItem = {
        name: selectedItemForOrder.name,
        price: parseInt(selectedItemForOrder.price),
        quantity: quantity,
        totalPrice: parseInt(selectedItemForOrder.price) * quantity
    };

    let currentOrders = JSON.parse(localStorage.getItem('billiardOrders')) || {};

    if (!currentOrders[tableKey]) {
        currentOrders[tableKey] = [];
    }
    currentOrders[tableKey].push(newItem);

    localStorage.setItem('billiardOrders', JSON.stringify(currentOrders));

    const msg = `Đã thêm ${quantity} suất [${selectedItemForOrder.name}]<br>vào Bàn ${tableNum} (${tableType})`;
    
    closeModal('orderModal');
    
    document.getElementById('orderTable').value = ''; 
    document.getElementById('orderQuantity').value = '1'; 
    
    showToast(msg);
}

// --- TIỆN ÍCH ---
function closeModal(modalId) {
    document.getElementById(modalId).style.display = 'none';
}

window.onclick = function(event) {
    if (event.target.classList.contains('modal')) {
        event.target.style.display = "none";
    }
}

function showToast(message) {
    const toast = document.getElementById("toast");
    const toastMsg = document.getElementById("toast-message");
    
    toastMsg.innerHTML = message; 
    toast.className = "show";
    
    setTimeout(function(){ 
        toast.className = toast.className.replace("show", ""); 
    }, 2500);
}

// Chạy lần đầu
renderMenu();