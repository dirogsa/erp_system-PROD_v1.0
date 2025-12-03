import { useQuery } from '@tanstack/react-query';
import { getPurchaseInvoices } from '../services/api';
import { useNotification } from './useNotification'; // Corrected import path
import { useEffect } from 'react';

export const usePurchaseInvoices = (page = 1, limit = 10, search = '', status = '', date_from = '', date_to = '') => {
    const { showNotification } = useNotification(); // Corrected hook name

    const {
        data,
        isLoading,
        error,
        refetch
    } = useQuery({
        queryKey: ['purchase-invoices', { page, limit, search, status, date_from, date_to }],
        queryFn: async () => {
            // Clean up parameters, only send them if they have a value
            const params = { page, limit };
            if (search) params.search = search;
            if (status) params.status = status;
            if (date_from) params.date_from = date_from;
            if (date_to) params.date_to = date_to;

            const response = await getPurchaseInvoices(params);
            return response.data;
        },
        keepPreviousData: true,
        staleTime: 5 * 60 * 1000, // 5 minutes
    });

    useEffect(() => {
        if (error) {
            console.error("Error fetching purchase invoices:", error);
            showNotification('Error al cargar facturas de compra', 'error');
        }
    }, [error, showNotification]);

    return {
        invoices: data?.items ?? [],
        total: data?.total ?? 0,
        isLoading,
        error,
        refetch,
        pageCount: data ? Math.ceil(data.total / limit) : 0,
    };
};