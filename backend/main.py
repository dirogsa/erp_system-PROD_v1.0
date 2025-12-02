import os
import logging
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# Importa las configuraciones centralizadas
from app.config import ALLOWED_ORIGINS
from app.database import init_db

# Importa las rutas y los manejadores de excepciones
from app.routes import inventory, purchasing, sales
from app.exceptions.business_exceptions import BusinessException
from app.exceptions.handlers import business_exception_handler

# --- Configuración del Logger ---
if os.path.exists('backend_startup_error.log'):
    os.remove('backend_startup_error.log')

logging.basicConfig(
    filename='backend_startup_error.log',
    level=logging.ERROR,
    format='%(asctime)s - %(levelname)s - %(message)s'
)

app = FastAPI(title="ERP System API", version="1.0.0")
app.add_exception_handler(BusinessException, business_exception_handler)

# --- Configuración de CORS ---
app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Incluye las rutas
app.include_router(inventory.router)
app.include_router(purchasing.router)
app.include_router(sales.router)

@app.on_event("startup")
async def on_startup():
    """
    Eventos al iniciar la aplicación.
    """
    print("Iniciando la aplicación ERP...")
    try:
        await init_db()
        print("Conexión a la base de datos verificada.")
    except Exception as e:
        print("!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!")
        print("!!! ERROR CRÍTICO: No se pudo conectar a la base de datos.")
        print("!!! ----- DETALLE DEL ERROR TÉCNICO -----")
        print(e)  # <-- CAMBIO CLAVE: Imprimir el error en consola
        print("!!! -------------------------------------")
        print("!!! Revise el archivo 'backend_startup_error.log' para detalles.")
        print("!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!")
        logging.error("Fallo al inicializar la base de datos (init_db)", exc_info=True)
        return

    # El resto del código de startup...
    try:
        from app.models.inventory import Warehouse
        print("Verificando/creando datos iniciales (almacenes)...")
        if not await Warehouse.find_one({"code": "SL01"}):
            await Warehouse(name="Almacén San Luis (Principal)", code="SL01", address="Av. San Luis 123", is_main=True).insert()
        if not await Warehouse.find_one({"code": "ATE01"}):
            await Warehouse(name="Almacén Ate", code="ATE01", address="Carretera Central Km 5", is_main=False).insert()
        print("Datos iniciales de almacenes verificados.")
    except Exception as e:
        print(f"!!! ERROR: No se pudieron crear los datos iniciales (almacenes): {e}")
        logging.error("Fallo al crear datos iniciales (Warehouse)", exc_info=True)

    try:
        from app.models.inventory import Product
        print("Verificando/creando índices de la base de datos...")
        coll = Product.get_pymongo_collection()
        await coll.create_index([
            ("measurements.label", 1),
            ("measurements.unit", 1),
            ("measurements.value", 1),
        ])
        print("Índices de 'measurements' verificados/creados.")
    except Exception as e:
        print(f"!!! ADVERTENCIA: No se pudo crear el índice de 'measurements': {e}")
        logging.warning("No se pudo crear el índice de 'measurements'", exc_info=True)

@app.get("/")
async def root():
    return {"message": "ERP System API is running"}
