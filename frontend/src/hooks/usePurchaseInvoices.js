import { useState, useEffect, useCallback } from 'react';
// Se importan las funciones correctas
import { getPurchaseInvoices, createPurchaseInvoice, recordPurchasePayment } from '../services/api';
import { useNotification } from './useNotification';

export const usePurchaseInvoices = () => {
    const [invoices, setInvoices] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const { showNotification } = useNotification();

    const fetchInvoices = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            // Se usa la función correcta
            const response = await getPurchaseInvoices();
            setInvoices(response.data.items || []);
        } catch (err) {
            setError(err);
            showNotification('Error al cargar facturas de compra', 'error');
            console.error('Error fetching purchase invoices:', err);
        } finally {
            setLoading(false);
        }
    }, [showNotification]);

    const createInvoice = useCallback(async (invoiceData) => {
        setLoading(true);
        try {
            // Se usa la función correcta
            const response = await createPurchaseInvoice(invoiceData);
            await fetchInvoices();
            showNotification('Factura de compra registrada exitosamente', 'success');
            return response.data;
        } catch (err) {
            const errorMessage = err.response?.data?.detail || 'Error al registrar factura';
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
            await recordPurchasePayment(invoiceId, paymentData);
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

    // NOTA: La función `registerReception` no existe en el api.js actual.

    useEffect(() => {
        fetchInvoices();
    }, [fetchInvoices]);

    return {
        invoices,
        loading,
        error,
        fetchInvoices,
        createInvoice,
        registerPayment,
    };
};
