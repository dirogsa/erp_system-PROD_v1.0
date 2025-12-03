import React, { useState } from 'react';
import { useStockMovements } from '../../../hooks/useStockMovements';
import Table from '../../common/Table';
import Pagination from '../../common/Table/Pagination';
import { format } from 'date-fns';

const StockMovementsSection = ({ productSku, showPagination = true }) => { 
    // CORRECCIÓN FINAL: Asegurar que los estados de paginación siempre sean válidos.
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(10); // Unificar a 10 como valor inicial estándar.

    const filters = {};
    if (productSku) {
        filters.product_sku = productSku;
    }

    // Llamada al hook con los estados garantizados.
    const { movements, total, isLoading, error } = useStockMovements(page, limit, filters);

    const totalPages = total > 0 && limit > 0 ? Math.ceil(total / limit) : 0;

    const baseColumns = [
        {
            label: 'Fecha',
            key: 'created_at',
            render: (item) => item.created_at ? format(new Date(item.created_at), 'dd/MM/yyyy HH:mm') : 'Fecha inválida'
        },
        {
            label: 'Tipo',
            key: 'movement_type',
            render: (item) => (
                <span style={{ color: ['SALE', 'LOSS', 'TRANSFER_OUT'].includes(item.movement_type) ? '#f87171' : '#4ade80', fontWeight: 'bold' }}>
                    {item.movement_type}
                </span>
            ),
        },
        { label: 'Cantidad', key: 'quantity', align: 'center' },
        { label: 'Documento Ref.', key: 'reference_document', render: (item) => item.reference_document || 'N/A' },
        { label: 'Notas', key: 'notes', render: (item) => item.notes || 'N/A' },
    ];

    const columns = productSku
        ? baseColumns
        : [{ label: 'SKU', key: 'product_sku', render: (item) => <b style={{color: '#e2e8f0'}}>{item.product_sku}</b> }, ...baseColumns];

    // Handler para cambiar de página, asegurando que siempre sea un número válido.
    const handlePageChange = (newPage) => {
        if (newPage > 0) {
            setPage(newPage);
        }
    };

    // Handler para cambiar el tamaño de página.
    const handlePageSizeChange = (newSize) => {
        setLimit(newSize);
        setPage(1); // Resetear a la primera página al cambiar el tamaño.
    };

    return (
        <div>
            {error && <p style={{ color: 'red' }}>Error al cargar los movimientos: {error.message}</p>}

            <Table
                columns={columns}
                data={movements}
                loading={isLoading}
                emptyMessage="No hay movimientos de stock para mostrar."
            />

            {showPagination && totalPages > 1 && (
                <Pagination
                    current={page}
                    totalPages={totalPages}
                    pageSize={limit}
                    onChange={handlePageChange}
                    onPageSizeChange={handlePageSizeChange}
                />
            )}
        </div>
    );
};

export default StockMovementsSection;
