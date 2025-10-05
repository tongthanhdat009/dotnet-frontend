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

    <!-- 📝 Form thêm / sửa -->
    <form class="order-item-form" @submit.prevent="saveOrderItem">
      <div class="form-group">
        <label>ID</label>
        <input type="text" :value="displayId(orderItem.order_item_id)" readonly />
      </div>

      <div class="form-group">
        <label>Order ID</label>
        <input v-model="orderItem.order_id" type="number" required />
      </div>

      <div class="form-group">
        <label>Product ID</label>
        <input v-model="orderItem.product_id" type="number" required />
      </div>

      <div class="form-group">
        <label>Số lượng</label>
        <input v-model="orderItem.quantity" type="number" min="1" @input="updateSubtotal" required />
      </div>

      <div class="form-group">
        <label>Giá</label>
        <input v-model="orderItem.price" type="number" step="0.01" @input="updateSubtotal" required />
      </div>

      <div class="form-group">
        <label>Thành tiền</label>
        <input v-model="orderItem.subtotal" type="number" step="0.01" readonly />
      </div>

      <button type="submit">{{ editMode ? "Cập nhật" : "Thêm mới" }}</button>
      <button type="button" v-if="editMode" @click="cancelEdit">Hủy</button>
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
        <tr v-for="oi in filteredOrderItems" :key="oi.order_item_id">
          <td>{{ displayId(oi.order_item_id) }}</td>
          <td>{{ oi.order_id }}</td>
          <td>{{ oi.product_id }}</td>
          <td>{{ oi.quantity }}</td>
          <td>{{ formatPrice(oi.price) }}</td>
          <td>{{ formatPrice(oi.subtotal) }}</td>
          <td>
            <button @click="editOrderItem(oi)">✏️</button>
            <button @click="deleteOrderItem(oi.order_item_id)">🗑️</button>
          </td>
        </tr>
        <tr v-if="filteredOrderItems.length === 0">
          <td colspan="7">Không có dữ liệu phù hợp</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup>
import { ref, computed } from "vue";

// Dữ liệu mẫu
const orderItems = ref([
  { order_item_id: 1, order_id: 1, product_id: 1, quantity: 2, price: 50000, subtotal: 100000 },
  { order_item_id: 2, order_id: 1, product_id: 2, quantity: 1, price: 200000, subtotal: 200000 },
]);

const orderItem = ref({
  order_item_id: null,
  order_id: "",
  product_id: "",
  quantity: 1,
  price: 0,
  subtotal: 0,
});

const editMode = ref(false);
const searchText = ref("");
const filterType = ref("order_id");

// Lọc order items
const filteredOrderItems = computed(() => {
  const keyword = searchText.value.toLowerCase().trim();
  if (!keyword) return orderItems.value;
  return orderItems.value.filter(oi => {
    if (filterType.value === "order_id") return String(oi.order_id).includes(keyword);
    if (filterType.value === "product_id") return String(oi.product_id).includes(keyword);
    return false;
  });
});

// Hiển thị ID dạng OI001
function displayId(id) {
  return "OI" + id.toString().padStart(3, "0");
}

// Format tiền
function formatPrice(val) {
  return Number(val).toLocaleString("vi-VN");
}

// Cập nhật subtotal tự động
function updateSubtotal() {
  orderItem.value.subtotal = orderItem.value.quantity * orderItem.value.price;
}

// Thêm / sửa
function saveOrderItem() {
  updateSubtotal();
  if (editMode.value) {
    const index = orderItems.value.findIndex(oi => oi.order_item_id === orderItem.value.order_item_id);
    if (index !== -1) orderItems.value[index] = { ...orderItem.value };
    editMode.value = false;
  } else {
    const nextId = orderItems.value.length > 0 ? Math.max(...orderItems.value.map(oi => oi.order_item_id)) + 1 : 1;
    orderItems.value.push({ ...orderItem.value, order_item_id: nextId });
  }
  resetForm();
}

// Sửa
function editOrderItem(oi) {
  orderItem.value = { ...oi };
  editMode.value = true;
}

// Xóa
function deleteOrderItem(id) {
  orderItems.value = orderItems.value.filter(oi => oi.order_item_id !== id);
  resetForm();
}

// Hủy
function cancelEdit() {
  editMode.value = false;
  resetForm();
}

// Reset form
function resetForm() {
  const nextId = orderItems.value.length > 0 ? Math.max(...orderItems.value.map(oi => oi.order_item_id)) + 1 : 1;
  orderItem.value = {
    order_item_id: nextId,
    order_id: "",
    product_id: "",
    quantity: 1,
    price: 0,
    subtotal: 0,
  };
}

resetForm();
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
</style>
