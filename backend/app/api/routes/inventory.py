from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.session import get_db
from app.models.inventory_log import InventoryLog
from app.models.product import Product
from app.schemas.inventory import (
    InventoryAdjustment,
    InventoryLogResponse,
    InventoryProductResponse,
)

router = APIRouter(prefix="/inventory", tags=["inventory"])

RECENT_LOGS_LIMIT = 5


async def _build_inventory_product_response(
    product: Product, db: AsyncSession
) -> InventoryProductResponse:
    recent_logs = (
        await db.execute(
            select(InventoryLog)
            .where(InventoryLog.product_id == product.id)
            .order_by(InventoryLog.created_at.desc())
            .limit(RECENT_LOGS_LIMIT)
        )
    ).scalars().all()

    return InventoryProductResponse(
        id=product.id,
        name=product.name,
        sku=product.sku,
        quantity_in_stock=product.quantity_in_stock,
        price=product.price,
        recent_logs=[
            InventoryLogResponse.model_validate(log) for log in recent_logs
        ],
    )


@router.get("", response_model=list[InventoryProductResponse])
async def list_inventory(db: AsyncSession = Depends(get_db)) -> list[InventoryProductResponse]:
    products = (
        await db.execute(select(Product).order_by(Product.name))
    ).scalars().all()

    return [await _build_inventory_product_response(p, db) for p in products]


@router.patch("/{product_id}", response_model=InventoryProductResponse)
async def adjust_inventory(
    product_id: int,
    payload: InventoryAdjustment,
    db: AsyncSession = Depends(get_db),
) -> InventoryProductResponse:
    product = (
        await db.execute(select(Product).where(Product.id == product_id))
    ).scalar_one_or_none()
    if not product:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Product not found")

    new_quantity = product.quantity_in_stock + payload.quantity_change
    if new_quantity < 0:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=(
                f"Adjustment would result in negative stock ({new_quantity}). "
                f"Current stock: {product.quantity_in_stock}"
            ),
        )

    product.quantity_in_stock = new_quantity
    db.add(
        InventoryLog(
            product_id=product.id,
            quantity_change=payload.quantity_change,
            reason=payload.reason,
        )
    )
    await db.commit()
    await db.refresh(product)

    return await _build_inventory_product_response(product, db)
