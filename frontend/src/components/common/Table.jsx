
import React from 'react';

const Table = ({
    columns = [],
    data = [],
    loading = false,
    onRowClick,
    emptyMessage = "No hay datos disponibles"
}) => {
    if (loading) {
        return <div style={{ textAlign: 'center', padding: '2rem', color: '#94a3b8' }}>Cargando...</div>;
    }

    if (!data || data.length === 0) {
        return <div style={{ textAlign: 'center', padding: '2rem', color: '#94a3b8', border: '1px dashed #334155', borderRadius: '0.5rem' }}>{emptyMessage}</div>;
    }

    const tableHeader = (
        <thead style={{ backgroundColor: '#1e293b' }}>
            <tr>
                {columns.map((col, index) => (
                    <th 
                        key={col.key || index} 
                        style={{
                            padding: '0.75rem 1.5rem', 
                            textAlign: col.align || 'left',
                            borderBottom: '1px solid #334155',
                            color: '#cbd5e1',
                            fontWeight: '600',
                            textTransform: 'uppercase',
                            fontSize: '0.75rem'
                        }}
                    >
                        {col.label}
                    </th>
                ))}
            </tr>
        </thead>
    );

    const tableBody = (
        <tbody>
            {data.map((row, rowIndex) => (
                <tr 
                    key={rowIndex} 
                    onClick={() => onRowClick && onRowClick(row)}
                    style={{ 
                        cursor: onRowClick ? 'pointer' : 'default',
                        borderBottom: '1px solid #334155'
                    }}
                    className="table-row"
                >
                    {columns.map((column, colIndex) => (
                        <td 
                            key={column.key || colIndex} 
                            style={{
                                padding: '0.75rem 1.5rem', 
                                textAlign: column.align || 'left',
                                color: '#e2e8f0'
                            }}
                        >
                            {column.render ? column.render(row) : (row ? row[column.key] : null)}
                        </td>
                    ))}
                </tr>
            ))}
        </tbody>
    );

    return (
        <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                {tableHeader}
                {tableBody}
            </table>
        </div>
    );
};

export default Table;
