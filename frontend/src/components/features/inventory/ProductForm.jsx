import React, { useState, useEffect } from 'react';
import Input from '../../common/Input';
import Button from '../../common/Button';
import MeasurementInput from '../../common/MeasurementInput';
import { useNotification } from '../../../hooks/useNotification';

const ProductForm = ({
    initialData = null,
    onSubmit,
    onCancel,
    loading = false
}) => {
    const { showNotification } = useNotification();
    const isEditMode = !!initialData;

    const [formData, setFormData] = useState({
        sku: '',
        name: '',
        brand: '',
        price: 0,
        cost: 0,
        initial_stock: 0,
        stock_current: 0,
        measurements: [],
        ...initialData
    });

    const handleSubmit = (e) => {
        e.preventDefault();

        if (!formData.sku || !formData.name) {
            showNotification('SKU y Nombre son obligatorios', 'error');
            return;
        }

        onSubmit(formData);
    };

    return (
        <form onSubmit={handleSubmit} style={{ padding: '1rem' }}>
            <div style={{ display: 'grid', gap: '1rem' }}>
                <Input
                    label="SKU"
                    value={formData.sku}
                    onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                    placeholder="PROD-001"
                    required
                    disabled={isEditMode}
                />

                <Input
                    label="Nombre"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                />

                <Input
                    label="Marca"
                    value={formData.brand}
                    onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                    placeholder="Ej: Samsung, LG"
                />

                <Input
                    label="Precio de Lista (S/)"
                    type="number"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) })}
                    required
                    min="0"
                    step="0.01"
                />

                <Input
                    label="Costo Promedio (S/)"
                    type="number"
                    value={formData.cost}
                    onChange={(e) => setFormData({ ...formData, cost: parseFloat(e.target.value) })}
                    required
                    min="0"
                    step="0.01"
                    disabled={isEditMode}
                    helperText={isEditMode ? "El costo promedio se actualiza automáticamente con cada compra" : "Costo inicial del producto"}
                />

                {isEditMode ? (
                    <div style={{ background: 'rgba(251, 191, 36, 0.1)', padding: '0.5rem', borderRadius: '0.5rem', border: '1px dashed #f59e0b' }}>
                        <Input
                            label="Ajustar Stock Actual"
                            type="number"
                            value={formData.stock_current}
                            onChange={(e) => setFormData({ ...formData, stock_current: parseInt(e.target.value) })}
                            placeholder="0"
                        />
                        <small style={{ display: 'block', marginTop: '0.25rem', color: '#94a3b8' }}>
                            💡 Se creará un movimiento de ajuste automáticamente.
                        </small>
                    </div>
                ) : (
                    <div style={{ background: 'rgba(59, 130, 246, 0.1)', padding: '0.5rem', borderRadius: '0.5rem', border: '1px dashed #3b82f6' }}>
                        <Input
                            label="Stock Inicial (Opcional)"
                            type="number"
                            value={formData.initial_stock}
                            onChange={(e) => setFormData({ ...formData, initial_stock: parseInt(e.target.value) })}
                            placeholder="0"
                        />
                        <small style={{ display: 'block', marginTop: '0.25rem', color: '#94a3b8' }}>
                            💡 Se creará un movimiento de inventario inicial automáticamente.
                        </small>
                    </div>
                )}

                <div>
                    <label style={{display: 'block', marginBottom: '0.5rem'}}>Medidas (opcional)</label>
                    <MeasurementInput
                        value={formData.measurements}
                        onChange={(m) => setFormData({...formData, measurements: m})}
                    />
                </div>
            </div>

            <div style={{
                display: 'flex',
                justifyContent: 'flex-end',
                gap: '1rem',
                marginTop: '2rem'
            }}>
                <Button
                    variant="secondary"
                    onClick={onCancel}
                    disabled={loading}
                >
                    Cancelar
                </Button>
                <Button
                    type="submit"
                    variant="primary"
                    disabled={loading}
                >
                    {loading ? 'Guardando...' : (isEditMode ? 'Actualizar Producto' : 'Guardar Producto')}
                </Button>
            </div>
        </form>
    );
};

export default ProductForm;
