import axios from "axios";

const API_URL = "http://localhost:7000/api/products";

// Named exports
export async function getProducts() {
  const res = await axios.get(API_URL);
  return res.data;
}

export async function getTotalProducts() {
  const res = await axios.get(`${API_URL}/total`);
  
  return res.data;
}

export async function getTopProducts() {
  const res = await axios.get(`${API_URL}/top-products`);
  return res.data;
}

export async function addProduct(product) {
  const res = await axios.post(API_URL, product);
  return res.data;
}

export async function updateProduct(id, product) {
  const res = await axios.put(`${API_URL}/${id}`, product);
  return res.data;
}

export async function deleteProduct(id) {
  const res = await axios.delete(`${API_URL}/${id}`);
  return res.data;
}
