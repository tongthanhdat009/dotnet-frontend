<template>
  <div class="categories-page">
    <h2>🏷️ Quản lý danh mục</h2>

    <!-- 🔍 Thanh tìm kiếm -->
    <div class="search-bar">
      <label for="filterType">Tìm theo:</label>
      <select v-model="filterType" id="filterType">
        <option value="id">ID</option>
        <option value="name">Tên danh mục</option>
      </select>

      <input type="text" v-model="searchText" placeholder="Nhập từ khóa..." />
    </div>

    <!-- 📝 Form thêm / sửa / xem -->
    <form class="category-form" @submit.prevent="confirmSave">
      <div class="form-group">
        <label>ID</label>
        <input v-model="category.id" type="text" readonly />
      </div>

      <div class="form-group">
        <label>Tên danh mục</label>
        <input v-model="category.name" type="text" :readonly="viewMode && !editMode" placeholder="Tên danh mục" required />
      </div>

      <button type="submit" v-if="!viewMode">{{ editMode ? "Cập nhật" : "Thêm mới" }}</button>
      <button type="button" v-if="editMode" @click="cancelEdit">Hủy</button>
      <button type="button" v-if="viewMode && !editMode" @click="closeView">Đóng</button>
    </form>

    <!-- 📋 Bảng hiển thị -->
    <table class="category-table">
      <thead>
        <tr>
          <th>ID</th>
          <th>Tên danh mục</th>
          <th>Hành động</th>
        </tr>
      </thead>
      <tbody>
        <tr
          v-for="c in filteredCategories"
          :key="c.id"
          :class="{ active: category.id === c.id && (editMode || viewMode) }"
          @click="viewCategory(c)"
        >
          <td>{{ c.id }}</td>
          <td>{{ c.name }}</td>
          <td>
            <button @click.stop="confirmEdit(c)">✏️</button>
            <button @click.stop="confirmDelete(c.id)">🗑️</button>
          </td>
        </tr>
        <tr v-if="filteredCategories.length === 0">
          <td colspan="3">Không có dữ liệu phù hợp</td>
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
const categories = ref([
  { id: "CAT01", name: "Điện thoại" },
  { id: "CAT02", name: "Laptop" },
  { id: "CAT03", name: "Phụ kiện" },
]);

const category = ref({ id: "", name: "" });
const editMode = ref(false);
const viewMode = ref(false); // 👁️ thêm biến chế độ xem

const searchText = ref("");
const filterType = ref("id");

// 🔍 Lọc danh mục
const filteredCategories = computed(() => {
  const keyword = searchText.value.toLowerCase().trim();
  if (!keyword) return categories.value;
  return categories.value.filter((c) =>
    c[filterType.value]?.toLowerCase().includes(keyword)
  );
});

// ✅ Biến xác nhận
const showConfirm = ref(false);
const confirmTitle = ref("");
const confirmMessage = ref("");
let confirmAction = null;

// 🆕 Sinh ID tự động
function generateNextId() {
  if (categories.value.length === 0) return "CAT01";
  const lastNum = Math.max(...categories.value.map((c) => parseInt(c.id.substring(3))));
  return "CAT" + (lastNum + 1).toString().padStart(2, "0");
}

// ⚡ Mở popup xác nhận
function openConfirm(title, message, action) {
  confirmTitle.value = title;
  confirmMessage.value = message;
  confirmAction = action;
  showConfirm.value = true;
}

// 🔘 Xử lý xác nhận
function handleConfirmYes() {
  if (confirmAction) confirmAction();
  showConfirm.value = false;
}
function handleConfirmNo() {
  showConfirm.value = false;
}

// 💾 Lưu danh mục (gốc)
function saveCategory() {
  if (editMode.value) {
    const index = categories.value.findIndex((c) => c.id === category.value.id);
    if (index !== -1) categories.value[index] = { ...category.value };
    editMode.value = false;
  } else {
    categories.value.push({ ...category.value });
  }
  resetForm();
}

// 💾 Xác nhận trước khi lưu
function confirmSave() {
  openConfirm(
    editMode.value ? "Xác nhận cập nhật" : "Xác nhận thêm mới",
    editMode.value
      ? `Bạn có chắc muốn cập nhật danh mục "${category.value.name}" không?`
      : `Bạn có chắc muốn thêm danh mục "${category.value.name}" không?`,
    saveCategory
  );
}

// ✏️ Chỉnh sửa
function editCategory(c) {
  category.value = { ...c };
  editMode.value = true;
  viewMode.value = false;
}

// ✏️ Xác nhận chỉnh sửa
function confirmEdit(c) {
  openConfirm("Xác nhận chỉnh sửa", `Bạn muốn chỉnh sửa danh mục "${c.name}"?`, () =>
    editCategory(c)
  );
}

// 🗑️ Xóa
function deleteCategory(id) {
  categories.value = categories.value.filter((c) => c.id !== id);
  resetForm();
}

// 🗑️ Xác nhận xóa
function confirmDelete(id) {
  const target = categories.value.find((c) => c.id === id);
  openConfirm("Xác nhận xóa", `Bạn có chắc muốn xóa danh mục "${target.name}"?`, () =>
    deleteCategory(id)
  );
}

// 👁️ Xem chi tiết khi click dòng
function viewCategory(c) {
  if (!editMode.value) {
    category.value = { ...c };
    viewMode.value = true;
  }
}

// 🔒 Đóng chế độ xem
function closeView() {
  viewMode.value = false;
  resetForm();
}

// ❌ Hủy
function cancelEdit() {
  editMode.value = false;
  resetForm();
}

// 🔄 Reset form
function resetForm() {
  category.value = { id: generateNextId(), name: "" };
}

resetForm();
</script>

<style scoped>
.categories-page {
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
.category-form {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
  margin-bottom: 20px;
}

/* 📋 Bảng */
.category-table {
  width: 100%;
  border-collapse: collapse;
}
.category-table th,
.category-table td {
  border: 1px solid #ddd;
  padding: 8px;
  text-align: center;
}
.category-table th {
  background-color: #2c3e50;
  color: white;
}

.category-table tr:hover {
  background-color: #f8f8f8;
  cursor: pointer;
}

.category -table tr.active {
  background-color: #e7f1ff;
}

.form-actions {
  grid-column: span 2;
  display: flex;
  gap: 10px;
}
</style>
