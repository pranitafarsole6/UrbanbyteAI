from pydantic import BaseModel

class ScanJob(BaseModel):
    job_id: str
    status: str
    progress: int