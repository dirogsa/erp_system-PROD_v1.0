import { useState, useEffect, useCallback } from 'react';
// Se importan las funciones correctas
import { getSuppliers, createSupplier, updateSupplier } from '../services/api';
import { useNotification } from './useNotification';

export const useSuppliers = () => {
    const [suppliers, setSuppliers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const { showNotification } = useNotification();

    const fetchSuppliers = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            // Se usa la función correcta
            const response = await getSuppliers();
            setSuppliers(response.data);
        } catch (err) {
            setError(err);
            showNotification('Error al cargar proveedores', 'error');
            console.error('Error fetching suppliers:', err);
        } finally {
            setLoading(false);
        }
    }, [showNotification]);

    const addSupplier = useCallback(async (supplierData) => {
        setLoading(true);
        try {
            // Se usa la función correcta
            const response = await createSupplier(supplierData);
            await fetchSuppliers();
            showNotification('Proveedor creado exitosamente', 'success');
            return response.data;
        } catch (err) {
            const errorMessage = err.response?.data?.detail || 'Error al crear proveedor';
            showNotification(errorMessage, 'error');
            throw err;
        } finally {
            setLoading(false);
        }
    }, [fetchSuppliers, showNotification]);

    const editSupplier = useCallback(async (id, supplierData) => {
        setLoading(true);
        try {
            // Se usa la función correcta
            await updateSupplier(id, supplierData);
            await fetchSuppliers();
            showNotification('Proveedor actualizado exitosamente', 'success');
        } catch (err) {
            const errorMessage = err.response?.data?.detail || 'Error al actualizar proveedor';
            showNotification(errorMessage, 'error');
            throw err;
        } finally {
            setLoading(false);
        }
    }, [fetchSuppliers, showNotification]);

    // NOTA: La función deleteSupplier no existe en el api.js actual.

    useEffect(() => {
        fetchSuppliers();
    }, [fetchSuppliers]);

    return {
        suppliers,
        loading,
        error,
        fetchSuppliers,
        createSupplier: addSupplier,
        updateSupplier: editSupplier,
    };
};
