import uuid

def connect_dropbox():
    # Mocking Dropbox OAuth flow
    return {"access_token": str(uuid.uuid4()), "account_id": "dbid:AAE...", "name": "Eco user"}

def list_dropbox_files(token, limit=50):
    # Mocking file listing from Dropbox
    return [
        {"id": "id:1", "name": "Wedding_Photos.zip", "size": 1024 * 1024 * 450, "type": "application/zip"},
        {"id": "id:2", "name": "Taxes_2023.pdf", "size": 1024 * 1024 * 2, "type": "application/pdf"},
        {"id": "id:3", "name": "Vacation_Video.mp4", "size": 1024 * 1024 * 850, "type": "video/mp4"}
    ]
