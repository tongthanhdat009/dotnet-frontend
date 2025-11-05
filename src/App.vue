<template>
  <div class="app" :class="{ 'no-sidebar': isLoginPage }">
    <!-- Sidebar - chỉ hiển thị khi KHÔNG phải trang login -->
    <aside v-if="!isLoginPage" class="sidebar">
      <h2>🏪 Store</h2>
      <nav>
        <router-link to="/profile">👤 Profile</router-link>
        <router-link to="/dashboard">📊 Dashboard</router-link>
        <router-link to="/pos">🛒 POS</router-link>
        <router-link to="/users">� Users</router-link>
        <router-link to="/customers">👨‍👩‍👧‍� Customers</router-link>
        <router-link to="/suppliers">🚚 Suppliers</router-link>
        <router-link to="/categories">🏷️ Categories</router-link>
        <router-link to="/products">📦 Products</router-link>
        <router-link to="/inventory">🏭 Inventory</router-link>
        <router-link to="/promotions">🏷 Promotions</router-link>
        <router-link to="/orders">📝 Orders</router-link>
        <router-link to="/order-items">📋 Order Items</router-link>
        <router-link to="/payments">💳 Payments</router-link>
        <router-link to="/role-permission">� RolePermission</router-link>
      </nav>
    </aside>

    <!-- Nội dung chính -->
    <main class="content" :class="{ 'full-width': isLoginPage }">
      <router-view />
    </main>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { useRoute } from 'vue-router';

const route = useRoute();

// Kiểm tra xem có phải trang login không
const isLoginPage = computed(() => route.path === '/login');
</script>

<style scoped>
.app {
  display: flex;
  height: 100vh;
  font-family: "Segoe UI", Arial, sans-serif;
}

/* Khi không có sidebar (trang login) */
.app.no-sidebar {
  display: block;
}

/* Sidebar */
.sidebar {
  width: 230px;
  background: #2c3e50;
  color: #fff;
  padding: 20px 0;
  box-shadow: 2px 0 6px rgba(0, 0, 0, 0.2);
  text-transform: uppercase;
}
.sidebar h2 {
  text-align: center;
  margin-bottom: 32px;
  font-size: 32px;
}
.sidebar nav {
  display: flex;
  flex-direction: column;
}
.sidebar a {
  display: block;
  color: #ecf0f1;
  font-size: 20px;
  text-decoration: none;
  padding: 14px 12px;
  border-radius: 6px;
  transition: background 0.2s, transform 0.1s;
}
.sidebar a:hover {
  background: #34495e;
  transform: translateX(2px);
}
.sidebar a.router-link-exact-active {
  background: #1abc9c;
  color: white;
  font-weight: bold;
}

/* Nội dung */
.content {
  flex: 1;
  padding: 20px;
  background: #f4f6f8;
  overflow-y: auto;
}

/* Nội dung full width khi không có sidebar */
.content.full-width {
  width: 100%;
  padding: 0;
  background: transparent;
}
</style>
