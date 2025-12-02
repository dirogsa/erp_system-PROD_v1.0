# Guía de Despliegue en Render para el Sistema ERP

Esta guía detalla los pasos para desplegar los servicios de frontend y backend de la aplicación ERP en la plataforma Render.

## 1. Configuración del Backend (Servicio "backend")

El backend es una aplicación FastAPI que necesita ser configurada como un "Web Service" en Render.

- **Repositorio:** Conecta tu repositorio de GitHub donde se encuentra el proyecto.
- **Nombre del Servicio:** `backend` (o el nombre que prefieras).
- **Rama:** `main`.
- **Root Directory:** `backend` (Importante: Asegúrate de que Render solo mire dentro de esta carpeta para el backend).
- **Tipo de Entorno:** `Python 3`.
- **Comando de Build:** `pip install -r requirements.txt`.
- **Comando de Inicio:** `uvicorn app.main:app --host 0.0.0.0 --port $PORT`.

### Variables de Entorno del Backend

Ve a la pestaña "Environment" y añade las siguientes variables. Son cruciales para que la aplicación se conecte a la base de datos y configure CORS adecuadamente.

- `MONGO_URI`: El string de conexión a tu base de datos de MongoDB Atlas.
    - **Ejemplo:** `mongodb+srv://<user>:<password>@cluster.mongodb.net/?retryWrites=true&w=majority`
- `DB_NAME`: El nombre de tu base de datos en MongoDB.
    - **Ejemplo:** `erp_db`
- `ALLOWED_ORIGINS`: La URL del frontend desplegado. Render te dará esta URL una vez que crees el servicio de frontend. ¡Tendrás que volver y rellenar esto más tarde!
    - **Ejemplo:** `https://frontend-service-name.onrender.com`

## 2. Configuración del Frontend (Servicio "frontend")

El frontend es una aplicación de React construida con Vite, y debe ser configurada como un "Static Site" en Render.

- **Repositorio:** El mismo repositorio de GitHub.
- **Nombre del Servicio:** `frontend` (o el nombre que prefieras).
- **Rama:** `main`.
- **Root Directory:** `frontend` (Importante: Render debe mirar dentro de esta carpeta para el frontend).
- **Comando de Build:** `npm install && npm run build`.
- **Publish Directory:** `dist` (Este es el directorio donde Vite pone los archivos estáticos después de la compilación).

### Variables de Entorno del Frontend

Al igual que en el backend, el frontend necesita saber dónde encontrar la API.

- **Variable:** `VITE_API_BASE_URL`
- **Valor:** La URL del backend que Render te proporcionó al crear el servicio `backend`.
    - **Ejemplo:** `https://backend-service-name.onrender.com`

---

## Notas Importantes sobre Dependencias

### Backend

Cada vez que añadas una nueva dependencia de Python con `pip`, asegúrate de actualizar el archivo `requirements.txt` antes de subir los cambios. Puedes hacerlo con:

```bash
pip freeze > requirements.txt
```

### Frontend

Al añadir una nueva dependencia de Node.js (por ejemplo, `npm install <package>`), el archivo `package.json` se actualiza automáticamente. Simplemente tienes que **confirmar y subir ese archivo `package.json` modificado** a tu repositorio. Render leerá este archivo e instalará las nuevas dependencias automáticamente durante el proceso de "build".

**Ejemplo Reciente:** Se añadió `lodash.debounce`. El comando `npm install lodash.debounce` modificó `frontend/package.json`. Al subir este cambio, nos aseguramos de que Render también instale `lodash.debounce`.

---

¡Eso es todo! Con esta configuración, tus servicios se desplegarán y se reconstruirán automáticamente cada vez que hagas `push` a la rama `main`.