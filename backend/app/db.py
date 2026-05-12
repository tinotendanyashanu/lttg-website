"""Motor database handle (set on app.state in lifespan)."""

from motor.motor_asyncio import AsyncIOMotorClient, AsyncIOMotorDatabase


def get_database(client: AsyncIOMotorClient, db_name: str) -> AsyncIOMotorDatabase:
    return client[db_name]
