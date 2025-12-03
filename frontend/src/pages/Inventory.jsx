import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import ProductsTable from '../components/features/inventory/ProductsTable';
import ProductForm from '../components/features/inventory/ProductForm';
import ProductDetailModal from '../components/features/inventory/ProductDetailModal';
import TransfersSection from '../components/features/inventory/TransfersSection';
import StockMovementsSection from '../components/features/inventory/StockMovementsSection';
import Pagination from '../components/common/Table/Pagination';
import { useProducts } from '../hooks/useProducts';
import { createProduct, updateProduct, deleteProduct } from '../services/api';
import { useNotification } from '../hooks/useNotification';

const Inventory = () => {
    const [activeTab, setActiveTab] = useState('products');
    const [showProductModal, setShowProductModal] = useState(false);
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState(null);
    
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(10);
    const [search, setSearch] = useState('');
    const queryClient = useQueryClient();
    const { showNotification } = useNotification();

    const queryKey = ['products', page, limit, search];
    const { data: productsData, isLoading, error } = useProducts(page, limit, search);

    const products = productsData?.items || [];
    const total = productsData?.total || 0;
    const totalPages = Math.ceil(total / limit);

    const createMutation = useMutation({
        mutationFn: (newProductData) => createProduct(newProductData),
        onSuccess: () => {
            showNotification('Producto creado con éxito', 'success');
            queryClient.invalidateQueries(queryKey);
            setShowProductModal(false);
        },
        onError: (err) => {
            showNotification(err.response?.data?.detail || 'Error al crear el producto', 'error');
        }
    });

    const updateMutation = useMutation({
        mutationFn: ({ sku, data }) => updateProduct(sku, data),
        onSuccess: () => {
            showNotification('Producto actualizado con éxito', 'success');
            queryClient.invalidateQueries(queryKey);
            setShowProductModal(false);
            setSelectedProduct(null);
        },
        onError: (err) => {
            showNotification(err.response?.data?.detail || 'Error al actualizar el producto', 'error');
        }
    });

    const deleteMutation = useMutation({
        mutationFn: (sku) => deleteProduct(sku),
        onSuccess: () => {
            showNotification('Producto eliminado con éxito', 'success');
            queryClient.invalidateQueries(queryKey);
        },
        onError: (err) => {
            showNotification(err.response?.data?.detail || 'Error al eliminar el producto', 'error');
        }
    });

    const handleFormSubmit = (data) => {
        if (selectedProduct) {
            updateMutation.mutate({ sku: selectedProduct.sku, data });
        } else {
            createMutation.mutate(data);
        }
    };

    const handleDelete = (product) => {
        if (window.confirm(`¿Está seguro de eliminar el producto "${product.name}"?`)) {
            deleteMutation.mutate(product.sku);
        }
    };
    
    const handleViewDetails = (product) => {
        setSelectedProduct(product);
        setShowDetailModal(true);
    };

    const handleCloseModals = () => {
        setSelectedProduct(null);
        setShowProductModal(false);
        setShowDetailModal(false);
    };
    
    return (
        <div style={{ padding: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <div>
                    <h1 style={{ color: 'white', marginBottom: '0.5rem' }}>Gestión de Inventario</h1>
                    <p style={{ color: '#94a3b8' }}>Control de productos, transferencias y movimientos</p>
                </div>
                {activeTab === 'products' && (
                    <div style={{ display: 'flex', gap: '1rem' }}>
                        <Button onClick={() => {
                            setSelectedProduct(null);
                            setShowProductModal(true);
                        }}>
                            + Nuevo Producto
                        </Button>
                    </div>
                )}
            </div>

            <div style={{ marginBottom: '2rem', borderBottom: '1px solid #334155' }}>
                <button
                    onClick={() => setActiveTab('products')}
                    style={{
                        padding: '1rem 2rem',
                        background: 'none',
                        border: 'none',
                        borderBottom: activeTab === 'products' ? '2px solid #3b82f6' : 'none',
                        color: activeTab === 'products' ? '#3b82f6' : 'white',
                        cursor: 'pointer',
                        fontWeight: '500'
                    }}
                >
                    📦 Productos
                </button>
                <button
                    onClick={() => setActiveTab('movements')}
                    style={{
                        padding: '1rem 2rem',
                        background: 'none',
                        border: 'none',
                        borderBottom: activeTab === 'movements' ? '2px solid #3b82f6' : 'none',
                        color: activeTab === 'movements' ? '#3b82f6' : 'white',
                        cursor: 'pointer',
                        fontWeight: '500'
                    }}
                >
                    ↕️ Ingreso/Salida
                </button>
                <button
                    onClick={() => setActiveTab('transfers')}
                    style={{
                        padding: '1rem 2rem',
                        background: 'none',
                        border: 'none',
                        borderBottom: activeTab === 'transfers' ? '2px solid #3b82f6' : 'none',
                        color: activeTab === 'transfers' ? '#3b82f6' : 'white',
                        cursor: 'pointer',
                        fontWeight: '500'
                    }}
                >
                    🚚 Transferencias
                </button>
            </div>

            {activeTab === 'products' && (
                <>
                    <div style={{ maxWidth: '400px', marginBottom: '1rem' }}>
                        <Input
                            placeholder="Buscar por nombre o SKU..."
                            value={search}
                            onChange={(e) => {
                                setSearch(e.target.value);
                                setPage(1);
                            }}
                        />
                    </div>
                    
                    <ProductsTable
                        products={products}
                        loading={isLoading}
                        onView={handleViewDetails}
                        onEdit={(product) => {
                            setSelectedProduct(product);
                            setShowProductModal(true);
                        }}
                        onDelete={handleDelete}
                        paginationComponent={
                            <Pagination
                                current={page}
                                totalPages={totalPages} // <-- CORRECCIÓN FINAL
                                onChange={setPage}
                                pageSize={limit}
                                onPageSizeChange={(newSize) => {
                                    setLimit(newSize);
                                    setPage(1);
                                }}
                            />
                        }
                    />
                </>
            )}

            {activeTab === 'movements' && <StockMovementsSection />}
            {activeTab === 'transfers' && <TransfersSection />}

            {showDetailModal && selectedProduct && (
                <ProductDetailModal
                    product={selectedProduct}
                    onClose={handleCloseModals}
                />
            )}
            
            {showProductModal && (
                 <div style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    backgroundColor: 'rgba(0,0,0,0.7)', 
                    zIndex: 1000,
                    display: 'flex', 
                    justifyContent: 'center', 
                    alignItems: 'center',
                    padding: '2rem'
                }}>
                    <div style={{ 
                        backgroundColor: '#0f172a', 
                        borderRadius: '0.5rem', 
                        width: '100%', 
                        maxWidth: '800px',
                        maxHeight: '90vh',
                        display: 'flex',
                        flexDirection: 'column'
                    }}>
                        <div style={{ padding: '1.5rem', borderBottom: '1px solid #334155', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0 }}>
                            <h2 style={{ color: 'white', margin: 0 }}>{selectedProduct ? 'Editar Producto' : 'Nuevo Producto'}</h2>
                            <button onClick={handleCloseModals} style={{ background: 'none', border: 'none', color: '#94a3b8', fontSize: '1.5rem', cursor: 'pointer' }}>×</button>
                        </div>
                        <div style={{ overflowY: 'auto'}}>
                            <ProductForm
                                initialData={selectedProduct}
                                onSubmit={handleFormSubmit}
                                onCancel={handleCloseModals}
                                loading={createMutation.isLoading || updateMutation.isLoading}
                            />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Inventory;
