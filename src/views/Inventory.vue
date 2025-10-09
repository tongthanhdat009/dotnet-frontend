<template>
  <div class="inventory-page">
    <h2>📦 Quản lý tồn kho</h2>

    <!-- 🔍 Thanh tìm kiếm -->
    <div class="search-bar">
      <label for="filterType">Tìm theo:</label>
      <select v-model="filterType" id="filterType">
        <option value="inventory_id">ID</option>
        <option value="product_id">Tên sản phẩm</option>
      </select>
      <input type="text" v-model="searchText" placeholder="Nhập từ khóa..." />
    </div>

    <!-- 📝 Form thêm / sửa -->
    <form class="inventory-form" @submit.prevent="confirmAction('save')">
      <div class="form-group">
        <label>ID</label>
        <input type="text" :value="displayId(inventory.inventory_id)" readonly />
      </div>

      <div class="form-group">
        <label>Sản phẩm</label>
        <select v-model="inventory.product_id" :disabled="viewMode" required>
          <option disabled value="">-- Chọn sản phẩm --</option>
          <option v-for="p in products" :key="p.product_id" :value="p.product_id">
            {{ p.product_name }}
          </option>
        </select>
      </div>

      <div class="form-group">
        <label>Số lượng</label>
        <input v-model="inventory.quantity" type="number" min="0" :readonly="viewMode" required />
      </div>

      <button type="submit" v-if="!viewMode">{{ editMode ? "Cập nhật" : "Thêm mới" }}</button>
      <button type="button" v-if="editMode" @click="cancelEdit">Hủy</button>
      <button type="button" v-if="viewMode" @click="closeView">Đóng</button>
    </form>

    <!-- 📋 Bảng hiển thị -->
    <table class="inventory-table">
      <thead>
        <tr>
          <th>ID</th>
          <th>Sản phẩm</th>
          <th>Số lượng</th>
          <th>Cập nhật lần cuối</th>
          <th>Hành động</th>
        </tr>
      </thead>
      <tbody>
        <tr
          v-for="i in filteredInventory"
          :key="i.inventory_id"
          @click="viewInventory(i)"
          :class="{ active: viewMode && inventory.inventory_id === i.inventory_id }"
        >
          <td>{{ displayId(i.inventory_id) }}</td>
          <td>{{ getProductName(i.product_id) }}</td>
          <td>{{ i.quantity }}</td>
          <td>{{ i.updated_at }}</td>
          <td>
            <button @click.stop="editInventory(i)">✏️</button>
            <button @click.stop="confirmAction('delete', i.inventory_id)">🗑️</button>
          </td>
        </tr>
        <tr v-if="filteredInventory.length === 0">
          <td colspan="5">Không có dữ liệu phù hợp</td>
        </tr>
      </tbody>
    </table>

    <!-- 🧾 Hộp xác nhận -->
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

// Dữ liệu sản phẩm giả lập
const products = ref([
  { product_id: 1, product_name: "Coca Cola lon" },
  { product_id: 2, product_name: "Pepsi lon" },
  { product_id: 3, product_name: "Trà Xanh 0 độ" },
  { product_id: 4, product_name: "Sting dâu" },
]);

// Dữ liệu inventory mẫu
const inventoryData = ref([
  { inventory_id: 1, product_id: 1, quantity: 100, updated_at: "2025-10-05 10:00:00" },
  { inventory_id: 2, product_id: 2, quantity: 50, updated_at: "2025-10-05 10:05:00" },
]);

const inventory = ref({ inventory_id: null, product_id: "", quantity: 0, updated_at: "" });
const editMode = ref(false);
const viewMode = ref(false); // 👁️ Chế độ xem chi tiết
const searchText = ref("");
const filterType = ref("inventory_id");

// ⚙️ Xác nhận hành động
const showConfirm = ref(false);
const confirmActionType = ref("");
const confirmMessage = ref("");
const pendingId = ref(null);

// Gọi xác nhận
function confirmAction(type, id = null) {
  confirmActionType.value = type;
  pendingId.value = id;

  if (type === "save") {
    confirmMessage.value = editMode.value ? "Bạn có chắc muốn cập nhật tồn kho này không?" : "Bạn có chắc muốn thêm mới tồn kho này không?";
  } else if (type === "delete") {
    confirmMessage.value = "Bạn có chắc muốn xóa mục tồn kho này không?";
  }

  showConfirm.value = true;
}

// Khi nhấn Xác nhận
function handleConfirm() {
  if (confirmActionType.value === "save") saveInventory();
  if (confirmActionType.value === "delete") deleteInventory(pendingId.value);
  showConfirm.value = false;
}

// Khi nhấn Hủy
function cancelConfirm() {
  showConfirm.value = false;
}

// Lọc inventory
const filteredInventory = computed(() => {
  const keyword = searchText.value.toLowerCase().trim();
  if (!keyword) return inventoryData.value;
  return inventoryData.value.filter((i) => {
    if (filterType.value === "inventory_id") return displayId(i.inventory_id).toLowerCase().includes(keyword);
    if (filterType.value === "product_id") return getProductName(i.product_id).toLowerCase().includes(keyword);
    return false;
  });
});

// Hiển thị ID dạng I001
function displayId(id) {
  return "I" + id.toString().padStart(3, "0");
}

// Lấy tên sản phẩm
function getProductName(id) {
  return products.value.find(p => p.product_id === id)?.product_name || "-";
}

// Thêm / cập nhật
function saveInventory() {
  const now = new Date().toISOString().slice(0,19).replace("T"," ");
  if (editMode.value) {
    const index = inventoryData.value.findIndex(i => i.inventory_id === inventory.value.inventory_id);
    if (index !== -1) inventoryData.value[index] = { ...inventory.value, updated_at: now };
    editMode.value = false;
  } else {
    const nextId = inventoryData.value.length > 0 ? Math.max(...inventoryData.value.map(i => i.inventory_id)) + 1 : 1;
    inventoryData.value.push({ ...inventory.value, inventory_id: nextId, updated_at: now });
  }
  resetForm();
}

// ✏️ Sửa
function editInventory(i) {
  inventory.value = { ...i };
  editMode.value = true;
  viewMode.value = false;
}

// 👁️ Xem chi tiết
function viewInventory(i) {
  if (!editMode.value) {
    inventory.value = { ...i };
    viewMode.value = true;
  }
}

// ❌ Đóng xem chi tiết
function closeView() {
  viewMode.value = false;
  resetForm();
}

// 🗑️ Xóa
function deleteInventory(id) {
  inventoryData.value = inventoryData.value.filter(i => i.inventory_id !== id);
  resetForm();
}

// Hủy
function cancelEdit() {
  editMode.value = false;
  resetForm();
}

// Reset form
function resetForm() {
  const nextId = inventoryData.value.length > 0 ? Math.max(...inventoryData.value.map(i => i.inventory_id)) + 1 : 1;
  inventory.value = { inventory_id: nextId, product_id: "", quantity: 0, updated_at: "" };
}

resetForm();
</script>

<style scoped>
.inventory-page {
  background: white;
  padding: 20px;
  border-radius: 10px;
  box-shadow: 0 2px 6px rgba(0,0,0,0.1);
}

.inventory-form {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
  margin-bottom: 20px;
}

.inventory-table {
  width: 100%;
  border-collapse: collapse;
}
.inventory-table th,
.inventory-table td {
  border: 1px solid #ddd;
  padding: 8px;
  text-align: center;
}
.inventory-table th {
  background-color: #2c3e50;
  color: white;
}

.inventory-table tr:hover {
  background-color: #f8f8f8;
  cursor: pointer;
}

.inventory-table tr.active {
  background-color: #e7f1ff;
}

.form-actions {
  grid-column: span 2;
  display: flex;
  gap: 10px;
}
</style>
