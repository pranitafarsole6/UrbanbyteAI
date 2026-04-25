import os
import uuid
import hashlib
from app.database.db import async_session, scan_jobs
from app.database.models import Scan, FileItem, User
from app.utils.file_classifier import classify_file
from sqlalchemy.future import select

def get_file_hash(file_path):
    hash_md5 = hashlib.md5()
    try:
        with open(file_path, "rb") as f:
            for chunk in iter(lambda: f.read(4096), b""):
                hash_md5.update(chunk)
        return hash_md5.hexdigest()
    except Exception:
        return None

async def scan_directory(path, job_id, user_id=None):
    if not os.path.exists(path):
        scan_jobs[job_id]["status"] = "failed"
        scan_jobs[job_id]["error"] = "Path does not exist"
        return

    async with async_session() as db:
        try:
            scan_jobs[job_id]["status"] = "counting"
            total_files = 0
            # Fast walk for counting
            for root, dirs, files in os.walk(path):
                total_files += len(files)

            if total_files == 0:
                scan_jobs[job_id]["progress"] = 100
                scan_jobs[job_id]["status"] = "completed"
                return

            scan_jobs[job_id]["status"] = "running"
            
            # Create Scan entry
            new_scan = Scan(user_id=user_id, total_size=0, files_count=0)
            db.add(new_scan)
            await db.flush() # Get scan.id

            scanned = 0
            total_size = 0
            for root, dirs, files in os.walk(path):
                for file in files:
                    full = os.path.join(root, file)
                    try:
                        # Skip very large files or errors to avoid hanging
                        size = os.path.getsize(full)
                        category = classify_file(full)
                        
                        f_item = FileItem(
                            scan_id=new_scan.id,
                            path=full,
                            size=size,
                            category=category,
                            file_hash=get_file_hash(full) if size < 50 * 1024 * 1024 else None # Only hash files < 50MB for performance
                        )
                        db.add(f_item)
                        total_size += size
                    except Exception:
                        continue
                    finally:
                        scanned += 1
                        # Update progress every 10 files or on small sets to reduce overhead
                        if scanned % 10 == 0 or scanned == total_files:
                            scan_jobs[job_id]["progress"] = int((scanned / total_files) * 100)
            
            # Update Scan summary
            new_scan.total_size = total_size
            new_scan.files_count = scanned
            
            # Calculate metrics (simplified for now)
            new_scan.potential_savings = total_size * 0.1 # Mock 10%
            new_scan.co2_saved = (total_size / (1024**3)) * 0.5 # 0.5kg per GB
            
            await db.commit()
            
            # Award points and check milestones
            from app.services.milestone_service import award_points, check_and_record_milestones
            if user_id:
                async with async_session() as m_db:
                    await award_points(user_id, 50, m_db) # 50 points per scan
                    await check_and_record_milestones(user_id, m_db)

            scan_jobs[job_id]["status"] = "completed"
            print(f"Job {job_id} completed. Saved {scanned} files to DB.")
            
        except Exception as e:
            await db.rollback()
            print(f"Scan failed for job {job_id}: {str(e)}")
            scan_jobs[job_id]["status"] = "failed"
            scan_jobs[job_id]["error"] = str(e)

async def scan_cloud_files(files_data, job_id, user_id=None):
    """
    Processes metadata for cloud files (e.g. from Google Drive) and saves to database.
    """
    async with async_session() as db:
        try:
            total_files = len(files_data)
            if total_files == 0:
                scan_jobs[job_id]["progress"] = 100
                scan_jobs[job_id]["status"] = "completed"
                return

            scan_jobs[job_id]["status"] = "running"
            
            new_scan = Scan(user_id=user_id, total_size=0, files_count=0)
            db.add(new_scan)
            await db.flush()

            scanned = 0
            total_size = 0
            for f in files_data:
                try:
                    size = int(f.get("size", 0))
                    # Cloud files use IDs instead of paths for many operations, but we store 'path' for UI
                    name = f.get("name", "Unknown")
                    file_id = f.get("id")
                    
                    # Mock category classification based on name for cloud files
                    category = classify_file(name)
                    
                    f_item = FileItem(
                        scan_id=new_scan.id,
                        path=f"cloud://drive/{file_id}/{name}", # Virtual path
                        size=size,
                        category=category,
                        file_hash=f.get("md5Checksum") # GDrive provides this!
                    )
                    db.add(f_item)
                    total_size += size
                except Exception:
                    continue
                finally:
                    scanned += 1
                    if scanned % 10 == 0 or scanned == total_files:
                        scan_jobs[job_id]["progress"] = int((scanned / total_files) * 100)
            
            new_scan.total_size = total_size
            new_scan.files_count = scanned
            new_scan.potential_savings = total_size * 0.15 # Higher savings for cloud digital waste
            new_scan.co2_saved = (total_size / (1024**3)) * 0.5 
            
            await db.commit()
            
            from app.services.milestone_service import award_points, check_and_record_milestones
            if user_id:
                async with async_session() as m_db:
                    await award_points(user_id, 75, m_db) # 75 points for cloud scan
                    await check_and_record_milestones(user_id, m_db)

            scan_jobs[job_id]["status"] = "completed"
            
        except Exception as e:
            await db.rollback()
            scan_jobs[job_id]["status"] = "failed"
            scan_jobs[job_id]["error"] = str(e)