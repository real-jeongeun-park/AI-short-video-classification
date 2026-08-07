from fastapi import APIRouter, UploadFile, File, HTTPException
from app.services.cloudinary_service import upload_image_to_cloudinary

router = APIRouter()

@router.post("/upload/image")
async def upload_image(file: UploadFile = File(...)):
    try:
        file_bytes = await file.read()
        url = upload_image_to_cloudinary(file_bytes)

        return {"url": url}

    except Exception as ex:
        raise HTTPException(status_code=500, detail=str(ex))