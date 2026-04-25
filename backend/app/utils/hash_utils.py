import hashlib

def get_file_hash(path):

    sha256 = hashlib.sha256()

    try:
        with open(path,"rb") as f:
            while chunk := f.read(8192):
                sha256.update(chunk)
    except:
        return None

    return sha256.hexdigest()