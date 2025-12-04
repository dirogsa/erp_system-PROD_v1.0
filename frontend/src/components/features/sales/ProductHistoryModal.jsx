import React, { useState, useEffect } from 'react';
import { getStockMovementsByProduct } from '../../../services/api';
import Table from '../../common/Table';
import { formatCurrency, formatDate } from '../../../utils/formatters';

// Componente para mostrar el historial de un producto en un modal
const ProductHistoryModal = ({ productId, onClose }) => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (productId) {
      const fetchHistory = async () => {
        try {
          setLoading(true);
          const response = await getStockMovementsByProduct(productId);
          setHistory(response.data);
          setError('');
        } catch (err) {
          setError('Error al cargar el historial del producto.');
          console.error(err);
        } finally {
          setLoading(false);
        }
      };
      fetchHistory();
    }
  }, [productId]);

  const columns = [
    { Header: 'Fecha', accessor: 'timestamp', Cell: ({ value }) => formatDate(value) },
    { Header: 'Tipo', accessor: 'movement_type' },
    { Header: 'Cantidad', accessor: 'quantity' },
    { Header: 'Referencia', accessor: 'reference_document' },
  ];

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-1/2 shadow-lg rounded-md bg-white">
        <div className="mt-3 text-center">
          <h3 className="text-lg leading-6 font-medium text-gray-900">Historial del Producto</h3>
          <div className="mt-2 px-7 py-3">
            {loading ? (
              <p>Cargando...</p>
            ) : error ? (
              <p className="text-red-500">{error}</p>
            ) : (
              <Table columns={columns} data={history} />
            )}
          </div>
          <div className="items-center px-4 py-3">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-500 text-white text-base font-medium rounded-md w-full shadow-sm hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-300"
            >
              Cerrar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductHistoryModal;
