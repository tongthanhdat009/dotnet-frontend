import axios from "axios";

const API_URL = "http://localhost:7000/api/users";



// Named exports
export async function getUsers() {
  const res = await axios.get(API_URL);
  return res.data;
}

export async function getTotalUsers() {
  const res = await axios.get(`${API_URL}/total`);
  return res.data;
}


export async function addUser(user) {
    const res = await axios.post(API_URL, user);
    return res.data;
}
export async function updateUser(id, user) {
    const res = await axios.put(`${API_URL}/${id}`, user);
    return res.data;
}
export async function deleteUser(id) {
    const res = await axios.delete(`${API_URL}/${id}`);
    return res.data;
}