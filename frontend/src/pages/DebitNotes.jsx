import React, { useState, useMemo, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import useDebitNotes from '../hooks/useDebitNotes';
import Table from '../components/common/Table';
import Modal from '../components/Modal'; // Corrected path
import Receipt from '../components/common/Receipt';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import Loading from '../components/common/Loading';
import Alert from '../components/common/Alert';
import Badge from '../components/common/Badge';
import { formatDateTime, formatCurrency } from '../utils/formatters';
import { getDebitNoteReasonText, getDebitNoteStatusVariant } from '../utils/constants';

const PAGE_LIMIT = 50;

const DebitNotes = () => {
    const [searchParams, setSearchParams] = useSearchParams();

    const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '');
    const [page, setPage] = useState(Number(searchParams.get('page')) || 1);

    const [selectedNote, setSelectedNote] = useState(null);
    const [isReceiptVisible, setIsReceiptVisible] = useState(false);

    const { notes, totalPages, loading, error } = useDebitNotes(page, PAGE_LIMIT, searchTerm);

    useEffect(() => {
        const newSearchParams = new URLSearchParams();
        if (searchTerm) newSearchParams.set('search', searchTerm);
        if (page > 1) newSearchParams.set('page', page.toString());
        setSearchParams(newSearchParams);
    }, [searchTerm, page, setSearchParams]);

    const handleViewReceipt = (note) => {
        setSelectedNote(note);
        setIsReceiptVisible(true);
    };

    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value);
        setPage(1);
    };

    const columns = useMemo(() => [
        { Header: 'N° Nota Débito', accessor: 'debit_note_number' },
        { Header: 'Factura Afectada', accessor: 'purchase_invoice_number' },
        { Header: 'Proveedor', accessor: 'supplier_name' },
        { Header: 'Fecha', accessor: 'date', Cell: ({ value }) => formatDateTime(value) },
        { Header: 'Motivo', accessor: 'reason', Cell: ({ value }) => getDebitNoteReasonText(value) },
        { Header: 'Total', accessor: 'total_amount', Cell: ({ value }) => formatCurrency(value) },
        {
            Header: 'Estado',
            accessor: 'status',
            Cell: ({ value }) => <Badge variant={getDebitNoteStatusVariant(value)}>{value}</Badge>,
        },
        {
            Header: 'Acciones',
            id: 'actions',
            Cell: ({ row }) => (
                <Button onClick={() => handleViewReceipt(row.original)} variant="secondary" size="sm">
                    Ver Recibo
                </Button>
            ),
        },
    ], []);

    const receiptDetails = selectedNote ? {
        title: "Nota de Débito",
        number: selectedNote.debit_note_number,
        date: selectedNote.date,
        items: selectedNote.items.map(item => ({
            description: `${item.product_name || item.product_sku}`,
            quantity: item.quantity,
            price: item.unit_cost,
            total: item.quantity * item.unit_cost,
        })),
        total: selectedNote.total_amount,
        customer: { // In this context, 'customer' is the supplier
            name: selectedNote.supplier_name || 'N/A',
            ruc: `Factura Compra: ${selectedNote.purchase_invoice_number}`,
        },
        notes: `Motivo: ${getDebitNoteReasonText(selectedNote.reason)}. ${selectedNote.notes || ''}`
    } : null;

    return (
        <div className="container mx-auto p-4">
            <h1 className="text-2xl font-bold mb-4">Notas de Débito (Compras)</h1>

            <div className="mb-4">
                <Input
                    type="text"
                    placeholder="Buscar por N° de nota, factura, proveedor..."
                    value={searchTerm}
                    onChange={handleSearchChange}
                    className="max-w-xs"
                />
            </div>

            {loading && <Loading />}
            {error && <Alert variant="error">{error}</Alert>}

            {!loading && !error && (
                <Table
                    columns={columns}
                    data={notes}
                    pagination={{
                        currentPage: page,
                        totalPages,
                        onPageChange: setPage,
                    }}
                />
            )}

            {isReceiptVisible && selectedNote && (
                <Modal
                    isOpen={isReceiptVisible}
                    onClose={() => setIsReceiptVisible(false)}
                    title={`Recibo: ${selectedNote.debit_note_number}`}
                    size="lg"
                >
                    <Receipt {...receiptDetails} />
                    <div className="text-right mt-4">
                        <Button onClick={() => window.print()} variant="primary">Imprimir</Button>
                    </div>
                </Modal>
            )}
        </div>
    );
};

export default DebitNotes;
