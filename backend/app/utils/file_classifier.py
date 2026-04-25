def classify_file(file_path):

    images = (".png",".jpg",".jpeg",".gif")
    videos = (".mp4",".mkv",".avi")
    docs = (".pdf",".doc",".docx",".txt")

    if file_path.endswith(images):
        return "image"

    if file_path.endswith(videos):
        return "video"

    if file_path.endswith(docs):
        return "document"

    return "other"