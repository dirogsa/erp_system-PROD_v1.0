import React, { useState, useMemo } from 'react';
import { useProducts } from '../../hooks/useProducts';
import ProductsTable from '../../components/features/inventory/ProductsTable';
import ProductDetailModal from '../../components/features/inventory/ProductDetailModal';
import StockMovementsSection from '../../components/features/inventory/StockMovementsSection';
import Button from '../../components/common/Button';
import { PlusIcon } from '@heroicons/react/24/solid';
import ProductForm from '../../components/features/inventory/ProductForm';
import Modal from '../../components/Modal';
import Pagination from '../../components/common/Table/Pagination';
import { useDebounce } from '../../hooks/useDebounce';

const Inventory = () => {
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(10);
    const [searchTerm, setSearchTerm] = useState('');
    const [sort, setSort] = useState({ sortBy: 'sku', sortOrder: 'asc' });
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState(null);

    const debouncedSearchTerm = useDebounce(searchTerm, 300);

    const { data, isLoading, isError, refetch } = useProducts({
        page,
        limit,
        search: debouncedSearchTerm,
        sortBy: sort.sortBy,
        sortOrder: sort.sortOrder,
    });

    const handleSearchChange = (event) => {
        setSearchTerm(event.target.value);
        setPage(1); 
    };

    const handleSortChange = (event) => {
        const [sortBy, sortOrder] = event.target.value.split('_');
        setSort({ sortBy, sortOrder });
        setPage(1);
    };

    const handleNewProduct = () => {
        setSelectedProduct(null); 
        setIsFormOpen(true);
    };

    const handleEditProduct = (product) => {
        setSelectedProduct(product);
        setIsFormOpen(true);
    };

    const handleFormClose = () => {
        setIsFormOpen(false);
        setSelectedProduct(null);
        refetch(); 
    };

    const paginationComponent = useMemo(() => (
        data && data.total > 0 && (
            <Pagination
                currentPage={page}
                totalItems={data.total}
                pageSize={limit}
                onPageChange={setPage}
            />
        )
    ), [data, page, limit]);

    return (
        <div style={{ padding: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h1 style={{ color: 'white', fontSize: '1.875rem', fontWeight: 'bold' }}>Inventario de Productos</h1>
                <Button onClick={handleNewProduct} icon={<PlusIcon style={{ width: '1.25rem', height: '1.25rem' }} />}>
                    Nuevo Producto
                </Button>
            </div>

            <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
                <input
                    type="text"
                    placeholder="Buscar por nombre o SKU..."
                    value={searchTerm}
                    onChange={handleSearchChange}
                    style={{ flexGrow: 1, padding: '0.75rem 1rem', backgroundColor: '#1e293b', color: 'white', border: '1px solid #334155', borderRadius: '0.375rem' }}
                />
                <select onChange={handleSortChange} value={`${sort.sortBy}_${sort.sortOrder}`} style={{ padding: '0.75rem 1rem', backgroundColor: '#1e293b', color: 'white', border: '1px solid #334155', borderRadius: '0.375rem' }}>
                    <option value="sku_asc">Ordenar por SKU (ASC)</option>
                    <option value="sku_desc">Ordenar por SKU (DESC)</option>
                    <option value="name_asc">Ordenar por Nombre (ASC)</option>
                    <option value="name_desc">Ordenar por Nombre (DESC)</option>
                </select>
            </div>

            <div style={{ backgroundColor: '#0f172a', padding: '1.5rem', borderRadius: '0.5rem', border: '1px solid #334155' }}>
                 <ProductsTable
                    products={data?.items || []}
                    loading={isLoading}
                    onEdit={handleEditProduct}
                    onDelete={(product) => alert(`Eliminar ${product.name}`)}
                    onView={(product) => alert(`Ver ${product.name}`)} 
                    paginationComponent={paginationComponent} 
                />
            </div>

            {isFormOpen && (
                <Modal title={selectedProduct ? 'Editar Producto' : 'Nuevo Producto'} onClose={handleFormClose}>
                    <ProductForm product={selectedProduct} onSave={handleFormClose} />
                </Modal>
            )}
        </div>
    );
};

export default Inventory;