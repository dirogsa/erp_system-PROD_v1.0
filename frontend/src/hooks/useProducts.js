import { useQuery } from '@tanstack/react-query';
import { getProducts } from '../services/api';

export const useProducts = (filters = {}) => {
    // Log para ver los filtros crudos que recibe el hook
    console.log('[useProducts] Hook initiated. Raw filters received:', filters);

    const { page = 1, limit = 10, search, sortBy = 'sku', sortOrder = 'asc' } = filters;

    // Defensa contra filtro de búsqueda inválido
    if (typeof search === 'function') {
        console.warn(
            '[useProducts] Warning: Invalid search filter received (was a function). ' +
            'This is likely a bug in the calling component. Defaulting to an empty string.'
        );
        search = ''; // Corregir a cadena vacía
    }

    const queryFilters = { search, sortBy, sortOrder };

    return useQuery({
        queryKey: ['products', page, limit, queryFilters],
        queryFn: async () => {
            console.log('[useProducts] Executing queryFn. Filters being sent to API:', { page, limit, ...queryFilters });
            const data = await getProducts(page, limit, queryFilters);
            console.log('[useProducts] API Response Received. Items:', data.items);
            return data;
        },
        keepPreviousData: true,
    });
};