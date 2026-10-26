/* ==========================================================================
   GSMS Core Web Application Logic
   ========================================================================== */

// Base API configuration (Matches Python Flask Server)
const API_BASE = 'http://127.0.0.1:5000';

// Global Data Storage
let productsData = [];
let ordersData = [];
let uomData = [];

// Initialize application on page load
document.addEventListener('DOMContentLoaded', () => {
  fetchUOM();
  fetchProducts();
  fetchOrders();
});

// Navigation Tab Switcher
function switchTab(tabName) {
  document.querySelectorAll('.tab-content').forEach(tab => tab.classList.remove('active'));
  document.querySelectorAll('.nav-link').forEach(btn => btn.classList.remove('active'));

  document.getElementById(`view-${tabName}`).classList.add('active');
  document.getElementById(`tab-btn-${tabName}`).classList.add('active');

  if (tabName === 'new-order') {
    resetPosForm();
  }
}

// --------------------------------------------------------------------------
// Data Fetching Functions
// --------------------------------------------------------------------------

async function fetchUOM() {
  try {
    const res = await fetch(`${API_BASE}/getUOM`);
    if (res.ok) {
      uomData = await res.json();
    }
  } catch (e) {
    console.warn("API Server unavailable, falling back to local defaults for UOM.");
    uomData = [
      { uom_id: 1, uom_name: 'kg' },
      { uom_id: 2, uom_name: 'each' },
      { uom_id: 3, uom_name: 'liter' },
      { uom_id: 4, uom_name: 'pack' }
    ];
  }
  populateUOMDropdown();
}

async function fetchProducts() {
  try {
    const res = await fetch(`${API_BASE}/getProducts`);
    if (res.ok) {
      productsData = await res.json();
    }
  } catch (e) {
    console.warn("API Server unavailable, using sample products array.");
    if (productsData.length === 0) {
      productsData = [
        { product_id: 1, name: 'Rice', uom_id: 1, uom_name: 'kg', price_per_unit: 25.00 },
        { product_id: 2, name: 'Moong Daal', uom_id: 2, uom_name: 'each', price_per_unit: 100.00 },
        { product_id: 3, name: 'Toothpaste', uom_id: 2, uom_name: 'each', price_per_unit: 30.00 },
        { product_id: 4, name: 'Soap', uom_id: 2, uom_name: 'each', price_per_unit: 20.00 },
        { product_id: 5, name: 'Banana', uom_id: 2, uom_name: 'each', price_per_unit: 30.00 },
        { product_id: 6, name: 'Onions', uom_id: 2, uom_name: 'each', price_per_unit: 70.00 },
        { product_id: 7, name: 'Apple', uom_id: 2, uom_name: 'each', price_per_unit: 300.00 },
        { product_id: 8, name: 'Face Mask', uom_id: 1, uom_name: 'kg', price_per_unit: 20.00 },
        { product_id: 9, name: 'Okra', uom_id: 1, uom_name: 'kg', price_per_unit: 20.00 },
        { product_id: 10, name: 'Spinach', uom_id: 1, uom_name: 'kg', price_per_unit: 34.50 }
      ];
    }
  }
  renderProductsTable(productsData);
  updateDashboardStats();
}

async function fetchOrders() {
  try {
    const res = await fetch(`${API_BASE}/getAllOrders`);
    if (res.ok) {
      ordersData = await res.json();
    }
  } catch (e) {
    console.warn("API Server unavailable, using sample orders array.");
    if (ordersData.length === 0) {
      ordersData = [
        { order_id: 13, customer_name: 'Jared', total: 103.50, datetime: '2026-10-21 09:30:42', items: [{ name: 'Rice', price_per_unit: 25, quantity: 2, total_price: 50 }] },
        { order_id: 12, customer_name: 'Xavier', total: 20.00, datetime: '2026-10-21 09:30:00', items: [{ name: 'Soap', price_per_unit: 20, quantity: 1, total_price: 20 }] },
        { order_id: 11, customer_name: 'Albert', total: 160.00, datetime: '2026-10-21 09:29:34', items: [{ name: 'Moong Daal', price_per_unit: 100, quantity: 1, total_price: 100 }] },
        { order_id: 10, customer_name: 'Althea', total: 600.00, datetime: '2026-10-21 09:28:55', items: [{ name: 'Apple', price_per_unit: 300, quantity: 2, total_price: 600 }] },
        { order_id: 9, customer_name: 'Tokyo', total: 350.00, datetime: '2026-10-21 09:27:56', items: [{ name: 'Onions', price_per_unit: 70, quantity: 5, total_price: 350 }] },
        { order_id: 8, customer_name: 'Kidlat', total: 30.00, datetime: '2026-10-21 09:27:36', items: [{ name: 'Toothpaste', price_per_unit: 30, quantity: 1, total_price: 30 }] },
        { order_id: 7, customer_name: 'Ali', total: 20.00, datetime: '2026-10-21 09:26:57', items: [{ name: 'Okra', price_per_unit: 20, quantity: 1, total_price: 20 }] },
        { order_id: 6, customer_name: 'Angela', total: 90.00, datetime: '2026-10-21 09:26:33', items: [{ name: 'Banana', price_per_unit: 30, quantity: 3, total_price: 90 }] },
        { order_id: 5, customer_name: 'Anna', total: 100.00, datetime: '2026-10-21 09:25:13', items: [{ name: 'Moong Daal', price_per_unit: 100, quantity: 1, total_price: 100 }] },
        { order_id: 4, customer_name: 'Ray', total: 50.00, datetime: '2026-10-21 09:24:50', items: [{ name: 'Rice', price_per_unit: 25, quantity: 2, total_price: 50 }] },
        { order_id: 3, customer_name: 'Kervin', total: 200.00, datetime: '2026-10-08 12:07:32', items: [{ name: 'Moong Daal', price_per_unit: 100, quantity: 2, total_price: 200 }] }
      ];
    }
  }
  renderOrdersTable(ordersData);
  updateDashboardStats();
}

// --------------------------------------------------------------------------
// UI Rendering Functions
// --------------------------------------------------------------------------

function renderProductsTable(products) {
  const tbody = document.getElementById('products-table-body');
  tbody.innerHTML = '';

  if (products.length === 0) {
    tbody.innerHTML = `<tr><td colspan="4" class="text-center text-muted">No products found.</td></tr>`;
    return;
  }

  products.forEach(p => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td class="font-bold">${escapeHtml(p.name)}</td>
      <td><span class="badge">${escapeHtml(p.uom_name || 'each')}</span></td>
      <td class="text-right">₱ ${parseFloat(p.price_per_unit).toFixed(2)}</td>
      <td class="text-center">
        <button class="btn btn-danger btn-sm" onclick="handleDeleteProduct(${p.product_id})">
          <i class="fa-solid fa-trash"></i> Delete
        </button>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

function renderOrdersTable(orders) {
  const tbody = document.getElementById('orders-table-body');
  tbody.innerHTML = '';

  let totalSum = 0;

  if (orders.length === 0) {
    tbody.innerHTML = `<tr><td colspan="5" class="text-center text-muted">No orders available.</td></tr>`;
  } else {
    orders.forEach(o => {
      totalSum += parseFloat(o.total || 0);
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td class="text-muted" style="font-size: 0.85rem;">${escapeHtml(o.datetime)}</td>
        <td class="font-bold">#${o.order_id}</td>
        <td>${escapeHtml(o.customer_name)}</td>
        <td class="text-right font-bold">₱ ${parseFloat(o.total).toFixed(2)}</td>
        <td class="text-center">
          <button class="btn btn-secondary btn-sm" onclick="viewOrderDetails(${o.order_id})" title="View Items">
            <i class="fa-solid fa-eye"></i>
          </button>
          <button class="btn btn-danger btn-sm" onclick="handleDeleteOrder(${o.order_id})" title="Delete Order">
            <i class="fa-solid fa-trash"></i>
          </button>
        </td>
      `;
      tbody.appendChild(tr);
    });
  }

  document.getElementById('dashboard-total-sum').textContent = `₱ ${totalSum.toFixed(2)}`;
}

function updateDashboardStats() {
  const totalRevenue = ordersData.reduce((acc, o) => acc + parseFloat(o.total || 0), 0);
  const totalOrders = ordersData.length;
  const totalProducts = productsData.length;
  const avgOrder = totalOrders > 0 ? (totalRevenue / totalOrders) : 0;

  document.getElementById('stat-revenue').textContent = `₱ ${totalRevenue.toFixed(2)}`;
  document.getElementById('stat-orders').textContent = totalOrders;
  document.getElementById('stat-products').textContent = totalProducts;
  document.getElementById('stat-avg').textContent = `₱ ${avgOrder.toFixed(2)}`;
}

// --------------------------------------------------------------------------
// Product Modal & Management
// --------------------------------------------------------------------------

function openAddProductModal() {
  document.getElementById('modal-add-product').classList.add('open');
}

function closeAddProductModal() {
  document.getElementById('modal-add-product').classList.remove('open');
}

function populateUOMDropdown() {
  const select = document.getElementById('prod-uom');
  select.innerHTML = '<option value="">--Select Unit--</option>';
  uomData.forEach(u => {
    const opt = document.createElement('option');
    opt.value = u.uom_id;
    opt.textContent = u.uom_name;
    select.appendChild(opt);
  });
}

async function handleSaveProduct(e) {
  e.preventDefault();
  const name = document.getElementById('prod-name').value.trim();
  const uom_id = parseInt(document.getElementById('prod-uom').value);
  const price_per_unit = parseFloat(document.getElementById('prod-price').value);

  const uomObj = uomData.find(u => u.uom_id === uom_id);

  try {
    const res = await fetch(`${API_BASE}/insertProduct`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, uom_id, price_per_unit })
    });
    if (res.ok) {
      await fetchProducts();
    } else {
      throw new Error("Server error");
    }
  } catch (err) {
    // Fallback UI update
    const newId = productsData.length ? Math.max(...productsData.map(p => p.product_id)) + 1 : 1;
    productsData.push({
      product_id: newId,
      name,
      uom_id,
      uom_name: uomObj ? uomObj.uom_name : 'each',
      price_per_unit
    });
    renderProductsTable(productsData);
    updateDashboardStats();
  }

  closeAddProductModal();
  document.getElementById('prod-name').value = '';
  document.getElementById('prod-price').value = '';
}

async function handleDeleteProduct(id) {
  if (!confirm('Are you sure you want to delete this product?')) return;

  try {
    await fetch(`${API_BASE}/deleteProduct`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ product_id: id })
    });
  } catch (err) {
    console.warn("Backend unaccessible. Deleting from memory.");
  }
  
  productsData = productsData.filter(p => p.product_id !== id);
  renderProductsTable(productsData);
  updateDashboardStats();
}

// --------------------------------------------------------------------------
// Point of Sale (POS) Order Form Builder
// --------------------------------------------------------------------------

function resetPosForm() {
  document.getElementById('customer-name').value = '';
  const tbody = document.getElementById('pos-items-body');
  tbody.innerHTML = '';
  addPosRow();
  calculatePosGrandTotal();
}

function addPosRow() {
  const tbody = document.getElementById('pos-items-body');
  const tr = document.createElement('tr');

  let productOptions = '<option value="">-- Select Product --</option>';
  productsData.forEach(p => {
    productOptions += `<option value="${p.product_id}" data-price="${p.price_per_unit}">${escapeHtml(p.name)}</option>`;
  });

  tr.innerHTML = `
    <td>
      <select class="form-control pos-product-select" onchange="onPosProductChange(this)" required>
        ${productOptions}
      </select>
    </td>
    <td>
      <input type="number" class="form-control pos-price" value="0.00" readonly>
    </td>
    <td>
      <input type="number" class="form-control pos-qty" value="1" min="0.1" step="any" oninput="onPosQtyChange(this)" required>
    </td>
    <td class="text-right font-bold">
      <span class="pos-row-total">₱0.00</span>
    </td>
    <td class="text-center">
      <button type="button" class="btn btn-danger btn-sm" onclick="removePosRow(this)">
        <i class="fa-solid fa-times"></i>
      </button>
    </td>
  `;

  tbody.appendChild(tr);
}

function removePosRow(btn) {
  const tbody = document.getElementById('pos-items-body');
  if (tbody.children.length > 1) {
    btn.closest('tr').remove();
    calculatePosGrandTotal();
  } else {
    alert('An order must contain at least one item line.');
  }
}

function onPosProductChange(selectElem) {
  const row = selectElem.closest('tr');
  const selectedOption = selectElem.options[selectElem.selectedIndex];
  const price = parseFloat(selectedOption.getAttribute('data-price') || 0);

  row.querySelector('.pos-price').value = price.toFixed(2);
  updatePosRowTotal(row);
}

function onPosQtyChange(qtyInput) {
  const row = qtyInput.closest('tr');
  updatePosRowTotal(row);
}

function updatePosRowTotal(row) {
  const price = parseFloat(row.querySelector('.pos-price').value) || 0;
  const qty = parseFloat(row.querySelector('.pos-qty').value) || 0;
  const total = price * qty;

  row.querySelector('.pos-row-total').textContent = `₱ ${total.toFixed(2)}`;
  calculatePosGrandTotal();
}

function calculatePosGrandTotal() {
  let grandTotal = 0;
  document.querySelectorAll('#pos-items-body tr').forEach(row => {
    const price = parseFloat(row.querySelector('.pos-price').value) || 0;
    const qty = parseFloat(row.querySelector('.pos-qty').value) || 0;
    grandTotal += (price * qty);
  });

  document.getElementById('pos-grand-total').textContent = `₱ ${grandTotal.toFixed(2)}`;
}

async function handleSaveOrder(e) {
  e.preventDefault();

  const customer_name = document.getElementById('customer-name').value.trim();
  const orderDetails = [];
  let grandTotal = 0;

  let isValid = true;
  document.querySelectorAll('#pos-items-body tr').forEach(row => {
    const productSelect = row.querySelector('.pos-product-select');
    const productId = parseInt(productSelect.value);
    const qty = parseFloat(row.querySelector('.pos-qty').value);
    const price = parseFloat(row.querySelector('.pos-price').value);

    if (!productId || qty <= 0) {
      isValid = false;
      return;
    }

    const itemTotal = price * qty;
    grandTotal += itemTotal;

    const prodObj = productsData.find(p => p.product_id === productId);

    orderDetails.push({
      product_id: productId,
      name: prodObj ? prodObj.name : 'Item',
      price_per_unit: price,
      quantity: qty,
      total_price: itemTotal
    });
  });

  if (!isValid || orderDetails.length === 0) {
    alert('Please complete all item details before saving.');
    return;
  }

  const payload = {
    customer_name,
    grand_total: grandTotal,
    order_details: orderDetails
  };

  try {
    const res = await fetch(`${API_BASE}/insertOrder`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (res.ok) {
      await fetchOrders();
    } else {
      throw new Error("Server Error");
    }
  } catch (err) {
    // Local memory fallback
    const newOrderId = ordersData.length ? Math.max(...ordersData.map(o => o.order_id)) + 1 : 1;
    const nowStr = new Date().toISOString().replace('T', ' ').substring(0, 19);

    ordersData.unshift({
      order_id: newOrderId,
      customer_name,
      total: grandTotal,
      datetime: nowStr,
      items: orderDetails
    });

    renderOrdersTable(ordersData);
    updateDashboardStats();
  }

  alert('Order saved successfully!');
  switchTab('dashboard');
}

// --------------------------------------------------------------------------
// Order Deletion & View Details
// --------------------------------------------------------------------------

async function handleDeleteOrder(id) {
  if (!confirm('Are you sure you want to delete this order receipt?')) return;

  try {
    await fetch(`${API_BASE}/deleteOrder`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ order_id: id })
    });
  } catch (err) {
    console.warn("Backend unaccessible. Deleting order locally.");
  }

  ordersData = ordersData.filter(o => o.order_id !== id);
  renderOrdersTable(ordersData);
  updateDashboardStats();
}

function viewOrderDetails(orderId) {
  const order = ordersData.find(o => o.order_id === orderId);
  if (!order) return;

  document.getElementById('view-order-id-title').textContent = `#${order.order_id}`;
  document.getElementById('view-customer-name').textContent = order.customer_name;
  document.getElementById('view-order-date').textContent = order.datetime;
  document.getElementById('view-order-grand-total').textContent = `₱ ${parseFloat(order.total).toFixed(2)}`;

  const tbody = document.getElementById('view-order-items-body');
  tbody.innerHTML = '';

  if (order.items && order.items.length > 0) {
    order.items.forEach(item => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td class="font-bold">${escapeHtml(item.name || 'Product Item')}</td>
        <td>₱ ${parseFloat(item.price_per_unit || 0).toFixed(2)}</td>
        <td>${item.quantity}</td>
        <td class="text-right font-bold">₱ ${parseFloat(item.total_price || 0).toFixed(2)}</td>
      `;
      tbody.appendChild(tr);
    });
  } else {
    tbody.innerHTML = `<tr><td colspan="4" class="text-center text-muted">No itemized receipt available for this order.</td></tr>`;
  }

  document.getElementById('modal-view-order').classList.add('open');
}

function closeViewOrderModal() {
  document.getElementById('modal-view-order').classList.remove('open');
}

// --------------------------------------------------------------------------
// Live Search Filtering
// --------------------------------------------------------------------------

function filterOrders() {
  const query = document.getElementById('search-orders').value.toLowerCase();
  const filtered = ordersData.filter(o =>
    o.customer_name.toLowerCase().includes(query) ||
    o.order_id.toString().includes(query)
  );
  renderOrdersTable(filtered);
}

function filterProducts() {
  const query = document.getElementById('search-products').value.toLowerCase();
  const filtered = productsData.filter(p =>
    p.name.toLowerCase().includes(query)
  );
  renderProductsTable(filtered);
}

// Helper Utility to Prevent XSS
function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}