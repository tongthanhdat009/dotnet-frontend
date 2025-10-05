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

    <!-- 📝 Form thêm / sửa -->
    <form class="category-form" @submit.prevent="saveCategory">
      <div class="form-group">
        <label>ID</label>
        <input v-model="category.id" type="text" readonly />
      </div>

      <div class="form-group">
        <label>Tên danh mục</label>
        <input v-model="category.name" type="text" placeholder="Tên danh mục" required />
      </div>

      <button type="submit">{{ editMode ? "Cập nhật" : "Thêm mới" }}</button>
      <button type="button" v-if="editMode" @click="cancelEdit">Hủy</button>
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
        <tr v-for="c in filteredCategories" :key="c.id">
          <td>{{ c.id }}</td>
          <td>{{ c.name }}</td>
          <td>
            <button @click="editCategory(c)">✏️</button>
            <button @click="deleteCategory(c.id)">🗑️</button>
          </td>
        </tr>
        <tr v-if="filteredCategories.length === 0">
          <td colspan="3">Không có dữ liệu phù hợp</td>
        </tr>
      </tbody>
    </table>
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

// 🆕 Sinh ID tự động
function generateNextId() {
  if (categories.value.length === 0) return "CAT01";
  const lastNum = Math.max(...categories.value.map((c) => parseInt(c.id.substring(3))));
  return "CAT" + (lastNum + 1).toString().padStart(2, "0");
}

// 💾 Lưu danh mục
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

// ✏️ Chỉnh sửa
function editCategory(c) {
  category.value = { ...c };
  editMode.value = true;
}

// 🗑️ Xóa
function deleteCategory(id) {
  categories.value = categories.value.filter((c) => c.id !== id);
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
</style>
