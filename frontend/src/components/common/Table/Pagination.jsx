import React from 'react';
import Button from '../Button';

// CORRECCIÓN: La prop 'total' se renombró a 'totalPages' para mayor claridad.
const Pagination = ({ current, totalPages, onChange, pageSize, onPageSizeChange }) => {

    // BUG FIX: Se eliminó el cálculo incorrecto de totalPages.
    // const totalPages = Math.ceil(total / pageSize); // <-- ESTA ERA LA LÍNEA DEL BUG

    // El componente no se renderiza si hay solo una página o menos.
    if (totalPages <= 1) {
        return null;
    }

    const getPageNumbers = () => {
        const pages = [];
        const maxVisible = 5; // Máximo de botones de página a mostrar

        if (totalPages <= maxVisible) {
            // Si el total de páginas es pequeño, se muestran todas
            for (let i = 1; i <= totalPages; i++) {
                pages.push(i);
            }
        } else {
            // Si hay muchas páginas, se muestra una vista condensada con "..."
            if (current <= 3) {
                pages.push(1, 2, 3, 4, '...', totalPages);
            } else if (current >= totalPages - 2) {
                pages.push(1, '...', totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
            } else {
                pages.push(1, '...', current - 1, current, current + 1, '...', totalPages);
            }
        }
        return pages;
    };

    return (
        <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginTop: '1rem',
            padding: '1rem',
            borderTop: '1px solid #334155'
        }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <span style={{ color: '#94a3b8', fontSize: '0.875rem' }}>
                    Página {current} de {totalPages}
                </span>
                {onPageSizeChange && (
                    <select
                        value={pageSize}
                        onChange={(e) => onPageSizeChange(Number(e.target.value))}
                        style={{
                            backgroundColor: '#1e293b',
                            color: '#e2e8f0',
                            border: '1px solid #334155',
                            borderRadius: '0.25rem',
                            padding: '0.25rem 0.5rem'
                        }}
                    >
                        <option value={5}>5 / pág</option>
                        <option value={10}>10 / pág</option>
                        <option value={20}>20 / pág</option>
                        <option value={50}>50 / pág</option>
                        <option value={100}>100 / pág</option>
                    </select>
                )}
            </div>

            <div style={{ display: 'flex', gap: '0.5rem' }}>
                <Button
                    variant="secondary"
                    onClick={() => onChange(current - 1)}
                    disabled={current === 1}
                    style={{ padding: '0.25rem 0.75rem' }}
                >
                    Anterior
                </Button>

                {getPageNumbers().map((page, index) => (
                    <button
                        key={index}
                        onClick={() => typeof page === 'number' ? onChange(page) : null}
                        disabled={page === '...'}
                        style={{
                            backgroundColor: page === current ? '#3b82f6' : 'transparent',
                            color: page === current ? 'white' : '#94a3b8',
                            border: '1px solid #334155',
                            borderRadius: '0.25rem',
                            padding: '0.25rem 0.75rem',
                            minWidth: '2.5rem',
                            cursor: page === '...' ? 'default' : 'pointer',
                            transition: 'all 0.2s'
                        }}
                    >
                        {page}
                    </button>
                ))}

                <Button
                    variant="secondary"
                    onClick={() => onChange(current + 1)}
                    disabled={current === totalPages}
                    style={{ padding: '0.25rem 0.75rem' }}
                >
                    Siguiente
                </Button>
            </div>
        </div>
    );
};

export default Pagination;
