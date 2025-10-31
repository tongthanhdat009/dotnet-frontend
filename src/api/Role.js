import axios from "axios";

const API_URL = "http://localhost:7000/api/role";

export const getAllRoles = async () => {
    const response = await axios.get(API_URL);
    return response.data;
};

export const createRole = async (role) => {
    const response = await axios.post(API_URL, role);
    return response.data;
};

export const updateRole = async (roleId, role) => {
    const response = await axios.put(`${API_URL}/${roleId}`, role);
    return response.data;
};

export const deleteRole = async (roleId) => {
    const response = await axios.delete(`${API_URL}/${roleId}`);
    return response.data;
};