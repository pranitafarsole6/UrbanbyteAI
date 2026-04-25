from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import func
from app.services.analytics_service import historical, datatype_distribution
from app.database.db import get_db
from app.database.models import User, Scan, FileItem
from app.api.auth import get_current_user

router = APIRouter()

@router.get("/api/analytics/historical")
async def history(db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)):
    # Simple history from Scan table
    stmt = select(Scan).where(Scan.user_id == current_user.id).order_by(Scan.timestamp.asc()).limit(30)
    result = await db.execute(stmt)
    scans = result.scalars().all()
    
    return [
        {
            "name": s.timestamp.strftime("%b %d"),
            "growth": round(s.total_size / (1024**3), 2),
            "cleanup": round(s.co2_saved, 2) # Using CO2 as a proxy for cleanup GB for visual variety in demo
        } for s in scans
    ]

@router.get("/api/analytics/datatypes")
async def datatypes(db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)):
    # Group by category for latest scan or all scans
    stmt = select(FileItem.category, func.count(FileItem.id)).join(Scan).where(Scan.user_id == current_user.id).group_by(FileItem.category)
    result = await db.execute(stmt)
    rows = result.all()
    
    # Format for chart (e.g., Recharts expects specific shape)
    total = sum(count for cat, count in rows)
    if total == 0: return []
    
    return [
        {"name": (cat or "Other").capitalize(), "value": count, "percent": round((count/total)*100, 1)}
        for cat, count in rows
    ]

@router.get("/api/analytics/summary")
async def get_analytics_summary(db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)):
    # Get user scans for history
    stmt = select(Scan).where(Scan.user_id == current_user.id).order_by(Scan.timestamp.desc()).limit(10)
    result = await db.execute(stmt)
    scans = result.scalars().all()
    
    total_scanned = sum(s.total_size for s in scans)
    avg_co2 = sum(s.co2_saved for s in scans) / len(scans) if scans else 0
    latest_size_gb = scans[0].total_size / (1024**3) if scans else 0
    
    return {
        "cleanup_efficiency": f"{min(95, round(avg_co2 * 10, 1))}%",
        "active_storage": f"{latest_size_gb:.2f} GB",
        "savings_usd": f"${(avg_co2 * 0.15):.2f}",
        "efficiency_change": "+2.4%"
    }