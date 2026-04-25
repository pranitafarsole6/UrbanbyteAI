from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import func
from app.database.models import User, Scan

async def eco_metrics(db: AsyncSession, user_id: int):
    # Get user profile metrics
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalars().first()
    
    # Get cumulative scan metrics
    scan_stmt = select(
        func.sum(Scan.total_size).label("total_size"),
        func.sum(Scan.co2_saved).label("co2_saved")
    ).where(Scan.user_id == user_id)
    scan_result = await db.execute(scan_stmt)
    scan_row = scan_result.first()
    
    total_scanned = scan_row.total_size or 0
    total_co2 = scan_row.co2_saved or 0

    return {
        "score": user.eco_score or 0,
        "scoreChange": "+2%",
        "metrics": [
            {"label": "Digital Carbon Footprint", "value": f"{total_co2:.2f} kg", "unit": "CO2e", "icon": "Cloud"},
            {"label": "Total Data Scanned", "value": f"{(total_scanned / (1024**3)):.1f}", "unit": "GB", "icon": "HardDrive"},
            {"label": "Eco Points Earned", "value": f"{user.points or 0:,}", "unit": "Points", "icon": "Star"}
        ]
    }