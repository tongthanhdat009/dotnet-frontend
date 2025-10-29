import axios from "axios";

const CUSTOMER_API_URL = "http://localhost:7000/api/customer";

// Fetch list of customers from backend
export async function fetchCustomers() {
	const res = await axios.get(CUSTOMER_API_URL);
	return res.data;
}

// Create a new customer
export async function addCustomer(payload) {
	const res = await axios.post(CUSTOMER_API_URL, payload);
 	return res.data;
}

// Update an existing customer by id
export async function updateCustomer(id, payload) {
	const url = `${CUSTOMER_API_URL}/${id}`;
	const res = await axios.put(url, payload);
	return res.data;
}

// Delete customer by id
export async function deleteCustomer(id) {
  const url = `${CUSTOMER_API_URL}/${id}`;
  const res = await axios.delete(url);
  return res.data;
}

// Get orders for a specific customer
export async function getCustomerOrders(id) {
	// Use order API to get orders by customer
	const url = `http://localhost:7000/api/order/customer/${id}`;
	const res = await axios.get(url);
	return res.data;
}

export async function getTopCustomers() {
  const res = await axios.get(`${CUSTOMER_API_URL}/top-buyers`);
  return res.data;
}


