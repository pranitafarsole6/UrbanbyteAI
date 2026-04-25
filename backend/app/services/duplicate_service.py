from collections import defaultdict
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from app.database.models import FileItem, Scan
from app.utils.hash_utils import get_file_hash
import hashlib

async def find_duplicates(db: AsyncSession, user_id: int, scan_id: int = None):
    # Fetch files for the user
    stmt = select(FileItem).join(Scan).where(Scan.user_id == user_id)
    if scan_id:
        stmt = stmt.where(FileItem.scan_id == scan_id)
    
    result = await db.execute(stmt)
    files = result.scalars().all()
    
    # In a real app, we'd hash them during scan and store in DB
    # Since we didn't store hashes yet, we'll hash on the fly or just use size+name as heuristic
    # Let's use size+name for now to avoid re-reading massive files every time
    # TODO: Add 'hash' column to FileItem model
    
    # Group by hash for exact duplicates
    hash_groups = defaultdict(list)
    for f in files:
        if f.file_hash:
            hash_groups[f.file_hash].append({
                "path": f.path,
                "size": f.size,
                "category": f.category,
                "id": f.id
            })
        
    duplicates = []
    for h, group in hash_groups.items():
        if len(group) > 1:
            duplicates.append(group)
                    
    return duplicates

# For Google drive files (dict objects)
def find_drive_duplicates(files):
    hashes = {}
    duplicates = []

    for f in files:
        h = f.get("md5Checksum")
        if h:
            if h in hashes:
                duplicates.append(f)
            else:
                hashes[h] = f

    return duplicates