import { useState, useEffect, useCallback } from 'react';
// Se importan las funciones correctas
import { getSalesInvoices, createSalesInvoice, recordSalesPayment } from '../services/api';
import { useNotification } from './useNotification'; // Corrected import path

export const useSalesInvoices = ({ page = 1, limit = 10, search = '', status = '', date_from = '', date_to = '' } = {}) => {
    const [invoices, setInvoices] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const { showNotification } = useNotification(); // Corrected hook name

    const fetchInvoices = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            // Clean up parameters, only send them if they have a value
            const params = { page, limit };
            if (search) params.search = search;
            if (status) params.status = status;
            if (date_from) params.date_from = date_from;
            if (date_to) params.date_to = date_to;

            // Se usa la función correcta con los parámetros limpios
            const response = await getSalesInvoices(params);
            setInvoices(response.data.items || []);
        } catch (err) {
            setError(err);
            showNotification('Error al cargar facturas de venta', 'error');
            console.error('Error fetching sales invoices:', err);
        } finally {
            setLoading(false);
        }
    }, [showNotification, page, limit, search, status, date_from, date_to]);

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