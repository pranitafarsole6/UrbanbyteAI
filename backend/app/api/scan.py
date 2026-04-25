import uuid
import threading
import os
import shutil
import asyncio
from fastapi import APIRouter, Body, UploadFile, File, Depends
from typing import List

from app.database.db import scan_jobs
from app.services.scanner_service import scan_directory

router = APIRouter()

SOURCE = {"path":None}
UPLOAD_DIR = "app/uploads"

if not os.path.exists(UPLOAD_DIR):
    os.makedirs(UPLOAD_DIR)


@router.post("/api/upload")
def configure_source(path:str):

    SOURCE["path"] = path

    return {"message":"source configured","path":path}


from app.api.auth import get_current_user
from app.database.models import User

@router.post("/api/scan/start")
async def start_scan(payload: dict = Body(...), current_user: User = Depends(get_current_user)):
    directory = payload.get("directory")
    if not directory:
        directory = SOURCE["path"]
    
    if not directory:
        return {"error": "No directory configured or provided"}

    job_id = str(uuid.uuid4())

    scan_jobs[job_id] = {
        "status":"running",
        "progress":0
    }

    user_id = current_user.id

    def run_scan():
        asyncio.run(scan_directory(directory, job_id, user_id))

    thread = threading.Thread(target=run_scan)
    thread.start()

    return {"jobId":job_id}



@router.post("/api/scan/upload")
async def upload_and_scan(files: List[UploadFile] = File(...), current_user: User = Depends(get_current_user)):
    job_id = str(uuid.uuid4())
    
    # Save files to temp upload dir
    job_dir = os.path.join(UPLOAD_DIR, job_id)
    os.makedirs(job_dir, exist_ok=True)
    
    def save_all_files():
        for file in files:
            file_path = os.path.join(job_dir, file.filename)
            with open(file_path, "wb") as buffer:
                # Synchronous copy is safer here for spooled temp files
                shutil.copyfileobj(file.file, buffer)

    # Offload the entire blocking operation to one thread
    await asyncio.to_thread(save_all_files)
            
    scan_jobs[job_id] = {
        "status":"running",
        "progress":0
    }

    print(f"Starting upload scan for job {job_id} for user {current_user.email}")
    
    def run_scan():
        asyncio.run(scan_directory(job_dir, job_id, current_user.id))

    thread = threading.Thread(target=run_scan)
    thread.start()

    return {"jobId": job_id, "fileCount": len(files)}


@router.post("/api/scan/cloud")
async def start_cloud_scan(payload: dict = Body(...), current_user: User = Depends(get_current_user)):
    files_data = payload.get("files", [])
    if not files_data:
        return {"error": "No files provided for cloud scan"}

    job_id = str(uuid.uuid4())
    scan_jobs[job_id] = {
        "status": "running",
        "progress": 0
    }

    from app.services.scanner_service import scan_cloud_files
    
    def run_scan():
        asyncio.run(scan_cloud_files(files_data, job_id, current_user.id))

    thread = threading.Thread(target=run_scan)
    thread.start()

    return {"jobId": job_id}


@router.get("/api/scan/status/{job_id}")
def status(job_id:str):
    job = scan_jobs.get(job_id)
    if not job:
        return {"error": "Job not found", "status": "failed"}
    return job