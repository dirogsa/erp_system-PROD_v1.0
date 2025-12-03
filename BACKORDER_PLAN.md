# Planteamiento para el Manejo de Flujos Flexibles de Compra y Venta

## 1. Introducción

Este documento describe un flujo de trabajo y una implementación técnica para optimizar las operaciones comerciales, separando la fase de **negociación/solicitud** de la fase de **ejecución/logística**. Se basa en el uso de **Cotizaciones** como documentos preliminares que luego se convierten en **Órdenes** firmes.

## 2. El Rol de los Documentos Preliminares: Cotizaciones

Se establece la **Cotización** como el punto de partida para cualquier transacción. Es un documento borrador, flexible y no vinculante.

- **Cotización de Venta (Sales Quote)**: Captura la **intención de compra** de un cliente y sirve como base para el seguimiento de **backorders**.
- **Cotización de Compra (Purchase Quote)**: Formaliza una **solicitud de precios** a un proveedor, sirviendo como borrador de una futura orden de compra.

## 3. Flujos de Trabajo Simétricos

El sistema implementará un flujo paralelo para Ventas y Compras, basado en el principio: **Cotización → Orden → Factura**.

---

## 4. Impacto en Base de Datos y Nomenclatura

La introducción de las cotizaciones requiere modificaciones en la base de datos y la creación de nuevas secuencias de numeración para los documentos.

### A. Nomenclatura de Documentos

Se crearán nuevos prefijos para identificar claramente las cotizaciones, siguiendo el estándar existente. El `services/document_number_service.py` deberá ser actualizado para gestionar estas nuevas secuencias.

- **Cotización de Venta**: Prefijo **`CV-`**. Ejemplo: `CV-00001`, `CV-00002`.
- **Cotización de Compra**: Prefijo **`CC-`**. Ejemplo: `CC-00001`, `CC-00002`.

### B. Cambios en la Base de Datos

#### Módulo de Ventas (`models/sales.py`)

1.  **Nueva Tabla: `cotizaciones_venta`**
    - `id` (PK)
    - `numero_cotizacion` (VARCHAR, Unique): Ej. "CV-00001".
    - `cliente_id` (FK a `clientes`)
    - `fecha_creacion` (TIMESTAMP)
    - `estado` (ENUM: `Borrador`, `Enviada`, `Parcialmente Surtida`, `Completada`, `Cancelada`)
    - `total` (DECIMAL)

2.  **Nueva Tabla: `cotizaciones_venta_items`**
    - `id` (PK)
    - `cotizacion_id` (FK a `cotizaciones_venta`)
    - `producto_sku` (FK a `productos`)
    - `cantidad_solicitada` (DECIMAL)
    - `cantidad_surtida` (DECIMAL, default: 0)
    - `precio_unitario` (DECIMAL)

3.  **Modificación en `ordenes_venta`**
    - Añadir columna `cotizacion_origen_id` (FK a `cotizaciones_venta`, nullable). Esto crea la trazabilidad.

#### Módulo de Compras (`models/purchasing.py`)

1.  **Nueva Tabla: `cotizaciones_compra`**
    - `id` (PK)
    - `numero_cotizacion` (VARCHAR, Unique): Ej. "CC-00001".
    - `proveedor_id` (FK a `proveedores`)
    - `fecha_creacion` (TIMESTAMP)
    - `estado` (ENUM: `Borrador`, `Enviada`, `Confirmada`, `Completada`, `Cancelada`)
    - `total` (DECIMAL)

2.  **Nueva Tabla: `cotizaciones_compra_items`**
    - `id` (PK)
    - `cotizacion_id` (FK a `cotizaciones_compra`)
    - `producto_sku` (FK a `productos`)
    - `cantidad_cotizada` (DECIMAL)
    - `precio_unitario` (DECIMAL)

3.  **Modificación en `ordenes_compra`**
    - Añadir columna `cotizacion_origen_id` (FK a `cotizaciones_compra`, nullable).

---

## 5. Experiencia de Usuario e Interfaz (Frontend)

La nueva funcionalidad se integrará en la navegación y flujos existentes de forma intuitiva.

### A. Menú de Navegación Principal

- **Ventas**: Se añade la sección `Cotizaciones de Venta`.
- **Compras**: Se añade la sección `Cotizaciones de Compra`.

### B. Flujo de Interfaz

- **Páginas de Listado**: `Cotizaciones de Venta` y `Cotizaciones de Compra` mostrarán tablas con los nuevos documentos y un botón `+ Nuevo`.
- **Formularios**: Los formularios de creación/edición de cotizaciones serán flexibles y no validarán stock.
- **Páginas de Detalle**: La vista detallada de una cotización será el centro de operaciones. Mostrará el estado, los ítems pendientes (backorder en ventas) y un botón de acción principal: **`Crear Orden`**. Esta acción disparará la conversión de la cotización (o una parte de ella) a una Orden de Venta o Compra.

---

## 6. Resumen de Implementación Técnica

### Backend (FastAPI)

- **Modelos**: Implementar los cambios de base de datos descritos en la sección 4.
- **Servicios**: Actualizar `document_number_service` y añadir la lógica de conversión `crear_orden_desde_cotizacion` en los servicios de `sales` y `purchasing`.
- **Rutas y Schemas**: Exponer los nuevos endpoints y definir los esquemas de datos para las cotizaciones.

### Frontend (React)

- **Navegación**: Actualizar el layout para añadir las nuevas rutas y menús.
- **Módulos**: Crear las nuevas páginas, hooks y componentes para gestionar las cotizaciones de venta y compra, siguiendo el flujo descrito en la sección 5.

---

## 7. Beneficios del Planteamiento Unificado

1.  **Flujo Simétrico**: Reduce la curva de aprendizaje del personal.
2.  **Flexibilidad y Negociación**: Permite documentar fases de negociación.
3.  **Gestión de Backorders Robusta**: Integrada de forma nativa en el flujo de ventas.
4.  **Trazabilidad Completa**: Vínculo claro desde la solicitud inicial hasta la factura final.
5.  **Inteligencia de Negocio**: Centraliza datos sobre demanda y compras.
