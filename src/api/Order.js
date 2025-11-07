import apiClient from "./apiClient";

const API_URL = "/api";

/**
 * Central Order API helpers used by the POS view.
 * Keep only order-related endpoints here (promotions, create order, fetch order).
 */

export const fetchPromotions = async () => {
  try {
    const res = await apiClient.get(`${API_URL}/order/promotions`);
    return res.data;
  } catch (error) {
    console.error("Failed to fetch promotions:", error);
    throw error;
  }
};

export const createOrder = async (orderData) => {
  try {
    const res = await apiClient.post(`${API_URL}/order`, orderData);
    return res.data;
  } catch (error) {
    console.error("Failed to create order:", error);
    throw error;
  }
};

export const fetchOrderById = async (orderId) => {
  try {
    console.log("Fetching order with id:", `${API_URL}/order/${orderId}`);
    const response = await apiClient.get(`${API_URL}/order/${orderId}`);
    return response.data;
  } catch (error) {
    console.error(`Failed to fetch order with id ${orderId}:`, error);
    throw error;
  }
};

// Get all orders
export const fetchOrders = async () => {
  try {
    const res = await apiClient.get(`${API_URL}/order`);
    return res.data;
  } catch (error) {
    console.error("Failed to fetch orders:", error);
    throw error;
  }
};

// Cancel an order; tries common REST patterns; returns server response
export const cancelOrder = async (orderId) => {
  try {
    // Theo BE: PUT http://localhost:7000/api/Order/{id}/cancel, trả về { message, error? }
    const res = await apiClient.put(`${API_URL}/Order/${orderId}/cancel`);
    console.log(`Order ${orderId} cancelled successfully:`, res.data);
    return res.data; // { message: string, error?: string }
  } catch (error) {
    // Ném ra với message rõ ràng từ BE nếu có
    const msg =
      error?.response?.data?.message || error?.message || "Cancel order failed";
    console.error(`Failed to cancel order ${orderId}:`, msg);
    throw error;
  }
};

export async function getOrders() {
  const res = await apiClient.get(API_URL);
  return res.data;
}

export async function getTotalOrders() {
  const res = await apiClient.get(`${API_URL}/order/total`);
  return res.data;
}

export async function getOrdersByYear(year) {
  const res = await apiClient.get(`${API_URL}/order/orders-by-year/${year}`);
  return res.data;
}

export async function getSalesByYear(year) {
  const res = await apiClient.get(`${API_URL}/order/sales-by-year/${year}`);
  return res.data;
}

export async function getPeakTimeStats() {
  const res = await apiClient.get(`${API_URL}/order/peak-time`);
  return res.data;
}
