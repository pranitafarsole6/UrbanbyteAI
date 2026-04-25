import asyncio
from sqlalchemy.ext.asyncio import create_async_engine
from app.database.models import Base
from app.database.db import DATABASE_URL
import os
from dotenv import load_dotenv
from sqlalchemy import text

load_dotenv()

async def init_models():
    # 1. Create the database if it doesn't exist
    # We need to connect to mysql without a specific DB first
    base_url = DATABASE_URL.rsplit('/', 1)[0]
    db_name = DATABASE_URL.rsplit('/', 1)[1]
    
    admin_engine = create_async_engine(base_url, echo=True)
    async with admin_engine.begin() as conn:
        await conn.execute(text(f"CREATE DATABASE IF NOT EXISTS {db_name}"))
    await admin_engine.dispose()
    
    print(f"Database '{db_name}' ensured.")

    # 2. Create tables
    engine = create_async_engine(DATABASE_URL, echo=True)
    async with engine.begin() as conn:
        # await conn.run_sync(Base.metadata.drop_all) # Careful!
        await conn.run_sync(Base.metadata.create_all)
    await engine.dispose()
    
    print("Database tables created successfully.")

if __name__ == "__main__":
    asyncio.run(init_models())
