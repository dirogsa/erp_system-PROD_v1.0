import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getSalesInvoices, createSalesInvoice, recordSalesPayment } from '../services/api';
import { useNotification } from './useNotification';

export const useSalesInvoices = ({ page = 1, limit = 10, search = '', status = '', date_from = '', date_to = '' } = {}) => {
    const queryClient = useQueryClient();
    const { showNotification } = useNotification();
    
    const queryParams = { page, limit, search, status, date_from, date_to };

    const { data, isLoading, error, refetch } = useQuery({
        queryKey: ['sales-invoices', queryParams],
        queryFn: async () => {
            try {
                // Construct params, sending only those with values
                const params = { page, limit };
                if (search) params.search = search;
                if (status) params.status = status;
                if (date_from) params.date_from = date_from;
                if (date_to) params.date_to = date_to;
                
                // FIX: Interceptor in api.js returns data directly
                const response = await getSalesInvoices(params);

                console.log('Sales Invoices API Response (from hook):', response);
                
                // Return a default structure if the response is falsy
                if (!response) {
                    return { items: [], total: 0, page: 1, pages: 1 };
                }
                
                return response;
            } catch (err) {
                console.error('Error fetching sales invoices inside hook:', err);
                throw err;
            }
        },
        keepPreviousData: true,
        staleTime: 5 * 60 * 1000,
        onError: (err) => {
            showNotification('Error al cargar las facturas de venta', 'error');
        }
    });

    const createInvoiceMutation = useMutation({
        mutationFn: (invoiceData) => createSalesInvoice(invoiceData),
        onSuccess: () => {
            queryClient.invalidateQueries(['sales-invoices']);
            showNotification('Factura registrada exitosamente', 'success');
        },
        onError: (err) => {
            const errorMessage = err.response?.data?.detail || 'Error al registrar la factura';
            showNotification(errorMessage, 'error');
        }
    });

    const recordPaymentMutation = useMutation({
        mutationFn: ({ invoiceId, paymentData }) => recordSalesPayment(invoiceId, paymentData),
        onSuccess: () => {
            queryClient.invalidateQueries(['sales-invoices']);
            showNotification('Pago registrado exitosamente', 'success');
        },
        onError: (err) => {
            const errorMessage = err.response?.data?.detail || 'Error al registrar el pago';
            showNotification(errorMessage, 'error');
        }
    });

    return {
        invoices: data?.items || [],
        pagination: {
            totalPages: data?.pages || 1,
            currentPage: data?.page || 1,
            totalItems: data?.total || 0,
            pageSize: data?.size || limit
        },
        loading: isLoading,
        error,
        refetch,
        createInvoice: (data) => createInvoiceMutation.mutateAsync(data),
        registerPayment: (invoiceId, paymentData) => recordPaymentMutation.mutateAsync({ invoiceId, paymentData }),
    };
};