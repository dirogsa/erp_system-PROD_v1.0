// Formateo de fechas
export const formatDate = (date) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('es-PE', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
    });
};

export const formatDateTime = (date) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleString('es-PE', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
    });
};

// Formateo de moneda
export const formatCurrency = (amount) => {
    if (amount === null || amount === undefined) return 'S/ 0.00';
    return `S/ ${parseFloat(amount).toFixed(2)}`;
};

// Formateo de números
export const formatNumber = (num) => {
    if (num === null || num === undefined) return '0';
    return num.toLocaleString('es-PE');
};

// Formateo de estado
export const formatStatus = (status) => {
    const statusMap = {
        'PENDING': 'Pendiente',
        'INVOICED': 'Facturada',
        'PAID': 'Pagado',
        'PARTIAL': 'Pago Parcial',
        'DISPATCHED': 'Despachado',
        'RECEIVED': 'Recibido'
    };
    return statusMap[status] || status;
};

// Nueva función para obtener la variante del estado de pago
export const getPaymentStatusVariant = (status) => {
    switch (status) {
        case 'PAID':
            return 'success';
        case 'PARTIAL':
            return 'warning';
        case 'PENDING':
        default:
            return 'error';
    }
};

// Formateo de RUC
export const formatRUC = (ruc) => {
    if (!ruc) return '';
    // Formato: 20-12345678-9
    if (ruc.length === 11) {
        return `${ruc.slice(0, 2)}-${ruc.slice(2, 10)}-${ruc.slice(10)}`;
    }
    return ruc;
};
