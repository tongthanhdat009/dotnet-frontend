import axios from "axios";
const API_URL = "http://localhost:7000/api/customer";

export async function getTopCustomers() {
  const res = await axios.get(`${API_URL}/top-buyers`);
  return res.data;
}


