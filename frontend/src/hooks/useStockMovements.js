import { useQuery } from '@tanstack/react-query';
import { getStockMovements } from '../services/api';

export const useStockMovements = (page, limit, filters) => {
    const { data, isLoading, error, refetch } = useQuery({
        queryKey: ['stockMovements', page, limit, filters],
        queryFn: () => {
            const params = {
                page,
                limit,
                ...filters,
            };
            return getStockMovements(params).then(res => res.data); // Asegurarse de devolver res.data
        },
        keepPreviousData: true,
        staleTime: 5 * 60 * 1000, // 5 minutos
    });

    return {
        movements: data?.items || [],
        total: data?.total || 0,
        isLoading,
        error,
        refetch,
    };
};