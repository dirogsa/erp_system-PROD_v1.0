# System Architecture

This document outlines the file and folder structure of the ERP system, divided into its two main components: the backend and the frontend.

## Backend

The backend is a Python application built with the FastAPI framework. It handles the business logic, data processing, and communication with the database.

```
backend/
├── app/
│   ├── __init__.py
│   ├── config.py
│   ├── database.py
│   ├── exceptions/
│   │   ├── __init__.py
│   │   ├── business_exceptions.py
│   │   └── handlers.py
│   ├── models/
│   │   ├── __init__.py
│   │   ├── inventory.py
│   │   ├── purchasing.py
│   │   └── sales.py
│   ├── routes/
│   │   ├── __init__.py
│   │   ├── inventory.py
│   │   ├── purchasing.py
│   │   └── sales.py
│   ├── schemas/
│   │   ├── __init__.py
│   │   ├── common.py
│   │   ├── inventory_schemas.py
│   │   ├── purchasing_schemas.py
│   │   └── sales_schemas.py
│   └── services/
│       ├── __init__.py
│       ├── inventory_service.py
│       ├── purchasing_service.py
│       └── sales_service.py
├── main.py
├── requirements.txt
├── test_connection.py
└── test_db_connection.py
```

## Frontend

The frontend is a single-page application (SPA) built with React and Vite. It provides the user interface for interacting with the system.

```
frontend/
├── public/
│   └── vite.svg
├── src/
│   ├── assets/
│   │   └── react.svg
│   ├── components/
│   │   ├── common/
│   │   │   ├── Alert.jsx
│   │   │   ├── Badge.jsx
│   │   │   ├── Button.jsx
│   │   │   ├── Input.jsx
│   │   │   ├── Loading.jsx
│   │   │   ├── MeasurementInput.jsx
│   │   │   ├── ProductSearchInput.jsx
│   │   │   ├── Receipt.jsx
│   │   │   ├── Select.jsx
│   │   │   ├── Table/
│   │   │   │   └── Pagination.jsx
│   │   │   ├── Table.jsx
│   │   │   └── receipt.css
│   │   ├── features/
│   │   │   ├── customers/
│   │   │   │   └── CustomerForm.jsx
│   │   │   ├── inventory/
│   │   │   │   ├── InventoryAdjustmentModal.jsx
│   │   │   │   ├── LossesSection.jsx
│   │   │   │   ├── ProductForm.jsx
│   │   │   │   ├── ProductsTable.jsx
│   │   │   │   └── TransfersSection.jsx
│   │   │   ├── purchasing/
│   │   │   │   ├── InvoiceModal.jsx
│   │   │   │   ├── PaymentModal.jsx
│   │   │   │   ├── PurchaseInvoiceDetailModal.jsx
│   │   │   │   ├── PurchaseInvoicesTable.jsx
│   │   │   │   ├── PurchaseOrdersTable.jsx
│   │   │   │   └── ReceptionModal.jsx
│   │   │   ├── sales/
│   │   │   │   ├── DispatchModal.jsx
│   │   │   │   ├── InvoiceDetailModal.jsx
│   │   │   │   ├── InvoiceModal.jsx
│   │   │   │   ├── InvoicesTable.jsx
│   │   │   │   ├── OrderDetailModal.jsx
│   │   │   │   ├── OrdersTable.jsx
│   │   │   │   ├── PaymentModal.jsx
│   │   │   │   └── ProductHistoryModal.jsx
│   │   │   └── suppliers/
│   │   │       └── SupplierForm.jsx
│   │   ├── forms/
│   │   │   ├── InvoiceForm/
│   │   │   │   ├── PaymentSection.jsx
│   │   │   │   └── index.jsx
│   │   │   ├── OrderForm/
│   │   │   │   ├── CustomerSelector.jsx
│   │   │   │   ├── OrderSummary.jsx
│   │   │   │   ├── ProductItemsSection.jsx
│   │   │   │   └── index.jsx
│   │   │   └── PaymentForm/
│   │   │       └── index.jsx
│   │   ├── ActionButtons.jsx
│   │   ├── Layout.jsx
│   │   └── Modal.jsx
│   ├── context/
│   │   ├── NotificationContainer.jsx
│   │   └── NotificationContext.jsx
│   ├── hooks/
│   │   ├── useCustomers.js
│   │   ├── useLosses.js
│   │   ├── useNotification.js
│   │   ├── useProducts.js
│   │   ├── usePurchaseInvoices.js
│   │   ├── usePurchaseOrders.js
│   │   ├── useSalesInvoices.js
│   │   ├── useSalesOrders.js
│   │   ├── useSuppliers.js
│   │   └── useTransfers.js
│   ├── pages/
│   │   ├── Customers.jsx
│   │   ├── ImportExport.jsx
│   │   ├── Inventory.jsx
│   │   ├── Losses.jsx
│   │   ├── Purchasing.jsx
│   │   ├── Sales.jsx
│   │   ├── Suppliers.jsx
│   │   └── Transfers.jsx
│   ├── services/
│   │   └── api.js
│   ├── utils/
│   │   ├── constants.js
│   │   ├── docIdentifiers.js
│   │   ├── exportPdf.js
│   │   ├── formatters.js
│   │   └── validators.js
│   ├── App.css
│   ├── App.jsx
│   ├── index.css
│   └── main.jsx
├── eslint.config.js
├── index.html
├── package.json
├── package-lock.json
└── vite.config.js
```