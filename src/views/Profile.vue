<template>
  <div class="profile-page">
    <h2>👤 Thông tin tài khoản</h2>

    <div v-if="loading" class="loading">
      ⏳ Đang tải thông tin...
    </div>

    <div v-else-if="errorMessage" class="error-message">
      ❌ {{ errorMessage }}
    </div>

    <div v-else-if="userInfo" class="profile-card">
      <div class="profile-header">
        <div class="avatar">
          {{ userInfo.username?.charAt(0).toUpperCase() || '?' }}
        </div>
        <h3>{{ userInfo.fullName || userInfo.username }}</h3>
        <span class="badge" :class="userInfo.role">{{ userInfo.role }}</span>
      </div>

      <div class="profile-info">
        <div class="info-row">
          <span class="label">🆔 User ID:</span>
          <span class="value">{{ userInfo.userId }}</span>
        </div>
        <div class="info-row">
          <span class="label">👤 Username:</span>
          <span class="value">{{ userInfo.username }}</span>
        </div>
        <div class="info-row">
          <span class="label">📝 Họ và tên:</span>
          <span class="value">{{ userInfo.fullName || '(Chưa cập nhật)' }}</span>
        </div>
        <div class="info-row">
          <span class="label">🔑 Vai trò:</span>
          <span class="value">{{ userInfo.role }}</span>
        </div>
      </div>

      <div class="profile-actions">
        <button @click="refreshData" class="btn-refresh">
          🔄 Làm mới
        </button>
        <button @click="handleLogout" class="btn-logout">
          🚪 Đăng xuất
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { getCurrentUser, logout } from '../api/Auth.js';

const router = useRouter();

const userInfo = ref(null);
const loading = ref(false);
const errorMessage = ref('');

// Lấy thông tin user
async function fetchUserInfo() {
  try {
    loading.value = true;
    errorMessage.value = '';
    
    const data = await getCurrentUser();
    userInfo.value = data;
    
  } catch (error) {
    console.error('Fetch user info error:', error);
    
    if (error.response?.status === 401) {
      errorMessage.value = 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.';
      setTimeout(() => {
        logout();
        router.push('/login');
      }, 2000);
    } else {
      errorMessage.value = error.response?.data?.message || 'Không thể tải thông tin tài khoản';
    }
  } finally {
    loading.value = false;
  }
}

// Làm mới dữ liệu
function refreshData() {
  fetchUserInfo();
}

// Đăng xuất
function handleLogout() {
  if (confirm('Bạn có chắc muốn đăng xuất?')) {
    logout();
    router.push('/login');
  }
}

onMounted(() => {
  fetchUserInfo();
});
</script>

<style scoped>
.profile-page {
  max-width: 600px;
  margin: 0 auto;
  padding: 20px;
}

.loading {
  text-align: center;
  padding: 40px;
  font-size: 18px;
  color: #666;
}

.error-message {
  background: #fee;
  color: #c33;
  padding: 16px;
  border-radius: 8px;
  border-left: 4px solid #c33;
}

.profile-card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.profile-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 40px 20px;
  text-align: center;
}

.avatar {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: white;
  color: #667eea;
  font-size: 36px;
  font-weight: bold;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 16px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

.profile-header h3 {
  margin: 0 0 8px;
  font-size: 24px;
}

.badge {
  display: inline-block;
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
  background: rgba(255, 255, 255, 0.3);
}

.badge.admin {
  background: #e74c3c;
}

.badge.staff {
  background: #3498db;
}

.profile-info {
  padding: 24px;
}

.info-row {
  display: flex;
  justify-content: space-between;
  padding: 12px 0;
  border-bottom: 1px solid #eee;
}

.info-row:last-child {
  border-bottom: none;
}

.label {
  font-weight: 600;
  color: #666;
}

.value {
  color: #2c3e50;
  font-weight: 500;
}

.profile-actions {
  padding: 20px;
  display: flex;
  gap: 12px;
  background: #f8f9fa;
  border-top: 1px solid #eee;
}

.btn-refresh,
.btn-logout {
  flex: 1;
  padding: 12px;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
}

.btn-refresh {
  background: #3498db;
  color: white;
}

.btn-refresh:hover {
  background: #2980b9;
  transform: translateY(-2px);
}

.btn-logout {
  background: #e74c3c;
  color: white;
}

.btn-logout:hover {
  background: #c0392b;
  transform: translateY(-2px);
}
</style>
