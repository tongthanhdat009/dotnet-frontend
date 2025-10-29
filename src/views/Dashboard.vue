<template>
  <div class="dashboard-page">
    <h2>📊 Dashboard</h2>
    
    <div class="cards">
      <div class="card">
        <div class="title">
          <span>Tổng users</span>
          <User style="color: #FFA500"/>
        </div>
        <p>{{ totalUsers }}</p>
      </div>
      <div class="card">
        <div class="title">
          <span>Tổng đơn hàng</span>
          <ReceiptText style="color: #FFA500"/>
        </div>
        <p>{{ totalOrders }}</p>
      </div>
      <div class="card">
        <div class="title">
          <span>Tổng sản phẩm</span>
          <Package style="color: #FFA500"/>
        </div>
        <p>{{ totalProducts }}</p>
      </div>
      <div class="card">
        <div class="title">
          <span>Tổng loại sản phẩm</span>
          <ChartBarStacked style="color: #FFA500"/>
        </div>
        <p>{{ totalCategories }}</p>
      </div>
    </div>
    <div class="search-bar">
      <label for="year">Xem biểu đồ năm:</label>
      <select v-model="time" id="year">
        <option v-for="y in years" :key="y" :value="y">{{ y }}</option>
      </select>
    </div>
    <div class="charts">
      <div class="salesChart">
        <div style="display: flex">
          <h3>Tổng doanh thu năm {{ time }}: </h3>
          <h3 style="color: #FCA300; margin-left: 10px">{{ formatPrice(totalSalesInYear) }} VND</h3>
        </div>
        <canvas ref="salesChart"></canvas>
      </div>
      <div class="ordersChart">
        <div style="display: flex">
          <h3>Tổng đơn hàng năm {{ time }}: </h3>
          <h3 style="color: #FCA300; margin-left: 10px">{{ formatPrice(totalOrdersInYear) }} Đơn</h3>
        </div>
        <canvas ref="ordersChart"></canvas>
      </div>
    </div>

    <div class="cards mt-50">
      <div class="card">
        <div class="title">
          <span>Sản phẩm phổ biến</span>
          <TrendingUp style="color: #FFA500"/>
        </div>
        <div class="cardRanks">
          <div 
            v-for="(product, index) in popularProducts" 
            :key="index" 
            class="rank"
          >
            <span>{{product.ProductName}}</span>
            <span class="totalOrders">{{product.TotalOrders}} đơn</span>
          </div>
        </div>
      </div>
      <div class="card">
        <div class="title">
          <span>Top khách hàng</span>
          <ChartNoAxesCombined style="color: #FFA500"/>
        </div>
        <div class="cardRanks">
          <div 
            v-for="(user, index) in topUsers" 
            :key="index" 
            class="rank"
          >
            <span>{{user.Name}}</span>
            <span class="totalOrders">{{user.TotalOrders}} đơn</span>
          </div>
        </div>
      </div>
      <div class="card">
        <div class="title">
          <span>Thời gian cao điểm</span>
          <Clock4 style="color: #FFA500"/>
        </div>
        <div class="cardRanks">
          <div 
            v-for="(time, index) in peakTime" 
            :key="index" 
            class="rank"
          >
            <span>{{ time.TimeRange }}</span>
            <span class="totalOrders">{{ time.Percentage }}% đơn</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { getTotalProducts, getTopProducts } from "../api/Product.js";
import { getTotalUsers } from "../api/Users.js";
import { getTotalCategories } from "../api/Category.js";
import { getTotalOrders, getOrdersByYear, getSalesByYear, getPeakTimeStats } from "../api/Order.js";
import { getTopCustomers } from "../api/Customer.js";
import { ref, onMounted, computed, watch } from "vue";
import Chart from "chart.js/auto";

// ----- data
const totalUsers = ref(0);
const totalOrders = ref(0);
const totalProducts = ref(0);
const totalCategories = ref(0);
const popularProducts = ref([]);
const totalSalesInYear = ref(0);
const totalOrdersInYear = ref(0);
const topUsers = ref([]);
const peakTime = ref([]);
const time = ref(new Date().getFullYear());

// ----- Danh sách tháng & năm
const startYear = 2020;
const currentYear = new Date().getFullYear();
const years = computed(() =>
  Array.from({ length: currentYear - startYear + 1 }, (_, i) => startYear + i)
);

const months = ["Tháng 1", "Tháng 2", "Tháng 3", "Tháng 4", "Tháng 5", "Tháng 6", "Tháng 7", "Tháng 8", "Tháng 9", "Tháng 10", "Tháng 11", "Tháng 12"];

// ----- watch()
watch(
  () => time.value,
  async (newVal, oldVal) => {
    await fetchOrdersByYear();
    
  }
);

watch(
  () => time.value,
  async (newVal, oldVal) => {
    await fetchSalesByYear();
    
  }
);



const salesChart = ref(null);
const ordersChart = ref(null);
let salesChartInstance = null;
let ordersChartInstance = null;

// ----- Fetch data
async function fetchOrdersByYear() {
  try {
    const data = await getOrdersByYear(time.value);
    const orderCounts = data.map(item => item.TotalOrders);
    const totalOrdersByYear = orderCounts.reduce((sum, val) => sum + val, 0);
    totalOrdersInYear.value = totalOrdersByYear;
    updateOrdersChart(orderCounts);
  } catch (err) {
    console.error("Lỗi khi tải dữ liệu theo năm:", err);
  }
}

function updateOrdersChart(orderCounts) {
  if (ordersChart.value) {
    ordersChartInstance.data.datasets[0].data = orderCounts;
    ordersChartInstance.update();
  }
}

async function fetchSalesByYear() {
  try {
    const data = await getSalesByYear(time.value);

    const salesAmounts = data.map(item => item.TotalSales);
    const totalSalesByYear = salesAmounts.reduce((sum, val) => sum + val, 0);
    totalSalesInYear.value = totalSalesByYear;
    updateSalesChart(salesAmounts);
  } catch (err) {
    console.error("Lỗi khi tải doanh thu theo năm:", err);
  }
}

function updateSalesChart(salesAmounts) {
  if (salesChartInstance) {
    salesChartInstance.data.datasets[0].data = salesAmounts;
    salesChartInstance.update();
  }
}

async function fetchTotalProducts() {
  try {
    const data = await getTotalProducts();
    totalProducts.value = data; 
  } catch (err) {
    console.error("Lỗi khi tải tổng sản phẩm:", err);
  }
}

async function fetchTopProducts() {
  try {
    const data = await getTopProducts();
    popularProducts.value = data; 
  } catch (err) {
    console.error("Lỗi khi tải top products:", err);
  }
}

async function fetchTotalUsers() {
  try {
    const data = await getTotalUsers();
    totalUsers.value = data; 
  } catch (err) {
    console.error("Lỗi khi tải tổng users:", err);
  }
}

async function fetchTopUsers() {
  try {
    const data = await getTopCustomers();
    topUsers.value = data; 
  } catch (err) {
    console.error("Lỗi khi tải top users:", err);
  }
}

async function fetchTotalOrders() {
  try {
    const data = await getTotalOrders();
    totalOrders.value = data; 
  } catch (err) {
    console.error("Lỗi khi tải total orders:", err);
  }
}


async function fetchTotalCategories() {
  try {
    const data = await getTotalCategories();
    totalCategories.value = data; 
  } catch (err) {
    console.error("Lỗi khi tải total categories:", err);
  }
}

async function fetchPeakTimeStats() {
  try {
    const data = await getPeakTimeStats();
    peakTime.value = data; 
  } catch (err) {
    console.error("Lỗi khi tải peak time stats:", err);
  }
}

// ----- Helpers


function formatPrice(val) {
  return Number(val || 0).toLocaleString("vi-VN");
}


// ----- onMounted()

onMounted(async () => {
  salesChartInstance = new Chart(salesChart.value, {
    type: "bar",
    data: {
      labels: months,
      datasets: [{
        label: "Doanh thu",
        data: Array(12).fill(0),
        backgroundColor: "rgba(39, 174, 96, 0.7)"
      }],
    },
  });

  ordersChartInstance = new Chart(ordersChart.value, {
    type: "bar",
    data: {
      labels: months,
      datasets: [{
        label: "Đơn hàng",
        data: new Array(12).fill(0),
        backgroundColor: "rgba(39, 174, 96, 0.7)",
      }],
    },
  });
  
  await Promise.all([
    fetchTotalProducts(),
    fetchTopProducts(),
    fetchTotalUsers(),
    fetchTopUsers(),
    fetchTotalCategories(),
    fetchTotalOrders(),
    fetchSalesByYear(),
    fetchOrdersByYear(),
    fetchPeakTimeStats()
  ]);

  
});

</script>

<style scoped>
.mt-50 {
  margin-top: 50px;
}

p {
  font-weight: 700;
  font-size: 24px;
}

.title {
  display: flex;
  justify-content: space-between;
}

.dashboard-page { 
  padding: 20px; 
  background: white; 
  border-radius: 10px; 
}

.cards { 
  display: flex; 
  gap: 20px; 
  margin-bottom: 50px; 
}

.card { 
  flex: 1; 
  padding: 15px; 
  background: #27ae60; 
  color: white; 
  border-radius: 10px; 
  text-align: center; 
  box-shadow: 0 2px 6px rgba(0,0,0,0.3); 

}

.charts { 
  background: white; 
  padding: 20px; 
  border-radius: 10px; 
  box-shadow: 0 2px 6px rgba(0,0,0,0.1); 
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.charts .salesChart {
  border-bottom: 1px solid #ccc;
  padding-bottom: 50px;
}

.cardRanks {
  margin-top: 10px;
  font-size: 16px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.cardRanks .rank {
  display: flex;
  justify-content: space-between;
}

.cardRanks .rank .totalOrders{
  color: #FCA300;
}
</style>
