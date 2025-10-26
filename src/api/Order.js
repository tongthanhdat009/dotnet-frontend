import axios from 'axios';

const API_URL = 'http://localhost:7000/api';

/**
 * Central Order API helpers used by the POS view.
 * Keep only order-related endpoints here (promotions, create order, fetch order).
 */

export const fetchPromotions = async () => {
  try {
    const res = await axios.get(`${API_URL}/order/promotions`);
    return res.data;
  } catch (error) {
    console.error('Failed to fetch promotions:', error);
    throw error;
  }
};

export const createOrder = async (orderData) => {
  try {
    const res = await axios.post(`${API_URL}/order`, orderData);
    return res.data;
  } catch (error) {
    console.error('Failed to create order:', error);
    throw error;
  }
};

export const fetchOrderById = async (orderId) => {
  try {
    console.log("Fetching order with id:", `${API_URL}/order/${orderId}`);
    const response = await axios.get(`${API_URL}/order/${orderId}`);
    return response.data;
  } catch (error) {
    console.error(`Failed to fetch order with id ${orderId}:`, error);
    throw error;
  }
};

// Get all orders
export const fetchOrders = async () => {
  try {
    const res = await axios.get(`${API_URL}/order`);
    return res.data;
  } catch (error) {
    console.error('Failed to fetch orders:', error);
    throw error;
  }
};

// Cancel an order; tries common REST patterns; returns server response
export const cancelOrder = async (orderId) => {
  try {
    // Theo BE: PUT http://localhost:7000/api/Order/{id}/cancel, trả về { message, error? }
    const res = await axios.put(`${API_URL}/Order/${orderId}/cancel`);
    console.log(`Order ${orderId} cancelled successfully:`, res.data);
    return res.data; // { message: string, error?: string }
  } catch (error) {
    // Ném ra với message rõ ràng từ BE nếu có
    const msg = error?.response?.data?.message || error?.message || 'Cancel order failed';
    console.error(`Failed to cancel order ${orderId}:`, msg);
    throw error;
  }
};
