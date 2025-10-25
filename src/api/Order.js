import axios from 'axios';

const API_URL = 'http://localhost:7000/api';

/**
 * Fetches a single order by its ID to get full details, including order items.
 * @param {number | string} orderId The ID of the order.
 * @returns {Promise<object>} The detailed order object.
 */
export const fetchOrderById = async (orderId) => {
  try {
    const response = await axios.get(`${API_URL}/order/${orderId}`);
    return response.data;
  } catch (error) {
    console.error(`Failed to fetch order with id ${orderId}:`, error);
    throw error;
  }
};
