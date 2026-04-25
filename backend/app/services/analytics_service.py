from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import func, extract
from app.database.models import Scan
from app.utils.size_utils import bytes_to_gb

async def get_monthly_storage_trend(db: AsyncSession, user_id: int):
    """
    Fetches average storage usage per month for the user.
    """
    # Group by month and year
    # We use extract for portability across major DBs (SQLite/Postgres/MySQL)
    trend_stmt = select(
        extract('month', Scan.timestamp).label('month'),
        extract('year', Scan.timestamp).label('year'),
        func.avg(Scan.total_size).label('avg_size')
    ).where(Scan.user_id == user_id).group_by('year', 'month').order_by('year', 'month')

    result = await db.execute(trend_stmt)
    rows = result.all()

    month_names = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
    
    trend = []
    for r in rows:
        m_idx = int(r.month) - 1
        trend.append({
            "month": f"{month_names[m_idx]}",
            "storage": bytes_to_gb(r.avg_size or 0)
        })

    # If no data, provide mock trend to show UI functionality (optional, but good for first time users)
    if not trend:
        # Just return some empty but labeled data points for the last 6 months
        return historical() # Fallback to mock for now if no scans exist

    return trend

def historical():
    return [
        {"month":"Oct","storage":110,"cleaned":5},
        {"month":"Nov","storage":120,"cleaned":8},
        {"month":"Dec","storage":135,"cleaned":12},
        {"month":"Jan","storage":150,"cleaned":15},
        {"month":"Feb","storage":165,"cleaned":20},
        {"month":"Mar","storage":180,"cleaned":30}
    ]


def datatype_distribution(files):
    result = {}
    for f in files:
        cat = f.get("category", "other")
        result[cat] = result.get(cat,0)+1
    return result

def analytics_summary(files):
    total_size = sum(f["size"] for f in files)
    total_gb = bytes_to_gb(total_size)
    # reclaimed_gb should come from DB in future, for now 0
    reclaimed_gb = 0
    
    efficiency = 0
    if total_gb > 0:
        efficiency = (reclaimed_gb / (total_gb + reclaimed_gb)) * 100
        
    return {
        "cleanup_efficiency": f"{round(efficiency, 1)}%",
        "active_storage": f"{total_gb} TB" if total_gb > 1000 else f"{total_gb} GB",
        "savings_usd": f"${round(reclaimed_gb * 0.5, 2)}",
        "efficiency_change": "+0.0%"
    }