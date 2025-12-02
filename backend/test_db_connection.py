# backend/test_db_connection.py
import os
import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv

async def check_mongodb_connection():
    """
    Carga las variables de entorno, se conecta a MongoDB y 
    verifica el estado del servidor.
    """
    print("Iniciando prueba de conexión a la base de datos...")
    try:
        # Cargar variables de entorno desde .env
        load_dotenv()

        mongodb_uri = os.getenv("MONGODB_URI")
        db_name = os.getenv("MONGO_DB_NAME")

        if not mongodb_uri or not db_name:
            print("Error: MONGODB_URI o MONGO_DB_NAME no están definidas en el entorno.")
            return

        print(f"Intentando conectar a la base de datos: '{db_name}'...")

        # Crear un cliente de Motor
        client = AsyncIOMotorClient(mongodb_uri)

        # La conexión es perezosa. Se necesita un comando para forzar la conexión.
        # server_info() es ideal para esto.
        server_info = await client.server_info()

        print("\n--- CONEXIÓN EXITOSA ---")
        print(f"Versión del servidor MongoDB: {server_info['version']}")
        print(f"La base de datos '{db_name}' está accesible.")
        
        # Opcional: Listar colecciones en la base de datos
        db = client[db_name]
        collections = await db.list_collection_names()
        print(f"Colecciones encontradas: {collections}")

    except Exception as e:
        print("\n--- FALLO LA CONEXIÓN ---")
        print(f"Error: {e}")
    finally:
        if 'client' in locals():
            client.close()
            print("\nConexión cerrada.")

if __name__ == "__main__":
    asyncio.run(check_mongodb_connection())
