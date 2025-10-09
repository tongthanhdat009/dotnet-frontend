<template>
  <div class="products-page">
    <h2>📦 Quản lý sản phẩm</h2>

    <!-- 🔍 Thanh tìm kiếm -->
    <div class="search-bar">
      <label for="filterType">Tìm theo:</label>
      <select v-model="filterType" id="filterType">
        <option value="productId">ID</option>
        <option value="productName">Tên sản phẩm</option>
        <option value="barcode">Mã vạch</option>
      </select>
      <input type="text" v-model="searchText" placeholder="Nhập từ khóa..." />
    </div>

    <!-- 📝 Form thêm / sửa / xem -->
    <form class="product-form" @submit.prevent="confirmSave">
      <div class="form-group">
        <label>ID</label>
        <input type="text" :value="displayId(product.productId)" readonly />
      </div>

      <div class="form-group">
        <label>Danh mục (Category ID)</label>
        <select v-model="product.categoryId" :disabled="viewMode && !editMode">
          <option disabled value="">-- Chọn danh mục --</option>
          <option v-for="c in categories" :key="c.id" :value="c.id">{{ c.name }}</option>
        </select>
      </div>

      <div class="form-group">
        <label>Nhà cung cấp (Supplier ID)</label>
        <select v-model="product.supplierId" :disabled="viewMode && !editMode">
          <option disabled value="">-- Chọn NCC --</option>
          <option v-for="s in suppliers" :key="s.id" :value="s.id">{{ s.name }}</option>
        </select>
      </div>

      <div class="form-group">
        <label>Tên sản phẩm</label>
        <input
          v-model="product.productName"
          type="text"
          required
          placeholder="Nhập tên sản phẩm"
          :readonly="viewMode && !editMode"
        />
      </div>

      <div class="form-group">
        <label>Mã vạch</label>
        <input
          v-model="product.barcode"
          type="text"
          placeholder="Nhập barcode"
          :readonly="viewMode && !editMode"
        />
      </div>

      <div class="form-group">
        <label>Giá</label>
        <input
          v-model="product.price"
          type="number"
          step="0.01"
          required
          :readonly="viewMode && !editMode"
        />
      </div>

      <div class="form-group">
        <label>Đơn vị</label>
        <input
          v-model="product.unit"
          type="text"
          placeholder="Ví dụ: cái, hộp, chiếc..."
          :readonly="viewMode && !editMode"
        />
      </div>

      <button type="submit" v-if="!viewMode">{{ editMode ? "Cập nhật" : "Thêm mới" }}</button>
      <button type="button" v-if="editMode" @click="cancelEdit">Hủy</button>
      <button type="button" v-if="viewMode && !editMode" @click="closeView">Đóng</button>
    </form>

    <!-- 📋 Bảng hiển thị -->
    <div v-if="loading" class="loading">Đang tải sản phẩm...</div>
    <div v-else-if="products.length === 0" class="no-data">Không có dữ liệu sản phẩm</div>
    <table v-else class="product-table">
      <thead>
        <tr>
          <th>ID</th>
          <th>Danh mục</th>
          <th>Nhà cung cấp</th>
          <th>Tên sản phẩm</th>
          <th>Mã vạch</th>
          <th>Giá (VNĐ)</th>
          <th>Đơn vị</th>
          <th>Hành động</th>
        </tr>
      </thead>
      <tbody>
        <tr
          v-for="p in paginatedProducts"
          :key="p?.productId ?? Math.random()"
          @click="viewProduct(p)"
          :class="{ active: viewMode && product.productId === p?.productId }"
        >
          <td>{{ displayId(p?.productId) }}</td>
          <td>{{ p?.categoryName || '-' }}</td>
          <td>{{ p?.supplierName || '-' }}</td>
          <td>{{ p?.productName || '-' }}</td>
          <td>{{ p?.barcode || '-' }}</td>
          <td>{{ formatPrice(p?.price) }}</td>
          <td>{{ p?.unit || '-' }}</td>
          <td>
            <button @click.stop="editProduct(p)">✏️</button>
            <button @click.stop="confirmDelete(p?.productId)">🗑️</button>
          </td>
        </tr>
      </tbody>
    </table>

    <!-- 🔢 Phân trang -->
    <div v-if="totalPages > 1" class="pagination">
      <button @click="currentPage--" :disabled="currentPage === 1"><</button>
      <span>Trang {{ currentPage }} / {{ totalPages }}</span>
      <button @click="currentPage++" :disabled="currentPage === totalPages">></button>
    </div>

    <!-- 🔔 Popup xác nhận -->
    <div v-if="showConfirm" class="confirm-overlay">
      <div class="confirm-box">
        <h3>{{ confirmTitle }}</h3>
        <p>{{ confirmMessage }}</p>
        <div class="actions">
          <button @click="handleConfirm(true)" class="btn-yes">Xác nhận</button>
          <button @click="handleConfirm(false)" class="btn-no">Hủy</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from "vue";
import { getProducts, addProduct, updateProduct, deleteProduct as deleteProductAPI } from "../api/api.js";

// ----- Fake categories & suppliers
const categories = ref([
  { id: 1, name: "Điện thoại" },
  { id: 2, name: "Nước giải khát" },
  { id: 3, name: "Trà & Cà phê" },
  { id: 4, name: "Bánh kẹo" },
  { id: 5, name: "Snack" },
]);
const suppliers = ref([
  { id: 1, name: "Samsung VN" },
  { id: 2, name: "Pepsi VN" },
  { id: 3, name: "Công ty ABC" },
]);

// ----- Products
const products = ref([]);
const loading = ref(true);
const product = ref({
  productId: null,
  categoryId: "",
  supplierId: "",
  productName: "",
  barcode: "",
  price: "",
  unit: "pcs",
});
const editMode = ref(false);
const viewMode = ref(false);
const searchText = ref("");
const filterType = ref("productId");

// ----- Pagination
const currentPage = ref(1);
const itemsPerPage = 10;
const filteredProducts = computed(() => {
  if (!products.value || products.value.length === 0) return [];
  const keyword = searchText.value.toLowerCase().trim();
  return products.value.filter((p) => {
    if (!p) return false;
    if (!keyword) return true;
    const field = p[filterType.value];
    if (field == null) return false;
    return String(field).toLowerCase().includes(keyword);
  });
});
const totalPages = computed(() => Math.ceil(filteredProducts.value.length / itemsPerPage));
const paginatedProducts = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage;
  const end = start + itemsPerPage;
  return filteredProducts.value.slice(start, end);
});

// ----- Popup
const showConfirm = ref(false);
const confirmTitle = ref("");
const confirmMessage = ref("");
let confirmAction = null;

// ----- Fetch products
async function fetchProducts() {
  try {
    const data = await getProducts();
    console.log("Data from backend:", data);

    // Chuyển đổi key từ PascalCase sang camelCase
    products.value = data.map(item => ({
      productId: item.ProductId,
      categoryId: item.CategoryId,
      categoryName: item.CategoryName,
      supplierId: item.SupplierId,
      supplierName: item.SupplierName,
      productName: item.ProductName,
      barcode: item.Barcode,
      price: item.Price,
      unit: item.Unit
    }));
  } catch (err) {
    console.error("Lỗi khi tải sản phẩm:", err);
  } finally {
    loading.value = false;
  }
}

fetchProducts();

// ----- Confirm Save
function confirmSave() {
  confirmTitle.value = editMode.value ? "Xác nhận cập nhật" : "Xác nhận thêm mới";
  confirmMessage.value = editMode.value
    ? "Bạn có chắc muốn cập nhật sản phẩm này không?"
    : "Bạn có chắc muốn thêm sản phẩm mới không?";
  confirmAction = saveProduct;
  showConfirm.value = true;
}

// ----- Confirm Delete
function confirmDelete(id) {
  confirmTitle.value = "Xác nhận xóa";
  confirmMessage.value = "Bạn có chắc muốn xóa sản phẩm này không?";
  confirmAction = () => deleteProduct(id);
  showConfirm.value = true;
}

// ----- Handle Confirm
function handleConfirm(confirmed) {
  if (confirmed && confirmAction) confirmAction();
  showConfirm.value = false;
}

// ----- Save product
async function saveProduct() {
  try {
    if (editMode.value) {
      await updateProduct(product.value.productId, product.value);
    } else {
      await addProduct(product.value);
    }
    await fetchProducts();
    editMode.value = false;
    resetForm();
  } catch (err) {
    console.error("Lỗi khi lưu sản phẩm:", err);
  }
}

// ----- Delete product
async function deleteProduct(id) {
  try {
    await deleteProductAPI(id);
    await fetchProducts();
  } catch (err) {
    console.error("Lỗi khi xóa sản phẩm:", err);
  }
  resetForm();
}

// ----- Edit / View / Close / Cancel
function editProduct(p) {
  product.value = { ...p };
  editMode.value = true;
  viewMode.value = false;
}
function viewProduct(p) {
  if (!editMode.value) {
    product.value = { ...p };
    viewMode.value = true;
  }
}
function closeView() {
  viewMode.value = false;
  resetForm();
}
function cancelEdit() {
  editMode.value = false;
  resetForm();
}

// ----- Reset form
function resetForm() {
  const nextId =
    products.value.length > 0
      ? Math.max(...products.value.map((p) => p?.productId || 0)) + 1
      : 1;
  product.value = {
    productId: nextId,
    categoryId: "",
    supplierId: "",
    productName: "",
    barcode: "",
    price: "",
    unit: "pcs",
  };
}

// ----- Helpers
function displayId(id) {
  if (id == null) return "-";
  return "P" + id.toString().padStart(3, "0");
}
function formatPrice(val) {
  return Number(val || 0).toLocaleString("vi-VN");
}
</script>

<style scoped>
.products-page {
  background: white;
  padding: 20px;
  border-radius: 10px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
}
.product-form {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
  margin-bottom: 20px;
}
.product-table {
  width: 100%;
  border-collapse: collapse;
}
.product-table th,
.product-table td {
  border: 1px solid #ddd;
  padding: 8px;
  text-align: center;
}
.product-table th {
  background-color: #2c3e50;
  color: white;
}
.product-table tr:hover {
  background-color: #f8f8f8;
  cursor: pointer;
}
.product-table tr.active {
  background-color: #e7f1ff;
}
.loading {
  margin: 20px;
  font-weight: bold;
}
.no-data {
  margin: 20px;
  font-style: italic;
  color: gray;
}
.pagination {
  margin-top: 10px;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 10px;
}
.pagination button {
  padding: 4px 10px;
  border: 1px solid #ccc;
  background-color: white;
  cursor: pointer;
  color: black;
  font-weight: bold;
}
.pagination button:hover {
  background-color: #f0f0f0;
}
.pagination button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>
