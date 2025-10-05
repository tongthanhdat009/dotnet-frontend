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

    <!-- 📝 Form thêm / sửa -->
    <form class="customer-form" @submit.prevent="saveCustomer">
      <div class="form-group">
        <label>ID</label>
        <input v-model="customer.id" type="text" readonly />
      </div>

      <div class="form-group">
        <label>Tên khách hàng</label>
        <input v-model="customer.name" type="text" placeholder="Tên khách hàng" required />
      </div>

      <div class="form-group">
        <label>Số điện thoại</label>
        <input v-model="customer.phone" type="text" placeholder="Số điện thoại" />
      </div>

      <div class="form-group">
        <label>Email</label>
        <input v-model="customer.email" type="email" placeholder="Email" />
      </div>

      <div class="form-group">
        <label>Địa chỉ</label>
        <input v-model="customer.address" type="text" placeholder="Địa chỉ" />
      </div>

      <button type="submit">{{ editMode ? "Cập nhật" : "Thêm mới" }}</button>
      <button type="button" v-if="editMode" @click="cancelEdit">Hủy</button>
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
        <tr v-for="c in filteredCustomers" :key="c.id">
          <td>{{ c.id }}</td>
          <td>{{ c.name }}</td>
          <td>{{ c.phone }}</td>
          <td>{{ c.email }}</td>
          <td>{{ c.address }}</td>
          <td>
            <button @click="editCustomer(c)">✏️</button>
            <button @click="deleteCustomer(c.id)">🗑️</button>
          </td>
        </tr>
        <tr v-if="filteredCustomers.length === 0">
          <td colspan="6">Không có dữ liệu phù hợp</td>
        </tr>
      </tbody>
    </table>
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

const searchText = ref("");
const filterType = ref("id");

// 🔍 Lọc khách hàng theo tiêu chí
const filteredCustomers = computed(() => {
  const keyword = searchText.value.toLowerCase().trim();
  if (!keyword) return customers.value;

  return customers.value.filter((c) =>
    c[filterType.value]?.toLowerCase().includes(keyword)
  );
});

// 🆕 Sinh ID mới (C01, C02,...)
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

// ✏️ Chỉnh sửa
function editCustomer(c) {
  customer.value = { ...c };
  editMode.value = true;
}

// 🗑️ Xóa khách hàng
function deleteCustomer(id) {
  customers.value = customers.value.filter((c) => c.id !== id);
  resetForm();
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

resetForm();
</script>

<style scoped>
.customers-page {
  background: white;
  padding: 20px;
  border-radius: 10px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
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
</style>
