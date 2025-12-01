# Guía: Importar y Exportar Productos (Fase 1 - CRUD)

## 🎯 Nueva Funcionalidad: Operaciones CRUD

Ahora puedes **Insertar**, **Actualizar** y **Eliminar** productos usando un solo archivo CSV con la columna `operation`.

---

## 📤 EXPORTAR Productos

### Opción 1: Exportar Plantilla Vacía (con ejemplos)

**URL:** `http://localhost:8000/inventory/export?template=empty`

**Resultado:** Archivo `plantilla_productos.csv` con ejemplos:
```csv
operation,sku,name,brand,description,price,cost,stock_current
INSERT,EJEMPLO-001,Nombre del Producto,Marca,Descripción del producto,100.00,50.00,10
UPDATE,EJEMPLO-002,Producto Existente,,Nueva descripción,120.00,,
DELETE,EJEMPLO-003,,,,,,
```

**Uso:** Descarga esta plantilla, reemplaza los ejemplos con tus productos y súbela.

### Opción 2: Exportar Productos Actuales

**URL:** `http://localhost:8000/inventory/export` (o `?template=current`)

**Resultado:** Archivo `productos.csv` con todos tus productos:
```csv
operation,sku,name,brand,description,price,cost,stock_current
UPDATE,LAP-001,Laptop Dell Inspiron 15,Dell,Laptop i5 8GB,2500.00,1800.00,8
UPDATE,MOU-001,Mouse Logitech MX,Logitech,Mouse inalámbrico,150.00,80.00,23
```

**Uso:** Modifica los productos que necesites (cambiar precios, descripciones, etc.), agrega nuevos con `INSERT` o marca para eliminar con `DELETE`, y vuelve a importar.

---

## 📥 IMPORTAR Productos

### Formato del CSV

**Columnas requeridas:**
- `operation` (obligatorio): `INSERT`, `UPDATE`, o `DELETE`
- `sku` (obligatorio): Código único del producto

**Columnas opcionales (según operación):**
- `name`, `brand`, `description`, `price`, `cost`, `stock_current`

### Operación: INSERT

**Crear nuevos productos**

```csv
operation,sku,name,brand,description,price,cost,stock_current
INSERT,LAP-003,Laptop Lenovo ThinkPad,Lenovo,Laptop empresarial,3000.00,2200.00,5
```

**Campos requeridos:** `sku`, `name`, `price`, `cost`  
**Campos opcionales:** `brand`, `description`, `stock_current` (default: 0)

**Validación:** El SKU NO debe existir previamente.

### Operación: UPDATE

**Actualizar productos existentes (solo campos no vacíos)**

```csv
operation,sku,name,brand,description,price,cost,stock_current
UPDATE,LAP-001,Laptop Dell Inspiron 15 Plus,,,2600.00,,
UPDATE,MOU-001,,,Nueva descripción,,,
UPDATE,KEY-001,,,,,,20
```

**Comportamiento:**
- Solo actualiza los campos que NO estén vacíos
- Campos vacíos = mantener valor actual
- Permite actualizar solo precio sin tocar nombre, descripción, etc.

**Ejemplo:**
- Línea 1: Actualiza `name` y `price`, mantiene `brand`, `description`, `cost`, `stock`
- Línea 2: Actualiza solo `description`
- Línea 3: Actualiza solo `stock_current`

**Validación:** El SKU DEBE existir.

### Operación: DELETE

**Eliminar productos**

```csv
operation,sku,name,brand,description,price,cost,stock_current
DELETE,OLD-001,,,,,,
```

**Campos requeridos:** Solo `operation` y `sku`  
**Otros campos:** Se ignoran (pueden estar vacíos)

**Validación:** El SKU DEBE existir.

---

## 🔄 Ejemplo de Flujo Completo

### Paso 1: Exportar productos actuales
```bash
curl "http://localhost:8000/inventory/export" -o productos.csv
```

### Paso 2: Modificar el CSV en Excel/LibreOffice

**Antes:**
```csv
operation,sku,name,brand,description,price,cost,stock_current
UPDATE,LAP-001,Laptop Dell Inspiron 15,Dell,Laptop i5 8GB,2500.00,1800.00,8
UPDATE,MOU-001,Mouse Logitech MX,Logitech,Mouse inalámbrico,150.00,80.00,23
```

**Después:**
```csv
operation,sku,name,brand,description,price,cost,stock_current
UPDATE,LAP-001,,,, 2600.00,,
INSERT,LAP-003,Laptop Lenovo ThinkPad,Lenovo,Laptop i7 16GB,3000.00,2200.00,5
DELETE,MOU-001,,,,,,
```

### Paso 3: Importar CSV modificado
```bash
curl -X POST "http://localhost:8000/inventory/import" \
  -F "file=@productos.csv"
```

### Paso 4: Ver reporte
```json
{
  "summary": {
    "inserted": 1,
    "updated": 1,
    "deleted": 1,
    "errors": 0
  },
  "details": {
    "inserted": ["LAP-003"],
    "updated": ["LAP-001"],
    "deleted": ["MOU-001"],
    "errors": []
  }
}
```

---

## 📊 Reporte Detallado

El endpoint de importación ahora retorna un reporte completo:

```json
{
  "summary": {
    "inserted": 5,
    "updated": 12,
    "deleted": 2,
    "errors": 3
  },
  "details": {
    "inserted": ["LAP-003", "MOU-002", "KEY-002", "MON-002", "CAB-001"],
    "updated": ["LAP-001", "LAP-002", "MOU-001", ...],
    "deleted": ["OLD-001", "OLD-002"],
    "errors": [
      "Línea 5: INSERT failed - SKU 'LAP-001' already exists",
      "Línea 8: UPDATE failed - SKU 'LAP-999' not found",
      "Línea 12: DELETE failed - SKU 'XYZ-001' not found"
    ]
  }
}
```

---

## ⚠️ Validaciones y Errores

### Error: "INSERT failed - SKU already exists"
**Causa:** Intentas insertar un producto con un SKU que ya existe  
**Solución:** Usa `UPDATE` en lugar de `INSERT`, o cambia el SKU

### Error: "UPDATE failed - SKU not found"
**Causa:** Intentas actualizar un producto que no existe  
**Solución:** Usa `INSERT` en lugar de `UPDATE`, o verifica el SKU

### Error: "DELETE failed - SKU not found"
**Causa:** Intentas eliminar un producto que no existe  
**Solución:** Verifica que el SKU sea correcto

### Error: "INSERT requires 'name', 'price', and 'cost'"
**Causa:** Faltan campos obligatorios para INSERT  
**Solución:** Completa los campos `name`, `price` y `cost`

### Error: "Invalid operation"
**Causa:** La columna `operation` tiene un valor inválido  
**Solución:** Usa solo `INSERT`, `UPDATE`, o `DELETE` (mayúsculas/minúsculas no importan)

---

## 💡 Tips y Mejores Prácticas

1. **Backup antes de importar:** Exporta tus productos antes de hacer cambios masivos
2. **Actualización parcial:** Deja campos vacíos para mantener valores actuales
3. **Operaciones mixtas:** Puedes combinar INSERT, UPDATE y DELETE en el mismo archivo
4. **Validar antes:** Revisa el CSV en Excel antes de importar
5. **Ver reporte:** Siempre revisa el reporte de importación para detectar errores

---

## 📁 Archivos de Ejemplo Incluidos

1. **`ejemplo_insert.csv`** - Solo operaciones INSERT (crear 5 productos)
2. **`ejemplo_update.csv`** - Solo operaciones UPDATE (actualizar parcialmente)
3. **`ejemplo_mixto.csv`** - Operaciones mixtas (INSERT + UPDATE + DELETE)

---

## 🎯 Casos de Uso Comunes

### Caso 1: Actualizar precios masivamente
```csv
operation,sku,name,brand,description,price,cost,stock_current
UPDATE,LAP-001,,,, 2600.00,,
UPDATE,LAP-002,,,, 2900.00,,
UPDATE,MOU-001,,,, 160.00,,
```

### Caso 2: Agregar stock a múltiples productos
```csv
operation,sku,name,brand,description,price,cost,stock_current
UPDATE,LAP-001,,,,,,15
UPDATE,MOU-001,,,,,,30
UPDATE,KEY-001,,,,,,25
```

### Caso 3: Importar catálogo completo de proveedor
```csv
operation,sku,name,brand,description,price,cost,stock_current
INSERT,PROV-001,Producto A,Marca X,Descripción A,100.00,50.00,10
INSERT,PROV-002,Producto B,Marca X,Descripción B,200.00,100.00,5
INSERT,PROV-003,Producto C,Marca Y,Descripción C,150.00,75.00,8
```

### Caso 4: Limpiar productos obsoletos
```csv
operation,sku,name,brand,description,price,cost,stock_current
DELETE,OLD-001,,,,,,
DELETE,OLD-002,,,,,,
DELETE,OLD-003,,,,,,
```

---

## 🚀 Próximas Mejoras (Fases 2-4)

- [ ] Vista previa antes de importar
- [ ] Modo estricto vs permisivo
- [ ] Historial de importaciones
- [ ] Exportar con filtros
- [ ] Protección contra eliminación
- [ ] Exportar a Excel (.xlsx)
