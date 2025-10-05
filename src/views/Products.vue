<template>
  <div class="products-page">
    <h2>📦 Quản lý sản phẩm</h2>

    <!-- 🔍 Thanh tìm kiếm -->
    <div class="search-bar">
      <label for="filterType">Tìm theo:</label>
      <select v-model="filterType" id="filterType">
        <option value="product_id">ID</option>
        <option value="product_name">Tên sản phẩm</option>
        <option value="barcode">Mã vạch</option>
      </select>
      <input type="text" v-model="searchText" placeholder="Nhập từ khóa..." />
    </div>

    <!-- 📝 Form thêm / sửa -->
    <form class="product-form" @submit.prevent="saveProduct">
      <div class="form-group">
        <label>ID</label>
        <input type="text" :value="displayId(product.product_id)" readonly />
      </div>

      <div class="form-group">
        <label>Danh mục (Category ID)</label>
        <select v-model="product.category_id">
          <option disabled value="">-- Chọn danh mục --</option>
          <option v-for="c in categories" :key="c.id" :value="c.id">{{ c.name }}</option>
        </select>
      </div>

      <div class="form-group">
        <label>Nhà cung cấp (Supplier ID)</label>
        <select v-model="product.supplier_id">
          <option disabled value="">-- Chọn NCC --</option>
          <option v-for="s in suppliers" :key="s.id" :value="s.id">{{ s.name }}</option>
        </select>
      </div>

      <div class="form-group">
        <label>Tên sản phẩm</label>
        <input v-model="product.product_name" type="text" required placeholder="Nhập tên sản phẩm" />
      </div>

      <div class="form-group">
        <label>Mã vạch</label>
        <input v-model="product.barcode" type="text" placeholder="Nhập barcode" />
      </div>

      <div class="form-group">
        <label>Giá</label>
        <input v-model="product.price" type="number" step="0.01" required />
      </div>

      <div class="form-group">
        <label>Đơn vị</label>
        <input v-model="product.unit" type="text" placeholder="Ví dụ: cái, hộp, chiếc..." />
      </div>

      <button type="submit">{{ editMode ? "Cập nhật" : "Thêm mới" }}</button>
      <button type="button" v-if="editMode" @click="cancelEdit">Hủy</button>
    </form>

    <!-- 📋 Bảng hiển thị -->
    <table class="product-table">
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
        <tr v-for="p in filteredProducts" :key="p.product_id">
          <td>{{ displayId(p.product_id) }}</td>
          <td>{{ getCategoryName(p.category_id) }}</td>
          <td>{{ getSupplierName(p.supplier_id) }}</td>
          <td>{{ p.product_name }}</td>
          <td>{{ p.barcode }}</td>
          <td>{{ formatPrice(p.price) }}</td>
          <td>{{ p.unit }}</td>
          <td>
            <button @click="editProduct(p)">✏️</button>
            <button @click="deleteProduct(p.product_id)">🗑️</button>
          </td>
        </tr>
        <tr v-if="filteredProducts.length === 0">
          <td colspan="8">Không có dữ liệu phù hợp</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup>
import { ref, computed } from "vue";

// Danh mục & nhà cung cấp giả lập (ID là số)
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

// Dữ liệu sản phẩm mẫu giống database
const products = ref([
  { product_id: 1, category_id: 2, supplier_id: 1, product_name: 'Coca Cola lon', barcode: '8900000000001', price: 314838, unit: 'hộp' },
  { product_id: 2, category_id: 1, supplier_id: 3, product_name: 'Pepsi lon', barcode: '8900000000002', price: 114807, unit: 'cái' },
  { product_id: 3, category_id: 3, supplier_id: 3, product_name: 'Trà Xanh 0 độ', barcode: '8900000000003', price: 415725, unit: 'tuýp' },
  { product_id: 4, category_id: 2, supplier_id: 1, product_name: 'Sting dâu', barcode: '8900000000004', price: 351670, unit: 'cái' },
  { product_id: 5, category_id: 3, supplier_id: 2, product_name: 'Red Bull', barcode: '8900000000005', price: 402179, unit: 'lon' },
  { product_id: 6, category_id: 2, supplier_id: 2, product_name: 'Bánh Oreo', barcode: '8900000000006', price: 209283, unit: 'chai' },
  { product_id: 7, category_id: 5, supplier_id: 3, product_name: 'Bánh Chocopie', barcode: '8900000000007', price: 212528, unit: 'lon' },
  { product_id: 8, category_id: 1, supplier_id: 2, product_name: 'Kẹo Alpenliebe', barcode: '8900000000008', price: 34313, unit: 'lon' },
]);

const product = ref({ product_id: null, category_id: "", supplier_id: "", product_name: "", barcode: "", price: "", unit: "pcs" });
const editMode = ref(false);
const searchText = ref("");
const filterType = ref("product_id");

// 🔍 Lọc danh sách
const filteredProducts = computed(() => {
  const keyword = searchText.value.toLowerCase().trim();
  if (!keyword) return products.value;
  return products.value.filter((p) => {
    const field = p[filterType.value];
    if (field === undefined || field === null) return false;
    return String(field).toLowerCase().includes(keyword);
  });
});

// 💾 Lưu sản phẩm
function saveProduct() {
  if (!editMode.value && products.value.some(p => p.barcode === product.value.barcode)) {
    alert("Barcode đã tồn tại!");
    return;
  }

  if (editMode.value) {
    const index = products.value.findIndex((p) => p.product_id === product.value.product_id);
    if (index !== -1) products.value[index] = { ...product.value, price: Number(product.value.price) };
    editMode.value = false;
  } else {
    const nextId = products.value.length > 0 ? Math.max(...products.value.map(p => p.product_id)) + 1 : 1;
    products.value.push({ ...product.value, product_id: nextId, price: Number(product.value.price) });
  }
  resetForm();
}

// ✏️ Sửa
function editProduct(p) {
  product.value = { ...p };
  editMode.value = true;
}

// 🗑️ Xóa
function deleteProduct(id) {
  products.value = products.value.filter((p) => p.product_id !== id);
  resetForm();
}

// ❌ Hủy
function cancelEdit() {
  editMode.value = false;
  resetForm();
}

// 🔄 Reset form
// 🔄 Reset form
function resetForm() {
  const nextId = products.value.length > 0 ? Math.max(...products.value.map(p => p.product_id)) + 1 : 1;
  product.value = {
    product_id: nextId, // số tự tăng
    category_id: "",
    supplier_id: "",
    product_name: "",
    barcode: "",
    price: "",
    unit: "pcs"
  };
}

// Hiển thị ID dạng P001
function displayId(id) {
  return "P" + id.toString().padStart(3, "0");
}


// 🔧 Hàm phụ trợ
function getCategoryName(id) {
  return categories.value.find((c) => c.id === id)?.name || "-";
}
function getSupplierName(id) {
  return suppliers.value.find((s) => s.id === id)?.name || "-";
}
function formatPrice(val) {
  return Number(val).toLocaleString("vi-VN");
}

resetForm();
</script>

<style scoped>
.products-page {
  background: white;
  padding: 20px;
  border-radius: 10px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
}

/* 📝 Form */
.product-form {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
  margin-bottom: 20px;
}
/* 📋 Bảng */
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
</style>
