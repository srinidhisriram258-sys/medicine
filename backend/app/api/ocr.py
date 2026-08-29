from fastapi import APIRouter, UploadFile, File, HTTPException, status
from app.services.ocr_service import extract_text_from_image

router = APIRouter()

@router.post("/ocr/prescription")
async def process_prescription_image(file: UploadFile = File(...)):
    """
    Smart Prescription OCR Endpoint:
    Accepts an uploaded prescription image or pill bottle photo, extracts medicine details using Deep Learning / Vision OCR,
    and returns parsed fields (medicine_name, dosage, frequency, timing_text, confidence).
    """
    if not file.content_type.startswith("image/"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid file format. Please upload a valid prescription image (PNG, JPG, JPEG, WEBP)."
        )

    try:
        contents = await file.read()
        if len(contents) > 10 * 1024 * 1024:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Image file size exceeds 10 MB limit."
            )

        extracted_data = extract_text_from_image(contents)
        return extracted_data

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Prescription OCR processing error: {str(e)}"
        )
