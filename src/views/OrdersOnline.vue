<template>
  <div class="orders-page">
    <div class="header-row">
      <h2>🌐 Đơn hàng Online</h2>
      <div class="search-bar">
        <select v-model="filterType">
          <option value="id">ID</option>
          <option value="customer">Khách hàng</option>
          <option value="phone">SĐT</option>
        </select>
        <input v-model="searchText" type="text" placeholder="Nhập từ khoá..." />
      </div>
    </div>

    <div v-if="loading" class="loading">Đang tải danh sách đơn hàng online...</div>
    <div v-if="error" class="error">{{ error }}</div>

    <table v-if="!loading" class="order-table">
      <thead>
        <tr>
          <th>ID</th>
          <th>Khách hàng</th>
          <th>Ngày đặt</th>
          <th>Trạng thái</th>
          <th>Tổng tiền</th>
          <th>Giảm giá</th>
          <th>Hành động</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="o in filtered" :key="o.OrderId">
          <td>{{ displayId(o.OrderId) }}</td>
          <td>
            <div class="customer-col">
              <strong>{{ o.Customer?.Name || '-' }}</strong>
              <small>{{ o.Customer?.Phone || '-' }}</small>
            </div>
          </td>
          <td>{{ formatDate(o.OrderDate) }}</td>
          <td><span :class="['badge', o.Status]">{{ o.Status }}</span></td>
          <td>{{ formatCurrency(o.TotalAmount) }}</td>
          <td>{{ formatCurrency(o.DiscountAmount) }}</td>
          <td class="actions">
            <button class="btn-outline" :disabled="generatingId === o.OrderId" @click="openDetail(o.OrderId)">
              {{ generatingId === o.OrderId ? 'Đang tạo PDF…' : 'Xem chi tiết' }}
            </button>
          </td>
        </tr>
        <tr v-if="filtered.length === 0">
          <td colspan="7">Không có dữ liệu phù hợp</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { fetchOrdersOnline, fetchOrderById } from '../api/Order.js';
import { generateInvoicePDF } from '../utils/generateInvoicePDF.js';

const orders = ref([]);
const loading = ref(true);
const error = ref('');

const searchText = ref('');
const filterType = ref('id');
const generatingId = ref(null);

const filtered = computed(() => {
  const kw = (searchText.value || '').toLowerCase().trim();
  if (!kw) return orders.value;
  return orders.value.filter(o => {
    if (filterType.value === 'id') return String(o.OrderId).includes(kw) || displayId(o.OrderId).toLowerCase().includes(kw);
    if (filterType.value === 'customer') return (o.Customer?.Name || '').toLowerCase().includes(kw);
    if (filterType.value === 'phone') return (o.Customer?.Phone || '').toLowerCase().includes(kw);
    return false;
  });
});

function displayId(id) { return `O${String(id).padStart(3,'0')}`; }
function formatDate(d) { try { return new Date(d).toLocaleString('vi-VN'); } catch { return d; } }
function formatCurrency(v) { return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(Number(v||0)); }

async function load() {
  loading.value = true; error.value='';
  try {
    const data = await fetchOrdersOnline();
    orders.value = Array.isArray(data) ? data : (data?.data || []);
  } catch (e) {
    error.value = e?.response?.data?.message || e?.message || 'Không thể tải danh sách đơn hàng online.';
  } finally {
    loading.value = false;
  }
}

async function openDetail(orderId) {
  try {
    error.value = '';
    generatingId.value = orderId;
    const data = await fetchOrderById(orderId);
    const order = data?.Order || data?.data?.Order || data;
    if (!order) throw new Error('Không lấy được dữ liệu đơn hàng');
    generateInvoicePDF(order);
  } catch (e) {
    error.value = e?.response?.data?.message || e?.message || 'Không thể xem chi tiết đơn hàng.';
  } finally {
    generatingId.value = null;
  }
}

onMounted(load);
</script>

<style scoped>
.orders-page { background: #fff; padding: 16px; border-radius: 10px; box-shadow: 0 2px 6px rgba(0,0,0,0.08); }
.header-row { display:flex; justify-content:space-between; align-items:center; margin-bottom:12px; }
.search-bar { display:flex; gap:8px; align-items:center; }
.search-bar input { height:36px; padding:0 10px; border:1px solid #ddd; border-radius:6px; }
.search-bar select { height:36px; border:1px solid #ddd; border-radius:6px; padding:0 8px; }
.loading { padding:12px; color:#666; }
.error { padding:10px; background:#fdecea; color:#b91c1c; border:1px solid #fecaca; border-radius:6px; margin-bottom:10px; }

.order-table { width:100%; border-collapse: collapse; }
.order-table th, .order-table td { border:1px solid #eee; padding:10px; text-align:center; }
.order-table thead th {   background-color: #2c3e50;color: #ffffff; }
.customer-col { display:flex; flex-direction:column; align-items:flex-start; }
.customer-col small { color:#6b7280; }
.actions { display:flex; gap:8px; justify-content:center; }
.btn-outline { padding:6px 10px; border:2px solid #1abc9c; color:#1abc9c; background:#fff; border-radius:6px; font-weight:600; cursor:pointer; }
.btn-outline:hover { background:#1abc9c; color:#fff; }
.btn-outline:disabled { opacity:.5; cursor:not-allowed; }

.badge { padding:4px 8px; border-radius:999px; font-size:12px; font-weight:700; text-transform:uppercase; }
.badge.paid { background:#e6fffa; color:#0f766e; }
.badge.pending { background:#fff7ed; color:#b45309; }
.badge.canceled { background:#fee2e2; color:#b91c1c; }
</style>
