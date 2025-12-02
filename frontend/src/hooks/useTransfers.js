import { useState, useEffect, useCallback } from 'react';
// Se importan las funciones específicas en lugar del objeto inexistente
import { getWarehouses, createTransfer } from '../services/api';
import { useNotification } from './useNotification';

export const useTransfers = () => {
    const [transfers, setTransfers] = useState([]);
    const [warehouses, setWarehouses] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const { showNotification } = useNotification();

    const fetchWarehouses = useCallback(async () => {
        try {
            // Se llama a la función directamente
            const response = await getWarehouses();
            setWarehouses(response.data);
        } catch (err) {
            console.error('Error fetching warehouses:', err);
        }
    }, []);

    const createNewTransfer = useCallback(async (transferData) => {
        setLoading(true);
        try {
            // Se llama a la función correcta 'createTransfer'
            const response = await createTransfer(transferData);

            const newTransfer = {
                date: new Date().toLocaleString(),
                guide: response.data.guide_number,
                warehouse: transferData.target_warehouse_id, // Should map to name
                product: transferData.items[0].sku, // Should map to name
                quantity: transferData.items[0].quantity,
                notes: transferData.notes
            };

            setTransfers(prev => [newTransfer, ...prev]);
            showNotification(`Guía Generada: ${response.data.guide_number}`, 'success');
            return response.data;
        } catch (err) {
            const errorMessage = err.response?.data?.detail || 'Error al registrar transferencia';
            showNotification(errorMessage, 'error');
            throw err;
        } finally {
            setLoading(false);
        }
    }, [showNotification]);

    useEffect(() => {
        fetchWarehouses();
    }, [fetchWarehouses]);

    return {
        transfers,
        warehouses,
        loading,
        error,
        createTransfer: createNewTransfer // Se exporta la función con el nombre esperado
    };
};
