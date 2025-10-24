import axios from "axios";
const API_URL = "http://localhost:7000/api/categories";

export async function getCategories() {
  const res = await axios.get(API_URL);
  return res.data;
}

export async function getTotalCategories() {
  const res = await axios.get(`${API_URL}/total`);
  return res.data;
}

export async function addCategory(category) {
  const payload = { categoryName: category.name }; // ✅ chỉ gửi tên
  const res = await axios.post(API_URL, payload);
  return res.data;
}

export async function updateCategory(id, category) {
  const res = await axios.put(`${API_URL}/${id}`, {
    categoryName: category.name,
  });
  return res.data;
}

export async function deleteCategory(id) {
  await axios.delete(`${API_URL}/${id}`);
}
