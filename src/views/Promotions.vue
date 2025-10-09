<template>
  <div class="promotions-page">
    <h2>🎁 Quản lý khuyến mãi</h2>

    <!-- 🔍 Thanh tìm kiếm -->
    <div class="search-bar">
      <label for="filterType">Tìm theo:</label>
      <select v-model="filterType" id="filterType">
        <option value="promo_id">ID</option>
        <option value="promo_code">Mã khuyến mãi</option>
      </select>
      <input type="text" v-model="searchText" placeholder="Nhập từ khóa..." />
    </div>

    <!-- 📝 Form thêm / sửa / xem -->
    <form class="promotion-form" @submit.prevent="confirmAction(editMode ? 'update' : 'add')">
      <div class="form-group">
        <label>ID</label>
        <input type="text" :value="displayId(promotion.promo_id)" readonly />
      </div>

      <div class="form-group">
        <label>Mã khuyến mãi</label>
        <input v-model="promotion.promo_code" type="text" required placeholder="Nhập mã khuyến mãi" :readonly="viewMode" />
      </div>

      <div class="form-group">
        <label>Mô tả</label>
        <input v-model="promotion.description" type="text" placeholder="Mô tả khuyến mãi" :readonly="viewMode" />
      </div>

      <div class="form-group">
        <label>Loại giảm giá</label>
        <select v-model="promotion.discount_type" required :disabled="viewMode">
          <option value="percent">percent</option>
          <option value="fixed">fixed</option>
        </select>
      </div>

      <div class="form-group">
        <label>Giá trị giảm</label>
        <input v-model="promotion.discount_value" type="number" step="0.01" required :readonly="viewMode" />
      </div>

      <div class="form-group">
        <label>Ngày bắt đầu</label>
        <Flatpickr v-model="promotion.start_date" :config="{ dateFormat: 'Y-m-d' }" placeholder="Chọn ngày bắt đầu" :disabled="viewMode" />
      </div>

      <div class="form-group">
        <label>Ngày kết thúc</label>
        <Flatpickr v-model="promotion.end_date" :config="{ dateFormat: 'Y-m-d' }" placeholder="Chọn ngày kết thúc" :disabled="viewMode" />
      </div>

      <div class="form-group">
        <label>Giá trị tối thiểu đơn hàng</label>
        <input v-model="promotion.min_order_amount" type="number" step="0.01" :readonly="viewMode" />
      </div>

      <div class="form-group">
        <label>Giới hạn sử dụng</label>
        <input v-model="promotion.usage_limit" type="number" min="0" :readonly="viewMode" />
      </div>

      <div class="form-group">
        <label>Số lượt đã dùng</label>
        <input v-model="promotion.used_count" type="number" min="0" readonly />
      </div>

      <div class="form-group">
        <label>Trạng thái</label>
        <select v-model="promotion.status" :disabled="viewMode">
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
      </div>

      <button type="submit" v-if="!viewMode">{{ editMode ? "Cập nhật" : "Thêm mới" }}</button>
      <button type="button" v-if="editMode" @click="cancelEdit">Hủy</button>
      <button type="button" v-if="viewMode" @click="closeView">Đóng</button>
    </form>

    <!-- 📋 Bảng hiển thị -->
    <table class="promotion-table">
      <thead>
        <tr>
          <th>ID</th>
          <th>Mã khuyến mãi</th>
          <th>Mô tả</th>
          <th>Loại giảm</th>
          <th>Giá trị giảm</th>
          <th>Bắt đầu</th>
          <th>Kết thúc</th>
          <th>Min đơn hàng</th>
          <th>Giới hạn</th>
          <th>Đã dùng</th>
          <th>Trạng thái</th>
          <th>Hành động</th>
        </tr>
      </thead>
      <tbody>
        <tr
          v-for="p in filteredPromotions"
          :key="p.promo_id"
          @click="viewPromotion(p)"
          :class="{ active: viewMode && promotion.promo_id === p.promo_id }"
        >
          <td>{{ displayId(p.promo_id) }}</td>
          <td>{{ p.promo_code }}</td>
          <td>{{ p.description }}</td>
          <td>{{ p.discount_type }}</td>
          <td>{{ formatPrice(p.discount_value) }}</td>
          <td>{{ p.start_date }}</td>
          <td>{{ p.end_date }}</td>
          <td>{{ formatPrice(p.min_order_amount) }}</td>
          <td>{{ p.usage_limit }}</td>
          <td>{{ p.used_count }}</td>
          <td>{{ p.status }}</td>
          <td>
            <button @click.stop="editPromotion(p)">✏️</button>
            <button @click.stop="confirmAction('delete', p)">🗑️</button>
          </td>
        </tr>
        <tr v-if="filteredPromotions.length === 0">
          <td colspan="12">Không có dữ liệu phù hợp</td>
        </tr>
      </tbody>
    </table>

    <!-- 🧩 Popup xác nhận -->
    <div v-if="showPopup" class="confirm-overlay">
      <div class="confirm-box">
        <h3>{{ popupTitle }}</h3>
        <p>{{ popupMessage }}</p>
        <div class="actions">
          <button class="btn-yes" @click="handleConfirm">Xác nhận</button>
          <button class="btn-no" @click="closePopup">Hủy</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from "vue";
import Flatpickr from "vue-flatpickr-component";
import "flatpickr/dist/flatpickr.css";

const promotions = ref([
  {
    promo_id: 1,
    promo_code: "SUMMER10",
    description: "Giảm 10% mùa hè",
    discount_type: "percent",
    discount_value: 10,
    start_date: "2025-06-01",
    end_date: "2025-06-30",
    min_order_amount: 0,
    usage_limit: 100,
    used_count: 0,
    status: "active",
  },
  {
    promo_id: 2,
    promo_code: "OFF50K",
    description: "Giảm 50.000 VNĐ",
    discount_type: "fixed",
    discount_value: 50000,
    start_date: "2025-07-01",
    end_date: "2025-07-31",
    min_order_amount: 200000,
    usage_limit: 50,
    used_count: 0,
    status: "inactive",
  },
]);

const promotion = ref({});
const editMode = ref(false);
const viewMode = ref(false);
const searchText = ref("");
const filterType = ref("promo_id");

const showPopup = ref(false);
const popupAction = ref("");
const popupTarget = ref(null);
const popupTitle = ref("");
const popupMessage = ref("");

const filteredPromotions = computed(() => {
  const keyword = searchText.value.toLowerCase().trim();
  if (!keyword) return promotions.value;
  return promotions.value.filter(p => {
    if (filterType.value === "promo_id") return displayId(p.promo_id).toLowerCase().includes(keyword);
    if (filterType.value === "promo_code") return p.promo_code.toLowerCase().includes(keyword);
    return false;
  });
});

function displayId(id) {
  return "PR" + id.toString().padStart(3, "0");
}

function formatPrice(val) {
  return Number(val).toLocaleString("vi-VN");
}

/* ----------------- POPUP ----------------- */
function confirmAction(action, target = null) {
  popupAction.value = action;
  popupTarget.value = target;
  showPopup.value = true;
  if (action === "add") {
    popupTitle.value = "Xác nhận thêm mới";
    popupMessage.value = "Bạn có chắc muốn thêm khuyến mãi này không?";
  } else if (action === "update") {
    popupTitle.value = "Xác nhận cập nhật";
    popupMessage.value = "Bạn có chắc muốn cập nhật thông tin khuyến mãi này không?";
  } else if (action === "delete") {
    popupTitle.value = "Xác nhận xóa";
    popupMessage.value = "Bạn có chắc muốn xóa khuyến mãi này không?";
  }
}

function handleConfirm() {
  if (popupAction.value === "add") savePromotion();
  else if (popupAction.value === "update") savePromotion(true);
  else if (popupAction.value === "delete" && popupTarget.value)
    promotions.value = promotions.value.filter(p => p.promo_id !== popupTarget.value.promo_id);
  closePopup();
}

function closePopup() {
  showPopup.value = false;
}

/* ----------------- CRUD ----------------- */
function savePromotion(isUpdate = false) {
  if (isUpdate || editMode.value) {
    const index = promotions.value.findIndex(p => p.promo_id === promotion.value.promo_id);
    if (index !== -1) promotions.value[index] = { ...promotion.value };
    editMode.value = false;
  } else {
    const nextId = promotions.value.length > 0 ? Math.max(...promotions.value.map(p => p.promo_id)) + 1 : 1;
    promotions.value.push({ ...promotion.value, promo_id: nextId });
  }
  resetForm();
}

function editPromotion(p) {
  promotion.value = { ...p };
  editMode.value = true;
  viewMode.value = false;
}

function viewPromotion(p) {
  if (!editMode.value) {
    promotion.value = { ...p };
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

function resetForm() {
  const nextId = promotions.value.length > 0 ? Math.max(...promotions.value.map(p => p.promo_id)) + 1 : 1;
  promotion.value = {
    promo_id: nextId,
    promo_code: "",
    description: "",
    discount_type: "percent",
    discount_value: 0,
    start_date: "",
    end_date: "",
    min_order_amount: 0,
    usage_limit: 0,
    used_count: 0,
    status: "active",
  };
}

resetForm();
</script>

<style scoped>
.promotions-page {
  background: white;
  padding: 20px;
  border-radius: 10px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
}

.promotion-form {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
  margin-bottom: 20px;
}

.promotion-table {
  width: 100%;
  border-collapse: collapse;
}
.promotion-table th,
.promotion-table td {
  border: 1px solid #ddd;
  padding: 8px;
  text-align: center;
}
.promotion-table th {
  background-color: #2c3e50;
  color: white;
}

.promotion-table tr:hover {
  background-color: #f8f8f8;
  cursor: pointer;
}

.promotion-table tr.active {
  background-color: #e7f1ff;
}

.form-actions {
  grid-column: span 2;
  display: flex;
  gap: 10px;
}
</style>
