import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.database import init_db

from app.routes import inventory, purchasing, sales

from app.exceptions.business_exceptions import BusinessException
from app.exceptions.handlers import business_exception_handler

app = FastAPI(title="ERP System API", version="1.0.0")

app.add_exception_handler(BusinessException, business_exception_handler)

# Configuración de CORS - Permite localhost y URL en producción
origins = [
    "http://localhost:5173",  # Frontend React (Vite) - Desarrollo
    "http://localhost:3000",  # Frontend React (CRA) - Desarrollo
]

# Agregar URL de producción desde variable de entorno
frontend_url = os.getenv("FRONTEND_URL")
if frontend_url:
    origins.append(frontend_url)

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(inventory.router)
app.include_router(purchasing.router)
app.include_router(sales.router)

@app.on_event("startup")
async def start_db():
    await init_db()
    
    # Initialize default warehouses after Beanie is ready
    from app.models.inventory import Warehouse
    
    # Principal (San Luis)
    if not await Warehouse.find_one({"code": "SL01"}):
        await Warehouse(name="Almacén San Luis (Principal)", code="SL01", address="Av. San Luis 123", is_main=True).insert()
    
    # Secundario (Ate)
    if not await Warehouse.find_one({"code": "ATE01"}):
        await Warehouse(name="Almacén Ate", code="ATE01", address="Carretera Central Km 5", is_main=False).insert()

    # Ensure index for measurements to speed up measurement range queries
    try:
        from app.models.inventory import Product
        coll = Product.get_pymongo_collection()
        # compound index on measurements.label, measurements.unit, measurements.value
        await coll.create_index([
            ("measurements.label", 1),
            ("measurements.unit", 1),
            ("measurements.value", 1),
        ])
    except Exception:
        # If indexing fails, log to console but allow startup
        import traceback
        print("Warning: could not create measurements index:")
        traceback.print_exc()

@app.get("/")
async def root():
    return {"message": "ERP System API is running"}
