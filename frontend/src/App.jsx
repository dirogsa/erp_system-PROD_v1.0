import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { NotificationProvider } from './context/NotificationContext';
import Layout from './components/Layout';
import Inventory from './pages/Inventory';
import Purchasing from './pages/Purchasing';
import Sales from './pages/Sales';
import Suppliers from './pages/Suppliers';
import Customers from './pages/Customers';
import ImportExport from './pages/ImportExport';
import Losses from './pages/Losses';
import Transfers from './pages/Transfers';

const Dashboard = () => (
  <div style={{ padding: '2rem' }}>
    <h1>Bienvenido al ERP</h1>
    <p>Selecciona un módulo del menú lateral.</p>
  </div>
);

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 0, // Disable retries to see errors immediately
      staleTime: 5 * 60 * 1000,
      cacheTime: 10 * 60 * 1000,
      onError: (error) => {
        console.error('React Query Global Error:', error);
        console.error('Error details:', {
          message: error.message,
          response: error.response?.data,
          status: error.response?.status
        });
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
              <Route path="/inventory" element={<Inventory />} />
              <Route path="/suppliers" element={<Suppliers />} />
              <Route path="/purchasing" element={<Purchasing />} />
              <Route path="/sales" element={<Sales />} />
              <Route path="/customers" element={<Customers />} />
              <Route path="/import-export" element={<ImportExport />} />
              <Route path="/losses" element={<Losses />} />
              <Route path="/transfers" element={<Transfers />} />
            </Routes>
          </Layout>
        </BrowserRouter>
      </NotificationProvider>
    </QueryClientProvider>
  );
}

export default App;
