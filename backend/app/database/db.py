import os
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import NullPool
from dotenv import load_dotenv

load_dotenv()

# Default to a placeholder if not provided
# User needs to provide this in a .env file
# NOTE: If your password contains special characters like '@', you MUST URL-encode them.
# Example: '@' becomes '%40'.
DATABASE_URL = os.getenv("DATABASE_URL", "mysql+aiomysql://root:root123@localhost:3306/ecobyte")
engine = create_async_engine(DATABASE_URL, echo=True, poolclass=NullPool)
async_session = sessionmaker(
    engine, class_=AsyncSession, expire_on_commit=False
)

async def get_db():
    async with async_session() as session:
        yield session

# Temporary in-memory state for active scans
scan_jobs = {}
ignored_paths = []
settings = {
    "large_file_threshold_mb": 50
}