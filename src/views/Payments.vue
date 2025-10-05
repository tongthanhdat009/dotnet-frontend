<template>
  <div class="payments-page">
    <h2>💳 Quản lý thanh toán</h2>

    <!-- 🔍 Thanh tìm kiếm -->
    <div class="search-bar">
      <label for="filterType">Tìm theo:</label>
      <select v-model="filterType" id="filterType">
        <option value="payment_id">ID</option>
        <option value="order_id">Order ID</option>
      </select>
      <input type="text" v-model="searchText" placeholder="Nhập từ khóa..." />
    </div>

    <!-- 📝 Form thêm / sửa -->
    <form class="payment-form" @submit.prevent="savePayment">
      <div class="form-group">
        <label>ID</label>
        <input type="text" :value="displayId(payment.payment_id)" readonly />
      </div>

      <div class="form-group">
        <label>Order ID</label>
        <input v-model="payment.order_id" type="number" required />
      </div>

      <div class="form-group">
        <label>Số tiền</label>
        <input v-model="payment.amount" type="number" step="0.01" required />
      </div>

      <div class="form-group">
        <label>Phương thức thanh toán</label>
        <select v-model="payment.payment_method">
          <option value="cash">Cash</option>
          <option value="card">Card</option>
          <option value="bank_transfer">Bank Transfer</option>
          <option value="e-wallet">E-wallet</option>
        </select>
      </div>

      <div class="form-group">
        <label>Ngày thanh toán</label>
        <input ref="paymentDateRef" v-model="payment.payment_date" placeholder="Chọn ngày giờ" />
      </div>

      <button type="submit">{{ editMode ? "Cập nhật" : "Thêm mới" }}</button>
      <button type="button" v-if="editMode" @click="cancelEdit">Hủy</button>
    </form>

    <!-- 📋 Bảng hiển thị -->
    <table class="payment-table">
      <thead>
        <tr>
          <th>ID</th>
          <th>Order ID</th>
          <th>Số tiền</th>
          <th>Phương thức</th>
          <th>Ngày thanh toán</th>
          <th>Hành động</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="p in filteredPayments" :key="p.payment_id">
          <td>{{ displayId(p.payment_id) }}</td>
          <td>{{ p.order_id }}</td>
          <td>{{ formatPrice(p.amount) }}</td>
          <td>{{ p.payment_method }}</td>
          <td>{{ p.payment_date }}</td>
          <td>
            <button @click="editPayment(p)">✏️</button>
            <button @click="deletePayment(p.payment_id)">🗑️</button>
          </td>
        </tr>
        <tr v-if="filteredPayments.length === 0">
          <td colspan="6">Không có dữ liệu phù hợp</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import flatpickr from "flatpickr";
import "flatpickr/dist/flatpickr.css";

const payments = ref([
  { payment_id: 1, order_id: 1, amount: 300000, payment_method: "cash", payment_date: "2025-10-05 10:30" },
  { payment_id: 2, order_id: 2, amount: 250000, payment_method: "card", payment_date: "2025-10-06 15:00" },
]);

const payment = ref({
  payment_id: null,
  order_id: "",
  amount: 0,
  payment_method: "cash",
  payment_date: "",
});

const editMode = ref(false);
const searchText = ref("");
const filterType = ref("payment_id");

const paymentDateRef = ref(null);

// Flatpickr setup
onMounted(() => {
  flatpickr(paymentDateRef.value, {
    enableTime: true,
    dateFormat: "Y-m-d H:i",
    time_24hr: true
  });
});

// Filter
const filteredPayments = computed(() => {
  const keyword = searchText.value.toLowerCase().trim();
  if (!keyword) return payments.value;
  return payments.value.filter(p => {
    if (filterType.value === "payment_id") return displayId(p.payment_id).toLowerCase().includes(keyword);
    if (filterType.value === "order_id") return String(p.order_id).includes(keyword);
    return false;
  });
});

// Hiển thị ID dạng PY001
function displayId(id) {
  return "PY" + id.toString().padStart(3, "0");
}

function formatPrice(val) {
  return Number(val).toLocaleString("vi-VN");
}

// Thêm / Cập nhật
function savePayment() {
  if (editMode.value) {
    const index = payments.value.findIndex(p => p.payment_id === payment.value.payment_id);
    if (index !== -1) payments.value[index] = { ...payment.value };
    editMode.value = false;
  } else {
    const nextId = payments.value.length > 0 ? Math.max(...payments.value.map(p => p.payment_id)) + 1 : 1;
    payments.value.push({ ...payment.value, payment_id: nextId });
  }
  resetForm();
}

// Sửa
function editPayment(p) {
  payment.value = { ...p };
  editMode.value = true;
}

// Xóa
function deletePayment(id) {
  payments.value = payments.value.filter(p => p.payment_id !== id);
  resetForm();
}

// Hủy
function cancelEdit() {
  editMode.value = false;
  resetForm();
}

// Reset form
function resetForm() {
  const nextId = payments.value.length > 0 ? Math.max(...payments.value.map(p => p.payment_id)) + 1 : 1;
  payment.value = {
    payment_id: nextId,
    order_id: "",
    amount: 0,
    payment_method: "cash",
    payment_date: "",
  };
}

resetForm();
</script>

<style scoped>
.payments-page {
  background: white;
  padding: 20px;
  border-radius: 10px;
  box-shadow: 0 2px 6px rgba(0,0,0,0.1);
}


.payment-form {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
  margin-bottom: 20px;
}

.payment-table {
  width: 100%;
  border-collapse: collapse;
}
.payment-table th,
.payment-table td {
  border: 1px solid #ddd;
  padding: 8px;
  text-align: center;
}
.payment-table th {
  background-color: #2c3e50;
  color: white;
}
</style>
