import axios from "axios";

const BASE_URL = "http://localhost:7000";

// Tạo axios instance chung cho toàn bộ ứng dụng
const apiClient = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

export default apiClient;
