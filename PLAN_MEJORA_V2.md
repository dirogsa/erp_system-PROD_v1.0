# Plan de Mejora: ERP System v2.0

## 📊 Análisis del Sistema Actual

### Problemas Identificados

#### 1. **Archivos Extensos y Monolíticos**
- `Sales.jsx`: 706 líneas - Maneja órdenes, facturas, pagos y despachos
- `Purchasing.jsx`: 580 líneas - Maneja órdenes, facturas, pagos y recepciones
- `Inventory.jsx`: ~1000 líneas (estimado) - Múltiples funcionalidades
- **Problema**: Difícil mantenimiento, testing complicado, violación del principio de responsabilidad única

#### 2. **Duplicación de Código**
- Lógica de modales repetida en Sales y Purchasing
- Formularios similares para órdenes/facturas
- Gestión de estado duplicada
- **Problema**: Cambios requieren modificar múltiples archivos, inconsistencias

#### 3. **Falta de Separación de Responsabilidades**
- Lógica de negocio mezclada con UI
- Validaciones en componentes
- Llamadas API directas en componentes
- **Problema**: Difícil testing, acoplamiento alto

#### 4. **Gestión de Estado Primitiva**
- useState para todo
- No hay caché de datos
- Recargas innecesarias
- **Problema**: Performance pobre, UX inconsistente

#### 5. **Sin Manejo de Errores Robusto**
- Alerts simples
- No hay feedback visual consistente
- Errores de red no manejados
- **Problema**: Mala experiencia de usuario

---

## 🎯 Plan de Mejora v2.0

### Fase 1: Refactorización del Frontend

#### 1.1 Arquitectura de Componentes

**Crear estructura modular:**

```
frontend/src/
├── components/
│   ├── common/              # Componentes reutilizables
│   │   ├── Button/
│   │   ├── Input/
│   │   ├── Select/
│   │   ├── Table/
│   │   ├── Modal/
│   │   ├── Card/
│   │   ├── Badge/
│   │   ├── Alert/
│   │   └── Loading/
│   ├── forms/               # Formularios reutilizables
│   │   ├── OrderForm/
│   │   ├── InvoiceForm/
│   │   ├── PaymentForm/
│   │   └── ProductSelector/
│   └── features/            # Componentes por feature
│       ├── sales/
│       │   ├── OrderList/
│       │   ├── OrderDetail/
│       │   ├── InvoiceList/
│       │   └── DispatchModal/
│       ├── purchasing/
│       │   ├── PurchaseOrderList/
│       │   ├── ReceptionModal/
│       │   └── SupplierSelector/
│       └── inventory/
│           ├── ProductList/
│           ├── StockMovements/
│           └── WarehouseSelector/
├── hooks/                   # Custom hooks
│   ├── useOrders.js
│   ├── useInvoices.js
│   ├── useProducts.js
│   ├── useCustomers.js
│   ├── useForm.js
│   └── useApi.js
├── context/                 # Context API
│   ├── AuthContext.js
│   ├── NotificationContext.js
│   └── ThemeContext.js
├── services/                # Servicios
│   ├── api/
│   │   ├── client.js       # Axios configurado
│   │   ├── sales.js
│   │   ├── purchasing.js
│   │   └── inventory.js
│   └── validation/
│       ├── orderValidation.js
│       └── invoiceValidation.js
├── utils/                   # Utilidades
│   ├── formatters.js       # Formateo de fechas, moneda
│   ├── validators.js
│   └── constants.js
└── pages/                   # Solo orquestación
    ├── Sales.jsx           # ~100 líneas
    ├── Purchasing.jsx      # ~100 líneas
    └── Inventory.jsx       # ~100 líneas
```

**Beneficios:**
- Componentes de 50-150 líneas (fácil de entender)
- Reutilización de código
- Testing unitario simple
- Mantenimiento sencillo

---

#### 1.2 Custom Hooks para Lógica de Negocio

**Ejemplo: `useOrders.js`**
```javascript
export const useOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const data = await salesService.getSales();
      setOrders(data);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  const createOrder = async (orderData) => {
    // Lógica de creación
  };

  return { orders, loading, error, fetchOrders, createOrder };
};
```

**Archivos a crear:**
- `hooks/useSalesOrders.js`
- `hooks/usePurchaseOrders.js`
- `hooks/useInvoices.js`
- `hooks/useProducts.js`
- `hooks/useCustomers.js`
- `hooks/useSuppliers.js`

**Beneficios:**
- Lógica separada de UI
- Reutilizable entre componentes
- Fácil testing
- Estado compartido

---

#### 1.3 Sistema de Notificaciones

**Crear `NotificationContext.js`:**
```javascript
const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);

  const addNotification = (message, type = 'info') => {
    const id = Date.now();
    setNotifications(prev => [...prev, { id, message, type }]);
    setTimeout(() => removeNotification(id), 5000);
  };

  return (
    <NotificationContext.Provider value={{ addNotification }}>
      {children}
      <NotificationContainer notifications={notifications} />
    </NotificationContext.Provider>
  );
};
```

**Reemplazar:**
- Todos los `alert()` por notificaciones toast
- Mensajes de éxito/error consistentes
- Feedback visual mejorado

---

#### 1.4 Formularios Reutilizables

**Crear componentes de formulario:**

```
components/forms/
├── OrderForm/
│   ├── index.jsx           # Formulario principal
│   ├── CustomerSelector.jsx
│   ├── ProductSelector.jsx
│   └── OrderSummary.jsx
├── InvoiceForm/
│   ├── index.jsx
│   ├── InvoiceDetails.jsx
│   └── PaymentSection.jsx
└── PaymentForm/
    └── index.jsx
```

**Beneficios:**
- Validación centralizada
- Estilos consistentes
- Fácil de testear
- Reutilizable en Sales y Purchasing

---

### Fase 2: Mejoras en el Backend

#### 2.1 Servicios de Negocio

**Crear capa de servicios:**

```
backend/app/
├── services/
│   ├── sales_service.py       # Lógica de ventas
│   ├── purchasing_service.py  # Lógica de compras
│   ├── inventory_service.py   # Ya existe, mejorar
│   ├── payment_service.py     # Lógica de pagos
│   └── guide_service.py       # Guías de remisión/recepción
```

**Mover lógica de routes a services:**
- Routes solo validan y llaman servicios
- Services contienen lógica de negocio
- Fácil testing unitario

**Ejemplo:**
```python
# routes/sales.py (simplificado)
@router.post("/orders")
async def create_order(order: SalesOrder):
    return await sales_service.create_sales_order(order)

# services/sales_service.py
async def create_sales_order(order: SalesOrder):
    # Validaciones
    # Lógica de negocio
    # Generación de número
    # Guardado
    return order
```

---

#### 2.2 Validaciones Centralizadas

**Crear `validators/`:**
```python
# validators/sales_validators.py
class OrderValidator:
    @staticmethod
    def validate_order(order: SalesOrder):
        if not order.items:
            raise ValueError("Order must have items")
        if not order.delivery_address:
            raise ValueError("Delivery address required")
        # Más validaciones...
```

---

#### 2.3 DTOs (Data Transfer Objects)

**Separar modelos de DB de DTOs:**
```python
# schemas/sales_schemas.py
class OrderCreateDTO(BaseModel):
    customer_ruc: str
    delivery_address: str
    items: List[OrderItemDTO]

class OrderResponseDTO(BaseModel):
    order_number: str
    customer_name: str
    total_amount: float
    # Solo campos necesarios para frontend
```

**Beneficios:**
- Control sobre qué datos se exponen
- Validación de entrada
- Documentación automática (OpenAPI)

---

#### 2.4 Manejo de Errores Mejorado

**Crear excepciones personalizadas:**
```python
# exceptions/business_exceptions.py
class BusinessException(Exception):
    def __init__(self, message: str, code: str):
        self.message = message
        self.code = code

class InsufficientStockException(BusinessException):
    def __init__(self, product_sku: str, available: int, required: int):
        super().__init__(
            f"Stock insuficiente para {product_sku}",
            "INSUFFICIENT_STOCK"
        )
        self.details = {
            "product_sku": product_sku,
            "available": available,
            "required": required
        }
```

**Handler global:**
```python
@app.exception_handler(BusinessException)
async def business_exception_handler(request, exc):
    return JSONResponse(
        status_code=400,
        content={
            "error": exc.code,
            "message": exc.message,
            "details": exc.details
        }
    )
```

---

### Fase 3: Optimizaciones

#### 3.1 Caché y Performance

**Backend:**
```python
from functools import lru_cache

@lru_cache(maxsize=100)
async def get_product_by_sku(sku: str):
    # Caché de productos
    pass
```

**Frontend:**
```javascript
// React Query para caché
import { useQuery } from 'react-query';

const useProducts = () => {
  return useQuery('products', fetchProducts, {
    staleTime: 5 * 60 * 1000, // 5 minutos
    cacheTime: 10 * 60 * 1000
  });
};
```

---

#### 3.2 Paginación

**Backend:**
```python
@router.get("/orders")
async def get_orders(
    skip: int = 0,
    limit: int = 50,
    status: Optional[str] = None
):
    query = {}
    if status:
        query["status"] = status
    
    orders = await SalesOrder.find(query).skip(skip).limit(limit).to_list()
    total = await SalesOrder.find(query).count()
    
    return {
        "items": orders,
        "total": total,
        "page": skip // limit + 1,
        "pages": (total + limit - 1) // limit
    }
```

**Frontend:**
```javascript
const OrderList = () => {
  const [page, setPage] = useState(1);
  const { data } = useOrders({ page, limit: 20 });
  
  return (
    <>
      <Table data={data.items} />
      <Pagination 
        current={data.page}
        total={data.pages}
        onChange={setPage}
      />
    </>
  );
};
```

---

#### 3.3 Búsqueda y Filtros

**Backend:**
```python
@router.get("/orders/search")
async def search_orders(
    q: str = "",
    status: Optional[str] = None,
    date_from: Optional[date] = None,
    date_to: Optional[date] = None
):
    query = {}
    
    if q:
        query["$or"] = [
            {"order_number": {"$regex": q, "$options": "i"}},
            {"customer_name": {"$regex": q, "$options": "i"}}
        ]
    
    if status:
        query["status"] = status
    
    if date_from:
        query["date"] = {"$gte": date_from}
    
    return await SalesOrder.find(query).to_list()
```

---

### Fase 4: Nuevas Funcionalidades

#### 4.1 Sistema de Autenticación

**Implementar:**
- Login/Logout
- Roles (Admin, Vendedor, Almacenero)
- Permisos por módulo
- JWT tokens

**Archivos a crear:**
```
backend/app/
├── auth/
│   ├── models.py          # User, Role
│   ├── routes.py          # Login, logout
│   ├── dependencies.py    # get_current_user
│   └── security.py        # Hash, JWT
```

---

#### 4.2 Reportes y Dashboards

**Crear endpoints de reportes:**
```python
@router.get("/reports/sales-summary")
async def sales_summary(
    date_from: date,
    date_to: date
):
    return {
        "total_sales": ...,
        "total_invoices": ...,
        "pending_payments": ...,
        "top_products": ...,
        "sales_by_day": ...
    }
```

**Frontend:**
- Dashboard con gráficas (Chart.js / Recharts)
- Reportes exportables (PDF, Excel)

---

#### 4.3 Auditoría

**Crear tabla de auditoría:**
```python
class AuditLog(Document):
    user: str
    action: str  # CREATE, UPDATE, DELETE
    entity_type: str  # Order, Invoice, Product
    entity_id: str
    changes: dict
    timestamp: datetime
    ip_address: str
```

**Middleware para logging automático**

---

#### 4.4 Notificaciones

**Implementar:**
- Notificaciones de stock bajo
- Alertas de pagos pendientes
- Recordatorios de facturas vencidas

---

## 📈 Estimación de Esfuerzo

### Fase 1: Refactorización Frontend
- **Tiempo:** 40-60 horas
- **Prioridad:** Alta
- **Impacto:** Alto

### Fase 2: Mejoras Backend
- **Tiempo:** 30-40 horas
- **Prioridad:** Alta
- **Impacto:** Medio-Alto

### Fase 3: Optimizaciones
- **Tiempo:** 20-30 horas
- **Prioridad:** Media
- **Impacto:** Medio

### Fase 4: Nuevas Funcionalidades
- **Tiempo:** 50-70 horas
- **Prioridad:** Media
- **Impacto:** Alto

**Total v2.0: 140-200 horas (4-5 semanas a tiempo completo)**

> **Nota:** Testing (Fase 5) y DevOps (Fase 6) se implementarán en versiones futuras (v3.0 o v4.0)

---

## 🎯 Roadmap Recomendado

### Sprint 1 (2 semanas) - Fase 1
- ✅ Refactorizar Sales.jsx en componentes pequeños
- ✅ Crear custom hooks básicos
- ✅ Implementar NotificationContext
- ✅ Crear componentes comunes reutilizables

### Sprint 2 (2 semanas) - Fase 1 & 2
- ✅ Refactorizar Purchasing.jsx
- ✅ Refactorizar Inventory.jsx
- ✅ Crear servicios de backend
- ✅ Implementar validaciones centralizadas

### Sprint 3 (1 semana) - Fase 2 & 3
- ✅ Crear DTOs
- ✅ Implementar paginación
- ✅ Agregar búsqueda y filtros

### Sprint 4 (2 semanas) - Fase 4
- ✅ Sistema de autenticación
- ✅ Roles y permisos
- ✅ Reportes básicos

---

## 📊 Métricas de Éxito

### Antes (v1.0)
- Archivos: 500-1000 líneas
- Duplicación: ~40%
- Tiempo de carga: 2-3s
- Bugs reportados: Alto

### Después (v2.0)
- Archivos: 50-150 líneas
- Duplicación: <10%
- Tiempo de carga: <1s
- Bugs reportados: Bajo
- Mantenibilidad: Alta
- Escalabilidad: Alta

---

## 🚀 Beneficios Esperados

1. **Mantenibilidad**: Código más fácil de entender y modificar
2. **Escalabilidad**: Fácil agregar nuevas funcionalidades
3. **Performance**: Mejor experiencia de usuario
4. **Calidad**: Menos bugs, más confiable
5. **Productividad**: Desarrollo más rápido
6. **Documentación**: Auto-generada (OpenAPI)

---

## 📝 Notas Finales

Este plan es **incremental** - puedes implementar fase por fase sin romper el sistema actual. Cada fase aporta valor inmediato y prepara el terreno para las siguientes.

**Recomendación:** Comenzar con Fase 1 (Frontend) ya que tiene el mayor impacto en mantenibilidad y es donde está el código más complejo actualmente.

**Versiones futuras:** Testing completo (Fase 5) y DevOps/Deployment (Fase 6) se implementarán en v3.0 o v4.0 una vez que el código base esté refactorizado y estable.

