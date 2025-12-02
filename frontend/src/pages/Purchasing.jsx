import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { receivePurchaseOrder } from '../services/api'; // Importar la función
import { useNotification } from '../hooks/useNotification'; // Importar notificación
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import PurchaseOrdersTable from '../components/features/purchasing/PurchaseOrdersTable';
import PurchaseInvoicesTable from '../components/features/purchasing/PurchaseInvoicesTable';
import InvoiceModal from '../components/features/purchasing/InvoiceModal';
import PurchaseInvoiceDetailModal from '../components/features/purchasing/PurchaseInvoiceDetailModal';
import PaymentModal from '../components/features/purchasing/PaymentModal';
import ReceptionModal from '../components/features/purchasing/ReceptionModal';
import Pagination from '../components/common/Table/Pagination';
import { usePurchaseOrders } from '../hooks/usePurchaseOrders';
import { usePurchaseInvoices } from '../hooks/usePurchaseInvoices';

const Purchasing = () => {
    const [activeTab, setActiveTab] = useState('orders');
    const queryClient = useQueryClient(); // Para invalidar queries
    const { showNotification } = useNotification();

    // State
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(10);
    const [search, setSearch] = useState('');
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [selectedInvoice, setSelectedInvoice] = useState(null);
    const [showInvoiceModal, setShowInvoiceModal] = useState(false);
    const [showInvoiceDetailModal, setShowInvoiceDetailModal] = useState(false);
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [showReceptionModal, setShowReceptionModal] = useState(false);

    // Hooks & Mutations
    const { orders, pagination, loading: ordersLoading } = usePurchaseOrders({ page, limit, search });
    const { invoices, loading: invoicesLoading, createInvoice, registerPayment, registerReception } = usePurchaseInvoices();

    const receiveOrderMutation = useMutation({
        mutationFn: receivePurchaseOrder,
        onSuccess: () => {
            showNotification('¡Mercancía recibida! El stock ha sido actualizado.', 'success');
            queryClient.invalidateQueries(['purchaseOrders']);
            queryClient.invalidateQueries(['products']); // Clave para actualizar el stock visible en Inventario
        },
        onError: (err) => {
            showNotification(err.response?.data?.detail || 'Error al recibir la mercancía', 'error');
        }
    });

    // Handlers
    const handleReceiveOrder = (order) => {
        if (window.confirm(`¿Confirma la recepción de todos los productos para la orden ${order.order_number}?`)) {
            receiveOrderMutation.mutate(order.id);
        }
    };

    const handleCreateInvoice = async (invoiceData) => {
        try {
            await createInvoice(invoiceData);
            setShowInvoiceModal(false);
            setActiveTab('invoices');
        } catch (error) { /* Error handled by hook */ }
    };

    const handleRegisterPayment = async (paymentData) => {
        try {
            await registerPayment(selectedInvoice.invoice_number, paymentData);
            setShowPaymentModal(false);
        } catch (error) { /* Error handled by hook */ }
    };

    const handleReception = async (receptionData) => {
        try {
            await registerReception(selectedInvoice.invoice_number, receptionData);
            setShowReceptionModal(false);
        } catch (error) { /* Error handled by hook */ }
    };

    return (
        <div style={{ padding: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <div>
                    <h1 style={{ color: 'white', marginBottom: '0.5rem' }}>Compras</h1>
                    <p style={{ color: '#94a3b8' }}>Gestión de órdenes de compra y facturas de proveedores</p>
                </div>
                <Button onClick={() => showNotification('Próximamente: Crear Orden de Compra', 'info')}>
                    + Nueva Orden
                </Button>
            </div>

            <div style={{ marginBottom: '2rem', borderBottom: '1px solid #334155' }}>
                 <button
                    onClick={() => setActiveTab('orders')}
                    style={{
                        padding: '1rem 2rem', background: 'none', border: 'none',
                        borderBottom: activeTab === 'orders' ? '2px solid #3b82f6' : 'none',
                        color: activeTab === 'orders' ? '#3b82f6' : '#94a3b8', cursor: 'pointer', fontWeight: '500'
                    }}
                >
                    Órdenes de Compra
                </button>
                <button
                    onClick={() => setActiveTab('invoices')}
                    style={{
                        padding: '1rem 2rem', background: 'none', border: 'none',
                        borderBottom: activeTab === 'invoices' ? '2px solid #3b82f6' : 'none',
                        color: activeTab === 'invoices' ? '#3b82f6' : '#94a3b8', cursor: 'pointer', fontWeight: '500'
                    }}
                >
                    Facturas de Proveedores
                </button>
            </div>

            {activeTab === 'orders' ? (
                <>
                    <div style={{ maxWidth: '400px', marginBottom: '1rem' }}>
                        <Input placeholder="Buscar orden o proveedor..." value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} />
                    </div>
                    <PurchaseOrdersTable
                        orders={orders}
                        loading={ordersLoading || receiveOrderMutation.isLoading}
                        onView={(order) => console.log('Ver orden', order)}
                        onCreateInvoice={(order) => { setSelectedOrder(order); setShowInvoiceModal(true); }}
                        onReceive={handleReceiveOrder} // <-- Conectado
                    />
                    {pagination && <Pagination current={pagination.current} total={pagination.total} onChange={setPage} pageSize={limit} onPageSizeChange={(newSize) => { setLimit(newSize); setPage(1); }} />}
                </>
            ) : (
                <PurchaseInvoicesTable
                    invoices={invoices}
                    loading={invoicesLoading}
                    onView={(invoice) => { setSelectedInvoice(invoice); setShowInvoiceDetailModal(true); }}
                    onRegisterPayment={(invoice) => { setSelectedInvoice(invoice); setShowPaymentModal(true); }}
                    onReceive={(invoice) => { setSelectedInvoice(invoice); setShowReceptionModal(true); }}
                />
            )}

            {/* Modals */}
            <InvoiceModal visible={showInvoiceModal} order={selectedOrder} loading={invoicesLoading} onClose={() => setShowInvoiceModal(false)} onSubmit={handleCreateInvoice} />
            <PaymentModal visible={showPaymentModal} invoice={selectedInvoice} loading={invoicesLoading} onClose={() => setShowPaymentModal(false)} onSubmit={handleRegisterPayment} />
            <ReceptionModal visible={showReceptionModal} invoice={selectedInvoice} loading={invoicesLoading} onClose={() => setShowReceptionModal(false)} onSubmit={handleReception} />
            <PurchaseInvoiceDetailModal visible={showInvoiceDetailModal} invoice={selectedInvoice} onClose={() => setShowInvoiceDetailModal(false)} />
        </div>
    );
};

export default Purchasing;
