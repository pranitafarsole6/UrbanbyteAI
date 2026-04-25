from fastapi import APIRouter
from app.database.db import settings

router = APIRouter()

@router.get("/api/settings")
def get_settings():

    return settings