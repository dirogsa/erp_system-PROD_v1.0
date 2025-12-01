// Utilitario para exportar un elemento DOM a PDF usando html2pdf.js
// Intentará usar la librería instalada; si no está, cargará desde CDN.

export async function exportElementToPdf(element, filename = 'document.pdf', options = {}) {
    if (!element) throw new Error('Element is required');

    const defaultOpt = {
        margin: [6, 6, 6, 6],
        filename,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true },
        jsPDF: { unit: 'mm', format: 'a5', orientation: 'portrait' }
    };

    const opt = { ...defaultOpt, ...options };

    // Improve page break handling to prefer CSS rules and avoid splitting small blocks
    if (!opt.pagebreak) {
        opt.pagebreak = { mode: ['css', 'legacy'] };
    }

    // If html2pdf is available globally (CDN loaded) use it
    if (typeof window !== 'undefined' && window.html2pdf) {
        return window.html2pdf().set(opt).from(element).save();
    }

    // Try dynamic import (if package installed)
    try {
        const mod = await import('html2pdf.js');
        const html2pdf = mod.default || mod;
        return html2pdf().set(opt).from(element).save();
    } catch (err) {
        // Fallback: load from CDN
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
            return window.html2pdf().set(opt).from(element).save();
        }

        throw new Error('html2pdf could not be loaded');
    }
}

export default exportElementToPdf;
