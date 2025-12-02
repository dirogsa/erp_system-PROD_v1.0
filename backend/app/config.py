import os
from dotenv import load_dotenv

# Carga las variables de entorno desde un archivo .env si existe
load_dotenv()

# --- Configuración de la Base de Datos ---
MONGODB_URI = os.getenv("MONGODB_URI")
MONGO_DB_NAME = os.getenv("MONGO_DB_NAME")

# --- Configuración dinámica de CORS ---
# Lee la variable de entorno y la convierte en una lista de orígenes.
# Si la variable no está, usa una lista de valores por defecto para desarrollo.
allowed_origins_str = os.getenv("ALLOWED_ORIGINS")

if allowed_origins_str:
    # Si la variable existe (en producción), la separamos por comas
    ALLOWED_ORIGINS = [origin.strip() for origin in allowed_origins_str.split(',')]
else:
    # Si no existe (en desarrollo), usamos los valores por defecto
    ALLOWED_ORIGINS = [
        "http://localhost:5173", # Frontend local de Vite
        "https://5173-firebase-ecommerce-1764621325358.cluster-lr6dwlc2lzbcctqhqorax5zmro.cloudworkstations.dev",
        "https://8000-firebase-ecommerce-1764621325358.cluster-lr6dwlc2lzbcctqhqorax5zmro.cloudworkstations.dev",
        "https://9000-firebase-ecommerce-1764621325358.cluster-lr6dwlc2lzbcctqhqorax5zmro.cloudworkstations.dev",
    ]

# --- Configuración de la Aplicación ---
API_PREFIX = "/api/v1"

print("="*50)
print("CONFIGURACIÓN DE ORÍGENES PERMITIDOS (CORS):")
if allowed_origins_str:
    print("Modo: PRODUCCIÓN (desde variable de entorno ALLOWED_ORIGINS)")
else:
    print("Modo: DESARROLLO (usando valores por defecto)")
print(ALLOWED_ORIGINS)
print("="*50)
