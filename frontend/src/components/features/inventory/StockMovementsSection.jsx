import React, { useState, useEffect } from 'react';
import { useStockMovements } from '../../../hooks/useStockMovements';
import { useProducts } from '../../../hooks/useProducts'; // Import useProducts
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

    // Fetch product data if a SKU is provided
    const { products: productData, isLoading: isProductLoading } = useProducts(1, 1, productSku, { enabled: !!productSku });
    const product = productData?.[0];

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
            render: (type) => {
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
            render: (item) => {
                const date = item.date;
                return date ? format(new Date(date), 'dd/MM/yyyy HH:mm') : 'N/A';
            },
        },
    ];

    return (
        <div>
            {productSku && (isProductLoading ? <p>Cargando producto...</p> : product && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', marginBottom: '2rem', background: '#1e293b', padding: '1.5rem', borderRadius: '0.5rem'}}>
                    <img
                        src={product.image_url || 'https://via.placeholder.com/80'}
                        alt={product.name}
                        style={{ width: '80px', height: '80px', borderRadius: '0.5rem', objectFit: 'cover' }}
                    />
                    <div>
                        <h2 style={{color: 'white', margin: 0, fontSize: '1.5rem'}}>{product.name}</h2>
                        <p style={{color: '#94a3b8', margin: '0.25rem 0'}}>SKU: <span style={{color: '#3b82f6'}}>{product.sku}</span></p>
                        <Button onClick={onClearFilter} variant="secondary" size="small" style={{marginTop: '0.5rem'}}>Ver todos los movimientos</Button>
                    </div>
                </div>
            ))}

            <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', marginBottom: '1.5rem' }}>
                <Button onClick={() => setShowModal(true)}>+ Nuevo Movimiento</Button>
            </div>

            {error && <p style={{ color: 'red' }}>Error al cargar los movimientos: {error.message}</p>}

            <h3 style={{color: 'white', marginBottom: '1rem'}}>{productSku ? 'Historial de Movimientos' : 'Movimientos Recientes'}</h3>

            <Table
                columns={columns}
                data={movements}
                loading={isLoading}
                emptyMessage="No hay movimientos de stock registrados para este producto"
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
