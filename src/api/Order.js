import axios from "axios";
const API_URL = "http://localhost:7000/api/order";

export async function getOrders() {
  const res = await axios.get(API_URL);
  return res.data;
}

export async function getTotalOrders() {
  const res = await axios.get(`${API_URL}/total`);
  return res.data;
}

export async function getOrdersByYear(year) {
  const res = await axios.get(`${API_URL}/orders-by-year/${year}`);
  return res.data;
}

export async function getSalesByYear(year) {
  const res = await axios.get(`${API_URL}/sales-by-year/${year}`);
  return res.data;
}

export async function getPeakTimeStats() {
  const res = await axios.get(`${API_URL}/peak-time`);
  return res.data;
}

