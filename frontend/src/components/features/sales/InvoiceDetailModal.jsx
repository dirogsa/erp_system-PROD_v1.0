import React, { useState, useEffect } from 'react';
import Modal from '../../Modal';
import Button from '../../common/Button';
import Alert from '../../common/Alert';
import Loading from '../../common/Loading';
import Badge from '../../common/Badge';
import CreditNoteForm from './CreditNoteForm';
import { createCreditNote } from '../../../services/api'; // Corrected import
import { formatCurrency, formatDateTime, getPaymentStatusVariant } from '../../../utils/formatters';
import { getCreditNoteReasonText } from '../../../utils/constants';

const InvoiceDetailModal = ({ invoice, visible, onClose, onUpdate }) => {
    const [isCreditNoteModalOpen, setCreditNoteModalOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState(null);
    const [creditNotes, setCreditNotes] = useState([]);

    useEffect(() => {
        if (invoice?.credit_note_ids?.length > 0) {
        }
    }, [invoice]);

    const handleCreateCreditNote = async (data) => {
        setIsSubmitting(true);
        setSubmitError(null);
        try {
            await createCreditNote(invoice.id, data); // Corrected API call
            setCreditNoteModalOpen(false);
            onUpdate(); 
        } catch (error) {
            setSubmitError(error.response?.data?.detail || 'Error al crear la nota de crédito.');
        } finally {
            setIsSubmitting(false);
        }
    };
    
    if (!visible || !invoice) return null;

    const pendingAmount = invoice.total_amount - (invoice.amount_paid || 0) - (invoice.credit_applied || 0);

    return (
        <>
            <Modal isOpen={visible} onClose={onClose} title={`Factura: ${invoice.invoice_number}`} size="3xl">
                <div className="grid grid-cols-3 gap-4 mb-4 p-4 bg-gray-800 rounded-lg">
                    <div>
                        <p className="text-sm text-gray-400">Estado de Pago</p>
                        <Badge variant={getPaymentStatusVariant(invoice.payment_status)}>{invoice.payment_status}</Badge>
                    </div>
                    <div>
                        <p className="text-sm text-gray-400">Cliente</p>
                        <p>{invoice.customer_name || 'N/A'}</p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-400">Fecha Emisión</p>
                        <p>{formatDateTime(invoice.invoice_date)}</p>
                    </div>
                </div>

                <div className="mb-4">
                    <h3 className="font-bold mb-2">Detalle de Factura</h3>
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-gray-700">
                                <th className="text-left p-2">Producto</th>
                                <th className="text-center p-2">Cantidad</th>
                                <th className="text-right p-2">P. Unit.</th>
                                <th className="text-right p-2">Subtotal</th>
                            </tr>
                        </thead>
                        <tbody>
                            {invoice.items.map((item, index) => (
                                <tr key={index} className="border-b border-gray-800">
                                    <td className="p-2">{item.product_sku}</td>
                                    <td className="text-center p-2">{item.quantity}</td>
                                    <td className="text-right p-2">{formatCurrency(item.unit_price)}</td>
                                    <td className="text-right p-2">{formatCurrency(item.quantity * item.unit_price)}</td>
                                </tr>
                            ))}
                        </tbody>
                        <tfoot className="font-bold">
                            <tr>
                                <td colSpan="3" className="text-right p-2">Total Factura:</td>
                                <td className="text-right p-2">{formatCurrency(invoice.total_amount)}</td>
                            </tr>
                            <tr>
                                <td colSpan="3" className="text-right p-2 text-yellow-400">Monto con NC (Crédito):</td>
                                <td className="text-right p-2 text-yellow-400">-{formatCurrency(invoice.credit_applied || 0)}</td>
                            </tr>
                            <tr>
                                <td colSpan="3" className="text-right p-2 text-green-400">Monto Pagado:</td>
                                <td className="text-right p-2 text-green-400">-{formatCurrency(invoice.amount_paid || 0)}</td>
                            </tr>
                            <tr className="text-lg">
                                <td colSpan="3" className="text-right p-2">Saldo Pendiente:</td>
                                <td className="text-right p-2 text-red-400">{formatCurrency(pendingAmount)}</td>
                            </tr>
                        </tfoot>
                    </table>
                </div>

                {invoice.credit_note_ids && invoice.credit_note_ids.length > 0 && (
                     <div className="mb-4">
                        <h3 className="font-bold mb-2">Notas de Crédito Aplicadas</h3>
                        <div className="bg-gray-800 p-3 rounded-lg">
                            <ul className="list-disc pl-5">
                                {invoice.credit_note_ids.map(cn_id => (
                                    <li key={cn_id} className="text-sm">ID: {cn_id}</li>
                                ))}
                            </ul>
                        </div>
                    </div>
                )}
                
                <div className="flex justify-end gap-2">
                    <Button variant="secondary" onClick={onClose}>Cerrar</Button>
                    <Button variant="primary" onClick={() => setCreditNoteModalOpen(true)}>Crear Nota de Crédito</Button>
                </div>
            </Modal>

            <Modal isOpen={isCreditNoteModalOpen} onClose={() => setCreditNoteModalOpen(false)} title="Crear Nota de Crédito" size="2xl">
                {submitError && <Alert variant="error" className="mb-4">{submitError}</Alert>}
                {isSubmitting ? (
                    <Loading text="Creando nota de crédito..." />
                ) : (
                    <CreditNoteForm 
                        invoice={invoice}
                        onSubmit={handleCreateCreditNote}
                        onCancel={() => setCreditNoteModalOpen(false)}
                    />
                )}
            </Modal>
        </>
    );
};

export default InvoiceDetailModal;