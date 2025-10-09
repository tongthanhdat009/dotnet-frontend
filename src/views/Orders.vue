<template>
  <div class="orders-page">
    <h2>🧾 Quản lý đơn hàng</h2>

    <!-- 🔍 Thanh tìm kiếm -->
    <div class="search-bar">
      <label for="filterType">Tìm theo:</label>
      <select v-model="filterType" id="filterType">
        <option value="order_id">ID</option>
        <option value="customer_id">Customer ID</option>
      </select>
      <input type="text" v-model="searchText" placeholder="Nhập từ khóa..." />
    </div>

    <!-- 📝 Form thêm / sửa / xem -->
    <form class="order-form" @submit.prevent="openConfirm(editMode ? 'edit' : 'add')">
      <div class="form-group">
        <label>ID</label>
        <input type="text" :value="displayId(order.order_id)" readonly />
      </div>

      <div class="form-group">
        <label>Customer ID</label>
        <input v-model="order.customer_id" type="number" :readonly="viewMode" required />
      </div>

      <div class="form-group">
        <label>User ID</label>
        <input v-model="order.user_id" type="number" :readonly="viewMode" required />
      </div>

      <div class="form-group">
        <label>Promo ID</label>
        <input v-model="order.promo_id" type="number" :readonly="viewMode" placeholder="Có thể để trống" />
      </div>

      <div class="form-group">
        <label>Ngày đặt</label>
        <Flatpickr
          v-model="order.order_date"
          :config="{ enableTime: true, dateFormat: 'Y-m-d H:i' }"
          placeholder="Chọn ngày giờ"
          :disabled="viewMode"
        />
      </div>

      <div class="form-group">
        <label>Trạng thái</label>
        <select v-model="order.status" :disabled="viewMode">
          <option value="pending">Pending</option>
          <option value="paid">Paid</option>
          <option value="canceled">Canceled</option>
        </select>
      </div>

      <div class="form-group">
        <label>Tổng tiền</label>
        <input v-model="order.total_amount" type="number" step="0.01" :readonly="viewMode" />
      </div>

      <div class="form-group">
        <label>Giảm giá</label>
        <input v-model="order.discount_amount" type="number" step="0.01" :readonly="viewMode" />
      </div>

      <!-- 🔘 Các nút hành động -->
      <button type="submit" v-if="!viewMode">{{ editMode ? "Cập nhật" : "Thêm mới" }}</button>
      <button type="button" v-if="editMode" @click="cancelEdit">Hủy</button>
      <button type="button" v-if="viewMode" @click="closeView">Đóng</button>
    </form>

    <!-- 📋 Bảng hiển thị -->
    <table class="order-table">
      <thead>
        <tr>
          <th>ID</th>
          <th>Customer ID</th>
          <th>User ID</th>
          <th>Promo ID</th>
          <th>Ngày đặt</th>
          <th>Trạng thái</th>
          <th>Tổng tiền</th>
          <th>Giảm giá</th>
          <th>Hành động</th>
        </tr>
      </thead>
      <tbody>
        <tr
          v-for="o in filteredOrders"
          :key="o.order_id"
          @click="viewOrder(o)"
          :class="{ active: viewMode && order.order_id === o.order_id }"
        >
          <td>{{ displayId(o.order_id) }}</td>
          <td>{{ o.customer_id }}</td>
          <td>{{ o.user_id }}</td>
          <td>{{ o.promo_id || '-' }}</td>
          <td>{{ o.order_date }}</td>
          <td>{{ o.status }}</td>
          <td>{{ formatPrice(o.total_amount) }}</td>
          <td>{{ formatPrice(o.discount_amount) }}</td>
          <td>
            <button @click.stop="editOrder(o)">✏️</button>
            <button @click.stop="openConfirm('delete', o.order_id)">🗑️</button>
          </td>
        </tr>
        <tr v-if="filteredOrders.length === 0">
          <td colspan="9">Không có dữ liệu phù hợp</td>
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
import Flatpickr from "vue-flatpickr-component";
import "flatpickr/dist/flatpickr.css";

// Dữ liệu mẫu
const orders = ref([
  { order_id: 1, customer_id: 101, user_id: 1, promo_id: 1, order_date: "2025-10-05 10:00", status: "pending", total_amount: 500000, discount_amount: 50000 },
  { order_id: 2, customer_id: 102, user_id: 2, promo_id: null, order_date: "2025-10-06 14:30", status: "paid", total_amount: 200000, discount_amount: 0 },
]);

const order = ref({
  order_id: null,
  customer_id: "",
  user_id: "",
  promo_id: null,
  order_date: "",
  status: "pending",
  total_amount: 0,
  discount_amount: 0,
});

const editMode = ref(false);
const viewMode = ref(false);
const searchText = ref("");
const filterType = ref("order_id");

// popup xác nhận
const showConfirm = ref(false);
const confirmType = ref("");
const confirmMessage = ref("");
const pendingId = ref(null);

function openConfirm(type, id = null) {
  confirmType.value = type;
  pendingId.value = id;

  if (type === "add") confirmMessage.value = "Bạn có chắc muốn thêm đơn hàng này không?";
  else if (type === "edit") confirmMessage.value = "Bạn có chắc muốn cập nhật thông tin đơn hàng này không?";
  else if (type === "delete") confirmMessage.value = "Bạn có chắc muốn xóa đơn hàng này không?";

  showConfirm.value = true;
}

function closeConfirm() {
  showConfirm.value = false;
  confirmType.value = "";
  pendingId.value = null;
}

function confirmAction() {
  if (confirmType.value === "add" || confirmType.value === "edit") saveOrderConfirmed();
  else if (confirmType.value === "delete") deleteOrderConfirmed(pendingId.value);
  closeConfirm();
}

// Lọc tìm kiếm
const filteredOrders = computed(() => {
  const keyword = searchText.value.toLowerCase().trim();
  if (!keyword) return orders.value;
  return orders.value.filter(o => {
    if (filterType.value === "order_id") return displayId(o.order_id).toLowerCase().includes(keyword);
    if (filterType.value === "customer_id") return String(o.customer_id).includes(keyword);
    return false;
  });
});

function displayId(id) {
  return `O${id.toString().padStart(3, "0")}`;
}

function formatPrice(val) {
  return Number(val).toLocaleString("vi-VN");
}

// ✅ Chức năng xem chi tiết
function viewOrder(o) {
  if (!editMode.value) {
    order.value = { ...o };
    viewMode.value = true;
  }
}

function closeView() {
  viewMode.value = false;
  resetForm();
}

// Thêm / sửa thực sự sau khi xác nhận
function saveOrderConfirmed() {
  if (editMode.value) {
    const index = orders.value.findIndex(o => o.order_id === order.value.order_id);
    if (index !== -1) orders.value[index] = { ...order.value };
    editMode.value = false;
  } else {
    const nextId = orders.value.length > 0 ? Math.max(...orders.value.map(o => o.order_id)) + 1 : 1;
    orders.value.push({ ...order.value, order_id: nextId });
  }
  resetForm();
}

// Xóa thực sự sau xác nhận
function deleteOrderConfirmed(id) {
  orders.value = orders.value.filter(o => o.order_id !== id);
  resetForm();
}

function editOrder(o) {
  order.value = { ...o };
  editMode.value = true;
  viewMode.value = false;
}

function cancelEdit() {
  editMode.value = false;
  resetForm();
}

function resetForm() {
  const nextId = orders.value.length > 0 ? Math.max(...orders.value.map(o => o.order_id)) + 1 : 1;
  order.value = {
    order_id: nextId,
    customer_id: "",
    user_id: "",
    promo_id: null,
    order_date: "",
    status: "pending",
    total_amount: 0,
    discount_amount: 0,
  };
}
resetForm();
</script>

<style scoped>
.orders-page {
  background: white;
  padding: 20px;
  border-radius: 10px;
  box-shadow: 0 2px 6px rgba(0,0,0,0.1);
}
.order-form {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
  margin-bottom: 20px;
}
.order-table {
  width: 100%;
  border-collapse: collapse;
}
.order-table th,
.order-table td {
  border: 1px solid #ddd;
  padding: 8px;
  text-align: center;
}
.order-table th {
  background-color: #2c3e50;
  color: white;
}
</style>
