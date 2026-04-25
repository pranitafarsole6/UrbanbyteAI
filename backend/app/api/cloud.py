import asyncio
from fastapi import APIRouter, HTTPException, Depends
from app.services.drive_service import connect_drive, list_drive_files, delete_drive_file
from app.services.dropbox_service import connect_dropbox, list_dropbox_files
import app.database.db as db_module


router = APIRouter()

from app.api.auth import get_current_user
from app.database.models import User
from app.database.db import get_db, async_session
from sqlalchemy.ext.asyncio import AsyncSession

@router.get("/api/cloud/connect")
async def connect(db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)):
    try:
        # Pass existing token if any, but connect_drive will run flow if needed
        service, token_json = await asyncio.to_thread(connect_drive, current_user.google_drive_token)
        
        # Save token to user
        current_user.google_drive_token = token_json
        current_user.google_drive_connected = True
        await db.commit()
        
        return {"message": "Google Drive connected successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to connect: {str(e)}")



@router.get("/api/cloud/files")
async def get_drive_files(current_user: User = Depends(get_current_user)):
    if not current_user.google_drive_token:
        return {"error": "Drive not connected"}

    try:
        service, _ = await asyncio.to_thread(connect_drive, current_user.google_drive_token)
        files = await asyncio.to_thread(list_drive_files, service)
        return {"files": files}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch files: {str(e)}")


@router.get("/api/cloud/dropbox/connect")
def connect_dbx():
    try:
        session = connect_dropbox()
        return {"message": "Dropbox connected", "user": session.get("name", "Unknown")}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/api/cloud/dropbox/files")
def get_dbx_files():
    try:
        files = list_dropbox_files("mock_token")
        return {"files": files}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/api/cloud/delete/{file_id}")
async def delete_file(file_id: str, current_user: User = Depends(get_current_user)):
    if not current_user.google_drive_token:
        return {"error": "Drive not connected"}

    try:
        service, _ = await asyncio.to_thread(connect_drive, current_user.google_drive_token)
        res = await asyncio.to_thread(delete_drive_file, service, file_id)
        return res
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))