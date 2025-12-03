import { useQuery } from '@tanstack/react-query';
import { getStockMovements, getStockMovementsByProduct } from '../services/api';

export const useStockMovements = (page, limit, filters) => {
    // CORRECCIÓN DE SEGURIDAD: Asegurar que los parámetros de paginación siempre sean válidos.
    const finalPage = page > 0 ? page : 1;
    const finalLimit = limit > 0 ? limit : 10; // Forzar a 10 si el límite es inválido.

    const finalFilters = filters || {};
    const { product_sku, ...otherFilters } = finalFilters;

    const queryKey = product_sku
        ? ['stockMovements', product_sku, finalPage, finalLimit]
        : ['stockMovements', finalPage, finalLimit, JSON.stringify(otherFilters)];

    const { data, isLoading, error, refetch } = useQuery({
        queryKey,
        queryFn: async () => {
            console.log(`%c[useStockMovements] queryFn START for key: ${JSON.stringify(queryKey)}`, 'color: #7cfc00');

            try {
                let response;
                const params = { page: finalPage, limit: finalLimit, ...otherFilters };

                if (product_sku) {
                    response = await getStockMovementsByProduct(product_sku, params);
                } else {
                    response = await getStockMovements(params);
                }

                if (!response || !Array.isArray(response.items)) {
                    return { items: [], total: 0 };
                }

                const result = {
                    items: response.items.filter(item => item != null),
                    total: response.total || 0
                };

                return result;

            } catch (apiError) {
                throw apiError;
            }
        },
        keepPreviousData: true,
        staleTime: 1000 * 60 * 5, // 5 minutos
    });

    const movements = data?.items || [];
    const total = data?.total || 0;

    return { movements, total, isLoading, error, refetch };
};