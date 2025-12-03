import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import './Layout.css'; // <-- Import the new CSS file

const NavLink = ({ to, children, onClick, exact = false }) => {
    const location = useLocation();
    const isActive = exact ? location.pathname === to : location.pathname.startsWith(to);
    
    return (
        <Link to={to} className={`nav-link ${isActive ? 'active' : ''}`} onClick={onClick}>
            {children}
        </Link>
    );
};

const MenuGroup = ({ title, to, children }) => {
    const location = useLocation();
    const [isOpen, setIsOpen] = React.useState(location.pathname.startsWith(to));

    React.useEffect(() => {
        if (location.pathname.startsWith(to)) {
            setIsOpen(true);
        }
    }, [location, to]);

    const toggleMenu = () => setIsOpen(!isOpen);

    const isGroupActive = location.pathname.startsWith(to);

    return (
        <div className="nav-group">
            <button onClick={toggleMenu} className={`nav-group-title ${isGroupActive ? 'active' : ''}`}>
                {title}
            </button>
            {isOpen && <div className="nav-submenu">{children}</div>}
        </div>
    );
};

const Layout = ({ children }) => {
    const [isSidebarOpen, setIsSidebarOpen] = React.useState(true);
    const closeSidebar = () => setIsSidebarOpen(false);

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
                    <NavLink to="/" onClick={closeSidebar} exact={true}>Dashboard</NavLink>
                    
                    <MenuGroup title="Inventario" to="/inventory">
                        <NavLink to="/inventory/products" onClick={closeSidebar}>Productos</NavLink>
                        <NavLink to="/inventory/categories" onClick={closeSidebar}>Categorías</NavLink>
                        <NavLink to="/inventory/warehouses" onClick={closeSidebar}>Almacenes</NavLink>
                        <NavLink to="/inventory/transfers" onClick={closeSidebar}>Transferencias</NavLink>
                    </MenuGroup>

                    <MenuGroup title="Compras" to="/purchasing">
                        <NavLink to="/purchasing/orders" onClick={closeSidebar}>Órdenes de Compra</NavLink>
                        <NavLink to="/purchasing/invoices" onClick={closeSidebar}>Facturas</NavLink>
                        <NavLink to="/purchasing/debit-notes" onClick={closeSidebar}>Notas de Débito</NavLink>
                        <NavLink to="/purchasing/suppliers" onClick={closeSidebar}>Proveedores</NavLink>
                    </MenuGroup>
                    
                    <MenuGroup title="Ventas" to="/sales">
                        <NavLink to="/sales/orders" onClick={closeSidebar}>Órdenes de Venta</NavLink>
                        <NavLink to="/sales/invoices" onClick={closeSidebar}>Facturas</NavLink>
                        <NavLink to="/sales/credit-notes" onClick={closeSidebar}>Notas de Crédito</NavLink>
                        <NavLink to="/sales/customers" onClick={closeSidebar}>Clientes</NavLink>
                    </MenuGroup>

                    {/* New Data Management Section */}
                    <MenuGroup title="Gestión de Datos" to="/data">
                        <NavLink to="/data/import-export" onClick={closeSidebar}>Importar/Exportar</NavLink>
                    </MenuGroup>
                </nav>
            </aside>

            {isSidebarOpen && (
                <div
                    className="sidebar-overlay"
                    onClick={closeSidebar}
                />
            )}

            <main className="main-content">
                {children}
            </main>
        </div>
    );
};

export default Layout;
