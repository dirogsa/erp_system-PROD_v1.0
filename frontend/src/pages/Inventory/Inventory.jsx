import React, { useState } from 'react';
import { useProducts } from '../../hooks/useProducts';
import ProductTable from '../../components/features/inventory/ProductTable';
import ProductDetailModal from '../../components/features/inventory/ProductDetailModal';
import StockMovementsSection from '../../components/features/inventory/StockMovementsSection';
import Button from '../../components/common/Button';
import { PlusIcon } from '@heroicons/react/24/solid';
import ProductFormModal from '../../components/features/inventory/ProductFormModal';

const Inventory = () => {
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(10);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [isProductFormOpen, setIsProductFormOpen] = useState(false);

    const { products, total, isLoading, refetch } = useProducts(page, limit, { name: searchTerm });

    const handleSearch = (event) => {
        setSearchTerm(event.target.value);
        setPage(1);
    };

    const handleRowClick = (product) => {
        setSelectedProduct(product);
    };

    const handleCloseModal = () => {
        setSelectedProduct(null);
    };

    const handleNewProduct = () => {
        setSelectedProduct(null); // Deselect any product
        setIsProductFormOpen(true);
    };

    const handleFormClose = () => {
        setIsProductFormOpen(false);
        refetch(); // Refetch products after closing the form
    };

    return (
        <div style={{ padding: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h1 style={{ color: 'white', fontSize: '1.875rem', fontWeight: 'bold' }}>Inventario de Productos</h1>
                <Button onClick={handleNewProduct} icon={<PlusIcon style={{ width: '1.25rem', height: '1.25rem' }} />}>
                    Nuevo Producto
                </Button>
            </div>

            <input
                type="text"
                placeholder="Buscar por nombre..."
                value={searchTerm}
                onChange={handleSearch}
                style={{
                    width: '100%',
                    padding: '0.75rem 1rem',
                    backgroundColor: '#1e293b',
                    color: 'white',
                    border: '1px solid #334155',
                    borderRadius: '0.375rem',
                    marginBottom: '1.5rem'
                }}
            />

            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem', alignItems: 'start' }}>
                <div style={{ backgroundColor: '#0f172a', padding: '1.5rem', borderRadius: '0.5rem', border: '1px solid #334155' }}>
                    <h2 style={{ color: 'white', marginBottom: '1rem', fontSize: '1.25rem' }}>Lista de Productos</h2>
                    <ProductTable
                        products={products}
                        loading={isLoading}
                        onRowClick={handleRowClick}
                        pagination={{
                            current: page,
                            total: total,
                            pageSize: limit,
                            onChange: setPage,
                            onPageSizeChange: (newSize) => {
                                setLimit(newSize);
                                setPage(1);
                            }
                        }}
                    />
                </div>

                <div style={{ backgroundColor: '#0f172a', padding: '1.5rem', borderRadius: '0.5rem', border: '1px solid #334155' }}>
                    <h2 style={{ color: 'white', marginBottom: '1rem', fontSize: '1.25rem' }}>Movimientos Recientes</h2>
                    <StockMovementsSection showPagination={false} />
                </div>
            </div>

            {selectedProduct && <ProductDetailModal product={selectedProduct} onClose={handleCloseModal} />}
            {isProductFormOpen && <ProductFormModal onClose={handleFormClose} />}

        </div>
    );
};

export default Inventory;
