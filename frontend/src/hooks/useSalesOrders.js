import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
// Se importan las funciones correctas
import { getSalesOrders, createSalesOrder } from '../services/api';
import { useNotification } from './useNotification'; // Corrected import path

export const useSalesOrders = ({ page = 1, limit = 50, search = '', status = '', date_from = '', date_to = '' } = {}) => {
    const queryClient = useQueryClient();
    const { showNotification } = useNotification(); // Corrected hook name

    const {
        data,
        isLoading,
        error,
        refetch
    } = useQuery({
        queryKey: ['sales-orders', { page, limit, search, status, date_from, date_to }],
        queryFn: async () => {
            try {
                // Clean up parameters, only send them if they have a value
                const params = { page, limit };
                if (search) params.search = search;
                if (status) params.status = status;
                if (date_from) params.date_from = date_from;
                if (date_to) params.date_to = date_to;

                // Se usa la función correcta con los parámetros limpios
                const response = await getSalesOrders(params);
                console.log('Sales Orders API Response:', response.data);
                return response.data;
            } catch (err) {
                console.error('Error fetching sales orders:', err);
                throw err;
            }
        },
        keepPreviousData: true,
        staleTime: 5 * 60 * 1000,
        onError: (err) => {
            console.error('React Query Error:', err);
            showNotification('Error al cargar órdenes de venta', 'error');
        }
    });

    const createMutation = useMutation({
        // Se usa la función correcta
        mutationFn: (orderData) => createSalesOrder(orderData),
        onSuccess: () => {
            queryClient.invalidateQueries(['sales-orders']);
            showNotification('Orden de venta creada exitosamente', 'success');
        },
        onError: (err) => {
            console.error('Error creating sales order:', err);
            const errorMessage = err.response?.data?.detail || 'Error al crear orden de venta';
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