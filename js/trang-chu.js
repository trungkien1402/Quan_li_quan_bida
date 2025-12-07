// ===============================
// BẬT / TẮT CHẾ ĐỘ CHỈNH SỬA
// ===============================
function toggleEdit(tableId, btn) {
    const table = document.getElementById(tableId);
    const isEditing = table.classList.toggle("editing");

    btn.textContent = isEditing ? "Lưu" : "Cập Nhật";

    if (isEditing) {
        makeEditable(table);
    } else {
        saveTable(tableId);
        removeEditable(table);
    }
}

// Tạo input để chỉnh sửa
function makeEditable(table) {
    for (let i = 1; i < table.rows.length; i++) {
        for (let j = 0; j < table.rows[i].cells.length - 1; j++) {
            const td = table.rows[i].cells[j];
            const value = td.textContent.trim();
            td.innerHTML = `<input class="cell-edit" value="${value}">`;
        }
    }
}

// Chuyển input → text sau khi lưu
function removeEditable(table) {
    for (let i = 1; i < table.rows.length; i++) {
        for (let j = 0; j < table.rows[i].cells.length - 1; j++) {
            const td = table.rows[i].cells[j];
            const inp = td.querySelector("input");
            if (inp) td.textContent = inp.value;
        }
    }
}

// ===============================
// LƯU DỮ LIỆU BẢNG VÀO LOCALSTORAGE
// ===============================
function saveTable(tableId) {
    const table = document.getElementById(tableId);

    const rows = [...table.rows].slice(1).map(r => {
        return {
            name: r.cells[0].innerText,
            qty: r.cells[1].innerText,
            unit: r.cells[2].innerText
        };
    });

    localStorage.setItem(tableId, JSON.stringify(rows));
}

// ===============================
// LOAD BẢNG TỪ LOCALSTORAGE
// ===============================
function loadTable(tableId) {
    const data = JSON.parse(localStorage.getItem(tableId));
    if (!data) return;

    const table = document.getElementById(tableId);
    table.innerHTML = `
        <tr>
            <th>Tên Sản Phẩm</th>
            <th>Số Lượng</th>
            <th>Đơn Vị</th>
            <th>Xóa</th>
        </tr>
    `;

    data.forEach(item => {
        const row = table.insertRow();
        row.innerHTML = `
            <td>${item.name}</td>
            <td>${item.qty}</td>
            <td>${item.unit}</td>
            <td><button class="btn-delete" onclick="deleteRow('${tableId}', this)">X</button></td>
        `;
    });
}

// ===============================
// THÊM DÒNG MỚI
// ===============================
function addRow(tableId) {
    const name = document.getElementById('inputName').value.trim();
    const qty = document.getElementById('orderQuantity').value.trim();
    const unit = document.getElementById('inputPrice').value.trim();

    if (!name || !qty || !unit) {
        alert("Vui lòng nhập đủ thông tin!");
        return;
    }

    const table = document.getElementById(tableId);

    const row = table.insertRow(-1);

    row.innerHTML = `
        <td>${name}</td>
        <td>${qty}</td>
        <td>${unit}</td>
        <td><button class="btn-delete" onclick="deleteRow('${tableId}', this)">X</button></td>
    `;

    // Reset input
    document.getElementById('inputName').value = '';
    document.getElementById('orderQuantity').value = '';
    document.getElementById('inputPrice').value = '';

    saveTable(tableId);
}

// ===============================
// XÓA 1 DÒNG
// ===============================
function deleteRow(tableId, btn) {
    const row = btn.parentElement.parentElement;
    row.remove();
    saveTable(tableId);
}

// ===============================
// LOAD 2 BẢNG (KHO + FASTFOOD)
// ===============================
window.onload = () => {
    loadTable("table-kho");
    loadTable("table-fastfood");
};

// ===============================
// LOAD TOP FOOD & DRINK
// ===============================
function loadTop() {

    // LẤY ĐÚNG KEY MENU CỦA BẠN
    const data = JSON.parse(localStorage.getItem("myMenuData")) || [];

    const topFoodTable = document.getElementById("table-monan");
    const topDrinkTable = document.getElementById("table-nuoc");

    // Xóa toàn bộ dòng cũ
    topFoodTable.querySelectorAll("tr:not(:first-child)").forEach(tr => tr.remove());
    topDrinkTable.querySelectorAll("tr:not(:first-child)").forEach(tr => tr.remove());

    // Sắp xếp giảm dần theo số bán (sold)
    const sorted = [...data].sort((a, b) => (b.sold || 0) - (a.sold || 0));

    // Render từng món
    sorted.forEach(item => {
        const row = document.createElement("tr");
        row.innerHTML = `
            <td>${item.name}</td>
            <td>${item.sold || 0}</td>
        `;

        if (item.category === "drink") {
            topDrinkTable.appendChild(row);
        }
        else if (item.category === "food") {
            topFoodTable.appendChild(row);
        }
    });
}

document.addEventListener("DOMContentLoaded", loadTop);

