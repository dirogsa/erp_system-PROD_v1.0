import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const Layout = ({ children }) => {
    const location = useLocation();
    const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);

    const isActive = (path) => location.pathname === path ? 'nav-link active' : 'nav-link';

    return (
        <div className="app-container">
            <button
                className="sidebar-toggle"
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                title={isSidebarOpen ? "Cerrar menú" : "Abrir menú"}
            >
                {isSidebarOpen ? '✕' : '☰'}
            </button>

            <aside className={`sidebar ${isSidebarOpen ? 'open' : ''}`}>
                <h1>ERP System</h1>
                <nav>
                    <Link to="/" className={isActive('/')} onClick={() => setIsSidebarOpen(false)}>Dashboard</Link>
                    <Link to="/inventory" className={isActive('/inventory')} onClick={() => setIsSidebarOpen(false)}>Inventario</Link>
                    <Link to="/suppliers" className={isActive('/suppliers')} onClick={() => setIsSidebarOpen(false)}>Proveedores</Link>
                    <Link to="/purchasing" className={isActive('/purchasing')} onClick={() => setIsSidebarOpen(false)}>Compras</Link>
                    <Link to="/sales" className={isActive('/sales')} onClick={() => setIsSidebarOpen(false)}>Ventas</Link>
                    <Link to="/customers" className={isActive('/customers')} onClick={() => setIsSidebarOpen(false)}>Clientes</Link>

                    <Link to="/import-export" className={isActive('/import-export')} onClick={() => setIsSidebarOpen(false)}>📊 Importar/Exportar</Link>
                    <Link to="/losses" className={isActive('/losses')} onClick={() => setIsSidebarOpen(false)}>⚠️ Mermas</Link>
                    <Link to="/transfers" className={isActive('/transfers')} onClick={() => setIsSidebarOpen(false)}>🚚 Transferencias</Link>
                </nav>
            </aside>

            {/* Overlay to close sidebar on mobile/when open */}
            {isSidebarOpen && (
                <div
                    className="sidebar-overlay"
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}

            <main className="main-content">
                {children}
            </main>
        </div>
    );
};

export default Layout;
