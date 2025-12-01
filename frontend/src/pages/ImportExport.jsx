import React, { useState } from 'react';
import Layout from '../components/Layout';
import { inventoryService } from '../services/api';
import { useNotification } from '../hooks/useNotification';

const ImportExport = () => {
    const { showNotification } = useNotification();
    const [importResult, setImportResult] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [exportType, setExportType] = useState('current'); // 'current' or 'empty'

    const handleImport = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setIsLoading(true);
        setImportResult(null);

        try {
            const response = await inventoryService.importProducts(file);
            setImportResult({ success: true, data: response.data });
        } catch (error) {
            setImportResult({
                success: false,
                error: error.response?.data?.detail || error.message
            });
        } finally {
            setIsLoading(false);
            e.target.value = ''; // Reset file input
        }
    };

    const handleExport = async () => {
        try {
            const response = await inventoryService.exportProducts(exportType);

            // Create download link
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const a = document.createElement('a');
            a.href = url;
            a.download = exportType === 'empty' ? 'plantilla_productos.csv' : 'productos.csv';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);
        } catch (error) {
            showNotification(`Error al exportar: ${error.message}`, 'error');
        }
    };

    return (
        <Layout>
            <h2 style={{ marginBottom: '1.5rem' }}>Importar / Exportar Datos</h2>

            <div className="card" style={{ marginBottom: '2rem' }}>
                <h3>📦 Gestión Masiva de Inventario</h3>

                <div style={{ display: 'grid', gap: '2rem', marginTop: '1.5rem', gridTemplateColumns: '1fr 1fr' }}>
                    {/* Sección Exportar */}
                    <div style={{ padding: '1.5rem', background: '#f0fdf4', borderRadius: '0.5rem', border: '1px solid #bbf7d0' }}>
                        <h4 style={{ color: '#15803d', marginTop: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            📤 Exportar Productos
                        </h4>

                        <div style={{ margin: '1rem 0' }}>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', cursor: 'pointer' }}>
                                <input
                                    type="radio"
                                    name="exportType"
                                    value="current"
                                    checked={exportType === 'current'}
                                    onChange={(e) => setExportType(e.target.value)}
                                />
                                <div>
                                    <strong>Productos Actuales (Para Actualizar)</strong>
                                    <div style={{ fontSize: '0.85rem', color: '#64748b' }}>Descarga todo el inventario con operación UPDATE.</div>
                                </div>
                            </label>

                            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                                <input
                                    type="radio"
                                    name="exportType"
                                    value="empty"
                                    checked={exportType === 'empty'}
                                    onChange={(e) => setExportType(e.target.value)}
                                />
                                <div>
                                    <strong>Plantilla Vacía (Para Nuevos)</strong>
                                    <div style={{ fontSize: '0.85rem', color: '#64748b' }}>Plantilla limpia con ejemplos de INSERT.</div>
                                </div>
                            </label>
                        </div>

                        <button onClick={handleExport} className="btn" style={{ backgroundColor: '#15803d', width: '100%' }}>
                            Descargar CSV
                        </button>
                    </div>

                    {/* Sección Importar */}
                    <div style={{ padding: '1.5rem', background: '#eff6ff', borderRadius: '0.5rem', border: '1px solid #bfdbfe' }}>
                        <h4 style={{ color: '#1d4ed8', marginTop: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            📥 Importar Productos
                        </h4>
                        <p style={{ fontSize: '0.9rem', color: '#64748b' }}>
                            Sube tu archivo CSV con operaciones INSERT, UPDATE o DELETE.
                        </p>

                        <div style={{ marginTop: '1.5rem' }}>
                            <input
                                type="file"
                                accept=".csv"
                                onChange={handleImport}
                                disabled={isLoading}
                                style={{ width: '100%' }}
                            />
                            {isLoading && <div style={{ marginTop: '0.5rem', color: '#2563eb' }}>Procesando archivo...</div>}
                        </div>
                    </div>
                </div>

                {/* Resultados de Importación */}
                {importResult && (
                    <div style={{ marginTop: '2rem', padding: '1.5rem', borderRadius: '0.5rem', border: '1px solid', borderColor: importResult.success ? '#bbf7d0' : '#fecaca', background: importResult.success ? '#f0fdf4' : '#fef2f2' }}>
                        <h4 style={{ marginTop: 0, color: importResult.success ? '#15803d' : '#991b1b' }}>
                            {importResult.success ? 'Resultado de la Importación' : 'Error en la Importación'}
                        </h4>

                        {importResult.success ? (
                            <div>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginBottom: '1rem', textAlign: 'center' }}>
                                    <div style={{ background: 'white', padding: '0.5rem', borderRadius: '0.25rem', border: '1px solid #bbf7d0' }}>
                                        <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#15803d' }}>{importResult.data.summary.inserted}</div>
                                        <div style={{ fontSize: '0.8rem', color: '#64748b' }}>Insertados</div>
                                    </div>
                                    <div style={{ background: 'white', padding: '0.5rem', borderRadius: '0.25rem', border: '1px solid #bfdbfe' }}>
                                        <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#1d4ed8' }}>{importResult.data.summary.updated}</div>
                                        <div style={{ fontSize: '0.8rem', color: '#64748b' }}>Actualizados</div>
                                    </div>
                                    <div style={{ background: 'white', padding: '0.5rem', borderRadius: '0.25rem', border: '1px solid #fecaca' }}>
                                        <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#991b1b' }}>{importResult.data.summary.deleted}</div>
                                        <div style={{ fontSize: '0.8rem', color: '#64748b' }}>Eliminados</div>
                                    </div>
                                    <div style={{ background: 'white', padding: '0.5rem', borderRadius: '0.25rem', border: '1px solid #fed7aa' }}>
                                        <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#9a3412' }}>{importResult.data.summary.errors}</div>
                                        <div style={{ fontSize: '0.8rem', color: '#64748b' }}>Errores</div>
                                    </div>
                                </div>

                                {importResult.data.details.errors.length > 0 && (
                                    <div style={{ marginTop: '1rem' }}>
                                        <strong style={{ color: '#991b1b' }}>Detalle de Errores:</strong>
                                        <ul style={{ color: '#ef4444', fontSize: '0.9rem', maxHeight: '200px', overflowY: 'auto' }}>
                                            {importResult.data.details.errors.map((err, idx) => (
                                                <li key={idx}>{err}</li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div style={{ color: '#991b1b' }}>{importResult.error}</div>
                        )}
                    </div>
                )}

                {/* Instrucciones */}
                <div style={{ marginTop: '2rem', padding: '1.5rem', background: '#f8fafc', borderRadius: '0.5rem', border: '1px dashed #94a3b8' }}>
                    <h4 style={{ color: '#475569', marginTop: 0 }}>ℹ️ Guía de Formato CSV</h4>
                    <p style={{ fontSize: '0.9rem', color: '#64748b' }}>
                        El archivo debe contener obligatoriamente las columnas <code>operation</code> y <code>sku</code>.
                    </p>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem', marginTop: '1rem' }}>
                        <div>
                            <strong style={{ color: '#15803d' }}>INSERT</strong>
                            <p style={{ fontSize: '0.85rem', color: '#64748b' }}>
                                Crea nuevos productos. Requiere <code>sku</code>, <code>name</code>, <code>price</code>, <code>cost</code>.
                            </p>
                        </div>
                        <div>
                            <strong style={{ color: '#1d4ed8' }}>UPDATE</strong>
                            <p style={{ fontSize: '0.85rem', color: '#64748b' }}>
                                Actualiza productos existentes. Solo modifica los campos que no estén vacíos.
                            </p>
                        </div>
                        <div>
                            <strong style={{ color: '#991b1b' }}>DELETE</strong>
                            <p style={{ fontSize: '0.85rem', color: '#64748b' }}>
                                Elimina productos. Solo requiere <code>operation</code> y <code>sku</code>.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </Layout>
    );
};

export default ImportExport;
