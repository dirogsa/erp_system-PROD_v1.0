import React, { useState } from 'react';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import ProductsTable from '../components/features/inventory/ProductsTable';
import ProductForm from '../components/features/inventory/ProductForm';
import TransfersSection from '../components/features/inventory/TransfersSection';
import LossesSection from '../components/features/inventory/LossesSection';
import Pagination from '../components/common/Table/Pagination';
import { useProducts } from '../hooks/useProducts';
import { inventoryService } from '../services/api';

const Inventory = () => {
    const [activeTab, setActiveTab] = useState('products');
    const [showProductModal, setShowProductModal] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [isViewMode, setIsViewMode] = useState(false);

    // Pagination & Search State
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(10);
    const [search, setSearch] = useState('');
    const [measurementFilters, setMeasurementFilters] = useState([]);
    const [filteredProducts, setFilteredProducts] = useState(null);

    const {
        products,
        pagination,
        loading,
        createProduct,
        updateProduct,
        deleteProduct
    } = useProducts({ page, limit, search });

    const isFiltered = !!filteredProducts;

    const handleApplyMeasurementFilters = async () => {
        if (!measurementFilters || measurementFilters.length === 0) return;

        const payload = {
            measurementFilters: measurementFilters.map(f => ({ label: f.label, unit: f.unit, min: f.min ? Number(f.min) : undefined, max: f.max ? Number(f.max) : undefined })),
            skip: 0,
            limit: 100
        };

        try {
            const resp = await inventoryService.searchProducts(payload);
            setFilteredProducts({ items: resp.data.items, page: resp.data.page, pages: resp.data.pages, total: resp.data.total });
        } catch (err) {
            console.error('Error searching products by measurements', err);
            alert('Error al buscar productos por medidas');
        }
    };

    const clearMeasurementFilters = () => {
        setMeasurementFilters([]);
        setFilteredProducts(null);
    };

    // Debug logging
    console.log('Inventory Component - Loading:', loading);
    console.log('Inventory Component - Products:', products);
    console.log('Inventory Component - Pagination:', pagination);

    const handleCreate = async (data) => {
        try {
            await createProduct(data, data.initial_stock);
            setShowProductModal(false);
        } catch (error) { }
    };

    const handleUpdate = async (data) => {
        try {
            await updateProduct(data.sku, data, data.stock_current);
            setShowProductModal(false);
        } catch (error) { }
    };

    return (
        <div style={{ padding: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <div>
                    <h1 style={{ color: 'white', marginBottom: '0.5rem' }}>Gestión de Inventario</h1>
                    <p style={{ color: '#94a3b8' }}>Control de productos, transferencias y mermas</p>
                </div>
                {activeTab === 'products' && (
                    <Button onClick={() => {
                        setSelectedProduct(null);
                        setIsViewMode(false);
                        setShowProductModal(true);
                    }}>
                        + Nuevo Producto
                    </Button>
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
                        color: activeTab === 'products' ? '#3b82f6' : '#94a3b8',
                        cursor: 'pointer',
                        fontWeight: '500'
                    }}
                >
                    📦 Productos
                </button>
                <button
                    onClick={() => setActiveTab('transfers')}
                    style={{
                        padding: '1rem 2rem',
                        background: 'none',
                        border: 'none',
                        borderBottom: activeTab === 'transfers' ? '2px solid #3b82f6' : 'none',
                        color: activeTab === 'transfers' ? '#3b82f6' : '#94a3b8',
                        cursor: 'pointer',
                        fontWeight: '500'
                    }}
                >
                    🚚 Transferencias
                </button>
                <button
                    onClick={() => setActiveTab('losses')}
                    style={{
                        padding: '1rem 2rem',
                        background: 'none',
                        border: 'none',
                        borderBottom: activeTab === 'losses' ? '2px solid #3b82f6' : 'none',
                        color: activeTab === 'losses' ? '#3b82f6' : '#94a3b8',
                        cursor: 'pointer',
                        fontWeight: '500'
                    }}
                >
                    ⚠️ Mermas
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
                                setPage(1); // Reset to first page on search
                            }}
                        />
                    </div>

                    <div style={{ marginBottom: '1rem', padding: '0.5rem', border: '1px dashed #334155' }}>
                        <h4 style={{ margin: '0 0 0.5rem 0', color: 'white' }}>Filtros por Medida (opcional)</h4>
                        {measurementFilters.map((f, idx) => (
                            <div key={idx} style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem', alignItems: 'center' }}>
                                <input placeholder="Etiqueta (ej: A)" value={f.label} onChange={(e) => { const next = [...measurementFilters]; next[idx].label = e.target.value; setMeasurementFilters(next); }} />
                                <select value={f.unit} onChange={(e) => { const next = [...measurementFilters]; next[idx].unit = e.target.value; setMeasurementFilters(next); }}>
                                    <option value="mm">mm</option>
                                    <option value="rosca">rosca</option>
                                </select>
                                <input placeholder="Min" type="number" value={f.min} onChange={(e) => { const next = [...measurementFilters]; next[idx].min = e.target.value; setMeasurementFilters(next); }} style={{ width: '90px' }} />
                                <input placeholder="Max" type="number" value={f.max} onChange={(e) => { const next = [...measurementFilters]; next[idx].max = e.target.value; setMeasurementFilters(next); }} style={{ width: '90px' }} />
                                <button onClick={() => { const next = [...measurementFilters]; next.splice(idx,1); setMeasurementFilters(next); }}>Eliminar</button>
                            </div>
                        ))}
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                            <button onClick={() => setMeasurementFilters([...(measurementFilters||[]), {label: '', unit: 'mm', min: '', max: ''}])}>+ Añadir filtro</button>
                            <button onClick={handleApplyMeasurementFilters}>Aplicar filtros de medida</button>
                            <button onClick={clearMeasurementFilters}>Limpiar</button>
                        </div>
                    </div>

                    <ProductsTable
                        products={isFiltered ? filteredProducts.items : products}
                        loading={loading}
                        onView={(product) => {
                            console.log('Ver producto', product);
                        }}
                        onEdit={(product) => {
                            setSelectedProduct(product);
                            setIsViewMode(false);
                            setShowProductModal(true);
                        }}
                        onDelete={(product) => {
                            if (window.confirm('¿Está seguro de eliminar este producto?')) {
                                deleteProduct(product.sku);
                            }
                        }}
                    />

                    {!isFiltered && (
                        <Pagination
                            current={pagination.current}
                            total={pagination.total}
                            onChange={setPage}
                            pageSize={limit}
                            onPageSizeChange={(newSize) => {
                                setLimit(newSize);
                                setPage(1);
                            }}
                        />
                    )}
                </>
            )}

            {activeTab === 'transfers' && <TransfersSection />}

            {activeTab === 'losses' && <LossesSection />}

            {/* Modal de Producto */}
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
                            onSubmit={selectedProduct ? handleUpdate : handleCreate}
                            onCancel={() => setShowProductModal(false)}
                            loading={loading}
                        />
                    </div>
                </div>
            )}
        </div>
    );
};

export default Inventory;
