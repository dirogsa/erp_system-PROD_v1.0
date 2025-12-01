import axios from 'axios';

// Use environment variable for backend URL, fallback to localhost for development
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000',
  headers: {
    'Content-Type': 'application/json',
  },
});

export const inventoryService = {
  getProducts: (page = 1, limit = 50, search = '', category = '') =>
    api.get('/inventory/products', { params: { skip: (page - 1) * limit, limit, search, category } }),
  createProduct: (product, initial_stock = 0) => api.post(`/inventory/products?initial_stock=${initial_stock}`, product),
  deleteProduct: (sku) => api.delete(`/inventory/products/${sku}`),
  updateProduct: (sku, product, new_stock = null) => {
    const params = new_stock !== null ? `?new_stock=${new_stock}` : '';
    return api.put(`/inventory/products/${sku}${params}`, product);
  },
  importProducts: (file) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post('/inventory/import', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },
  exportProducts: (template = 'current') => api.get(`/inventory/export?template=${template}`, { responseType: 'blob' }),
  searchProducts: (payload) => api.post('/inventory/products/search', payload),

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

  // Invoices
  createInvoice: (invoiceData) => api.post('/purchasing/invoices', invoiceData),
  getInvoices: (page = 1, limit = 50, search = '', payment_status = '', date_from = '', date_to = '') =>
    api.get('/purchasing/invoices', { params: { skip: (page - 1) * limit, limit, search, payment_status, date_from, date_to } }),
  registerPayment: (invoiceNumber, paymentData) => api.post(`/purchasing/invoices/${invoiceNumber}/payments`, paymentData),

  // Guides (NUEVO)
  createReceptionGuide: (invoiceNumber, guideData) => api.post(`/purchasing/invoices/${invoiceNumber}/receive`, guideData),

  // Suppliers
  getSuppliers: () => api.get('/purchasing/suppliers'),
  createSupplier: (supplier) => api.post('/purchasing/suppliers', supplier),
  deleteSupplier: (id) => api.delete(`/purchasing/suppliers/${id}`),
  updateSupplier: (id, supplier) => api.put(`/purchasing/suppliers/${id}`, supplier),
};

export const salesService = {
  // Orders
  createOrder: (order) => api.post('/sales/orders', order),
  getSales: (page = 1, limit = 50, search = '', status = '', date_from = '', date_to = '') =>
    api.get('/sales/orders', { params: { skip: (page - 1) * limit, limit, search, status, date_from, date_to } }),

  getProductHistory: (sku) => api.get(`/sales/products/${sku}/history`),

  // Invoices
  createInvoice: (invoiceData) => api.post('/sales/invoices', invoiceData),
  getInvoices: (page = 1, limit = 50, search = '', payment_status = '', date_from = '', date_to = '') =>
    api.get('/sales/invoices', { params: { skip: (page - 1) * limit, limit, search, payment_status, date_from, date_to } }),
  registerPayment: (invoiceNumber, paymentData) => api.post(`/sales/invoices/${invoiceNumber}/payments`, paymentData),

  // Guides (NUEVO)
  createDispatchGuide: (invoiceNumber, guideData) => api.post(`/sales/invoices/${invoiceNumber}/dispatch`, guideData),

  // Customers
  getCustomers: () => api.get('/sales/customers'),
  getCustomerByRuc: (ruc) => api.get(`/sales/customers/by-ruc/${ruc}`),
  createCustomer: (customer) => api.post('/sales/customers', customer),
  updateCustomer: (id, customer) => api.put(`/sales/customers/${id}`, customer),
  deleteCustomer: (id) => api.delete(`/sales/customers/${id}`),

  // Customer Branches
  addCustomerBranch: (customerId, branch) => api.post(`/sales/customers/${customerId}/branches`, branch),
  getCustomerBranches: (customerId) => api.get(`/sales/customers/${customerId}/branches`),
  updateCustomerBranch: (customerId, branchIndex, branch) => api.put(`/sales/customers/${customerId}/branches/${branchIndex}`, branch),
  deleteCustomerBranch: (customerId, branchIndex) => api.delete(`/sales/customers/${customerId}/branches/${branchIndex}`),
};

export default api;
