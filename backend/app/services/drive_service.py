import os
from google_auth_oauthlib.flow import InstalledAppFlow
from googleapiclient.discovery import build
from google.auth.transport.requests import Request
from google.oauth2.credentials import Credentials

SCOPES = ['https://www.googleapis.com/auth/drive']
BACKEND_DIR = os.path.dirname(os.path.dirname(__file__))
CREDENTIALS_PATH = os.path.join(BACKEND_DIR, "Credentials.json")
TOKEN_PATH = os.path.join(BACKEND_DIR, "token.json")

def connect_drive(token_json=None):
    """
    Initializes the Google Drive service using OAuth2 flow.
    If token_json is provided, it uses that. Otherwise, checks local token.json or runs flow.
    """
    creds = None
    
    if token_json:
        # Load from provided JSON string
        import json
        token_data = json.loads(token_json)
        creds = Credentials.from_authorized_user_info(token_data, SCOPES)
    elif os.path.exists(TOKEN_PATH):
        creds = Credentials.from_authorized_user_file(TOKEN_PATH, SCOPES)
    
    # If there are no (valid) credentials available, let the user log in.
    if not creds or not creds.valid:
        if creds and creds.expired and creds.refresh_token:
            creds.refresh(Request())
        else:
            if not os.path.exists(CREDENTIALS_PATH):
                raise FileNotFoundError(f"Credentials file not found at {CREDENTIALS_PATH}")
            
            flow = InstalledAppFlow.from_client_secrets_file(
                CREDENTIALS_PATH,
                SCOPES
            )
            creds = flow.run_local_server(port=0)
    
    service = build('drive', 'v3', credentials=creds)
    # Return both service and the token JSON for storage
    return service, creds.to_json()

def list_drive_files(service):
    """
    Lists all files owned by the user in Google Drive.
    """
    files = []
    page_token = None

    while True:
        results = service.files().list(
            pageSize=1000,
            fields="nextPageToken, files(id, name, size, md5Checksum, mimeType, owners)",
            pageToken=page_token
        ).execute()

        items = results.get("files", [])

        for f in items:
            # Check if user is the owner
            if f.get("owners") and f["owners"][0].get("me"):
                files.append(f)

        page_token = results.get("nextPageToken")
        if not page_token:
            break

    return files

def delete_drive_file(service, file_id):
    """
    Moves a file to the trash in Google Drive.
    """
    try:
        service.files().update(
            fileId=file_id,
            body={"trashed": True}
        ).execute()
        return {"message": f"File {file_id} moved to trash"}
    except Exception as e:
        return {"error": str(e)}

def delete_permanently(service, file_id):
    """
    Permanently deletes a file from Google Drive.
    """
    try:
        service.files().delete(
            fileId=file_id
        ).execute()
        return {"message": f"File {file_id} deleted permanently"}
    except Exception as e:
        return {"error": str(e)}

def list_trashed_files(service):
    """
    Lists all files in the trash bin of Google Drive.
    """
    files = []
    page_token = None
    try:
        while True:
            results = service.files().list(
                q="trashed = true",
                pageSize=1000,
                fields="nextPageToken, files(id, name, size, mimeType, modifiedTime)",
                pageToken=page_token
            ).execute()

            items = results.get("files", [])
            files.extend(items)

            page_token = results.get("nextPageToken")
            if not page_token:
                break
        return files
    except Exception as e:
        print(f"Error listing trashed files: {e}")
        return []

def restore_drive_file(service, file_id):
    """
    Restores a file from the trash in Google Drive.
    """
    try:
        service.files().update(
            fileId=file_id,
            body={"trashed": False}
        ).execute()
        return {"success": True, "message": f"File {file_id} restored"}
    except Exception as e:
        return {"success": False, "error": str(e)}