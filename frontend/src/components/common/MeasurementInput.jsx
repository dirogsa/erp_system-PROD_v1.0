import React from 'react';
import Input from './Input';
import Select from './Select';
import Button from './Button';

const MeasurementRow = ({index, value, onChange, onRemove}) => {
    const update = (changes) => onChange(index, {...value, ...changes});

    return (
        <div style={{display: 'flex', gap: '0.5rem', alignItems: 'center'}}>
            <Input
                placeholder="Etiqueta (ej: A)"
                value={value.label}
                onChange={(e) => update({label: e.target.value})}
                style={{flex: '0 0 120px'}}
            />
            <Select
                value={value.unit}
                onChange={(e) => update({unit: e.target.value})}
                options={[{value: 'mm', label: 'mm'}, {value: 'rosca', label: 'rosca'}]}
                style={{width: '110px'}}
            />
            <Input
                type="number"
                placeholder="Valor"
                value={value.value}
                onChange={(e) => update({value: e.target.value})}
                style={{width: '120px'}}
            />
            <Button variant="danger" onClick={() => onRemove(index)}>Eliminar</Button>
        </div>
    )
}

export default function MeasurementInput({value = [], onChange}){
    const rows = value || [];

    const setRow = (idx, row) => {
        const next = [...rows];
        next[idx] = row;
        onChange(next);
    }

    const addRow = () => onChange([...(rows || []), {label: '', unit: 'mm', value: ''}]);
    const removeRow = (idx) => {
        const next = [...rows];
        next.splice(idx,1);
        onChange(next);
    }

    return (
        <div>
            {rows.map((r, i) => (
                <MeasurementRow key={i} index={i} value={r} onChange={setRow} onRemove={removeRow} />
            ))}

            <div style={{marginTop: '0.5rem'}}>
                <Button variant="secondary" onClick={addRow}>+ Añadir medida</Button>
            </div>
        </div>
    )
}
