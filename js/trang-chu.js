document.addEventListener('DOMContentLoaded', () => {
  // Set active menu based on current URL (simple heuristic)
  const links = document.querySelectorAll('.main-menu a');
  links.forEach(a => {
    if (location.pathname.endsWith(a.getAttribute('href')) || location.pathname.includes(a.getAttribute('href')) ){
      a.classList.add('active');
    }
  });

  //Only format elements with class .tq-so.money
  document.querySelectorAll('.tq-so.money').forEach(el => {
    const n = Number(String(el.textContent).replace(/[^0-9.-]+/g, ''));
    if (!isNaN(n)) el.textContent = formatCurrency(n);
  });

  // Simple table filter: add input with id #table-filter to filter first table on the page
  const filterInput = document.getElementById('table-filter');
  if (filterInput){
    filterInput.addEventListener('input', e => {
      const q = e.target.value.toLowerCase();
      const rows = document.querySelectorAll('table tbody tr');
      rows.forEach(r => {
        const txt = r.textContent.toLowerCase();
        r.style.display = txt.includes(q) ? '' : 'none';
      });
    });
  }

  // Demo: simulate fetching "Số Bàn Đang Chơi" from a data attribute or API
  const banEl = document.querySelector('.tq-banchoi .tq-so');
  if (banEl){
    const simulated = banEl.dataset.count ? Number(banEl.dataset.count) : null;
    if (simulated !== null) banEl.textContent = simulated;
  }

  // Mobile menu toggle (if you add a hamburger button with id #hamb)
  const hamb = document.getElementById('hamb');
  if (hamb){
    hamb.addEventListener('click', () => {
      document.querySelector('.main-menu').classList.toggle('open');
    });
  }

});

function formatCurrency(num){
  // format number with thousands separator and add VND
  return Number(num).toLocaleString('vi-VN') + ' VND';
}
