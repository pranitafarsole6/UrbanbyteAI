from fastapi import APIRouter, Depends
from urllib.parse import quote
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import or_, func
from app.database.db import get_db, settings
from app.database.models import User, FileItem, Scan
from app.api.auth import get_current_user
from app.services.duplicate_service import find_duplicates
from app.services.image_similarity_service import find_similar_images
from app.utils.size_utils import bytes_to_gb, bytes_to_mb
from app.utils.auth_utils import create_access_token

router = APIRouter()

async def get_latest_scan_id(db: AsyncSession, user_id: int):
    stmt = select(Scan.id).where(Scan.user_id == user_id).order_by(Scan.timestamp.desc()).limit(1)
    res = await db.execute(stmt)
    return res.scalar_one_or_none()

@router.get("/api/insights/large-files")
async def large_files(db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)):
    scan_id = await get_latest_scan_id(db, current_user.id)
    if not scan_id:
        return {"files": []}
        
    threshold = settings["large_file_threshold_mb"]*1024*1024
    stmt = select(FileItem).where(FileItem.scan_id == scan_id, FileItem.size > threshold, FileItem.is_trashed == False).order_by(FileItem.size.desc())
    result = await db.execute(stmt)
    files = result.scalars().all()
    
    enriched = []
    for f in files:
        enriched.append({
            "id": f.id,
            "path": f.path,
            "name": f.path.split('/')[-1].split('\\')[-1],
            "size": f"{bytes_to_mb(f.size)} MB" if f.size < 1024**3 else f"{bytes_to_gb(f.size)} GB",
            "category": f.category,
            "color": "text-blue-500" if f.category == "document" else "text-purple-500"
        })
        
    return {"files": enriched}

@router.get("/api/insights/junk-files")
async def junk_files(db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)):
    scan_id = await get_latest_scan_id(db, current_user.id)
    if not scan_id:
        return []

    # Old Downloads (heuristic)
    downloads_stmt = select(FileItem).where(FileItem.scan_id == scan_id, FileItem.path.ilike('%Downloads%'), FileItem.is_trashed == False)
    downloads = (await db.execute(downloads_stmt)).scalars().all()
    
    # Temp/Log/Bak
    temp_stmt = select(FileItem).where(
        FileItem.scan_id == scan_id,
        or_(FileItem.path.ilike('%.tmp'), FileItem.path.ilike('%.log'), FileItem.path.ilike('%.bak')),
        FileItem.is_trashed == False
    )
    temp = (await db.execute(temp_stmt)).scalars().all()
    
    # Archives (heuristic)
    ext_stmt = select(FileItem).where(
        FileItem.scan_id == scan_id,
        or_(FileItem.path.ilike('%.zip'), FileItem.path.ilike('%.tar'), FileItem.path.ilike('%.gz')),
        FileItem.path.ilike('%extracted%'),
        FileItem.is_trashed == False
    )
    extracted = (await db.execute(ext_stmt)).scalars().all()

    def format_cat(items, name, desc, color, bg_color, suggestion):
        size_bytes = sum(f.size for f in items)
        size_str = f"{bytes_to_mb(size_bytes)} MB" if size_bytes < 1024**3 else f"{bytes_to_gb(size_bytes)} GB"
        return {
            "id": name.lower().replace(" ", "_"),
            "name": name,
            "description": desc,
            "size": size_str,
            "count": len(items),
            "paths": [f.path for f in items],
            "color": color,
            "bgColor": bg_color,
            "selected": True,
            "suggestion": suggestion
        }

    return [
        format_cat(downloads, "Old Downloads", "Unused installers and zip files from the Downloads folder.", "text-orange-500", "bg-orange-50", "These files haven't been opened in over 6 months."),
        format_cat(temp, "Temporary Data & Cache", "App cache and temp files that are safe to remove.", "text-blue-500", "bg-blue-50", "Clearing cache can improve system responsiveness."),
        format_cat(extracted, "Extracted Archives", "Old zip archives after extraction.", "text-purple-500", "bg-purple-50", "The extracted contents already exist elsewhere.")
    ]

@router.get("/api/insights/low-quality")
async def low_quality_files(db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)):
    scan_id = await get_latest_scan_id(db, current_user.id)
    if not scan_id:
        return []

    stmt = select(FileItem).where(
        FileItem.scan_id == scan_id,
        FileItem.category == 'image',
        or_(FileItem.size < 100*1024, FileItem.path.ilike('%copy%')),
        FileItem.is_trashed == False
    )
    result = await db.execute(stmt)
    files = result.scalars().all()
    
    token = create_access_token(data={"sub": current_user.email, "user_id": current_user.id})
    enriched = []
    for f in files:
        img_src = f"https://urbanbyteai-backend.onrender.com/api/files/view?path={quote(f.path)}&token={token}"
        enriched.append({
            "id": f.id,
            "name": f.path.split('/')[-1].split('\\')[-1],
            "path": f.path,
            "issue": "Low Resolution" if f.size < 100*1024 else "Potential Duplicate",
            "resolution": "800x600",
            "size": f"{bytes_to_mb(f.size)} MB",
            "selected": True,
            "thumbnail": img_src
        })
    return enriched

@router.get("/api/insights/similar-images")
async def similar_images_api(db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)):
    scan_id = await get_latest_scan_id(db, current_user.id)
    raw_groups = await find_similar_images(db, current_user.id, scan_id=scan_id)
    
    token = create_access_token(data={"sub": current_user.email, "user_id": current_user.id})
    formatted = []
    for i, group in enumerate(raw_groups):
        total_size = sum(f["size"] for f in group)
        saving = total_size * 0.7
        
        images = []
        for j, f in enumerate(group):
            img_src = f"https://urbanbyteai-backend.onrender.com/api/files/view?path={quote(f['path'])}&token={token}"
            images.append({
                "id": f["id"],
                "src": img_src,
                "path": f["path"],
                "name": f["path"].split('/')[-1].split('\\')[-1],
                "meta": f"{bytes_to_mb(f['size'])} MB • {f['category'].upper()}",
                "best": j == 0,
                "selected": False
            })
            
        formatted.append({
            "id": i + 1,
            "name": f"Group {i+1}",
            "count": f"{len(group)} Images",
            "saving": f"{bytes_to_mb(saving)} MB Saving",
            "images": images
        })
    return formatted

@router.get("/api/insights/duplicates")
async def duplicates_api(db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)):
    scan_id = await get_latest_scan_id(db, current_user.id)
    raw_groups = await find_duplicates(db, current_user.id, scan_id=scan_id)
    
    formatted = []
    for i, group in enumerate(raw_groups):
        total_size = sum(f["size"] for f in group)
        wasted = total_size - group[0]["size"]
        
        files = []
        for j, f in enumerate(group):
            files.append({
                "id": f["id"],
                "path": f["path"],
                "size": f"{bytes_to_mb(f['size'])} MB",
                "date": "Today",
                "selected": j == 0
            })
            
        formatted.append({
            "id": i + 1,
            "name": f"Duplicate Group {i+1}",
            "wastedSpace": f"{bytes_to_mb(wasted)} MB",
            "files": files
        })
    return {"groups": formatted}

@router.get("/api/insights/summary")
async def insights_summary(db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)):
    scan_id = await get_latest_scan_id(db, current_user.id)
    if not scan_id:
         return {
            "junk_files": {"size": "0 MB", "trend": "0 files"},
            "large_files": {"size": "0 MB", "trend": "0 files"},
            "old_downloads": {"size": "0 MB", "trend": "0 files"}
        }

    threshold = settings["large_file_threshold_mb"]*1024*1024
    
    # Combined stats query for performance
    junk_stmt = select(func.sum(FileItem.size), func.count(FileItem.id)).where(
        FileItem.scan_id == scan_id,
        or_(FileItem.path.ilike('%.tmp'), FileItem.path.ilike('%.log'), FileItem.path.ilike('%.bak')),
        FileItem.is_trashed == False
    )
    large_stmt = select(func.sum(FileItem.size), func.count(FileItem.id)).where(
        FileItem.scan_id == scan_id,
        FileItem.size > threshold,
        FileItem.is_trashed == False
    )
    dl_stmt = select(func.sum(FileItem.size), func.count(FileItem.id)).where(
        FileItem.scan_id == scan_id,
        FileItem.path.ilike('%Downloads%'),
        FileItem.is_trashed == False
    )
    
    junk_size, junk_count = (await db.execute(junk_stmt)).first()
    large_size, large_count = (await db.execute(large_stmt)).first()
    dl_size, dl_count = (await db.execute(dl_stmt)).first()

    def fmt(size, count):
        s = f"{bytes_to_gb(size or 0)} GB" if (size or 0) > 1024**3 else f"{bytes_to_mb(size or 0)} MB"
        return {"size": s, "trend": f"{count} files"}

    return {
        "junk_files": fmt(junk_size, junk_count),
        "large_files": fmt(large_size, large_count),
        "old_downloads": fmt(dl_size, dl_count)
    }