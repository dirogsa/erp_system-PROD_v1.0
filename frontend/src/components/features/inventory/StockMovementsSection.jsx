import React, { useState } from 'react';
import { useStockMovements } from '../../../hooks/useStockMovements';
import Table from '../../common/Table';
import Pagination from '../../common/Table/Pagination';
import Button from '../../common/Button';
import { format } from 'date-fns';
import StockMovementModal from './StockMovementModal';

const StockMovementsSection = () => {
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(10);
    const [showModal, setShowModal] = useState(false);

    const { movements, total, isLoading, error, refetch } = useStockMovements(page, limit);

    const columns = [
        {
            label: 'Fecha',
            key: 'date',
            render: (item) => format(new Date(item.date), 'dd/MM/yyyy HH:mm')
        },
        {
            label: 'Producto (SKU)',
            key: 'product_sku',
            render: (item) => (
                <div>
                    <p style={{ margin: 0, color: 'white', fontWeight: '500' }}>{item.product_name || 'Nombre no disponible'}</p>
                    <p style={{ margin: 0, color: '#94a3b8', fontSize: '0.875rem' }}>{item.product_sku}</p>
                </div>
            )
        },
        {
            label: 'Tipo',
            key: 'movement_type',
            render: (item) => (
                <span style={{
                    color: ['SALE', 'LOSS', 'TRANSFER_OUT'].includes(item.movement_type) ? '#f87171' : '#4ade80',
                    fontWeight: 'bold'
                }}>
                    {item.movement_type}
                </span>
            ),
        },
        { label: 'Cantidad', key: 'quantity', align: 'center' },
        {
            label: 'Documento Ref.',
            key: 'reference_document',
            render: (item) => item.reference_document || 'No Aplica'
        },
    ];

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', marginBottom: '1.5rem' }}>
                <Button onClick={() => setShowModal(true)}>+ Registrar Movimiento Manual</Button>
            </div>

            {error && <p style={{ color: 'red' }}>Error al cargar los movimientos: {error.message}</p>}

            <h3 style={{ color: 'white', marginBottom: '1rem' }}>Movimientos Recientes del Inventario</h3>

            <Table
                columns={columns}
                data={movements}
                loading={isLoading}
                emptyMessage="No hay movimientos de stock registrados."
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

            {showModal && <StockMovementModal onClose={() => {
                setShowModal(false);
                refetch();
            }} />}
        </div>
    );
};

export default StockMovementsSection;
