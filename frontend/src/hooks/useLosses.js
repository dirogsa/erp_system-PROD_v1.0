import { useState, useEffect, useCallback } from 'react';
import { inventoryService } from '../services/api';
import { useNotification } from './useNotification';

export const useLosses = () => {
    const [losses, setLosses] = useState([]);
    const [summary, setSummary] = useState({ total_quantity: 0, total_cost: 0, total_movements: 0 });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const { showNotification } = useNotification();

    const fetchLosses = useCallback(async () => {
        setLoading(true);
        try {
            const response = await inventoryService.getLossesReport();
            setLosses(response.data.movements);
            setSummary(response.data.summary);
        } catch (err) {
            console.error('Error fetching losses:', err);
            setError(err);
        } finally {
            setLoading(false);
        }
    }, []);

    const createLoss = useCallback(async (lossData) => {
        setLoading(true);
        try {
            await inventoryService.registerLoss(lossData);
            await fetchLosses();
            showNotification('Merma registrada exitosamente', 'success');
        } catch (err) {
            const errorMessage = err.response?.data?.detail || 'Error al registrar merma';
            showNotification(errorMessage, 'error');
            throw err;
        } finally {
            setLoading(false);
        }
    }, [fetchLosses, showNotification]);

    useEffect(() => {
        fetchLosses();
    }, [fetchLosses]);

    return {
        losses,
        summary,
        loading,
        error,
        fetchLosses,
        createLoss
    };
};
