import React, { useState } from 'react';
import Button from '../components/common/Button';
import Loading from '../components/common/Loading';
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

    // Pagination & Search State
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(10);
    const [search, setSearch] = useState('');

    // Modals state
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [selectedInvoice, setSelectedInvoice] = useState(null);
    const [showOrderModal, setShowOrderModal] = useState(false);
    const [showInvoiceModal, setShowInvoiceModal] = useState(false);
    const [showInvoiceDetailModal, setShowInvoiceDetailModal] = useState(false);
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [showDispatchModal, setShowDispatchModal] = useState(false);

    // Hooks
    const {
        orders,
        pagination,
        loading: ordersLoading,
        createOrder,
        deleteOrder
    } = useSalesOrders({ page, limit, search });

    const {
        invoices,
        loading: invoicesLoading,
        createInvoice,
        registerPayment,
        createDispatchGuide
    } = useSalesInvoices();

    // Handlers
    const handleCreateOrder = async (orderData) => {
        try {
            await createOrder(orderData);
            setShowCreateOrder(false);
        } catch (error) {
            // Error handled by hook
        }
    };

    const handleCreateInvoice = async (invoiceData) => {
        try {
            await createInvoice(invoiceData);
            setShowInvoiceModal(false);
            setActiveTab('invoices'); // Switch to invoices tab
        } catch (error) {
            // Error handled by hook
        }
    };

    const handleRegisterPayment = async (paymentData) => {
        try {
            await registerPayment(selectedInvoice.invoice_number, paymentData);
            setShowPaymentModal(false);
        } catch (error) {
            // Error handled by hook
        }
    };

    const handleDispatch = async (dispatchData) => {
        try {
            await createDispatchGuide(selectedInvoice.invoice_number, dispatchData);
            setShowDispatchModal(false);
        } catch (error) {
            // Error handled by hook
        }
    };

    if (showCreateOrder) {
        return (
            <div style={{ padding: '2rem' }}>
                <div style={{ marginBottom: '2rem' }}>
                    <h1 style={{ color: 'white', marginBottom: '0.5rem' }}>Nueva Orden de Venta</h1>
                    <p style={{ color: '#94a3b8' }}>Complete los datos para crear una nueva orden</p>
                </div>
                <div style={{ backgroundColor: '#1e293b', padding: '2rem', borderRadius: '0.5rem' }}>
                    <OrderForm
                        onSubmit={handleCreateOrder}
                        onCancel={() => setShowCreateOrder(false)}
                        loading={ordersLoading}
                    />
                </div>
            </div>
        );
    }

    return (
        <div style={{ padding: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <div>
                    <h1 style={{ color: 'white', marginBottom: '0.5rem' }}>Ventas</h1>
                    <p style={{ color: '#94a3b8' }}>Gestión de órdenes y facturación</p>
                </div>
                <Button onClick={() => setShowCreateOrder(true)}>
                    + Nueva Orden
                </Button>
            </div>

            <div style={{ marginBottom: '2rem', borderBottom: '1px solid #334155' }}>
                <button
                    onClick={() => setActiveTab('orders')}
                    style={{
                        padding: '1rem 2rem',
                        background: 'none',
                        border: 'none',
                        borderBottom: activeTab === 'orders' ? '2px solid #3b82f6' : 'none',
                        color: activeTab === 'orders' ? '#3b82f6' : '#94a3b8',
                        cursor: 'pointer',
                        fontWeight: '500'
                    }}
                >
                    Órdenes de Venta
                </button>
                <button
                    onClick={() => setActiveTab('invoices')}
                    style={{
                        padding: '1rem 2rem',
                        background: 'none',
                        border: 'none',
                        borderBottom: activeTab === 'invoices' ? '2px solid #3b82f6' : 'none',
                        color: activeTab === 'invoices' ? '#3b82f6' : '#94a3b8',
                        cursor: 'pointer',
                        fontWeight: '500'
                    }}
                >
                    Facturas
                </button>
            </div>

            {activeTab === 'orders' ? (
                <>
                    <div style={{ maxWidth: '400px', marginBottom: '1rem' }}>
                        <Input
                            placeholder="Buscar orden o cliente..."
                            value={search}
                            onChange={(e) => {
                                setSearch(e.target.value);
                                setPage(1);
                            }}
                        />
                    </div>

                    <OrdersTable
                        orders={orders}
                        loading={ordersLoading}
                        onView={(order) => {
                            setSelectedOrder(order);
                            setShowOrderModal(true);
                        }}
                        onCreateInvoice={(order) => {
                            setSelectedOrder(order);
                            setShowInvoiceModal(true);
                        }}
                        onDelete={(order) => {
                            if (window.confirm('¿Está seguro de eliminar esta orden?')) {
                                deleteOrder(order.order_number);
                            }
                        }}
                    />

                    <Pagination
                        current={pagination.current}
                        total={pagination.total}
                        onChange={setPage}
                        pageSize={limit}
                        onPageSizeChange={(newSize) => {
                            setLimit(newSize);
                            setPage(1);
                        }}
                    />
                </>
            ) : (
                <InvoicesTable
                    invoices={invoices}
                    loading={invoicesLoading}
                    onView={(invoice) => {
                        setSelectedInvoice(invoice);
                        setShowInvoiceDetailModal(true);
                    }}
                    onRegisterPayment={(invoice) => {
                        setSelectedInvoice(invoice);
                        setShowPaymentModal(true);
                    }}
                    onDispatch={(invoice) => {
                        setSelectedInvoice(invoice);
                        setShowDispatchModal(true);
                    }}
                />
            )}

            {/* Modals */}
            <OrderDetailModal
                visible={showOrderModal}
                order={selectedOrder}
                onClose={() => setShowOrderModal(false)}
            />

            <InvoiceModal
                visible={showInvoiceModal}
                order={selectedOrder}
                loading={invoicesLoading}
                onClose={() => setShowInvoiceModal(false)}
                onSubmit={handleCreateInvoice}
            />

            <InvoiceDetailModal
                visible={showInvoiceDetailModal}
                invoice={selectedInvoice}
                onClose={() => setShowInvoiceDetailModal(false)}
            />

            <PaymentModal
                visible={showPaymentModal}
                invoice={selectedInvoice}
                loading={invoicesLoading}
                onClose={() => setShowPaymentModal(false)}
                onSubmit={handleRegisterPayment}
            />

            <DispatchModal
                visible={showDispatchModal}
                invoice={selectedInvoice}
                loading={invoicesLoading}
                onClose={() => setShowDispatchModal(false)}
                onSubmit={handleDispatch}
            />
        </div>
    );
};

export default Sales;
