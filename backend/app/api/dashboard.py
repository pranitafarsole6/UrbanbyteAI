from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import func
from app.database.db import get_db
from app.database.models import User, Scan, FileItem
from app.api.auth import get_current_user
from app.utils.size_utils import bytes_to_gb, bytes_to_mb

router = APIRouter()

@router.get("/api/dashboard/stats")
async def stats(db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)):
    # Get the latest scan for the user
    latest_scan_stmt = select(Scan).where(Scan.user_id == current_user.id).order_by(Scan.timestamp.desc()).limit(1)
    latest_scan_res = await db.execute(latest_scan_stmt)
    latest_scan = latest_scan_res.scalars().first()
    
    if not latest_scan:
        return {
            "stats": [
                {"id": "total_files", "title": "Total Files", "value": "0", "change": "No scans yet"},
                {"id": "total_size", "title": "Total Size", "value": "0 GB", "change": ""},
                {"id": "images", "title": "Images", "value": "0", "change": "--"},
                {"id": "videos", "title": "Videos", "value": "0", "change": "--"},
                {"id": "docs", "title": "Documents", "value": "0", "change": "--"}
            ],
            "categories": {}
        }

    total_files = latest_scan.files_count or 0
    total_size = latest_scan.total_size or 0
    
    # Categories counts for the LATEST scan only
    cat_stmt = select(FileItem.category, func.count(FileItem.id)).where(FileItem.scan_id == latest_scan.id).group_by(FileItem.category)
    cat_result = await db.execute(cat_stmt)
    categories = {cat: count for cat, count in cat_result.all()}

    # Trend data from analytics service
    from app.services.analytics_service import get_monthly_storage_trend
    trend = await get_monthly_storage_trend(db, current_user.id)

    return {
        "stats": [
            {"id": "total_files", "title": "Total Files", "value": f"{total_files:,}", "change": "Latest Scan"},
            {"id": "total_size", "title": "Total Size", "value": f"{bytes_to_gb(total_size)} GB", "change": "Latest Scan"},
            {"id": "images", "title": "Images", "value": f"{categories.get('image', 0):,}", "change": "--"},
            {"id": "videos", "title": "Videos", "value": f"{categories.get('video', 0):,}", "change": "--"},
            {"id": "docs", "title": "Documents", "value": f"{categories.get('document', 0):,}", "change": "--"}
        ],
        "categories": categories,
        "trend": trend
    }

@router.get("/api/dashboard/ai-insights")
async def ai_insights(db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)):
    from app.services.duplicate_service import find_duplicates
    from app.services.image_similarity_service import find_similar_images
    from app.database.db import settings
    
    threshold = settings["large_file_threshold_mb"]*1024*1024
    
    duplicates = await find_duplicates(db, current_user.id)
    similar = await find_similar_images(db, current_user.id)
    
    # Large files and Junk from DB
    large_stmt = select(FileItem).join(Scan).where(Scan.user_id == current_user.id, FileItem.size > threshold)
    large_res = await db.execute(large_stmt)
    large = large_res.scalars().all()
    
    junk_stmt = select(FileItem).join(Scan).where(
        Scan.user_id == current_user.id, 
        FileItem.path.op('REGEXP')(r'\.(tmp|log|bak)$|~') # Simple regex for junk
    )
    # MySQL REGEXP might differ, fallback to simple endswith if needed or use SQLAlchemy correctly
    # Let's use ILIKE for common junk extensions for better compatibility
    from sqlalchemy import or_
    junk_stmt = select(FileItem).join(Scan).where(
        Scan.user_id == current_user.id,
        or_(
            FileItem.path.ilike('%.tmp'),
            FileItem.path.ilike('%.log'),
            FileItem.path.ilike('%.bak')
        )
    )
    junk_res = await db.execute(junk_stmt)
    junk = junk_res.scalars().all()
    
    def format_size(size_bytes):
        if size_bytes < 1024*1024*1024:
            return f"{bytes_to_mb(size_bytes)} MB"
        return f"{bytes_to_gb(size_bytes)} GB"

    insights = []
    
    if duplicates:
        dup_size = sum(f["size"] for group in duplicates for f in group[1:])
        insights.append({
            "title": "Duplicate Cleanup",
            "desc": f"{format_size(dup_size)} of duplicate files found",
            "action": "Review Duplicates",
            "link": "/duplicates"
        })
        
    if large:
        large_size = sum(f.size for f in large)
        insights.append({
            "title": "Large Files",
            "desc": f"Save {format_size(large_size)} by managing large files",
            "action": "View Large Files",
            "link": "/large-files"
        })

    if similar:
        sim_size = sum(f["size"] for group in similar for f in group[1:])
        insights.append({
            "title": "Similar Images",
            "desc": f"{format_size(sim_size)} of visually similar photos detected",
            "action": "View Images",
            "link": "/similar-images"
        })

    if junk:
        junk_size = sum(f.size for f in junk)
        insights.append({
            "title": "Junk Removal",
            "desc": f"Clear {format_size(junk_size)} of unused temporary data",
            "action": "Clean Junk",
            "link": "/junk"
        })
        
    if not insights:
        insights = [
            {
                "title": "Smart Compression",
                "desc": "No issues found! Keep scanning to find optimization opportunities",
                "action": "New Scan",
                "link": "/scanner"
            }
        ]

    return insights
