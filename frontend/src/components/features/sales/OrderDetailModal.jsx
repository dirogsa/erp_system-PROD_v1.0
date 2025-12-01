import React, { useState, useRef } from 'react';
import OrderForm from '../../forms/OrderForm';
import Receipt from '../../common/Receipt';
import { COMPANY_INFO } from '../../../utils/constants';

const OrderDetailModal = ({
    order,
    onClose,
    visible
}) => {
    if (!visible || !order) return null;

    const [showReceipt, setShowReceipt] = useState(true);
    const receiptRef = useRef();
    const [printNotes, setPrintNotes] = useState(order.notes || '');

    const handleExportPdf = async () => {
        if (!receiptRef.current) return;
        const element = receiptRef.current;
        const opt = {
            margin:       [6, 6, 6, 6], // mm
            filename:     `recibo_${order.order_number || 'order'}.pdf`,
            image:        { type: 'jpeg', quality: 0.98 },
            html2canvas:  { scale: 2 },
            jsPDF:        { unit: 'mm', format: 'a5', orientation: 'portrait' }
        };
        try {
            // If html2pdf is already available on window (e.g., loaded from CDN), use it
            if (typeof window !== 'undefined' && window.html2pdf) {
                await window.html2pdf().set(opt).from(element).save();
                return;
            }

            // Otherwise, dynamically inject the html2pdf bundle from CDN
            await new Promise((resolve, reject) => {
                const existing = document.querySelector('script[data-html2pdf]');
                if (existing) {
                    existing.addEventListener('load', () => resolve());
                    existing.addEventListener('error', () => reject(new Error('Failed to load html2pdf')));
                    return;
                }

                const script = document.createElement('script');
                script.setAttribute('data-html2pdf', '1');
                script.src = 'https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js';
                script.async = true;
                script.onload = () => resolve();
                script.onerror = () => reject(new Error('Failed to load html2pdf from CDN'));
                document.head.appendChild(script);
            });

            if (window.html2pdf) {
                await window.html2pdf().set(opt).from(element).save();
            } else {
                // eslint-disable-next-line no-alert
                alert('No se pudo cargar la librería de generación de PDF. Intenta ejecutar `npm install` o revisa la conexión a Internet.');
            }
        } catch (err) {
            console.error('Error exporting PDF', err);
            // eslint-disable-next-line no-alert
            alert('Error al generar el PDF. Revisa la consola para más detalles.');
        }
    };

    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.7)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 1000,
            padding: '2rem'
        }}>
            <div style={{
                backgroundColor: '#0f172a',
                borderRadius: '0.5rem',
                width: '100%',
                maxWidth: '900px',
                maxHeight: '90vh',
                overflowY: 'auto',
                position: 'relative',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
            }}>
                <div style={{
                    padding: '1.5rem',
                    borderBottom: '1px solid #334155',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    position: 'sticky',
                    top: 0,
                    backgroundColor: '#0f172a',
                    zIndex: 10
                }}>
                    <h2 style={{ color: 'white', margin: 0 }}>
                        Orden {order.order_number}
                    </h2>
                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                        <button
                            onClick={() => setShowReceipt(prev => !prev)}
                            style={{
                                background: 'none',
                                border: '1px solid #334155',
                                color: '#e2e8f0',
                                padding: '0.35rem 0.6rem',
                                borderRadius: '0.25rem',
                                cursor: 'pointer'
                            }}
                        >
                            {showReceipt ? 'Ocultar Recibo' : 'Ver Recibo'}
                        </button>
                        {showReceipt && (
                            <button
                                onClick={handleExportPdf}
                                style={{
                                    background: '#3b82f6',
                                    border: 'none',
                                    color: 'white',
                                    padding: '0.35rem 0.6rem',
                                    borderRadius: '0.25rem',
                                    cursor: 'pointer'
                                }}
                            >
                                Exportar PDF
                            </button>
                        )}
                        <button
                            onClick={onClose}
                            style={{
                                background: 'none',
                                border: 'none',
                                color: '#94a3b8',
                                fontSize: '1.5rem',
                                cursor: 'pointer'
                            }}
                        >
                            ×
                        </button>
                    </div>
                </div>

                <div style={{ padding: '1.5rem' }}>
                    {showReceipt ? (
                        <div style={{ display: 'flex', justifyContent: 'center' }}>
                            <div style={{ background: 'white', padding: '8mm' }}>
                                <div>
                                    <div style={{ marginBottom: '6px' }}>
                                        <label style={{ color: '#cbd5e1', fontSize: '0.9rem' }}>Notas imprimibles (opcional)</label>
                                        <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
                                            <textarea value={printNotes} onChange={(e) => setPrintNotes(e.target.value)} rows={2} style={{ flex: 1, resize: 'vertical' }} />
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        const b = COMPANY_INFO && COMPANY_INFO.BANK_ACCOUNT;
                                                        if (!b) {
                                                            // eslint-disable-next-line no-alert
                                                            alert('No hay datos bancarios configurados en COMPANY_INFO.');
                                                            return;
                                                        }
                                                        const bankText = `Cuenta para depósito: ${b.bank} - ${b.number} (${b.currency}) Titular: ${b.holder}`;
                                                        setPrintNotes(prev => prev ? prev + '\n' + bankText : bankText);
                                                    }}
                                                    style={{ padding: '6px 8px', fontSize: '0.9rem', cursor: 'pointer', background: '#e2e8f0', border: '1px solid #cbd5e1' }}
                                                >
                                                    Insertar datos bancarios
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                    <Receipt ref={receiptRef} order={order} docType="Proforma" docKind="sale" docRole="order" extraNotes={printNotes} />
                                </div>
                            </div>
                        </div>
                    ) : (
                        <OrderForm
                            initialData={order}
                            readOnly={true}
                            onCancel={onClose}
                        />
                    )}
                </div>
            </div>
        </div>
    );
};

export default OrderDetailModal;
