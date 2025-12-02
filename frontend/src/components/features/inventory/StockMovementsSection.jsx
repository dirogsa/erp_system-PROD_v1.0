import React, { useState, useEffect } from 'react';
import { useStockMovements } from '../../../hooks/useStockMovements';
import Table from '../../common/Table';
import Pagination from '../../common/Table/Pagination';
import Button from '../../common/Button';
import { format } from 'date-fns';
import StockMovementModal from './StockMovementModal';

const StockMovementsSection = ({ productSku, onClearFilter }) => {
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(10);
    const [filters, setFilters] = useState({});
    const [showModal, setShowModal] = useState(false);

    useEffect(() => {
        const newFilters = productSku ? { product_sku: productSku } : {};
        setFilters(newFilters);
        setPage(1);
    }, [productSku]);

    const { movements, total, isLoading, error, refetch } = useStockMovements(page, limit, filters);

    const columns = [
        { label: 'Producto (SKU)', key: 'product_sku' },
        {
            label: 'Tipo',
            key: 'movement_type',
            render: (type) => { // `type` is the cell value, as per the Table component contract
                const typeString = String(type || '');
                return (
                    <span style={{ 
                        color: typeString.includes('OUT') || typeString.includes('LOSS') ? '#f87171' : '#4ade80',
                        fontWeight: 'bold'
                    }}>
                        {typeString}
                    </span>
                );
            },
        },
        { label: 'Cantidad', key: 'quantity' },
        { label: 'Motivo', key: 'reference_document' },
        { 
            label: 'Fecha', 
            key: 'date',
            render: (item) => { // `item` is the whole row object
                const date = item.date;
                return date ? format(new Date(date), 'dd/MM/yyyy HH:mm') : 'N/A';
            },
        },
    ];

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                {productSku ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem'}}>
                         <h3 style={{color: 'white', margin: 0}}>Mostrando movimientos para: <span style={{color: '#3b82f6'}}>{productSku}</span></h3>
                         <Button onClick={onClearFilter} variant="secondary">Limpiar Filtro</Button>
                    </div>
                ) : <div />}
                <Button onClick={() => setShowModal(true)}>+ Nuevo Movimiento</Button>
            </div>

            {error && <p style={{ color: 'red' }}>Error al cargar los movimientos: {error.message}</p>}

            <Table
                columns={columns}
                data={movements}
                loading={isLoading}
                emptyMessage="No hay movimientos de stock registrados"
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