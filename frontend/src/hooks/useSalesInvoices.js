import { useState, useEffect, useCallback } from 'react';
// Se importan las funciones correctas
import { getSalesInvoices, createSalesInvoice, recordSalesPayment } from '../services/api';
import { useNotification } from './useNotification';

export const useSalesInvoices = () => {
    const [invoices, setInvoices] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const { showNotification } = useNotification();

    const fetchInvoices = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            // Se usa la función correcta
            const response = await getSalesInvoices();
            setInvoices(response.data.items || []);
        } catch (err) {
            setError(err);
            showNotification('Error al cargar facturas de venta', 'error');
            console.error('Error fetching sales invoices:', err);
        } finally {
            setLoading(false);
        }
    }, [showNotification]);

    const addInvoice = useCallback(async (invoiceData) => {
        setLoading(true);
        try {
            // Se usa la función correcta
            const response = await createSalesInvoice(invoiceData);
            await fetchInvoices();
            showNotification('Factura registrada exitosamente', 'success');
            return response.data;
        } catch (err) {
            let errorMessage = 'Error al registrar factura';
            if (err.response?.data?.detail) {
                const detail = err.response.data.detail;
                if (Array.isArray(detail)) {
                    errorMessage = detail.map(e => `${e.loc.join('.')}: ${e.msg}`).join(', ');
                } else if (typeof detail === 'string') {
                    errorMessage = detail;
                }
            }
            showNotification(errorMessage, 'error');
            throw err;
        } finally {
            setLoading(false);
        }
    }, [fetchInvoices, showNotification]);

    const registerPayment = useCallback(async (invoiceId, paymentData) => {
        setLoading(true);
        try {
            // Se usa la función correcta
            await recordSalesPayment(invoiceId, paymentData);
            await fetchInvoices();
            showNotification('Pago registrado exitosamente', 'success');
        } catch (err) {
            const errorMessage = err.response?.data?.detail || 'Error al registrar pago';
            showNotification(errorMessage, 'error');
            throw err;
        } finally {
            setLoading(false);
        }
    }, [fetchInvoices, showNotification]);

    // NOTA: La función createDispatchGuide no existe en el api.js actual.

    useEffect(() => {
        fetchInvoices();
    }, [fetchInvoices]);

    return {
        invoices,
        loading,
        error,
        fetchInvoices,
        createInvoice: addInvoice,
        registerPayment,
    };
};
