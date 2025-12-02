import React, { useState } from 'react';
import Modal from '../../Modal';
// Se importa la función directamente, en lugar de inventoryService
import { recordInventoryMovement } from '../../../services/api';

const InventoryAdjustmentModal = ({ isOpen, onClose, product, adjustmentType, onSuccess }) => {
    const [quantity, setQuantity] = useState(1);
    const [notes, setNotes] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    const title = adjustmentType === 'IN' ? 'Registrar Entrada' : 'Registrar Salida/Pérdida';

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);

        const movementData = {
            product_sku: product.sku,
            type: adjustmentType, // 'IN' o 'OUT'
            quantity: parseInt(quantity, 10),
            notes: notes,
            // El warehouse_id se puede manejar en el backend o pasarlo si es necesario
        };

        try {
            // Se usa la función correcta `recordInventoryMovement`
            await recordInventoryMovement(movementData); 
            onSuccess();
            onClose();
        } catch (err) {
            setError(err.response?.data?.detail || 'Ocurrió un error al registrar el movimiento.');
        } finally {
            setIsLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={title}>
            <form onSubmit={handleSubmit} className="space-y-4">
                <p><strong>Producto:</strong> {product?.name} ({product?.sku})</p>
                <div>
                    <label htmlFor="quantity" className="block text-sm font-medium text-gray-700">Cantidad</label>
                    <input
                        type="number"
                        id="quantity"
                        value={quantity}
                        onChange={(e) => setQuantity(e.target.value)}
                        min="1"
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        required
                    />
                </div>
                <div>
                    <label htmlFor="notes" className="block text-sm font-medium text-gray-700">Notas / Motivo</label>
                    <textarea
                        id="notes"
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        rows="3"
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    />
                </div>
                {error && <p className="text-red-500 text-sm">{error}</p>}
                <div className="flex justify-end space-x-2">
                    <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300">
                        Cancelar
                    </button>
                    <button type="submit" disabled={isLoading} className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-blue-300">
                        {isLoading ? 'Registrando...' : 'Registrar Movimiento'}
                    </button>
                </div>
            </form>
        </Modal>
    );
};

export default InventoryAdjustmentModal;
