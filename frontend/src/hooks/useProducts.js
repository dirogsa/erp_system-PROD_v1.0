import { useQuery } from '@tanstack/react-query';
import { getProducts } from '../services/api';
import { useNotification } from './useNotification';

export const useProducts = (page = 1, limit = 10, search = '') => {
    const { showNotification } = useNotification();

    const {
        data,
        isLoading,
        error,
        refetch
    } = useQuery({
        queryKey: ['products', { page, limit, search }],
        queryFn: async () => {
            try {
                // Se llama a la función directamente
                const response = await getProducts({ page, limit, search });
                console.log('Products API Response:', response.data);
                return response.data;
            } catch (err) {
                console.error('Error fetching products:', err);
                throw err;
            }
        },
        keepPreviousData: true,
        staleTime: 5 * 60 * 1000, // 5 minutes
        onError: (err) => {
            console.error('React Query Error:', err);
            showNotification('Error al cargar productos', 'error');
        }
    });

    return {
        products: data?.items || [],
        total: data?.total || 0,
        isLoading,
        error,
        refetch
    };
};