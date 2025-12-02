import React, { useState } from 'react';
import Input from '../../common/Input';
import Button from '../../common/Button';
import MeasurementInput from '../../common/MeasurementInput';
import ImageWithFallback from '../../common/ImageWithFallback';
import { useNotification } from '../../../hooks/useNotification';

const FormSection = ({ title, children }) => (
    <div style={{ marginBottom: '2rem' }}>
        <h3 style={{ color: '#94a3b8', marginBottom: '1.5rem', borderBottom: '1px solid #334155', paddingBottom: '0.5rem' }}>
            {title}
        </h3>
        {children}
    </div>
);

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
        image_url: '',
        price: 0,
        cost: 0,
        stock_initial: 0,
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
        <form onSubmit={handleSubmit} style={{ padding: '2rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                {/* Columna Izquierda */}
                <div>
                    <FormSection title="Información Principal">
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem'}}>
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
                        </div>
                    </FormSection>

                    <FormSection title="Detalles Comerciales">
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem'}}>
                            <Input
                                label="Precio de Lista (S/)"
                                type="number"
                                value={formData.price}
                                onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
                                required
                                min="0"
                                step="0.01"
                            />
                            <Input
                                label="Costo Promedio (S/)"
                                type="number"
                                value={formData.cost}
                                onChange={(e) => setFormData({ ...formData, cost: parseFloat(e.target.value) || 0 })}
                                required
                                min="0"
                                step="0.01"
                                disabled={isEditMode}
                                helperText={isEditMode ? "Se actualiza con cada compra" : "Costo inicial del producto"}
                            />
                        </div>
                    </FormSection>
                </div>

                {/* Columna Derecha */}
                <div>
                    <FormSection title="Imagen y Stock">
                        <Input
                            label="URL de la Imagen"
                            value={formData.image_url}
                            onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                            placeholder="https://ejemplo.com/imagen.png"
                        />
                        {formData.image_url && (
                            <div style={{ textAlign: 'center', margin: '1rem 0' }}>
                                <ImageWithFallback 
                                    src={formData.image_url} 
                                    alt="Vista previa" 
                                    style={{ maxWidth: '150px', maxHeight: '150px', borderRadius: '0.5rem', objectFit: 'cover'}} 
                                />
                            </div>
                        )}

                        {isEditMode ? (
                            <div style={{ background: 'rgba(251, 191, 36, 0.1)', padding: '1rem', borderRadius: '0.5rem', border: '1px dashed #f59e0b', marginTop: '1rem' }}>
                                <Input
                                    label="Ajustar Stock Actual"
                                    type="number"
                                    value={formData.stock_current}
                                    onChange={(e) => setFormData({ ...formData, stock_current: parseInt(e.target.value) || 0 })}
                                />
                                <small style={{ display: 'block', marginTop: '0.5rem', color: '#94a3b8' }}>
                                    💡 Se creará un movimiento de ajuste automáticamente.
                                </small>
                            </div>
                        ) : (
                            <div style={{ background: 'rgba(59, 130, 246, 0.1)', padding: '1rem', borderRadius: '0.5rem', border: '1px dashed #3b82f6', marginTop: '1rem' }}>
                                <Input
                                    label="Stock Inicial (Opcional)"
                                    type="number"
                                    value={formData.stock_initial}
                                    onChange={(e) => setFormData({ ...formData, stock_initial: parseInt(e.target.value) || 0 })}
                                />
                                <small style={{ display: 'block', marginTop: '0.5rem', color: '#94a3b8' }}>
                                    💡 Se creará un movimiento de inventario inicial.
                                </small>
                            </div>
                        )}
                    </FormSection>
                </div>
            </div>

            <FormSection title="Especificaciones Técnicas (Opcional)">
                 <MeasurementInput
                    value={formData.measurements}
                    onChange={(m) => setFormData({...formData, measurements: m})}
                />
            </FormSection>

            <div style={{
                display: 'flex',
                justifyContent: 'flex-end',
                gap: '1rem',
                marginTop: '2rem',
                paddingTop: '1.5rem',
                borderTop: '1px solid #334155'
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
