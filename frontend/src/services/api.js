import axios from 'axios';

// --- Configuración dinámica de la URL de la API ---
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
console.log(`API Base URL: ${API_BASE_URL}`);

// --- Instancia de Axios ---
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

// --- Interceptores ---
api.interceptors.request.use(request => request);
api.interceptors.response.use(response => response, error => {
  console.error('API Response Error:', error.response?.data || error.message);
  return Promise.reject(error);
});


// --- Endpoints de la API ---

export const getProducts = (params) => api.get('/api/v1/inventory/products', { params });
export const getProductById = (id) => api.get(`/api/v1/inventory/products/${id}`);
export const createProduct = (product) => api.post('/api/v1/inventory/products/', product);

// --- RUTAS CORREGIDAS --- //
export const updateProduct = (sku, product) => api.put(`/api/v1/inventory/products/${sku}`, product);
export const deleteProduct = (sku) => api.delete(`/api/v1/inventory/products/${sku}`);

export const exportProducts = () => api.get('/api/v1/inventory/products/export/json');
export const importProducts = (products) => api.post('/api/v1/inventory/products/import/json', products);

export const getSuppliers = () => api.get('/api/v1/purchasing/suppliers');
export const createSupplier = (supplier) => api.post('/api/v1/purchasing/suppliers', supplier);
export const updateSupplier = (id, supplier) => api.put(`/api/v1/purchasing/suppliers/${id}`, supplier);

export const getPurchaseOrders = (params) => api.get('/api/v1/purchasing/orders', { params });
export const createPurchaseOrder = (order) => api.post('/api/v1/purchasing/orders', order);
export const receivePurchaseOrder = (orderId) => api.post(`/api/v1/purchasing/orders/${orderId}/receive`);

export const getPurchaseInvoices = () => api.get('/api/v1/purchasing/invoices');
export const createPurchaseInvoice = (invoice) => api.post('/api/v1/purchasing/invoices', invoice);
export const recordPurchasePayment = (invoiceId) => api.post(`/api/v1/purchasing/invoices/${invoiceId}/pay`);

export const getSalesOrders = (params) => api.get('/api/v1/sales/orders', { params });
export const createSalesOrder = (order) => api.post('/api/v1/sales/orders', order);

export const getSalesInvoices = () => api.get('/api/v1/sales/invoices');
export const createSalesInvoice = (invoice) => api.post('/api/v1/sales/invoices', invoice);
export const recordSalesPayment = (invoiceId) => api.post(`/api/v1/sales/invoices/${invoiceId}/pay`);

export const getCustomers = () => api.get('/api/v1/sales/customers');
export const createCustomer = (customer) => api.post('/api/v1/sales/customers', customer);
export const updateCustomer = (id, customer) => api.put(`/api/v1/sales/customers/${id}`, customer);

// --- Stock/Inventory ---
export const getStockMovements = (params) => api.get("/api/v1/inventory/stock-movements/", { params });
export const getStockMovementsByProduct = (productSku) => api.get(`/api/v1/inventory/stock-movements/product/${productSku}`);
export const adjustInventory = (data) => api.post('/api/v1/inventory/stock-movements/adjust', data);
export const getWarehouses = () => api.get('/api/v1/inventory/warehouses');
export const createTransfer = (transferData) => api.post('/api/v1/inventory/stock-movements/transfer', transferData);
export const createStockMovement = (movement) => api.post('/api/v1/inventory/stock-movements/', movement);

export default api;