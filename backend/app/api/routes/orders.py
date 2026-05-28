from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload
from app.db.session import get_db
from app.models.customer import Customer
from app.models.inventory_log import InventoryLog
from app.models.order import Order, OrderStatus, VALID_STATUS_TRANSITIONS
from app.models.order_item import OrderItem
from app.models.product import Product
from app.schemas.order import (
    OrderCreate,
    OrderResponse,
    OrderStatusUpdate,
    PaginatedOrdersResponse,
)

router = APIRouter(prefix="/orders", tags=["orders"])

DEFAULT_PAGE_LIMIT = 20
MAX_PAGE_LIMIT = 100
ORDER_CANCELLATION_REASON = "order_cancelled"


def _order_with_relations_query(where_clause=None):
    query = select(Order).options(
        selectinload(Order.customer),
        selectinload(Order.items).selectinload(OrderItem.product),
    )
    if where_clause is not None:
        query = query.where(where_clause)
    return query


async def _restore_stock_for_order(order: Order, db: AsyncSession) -> None:
    for item in order.items:
        product = (
            await db.execute(select(Product).where(Product.id == item.product_id))
        ).scalar_one()
        product.quantity_in_stock += item.quantity
        db.add(
            InventoryLog(
                product_id=item.product_id,
                quantity_change=item.quantity,
                reason=ORDER_CANCELLATION_REASON,
            )
        )


@router.get("", response_model=PaginatedOrdersResponse)
async def list_orders(
    limit: int = Query(default=DEFAULT_PAGE_LIMIT, ge=1, le=MAX_PAGE_LIMIT),
    offset: int = Query(default=0, ge=0),
    db: AsyncSession = Depends(get_db),
) -> PaginatedOrdersResponse:
    total = (await db.execute(select(func.count()).select_from(Order))).scalar_one()
    orders = (
        await db.execute(
            _order_with_relations_query()
            .order_by(Order.created_at.desc())
            .offset(offset)
            .limit(limit)
        )
    ).scalars().all()

    return PaginatedOrdersResponse(total=total, limit=limit, offset=offset, items=list(orders))


@router.post("", response_model=OrderResponse, status_code=status.HTTP_201_CREATED)
async def create_order(
    payload: OrderCreate, db: AsyncSession = Depends(get_db)
) -> Order:
    customer = (
        await db.execute(select(Customer).where(Customer.id == payload.customer_id))
    ).scalar_one_or_none()
    if not customer:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Customer not found")

    incoming_product_ids = [item.product_id for item in payload.items]
    if len(incoming_product_ids) != len(set(incoming_product_ids)):
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Duplicate product IDs in order items — combine quantities into one line per product",
        )

    resolved_items: list[tuple[Product, int]] = []
    total_amount = 0.0

    for item in payload.items:
        product = (
            await db.execute(select(Product).where(Product.id == item.product_id))
        ).scalar_one_or_none()
        if not product:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Product with id {item.product_id} not found",
            )
        if product.quantity_in_stock < item.quantity:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail=(
                    f"Insufficient stock for '{product.name}' (SKU: {product.sku}). "
                    f"Available: {product.quantity_in_stock}, requested: {item.quantity}"
                ),
            )
        resolved_items.append((product, item.quantity))
        total_amount += float(product.price) * item.quantity

    order = Order(
        customer_id=payload.customer_id,
        total_amount=total_amount,
        status=OrderStatus.PENDING,
    )
    db.add(order)
    await db.flush()

    for product, quantity in resolved_items:
        db.add(
            OrderItem(
                order_id=order.id,
                product_id=product.id,
                quantity=quantity,
                unit_price=product.price,
            )
        )
        product.quantity_in_stock -= quantity
        db.add(
            InventoryLog(
                product_id=product.id,
                quantity_change=-quantity,
                reason=f"order_created:order_id={order.id}",
            )
        )

    await db.commit()

    refreshed = (
        await db.execute(_order_with_relations_query(Order.id == order.id))
    ).scalar_one()
    return refreshed


@router.get("/{order_id}", response_model=OrderResponse)
async def get_order(order_id: int, db: AsyncSession = Depends(get_db)) -> Order:
    order = (
        await db.execute(_order_with_relations_query(Order.id == order_id))
    ).scalar_one_or_none()
    if not order:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Order not found")
    return order


@router.patch("/{order_id}/status", response_model=OrderResponse)
async def update_order_status(
    order_id: int, payload: OrderStatusUpdate, db: AsyncSession = Depends(get_db)
) -> Order:
    order = (
        await db.execute(_order_with_relations_query(Order.id == order_id))
    ).scalar_one_or_none()
    if not order:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Order not found")

    allowed_next_statuses = VALID_STATUS_TRANSITIONS.get(order.status, set())
    if payload.status not in allowed_next_statuses:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=f"Cannot transition order from '{order.status.value}' to '{payload.status.value}'",
        )

    if payload.status == OrderStatus.CANCELLED:
        await _restore_stock_for_order(order, db)

    order.status = payload.status
    await db.commit()

    refreshed = (
        await db.execute(_order_with_relations_query(Order.id == order_id))
    ).scalar_one()
    return refreshed


@router.delete("/{order_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_order(order_id: int, db: AsyncSession = Depends(get_db)) -> None:
    order = (
        await db.execute(_order_with_relations_query(Order.id == order_id))
    ).scalar_one_or_none()
    if not order:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Order not found")

    if order.status != OrderStatus.CANCELLED:
        await _restore_stock_for_order(order, db)

    await db.delete(order)
    await db.commit()
