import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { NotificationProvider } from './context/NotificationContext';
import Layout from './components/Layout';

// Import Pages
import Inventory from './pages/Inventory';
import Transfers from './pages/Transfers';
import Purchasing from './pages/Purchasing';
import DebitNotes from './pages/DebitNotes';
import Suppliers from './pages/Suppliers';
import Sales from './pages/Sales';
import CreditNotes from './pages/CreditNotes';
import Customers from './pages/Customers';
import ImportExport from './pages/ImportExport'; // <-- Re-import the page

// --- Placeholder Components ---
const Dashboard = () => (
  <div style={{ padding: '2rem' }}>
    <h1>Bienvenido al ERP</h1>
    <p>Selecciona un módulo del menú lateral para comenzar.</p>
  </div>
);

const Placeholder = ({ title }) => (
    <div style={{ padding: '2rem' }}>
      <h1>{title}</h1>
      <p>Esta página está en construcción. Los enlaces del menú ya están listos para cuando el componente sea creado.</p>
    </div>
);

// --- React Query Client ---
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 0,
      staleTime: 5 * 60 * 1000, // 5 minutes
      onError: (error) => {
        console.error('React Query Global Error:', error);
      },
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <NotificationProvider>
        <BrowserRouter>
          <Layout>
            <Routes>
              <Route path="/" element={<Dashboard />} />

              {/* Inventory Routes */}
              <Route path="/inventory" element={<Navigate replace to="/inventory/products" />} />
              <Route path="/inventory/products" element={<Inventory />} />
              <Route path="/inventory/categories" element={<Placeholder title="Categorías" />} />
              <Route path="/inventory/warehouses" element={<Placeholder title="Almacenes" />} />
              <Route path="/inventory/transfers" element={<Transfers />} />

              {/* Purchasing Routes */}
              <Route path="/purchasing" element={<Navigate replace to="/purchasing/orders" />} />
              <Route path="/purchasing/orders" element={<Purchasing />} />
              <Route path="/purchasing/invoices" element={<Purchasing />} />
              <Route path="/purchasing/debit-notes" element={<DebitNotes />} />
              <Route path="/purchasing/suppliers" element={<Suppliers />} />

              {/* Sales Routes */}
              <Route path="/sales" element={<Navigate replace to="/sales/orders" />} />
              <Route path="/sales/orders" element={<Sales />} />
              <Route path="/sales/invoices" element={<Sales />} />
              <Route path="/sales/credit-notes" element={<CreditNotes />} />
              <Route path="/sales/customers" element={<Customers />} />

              {/* Data Management Routes */}
              <Route path="/data" element={<Navigate replace to="/data/import-export" />} />
              <Route path="/data/import-export" element={<ImportExport />} />
              
              {/* Catch-all for undefined routes - redirects to dashboard */}
              <Route path="*" element={<Navigate replace to="/" />} />
            </Routes>
          </Layout>
        </BrowserRouter>
      </NotificationProvider>
    </QueryClientProvider>
  );
}

export default App;
