<template>
  <div class="suppliers-page">
    <h2>🏢 Quản lý nhà cung cấp</h2>

    <!-- 🔍 Thanh tìm kiếm -->
    <div class="search-bar">
      <label for="filterType">Tìm theo:</label>
      <select v-model="filterType" id="filterType">
        <option value="id">ID</option>
        <option value="name">Tên nhà cung cấp</option>
      </select>
      <input type="text" v-model="searchText" placeholder="Nhập từ khóa..." />
    </div>

    <!-- 📝 Form thêm / sửa -->
    <form class="supplier-form" @submit.prevent="saveSupplier">
      <div class="form-group">
        <label>ID</label>
        <input type="text" :value="displayId(supplier.id)" readonly />
      </div>

      <div class="form-group">
        <label>Tên nhà cung cấp</label>
        <input v-model="supplier.name" type="text" required placeholder="Nhập tên nhà cung cấp" />
      </div>

      <div class="form-group">
        <label>Phone</label>
        <input v-model="supplier.phone" type="text" placeholder="Nhập số điện thoại" />
      </div>

      <div class="form-group">
        <label>Email</label>
        <input v-model="supplier.email" type="email" placeholder="Nhập email" />
      </div>

      <div class="form-group">
        <label>Address</label>
        <input v-model="supplier.address" type="text" placeholder="Nhập địa chỉ" />
      </div>

      <button type="submit">{{ editMode ? "Cập nhật" : "Thêm mới" }}</button>
      <button type="button" v-if="editMode" @click="cancelEdit">Hủy</button>
    </form>

    <!-- 📋 Bảng hiển thị -->
    <table class="supplier-table">
      <thead>
        <tr>
          <th>ID</th>
          <th>Tên nhà cung cấp</th>
          <th>Phone</th>
          <th>Email</th>
          <th>Address</th>
          <th>Hành động</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="s in filteredSuppliers" :key="s.id">
          <td>{{ displayId(s.id) }}</td>
          <td>{{ s.name }}</td>
          <td>{{ s.phone }}</td>
          <td>{{ s.email }}</td>
          <td>{{ s.address }}</td>
          <td>
            <button @click="editSupplier(s)">✏️</button>
            <button @click="deleteSupplier(s.id)">🗑️</button>
          </td>
        </tr>
        <tr v-if="filteredSuppliers.length === 0">
          <td colspan="6">Không có dữ liệu phù hợp</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup>
import { ref, computed } from "vue";

// Dữ liệu mẫu suppliers
const suppliers = ref([
  { id: 1, name: "Samsung VN", phone: "0901234567", email: "samsung@vn.com", address: "Hà Nội" },
  { id: 2, name: "Pepsi VN", phone: "0912345678", email: "pepsi@vn.com", address: "TP.HCM" },
  { id: 3, name: "Công ty ABC", phone: "0923456789", email: "abc@company.com", address: "Đà Nẵng" },
]);

const supplier = ref({ id: null, name: "", phone: "", email: "", address: "" });
const editMode = ref(false);
const searchText = ref("");
const filterType = ref("id");

// Lọc danh sách
const filteredSuppliers = computed(() => {
  const keyword = searchText.value.toLowerCase().trim();
  if (!keyword) return suppliers.value;
  return suppliers.value.filter((s) => {
    const field = s[filterType.value];
    if (field === undefined || field === null) return false;
    return String(field).toLowerCase().includes(keyword);
  });
});

// Hiển thị ID dạng S001
function displayId(id) {
  return "S" + id.toString().padStart(3, "0");
}

// Lưu nhà cung cấp
function saveSupplier() {
  if (editMode.value) {
    const index = suppliers.value.findIndex((s) => s.id === supplier.value.id);
    if (index !== -1) suppliers.value[index] = { ...supplier.value };
    editMode.value = false;
  } else {
    const nextId = suppliers.value.length > 0 ? Math.max(...suppliers.value.map(s => s.id)) + 1 : 1;
    suppliers.value.push({ ...supplier.value, id: nextId });
  }
  resetForm();
}

// Sửa
function editSupplier(s) {
  supplier.value = { ...s };
  editMode.value = true;
}

// Xóa
function deleteSupplier(id) {
  suppliers.value = suppliers.value.filter((s) => s.id !== id);
  resetForm();
}

// Hủy edit
function cancelEdit() {
  editMode.value = false;
  resetForm();
}

// Reset form
function resetForm() {
  const nextId = suppliers.value.length > 0 ? Math.max(...suppliers.value.map(s => s.id)) + 1 : 1;
  supplier.value = { id: nextId, name: "", phone: "", email: "", address: "" };
}

resetForm();
</script>

<style scoped>
.suppliers-page {
  background: white;
  padding: 20px;
  border-radius: 10px;
  box-shadow: 0 2px 6px rgba(0,0,0,0.1);
}
.supplier-form {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
  margin-bottom: 20px;
}
.supplier-table {
  width: 100%;
  border-collapse: collapse;
}
.supplier-table th,
.supplier-table td {
  border: 1px solid #ddd;
  padding: 8px;
  text-align: center;
}
.supplier-table th {
  background-color: #2c3e50;
  color: white;
}
</style>
