<template>
  <div class="users-page">
    <h2>👤 Quản lý người dùng</h2>

    <!-- Thanh tìm kiếm -->
    <div class="search-bar">
      <label for="filterType">Tìm theo:</label>
      <select v-model="filterType" id="filterType">
        <option value="id">ID</option>
        <option value="name">Tên đăng nhập</option>
        <option value="full_name">Họ và tên</option>
      </select>

      <input
        type="text"
        v-model="searchText"
        placeholder="Nhập từ khóa..."
      />
    </div>

    <!-- Form thêm / sửa -->
    <form class="user-form" @submit.prevent="saveUser">
      <div class="form-group">
        <label>ID</label>
        <input v-model="user.id" type="text" readonly />
      </div>

      <div class="form-group">
        <label>Tên đăng nhập</label>
        <input v-model="user.name" type="text" placeholder="Tên đăng nhập" required />
      </div>

      <div class="form-group">
        <label>Mật khẩu</label>
        <input v-model="user.password" type="text" placeholder="Mật khẩu" required />
      </div>

      <div class="form-group">
        <label>Họ và tên</label>
        <input v-model="user.full_name" type="text" placeholder="Họ và tên" />
      </div>

      <div class="form-group">
        <label>Vai trò</label>
        <select v-model="user.role">
          <option value="admin">Admin</option>
          <option value="staff">Staff</option>
        </select>
      </div>

      <button type="submit">{{ editMode ? "Cập nhật" : "Thêm mới" }}</button>
      <button type="button" v-if="editMode" @click="cancelEdit">Hủy</button>
    </form>

    <!-- Bảng hiển thị -->
    <table class="user-table">
      <thead>
        <tr>
          <th>ID</th>
          <th>Tên đăng nhập</th>
          <th>Mật khẩu</th>
          <th>Họ và tên</th>
          <th>Vai trò</th>
          <th>Hành động</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="u in filteredUsers" :key="u.id">
          <td>{{ u.id }}</td>
          <td>{{ u.name }}</td>
          <td>{{ u.password }}</td>
          <td>{{ u.full_name }}</td>
          <td>{{ u.role }}</td>
          <td>
            <button @click="editUser(u)">✏️</button>
            <button @click="deleteUser(u.id)">🗑️</button>
          </td>
        </tr>
        <tr v-if="filteredUsers.length === 0">
          <td colspan="6">Không có dữ liệu phù hợp</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup>
import { ref, computed } from "vue";

const users = ref([
  { id: "U01", name: "admin01", password: "123", full_name: "Nguyễn Văn A", role: "admin" },
  { id: "U02", name: "staff01", password: "abc", full_name: "Trần Thị B", role: "staff" },
  { id: "U03", name: "longstaff", password: "456", full_name: "Phạm Văn Long", role: "staff" },
]);

const user = ref({ id: "", name: "", password: "", full_name: "", role: "staff" });
const editMode = ref(false);

const searchText = ref("");
const filterType = ref("id");

// 🔍 Lọc danh sách user theo input
const filteredUsers = computed(() => {
  const keyword = searchText.value.toLowerCase().trim();
  if (!keyword) return users.value;

  return users.value.filter((u) =>
    u[filterType.value].toLowerCase().includes(keyword)
  );
});

// 🆕 Sinh ID mới
function generateNextId() {
  if (users.value.length === 0) return "U01";
  const lastNum = Math.max(...users.value.map((u) => parseInt(u.id.substring(1))));
  return "U" + (lastNum + 1).toString().padStart(2, "0");
}

// 💾 Lưu user
function saveUser() {
  if (editMode.value) {
    const index = users.value.findIndex((u) => u.id === user.value.id);
    if (index !== -1) users.value[index] = { ...user.value };
    editMode.value = false;
  } else {
    users.value.push({ ...user.value });
  }
  resetForm();
}

// ✏️ Sửa
function editUser(u) {
  user.value = { ...u };
  editMode.value = true;
}

// 🗑️ Xóa
function deleteUser(id) {
  users.value = users.value.filter((u) => u.id !== id);
  resetForm();
}

// ❌ Hủy sửa
function cancelEdit() {
  editMode.value = false;
  resetForm();
}

// 🔄 Reset form
function resetForm() {
  user.value = {
    id: generateNextId(),
    name: "",
    password: "",
    full_name: "",
    role: "staff",
  };
}

resetForm();
</script>

<style scoped>
.users-page {
  background: white;
  padding: 20px;
  border-radius: 10px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
}
.user-form {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
  margin-bottom: 20px;
}
.user-table {
  width: 100%;
  border-collapse: collapse;
}
.user-table th,
.user-table td {
  border: 1px solid #ddd;
  padding: 8px;
  text-align: center;
}
.user-table th {
  background-color: #2c3e50;
  color: white;
}
</style>
