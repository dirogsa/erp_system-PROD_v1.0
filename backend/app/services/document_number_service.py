
from datetime import datetime
from beanie import Document
from typing import Type

async def get_next_document_number(prefix: str, model: Type[Document]) -> str:
    """
    Genera el siguiente número de documento secuencial para un modelo y prefijo dados.
    Formato: PREFIJO + AÑO(2d) + '-' + SECUENCIA(4d). Ej: FV24-0001
    """
    year = datetime.now().strftime("%y")
    search_prefix = f"{prefix}{year}-"

    # Determina el campo a buscar (ej: 'invoice_number', 'order_number')
    # Asumimos una convención de nombres. Esto puede necesitar ajuste.
    number_field = ""
    if "Invoice" in model.__name__:
        number_field = "invoice_number"
    elif "Order" in model.__name__:
        number_field = "order_number"
    else:
        # Fallback o error si el modelo no tiene un campo de número conocido
        raise ValueError(f"El modelo {model.__name__} no tiene un campo de numeración estándar ('invoice_number' o 'order_number').")

    # Encuentra el último documento del año actual para obtener la secuencia más alta
    last_document = await model.find(
        {number_field: {"$regex": f"^{search_prefix}"}}
    ).sort(f"-{number_field}").limit(1).first_or_none()

    new_sequence = 1
    if last_document:
        last_number_str = getattr(last_document, number_field)
        try:
            last_sequence = int(last_number_str.split('-')[-1])
            new_sequence = last_sequence + 1
        except (ValueError, IndexError):
            # En caso de que un número antiguo no siga el formato, empezamos de 1.
            pass
            
    # Formatea el nuevo número de documento con 4 dígitos para la secuencia
    return f"{search_prefix}{new_sequence:04d}"
