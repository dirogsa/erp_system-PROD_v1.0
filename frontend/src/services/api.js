import axios from 'axios';

// --- Configuración dinámica de la URL de la API ---
// Lee la URL base de la API desde las variables de entorno de Vite.
// Si la variable no está definida, por defecto apunta al localhost para desarrollo.
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

// Log para verificar qué URL se está utilizando (muy útil para depurar despliegues)
console.log(`API Base URL: ${API_BASE_URL}`);

// --- Instancia de Axios ---
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Importante para que CORS funcione con credenciales
});

// --- Interceptores (opcional, para depuración) ---
api.interceptors.request.use(request => {
  // console.log('Starting Request:', request.method, request.url);
  return request;
});

api.interceptors.response.use(response => {
  return response;
}, error => {
  console.error('API Response Error:', error.response?.data || error.message);
  return Promise.reject(error);
});


// --- Endpoints de la API (sin cambios) ---

export const getProducts = (params) => api.get('/api/v1/inventory/products', { params });
export const getProductById = (id) => api.get(`/api/v1/inventory/products/${id}`);
export const createProduct = (product) => api.post('/api/v1/inventory/products', product);
export const updateProduct = (id, product) => api.put(`/api/v1/inventory/products/${id}`, product);

export const getSuppliers = () => api.get('/api/v1/purchasing/suppliers');
export const createSupplier = (supplier) => api.post('/api/v1/purchasing/suppliers', supplier);

export const getPurchaseOrders = (params) => api.get('/api/v1/purchasing/orders', { params });
export const createPurchaseOrder = (order) => api.post('/api/v1/purchasing/orders', order);
export const receivePurchaseOrder = (orderId) => api.post(`/api/v1/purchasing/orders/${orderId}/receive`);

export const getPurchaseInvoices = () => api.get('/api/v1/purchasing/invoices');
export const createPurchaseInvoice = (invoice) => api.post('/api/v1/purchasing/invoices', invoice);

export const getSalesOrders = (params) => api.get('/api/v1/sales/orders', { params });
export const createSalesOrder = (order) => api.post('/api/v1/sales/orders', order);

export const getSalesInvoices = () => api.get('/api/v1/sales/invoices');
export const createSalesInvoice = (invoice) => api.post('/api/v1/sales/invoices', invoice);

export const getCustomers = () => api.get('/api/v1/sales/customers');
export const createCustomer = (customer) => api.post('/api/v1/sales/customers', customer);

export const getStockMovements = (productId) => api.get(`/api/v1/inventory/stock-movements/product/${productId}`);
export const adjustInventory = (data) => api.post('/api/v1/inventory/stock-movements/adjust', data);

export default api;
