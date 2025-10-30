import axios from "axios";

const API_URL = "http://localhost:7000/api/permissions";

export async function getAllPermissions() {
  const response = await axios.get(API_URL);
  return response.data;
}

export async function createPermission(permission) {
  const response = await axios.post(API_URL, permission);
  return response.data;
}

export async function updatePermission(id, permission) {
  const response = await axios.put(`${API_URL}/${id}`, permission);
  return response.data;
}

export async function deletePermission(id) {
  const response = await axios.delete(`${API_URL}/${id}`);
  return response.data;
}