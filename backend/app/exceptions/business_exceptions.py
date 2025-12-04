class BusinessException(Exception):
    """Base class for business logic exceptions"""
    pass

class NotFoundException(BusinessException):
    """Raised when an entity is not found in the database."""
    pass

class ValidationException(BusinessException):
    """Raised when input data fails validation."""
    pass

class InsufficientStockException(BusinessException):
    """Raised when there is not enough stock to fulfill an order."""
    def __init__(self, product_sku: str, available: int, required: int):
        self.product_sku = product_sku
        self.available = available
        self.required = required
        super().__init__(f"Insufficient stock for SKU {product_sku}. Required: {required}, Available: {available}")

class DuplicateException(BusinessException):
    """Raised when trying to create an entity that already exists (e.g., duplicate RUC)."""
    pass
