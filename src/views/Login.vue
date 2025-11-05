<template>
  <div class="login-container">
    <div class="login-box">
      <div class="login-header">
        <h2>🔐 Đăng nhập</h2>
        <p>Vui lòng đăng nhập để tiếp tục</p>
      </div>

      <!-- Thông báo lỗi -->
      <div v-if="errorMessage" class="error-message">
        ⚠️ {{ errorMessage }}
      </div>

      <!-- Form đăng nhập -->
      <form @submit.prevent="handleLogin" class="login-form">
        <div class="form-group">
          <label for="username">
            <span class="icon">👤</span>
            Tên đăng nhập
          </label>
          <input
            id="username"
            v-model="loginData.username"
            type="text"
            placeholder="Nhập tên đăng nhập"
            required
            :disabled="isLoading"
          />
        </div>

        <div class="form-group">
          <label for="password">
            <span class="icon">🔒</span>
            Mật khẩu
          </label>
          <input
            id="password"
            v-model="loginData.password"
            type="password"
            placeholder="Nhập mật khẩu"
            required
            :disabled="isLoading"
          />
        </div>

        <div class="form-group checkbox-group">
          <label>
            <input type="checkbox" v-model="rememberMe" />
            Ghi nhớ đăng nhập
          </label>
        </div>

        <button type="submit" class="btn-login" :disabled="isLoading">
          <span v-if="!isLoading">Đăng nhập</span>
          <span v-else>Đang đăng nhập...</span>
        </button>
      </form>

      <div class="login-footer">
        <a href="#" class="forgot-password">Quên mật khẩu?</a>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";
import { login } from "../api/Auth.js";

const router = useRouter();

// State
const loginData = ref({
  username: "",
  password: "",
});

const rememberMe = ref(false);
const isLoading = ref(false);
const errorMessage = ref("");

// Xử lý đăng nhập
async function handleLogin() {
  try {
    isLoading.value = true;
    errorMessage.value = "";

    // Validate
    if (!loginData.value.username.trim()) {
      errorMessage.value = "Vui lòng nhập tên đăng nhập";
      return;
    }
    if (!loginData.value.password.trim()) {
      errorMessage.value = "Vui lòng nhập mật khẩu";
      return;
    }

    // Gọi API đăng nhập
    const response = await login(
      loginData.value.username.trim(),
      loginData.value.password.trim()
    );

    // Lưu thông tin user
    if (response) {
      // Lưu thông tin user vào localStorage
      const userInfo = {
        userId: response.userId,
        username: response.username,
        fullName: response.fullName,
        role: response.role,
      };
      localStorage.setItem("user", JSON.stringify(userInfo));
      
      if (rememberMe.value) {
        localStorage.setItem("rememberMe", "true");
      }

      console.log("✅ Đăng nhập thành công:", userInfo);

      // Chuyển hướng đến trang chính
      router.push("/dashboard");
    }

  } catch (error) {
    console.error("Login error:", error);
    
    if (error.response) {
      // Server trả về lỗi
      switch (error.response.status) {
        case 401:
          errorMessage.value = "Tên đăng nhập hoặc mật khẩu không đúng";
          break;
        case 400:
          errorMessage.value = error.response.data?.message || "Dữ liệu không hợp lệ";
          break;
        case 404:
          errorMessage.value = "Không tìm thấy tài khoản";
          break;
        case 500:
          errorMessage.value = "Lỗi server, vui lòng thử lại sau";
          break;
        default:
          errorMessage.value = error.response.data?.message || "Đăng nhập thất bại";
      }
    } else if (error.request) {
      // Không nhận được response từ server - CORS hoặc Network error
      errorMessage.value = "⚠️ Không thể kết nối đến server!\n\n" +
        "Vui lòng kiểm tra:\n" +
        "1. Backend đang chạy tại http://localhost:7000\n" +
        "2. CORS đã được cấu hình trong backend\n" +
        "3. Firewall không chặn kết nối";
      console.error("🔴 BACKEND KHÔNG CHẠY hoặc CORS CHƯA CẤU HÌNH!");
    } else {
      errorMessage.value = "Có lỗi xảy ra: " + error.message;
    }
  } finally {
    isLoading.value = false;
  }
}
</script>

<style scoped>
.login-container {
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 20px;
}

.login-box {
  background: white;
  border-radius: 16px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
  width: 100%;
  max-width: 420px;
  padding: 40px;
  animation: slideUp 0.3s ease-out;
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.login-header {
  text-align: center;
  margin-bottom: 30px;
}

.login-header h2 {
  color: #2c3e50;
  font-size: 28px;
  margin-bottom: 8px;
}

.login-header p {
  color: #7f8c8d;
  font-size: 14px;
}

.error-message {
  background: #fee;
  color: #c33;
  padding: 12px;
  border-radius: 8px;
  margin-bottom: 20px;
  border-left: 4px solid #c33;
  font-size: 14px;
}

.login-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.form-group {
  display: flex;
  flex-direction: column;
}

.form-group label {
  color: #2c3e50;
  font-weight: 600;
  margin-bottom: 8px;
  font-size: 14px;
  display: flex;
  align-items: center;
  gap: 6px;
}

.form-group .icon {
  font-size: 16px;
}

.form-group input[type="text"],
.form-group input[type="password"] {
  padding: 12px 16px;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  font-size: 15px;
  transition: all 0.3s;
  outline: none;
}

.form-group input[type="text"]:focus,
.form-group input[type="password"]:focus {
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.form-group input:disabled {
  background-color: #f5f5f5;
  cursor: not-allowed;
}

.checkbox-group {
  flex-direction: row;
  align-items: center;
}

.checkbox-group label {
  margin: 0;
  font-weight: normal;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
}

.checkbox-group input[type="checkbox"] {
  width: 18px;
  height: 18px;
  cursor: pointer;
}

.btn-login {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  padding: 14px;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
  margin-top: 10px;
}

.btn-login:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
}

.btn-login:active:not(:disabled) {
  transform: translateY(0);
}

.btn-login:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.login-footer {
  text-align: center;
  margin-top: 24px;
}

.forgot-password {
  color: #667eea;
  text-decoration: none;
  font-size: 14px;
  font-weight: 500;
  transition: color 0.3s;
}

.forgot-password:hover {
  color: #764ba2;
  text-decoration: underline;
}

/* Responsive */
@media (max-width: 480px) {
  .login-box {
    padding: 30px 24px;
  }

  .login-header h2 {
    font-size: 24px;
  }
}
</style>
