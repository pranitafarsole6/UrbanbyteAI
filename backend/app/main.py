from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import os

# from app.api import files

from app.api import scan, dashboard, insights, files, sustainability, analytics, settings, cloud, auth

app = FastAPI(title="Storage Intelligence API")

# Mount uploads directory to serve images
uploads_dir = os.path.join(os.path.dirname(__file__), "uploads")
if not os.path.exists(uploads_dir):
    os.makedirs(uploads_dir)
app.mount("/uploads", StaticFiles(directory=uploads_dir), name="uploads")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(scan.router)
app.include_router(dashboard.router)
app.include_router(insights.router)
app.include_router(files.router)
app.include_router(sustainability.router)
app.include_router(analytics.router)
app.include_router(settings.router)
app.include_router(cloud.router)
app.include_router(auth.router)
# app.include_router(files.router)