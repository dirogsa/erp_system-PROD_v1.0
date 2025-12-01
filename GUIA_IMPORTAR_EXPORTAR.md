# Guía: Importar y Exportar Productos

## 📥 Importar Productos desde CSV

### Formato del Archivo CSV

El archivo CSV debe tener las siguientes columnas (en este orden):

```csv
sku,name,brand,description,price,cost,initial_stock
```

**Campos:**
- `sku` (requerido): Código único del producto
- `name` (requerido): Nombre del producto
- `brand` (opcional): Marca del producto
- `description` (opcional): Descripción del producto
- `price` (requerido): Precio de venta
- `cost` (requerido): Costo de compra
- `initial_stock` (opcional): Stock inicial (default: 0)

### Ejemplo de Archivo CSV

```csv
sku,name,brand,description,price,cost,initial_stock
LAP-001,Laptop Dell Inspiron 15,Dell,Laptop con procesador Intel Core i5,2500.00,1800.00,10
MOU-001,Mouse Logitech MX Master,Logitech,Mouse inalámbrico ergonómico,150.00,80.00,25
```

### Cómo Importar

**Desde la Interfaz Web:**
1. Ve a **http://localhost:5173/inventory**
2. Haz clic en el botón **"Importar CSV"**
3. Selecciona tu archivo CSV
4. Haz clic en **"Subir"**
5. Verás un resumen:
   - Productos creados exitosamente
   - Errores (si los hay)

**Desde la API (Backend):**
```bash
curl -X POST "http://localhost:8000/inventory/import" \
  -H "Content-Type: multipart/form-data" \
  -F "file=@productos.csv"
```

### Validaciones

- ✅ El SKU debe ser único (no puede existir previamente)
- ✅ Los campos `price` y `cost` deben ser números válidos
- ✅ Los campos opcionales pueden estar vacíos
- ⚠️ Si un SKU ya existe, esa línea se omite y se reporta como error

## 📤 Exportar Productos a CSV

### Cómo Exportar

**Desde la Interfaz Web:**
1. Ve a **http://localhost:5173/inventory**
2. Haz clic en el botón **"Exportar CSV"**
3. Se descargará automáticamente el archivo `productos.csv`

**Desde la API (Backend):**
```bash
curl -X GET "http://localhost:8000/inventory/export" \
  -o productos.csv
```

### Formato del Archivo Exportado

El archivo exportado incluye todos los productos con las siguientes columnas:

```csv
sku,name,brand,description,price,cost,stock_current
```

**Nota:** El campo `stock_current` muestra el stock actual (no `initial_stock`)

### Ejemplo de Archivo Exportado

```csv
sku,name,brand,description,price,cost,stock_current
LAP-001,Laptop Dell Inspiron 15,Dell,Laptop con procesador Intel Core i5,2500.00,1800.00,8
MOU-001,Mouse Logitech MX Master,Logitech,Mouse inalámbrico ergonómico,150.00,80.00,23
```

## 💡 Tips y Mejores Prácticas

1. **Backup antes de importar:** Exporta tus productos actuales antes de hacer una importación masiva
2. **Validar el CSV:** Abre el CSV en Excel/LibreOffice para verificar que no tenga errores de formato
3. **Codificación UTF-8:** Asegúrate de que el archivo esté en UTF-8 para evitar problemas con caracteres especiales
4. **Campos opcionales:** Si no tienes `brand` o `description`, puedes dejar las celdas vacías
5. **Decimales:** Usa punto (.) como separador decimal, no coma (,)
6. **Stock inicial:** Solo se usa al crear productos nuevos, no al actualizar

## 🔄 Flujo de Trabajo Recomendado

### Migración de Datos
```
1. Exportar productos actuales (backup)
2. Preparar CSV con nuevos productos
3. Importar CSV
4. Verificar en la interfaz web
5. Ajustar stock si es necesario
```

### Actualización Masiva
```
1. Exportar productos actuales
2. Editar el CSV (cambiar precios, costos, etc.)
3. Eliminar productos antiguos (opcional)
4. Importar CSV actualizado
```

## ⚠️ Errores Comunes

### Error: "SKU already exists"
**Causa:** Estás intentando importar un producto con un SKU que ya existe
**Solución:** Elimina el producto existente o usa un SKU diferente

### Error: "could not convert string to float"
**Causa:** Los campos `price` o `cost` tienen un formato incorrecto
**Solución:** Verifica que uses punto (.) como separador decimal

### Error: "File must be a CSV"
**Causa:** El archivo no tiene extensión `.csv`
**Solución:** Guarda el archivo con extensión `.csv`

## 📊 Campos Actualizados (2025)

El sistema ahora incluye los siguientes campos en importar/exportar:
- ✅ `sku` - Código único
- ✅ `name` - Nombre del producto
- ✅ `brand` - Marca (nuevo)
- ✅ `description` - Descripción (nuevo)
- ✅ `price` - Precio de venta (con precisión de 3 decimales)
- ✅ `cost` - Costo de compra (con precisión de 3 decimales)
- ✅ `stock_current` - Stock actual (solo en exportar)
- ✅ `initial_stock` - Stock inicial (solo en importar)

## 🎯 Ejemplo Completo

Archivo: `ejemplo_productos.csv` (incluido en el proyecto)

```csv
sku,name,brand,description,price,cost,initial_stock
LAP-001,Laptop Dell Inspiron 15,Dell,Laptop con procesador Intel Core i5 y 8GB RAM,2500.00,1800.00,10
LAP-002,Laptop HP Pavilion,HP,Laptop con procesador AMD Ryzen 5 y 16GB RAM,2800.00,2000.00,5
MOU-001,Mouse Logitech MX Master,Logitech,Mouse inalámbrico ergonómico,150.00,80.00,25
KEY-001,Teclado Mecánico Corsair,Corsair,Teclado mecánico RGB con switches Cherry MX,350.00,200.00,15
MON-001,Monitor LG 27 pulgadas,LG,Monitor Full HD IPS 27 pulgadas,800.00,550.00,8
```

Este archivo está listo para importar y creará 5 productos con sus respectivos stocks iniciales.
