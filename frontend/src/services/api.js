import axios from 'axios';

// Decide la URL base dependiendo del entorno
const baseURL = import.meta.env.PROD
  ? import.meta.env.VITE_API_BASE_URL
  : 'http://localhost:8000';

console.log(`API Base URL: ${baseURL}`); // Log para depuración

const api = axios.create({
  baseURL: baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const inventoryService = {
  // Products
  getProducts: (page = 1, limit = 10, search = '', category = '') =>
    api.get('/inventory/products', { params: { skip: (page - 1) * limit, limit, search, category } }),
  searchProducts: (payload) => api.post('/inventory/products/search', payload),
  getProductById: (id) => api.get(`/inventory/products/${id}`),
  createProduct: (product) => api.post('/inventory/products', product),
  updateProduct: (id, product) => api.put(`/inventory/products/${id}`, product),
  getProductHistory: (id) => api.get(`/inventory/products/${id}/history`),

  // Categories
  getCategories: () => api.get('/inventory/categories'),

  // Losses
  registerLoss: (lossData) => api.post('/inventory/losses', lossData),
  getLossesReport: (params) => api.get('/inventory/losses/report', { params }),

  // Transfers
  getWarehouses: () => api.get('/inventory/warehouses'),
  registerTransfer: (transferData) => api.post('/inventory/transfer-out', transferData),
};

export const purchasingService = {
  // Orders
  createOrder: (order) => api.post('/purchasing/orders', order),
  getOrders: (page = 1, limit = 50, search = '', status = '', date_from = '', date_to = '') =>
    api.get('/purchasing/orders', { params: { skip: (page - 1) * limit, limit, search, status, date_from, date_to } }),
  getOrderById: (id) => api.get(`/purchasing/orders/${id}`),
  updateOrderStatus: (id, status, details) => api.put(`/purchasing/orders/${id}/status`, { status, details }),

  // Invoices
  getInvoices: (page = 1, limit = 50, search = '', status = '', date_from = '', date_to = '') =>
    api.get('/purchasing/invoices', { params: { skip: (page - 1) * limit, limit, search, status, date_from, date_to } }),
  getInvoiceById: (id) => api.get(`/purchasing/invoices/${id}`),
  createInvoiceFromOrder: (orderId, invoiceData) => api.post(`/purchasing/orders/${orderId}/invoice`, invoiceData),

  // Payments
  registerPayment: (invoiceId, paymentData) => api.post(`/purchasing/invoices/${invoiceId}/payments`, paymentData),

  // Suppliers
  getSuppliers: (page = 1, limit = 50, search = '') =>
    api.get('/purchasing/suppliers', { params: { skip: (page - 1) * limit, limit, search } }),
  createSupplier: (supplier) => api.post('/purchasing/suppliers', supplier),
  updateSupplier: (id, supplier) => api.put(`/purchasing/suppliers/${id}`, supplier),
};


export const salesService = {
  // Customers
  getCustomers: (page = 1, limit = 50, search = '') =>
    api.get('/sales/customers', { params: { skip: (page - 1) * limit, limit, search } }),
  createCustomer: (customer) => api.post('/sales/customers', customer),
  updateCustomer: (id, customer) => api.put(`/sales/customers/${id}`, customer),

  // Sales Orders
  getSalesOrders: (page = 1, limit = 50, search = '', status = '', date_from = '', date_to = '') =>
    api.get('/sales/orders', { params: { skip: (page - 1) * limit, limit, search, status, date_from, date_to } }),
  getSalesOrderById: (id) => api.get(`/sales/orders/${id}`),
  createSalesOrder: (order) => api.post('/sales/orders', order),
  updateSalesOrderStatus: (id, status, details) => api.put(`/sales/orders/${id}/status`, { status, details }),

  // Sales Invoices
  getSalesInvoices: (page = 1, limit = 50, search = '', status = '', date_from = '', date_to = '') =>
    api.get('/sales/invoices', { params: { skip: (page - 1) * limit, limit, search, status, date_from, date_to } }),
  getSalesInvoiceById: (id) => api.get(`/sales/invoices/${id}`),
  createSalesInvoiceFromOrder: (orderId, invoiceData) => api.post(`/sales/orders/${orderId}/invoice`, invoiceData),

  // Payments
  registerSalesPayment: (invoiceId, paymentData) => api.post(`/sales/invoices/${invoiceId}/payments`, paymentData),
};


export const importExportService = {
  uploadFile: (file, type, mode) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post(`/inventory/import?type=${type}&mode=${mode}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
};
