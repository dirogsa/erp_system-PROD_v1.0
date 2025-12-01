import { useState, useEffect, useCallback } from 'react';
import { salesService } from '../services/api';
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
            // CORRECTED: Changed getInvoices to getSalesInvoices
            const response = await salesService.getSalesInvoices();
            setInvoices(response.data.items || []);
        } catch (err) {
            setError(err);
            showNotification('Error al cargar facturas de venta', 'error');
            console.error('Error fetching sales invoices:', err);
        } finally {
            setLoading(false);
        }
    }, [showNotification]);

    const createInvoice = useCallback(async (invoiceData) => {
        setLoading(true);
        try {
            // NOTE: This function name might also need correction in the future.
            const response = await salesService.createSalesInvoiceFromOrder(invoiceData.orderId, invoiceData);
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

    const registerPayment = useCallback(async (invoiceNumber, paymentData) => {
        setLoading(true);
        try {
            // CORRECTED: Changed registerPayment to registerSalesPayment
            await salesService.registerSalesPayment(invoiceNumber, paymentData);
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

    // NOTE: This function might not exist in the service and could cause future errors.
    const createDispatchGuide = useCallback(async (invoiceNumber, guideData) => {
        setLoading(true);
        try {
            await salesService.createDispatchGuide(invoiceNumber, guideData);
            await fetchInvoices();
            showNotification('Guía de despacho generada exitosamente', 'success');
        } catch (err) {
            const errorMessage = err.response?.data?.detail || 'Error al generar guía de despacho';
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
        createInvoice,
        registerPayment,
        createDispatchGuide
    };
};
