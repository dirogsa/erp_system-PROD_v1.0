import { useQuery } from '@tanstack/react-query';
import { getStockMovements } from '../services/api';

export const useStockMovements = (page, limit, filters) => {
    const queryKey = ['stockMovements', page, limit, filters];

    const { data, isLoading, error, refetch } = useQuery({
        queryKey,
        queryFn: async () => {
            const params = { page, limit, ...filters };
            console.log("[useStockMovements] Fetching data with params:", params);
            try {
                const response = await getStockMovements(params);
                console.log("[useStockMovements] Raw API Response:", response);

                // Defensive Check 1: Ensure response structure is valid
                if (!response || !response.data || !Array.isArray(response.data.items)) {
                    console.error("[useStockMovements] Invalid API response structure.", response);
                    return { items: [], total: 0 }; // Return a safe, empty default
                }

                // Defensive Check 2: Filter out any null or undefined items in the array
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
                console.error("[useStockMovements] API call to getStockMovements failed:", apiError);
                throw apiError; // Re-throw to let react-query handle the error state
            }
        },
        keepPreviousData: true,
        staleTime: 5 * 60 * 1000, // 5 minutes
    });

    // Final check before returning data to the component
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