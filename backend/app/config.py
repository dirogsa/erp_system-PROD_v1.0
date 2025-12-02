import os
from dotenv import load_dotenv

# Carga las variables de entorno desde un archivo .env si existe
load_dotenv()

# --- Configuración de la Base de Datos ---
MONGODB_URI = os.getenv("MONGODB_URI")
MONGO_DB_NAME = os.getenv("MONGO_DB_NAME")

# --- Configuración de CORS ---
# Se especifica el origen explícito del frontend para permitir credenciales
ALLOWED_ORIGINS = [
    "https://5173-firebase-ecommerce-1764621325358.cluster-lr6dwlc2lzbcctqhqorax5zmro.cloudworkstations.dev",
    "https://8000-firebase-ecommerce-1764621325358.cluster-lr6dwlc2lzbcctqhqorax5zmro.cloudworkstations.dev",
    "https://9000-firebase-ecommerce-1764621325358.cluster-lr6dwlc2lzbcctqhqorax5zmro.cloudworkstations.dev"
]

# --- Configuración de la Aplicación ---
API_PREFIX = "/api/v1"
