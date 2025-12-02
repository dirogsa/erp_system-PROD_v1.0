import { useState, useEffect, useCallback } from 'react';
// Se importan las funciones directamente
import { getCustomers, createCustomer, updateCustomer } from '../services/api';
import { useNotification } from './useNotification';

export const useCustomers = () => {
    const [customers, setCustomers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const { showNotification } = useNotification();

    const fetchCustomers = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            // Se llama a la función directamente
            const response = await getCustomers();
            setCustomers(response.data);
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
            // Se llama a la función directamente
            const response = await createCustomer(customerData);
            await fetchCustomers();
            showNotification('Cliente creado exitosamente', 'success');
            return response.data;
        } catch (err) {
            const errorMessage = err.response?.data?.detail || 'Error al crear cliente';
            showNotification(errorMessage, 'error');
            throw err;
        } finally {
            setLoading(false);
        }
    }, [fetchCustomers, showNotification]);

    const editCustomer = useCallback(async (id, customerData) => {
        setLoading(true);
        try {
            // Se llama a la función directamente
            await updateCustomer(id, customerData);
            await fetchCustomers();
            showNotification('Cliente actualizado exitosamente', 'success');
        } catch (err) {
            const errorMessage = err.response?.data?.detail || 'Error al actualizar cliente';
            showNotification(errorMessage, 'error');
            throw err;
        } finally {
            setLoading(false);
        }
    }, [fetchCustomers, showNotification]);

    // NOTA: No existe un `deleteCustomer` en el api.js actual.
    // Las funciones getCustomerByRuc y getCustomerBranches tampoco existen.

    useEffect(() => {
        fetchCustomers();
    }, [fetchCustomers]);

    return {
        customers,
        loading,
        error,
        fetchCustomers,
        createCustomer: addCustomer,
        updateCustomer: editCustomer,
    };
};
