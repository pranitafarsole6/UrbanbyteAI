from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from app.database.db import get_db
from app.database.models import User
from app.api.auth import get_current_user
from app.services.sustainability_service import eco_metrics

router = APIRouter()

@router.get("/api/sustainability/metrics")
async def metrics(db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)):
    return await eco_metrics(db, current_user.id)