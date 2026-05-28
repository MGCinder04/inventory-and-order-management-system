from datetime import date
from decimal import Decimal
from pydantic import BaseModel


class DailyRevenue(BaseModel):
    date: date
    revenue: Decimal


class OrdersByStatus(BaseModel):
    status: str
    count: int


class TopProduct(BaseModel):
    product_id: int
    name: str
    sku: str
    total_sold: int
    total_revenue: Decimal


class AnalyticsSummary(BaseModel):
    total_revenue: Decimal
    total_orders: int
    total_products: int
    total_customers: int
    orders_by_status: list[OrdersByStatus]
    top_products: list[TopProduct]
    daily_revenue: list[DailyRevenue]
