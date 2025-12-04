import React, { useState } from 'react';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import OrderForm from '../components/forms/OrderForm';
import OrdersTable from '../components/features/sales/OrdersTable';
import InvoicesTable from '../components/features/sales/InvoicesTable';
import OrderDetailModal from '../components/features/sales/OrderDetailModal';
import InvoiceDetailModal from '../components/features/sales/InvoiceDetailModal';
import InvoiceModal from '../components/features/sales/InvoiceModal';
import PaymentModal from '../components/features/sales/PaymentModal';
import DispatchModal from '../components/features/sales/DispatchModal';
import Pagination from '../components/common/Table/Pagination';
import { useSalesOrders } from '../hooks/useSalesOrders';
import { useSalesInvoices } from '../hooks/useSalesInvoices';

const Sales = () => {
    const [activeTab, setActiveTab] = useState('orders');
    const [showCreateOrder, setShowCreateOrder] = useState(false);

    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(10);
    const [search, setSearch] = useState('');

    const [selectedOrder, setSelectedOrder] = useState(null);
    const [selectedInvoice, setSelectedInvoice] = useState(null);
    const [showOrderModal, setShowOrderModal] = useState(false);
    const [showInvoiceModal, setShowInvoiceModal] = useState(false);
    const [showInvoiceDetailModal, setShowInvoiceDetailModal] = useState(false);
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [showDispatchModal, setShowDispatchModal] = useState(false);

    const { orders, pagination: ordersPagination, loading: ordersLoading, createOrder } = useSalesOrders({ page, limit, search });
    const { invoices, pagination: invoicesPagination, loading: invoicesLoading, createInvoice, registerPayment } = useSalesInvoices({ page, limit, search });

    // FINAL FIX: Add a robust default value for pagination objects to prevent NaN errors on initial render.
    const finalOrdersPagination = ordersPagination || { currentPage: 1, totalPages: 1, pageSize: limit };
    const finalInvoicesPagination = invoicesPagination || { currentPage: 1, totalPages: 1, pageSize: limit };

    const handleCreateOrder = async (orderData) => {
        await createOrder(orderData);
        setShowCreateOrder(false);
    };

    const handleCreateInvoice = async (invoiceData) => {
        await createInvoice(invoiceData);
        setShowInvoiceModal(false);
        setActiveTab('invoices');
    };

    const handleRegisterPayment = async (paymentData) => {
        await registerPayment(selectedInvoice.id, paymentData);
        setShowPaymentModal(false);
    };

    if (showCreateOrder) {
        return (
            <div style={{ padding: '2rem' }}>
                <div style={{ marginBottom: '2rem' }}><h1 style={{ color: 'white', marginBottom: '0.5rem' }}>Nueva Orden de Venta</h1><p style={{ color: '#94a3b8' }}>Complete los datos para crear una nueva orden</p></div>
                <div style={{ backgroundColor: '#1e293b', padding: '2rem', borderRadius: '0.5rem' }}><OrderForm onSubmit={handleCreateOrder} onCancel={() => setShowCreateOrder(false)} loading={ordersLoading} /></div>
            </div>
        );
    }

    return (
        <div style={{ padding: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <div><h1 style={{ color: 'white', marginBottom: '0.5rem' }}>Ventas</h1><p style={{ color: '#94a3b8' }}>Gestión de órdenes y facturación</p></div>
                <Button onClick={() => setShowCreateOrder(true)}>+ Nueva Orden</Button>
            </div>
            <div style={{ maxWidth: '400px', marginBottom: '1rem' }}><Input placeholder="Buscar por cliente, SKU o N° de documento..." value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} /></div>
            <div style={{ marginBottom: '1rem', borderBottom: '1px solid #334155' }}>
                <button onClick={() => { setActiveTab('orders'); setPage(1); }} style={{ padding: '0.75rem 1.5rem', background: 'none', border: 'none', borderBottom: activeTab === 'orders' ? '2px solid #3b82f6' : 'none', color: activeTab === 'orders' ? '#3b82f6' : '#94a3b8', cursor: 'pointer', fontWeight: '500' }}>Órdenes de Venta</button>
                <button onClick={() => { setActiveTab('invoices'); setPage(1); }} style={{ padding: '0.75rem 1.5rem', background: 'none', border: 'none', borderBottom: activeTab === 'invoices' ? '2px solid #3b82f6' : 'none', color: activeTab === 'invoices' ? '#3b82f6' : '#94a3b8', cursor: 'pointer', fontWeight: '500' }}>Facturas</button>
            </div>
            {activeTab === 'orders' ? (
                <>
                    <OrdersTable orders={orders} loading={ordersLoading} onView={(order) => { setSelectedOrder(order); setShowOrderModal(true); }} onCreateInvoice={(order) => { setSelectedOrder(order); setShowInvoiceModal(true); }} />
                    <Pagination current={finalOrdersPagination.currentPage} totalPages={finalOrdersPagination.totalPages} onChange={setPage} pageSize={finalOrdersPagination.pageSize} onPageSizeChange={(newSize) => { setLimit(newSize); setPage(1); }} />
                </>
            ) : (
                <>
                    <InvoicesTable invoices={invoices} loading={invoicesLoading} onView={(invoice) => { setSelectedInvoice(invoice); setShowInvoiceDetailModal(true); }} onRegisterPayment={(invoice) => { setSelectedInvoice(invoice); setShowPaymentModal(true); }} onDispatch={(invoice) => { setSelectedInvoice(invoice); setShowDispatchModal(true); }} />
                    <Pagination current={finalInvoicesPagination.currentPage} totalPages={finalInvoicesPagination.totalPages} onChange={setPage} pageSize={finalInvoicesPagination.pageSize} onPageSizeChange={(newSize) => { setLimit(newSize); setPage(1); }} />
                </>)}
            <OrderDetailModal visible={showOrderModal} order={selectedOrder} onClose={() => setShowOrderModal(false)} />
            <InvoiceModal visible={showInvoiceModal} order={selectedOrder} loading={invoicesLoading} onClose={() => setShowInvoiceModal(false)} onSubmit={handleCreateInvoice} />
            <InvoiceDetailModal visible={showInvoiceDetailModal} invoice={selectedInvoice} onClose={() => setShowInvoiceDetailModal(false)} />
            <PaymentModal visible={showPaymentModal} invoice={selectedInvoice} loading={invoicesLoading} onClose={() => setShowPaymentModal(false)} onSubmit={handleRegisterPayment} />
            <DispatchModal visible={showDispatchModal} invoice={selectedInvoice} onClose={() => {}} onSubmit={() => {}} />
        </div>
    );
};

export default Sales;
