<template>
  <div class="order-items-page">
    <h2>📦 Quản lý chi tiết đơn hàng</h2>

    <!-- 🔍 Thanh tìm kiếm -->
    <div class="search-bar">
      <label for="filterType">Tìm theo:</label>
      <select v-model="filterType" id="filterType">
        <option value="order_id">Order ID</option>
        <option value="product_id">Product ID</option>
      </select>
      <input type="text" v-model="searchText" placeholder="Nhập từ khóa..." />
    </div>

    <!-- 📝 Form xem chi tiết -->
    <form class="order-item-form">
      <div class="form-group">
        <label>ID</label>
        <input type="text" :value="displayId(orderItem.order_item_id)" readonly />
      </div>

      <div class="form-group">
        <label>Order ID</label>
        <input type="number" v-model="orderItem.order_id" readonly />
      </div>

      <div class="form-group">
        <label>Product ID</label>
        <input type="number" v-model="orderItem.product_id" readonly />
      </div>

      <div class="form-group">
        <label>Số lượng</label>
        <input type="number" v-model="orderItem.quantity" readonly />
      </div>

      <div class="form-group">
        <label>Giá</label>
        <input type="number" v-model="orderItem.price" readonly />
      </div>

      <div class="form-group">
        <label>Thành tiền</label>
        <input type="number" v-model="orderItem.subtotal" readonly />
      </div>
    </form>

    <!-- 📋 Bảng hiển thị -->
    <table class="order-item-table">
      <thead>
        <tr>
          <th>ID</th>
          <th>Order ID</th>
          <th>Product ID</th>
          <th>Số lượng</th>
          <th>Giá</th>
          <th>Thành tiền</th>
          <th>Hành động</th>
        </tr>
      </thead>
      <tbody>
        <tr
          v-for="oi in filteredOrderItems"
          :key="oi.order_item_id"
          :class="{ selected: selectedId === oi.order_item_id }"
          @click="viewOrderItem(oi)"
        >
          <td>{{ displayId(oi.order_item_id) }}</td>
          <td>{{ oi.order_id }}</td>
          <td>{{ oi.product_id }}</td>
          <td>{{ oi.quantity }}</td>
          <td>{{ formatPrice(oi.price) }}</td>
          <td>{{ formatPrice(oi.subtotal) }}</td>
          <td>
            <button @click.stop="openConfirm('delete', oi)">🗑️</button>
          </td>
        </tr>
        <tr v-if="filteredOrderItems.length === 0">
          <td colspan="7">Không có dữ liệu phù hợp</td>
        </tr>
      </tbody>
    </table>

    <!-- 🔔 Popup xác nhận xóa -->
    <div v-if="showConfirm" class="confirm-overlay">
      <div class="confirm-box">
        <p>{{ confirmMessage }}</p>
        <div class="actions">
          <button class="btn-yes" @click="handleConfirm">Xác nhận</button>
          <button class="btn-no" @click="cancelConfirm">Hủy</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from "vue";

const orderItems = ref([
  { order_item_id: 1, order_id: 1, product_id: 1, quantity: 2, price: 50000, subtotal: 100000 },
  { order_item_id: 2, order_id: 1, product_id: 2, quantity: 1, price: 200000, subtotal: 200000 },
]);

const orderItem = ref({
  order_item_id: null,
  order_id: "",
  product_id: "",
  quantity: "",
  price: "",
  subtotal: "",
});

const selectedId = ref(null);
const searchText = ref("");
const filterType = ref("order_id");

// ==== Popup xác nhận ====
const showConfirm = ref(false);
const confirmMessage = ref("");
const confirmAction = ref("");
const selectedItem = ref(null);

function openConfirm(action, item) {
  confirmAction.value = action;
  selectedItem.value = item;

  if (action === "delete") {
    confirmMessage.value = "Bạn có chắc muốn xóa chi tiết đơn hàng này không?";
  }

  showConfirm.value = true;
}

function cancelConfirm() {
  showConfirm.value = false;
  confirmAction.value = "";
  selectedItem.value = null;
}

function handleConfirm() {
  if (confirmAction.value === "delete") {
    deleteOrderItem(selectedItem.value.order_item_id);
  }
  showConfirm.value = false;
  confirmAction.value = "";
  selectedItem.value = null;
}

// ==== Hiển thị thông tin ====
function viewOrderItem(item) {
  orderItem.value = { ...item };
  selectedId.value = item.order_item_id;
}

// ==== Xóa ====
function deleteOrderItem(id) {
  orderItems.value = orderItems.value.filter(oi => oi.order_item_id !== id);
  if (selectedId.value === id) resetForm();
}

// ==== Tìm kiếm ====
const filteredOrderItems = computed(() => {
  const keyword = searchText.value.toLowerCase().trim();
  if (!keyword) return orderItems.value;
  return orderItems.value.filter(oi => {
    if (filterType.value === "order_id") return String(oi.order_id).includes(keyword);
    if (filterType.value === "product_id") return String(oi.product_id).includes(keyword);
    return false;
  });
});

function displayId(id) {
  return id ? "OI" + id.toString().padStart(3, "0") : "";
}

function formatPrice(val) {
  return Number(val).toLocaleString("vi-VN");
}

function resetForm() {
  orderItem.value = {
    order_item_id: null,
    order_id: "",
    product_id: "",
    quantity: "",
    price: "",
    subtotal: "",
  };
  selectedId.value = null;
}
</script>

<style scoped>
.order-items-page {
  background: white;
  padding: 20px;
  border-radius: 10px;
  box-shadow: 0 2px 6px rgba(0,0,0,0.1);
}

.order-item-form {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
  margin-bottom: 20px;
}

.order-item-form input[readonly] {
  background: #f8f8f8;
  color: #555;
  cursor: not-allowed;
}

.order-item-table {
  width: 100%;
  border-collapse: collapse;
}

.order-item-table th,
.order-item-table td {
  border: 1px solid #ddd;
  padding: 8px;
  text-align: center;
}

.order-item-table th {
  background-color: #2c3e50;
  color: white;
}

/* Khi click chọn dòng */
.order-item-table tr.selected {
  background-color: #d6eaf8;
  transition: background-color 0.2s ease;
}

/* Popup xác nhận */
.confirm-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0,0,0,0.4);
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

.btn-yes, .btn-no {
  padding: 6px 14px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.btn-yes {
  background: #27ae60;
  color: white;
}

.btn-no {
  background: #c0392b;
  color: white;
}
</style>
