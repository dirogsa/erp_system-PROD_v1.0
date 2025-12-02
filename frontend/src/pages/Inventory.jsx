import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import ProductsTable from '../components/features/inventory/ProductsTable';
import ProductForm from '../components/features/inventory/ProductForm';
import TransfersSection from '../components/features/inventory/TransfersSection';
import StockMovementsSection from '../components/features/inventory/StockMovementsSection';
import Pagination from '../components/common/Table/Pagination';
import { useProducts } from '../hooks/useProducts';
import { createProduct, updateProduct, deleteProduct } from '../services/api';
import { useNotification } from '../hooks/useNotification';

const Inventory = () => {
    const [activeTab, setActiveTab] = useState('products');
    const [showProductModal, setShowProductModal] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [viewingProductSku, setViewingProductSku] = useState(null); // State for product filter

    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(10);
    const [search, setSearch] = useState('');
    const queryClient = useQueryClient();
    const { showNotification } = useNotification();

    const { products, total, isLoading, error } = useProducts(page, limit, search);

    const createMutation = useMutation({
        mutationFn: (newProductData) => createProduct(newProductData),
        onSuccess: () => {
            showNotification('Producto creado con éxito', 'success');
            queryClient.invalidateQueries(['products']);
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
            queryClient.invalidateQueries(['products']);
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
            queryClient.invalidateQueries(['products']);
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

    const handleViewMovements = (product) => {
        setViewingProductSku(product.sku);
        setActiveTab('movements');
    };

    const handleTabChange = (tab) => {
        setActiveTab(tab);
        if (tab !== 'movements') {
            setViewingProductSku(null); // Clear filter when leaving movements tab
        }
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
                    onClick={() => handleTabChange('products')}
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
                    onClick={() => handleTabChange('movements')}
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
                    onClick={() => handleTabChange('transfers')}
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
                        onView={handleViewMovements} // Pass the handler here
                        onEdit={(product) => {
                            setSelectedProduct(product);
                            setShowProductModal(true);
                        }}
                        onDelete={handleDelete}
                    />

                    <Pagination
                        current={page}
                        total={total}
                        onChange={setPage}
                        pageSize={limit}
                        onPageSizeChange={(newSize) => {
                            setLimit(newSize);
                            setPage(1);
                        }}
                    />
                </>
            )}

            {activeTab === 'movements' && (
                <StockMovementsSection 
                    productSku={viewingProductSku} 
                    onClearFilter={() => setViewingProductSku(null)}
                />
            )}
            {activeTab === 'transfers' && <TransfersSection />}
            
            {showProductModal && (
                 <div style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    backgroundColor: 'rgba(0,0,0,0.7)', zIndex: 1000,
                    display: 'flex', justifyContent: 'center', alignItems: 'center'
                }}>
                    <div style={{ backgroundColor: '#0f172a', borderRadius: '0.5rem', width: '100%', maxWidth: '600px' }}>
                        <div style={{ padding: '1.5rem', borderBottom: '1px solid #334155', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <h2 style={{ color: 'white', margin: 0 }}>{selectedProduct ? 'Editar Producto' : 'Nuevo Producto'}</h2>
                            <button onClick={() => setShowProductModal(false)} style={{ background: 'none', border: 'none', color: '#94a3b8', fontSize: '1.5rem', cursor: 'pointer' }}>×</button>
                        </div>
                        <ProductForm
                            initialData={selectedProduct}
                            onSubmit={handleFormSubmit}
                            onCancel={() => setShowProductModal(false)}
                            loading={createMutation.isLoading || updateMutation.isLoading}
                        />
                    </div>
                </div>
            )}
        </div>
    );
};

export default Inventory;
