import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

export const getComponents = () => api.get('/components/');
export const createComponent = (data) => api.post('/components/', data);
export const deleteComponent = (id) => api.delete(`/components/${id}/`);

export const getVehicles = () => api.get('/vehicles/');
export const createVehicle = (data) => api.post('/vehicles/', data);
export const deleteVehicle = (id) => api.delete(`/vehicles/${id}/`);

export const getRepairOrders = () => api.get('/repair-orders/');
export const createRepairOrder = (data) => api.post('/repair-orders/', data);
export const addRepairItem = (orderId, data) => api.post(`/repair-orders/${orderId}/add_item/`, data);
export const completeRepairOrder = (orderId) => api.post(`/repair-orders/${orderId}/complete/`);
export const calculateTotal = (orderId) => api.get(`/repair-orders/${orderId}/calculate_total/`);

export const createPayment = (data) => api.post('/payments/', data);

export const getDailyRevenue = () => api.get('/revenue/daily/');
export const getMonthlyRevenue = () => api.get('/revenue/monthly/');
export const getYearlyRevenue = () => api.get('/revenue/yearly/');

export default api;