import { useState, useCallback } from 'react';
import { 
    getCustomers as apiGetCustomers, 
    createCustomer as apiCreateCustomer, 
    updateCustomer as apiUpdateCustomer, 
    deleteCustomer as apiDeleteCustomer 
} from '../services/api';
import { useNotification } from './useNotification';

export const useCustomers = () => {
    const [customers, setCustomers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [pagination, setPagination] = useState({ total: 0, page: 1, pages: 1, limit: 10 });
    const { showNotification } = useNotification();

    const fetchCustomers = useCallback(async (page = 1, limit = 10, search = '') => {
        setLoading(true);
        setError(null);
        try {
            const response = await apiGetCustomers(page, limit, search);
            // La respuesta ya es el objeto paginado { items, total, ... }
            setCustomers(response.items || []);
            setPagination({
                total: response.total,
                page: response.page,
                pages: response.pages,
                limit: response.size
            });
        } catch (err) {
            setError(err);
            showNotification('Error al cargar clientes', 'error');
            console.error('Error fetching customers:', err);
        } finally {
            setLoading(false);
        }
    }, [showNotification]);

    const addCustomer = useCallback(async (customerData) => {
        setLoading(true);
        try {
            const newCustomer = await apiCreateCustomer(customerData);
            showNotification('Cliente creado exitosamente', 'success');
            // Refrescar volviendo a la primera página para ver el nuevo cliente
            await fetchCustomers(1, pagination.limit);
            return newCustomer;
        } catch (err) {
            const errorMessage = err.response?.data?.detail || 'Error al crear cliente';
            showNotification(errorMessage, 'error');
            throw err; // Es importante relanzar el error para el manejo en el formulario
        } finally {
            setLoading(false);
        }
    }, [fetchCustomers, showNotification, pagination.limit]);

    const editCustomer = useCallback(async (id, customerData) => {
        setLoading(true);
        try {
            await apiUpdateCustomer(id, customerData);
            showNotification('Cliente actualizado exitosamente', 'success');
            // Refrescar la página actual para ver los cambios
            await fetchCustomers(pagination.page, pagination.limit);
        } catch (err) {
            const errorMessage = err.response?.data?.detail || 'Error al actualizar cliente';
            showNotification(errorMessage, 'error');
            throw err;
        } finally {
            setLoading(false);
        }
    }, [fetchCustomers, showNotification, pagination.page, pagination.limit]);

    const removeCustomer = useCallback(async (id) => {
        setLoading(true);
        try {
            await apiDeleteCustomer(id);
            showNotification('Cliente eliminado exitosamente', 'success');
            // Refrescar para que el cliente ya no aparezca
            await fetchCustomers(pagination.page, pagination.limit);
        } catch (err) {
            const errorMessage = err.response?.data?.detail || 'Error al eliminar el cliente';
            showNotification(errorMessage, 'error');
        } finally {
            setLoading(false);
        }
    }, [fetchCustomers, showNotification, pagination.page, pagination.limit]);


    return {
        customers,
        loading,
        error,
        pagination,
        fetchCustomers,
        createCustomer: addCustomer,
        updateCustomer: editCustomer,
        deleteCustomer: removeCustomer
    };
};
