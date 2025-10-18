<template>
  <div class="users-page">
    <h2>👤 Quản lý người dùng</h2>

    <!-- 🔍 Thanh tìm kiếm -->
    <div class="search-bar">
      <label for="filterType">Tìm theo:</label>
      <select v-model="filterType" id="filterType">
        <option value="id">ID</option>
        <option value="name">Tên đăng nhập</option>
        <option value="full_name">Họ và tên</option>
      </select>
      <input type="text" v-model="searchText" placeholder="Nhập từ khóa..." />
    </div>

    <!-- 📝 Form thêm / sửa / xem -->
    <form class="user-form" @submit.prevent="confirmSave">
      <div class="form-group">
        <label>ID</label>
        <input v-model="user.id" type="text" readonly />
      </div>

      <div class="form-group">
        <label>Tên đăng nhập</label>
        <input
          v-model="user.name"
          type="text"
          :readonly="viewMode && !editMode"
          placeholder="Tên đăng nhập"
          required
        />
      </div>

      <div class="form-group">
        <label>Mật khẩu</label>
        <input
          v-model="user.password"
          type="text"
          :readonly="viewMode && !editMode"
          placeholder="Mật khẩu"
          required
        />
      </div>

      <div class="form-group">
        <label>Họ và tên</label>
        <input
          v-model="user.full_name"
          type="text"
          :readonly="viewMode && !editMode"
          placeholder="Họ và tên"
        />
      </div>

      <div class="form-group">
        <label>Vai trò</label>
        <select v-model="user.role" :disabled="viewMode && !editMode">
          <option value="admin">Admin</option>
          <option value="staff">Staff</option>
        </select>
      </div>

      <!-- Nút hành động -->
        <button type="submit" v-if="!viewMode">{{ editMode ? "Cập nhật" : "Thêm mới" }}</button>
        <button type="button" v-if="editMode" @click="cancelEdit">Hủy</button>
        <button type="button" v-if="viewMode && !editMode" @click="closeView">Đóng</button>
      
    </form>

    <!-- 📋 Bảng hiển thị -->
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
        <tr
          v-for="u in filteredUsers"
          :key="u.id"
          :class="{ active: user.id === u.id && (editMode || viewMode) }"
          @click="viewUser(u)"
        >
          <td>{{ u.id }}</td>
          <td>{{ u.name }}</td>
          <td>{{ u.password }}</td>
          <td>{{ u.full_name }}</td>
          <td>{{ u.role }}</td>
          <td>
            <button @click.stop="confirmEdit(u)">✏️</button>
            <button @click.stop="confirmDelete(u)">🗑️</button>
          </td>
        </tr>
        <tr v-if="filteredUsers.length === 0">
          <td colspan="6">Không có dữ liệu phù hợp</td>
        </tr>
      </tbody>
    </table>

    <!-- ⚡ Popup xác nhận -->
    <div v-if="showConfirm" class="confirm-overlay">
      <div class="confirm-box">
        <h3>{{ confirmTitle }}</h3>
        <p>{{ confirmMessage }}</p>
        <div class="actions">
          <button @click="handleConfirm" class="btn-yes">Xác nhận</button>
          <button @click="closeConfirm" class="btn-no">Hủy</button>
        </div>
      </div>
    </div>
  </div>
</template>
<script setup>
import { ref, computed, onMounted } from "vue";
import { getUsers } from "../api/Users.js";

// ===== State =====
const users = ref([]); // không còn seed dữ liệu mẫu
const user  = ref({ id: "", name: "", password: "", full_name: "", role: "staff" });

const editMode = ref(false);
const viewMode = ref(false);
const searchText = ref("");
const filterType = ref("id");

const loading = ref(true);
const errorMessage = ref("");

// ===== Mapping DTO <-> UI =====
// Giả sử Role: 1=admin, 2=staff (điều chỉnh nếu bảng ROLE của bạn khác)
const roleIdToName = (id) => (id === 1 ? "admin" : "staff");

function toUi(dto) {
  return {
    id:        String(dto.UserId ?? ""),
    name:      dto.Username ?? "",
    // ⚠️ API thật KHÔNG nên trả Password; ở đây map theo DTO bạn đang dùng để hiển thị
    password:  dto.Password ?? "",
    full_name: dto.FullName ?? "",
    role:      roleIdToName(dto.Role ?? 2),
  };
}

// ===== Fetch =====
async function loadUsers() {
  try {
    loading.value = true;
    errorMessage.value = "";
    const data = await getUsers();
    users.value = Array.isArray(data) ? data.map(toUi) : [];
  } catch (err) {
    console.error("Get users error:", err);
    errorMessage.value = err?.response?.data?.message || "Không thể tải danh sách người dùng.";
  } finally {
    loading.value = false;
  }
}

onMounted(loadUsers);

// ===== Filter =====
const filteredUsers = computed(() => {
  const list = Array.isArray(users.value) ? users.value : [];
  const kw = searchText.value.toLowerCase().trim();
  if (!kw) return list;

  return list.filter((u) => {
    const val = String(u[filterType.value] ?? "").toLowerCase();
    return val.includes(kw);
  });
});

// ===== Popup xác nhận (giữ nguyên khung, bạn sẽ nối API add/update/delete sau) =====
const showConfirm = ref(false);
const confirmTitle = ref("");
const confirmMessage = ref("");
let confirmAction = null;

// Thêm hoặc sửa (hiện tại chưa gọi API — bạn có thể gắn add/update vào đây sau)
function confirmSave() {
  confirmTitle.value = editMode.value ? "Xác nhận cập nhật" : "Xác nhận thêm mới";
  confirmMessage.value = editMode.value
    ? "Bạn có chắc muốn cập nhật thông tin người dùng này?"
    : "Bạn có chắc muốn thêm người dùng mới?";
  confirmAction = saveUser;
  showConfirm.value = true;
}

function saveUser() {
  // TODO: gắn add/update API tại đây khi bạn sẵn sàng
  // Hiện chỉ reset form để demo gọi GET
  editMode.value = false;
  resetForm();
  showConfirm.value = false;
}

// Sửa (chỉ bật form edit)
function confirmEdit(u) {
  confirmTitle.value = "Xác nhận chỉnh sửa";
  confirmMessage.value = "Bạn có chắc muốn chỉnh sửa thông tin người dùng này?";
  confirmAction = () => editUser(u);
  showConfirm.value = true;
}
function editUser(u) {
  user.value = { ...u };
  editMode.value = true;
  viewMode.value = false;
  showConfirm.value = false;
}

// Xem
function viewUser(u) {
  if (!editMode.value) {
    user.value = { ...u };
    viewMode.value = true;
  }
}
function closeView() {
  viewMode.value = false;
  resetForm();
}

// Xóa (chưa gắn API — bạn sẽ gắn sau)
function confirmDelete(u) {
  confirmTitle.value = "Xác nhận xóa";
  confirmMessage.value = `Bạn có chắc muốn xóa người dùng "${u.name}" không?`;
  confirmAction = () => doDelete(u.id);
  showConfirm.value = true;
}
function doDelete(id) {
  // TODO: gọi API delete tại đây, sau đó loadUsers()
  showConfirm.value = false;
}

// Hủy sửa
function cancelEdit() {
  editMode.value = false;
  resetForm();
}

// Popup controls
function handleConfirm() {
  if (confirmAction) confirmAction();
}
function closeConfirm() {
  showConfirm.value = false;
}

// Reset form
function resetForm() {
  user.value = { id: "", name: "", password: "", full_name: "", role: "staff" };
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

.user-table tr:hover {
  background-color: #f8f8f8;
  cursor: pointer;
}

.user-table tr.active {
  background-color: #e7f1ff;
}

.form-actions {
  grid-column: span 2;
  display: flex;
  gap: 10px;
}
</style>
