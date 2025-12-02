import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getProducts } from '../../services/api';
import debounce from 'lodash.debounce';

const ProductSearchInput = ({ onSelectProduct }) => {
    const [search, setSearch] = useState('');
    const [isOpen, setIsOpen] = useState(false);

    const debouncedSetSearch = useMemo(() => debounce(setSearch, 300), []);

    const { data: products, isLoading } = useQuery({
        queryKey: ['products', { search, limit: 10 }],
        queryFn: () => {
            if (search.trim() === '') return [];
            // CORREGIDO: Pasar un solo objeto como parámetro
            return getProducts({ page: 1, limit: 10, search }).then(res => res.data.items);
        },
        enabled: search.trim().length > 2, 
    });

    const handleSelect = (product) => {
        onSelectProduct(product);
        setSearch('');
        setIsOpen(false);
    };

    return (
        <div className="relative">
            <input
                type="text"
                onChange={(e) => {
                    debouncedSetSearch(e.target.value);
                    setIsOpen(true);
                }}
                placeholder="Buscar producto por nombre o SKU..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            />
            {isOpen && search.trim().length > 2 && (
                <ul className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
                    {isLoading ? (
                        <li className="px-3 py-2 text-gray-500">Buscando...</li>
                    ) : products && products.length > 0 ? (
                        products.map(product => (
                            <li
                                key={product.id}
                                onClick={() => handleSelect(product)}
                                className="px-3 py-2 cursor-pointer hover:bg-gray-100"
                            >
                                {product.name} ({product.sku})
                            </li>
                        ))
                    ) : (
                        <li className="px-3 py-2 text-gray-500">No se encontraron productos.</li>
                    )}
                </ul>
            )}
        </div>
    );
};

export default ProductSearchInput;