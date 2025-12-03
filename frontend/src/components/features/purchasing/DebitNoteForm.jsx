import React, { useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import Button from '../../common/Button';
import Input from '../../common/Input';
import Select from '../../common/Select';
import { formatCurrency } from '../../../utils/formatters';
import { DEBIT_NOTE_REASONS } from '../../../utils/constants';

const DebitNoteForm = ({ invoice, onSubmit, onCancel }) => {
    const {
        register,
        control,
        handleSubmit,
        watch,
        formState: { errors },
    } = useForm({
        defaultValues: {
            date: new Date().toISOString().split('T')[0],
            reason: '',
            items: [],
            notes: '',
        },
    });

    const { fields, append, remove } = useFieldArray({
        control,
        name: 'items',
    });

    const [availableItems, setAvailableItems] = useState(invoice.items);

    const watchedItems = watch('items');
    const totalDebit = watchedItems.reduce((acc, item) => acc + (item.quantity * item.unit_cost || 0), 0);

    const handleAddItem = (productSku) => {
        const itemToAdd = availableItems.find(i => i.product_sku === productSku);
        if (itemToAdd) {
            append({
                product_sku: itemToAdd.product_sku,
                quantity: 1,
                unit_cost: itemToAdd.unit_cost, // Correct field for purchasing
            });
            setAvailableItems(prev => prev.filter(i => i.product_sku !== productSku));
        }
    };

    const submitHandler = (data) => {
        const processedData = {
            ...data,
            items: data.items.map(item => ({
                ...item,
                quantity: Number(item.quantity),
                unit_cost: Number(item.unit_cost),
            })),
            total_amount: totalDebit,
        };
        onSubmit(processedData);
    };

    return (
        <form onSubmit={handleSubmit(submitHandler)} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input label="N° Factura Compra" value={invoice.invoice_number} disabled />
                <Input label="Proveedor" value={invoice.supplier_name} disabled />
                <Input type="date" label="Fecha de Nota de Débito" {...register('date', { required: true })} />
                <Select label="Motivo General" {...register('reason', { required: 'El motivo es obligatorio' })} options={DEBIT_NOTE_REASONS} error={errors.reason} />
            </div>

            <hr />

            <div className="space-y-2">
                <h3 className="font-semibold">Ítems a Devolver/Ajustar</h3>
                {fields.map((field, index) => (
                    <div key={field.id} className="flex items-center gap-2 p-2 border rounded">
                        <p className="flex-1 font-medium">{watchedItems[index].product_sku}</p>
                        <Input type="number" min="1" max={invoice.items.find(i=>i.product_sku === watchedItems[index].product_sku)?.quantity || 1} {...register(`items.${index}.quantity`, { required: true, valueAsNumber: true })} className="w-24" />
                        <Input type="number" step="0.01" {...register(`items.${index}.unit_cost`, { required: true, valueAsNumber: true })} className="w-24" />
                        <Button type="button" onClick={() => remove(index)} variant="danger" size="sm">Eliminar</Button>
                    </div>
                ))}
            </div>

            <div>
                <Select
                    label="Añadir Producto de la Factura"
                    onChange={(e) => handleAddItem(e.target.value)}
                    options={availableItems.map(item => ({ value: item.product_sku, label: `${item.product_sku} - ${item.product_name}` }))}
                    placeholder="Seleccione un producto..."
                />
            </div>

            <hr />

            <div>
                <Input label="Notas Adicionales" {...register('notes')} />
            </div>

            <div className="flex justify-between items-center">
                <h3 className="text-xl font-bold">Total Débito: {formatCurrency(totalDebit)}</h3>
                <div className="space-x-2">
                    <Button type="button" variant="secondary" onClick={onCancel}>Cancelar</Button>
                    <Button type="submit" variant="primary">Crear Nota de Débito</Button>
                </div>
            </div>
        </form>
    );
};

export default DebitNoteForm;
