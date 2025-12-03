import React from 'react';
import ImageWithFallback from '../../common/ImageWithFallback';
import StockMovementsSection from './StockMovementsSection'; 
import { formatCurrency } from '../../../utils/formatters';

const ProductDetailModal = ({ product, onClose }) => {

    return (
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
                flexDirection: 'column',
                border: '1px solid #334155'
            }}>
                {/* Header */}
                <div style={{ padding: '1.5rem', borderBottom: '1px solid #334155', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h2 style={{ color: 'white', margin: 0 }}>Detalle del Producto</h2>
                    <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#94a3b8', fontSize: '1.5rem', cursor: 'pointer' }}>×</button>
                </div>

                {/* Body */}
                <div style={{ overflowY: 'auto', padding: '2rem' }}>
                    {/* Product Info Section */}
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '2rem', marginBottom: '2rem' }}>
                        <ImageWithFallback
                            src={product.image_url}
                            alt={product.name}
                            style={{ width: '120px', height: '120px', borderRadius: '0.5rem', objectFit: 'cover' }}
                        />
                        <div style={{ flex: 1 }}>
                            <h3 style={{ color: 'white', margin: 0, fontSize: '1.75rem' }}>{product.name}</h3>
                            <p style={{ color: '#94a3b8', margin: '0.5rem 0' }}>SKU: <span style={{ color: '#3b82f6', fontWeight: 'bold' }}>{product.sku}</span></p>
                            {product.brand && <p style={{ color: '#94a3b8', margin: '0.5rem 0' }}>Marca: <span style={{ color: 'white' }}>{product.brand}</span></p>}

                            <div style={{ display: 'flex', gap: '2rem', marginTop: '1rem' }}>
                                <div>
                                    <p style={{ color: '#94a3b8', margin: 0, fontSize: '0.875rem' }}>Precio</p>
                                    <p style={{ color: 'white', margin: '0.25rem 0', fontSize: '1.25rem', fontWeight: 'bold' }}>{formatCurrency(product.price)}</p>
                                </div>
                                <div>
                                    <p style={{ color: '#94a3b8', margin: 0, fontSize: '0.875rem' }}>Stock Actual</p>
                                    <p style={{ color: product.stock_current > 0 ? '#4ade80' : '#f87171', margin: '0.25rem 0', fontSize: '1.25rem', fontWeight: 'bold' }}>{product.stock_current}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Movements Section */}
                    <div>
                        <h4 style={{ color: 'white', marginBottom: '1rem', borderTop: '1px solid #334155', paddingTop: '1.5rem' }}>Historial de Movimientos</h4>
                        <StockMovementsSection productSku={product.sku} />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProductDetailModal;
