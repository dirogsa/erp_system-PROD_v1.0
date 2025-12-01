import React, { useState } from 'react';
import Table from '../../common/Table';
import Button from '../../common/Button';
import Input from '../../common/Input';
import Select from '../../common/Select';
import Badge from '../../common/Badge';
import { useLosses } from '../../../hooks/useLosses';
import { useProducts } from '../../../hooks/useProducts';
import { formatCurrency, formatDate } from '../../../utils/formatters';

const LossesSection = () => {
    const { losses, summary, createLoss, loading } = useLosses();
    const { products, refetch: refetchProducts } = useProducts();
    const [isModalOpen, setIsModalOpen] = useState(false);

    const [formData, setFormData] = useState({
        sku: '',
        quantity: 1,
        loss_type: 'LOSS_DAMAGED',
        notes: '',
        responsible: ''
    });

    const lossTypes = [
        { value: 'LOSS_DAMAGED', label: 'Deteriorado/Roto' },
        { value: 'LOSS_DEFECTIVE', label: 'Defecto de Fábrica' },
        { value: 'LOSS_HUMIDITY', label: 'Dañado por Humedad' },
        { value: 'LOSS_EXPIRED', label: 'Vencido/Caducado' },
        { value: 'LOSS_THEFT', label: 'Robo' },
        { value: 'LOSS_OTHER', label: 'Otro' }
    ];

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await createLoss({
                ...formData,
                quantity: parseInt(formData.quantity)
            });
            setIsModalOpen(false);
            setFormData({ sku: '', quantity: 1, loss_type: 'LOSS_DAMAGED', notes: '', responsible: '' });
            refetchProducts(); // Refresh stock
        } catch (error) {
            // Error handled by hook
        }
    };

    const getProductName = (sku) => {
        const product = products.find(p => p.sku === sku);
        return product ? product.name : sku;
    };

    const columns = [
        { label: 'Fecha', key: 'date', render: (val) => formatDate(val) },
        {
            label: 'Producto',
            key: 'product_sku',
            render: (val) => (
                <div>
                    <div style={{ fontWeight: 'bold' }}>{getProductName(val)}</div>
                    <div style={{ fontSize: '0.8rem', color: '#64748b' }}>{val}</div>
                </div>
            )
        },
        {
            label: 'Tipo',
            key: 'movement_type',
            render: (val) => {
                const type = lossTypes.find(t => t.value === val);
                return <Badge status="ERROR">{type ? type.label : val}</Badge>;
            }
        },
        { label: 'Cant.', key: 'quantity', align: 'center', render: (val) => <strong>{val}</strong> },
        {
            label: 'Costo Impacto',
            key: 'cost',
            align: 'right',
            render: (_, row) => formatCurrency(row.quantity * (row.unit_cost || 0))
        },
        { label: 'Responsable', key: 'responsible' },
        { label: 'Notas', key: 'notes' }
    ];

    return (
        <div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
                <div style={{ textAlign: 'center', padding: '1.5rem', backgroundColor: '#1e293b', borderRadius: '0.5rem' }}>
                    <h3 style={{ fontSize: '2rem', color: '#ef4444', margin: 0 }}>{summary.total_quantity}</h3>
                    <p style={{ color: '#94a3b8', margin: 0 }}>Unidades Perdidas</p>
                </div>
                <div style={{ textAlign: 'center', padding: '1.5rem', backgroundColor: '#1e293b', borderRadius: '0.5rem' }}>
                    <h3 style={{ fontSize: '2rem', color: '#ef4444', margin: 0 }}>{formatCurrency(summary.total_cost)}</h3>
                    <p style={{ color: '#94a3b8', margin: 0 }}>Costo Total</p>
                </div>
                <div style={{ textAlign: 'center', padding: '1.5rem', backgroundColor: '#1e293b', borderRadius: '0.5rem' }}>
                    <h3 style={{ fontSize: '2rem', color: '#94a3b8', margin: 0 }}>{summary.total_movements}</h3>
                    <p style={{ color: '#94a3b8', margin: 0 }}>Registros</p>
                </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1rem' }}>
                <Button onClick={() => setIsModalOpen(true)} variant="danger">+ Registrar Merma</Button>
            </div>

            <Table
                columns={columns}
                data={losses}
                emptyMessage="No hay mermas registradas"
            />

            {isModalOpen && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    backgroundColor: 'rgba(0,0,0,0.7)', zIndex: 1000,
                    display: 'flex', justifyContent: 'center', alignItems: 'center'
                }}>
                    <div style={{ backgroundColor: '#0f172a', padding: '2rem', borderRadius: '0.5rem', width: '100%', maxWidth: '500px' }}>
                        <h2 style={{ color: 'white', marginBottom: '1.5rem' }}>Registrar Merma / Pérdida</h2>
                        <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '1rem' }}>
                            <Select
                                label="Producto"
                                value={formData.sku}
                                onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                                options={products.map(p => ({ value: p.sku, label: `${p.name} (Stock: ${p.stock_current})` }))}
                                required
                            />

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                <Input
                                    label="Cantidad"
                                    type="number"
                                    value={formData.quantity}
                                    onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                                    min="1"
                                    required
                                />
                                <Select
                                    label="Tipo de Merma"
                                    value={formData.loss_type}
                                    onChange={(e) => setFormData({ ...formData, loss_type: e.target.value })}
                                    options={lossTypes}
                                    required
                                />
                            </div>

                            <Input
                                label="Responsable"
                                value={formData.responsible}
                                onChange={(e) => setFormData({ ...formData, responsible: e.target.value })}
                                placeholder="Nombre de quien reporta"
                                required
                            />

                            <Input
                                label="Notas / Descripción"
                                value={formData.notes}
                                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                placeholder="Describa la causa..."
                                required
                            />

                            <div style={{ background: '#fffbeb', padding: '0.75rem', borderRadius: '0.5rem', fontSize: '0.9rem', color: '#92400e', border: '1px solid #fcd34d' }}>
                                ⚠️ Esta acción reducirá el stock inmediatamente y no se puede deshacer.
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1rem' }}>
                                <Button variant="secondary" onClick={() => setIsModalOpen(false)}>Cancelar</Button>
                                <Button type="submit" variant="danger" disabled={loading}>Registrar Pérdida</Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default LossesSection;
