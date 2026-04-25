from pydantic import BaseModel

class FileModel(BaseModel):
    path: str
    size: int
    category: str
    hash: str | None = None