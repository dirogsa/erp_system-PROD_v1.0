from beanie import Document, Indexed
from motor.motor_asyncio import AsyncIOMotorClient
from pymongo.errors import DuplicateKeyError
import asyncio

class DocumentSequence(Document):
    name: Indexed(str, unique=True)
    sequence: int = 0

    class Settings:
        name = "document_sequences"

class DocumentNumberService:
    def __init__(self, prefix: str, model_name: str):
        self.prefix = prefix
        self.model_name = model_name

    async def get_next_number(self) -> str:
        """
        Generates the next number in a sequence for a given document type.
        Example: "NC-00001"
        """
        sequence_doc = await DocumentSequence.find_one(DocumentSequence.name == self.model_name)
        if not sequence_doc:
            sequence_doc = DocumentSequence(name=self.model_name, sequence=0)

        # Atomically find and update the sequence
        # This is a bit complex with beanie, so we drop to pymongo level for the update
        client: AsyncIOMotorClient = DocumentSequence.get_motor_client()
        collection = client[DocumentSequence.Settings.database][DocumentSequence.Settings.name]

        result = await collection.find_one_and_update(
            {"name": self.model_name},
            {"$inc": {"sequence": 1}},
            upsert=True,
            return_document=True
        )
        
        next_seq = result['sequence']
        return f"{self.prefix}-{next_seq:05d}"

# --- Specific Service Instances ---

async def get_credit_note_number() -> str:
    service = DocumentNumberService(prefix="NC", model_name="credit_note")
    return await service.get_next_number()

async def get_debit_note_number() -> str:
    service = DocumentNumberService(prefix="ND", model_name="debit_note")
    return await service.get_next_number()

