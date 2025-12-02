import React, { useState } from 'react';
import { useStockMovements } from '../../../hooks/useStockMovements';
import Table from '../../common/Table';
import Pagination from '../../common/Table/Pagination';
import Button from '../../common/Button';
import { format } from 'date-fns';
import StockMovementModal from './StockMovementModal'; // Importar el modal

const StockMovementsSection = () => {
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(10);
    const [filters, setFilters] = useState({}); // Para futuros filtros
    const [showModal, setShowModal] = useState(false);

    const { movements, total, isLoading, error } = useStockMovements(page, limit, filters);

    const columns = [
        { header: 'Producto (SKU)', accessor: 'product_sku' },
        {
            header: 'Tipo',
            accessor: 'movement_type',
            render: (item) => (
                <span style={{ 
                    color: item.movement_type.includes('OUT') || item.movement_type.includes('LOSS') ? '#f87171' : '#4ade80',
                    fontWeight: 'bold'
                }}>
                    {item.movement_type}
                </span>
            ),
        },
        { header: 'Cantidad', accessor: 'quantity' },
        { header: 'Motivo', accessor: 'reference_document' },
        { 
            header: 'Fecha', 
            accessor: 'date',
            render: (item) => format(new Date(item.date), 'dd/MM/yyyy HH:mm'),
        },
        { header: 'Responsable', accessor: 'responsible' },
    ];

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1.5rem' }}>
                <Button onClick={() => setShowModal(true)}>+ Nuevo Movimiento</Button>
            </div>

            {error && <p style={{ color: 'red' }}>Error al cargar los movimientos: {error.message}</p>}

            <Table
                columns={columns}
                data={movements}
                loading={isLoading}
            />

            <Pagination
                current={page}
                total={total}
                pageSize={limit}
                onChange={setPage}
                onPageSizeChange={(newSize) => {
                    setLimit(newSize);
                    setPage(1);
                }}
            />

            {showModal && <StockMovementModal onClose={() => setShowModal(false)} />}
        </div>
    );
};

export default StockMovementsSection;
