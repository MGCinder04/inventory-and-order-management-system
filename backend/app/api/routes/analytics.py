from datetime import datetime, timedelta, timezone
from fastapi import APIRouter, Depends, Query
from sqlalchemy import cast, Date, func, select
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.config import settings
from app.db.session import get_db
from app.models.customer import Customer
from app.models.order import Order, OrderStatus
from app.models.order_item import OrderItem
from app.models.product import Product
from app.schemas.analytics import (
    AnalyticsSummary,
    DailyRevenue,
    OrdersByStatus,
    TopProduct,
)

router = APIRouter(prefix="/analytics", tags=["analytics"])

TOP_PRODUCTS_LIMIT = 5


@router.get("/summary", response_model=AnalyticsSummary)
async def get_analytics_summary(
    days: int | None = Query(default=None, ge=1, le=365),
    db: AsyncSession = Depends(get_db),
) -> AnalyticsSummary:
    effective_days = days if days is not None else settings.ANALYTICS_DEFAULT_DAYS
    revenue_window_start = datetime.now(timezone.utc) - timedelta(days=effective_days)

    total_products = (await db.execute(select(func.count()).select_from(Product))).scalar_one()
    total_customers = (await db.execute(select(func.count()).select_from(Customer))).scalar_one()
    total_orders = (await db.execute(select(func.count()).select_from(Order))).scalar_one()

    total_revenue = (
        await db.execute(
            select(func.coalesce(func.sum(Order.total_amount), 0)).where(
                Order.status != OrderStatus.CANCELLED
            )
        )
    ).scalar_one()

    status_rows = (
        await db.execute(
            select(Order.status, func.count().label("count")).group_by(Order.status)
        )
    ).all()
    orders_by_status = [
        OrdersByStatus(status=row.status.value, count=row.count) for row in status_rows
    ]

    top_product_rows = (
        await db.execute(
            select(
                Product.id,
                Product.name,
                Product.sku,
                func.sum(OrderItem.quantity).label("total_sold"),
                func.sum(OrderItem.quantity * OrderItem.unit_price).label("total_revenue"),
            )
            .join(OrderItem, OrderItem.product_id == Product.id)
            .join(Order, Order.id == OrderItem.order_id)
            .where(Order.status != OrderStatus.CANCELLED)
            .group_by(Product.id, Product.name, Product.sku)
            .order_by(func.sum(OrderItem.quantity).desc())
            .limit(TOP_PRODUCTS_LIMIT)
        )
    ).all()
    top_products = [
        TopProduct(
            product_id=row.id,
            name=row.name,
            sku=row.sku,
            total_sold=row.total_sold,
            total_revenue=row.total_revenue,
        )
        for row in top_product_rows
    ]

    daily_revenue_rows = (
        await db.execute(
            select(
                cast(Order.created_at, Date).label("order_date"),
                func.sum(Order.total_amount).label("revenue"),
            )
            .where(Order.status != OrderStatus.CANCELLED)
            .where(Order.created_at >= revenue_window_start)
            .group_by(cast(Order.created_at, Date))
            .order_by(cast(Order.created_at, Date))
        )
    ).all()
    daily_revenue = [
        DailyRevenue(date=row.order_date, revenue=row.revenue)
        for row in daily_revenue_rows
    ]

    return AnalyticsSummary(
        total_revenue=total_revenue,
        total_orders=total_orders,
        total_products=total_products,
        total_customers=total_customers,
        orders_by_status=orders_by_status,
        top_products=top_products,
        daily_revenue=daily_revenue,
    )
