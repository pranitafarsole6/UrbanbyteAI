import asyncio
from sqlalchemy.ext.asyncio import create_async_engine

async def test_conn():
    url = "mysql+aiomysql://root:WorkConnection%4080@localhost:3306/ecobyte_db"
    engine = create_async_engine(url, echo=True)
    try:
        async with engine.connect() as conn:
            print("Successfully connected to the database!")
            result = await conn.execute("SELECT 1")
            print(f"Query result: {result.fetchone()}")
    except Exception as e:
        print(f"Connection failed: {e}")
    finally:
        await engine.dispose()

if __name__ == "__main__":
    asyncio.run(test_conn())
