import axios from "axios";

const API_URL = "http://localhost:7000/api/rolepermission";

export const getAllRolePermissions = async () => {
    const response = await axios.get(API_URL);
    return response.data;
}

export const assignPermissionToRole = async (roleId, permissionId) => {
    const response = await axios.post(`${API_URL}/assign`, {
        RoleId: roleId,
        PermissionId: permissionId
    });
    return response.data;
}

export const removePermissionFromRole = async (roleId, permissionId) => {
    const response = await axios.delete(`${API_URL}/remove`, {
        data: {
            RoleId: roleId,
            PermissionId: permissionId
        }
    });
    return response.data;
}