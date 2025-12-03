import { useQuery } from '@tanstack/react-query';
import { getProducts } from '../services/api';

/**
 * Hook para obtener productos paginados desde la API.
 * @param {number} page - El número de página a solicitar.
 * @param {number} limit - El número de items por página.
 * @param {string} search - El término de búsqueda.
 * @returns El resultado de la consulta de React Query.
 */
export const useProducts = (page, limit, search) => {
    return useQuery({
        // La clave de consulta identifica unívocamente esta solicitud de datos
        queryKey: ['products', page, limit, search],
        
        // La función que se ejecutará para obtener los datos
        queryFn: async () => {
            const data = await getProducts(page, limit, search);
            console.log('Products API Response:', data); // Log para depuración
            return data;
        },
        
        // Mantiene los datos anteriores visibles mientras se cargan los nuevos,
        // lo que evita parpadeos en la interfaz al paginar.
        keepPreviousData: true,
    });
};
