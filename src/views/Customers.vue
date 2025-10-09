<template>
  <div class="customers-page">
    <h2>👥 Quản lý khách hàng</h2>

    <!-- 🔍 Thanh tìm kiếm -->
    <div class="search-bar">
      <label for="filterType">Tìm theo:</label>
      <select v-model="filterType" id="filterType">
        <option value="id">ID</option>
        <option value="name">Tên khách hàng</option>
        <option value="phone">Số điện thoại</option>
        <option value="email">Email</option>
      </select>

      <input type="text" v-model="searchText" placeholder="Nhập từ khóa..." />
    </div>

    <!-- 📝 Form thêm / sửa / xem -->
    <form class="customer-form" @submit.prevent="confirmSave">
      <div class="form-group">
        <label>ID</label>
        <input v-model="customer.id" type="text" readonly />
      </div>

      <div class="form-group">
        <label>Tên khách hàng</label>
        <input
          v-model="customer.name"
          type="text"
          placeholder="Tên khách hàng"
          :readonly="viewMode && !editMode"
          required
        />
      </div>

      <div class="form-group">
        <label>Số điện thoại</label>
        <input
          v-model="customer.phone"
          type="text"
          placeholder="Số điện thoại"
          :readonly="viewMode && !editMode"
        />
      </div>

      <div class="form-group">
        <label>Email</label>
        <input
          v-model="customer.email"
          type="email"
          placeholder="Email"
          :readonly="viewMode && !editMode"
        />
      </div>

      <div class="form-group">
        <label>Địa chỉ</label>
        <input
          v-model="customer.address"
          type="text"
          placeholder="Địa chỉ"
          :readonly="viewMode && !editMode"
        />
      </div>

      <button type="submit" v-if="!viewMode">{{ editMode ? "Cập nhật" : "Thêm mới" }}</button>
      <button type="button" v-if="editMode" @click="cancelEdit">Hủy</button>
      <button type="button" v-if="viewMode && !editMode" @click="closeView">Đóng</button>
    </form>

    <!-- 📋 Bảng hiển thị -->
    <table class="customer-table">
      <thead>
        <tr>
          <th>ID</th>
          <th>Tên khách hàng</th>
          <th>Số điện thoại</th>
          <th>Email</th>
          <th>Địa chỉ</th>
          <th>Hành động</th>
        </tr>
      </thead>
      <tbody>
        <tr
          v-for="c in filteredCustomers"
          :key="c.id"
          :class="{ active: customer.id === c.id && (editMode || viewMode) }"
          @click="viewCustomer(c)"
        >
          <td>{{ c.id }}</td>
          <td>{{ c.name }}</td>
          <td>{{ c.phone }}</td>
          <td>{{ c.email }}</td>
          <td>{{ c.address }}</td>
          <td>
            <button @click.stop="confirmEdit(c)">✏️</button>
            <button @click.stop="confirmDelete(c.id)">🗑️</button>
          </td>
        </tr>
        <tr v-if="filteredCustomers.length === 0">
          <td colspan="6">Không có dữ liệu phù hợp</td>
        </tr>
      </tbody>
    </table>

    <!-- ✅ Hộp xác nhận -->
    <div v-if="showConfirm" class="confirm-overlay">
      <div class="confirm-box">
        <h3>{{ confirmTitle }}</h3>
        <p>{{ confirmMessage }}</p>
        <div class="actions">
          <button class="btn-yes" @click="handleConfirmYes">Đồng ý</button>
          <button class="btn-no" @click="handleConfirmNo">Hủy</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from "vue";

// 🧩 Dữ liệu mẫu
const customers = ref([
  { id: "C01", name: "Nguyễn Văn Hùng", phone: "0909123456", email: "hung@gmail.com", address: "Hà Nội" },
  { id: "C02", name: "Trần Thị Hoa", phone: "0987654321", email: "hoa@yahoo.com", address: "Đà Nẵng" },
  { id: "C03", name: "Lê Minh Tuấn", phone: "0912345678", email: "tuan@gmail.com", address: "TP.HCM" },
]);

const customer = ref({ id: "", name: "", phone: "", email: "", address: "" });
const editMode = ref(false);
const viewMode = ref(false); // ✅ thêm biến xem chi tiết

const searchText = ref("");
const filterType = ref("id");

// ✅ Popup xác nhận
const showConfirm = ref(false);
const confirmTitle = ref("");
const confirmMessage = ref("");
let confirmAction = null;

// 🔍 Lọc khách hàng
const filteredCustomers = computed(() => {
  const keyword = searchText.value.toLowerCase().trim();
  if (!keyword) return customers.value;
  return customers.value.filter((c) =>
    c[filterType.value]?.toLowerCase().includes(keyword)
  );
});

// 🆕 Sinh ID mới
function generateNextId() {
  if (customers.value.length === 0) return "C01";
  const lastNum = Math.max(...customers.value.map((c) => parseInt(c.id.substring(1))));
  return "C" + (lastNum + 1).toString().padStart(2, "0");
}

// 💾 Lưu khách hàng
function saveCustomer() {
  if (editMode.value) {
    const index = customers.value.findIndex((c) => c.id === customer.value.id);
    if (index !== -1) customers.value[index] = { ...customer.value };
    editMode.value = false;
  } else {
    customers.value.push({ ...customer.value });
  }
  resetForm();
}

// 💾 Xác nhận trước khi lưu
function confirmSave() {
  openConfirm(
    editMode.value ? "Xác nhận cập nhật" : "Xác nhận thêm mới",
    editMode.value
      ? `Bạn có chắc muốn cập nhật khách hàng "${customer.value.name}" không?`
      : `Bạn có chắc muốn thêm khách hàng "${customer.value.name}" không?`,
    saveCustomer
  );
}

// ✏️ Chỉnh sửa
function editCustomer(c) {
  customer.value = { ...c };
  editMode.value = true;
  viewMode.value = false;
}

// ✏️ Xác nhận chỉnh sửa
function confirmEdit(c) {
  openConfirm("Xác nhận chỉnh sửa", `Bạn muốn chỉnh sửa khách hàng "${c.name}"?`, () =>
    editCustomer(c)
  );
}

// 👁️ Xem chi tiết khi click dòng
function viewCustomer(c) {
  if (!editMode.value) {
    customer.value = { ...c };
    viewMode.value = true;
  }
}

// 🔒 Đóng chế độ xem
function closeView() {
  viewMode.value = false;
  resetForm();
}

// 🗑️ Xóa khách hàng
function deleteCustomer(id) {
  customers.value = customers.value.filter((c) => c.id !== id);
  resetForm();
}

// 🗑️ Xác nhận xóa
function confirmDelete(id) {
  const target = customers.value.find((c) => c.id === id);
  openConfirm("Xác nhận xóa", `Bạn có chắc muốn xóa khách hàng "${target.name}"?`, () =>
    deleteCustomer(id)
  );
}

// ❌ Hủy
function cancelEdit() {
  editMode.value = false;
  resetForm();
}

// 🔄 Reset form
function resetForm() {
  customer.value = { id: generateNextId(), name: "", phone: "", email: "", address: "" };
}

// ⚡ Hàm chung cho popup
function openConfirm(title, message, action) {
  confirmTitle.value = title;
  confirmMessage.value = message;
  confirmAction = action;
  showConfirm.value = true;
}
function handleConfirmYes() {
  if (confirmAction) confirmAction();
  showConfirm.value = false;
}
function handleConfirmNo() {
  showConfirm.value = false;
}

resetForm();
</script>

<style scoped>
.customers-page {
  background: white;
  padding: 20px;
  border-radius: 10px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
}

/* 🔍 Thanh tìm kiếm */
.search-bar {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 15px;
}
.search-bar input {
  flex: 1;
  padding: 6px 10px;
  border: 1px solid #ccc;
  border-radius: 5px;
}
.search-bar select {
  padding: 6px 10px;
  border-radius: 5px;
  border: 1px solid #ccc;
}

/* 📝 Form */
.customer-form {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
  margin-bottom: 20px;
}

/* 📋 Bảng */
.customer-table {
  width: 100%;
  border-collapse: collapse;
}
.customer-table th,
.customer-table td {
  border: 1px solid #ddd;
  padding: 8px;
  text-align: center;
}
.customer-table th {
  background-color: #2c3e50;
  color: white;
}
.customer-table tr:hover {
  background-color: #f8f8f8;
  cursor: pointer;
}

.customer-table tr.active {
  background-color: #e7f1ff;
}

.form-actions {
  grid-column: span 2;
  display: flex;
  gap: 10px;
}
</style>
