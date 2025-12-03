import React from 'react';
import Table from '../../common/Table';
import Button from '../../common/Button';
import ImageWithFallback from '../../common/ImageWithFallback';
import { formatCurrency } from '../../../utils/formatters';

const ProductsTable = ({
    products = [],
    loading = false,
    onView,
    onEdit,
    onDelete,
    paginationComponent // <--- Nueva prop
}) => {
    const columns = [
        {
            label: 'Imagen',
            key: 'image_url',
            render: (product) => (
                <ImageWithFallback 
                    src={product.image_url}
                    alt={product.name} 
                    style={{ width: '40px', height: '40px', borderRadius: '0.25rem', objectFit: 'cover' }} 
                />
            )
        },
        { label: 'SKU', key: 'sku' },
        { label: 'Nombre', key: 'name' },
        { label: 'Marca', key: 'brand' },
        { label: 'Stock', key: 'stock_current', align: 'center' },
        {
            label: 'Precio',
            key: 'price',
            align: 'right',
            render: (row) => formatCurrency(row.price)
        },
        {
            label: 'Costo Prom.',
            key: 'cost',
            align: 'right',
            render: (row) => formatCurrency(row.cost)
        },
        {
            label: 'Acciones',
            key: 'actions',
            align: 'center',
            render: (product) => (
                <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
                    <Button
                        size="small"
                        variant="secondary"
                        onClick={(e) => { e.stopPropagation(); onView(product); }}
                    >
                        Ver
                    </Button>
                    <Button
                        size="small"
                        variant="warning"
                        onClick={(e) => { e.stopPropagation(); onEdit(product); }}
                    >
                        Editar
                    </Button>
                    <Button
                        size="small"
                        variant="danger"
                        onClick={(e) => { e.stopPropagation(); onDelete(product); }}
                    >
                        ✕
                    </Button>
                </div>
            )
        }
    ];

    return (
        <>
            <Table
                columns={columns}
                data={products}
                loading={loading}
                emptyMessage="No hay productos registrados"
            />
            {paginationComponent && <div style={{ marginTop: '1rem' }}>{paginationComponent}</div>}
        </>
    );
};

export default ProductsTable;
