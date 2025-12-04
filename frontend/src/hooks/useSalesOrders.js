import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getSalesOrders, createSalesOrder } from '../services/api';
import { useNotification } from './useNotification';

export const useSalesOrders = ({ page = 1, limit = 10, search = '', status = '', date_from = '', date_to = '' } = {}) => {
    const queryClient = useQueryClient();
    const { showNotification } = useNotification();

    const queryParams = { page, limit, search, status, date_from, date_to };

    const {
        data,
        isLoading,
        error,
        refetch
    } = useQuery({
        queryKey: ['sales-orders', queryParams],
        queryFn: async () => {
            try {
                const params = { page, limit };
                if (search) params.search = search;
                if (status) params.status = status;
                if (date_from) params.date_from = date_from;
                if (date_to) params.date_to = date_to;

                // FIX: The axios interceptor in api.js already returns the data object.
                const response = await getSalesOrders(params);

                // Log the actual response received from the service.
                console.log('Sales Orders API Response (from hook):', response);

                // Ensure we don't return undefined to React Query.
                if (!response) {
                    return { items: [], total: 0, page: 1, pages: 1 };
                }
                
                return response;
            } catch (err) {
                console.error('Error fetching sales orders inside hook:', err);
                throw err;
            }
        },
        keepPreviousData: true,
        staleTime: 5 * 60 * 1000,
        onError: (err) => {
            showNotification('Error al cargar órdenes de venta', 'error');
        }
    });

    const createMutation = useMutation({
        mutationFn: (orderData) => createSalesOrder(orderData),
        onSuccess: () => {
            queryClient.invalidateQueries(['sales-orders']);
            showNotification('Orden de venta creada exitosamente', 'success');
        },
        onError: (err) => {
            const errorMessage = err.response?.data?.detail || 'Error al crear orden de venta';
            showNotification(errorMessage, 'error');
        }
    });

    return {
        orders: data?.items || [],
        pagination: {
            totalPages: data?.pages || 1,
            currentPage: data?.page || 1,
            totalItems: data?.total || 0,
            pageSize: data?.size || limit
        },
        loading: isLoading,
        error,
        refetch,
        createOrder: (data) => createMutation.mutateAsync(data)
    };
};