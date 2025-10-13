import axios from "axios";

const API_URL = "http://localhost:7000/api/suppliers";

// 🔹 Lấy danh sách nhà cung cấp
export async function getSuppliers() {
  const res = await axios.get(API_URL);
  return res.data;
}

// 🔹 Thêm nhà cung cấp mới
export async function addSupplier(supplier) {
  const payload = {
    name: supplier.name,
    phone: supplier.phone,
    email: supplier.email,
    address: supplier.address,
  };
  const res = await axios.post(API_URL, payload);
  return res.data;
}

// 🔹 Cập nhật nhà cung cấp
export async function updateSupplier(id, supplier) {
  const payload = {
    name: supplier.name,
    phone: supplier.phone,
    email: supplier.email,
    address: supplier.address,
  };
  const res = await axios.put(`${API_URL}/${id}`, payload);
  return res.data;
}

// 🔹 Xóa nhà cung cấp
export async function deleteSupplier(id) {
  await axios.delete(`${API_URL}/${id}`);
}
