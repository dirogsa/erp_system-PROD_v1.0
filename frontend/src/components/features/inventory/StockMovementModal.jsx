import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createStockMovement } from '../../../services/api';
import { useNotification } from '../../../hooks/useNotification';
import Button from '../../common/Button';
import Input from '../../common/Input';
import Select from '../../common/Select';

const StockMovementModal = ({ onClose }) => {
    const [productSku, setProductSku] = useState('');
    const [quantity, setQuantity] = useState(1);
    const [movementType, setMovementType] = useState('IN'); // 'IN' o 'OUT'
    const [reason, setReason] = useState('');
    
    const queryClient = useQueryClient();
    const { showNotification } = useNotification();

    const mutation = useMutation({
        mutationFn: createStockMovement,
        onSuccess: () => {
            showNotification('Movimiento de stock registrado con éxito', 'success');
            queryClient.invalidateQueries(['stockMovements']);
            queryClient.invalidateQueries(['products']); // Invalidar productos para actualizar el stock
            onClose();
        },
        onError: (err) => {
            showNotification(err.response?.data?.detail || 'Error al registrar el movimiento', 'error');
        }
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!productSku || !reason) {
            showNotification('Por favor, complete todos los campos obligatorios', 'warning');
            return;
        }
        
        const movementData = {
            product_sku: productSku,
            quantity: parseInt(quantity, 10),
            movement_type: movementType,
            reference_document: reason,
            // El backend asigna la fecha y otros valores por defecto
        };
        mutation.mutate(movementData);
    };

    return (
        <div style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.7)', zIndex: 1000,
            display: 'flex', justifyContent: 'center', alignItems: 'center'
        }}>
            <div style={{ backgroundColor: '#0f172a', borderRadius: '0.5rem', width: '100%', maxWidth: '500px' }}>
                <div style={{ padding: '1.5rem', borderBottom: '1px solid #334155', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h2 style={{ color: 'white', margin: 0 }}>Registrar Movimiento de Stock</h2>
                    <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#94a3b8', fontSize: '1.5rem', cursor: 'pointer' }}>×</button>
                </div>
                
                <form onSubmit={handleSubmit} style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    
                    <Input
                        label="Producto (SKU)"
                        value={productSku}
                        onChange={(e) => setProductSku(e.target.value)}
                        placeholder="Ingrese el SKU del producto"
                        required
                    />

                    <div style={{ display: 'flex', gap: '1rem' }}>
                        <Button 
                            type="button"
                            onClick={() => setMovementType('IN')} 
                            variant={movementType === 'IN' ? 'primary' : 'secondary'}
                            style={{ flex: 1, backgroundColor: movementType === 'IN' ? '#2563eb' : '#334155'}}
                        >
                            Ingreso
                        </Button>
                        <Button 
                            type="button"
                            onClick={() => setMovementType('OUT')} 
                            variant={movementType === 'OUT' ? 'primary' : 'secondary'}
                            style={{ flex: 1, backgroundColor: movementType === 'OUT' ? '#dc2626' : '#334155' }}
                        >
                            Salida
                        </Button>
                    </div>
                    
                    <Input
                        label="Cantidad"
                        type="number"
                        value={quantity}
                        onChange={(e) => setQuantity(e.target.value)}
                        min="1"
                        required
                    />

                    <Input
                        label="Motivo del movimiento"
                        value={reason}
                        onChange={(e) => setReason(e.target.value)}
                        placeholder="Ej: Ajuste de inventario inicial, merma por daño..."
                        required
                    />

                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1.5rem' }}>
                        <Button type="button" variant="secondary" onClick={onClose}>Cancelar</Button>
                        <Button type="submit" loading={mutation.isLoading}>Registrar</Button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default StockMovementModal;
