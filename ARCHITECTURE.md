# System Architecture

This document outlines the file and folder structure of the ERP system, divided into its two main components: the backend and the frontend.

## Backend

The backend is a Python application built with the FastAPI framework. It handles the business logic, data processing, and communication with the database. The structure follows a **Domain-Driven Design (DDD)** approach, grouping code by business modules rather than by technical function.

- **Modularity:** Code related to a specific business area (e.g., Sales, Purchasing, Inventory) is co-located in its own `routes`, `services`, and `models` files.
- **Scalability:** This separation makes it easier to manage and scale each module independently.
- **Maintainability:** Finding and updating code is more intuitive as it's organized by business logic.

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
│       ├── document_number_service.py
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

- **Component-Based:** The UI is built from reusable and isolated components, organized into `common` (generic) and `features` (module-specific).
- **State Management:** Uses custom hooks (`use...`) to encapsulate data fetching and state logic for each business module, promoting reusability and separation of concerns.
- **Clear Separation:** A dedicated `/services/api.js` utility handles all communication with the backend, keeping data fetching logic separate from the UI components.

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
│   │   │   ├── ImageWithFallback.jsx
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
│   │   │   │   └── ...
│   │   │   ├── purchasing/
│   │   │   │   └── ...
│   │   │   ├── sales/
│   │   │   │   └── ...
│   │   │   └── suppliers/
│   │   │       └── SupplierForm.jsx
│   │   ├── forms/
│   │   │   └── ...
│   │   ├── Layout.jsx
│   │   └── Modal.jsx
│   ├── context/
│   │   └── NotificationContext.jsx
│   ├── hooks/
│   │   ├── useCustomers.js
│   │   ├── useProducts.js
│   │   ├── useSuppliers.js
│   │   └── ...
│   ├── pages/
│   │   ├── Customers.jsx
│   │   ├── Inventory.jsx
│   │   ├── Purchasing.jsx
│   │   ├── Sales.jsx
│   │   ├── Suppliers.jsx
│   │   └── ...
│   ├── services/
│   │   └── api.js
│   ├── utils/
│   │   └── ...
│   ├── App.jsx
│   └── main.jsx
├── index.html
└── vite.config.js
```
