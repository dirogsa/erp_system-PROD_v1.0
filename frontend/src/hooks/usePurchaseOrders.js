import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
// Se importan las funciones correctas
import { getPurchaseOrders, createPurchaseOrder } from '../services/api';
import { useNotification } from './useNotification';

export const usePurchaseOrders = ({ page = 1, limit = 50, search = '', status = '', date_from = '', date_to = '' } = {}) => {
    const queryClient = useQueryClient();
    const { showNotification } = useNotification();

    const {
        data,
        isLoading,
        error,
        refetch
    } = useQuery({
        queryKey: ['purchase-orders', { page, limit, search, status, date_from, date_to }],
        queryFn: async () => {
            try {
                // Se usa la función correcta
                const response = await getPurchaseOrders({ page, limit, search, status, date_from, date_to });
                console.log('Purchase Orders API Response:', response.data);
                return response.data;
            } catch (err) {
                console.error('Error fetching purchase orders:', err);
                throw err;
            }
        },
        keepPreviousData: true,
        staleTime: 5 * 60 * 1000,
        onError: (err) => {
            console.error('React Query Error:', err);
            showNotification('Error al cargar órdenes de compra', 'error');
        }
    });

    const createMutation = useMutation({
        // Se usa la función correcta
        mutationFn: (orderData) => createPurchaseOrder(orderData),
        onSuccess: () => {
            queryClient.invalidateQueries(['purchase-orders']);
            showNotification('Orden de compra creada exitosamente', 'success');
        },
        onError: (err) => {
            console.error('Error creating purchase order:', err);
            const errorMessage = err.response?.data?.detail || 'Error al crear orden de compra';
            showNotification(errorMessage, 'error');
        }
    });

    return {
        orders: data?.items || [],
        pagination: {
            total: data?.pages || 1,
            current: data?.page || 1,
            totalItems: data?.total || 0
        },
        loading: isLoading,
        error,
        refetch,
        createOrder: (data) => createMutation.mutateAsync(data)
    };
};
