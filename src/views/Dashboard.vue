<template>
  <div class="dashboard-page">
    <h2>📊 Dashboard</h2>
    
    <div class="cards">
      <div class="card">
        <h3>Sản phẩm</h3>
        <p>{{ productsCount }}</p>
      </div>
      <div class="card">
        <h3>Đơn hàng</h3>
        <p>{{ ordersCount }}</p>
      </div>
      <div class="card">
        <h3>Thanh toán</h3>
        <p>{{ paymentsTotal | formatCurrency }}</p>
      </div>
    </div>

    <div class="charts">
      <canvas ref="salesChart"></canvas>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from "vue";
import Chart from "chart.js/auto";

// Giả lập dữ liệu
const products = ref([{ id: 1 }, { id: 2 }]); 
const orders = ref([{ id: 1, total_amount: 100000 }, { id: 2, total_amount: 200000 }]);
const payments = ref([{ amount: 100000 }, { amount: 200000 }]);

const productsCount = computed(() => products.value.length);
const ordersCount = computed(() => orders.value.length);
const paymentsTotal = computed(() => payments.value.reduce((sum, p) => sum + p.amount, 0));

const salesChart = ref(null);

onMounted(() => {
  new Chart(salesChart.value, {
    type: "bar",
    data: {
      labels: ["Tháng 1", "Tháng 2", "Tháng 3"],
      datasets: [{
        label: "Doanh thu",
        data: [500000, 800000, 600000],
        backgroundColor: "rgba(39, 174, 96, 0.7)"
      }]
    }
  });
});
</script>

<style scoped>
.dashboard-page { padding: 20px; background: white; border-radius: 10px; }
.cards { display: flex; gap: 20px; margin-bottom: 20px; }
.card { flex: 1; padding: 15px; background: #27ae60; color: white; border-radius: 10px; text-align: center; }
.charts { background: white; padding: 20px; border-radius: 10px; box-shadow: 0 2px 6px rgba(0,0,0,0.1); }
</style>
