# Guía: Cómo Registrar Pagos de Facturas de Venta

## 🎯 Flujo Completo: De Orden a Pago

### Paso 1: Crear una Orden de Venta

1. Ve a **http://localhost:5173/sales**
2. Haz clic en el botón **+ (flotante)** en la esquina inferior derecha
3. Llena el formulario:
   - Selecciona un **Cliente**
   - Agrega **Items** (productos con cantidad y precio)
4. Haz clic en **"Crear Orden"**
5. Verás la orden en el tab **"Órdenes de Venta"** con estado **PENDIENTE**

### Paso 2: Convertir la Orden en Factura

> IMPORTANTE: Debes estar en el tab **"Órdenes de Venta"**

1. Busca la orden que acabas de crear
2. En la columna **"Acciones"**, verás 3 botones:
   - 👁️ **Ver** - Ver detalles de la orden
   - 📄 **Factura** - **ESTE BOTÓN CONVIERTE LA ORDEN EN FACTURA**
   - 🗑️ **Eliminar** - Eliminar la orden

3. Haz clic en **📄 (Factura)**
4. Se abre el modal **"Registrar Factura de Venta"**
5. Llena los campos:
   - Número de Factura: F001-00001
   - Fecha de Factura: [selecciona fecha]
   - Estado de Pago: **Pendiente** ← IMPORTANTE
6. Haz clic en **"Registrar Factura"**

### Paso 3: Verificar que la Factura se Creó

1. Cambia al tab **"Facturas de Venta"**
2. Deberías ver tu factura con:
   - Número: F001-00001
   - Estado Pago: 🟡 **○ PENDIENTE**

### Paso 4: Registrar el Pago (BOTÓN DEDICADO 💰)

> IMPORTANTE: Debes estar en el tab **"Facturas de Venta"**

1. En la tabla de facturas, busca tu factura
2. En la columna **"Acciones"**, verás:
   - 👁️ **Ver** - Ver detalles
   - 💰 **Pago** - **ESTE ES EL BOTÓN DE REGISTRAR PAGO** ← AQUÍ
3. Haz clic en **💰 (Pago)**
4. Se abre el modal **"Registrar Pago"**
5. Llena el formulario:
   - Monto a Pagar (S/): 300.00
   - Fecha de Pago: [selecciona fecha]
   - Notas: Transferencia bancaria (opcional)
6. Haz clic en **"Registrar Pago"**

### Paso 5: Verificar el Pago

1. La factura ahora muestra:
   - Estado: 🟠 **◐ PARCIAL**
   - Debajo: "S/ 300.00 / S/ 1,000.00"
2. El botón **💰** sigue visible porque aún hay saldo pendiente

## 🔍 Troubleshooting: "No veo el botón 💰"

### Problema 1: Estás en el tab equivocado
**Solución:** Asegúrate de estar en **"Facturas de Venta"**, no en "Órdenes de Venta"

### Problema 2: No tienes facturas, solo órdenes
**Solución:** Primero debes convertir una orden en factura usando el botón **📄**

### Problema 3: La factura ya está PAGADA
**Solución:** El botón solo aparece si el estado es PENDIENTE o PARCIAL

### Problema 4: Registraste la factura como "Pagado" desde el inicio
**Solución:** Si al crear la factura seleccionaste "Pagado" y pusiste el monto total, la factura se creó como PAGADA y no necesita más pagos

## 📊 Resumen de Botones por Tab

### Tab "Órdenes de Venta"
- 👁️ **Ver** - Ver detalles de la orden (proforma)
- 📄 **Factura** - Convertir orden en factura
- ✏️ **Editar** - Editar datos de la orden
- 🗑️ **Eliminar** - Eliminar orden

### Tab "Facturas de Venta"
- 👁️ **Ver** - Ver detalles de la factura + historial de pagos
- 💰 **Pago** - **Registrar pago** (solo si NO está PAGADO)
- ✏️ **Editar** - Editar datos de la factura (futuro)

## 💡 Tips

1. **Pagos Parciales:** Puedes registrar múltiples pagos. Cada uno se guarda en el historial.
2. **Validación:** El sistema no te permite pagar más del monto pendiente.
3. **Historial Completo:** Haz clic en 👁️ Ver para ver todos los pagos registrados.
4. **Estados Visuales:**
   - 🟡 **○ PENDIENTE** - No se ha pagado nada
   - 🟠 **◐ PARCIAL** - Se pagó parte
   - 🟢 **✓ PAGADO** - Pagado completamente
5. **Botón Claro:** El botón 💰 es específico para pagos, el botón ✏️ es para editar datos de la factura

