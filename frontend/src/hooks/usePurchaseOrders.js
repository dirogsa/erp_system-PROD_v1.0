import { useQuery } from '@tanstack/react-query';
import { getPurchaseOrders } from '../services/api';
import { useNotification } from './useNotification'; // Corrected import path

export const usePurchaseOrders = (page = 1, limit = 10, search = '', status = '', date_from = '', date_to = '') => {
    const { showNotification } = useNotification(); // Corrected hook name

    const {
        data,
        isLoading,
        error,
        refetch
    } = useQuery({
        queryKey: ['purchase-orders', { page, limit, search, status, date_from, date_to }],
        queryFn: async () => {
            try {
                // Clean up parameters, only send them if they have a value
                const params = { page, limit };
                if (search) params.search = search;
                if (status) params.status = status;
                if (date_from) params.date_from = date_from;
                if (date_to) params.date_to = date_to;

                return await getPurchaseOrders(params);
            } catch (err) {
                console.error('Error fetching purchase orders:', err);
                throw err;
            }
        },
        keepPreviousData: true,
        staleTime: 5 * 60 * 1000, // 5 minutes
        onError: (err) => {
            console.error('React Query Error:', err);
            showNotification('Error al cargar órdenes de compra', 'error');
        }
    });

    return {
        orders: data?.items ?? [],
        total: data?.total ?? 0,
        isLoading,
        error,
        refetch,
        pageCount: data ? Math.ceil(data.total / limit) : 0,
    };
};