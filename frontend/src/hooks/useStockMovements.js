import { useQuery } from '@tanstack/react-query';
import { getStockMovements, getStockMovementsByProduct } from '../services/api';

export const useStockMovements = (page, limit, filters) => {
    const { product_sku, ...otherFilters } = filters || {};

    const queryKey = product_sku
        ? ['stockMovements', product_sku, page, limit]
        : ['stockMovements', page, limit, otherFilters];

    const { data, isLoading, error, refetch } = useQuery({
        queryKey,
        queryFn: async () => {
            console.log("[useStockMovements] Fetching data with params:", { page, limit, filters });
            try {
                let response;
                if (product_sku) {
                    const params = { page, limit };
                    response = await getStockMovementsByProduct(product_sku, params);
                } else {
                    const params = { page, limit, ...otherFilters };
                    response = await getStockMovements(params);
                }

                console.log("[useStockMovements] Raw API Response:", response);

                if (!response || !response.data || !Array.isArray(response.data.items)) {
                    console.error("[useStockMovements] Invalid API response structure.", response);
                    return { items: [], total: 0 };
                }

                const rawItems = response.data.items;
                const filteredItems = rawItems.filter(item => item != null);

                if (rawItems.length !== filteredItems.length) {
                    console.warn("[useStockMovements] Filtered out null/undefined items from API response.");
                }
                
                console.log("[useStockMovements] Cleaned data being stored in query cache:", { items: filteredItems, total: response.data.total });

                return {
                    items: filteredItems,
                    total: response.data.total || 0
                };
            } catch (apiError) {
                console.error("[useStockMovements] API call failed:", apiError);
                throw apiError;
            }
        },
        keepPreviousData: true,
        staleTime: 5 * 60 * 1000, // 5 minutes
    });

    const movements = data?.items || [];
    const total = data?.total || 0;

    console.log("[useStockMovements] Data being returned to component:", { movements, total, isLoading, error });

    return {
        movements,
        total,
        isLoading,
        error,
        refetch,
    };
};