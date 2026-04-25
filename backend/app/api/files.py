from fastapi import APIRouter, HTTPException, Depends, Body
from fastapi.responses import FileResponse
import os
import asyncio
from pydantic import BaseModel
from typing import List
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, or_, func
from app.database.db import get_db
import app.database.db as db_module
from app.api.auth import get_current_user
from app.database.models import User, FileItem, Scan
from app.services.milestone_service import award_points, check_and_record_milestones
from app.services.drive_service import connect_drive, list_drive_files, delete_drive_file, list_trashed_files, restore_drive_file, delete_permanently
from app.services.duplicate_service import find_drive_duplicates

router = APIRouter()

class DeleteRequest(BaseModel):
    files: List[str]

@router.get("/api/files/view")
def view_file(path: str, current_user: User = Depends(get_current_user)):
    if not os.path.exists(path):
        raise HTTPException(status_code=404, detail="File not found")
    return FileResponse(path)

@router.post("/api/files/delete")
async def delete_files(request: DeleteRequest, db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)):
    deleted_count = 0
    total_reclaimed_size = 0
    failed_files = []

    for f_path in request.files:
        try:
            success = False
            file_size = 0
            file_id = None
            
            # Extract file_id early if it's a cloud path
            if f_path.startswith("cloud://drive/"):
                parts = f_path.replace("cloud://drive/", "").split("/")
                if len(parts) >= 1:
                    file_id = parts[0]

            # Improved path lookup: Try exact, normalized, and cloud-drive specific matches
            stmt = select(FileItem).join(Scan).where(
                Scan.user_id == current_user.id,
                or_(
                    FileItem.path == f_path,
                    FileItem.path == f_path.replace('\\', '/'),
                    FileItem.path == f_path.replace('/', '\\'),
                    FileItem.path.like(f"%{file_id}%") if file_id else False
                )
            )
            res = await db.execute(stmt)
            all_matches = res.scalars().all()
            file_item = None
            if all_matches:
                file_item = all_matches[0]
                # Best match: exact or normalized
                for m in all_matches:
                    if m.path == f_path or m.path.replace('\\', '/') == f_path.replace('\\', '/'):
                        file_item = m
                        break
            
            if file_item:
                file_size = file_item.size
            elif os.path.exists(f_path):
                file_size = os.path.getsize(f_path)

            if file_id:
                    
                    if not current_user.google_drive_token:
                        failed_files.append({"path": f_path, "reason": "Drive not connected"})
                        continue
                        
                    try:
                        print(f"DEBUG: Connecting to Drive for file_id: {file_id}")
                        service, _ = await asyncio.to_thread(connect_drive, current_user.google_drive_token)
                        print(f"DEBUG: Drive service created, deleting {file_id}")
                        res_drive = await asyncio.to_thread(delete_drive_file, service, file_id)
                        print(f"DEBUG: Drive deletion result: {res_drive}")
                        
                        if "error" not in res_drive:
                            success = True
                        else:
                            failed_files.append({"path": f_path, "reason": res_drive["error"]})
                    except Exception as e:
                        print(f"DEBUG: Failed to connect or delete from drive: {e}")
                        failed_files.append({"path": f_path, "reason": f"Drive error: {str(e)}"})
            elif os.path.exists(f_path):
                # Now we don't remove, we just mark as trashed in DB
                success = True
            else:
                failed_files.append({"path": f_path, "reason": "File does not exist"})

            if success:
                deleted_count += 1
                total_reclaimed_size += file_size
                # Synchronize with database
                if file_item:
                    file_item.is_trashed = True
                    file_item.trashed_at = func.now()
                elif os.path.exists(f_path):
                    # For local files not in DB, we should still handle them if possible
                    # but for now we just track the success
                    pass
                
        except Exception as e:
            print(f"Failed to delete {f_path}: {e}")
            failed_files.append({"path": f_path, "reason": str(e)})
            continue

    if deleted_count > 0:
        await db.commit()
        points_earned = (deleted_count * 10) + int(total_reclaimed_size / (1024 * 1024))
        await award_points(current_user.id, points_earned, db)
        await check_and_record_milestones(current_user.id, db)

    reclaimed_str = f"{(total_reclaimed_size / (1024 * 1024)):.1f} MB" if total_reclaimed_size < 1024**3 else f"{(total_reclaimed_size / (1024**3)):.1f} GB"

    return {
        "success": len(failed_files) == 0,
        "deleted_count": deleted_count,
        "failed_count": len(failed_files),
        "failed_files": failed_files,
        "detailed_results": {
            "reclaimed_bytes": total_reclaimed_size,
            "reclaimed_str": reclaimed_str,
            "error_detail": failed_files[0]["reason"] if failed_files else None
        }
    }



@router.post("/api/files/drive/delete")
async def delete_drive_files_batch(ids: list, current_user: User = Depends(get_current_user)):
    if not current_user.google_drive_token:
        raise HTTPException(status_code=400, detail="Drive not connected")

    try:
        service, _ = await asyncio.to_thread(connect_drive, current_user.google_drive_token)
        for file_id in ids:
            await asyncio.to_thread(delete_drive_file, service, file_id)
        return {"status": "Deleted"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/api/files/drive/trash")
async def get_combined_trash(db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)):
    # 1. Get Local trashed files from DB
    stmt = select(FileItem).join(Scan).where(
        Scan.user_id == current_user.id,
        FileItem.is_trashed == True
    )
    res = await db.execute(stmt)
    local_trashed = res.scalars().all()
    
    files = []
    for f in local_trashed:
        files.append({
            "id": f.id,
            "name": os.path.basename(f.path),
            "path": f.path,
            "size": f.size,
            "type": "local",
            "trashed_at": f.trashed_at
        })

    # 2. Get Drive trashed files
    drive_files = []
    if current_user.google_drive_token:
        try:
            service, _ = await asyncio.to_thread(connect_drive, current_user.google_drive_token)
            drive_files = await asyncio.to_thread(list_trashed_files, service)
        except Exception as e:
            print(f"Error fetching drive trash: {e}")
            
    for df in drive_files:
        files.append({
            "id": df.get("id"),
            "name": df.get("name"),
            "size": int(df.get("size", 0)),
            "type": "drive",
            "trashed_at": df.get("modifiedTime")
        })
        
    return {"files": files}

@router.post("/api/files/drive/restore")
async def restore_files(request: DeleteRequest, db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)):
    restored = 0
    service = None
    if current_user.google_drive_token:
        try:
            service, _ = await asyncio.to_thread(connect_drive, current_user.google_drive_token)
        except:
            pass

    for file_id_or_path in request.files:
        # Check if it's a Drive ID or local path/ID
        if file_id_or_path.startswith("cloud://") or (not os.path.isabs(file_id_or_path) and len(file_id_or_path) > 10):
             # Likely Drive ID or cloud path
             if service:
                fid = file_id_or_path.split("/")[-2] if "cloud://" in file_id_or_path else file_id_or_path
                res = await asyncio.to_thread(restore_drive_file, service, fid)
                if res.get("success"):
                    restored += 1
        
        # Always check DB for local restoration
        stmt = select(FileItem).join(Scan).where(
            Scan.user_id == current_user.id,
            or_(FileItem.id == file_id_or_path, FileItem.path == file_id_or_path)
        )
        res = await db.execute(stmt)
        item = res.scalars().first()
        if item and item.is_trashed:
            item.is_trashed = False
            item.trashed_at = None
            restored += 1
            
    await db.commit()
    return {"success": True, "restored_count": restored}

@router.post("/api/files/drive/empty-trash")
async def empty_trash(request: DeleteRequest = None, db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)):
    deleted = 0
    files_to_delete = request.files if request else []
    service = None
    if current_user.google_drive_token:
        try:
            service, _ = await asyncio.to_thread(connect_drive, current_user.google_drive_token)
        except:
            pass
    
    if not files_to_delete:
        return {"success": False, "detail": "List of file IDs/paths required"}

    for item_id in files_to_delete:
        # 1. Try Drive permanent delete
        if service:
             # Check if it looks like a Drive ID
             if not os.path.isabs(item_id) or item_id.startswith("cloud://"):
                fid = item_id.split("/")[-2] if "cloud://" in item_id else item_id
                res = await asyncio.to_thread(delete_permanently, service, fid)
                if not res.get("error"):
                    deleted += 1

        # 2. Try Local permanent delete
        stmt = select(FileItem).join(Scan).where(
            Scan.user_id == current_user.id,
            or_(FileItem.id == item_id, FileItem.path == item_id)
        )
        res = await db.execute(stmt)
        item = res.scalars().first()
        if item:
            if os.path.exists(item.path):
                try:
                    os.remove(item.path)
                except Exception as e:
                    print(f"FileSystem deletion failed for {item.path}: {e}")
            
            await db.delete(item)
            deleted += 1
            
    await db.commit()
    return {"success": True, "deleted_permanently_count": deleted}