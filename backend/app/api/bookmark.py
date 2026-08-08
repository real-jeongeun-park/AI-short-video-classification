from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import Bookmark

router = APIRouter()

class BookmarkRequest(BaseModel):
    video_id: int
    user_id: int

@router.post("/bookmarks")
def add_bookmark(data: BookmarkRequest, db: Session = Depends(get_db)):
    try:
        existing = db.query(Bookmark).filter(
            Bookmark.video_id == data.video_id,
            Bookmark.user_id == data.user_id,
        ).first()

        if existing:
            return {"id": existing.id, "is_bookmarked": True}

        bookmark = Bookmark(video_id=data.video_id, user_id=data.user_id)
        db.add(bookmark)
        db.commit()
        db.refresh(bookmark)

        return {"id": bookmark.id, "is_bookmarked": True}

    except Exception as ex:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(ex))


@router.delete("/bookmarks")
def remove_bookmark(data: BookmarkRequest, db: Session = Depends(get_db)):
    try:
        bookmark = db.query(Bookmark).filter(
            Bookmark.video_id == data.video_id,
            Bookmark.user_id == data.user_id,
        ).first()

        if not bookmark:
            raise HTTPException(status_code=404, detail="북마크를 찾을 수 없습니다.")

        db.delete(bookmark)
        db.commit()

        return {"is_bookmarked": False}

    except HTTPException:
        raise
    except Exception as ex:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(ex))