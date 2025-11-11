<template>
  <div class="promotions-page">
    <h2>🎁 Quản lý khuyến mãi</h2>

    <!-- 🔍 Thanh tìm kiếm -->
    <div class="search-bar">
      <label for="filterType">Tìm theo:</label>
      <select v-model="filterType" id="filterType">
        <option value="PromoId">ID</option>
        <option value="PromoCode">Mã khuyến mãi</option>
      </select>
      <input type="text" v-model="searchText" placeholder="Nhập từ khóa..." />
    </div>

    <!-- 📝 Form thêm / sửa / xem -->
    <form class="promotion-form" @submit.prevent="confirmAction(editMode ? 'update' : 'add')">
      <div class="form-group">
        <label>ID</label>
        <input type="text" :value="displayId(promotion.PromoId)" readonly />
      </div>

      <div class="form-group">
        <label>Mã khuyến mãi</label>
        <input v-model="promotion.PromoCode" type="text" required placeholder="Nhập mã khuyến mãi" :readonly="viewMode" />
      </div>

      <div class="form-group">
        <label>Mô tả</label>
        <input v-model="promotion.description" type="text" placeholder="Mô tả khuyến mãi" :readonly="viewMode" />
      </div>

      <div class="form-group">
        <label>Loại giảm giá</label>
        <select v-model="promotion.DiscountType" required :disabled="viewMode || (editMode && promotion.UsedCount > 0)">
          <option value="percent">percent</option>
          <option value="fixed">fixed</option>
        </select>
      </div>

      <div class="form-group">
        <label>Giá trị giảm</label>
        <input v-model="promotion.DiscountValue" type="number" step="0.01" required :readonly="viewMode || (editMode && promotion.UsedCount > 0)" />
      </div>

      <div class="form-group">
        <label>Ngày bắt đầu</label>
        <Flatpickr v-model="promotion.StartDate" :config="{ dateFormat: 'Y-m-d' }" placeholder="Chọn ngày bắt đầu" :disabled="viewMode" />
      </div>

      <div class="form-group">
        <label>Ngày kết thúc</label>
        <Flatpickr v-model="promotion.EndDate" :config="{ dateFormat: 'Y-m-d' }" placeholder="Chọn ngày kết thúc" :disabled="viewMode" />
      </div>

      <div class="form-group">
        <label>Giá trị tối thiểu đơn hàng</label>
        <input v-model="promotion.MinOrderAmount" type="number" step="0.01" :readonly="viewMode" />
      </div>

      <div class="form-group">
        <label>Giới hạn sử dụng</label>
        <input v-model="promotion.UsageLimit" type="number" min="0" :readonly="viewMode" />
      </div>

      <div class="form-group">
        <label>Số lượt đã dùng</label>
        <input v-model="promotion.UsedCount" type="number" min="0" readonly />
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
          :key="p.PromoId"
          @click="viewPromotion(p)"
          :class="{ active: viewMode && promotion.PromoId === p.PromoId }"
        >
          <td>{{ displayId(p.PromoId) }}</td>
          <td>{{ p.PromoCode }}</td>
          <td>{{ p.Description }}</td>
          <td>{{ p.DiscountType }}</td>
          <td>{{ formatPrice(p.DiscountValue) }}</td>
          <td>{{ p.StartDate }}</td>
          <td>{{ p.EndDate }}</td>
          <td>{{ formatPrice(p.MinOrderAmount) }}</td>
          <td>{{ p.UsageLimit }}</td>
          <td>{{ p.UsedCount }}</td>
          <td>{{ p.Status }}</td>
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
import { ref, computed, onMounted } from "vue";
import Flatpickr from "vue-flatpickr-component";
import "flatpickr/dist/flatpickr.css";
import * as PromotionApi from "../api/Promotion";

const promotions = ref([]);

const promotion = ref({});
const editMode = ref(false);
const viewMode = ref(false);
const searchText = ref("");
const filterType = ref("PromoId");

const showPopup = ref(false);
const popupAction = ref("");
const popupTarget = ref(null);
const popupTitle = ref("");
const popupMessage = ref("");

const filteredPromotions = computed(() => {
  const keyword = searchText.value.toLowerCase().trim();
  if (!keyword) return promotions.value;
  return promotions.value.filter(p => {
    if (filterType.value === "PromoId") return displayId(p.PromoId).toLowerCase().includes(keyword);
    if (filterType.value === "PromoCode") return p.PromoCode.toLowerCase().includes(keyword);
    return false;
  });
});

function displayId(id) {
  if (id == null || id === undefined) return "PR000";
  return "PR" + String(id).padStart(3, "0");
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
    doDelete(popupTarget.value);
  closePopup();
}

function closePopup() {
  showPopup.value = false;
}

/* ----------------- CRUD ----------------- */
async function savePromotion(isUpdate = false) {
  try {
    if (isUpdate || editMode.value) {
      const updated = await PromotionApi.updatePromotion(promotion.value.PromoId, promotion.value);
      const idx = promotions.value.findIndex((p) => p.PromoId === updated.PromoId);
      if (idx !== -1) promotions.value[idx] = updated;
      editMode.value = false;
    } else {
      const created = await PromotionApi.createPromotion(promotion.value);
      promotions.value.push(created);
    }
    resetForm();
  } catch (err) {
    const msg = err?.response?.data?.message || err.message || "Lỗi khi lưu khuyến mãi";
    alert(msg);
  }
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
  const nextId = promotions.value.length > 0 ? Math.max(...promotions.value.map(p => p.PromoId)) + 1 : 1;
  promotion.value = {
    PromoId: nextId,
    PromoCode: "",
    Description: "",
    DiscountType: "percent",
    DiscountValue: 0,
    StartDate: "",
    EndDate: "",
    MinOrderAmount: 0,
    UsageLimit: 0,
    UsedCount: 0,
    Status: "active",
  };
}

resetForm();

// load data
onMounted(async () => {
  try {
    promotions.value = await PromotionApi.getPromotions();
  } catch (err) {
    console.error(err);
    alert("Không thể tải danh sách khuyến mãi. Kiểm tra backend.");
  }
});

// delete helper
async function doDelete(target) {
  try {
    await PromotionApi.deletePromotion(target.PromoId);
    promotions.value = promotions.value.filter((p) => p.PromoId !== target.PromoId);
  } catch (err) {
    const msg = err?.response?.data?.message || err.message || "Lỗi khi xóa";
    alert(msg);
  }
}

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
