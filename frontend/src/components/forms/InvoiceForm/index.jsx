import React, { useState } from 'react';

import Input from '../../common/Input';
import Button from '../../common/Button';
import PaymentSection from './PaymentSection';
import { useNotification } from '../../../hooks/useNotification';
import { formatCurrency } from '../../../utils/formatters';

const InvoiceForm = ({
    order,
    onSubmit,
    onCancel,
    loading = false,
    type = 'sale' // 'sale' or 'purchase'
}) => {
    const { showNotification } = useNotification();

    const [formData, setFormData] = useState({
        invoice_number: '',
        invoice_date: new Date().toISOString().split('T')[0],
        payment_status: 'PENDING',
        payment_method: '',
        amount_paid: 0,
        payment_date: null,
        notes: ''
    });

    const isPurchase = type === 'purchase';
    const entityLabel = isPurchase ? 'Proveedor' : 'Cliente';
    const entityName = isPurchase ? order.supplier_name : order.customer_name;
    const entityRuc = isPurchase ? order.supplier_ruc : order.customer_ruc;

    const handleSubmit = (e) => {
        e.preventDefault();

        if (!formData.invoice_number) {
            showNotification('El número de factura es obligatorio', 'error');
            return;
        }

        // Validar montos si está pagado
        if (formData.payment_status === 'PAID' && formData.amount_paid < order.total_amount) {
            showNotification('El monto pagado debe cubrir el total para marcar como Pagado', 'warning');
            // No bloqueamos, solo advertimos
        }

        // Build payload matching backend InvoiceCreation schema
        const payload = {
            order_number: order.order_number,  // Send order_number, not order_id
            invoice_number: formData.invoice_number,
            invoice_date: formData.invoice_date,
            payment_status: formData.payment_status,
            amount_paid: formData.amount_paid,
            payment_date: formData.payment_date
        };

        onSubmit(payload);
    };

    return (
        <form onSubmit={handleSubmit}>
            <div style={{
                padding: '1.5rem',
                backgroundColor: '#1e293b',
                borderRadius: '0.5rem',
                marginBottom: '1.5rem'
            }}>
                <h3 style={{ marginBottom: '1rem', color: '#e2e8f0', fontSize: '1.1rem' }}>
                    Detalles de Facturación
                </h3>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <Input
                        label="Número de Factura"
                        value={formData.invoice_number}
                        onChange={(e) => setFormData({ ...formData, invoice_number: e.target.value })}
                        placeholder="F001-00000001"
                        required
                    />

                    <Input
                        label="Fecha de Emisión"
                        type="date"
                        value={formData.invoice_date}
                        onChange={(e) => setFormData({ ...formData, invoice_date: e.target.value })}
                        required
                    />
                </div>

                <div style={{ marginTop: '1rem', padding: '1rem', backgroundColor: '#0f172a', borderRadius: '0.375rem' }}>
                    <p style={{ color: '#94a3b8', fontSize: '0.875rem' }}>{entityLabel}</p>
                    <p style={{ color: 'white', fontWeight: '500' }}>{entityName} ({entityRuc})</p>

                    <p style={{ color: '#94a3b8', fontSize: '0.875rem', marginTop: '0.5rem' }}>Total a Facturar</p>
                    <p style={{ color: '#10b981', fontWeight: 'bold', fontSize: '1.25rem' }}>
                        {formatCurrency(order.total_amount)}
                    </p>
                </div>
            </div>

            <PaymentSection
                value={formData}
                onChange={setFormData}
                totalAmount={order.total_amount}
            />

            <div style={{
                display: 'flex',
                justifyContent: 'flex-end',
                gap: '1rem',
                marginTop: '2rem',
                paddingTop: '1rem',
                borderTop: '1px solid #334155'
            }}>
                <Button
                    variant="secondary"
                    onClick={onCancel}
                    disabled={loading}
                >
                    Cancelar
                </Button>
                <Button
                    type="submit"
                    variant="primary"
                    disabled={loading}
                >
                    {loading ? 'Generando...' : 'Generar Factura'}
                </Button>
            </div>
        </form>
    );
};

export default InvoiceForm;
