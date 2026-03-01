from pydantic import BaseModel
from typing import Optional
from datetime import date

class MedicineCreate(BaseModel):
    name: str
    generic_name: Optional[str] = None
    category: Optional[str] = None
    batch_no: Optional[str] = None
    expiry_date: Optional[date] = None
    quantity: int = 0
    cost_price: float = 0.0
    mrp: float = 0.0
    supplier: Optional[str] = None
    status: str = "active"

class MedicineUpdate(BaseModel):
    name: Optional[str] = None
    generic_name: Optional[str] = None
    category: Optional[str] = None
    batch_no: Optional[str] = None
    expiry_date: Optional[date] = None
    quantity: Optional[int] = None
    cost_price: Optional[float] = None
    mrp: Optional[float] = None
    supplier: Optional[str] = None
    status: Optional[str] = None

class StatusUpdate(BaseModel):
    status: str

class SaleCreate(BaseModel):
    customer_name: Optional[str] = "Walk-in Customer"
    total_amount: float
    payment_mode: str = "Cash"

class PurchaseOrderSummary(BaseModel):
    pending: int
    total_value: float

class DashboardSummary(BaseModel):
    today_sales: float
    items_sold_today: int
    low_stock_items: int
    purchase_orders: PurchaseOrderSummary
    sales_change_percent: float
