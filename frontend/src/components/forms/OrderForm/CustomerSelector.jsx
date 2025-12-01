import React, { useState, useEffect } from 'react';
import Input from '../../common/Input';
import Button from '../../common/Button';
import Select from '../../common/Select';
import { useCustomers } from '../../../hooks/useCustomers';
import { useNotification } from '../../../hooks/useNotification';

const CustomerSelector = ({
    value,
    onChange,
    readOnly = false,
    required = false
}) => {
    const { getCustomerByRuc, getCustomerBranches, customers } = useCustomers();
    const { showNotification } = useNotification();
    const [ruc, setRuc] = useState(value?.ruc || '');
    const [loading, setLoading] = useState(false);
    const [branches, setBranches] = useState(value?.branches || []);
    const [branchFilter, setBranchFilter] = useState('');

    // Actualizar RUC local si cambia el valor externo
    useEffect(() => {
        if (value?.ruc && value.ruc !== ruc) {
            setRuc(value.ruc);
        }
    }, [value]);

    const handleRucSearch = async () => {
        if (!ruc || ruc.length !== 11) {
            showNotification('Ingrese un RUC válido de 11 dígitos', 'warning');
            return;
        }

        setLoading(true);
        try {
            const customer = await getCustomerByRuc(ruc);
            if (customer) {
                // Try to fetch branches for the customer (may be many)
                try {
                    if (customer._id) {
                        const fetchedBranches = await getCustomerBranches(customer._id);
                        setBranches(fetchedBranches || []);
                        // Ensure the customer object contains branches and a delivery_address
                        const enriched = {
                            ...customer,
                            branches: fetchedBranches || [],
                            delivery_address: customer.delivery_address || customer.address || (fetchedBranches && fetchedBranches.find(b => b.is_main)?.address) || ''
                        };
                        onChange(enriched);
                    } else {
                        onChange(customer);
                    }
                } catch (err) {
                    // If fetching branches fails, still return basic customer
                    onChange(customer);
                }
                showNotification('Cliente encontrado', 'success');
            } else {
                showNotification('Cliente no encontrado', 'warning');
                // Limpiar selección pero mantener RUC
                setBranches([]);
                onChange({ ruc, name: '', address: '', branches: [] });
            }
        } catch (error) {
            console.error('Error searching customer:', error);
            // El hook ya muestra notificación de error si falla la API
        } finally {
            setLoading(false);
        }
    };

    const handleBranchChange = (e) => {
        const branchName = e.target.value;
        const branch = value.branches?.find(b => b.name === branchName);

        onChange({
            ...value,
            delivery_branch_name: branchName,
            delivery_address: branch ? branch.address : value.address
        });
    };

    return (
        <div style={{
            padding: '1.5rem',
            backgroundColor: '#1e293b',
            borderRadius: '0.5rem',
            marginBottom: '1.5rem'
        }}>
            <h3 style={{ marginBottom: '1rem', color: '#e2e8f0', fontSize: '1.1rem' }}>
                Datos del Cliente
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-start' }}>
                    <div style={{ flex: 1 }}>
                        <Input
                            label="RUC"
                            value={ruc}
                            onChange={(e) => setRuc(e.target.value)}
                            placeholder="Ingrese RUC"
                            disabled={readOnly || loading}
                            required={required}
                            maxLength={11}
                        />
                    </div>
                    <div style={{ marginTop: '1.8rem' }}>
                        <Button
                            onClick={handleRucSearch}
                            disabled={readOnly || loading || !ruc}
                            variant="primary"
                            size="medium"
                        >
                            {loading ? '...' : 'Buscar'}
                        </Button>
                    </div>
                </div>

                <Input
                    label="Razón Social"
                    value={value?.name || ''}
                    onChange={(e) => onChange({ ...value, name: e.target.value })}
                    placeholder="Nombre del cliente"
                    disabled={readOnly} // Permitir edición manual si no se encuentra
                    required={required}
                />

                {/* Selector de Sucursal si existen sucursales */}
                {((branches && branches.length > 0) || (value?.branches && value.branches.length > 0)) ? (
                    <div>
                        {/* If there are many branches, show a filter input to help selection */}
                        {((branches && branches.length) || (value?.branches && value.branches.length)) > 10 && (
                            <Input
                                label="Filtrar sucursales"
                                value={branchFilter}
                                onChange={(e) => setBranchFilter(e.target.value)}
                                placeholder="Escribe nombre o dirección para filtrar"
                                disabled={readOnly}
                            />
                        )}
                        <Select
                            label="Sucursal de Entrega"
                            value={value.delivery_branch_name || ''}
                            onChange={handleBranchChange}
                            options={(branches && branches.length > 0 ? branches : (value.branches || [])).filter(b => {
                                if (!branchFilter) return true;
                                const q = branchFilter.toLowerCase();
                                return (b.branch_name || b.name || '').toLowerCase().includes(q) || (b.address || '').toLowerCase().includes(q);
                            }).map(b => ({
                                value: (b.branch_name || b.name),
                                label: `${(b.branch_name || b.name)} - ${(b.address || '')}`
                            }))}
                            disabled={readOnly}
                            placeholder="Seleccione sucursal (Principal por defecto)"
                        />
                    </div>
                ) : (
                    <Input
                        label="Dirección"
                        value={value?.address || ''}
                        onChange={(e) => onChange({ ...value, address: e.target.value })}
                        placeholder="Dirección fiscal"
                        disabled={readOnly}
                        required={required}
                    />
                )}

                {/* Mostrar dirección de entrega específica si se seleccionó sucursal */}
                {value?.delivery_branch_name && (
                    <Input
                        label="Dirección de Entrega"
                        value={value?.delivery_address || ''}
                        disabled={true}
                        placeholder="Dirección de la sucursal"
                    />
                )}
            </div>
        </div>
    );
};

export default CustomerSelector;
