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

    <!-- 🧾 Form chỉ xem thông tin -->
    <form class="payment-form">
      <div class="form-group">
        <label>ID</label>
        <input type="text" :value="displayId(payment.payment_id)" readonly />
      </div>

      <div class="form-group">
        <label>Order ID</label>
        <input type="number" v-model="payment.order_id" readonly />
      </div>

      <div class="form-group">
        <label>Số tiền</label>
        <input type="number" v-model="payment.amount" readonly />
      </div>

      <div class="form-group">
        <label>Phương thức thanh toán</label>
        <input type="text" v-model="payment.payment_method" readonly />
      </div>

      <div class="form-group">
        <label>Ngày thanh toán</label>
        <input type="text" v-model="payment.payment_date" readonly />
      </div>
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
        <tr
          v-for="p in filteredPayments"
          :key="p.payment_id"
          :class="{ active: selectedId === p.payment_id }"
          @click="viewPayment(p)"
        >
          <td>{{ displayId(p.payment_id) }}</td>
          <td>{{ p.order_id }}</td>
          <td>{{ formatPrice(p.amount) }}</td>
          <td>{{ p.payment_method }}</td>
          <td>{{ p.payment_date }}</td>
          <td>
            <button class="btn-delete" @click.stop="openConfirm('delete', p.payment_id)">🗑️</button>
          </td>
        </tr>
        <tr v-if="filteredPayments.length === 0">
          <td colspan="6">Không có dữ liệu phù hợp</td>
        </tr>
      </tbody>
    </table>

    <!-- 🧩 Popup xác nhận -->
    <div v-if="showConfirm" class="confirm-overlay">
      <div class="confirm-box">
        <h3>Xác nhận</h3>
        <p>{{ confirmMessage }}</p>
        <div class="actions">
          <button class="btn-yes" @click="confirmAction">Xác nhận</button>
          <button class="btn-no" @click="closeConfirm">Hủy</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from "vue";

// ======= DỮ LIỆU MẪU =======
const payments = ref([
  {
    payment_id: 1,
    order_id: 1,
    amount: 300000,
    payment_method: "cash",
    payment_date: "2025-10-05 10:30",
  },
  {
    payment_id: 2,
    order_id: 2,
    amount: 250000,
    payment_method: "card",
    payment_date: "2025-10-06 15:00",
  },
]);

const payment = ref({
  payment_id: null,
  order_id: "",
  amount: "",
  payment_method: "",
  payment_date: "",
});

const selectedId = ref(null);
const searchText = ref("");
const filterType = ref("payment_id");

// ======= POPUP XÁC NHẬN =======
const showConfirm = ref(false);
const confirmMessage = ref("");
const confirmType = ref("");
const pendingId = ref(null);

function openConfirm(type, id = null) {
  confirmType.value = type;
  pendingId.value = id;

  if (type === "delete") confirmMessage.value = "Bạn có chắc muốn xóa thanh toán này không?";

  showConfirm.value = true;
}

function closeConfirm() {
  showConfirm.value = false;
  confirmType.value = "";
  pendingId.value = null;
}

function confirmAction() {
  if (confirmType.value === "delete") deletePaymentConfirmed(pendingId.value);
  closeConfirm();
}

// ======= XEM CHI TIẾT =======
function viewPayment(p) {
  payment.value = { ...p };
  selectedId.value = p.payment_id;
}

// ======= XÓA =======
function deletePaymentConfirmed(id) {
  payments.value = payments.value.filter((p) => p.payment_id !== id);
  if (selectedId.value === id) resetForm();
}

// ======= LỌC =======
const filteredPayments = computed(() => {
  const keyword = searchText.value.toLowerCase().trim();
  if (!keyword) return payments.value;
  return payments.value.filter((p) => {
    if (filterType.value === "payment_id")
      return displayId(p.payment_id).toLowerCase().includes(keyword);
    if (filterType.value === "order_id") return String(p.order_id).includes(keyword);
    return false;
  });
});

// ======= HIỂN THỊ =======
function displayId(id) {
  return id ? "PY" + id.toString().padStart(3, "0") : "";
}
function formatPrice(val) {
  return Number(val).toLocaleString("vi-VN");
}

// ======= RESET =======
function resetForm() {
  payment.value = {
    payment_id: null,
    order_id: "",
    amount: "",
    payment_method: "",
    payment_date: "",
  };
  selectedId.value = null;
}
</script>

<style scoped>
.payments-page {
  background: white;
  padding: 20px;
  border-radius: 10px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
}

/* ===== FORM ===== */
.payment-form {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
  margin-bottom: 20px;
}
.payment-form input[readonly] {
  background: #f8f8f8;
  color: #555;
  cursor: not-allowed;
}

/* ===== BẢNG ===== */
.payment-table {
  width: 100%;
  border-collapse: collapse;
}
.payment-table th,
.payment-table td {
  border: 1px solid #ddd;
  padding: 10px;
  text-align: center;
}
.payment-table th {
  background-color: #2c3e50;
  color: white;
}
.payment-table tr {
  transition: background 0.2s;
  cursor: pointer;
}
.payment-table tr:hover {
  background: #f9f9f9;
}
.payment-table tr.active {
  background-color: #f1f7ff;
  font-weight: 600;
}



/* ===== POPUP ===== */
.confirm-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.4);
  display: flex;
  justify-content: center;
  align-items: center;
}
.confirm-box {
  background: white;
  padding: 20px;
  border-radius: 8px;
  text-align: center;
  width: 320px;
}
.actions {
  margin-top: 12px;
  display: flex;
  justify-content: space-around;
}


</style>
