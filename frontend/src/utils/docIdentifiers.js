// Utility to generate standardized document identifiers
// Mapping can be adjusted if you prefer other prefixes
const DEFAULT_PREFIXES = {
  sale_order: 'OV',    // Orden de Venta (Proforma)
  purchase_order: 'OC',// Orden de Compra
  sale_invoice: 'FV',  // Factura de Venta
  purchase_invoice: 'FC' // Factura de Compra
};

function padNumber(num, width = 4) {
  const n = Number(num) || 0;
  return String(n).padStart(width, '0');
}

/**
 * Generate a standardized code: PREFIX_0001
 * kind: 'sale'|'purchase'
 * role: 'order'|'invoice'
 * rawNumber: numeric or already-formatted string
 */
export function generateDocumentCode(kind, role, rawNumber) {
  if (!rawNumber) return '';

  // If rawNumber already contains letters/prefix, assume formatted
  if (typeof rawNumber === 'string' && /[A-Za-z]/.test(rawNumber)) return rawNumber;

  const key = `${kind}_${role}`;
  const prefix = DEFAULT_PREFIXES[key] || 'DOC';
  const seq = padNumber(rawNumber);
  return `${prefix}_${seq}`;
}

export default generateDocumentCode;
