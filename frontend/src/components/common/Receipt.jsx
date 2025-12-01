import React, { forwardRef } from 'react';
import { COMPANY_INFO } from '../../utils/constants';
import generateDocumentCode from '../../utils/docIdentifiers';
import { formatCurrency } from '../../utils/formatters';
import './receipt.css';

// Receipt component designed for A5 portrait printing
const Receipt = forwardRef(({ order, docType, docKind, docRole, extraNotes }, ref) => {
    if (!order) return null;

    const total = (order.items || []).reduce((s, it) => s + (it.subtotal ?? (it.quantity * it.unit_price || 0)), 0);
    const subtotal = +(total / 1.18).toFixed(2);
    const tax = +(total - subtotal).toFixed(2);

    return (
        <div ref={ref} className="receipt">
            <div className="receipt-body">
            {/* Document title (Proforma / Factura) */}
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '6mm' }}>
                <div className="doc-badge">{docType || ''}</div>
            </div>
            <div className="receipt-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    {COMPANY_INFO.LOGO && (
                        <img src={COMPANY_INFO.LOGO} alt="logo" className="logo" />
                    )}
                    <div>
                        <div className="company">{COMPANY_INFO.NAME}</div>
                        <div className="company-sub">RUC: {COMPANY_INFO.RUC}</div>
                        <div className="company-sub">{COMPANY_INFO.ADDRESS}</div>
                    </div>
                </div>

                <div className="meta">
                    <div style={{ fontWeight: 600 }}>
                        Recibo: { (docKind && docRole) ? generateDocumentCode(docKind, docRole, order.order_number) : (order.order_number || '-') }
                    </div>
                    <div className="label">Fecha: {order.date ? new Date(order.date).toLocaleString() : '-'}</div>
                    <div className="label">Cliente: {order.customer_name || '-'}</div>
                </div>
            </div>

            <div className="section">
                <div className="title">Dirección de entrega</div>
                <div>{order.delivery_address || '-'}</div>
            </div>

            <table className="items" style={{ tableLayout: 'fixed' }}>
                <colgroup>
                    <col className="col-product" />
                    <col className="col-qty" />
                    <col className="col-unit" />
                    <col className="col-subtotal" />
                </colgroup>
                <thead>
                    <tr>
                        <th className="col-product">Producto</th>
                        <th className="col-qty">Cant.</th>
                        <th className="col-unit">P.Unit</th>
                        <th className="col-subtotal">Subtotal</th>
                    </tr>
                </thead>
                <tbody>
                    {(order.items || []).map((it, idx) => (
                        <tr key={idx}>
                            <td className="col-product">
                                <div style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>{it.product_name || it.product_sku}</div>
                                {it.product_sku && <div className="muted">{it.product_sku}</div>}
                            </td>
                            <td className="col-qty">{Number(it.quantity ?? 0)}</td>
                            <td className="col-unit">{formatCurrency(Number(it.unit_price ?? it.unit_cost ?? 0))}</td>
                            <td className="col-subtotal">{formatCurrency(Number(it.subtotal ?? ((it.quantity || 0) * (it.unit_price || 0))))}</td>
                        </tr>
                    ))}
                </tbody>
            </table>

            <div className="totals">
                <table style={{ width: '100%', marginTop: '4mm' }}>
                    <tbody>
                        <tr>
                            <td className="label text-right">Subtotal</td>
                            <td className="amount text-right" style={{ width: '40mm' }}>{formatCurrency(subtotal)}</td>
                        </tr>
                        <tr>
                            <td className="label text-right">IGV (18%)</td>
                            <td className="amount text-right" style={{ width: '40mm' }}>{formatCurrency(tax)}</td>
                        </tr>
                        <tr>
                            <td className="label text-right" style={{ fontWeight: 700 }}>Total</td>
                            <td className="amount text-right" style={{ width: '40mm' }}>{formatCurrency(total)}</td>
                        </tr>
                    </tbody>
                </table>
            </div>

            {/* Printable notes: prefer extraNotes (entered at export time), fallback to order.notes */}
            {(extraNotes || order.notes) && (
                <div className="note">
                    <div className="title">Notas imprimibles</div>
                    <div>{extraNotes || order.notes}</div>
                </div>
            )}
            </div>

            <div className="footer">Recibo generado por ERP System</div>
        </div>
    );
});

export default Receipt;
