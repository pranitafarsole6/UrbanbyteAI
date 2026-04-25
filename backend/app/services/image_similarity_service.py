import os
from collections import defaultdict
from PIL import Image
import imagehash
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from app.database.models import FileItem, Scan

MAX_IMAGE_SIZE = 10 * 1024 * 1024 # 10MB limit for analysis

async def find_similar_images(db: AsyncSession, user_id: int, scan_id: int = None):
    """
    Groups images based on their visual content using Difference Hashing (dHash).
    Name-agnostic visual clustering with performance safety limits.
    """
    # Fetch images for the user
    stmt = select(FileItem).join(Scan).where(
        Scan.user_id == user_id, 
        FileItem.category == 'image'
    )
    if scan_id:
        stmt = stmt.where(FileItem.scan_id == scan_id)
        
    result = await db.execute(stmt)
    images = result.scalars().all()
    
    hashes = {}
    for img in images:
        # Check if local file exists OR it is a cloud file (we skip visual hash for cloud for now but we want it listed)
        is_cloud = img.path.startswith("cloud://")
        if (is_cloud or os.path.exists(img.path)) and img.size < MAX_IMAGE_SIZE:
            try:
                # Use dHash only for local files for now
                if not is_cloud:
                    with Image.open(img.path) as i:
                        h = str(imagehash.dhash(i))
                        hashes[img.id] = h
                else:
                    # For cloud files, use MD5 as a primitive similarity or skip visual similarity
                    # Let's use MD5 if we want to group "duplicates" as "similar" too
                    if img.file_hash:
                        hashes[img.id] = f"md5_{img.file_hash}"
            except Exception:
                continue

    clusters = defaultdict(list)
    for img_id, h in hashes.items():
        clusters[h].append(img_id)

    # Convert back to list of lists with full data
    img_map = {img.id: img for img in images}
    result_clusters = []
    for h, ids in clusters.items():
        if len(ids) > 1:
            group = []
            for img_id in ids:
                img = img_map[img_id]
                group.append({
                    "id": img.id,
                    "path": img.path,
                    "size": img.size,
                    "category": img.category
                })
            result_clusters.append(group)
            
    return result_clusters