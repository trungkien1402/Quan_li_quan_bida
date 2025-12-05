// Dữ liệu mẫu (có thể để trống [])
let menuData = [];

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
        const imgSrc = item.image ? item.image : 'https://via.placeholder.com/300x200?text=No+Image';

        const card = document.createElement('div');
        card.className = 'card';
        card.innerHTML = `
            <img src="${imgSrc}" alt="${item.name}" class="card-img" onerror="this.src='https://via.placeholder.com/300x200?text=Error'">
            <div class="card-body">
                <div>
                    <div class="card-title">${item.name}</div>
                    <div class="card-price">${parseInt(item.price).toLocaleString()} VNĐ</div>
                </div>
                <button class="btn-order" onclick="openOrderModal('${item.id}', '${item.name}')">Đặt Món</button>
            </div>
        `;
        container.appendChild(card);
    });
}

// --- THÊM MÓN ---
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
    
    // Reset inputs
    document.getElementById('inputName').value = '';
    document.getElementById('inputPrice').value = '';
    document.getElementById('inputImage').value = '';
    
    closeModal('addModal');
    
    // Chuyển sang tab chứa món vừa thêm để hiển thị ngay
    if(category !== currentTab) {
        switchTab(category);
    } else {
        renderMenu();
    }
    
    showToast(`Đã thêm mới món: ${name}`);
}

// --- ORDER ---
function openOrderModal(id, name) {
    selectedItemForOrder = { id, name };
    document.getElementById('orderItemName').innerText = `Đang chọn: ${name}`;
    document.getElementById('orderModal').style.display = 'flex';
    document.getElementById('orderQuantity').focus();
}

function confirmOrder() {
    const tableNum = document.getElementById('orderTable').value;
    const quantity = document.getElementById('orderQuantity').value;

    if (!tableNum || !quantity) {
        alert("Vui lòng nhập số bàn và số lượng!");
        return;
    }

    // Câu thông báo
    const msg = `Đã thêm ${quantity} suất [${selectedItemForOrder.name}]<br>vào bàn số ${tableNum}`;
    
    closeModal('orderModal');
    
    // Reset inputs
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
    
    toastMsg.innerHTML = message; // Dùng innerHTML để hỗ trợ thẻ <br> xuống dòng
    toast.className = "show";
    
    // Ẩn sau 2.5 giây
    setTimeout(function(){ 
        toast.className = toast.className.replace("show", ""); 
    }, 2500);
}

// Chạy lần đầu
renderMenu();