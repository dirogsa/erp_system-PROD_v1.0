import React, { useState } from 'react';
import { useStockMovements } from '../../../hooks/useStockMovements';
import Table from '../../common/Table';
import Pagination from '../../common/Table/Pagination';
import { format } from 'date-fns';

const StockMovementsSection = ({ productSku, showPagination = true }) => { 
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(5);

    const { movements, total, isLoading, error } = useStockMovements(page, limit, { product_sku: productSku });

    const columns = [
        {
            label: 'Fecha',
            key: 'created_at',
            render: (item) => item.created_at ? format(new Date(item.created_at), 'dd/MM/yyyy HH:mm') : 'Fecha inválida'
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
            render: (item) => item.reference_document || 'N/A'
        },
        {
            label: 'Notas',
            key: 'notes',
            render: (item) => item.notes || 'N/A'
        },
    ];

    return (
        <div>
            {error && <p style={{ color: 'red' }}>Error al cargar los movimientos: {error.message}</p>}

            <Table
                columns={columns}
                data={movements}
                loading={isLoading}
                emptyMessage="No hay movimientos de stock para este producto."
            />

            {showPagination && (
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
            )}
        </div>
    );
};

export default StockMovementsSection;