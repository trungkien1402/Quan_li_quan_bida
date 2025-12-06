const ids = [
  "sang2",
  "sang3",
  "sang4",
  "sang5",
  "sang6",
  "sang7",
  "sangCN",
  "chieu2",
  "chieu3",
  "chieu4",
  "chieu5",
  "chieu6",
  "chieu7",
  "chieuCN",
  "toi2",
  "toi3",
  "toi4",
  "toi5",
  "toi6",
  "toi7",
  "toiCN",
];

let dsNV = JSON.parse(localStorage.getItem("dsNV")) || {
  ql: [],
  pv: [],
  tn: [],
};
let lichNV = JSON.parse(localStorage.getItem("lichNV")) || {};
let Xoa = false;
let nhanVienHienTai = "";

function taoCheckbox(id, giaTri = "Không") {
  const td = document.getElementById(id);
  const isChecked = giaTri === "Có" ? "checked" : "";
  td.innerHTML = `<input type="checkbox" id="check-${id}" ${isChecked}>`;
  td.classList.remove("checked");
  td.style.fontSize = "14px";
  td.style.fontWeight = "normal";

  const checkboxElement = document.getElementById(`check-${id}`);
  if (checkboxElement) {
    checkboxElement.onchange = () => capNhatNhanh(id);
  }
}
function hienThi(id) {
  const list = document.getElementById(id);
  const searchInput = document.getElementById("search");
  if (searchInput.value.trim() !== "") {
    return;
  }
  list.style.display =
    list.style.display === "none" || list.style.display === ""
      ? "block"
      : "none";
}
function capNhatNhanh(id) {
  if (!nhanVienHienTai) return alert("⚠ Hãy chọn nhân viên trước!");
  const checkbox = document.getElementById(`check-${id}`);
  const giaTriMoi = checkbox.checked ? "Có" : "Không";
  lichNV[nhanVienHienTai][id] = giaTriMoi;
  localStorage.setItem("lichNV", JSON.stringify(lichNV));

  const cell = document.getElementById(id);
  cell.style.transition = "none";
  cell.style.backgroundColor = giaTriMoi === "Có" ? "#2ecc71" : "#34495e";
  setTimeout(() => {
    cell.style.transition = "background-color 0.2s";
    cell.style.backgroundColor = "var(--color-dark-element)";
  }, 100);
}

function capNhat() {
  localStorage.setItem("lichNV", JSON.stringify(lichNV));
  alert("💾 Đã lưu lịch (được cập nhật tự động) cho " + nhanVienHienTai);
}

function resetLuaChon() {
  if (!nhanVienHienTai) return alert("⚠ Hãy chọn nhân viên trước!");
  ids.forEach((id) => {
    const val = lichNV[nhanVienHienTai][id] || "Không";
    taoCheckbox(id, val);
  });
}

function chonNhanVien(ten) {
  nhanVienHienTai = ten;
  document.getElementById("tenNV").innerText = "Lịch làm của: " + ten;
  document.getElementById("ngay").innerText =
    "Tháng: " + (new Date().getMonth() + 1) + "/" + new Date().getFullYear();

  if (!lichNV[ten]) {
    lichNV[ten] = {};
    ids.forEach((id) => (lichNV[ten][id] = "Không"));
  }
  resetLuaChon();
}

function createListItem(ten, nhom) {
  const li = document.createElement("li");
  li.textContent = ten;
  li.onclick = () => {
    if (Xoa) {
      if (confirm("Xóa nhân viên '" + ten + "'?")) {
        dsNV[nhom] = dsNV[nhom].filter((t) => t !== ten);
        delete lichNV[ten];
        localStorage.setItem("dsNV", JSON.stringify(dsNV));
        localStorage.setItem("lichNV", JSON.stringify(lichNV));
        hienThiDanhSach();
        if (nhanVienHienTai === ten) {
          nhanVienHienTai = "";
          document.getElementById("tenNV").innerText = "Chưa chọn nhân viên";
        }
      }
    } else {
      chonNhanVien(ten);
    }
  };
  return li;
}

function themNhanVien() {
  const nhom = prompt("Thêm vào nhóm nào? (ql/pv/tn): ");
  const ten = prompt("Nhập tên nhân viên:");
  if (!ten || !nhom || !dsNV.hasOwnProperty(nhom)) {
    return alert("❌ Nhóm không hợp lệ (phải là ql, pv, tn) hoặc tên trống.");
  }

  if (dsNV[nhom].includes(ten)) {
    return alert("❌ Nhân viên này đã tồn tại.");
  }
  dsNV[nhom].push(ten);
  lichNV[ten] = {};
  ids.forEach((id) => (lichNV[ten][id] = "Không"));
  localStorage.setItem("dsNV", JSON.stringify(dsNV));
  localStorage.setItem("lichNV", JSON.stringify(lichNV));

  hienThiDanhSach();
  alert("✅ Thêm nhân viên thành công.");
}

function xoaNhanVien() {
  Xoa = !Xoa;
  const xoaBtn = document.getElementById("xoaNV");
  xoaBtn.textContent = Xoa ? "Chọn tên để xóa" : "🗑️ Xóa";
  const leftPanel = document.querySelector(".left");
  if (Xoa) {
    leftPanel.classList.add("deleting");
  } else {
    leftPanel.classList.remove("deleting");
  }
}

function hienThiDanhSach() {
  for (let nhom in dsNV) {
    const ul = document.getElementById(nhom);
    ul.innerHTML = "";
    dsNV[nhom].forEach((ten) => {
      const li = createListItem(ten, nhom);
      ul.appendChild(li);
    });
  }
}

document.getElementById("search").addEventListener("input", function () {
  const keyword = this.value.toLowerCase().trim();
  for (let nhom in dsNV) {
    const ul = document.getElementById(nhom);
    const h3 = ul.previousElementSibling;
    const lis = ul.getElementsByTagName("li");
    let found = false;
    for (let li of lis) {
      if (li.textContent.toLowerCase().includes(keyword)) {
        li.style.display = "list-item";
        found = true;
      } else {
        li.style.display = "none";
      }
    }
    if (keyword === "") {
      ul.style.display = "none";
      h3.style.display = "block";
    } else {
      ul.style.display = found ? "block" : "none";
      h3.style.display = found ? "block" : "none";
    }
  }
});

hienThiDanhSach();

ids.forEach((id) => {
  const cell = document.getElementById(id);
  cell.innerHTML = "";
});

document.getElementById("ngay").innerText =
  "Tháng: " + (new Date().getMonth() + 1) + "/" + new Date().getFullYear();
