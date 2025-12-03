import { useState, useEffect, useCallback } from 'react';
import { getCreditNotes } from '../services/api';

const useCreditNotes = (page, limit, searchTerm) => {
    const [notes, setNotes] = useState([]);
    const [totalPages, setTotalPages] = useState(1);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchNotes = useCallback(async () => {
        setLoading(true);
        try {
            const params = {
                skip: (page - 1) * limit,
                limit,
                search: searchTerm,
            };
            const { data } = await getCreditNotes(params);
            setNotes(data.items || []);
            setTotalPages(data.pages || 1);
            setError(null);
        } catch (err) {
            setError('Error al cargar las notas de crédito.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, [page, limit, searchTerm]);

    useEffect(() => {
        fetchNotes();
    }, [fetchNotes]);

    return { notes, totalPages, loading, error, refetch: fetchNotes };
};

export default useCreditNotes;
