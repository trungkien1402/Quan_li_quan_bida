// Bật / tắt chế độ chỉnh sửa
function toggleEdit(tableId, btn) {
    const table = document.getElementById(tableId);
    const isEditing = btn.classList.contains("save");

    if (!isEditing) {
        btn.classList.add("save");
        btn.textContent = "Lưu";

        [...table.querySelectorAll("td:not(:last-child)")].forEach(td => {
            td.setAttribute("contenteditable", "true");
        });

    } else {
        btn.classList.remove("save");
        btn.textContent = "Cập Nhật";

        [...table.querySelectorAll("td")].forEach(td => {
            td.removeAttribute("contenteditable");
        });

        saveTable(tableId);
    }
}


// Lưu dữ liệu bảng vào localStorage
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


// Tải dữ liệu khi reload
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
            <td><button class="btn-delete" onclick="deleteRow(this)">X</button></td>
        `;
    });
}


// Thêm dòng mới
function addRow(tableId) {
    const table = document.getElementById(tableId);
    const row = table.insertRow(-1);

    row.innerHTML = `
        <td contenteditable="true">Tên</td>
        <td contenteditable="true">0</td>
        <td contenteditable="true">Đơn Vị</td>
        <td><button class="btn-delete" onclick="deleteRow(this)">X</button></td>
    `;
}


// Xóa 1 dòng
function deleteRow(btn) {
    const row = btn.parentElement.parentElement;
    const tableId = row.parentElement.id;
    row.remove();
    saveTable(tableId);
}


// Load khi mở trang
window.onload = () => {
    loadTable("table-kho");
    loadTable("table-fastfood");
};
// Bật / Tắt chế độ chỉnh sửa
function toggleEdit(tableId, btn) {
    const table = document.getElementById(tableId);
    const editing = table.classList.toggle("editing");
    btn.textContent = editing ? "Lưu" : "Cập Nhật";

    if (!editing) {
        saveTable(table);
    } else {
        makeEditable(table);
    }
}

// biến ô thành input để sửa
function makeEditable(table) {
    for (let i = 1; i < table.rows.length; i++) {
        for (let j = 0; j < table.rows[i].cells.length; j++) {
            const td = table.rows[i].cells[j];
            const value = td.textContent.trim();
            td.innerHTML = `<input class="cell-edit" value="${value}">`;
        }
    }
}

// lưu input -> text
function saveTable(table) {
    for (let i = 1; i < table.rows.length; i++) {
        for (let j = 0; j < table.rows[i].cells.length; j++) {
            const inp = table.rows[i].cells[j].querySelector("input");
            if (inp) {
                table.rows[i].cells[j].textContent = inp.value;
            }
        }
    }
}



// -------------------------
// THÊM HÀNG
// -------------------------

function addRow(tableId) {
    const name = document.getElementById('inputName').value.trim();
    const price = document.getElementById('orderQuantity').value.trim();
    const unit = document.getElementById('inputPrice').value.trim();

    if (!name || !price || !unit) {
        alert("Vui lòng nhập đủ thông tin!");
        return;
    }

    const table = document.getElementById(tableId);

    const row = table.insertRow(-1);

    row.innerHTML = `
        <td>${name}</td>
        <td>${price}</td>
        <td>${unit}</td>
        <td><button class="btn-delete" onclick="deleteRow(this)">Xóa</button></td>
    `;

    // reset form y hệt cách bạn đang làm ở trang menu
    document.getElementById('inputName').value = '';
    document.getElementById('inputPrice').value = '';
    document.getElementById('orderQuantity').value = '';
}

// -------------------------
// XÓA HÀNG
// -------------------------
function deleteRow(btn) {
    const row = btn.parentElement.parentElement;
    row.remove();
}
