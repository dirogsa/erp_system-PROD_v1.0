import axios from 'axios';

// Apunta directamente a la URL pública del backend
const API_BASE_URL = 'https://8000-firebase-ecommerce-1764621325358.cluster-lr6dwlc2lzbcctqhqorax5zmro.cloudworkstations.dev';

console.log('URL de API (Final Corrected):', API_BASE_URL);

// --- Instancia de Axios ---
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

// --- Interceptores para depuración ---
api.interceptors.request.use(request => {
  console.log('Starting Request:', JSON.stringify(request, null, 2));
  return request;
});

api.interceptors.response.use(response => {
  console.log('Response:', JSON.stringify(response.data, null, 2));
  return response;
}, error => {
  console.error('Response Error:', JSON.stringify(error.toJSON ? error.toJSON() : error, null, 2));
  console.error('Original Error Object:', error);
  return Promise.reject(error);
});


// --- Endpoints de la API ---

const V1_PREFIX = '/api/v1';

// --- Inventario ---
export const getProducts = (params) => api.get(`${V1_PREFIX}/inventory/products`, { params });
export const createProduct = (data) => api.post(`${V1_PREFIX}/inventory/products`, data);
export const updateProduct = (id, data) => api.put(`${V1_PREFIX}/inventory/products/${id}`, data);
export const deleteProduct = (id) => api.delete(`${V1_PREFIX}/inventory/products/${id}`);
export const getProductById = (id) => api.get(`${V1_PREFIX}/inventory/products/${id}`);
export const getProductHistory = (id, params) => api.get(`${V1_PREFIX}/inventory/products/${id}/history`, { params });
export const getWarehouses = () => api.get(`${V1_PREFIX}/inventory/warehouses`);
export const getTransfers = (params) => api.get(`${V1_PREFIX}/inventory/transfers`, { params });
export const createTransfer = (data) => api.post(`${V1_PREFIX}/inventory/transfers`, data);
export const receiveTransfer = (id) => api.patch(`${V1_PREFIX}/inventory/transfers/${id}/receive`);
export const importProducts = (file) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post(`${V1_PREFIX}/inventory/products/batch`, formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });
};
export const exportProducts = (type) => api.get(`${V1_PREFIX}/inventory/products/export?type=${type}`, { responseType: 'blob' });

// --- Movimientos de Stock (Nuevo) ---
export const getStockMovements = (params) => api.get(`${V1_PREFIX}/inventory/stock-movements`, { params });
export const createStockMovement = (data) => api.post(`${V1_PREFIX}/inventory/stock-movements`, data);


// --- Ventas ---
export const getSalesOrders = (params) => api.get(`${V1_PREFIX}/sales/sales-orders`, { params });
export const createSalesOrder = (data) => api.post(`${V1_PREFIX}/sales/sales-orders`, data);
export const getSalesOrderById = (id) => api.get(`${V1_PREFIX}/sales/sales-orders/${id}`);
export const updateSalesOrder = (id, data) => api.put(`${V1_PREFIX}/sales/sales-orders/${id}`, data);
export const cancelSalesOrder = (id) => api.patch(`${V1_PREFIX}/sales/sales-orders/${id}/cancel`);
export const dispatchSalesOrder = (id, data) => api.patch(`${V1_PREFIX}/sales/sales-orders/${id}/dispatch`, data);
export const getSalesInvoices = (params) => api.get(`${V1_PREFIX}/sales/sales-invoices`, { params });
export const createSalesInvoice = (data) => api.post(`${V1_PREFIX}/sales/sales-invoices`, data);
export const getSalesInvoiceById = (id) => api.get(`${V1_PREFIX}/sales/sales-invoices/${id}`);
export const recordSalesPayment = (id, data) => api.patch(`${V1_PREFIX}/sales/sales-invoices/${id}/pay`, data);

// --- Compras ---
export const getPurchaseOrders = (params) => api.get(`${V1_PREFIX}/purchasing/orders`, { params });
export const createPurchaseOrder = (data) => api.post(`${V1_PREFIX}/purchasing/orders`, data);
export const getPurchaseOrderById = (id) => api.get(`${V1_PREFIX}/purchasing/orders/${id}`);
// Corregido para coincidir con el nuevo endpoint del backend
export const receivePurchaseOrder = (id) => api.post(`${V1_PREFIX}/purchasing/orders/${id}/receive`);
export const getPurchaseInvoices = (params) => api.get(`${V1_PREFIX}/purchasing/invoices`, { params });
export const createPurchaseInvoice = (data) => api.post(`${V1_PREFIX}/purchasing/invoices`, data);
export const recordPurchasePayment = (id, data) => api.patch(`${V1_PREFIX}/purchasing/invoices/${id}/pay`, data);

// --- Clientes y Proveedores ---
export const getCustomers = (params) => api.get(`${V1_PREFIX}/sales/customers`, { params });
export const createCustomer = (data) => api.post(`${V1_PREFIX}/sales/customers`, data);
export const updateCustomer = (id, data) => api.put(`${V1_PREFIX}/sales/customers/${id}`, data);
export const getSuppliers = (params) => api.get(`${V1_PREFIX}/purchasing/suppliers`, { params });
export const createSupplier = (data) => api.post(`${V1_PREFIX}/purchasing/suppliers`, data);
export const updateSupplier = (id, data) => api.put(`${V1_PREFIX}/purchasing/suppliers/${id}`, data);
