
import React, { useState } from 'react';
import Modal from '../../Modal';
import Button from '../../common/Button';
import ProductSearchInput from '../../common/ProductSearchInput';
import Input from '../../common/Input';
import { useNotification } from '../../../hooks/useNotification';
import api from '../../../services/api';

const InventoryAdjustmentModal = ({ isOpen, onClose, onAdjustmentSuccess }) => {
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [adjustmentQuantity, setAdjustmentQuantity] = useState('');
  const [reason, setReason] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { addNotification } = useNotification();

  const handleProductSelect = (product) => {
    setSelectedProduct(product);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedProduct) {
      addNotification('Por favor, seleccione un producto.', 'error');
      return;
    }
    
    const quantity = parseInt(adjustmentQuantity, 10);
    if (isNaN(quantity) || quantity === 0) {
      addNotification('La cantidad debe ser un número diferente de cero.', 'error');
      return;
    }

    if (!reason.trim()) {
      addNotification('Por favor, ingrese un motivo para el ajuste.', 'error');
      return;
    }

    setIsLoading(true);
    try {
      // Esta es la llamada a la API que implementaremos en el backend
      await api.post('/inventory/adjustments', {
        product_sku: selectedProduct.sku,
        quantity_adjusted: quantity,
        reason: reason,
      });

      addNotification('Ajuste de inventario realizado con éxito.', 'success');
      if (onAdjustmentSuccess) {
        onAdjustmentSuccess();
      }
      handleClose();
    } catch (error) {
      console.error("Error creating inventory adjustment:", error);
      addNotification(error.response?.data?.detail || 'Error al realizar el ajuste.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setSelectedProduct(null);
    setAdjustmentQuantity('');
    setReason('');
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Ajuste de Inventario"
      size="lg"
    >
      <form onSubmit={handleSubmit}>
        <div className="space-y-4">
          <ProductSearchInput
            onProductSelect={handleProductSelect}
            placeholder="Buscar por nombre o SKU..."
            label="Producto a Ajustar"
          />

          {selectedProduct && (
            <div className="p-3 bg-gray-100 rounded-md">
              <p className="font-semibold">{selectedProduct.name}</p>
              <p className="text-sm text-gray-600">SKU: {selectedProduct.sku}</p>
              <p className="text-sm text-gray-600">Stock Actual: {selectedProduct.stock_current}</p>
            </div>
          )}

          <Input
            label="Cantidad a Ajustar"
            type="number"
            value={adjustmentQuantity}
            onChange={(e) => setAdjustmentQuantity(e.target.value)}
            placeholder="Ej: 20 (para añadir) o -15 (para quitar)"
            required
          />

          <Input
            label="Motivo del Ajuste"
            type="text"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Ej: Corrección de conteo anual"
            required
          />
        </div>
        <div className="flex justify-end mt-6">
          <Button type="button" onClick={handleClose} variant="secondary" className="mr-2">
            Cancelar
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? 'Guardando...' : 'Guardar Ajuste'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default InventoryAdjustmentModal;
