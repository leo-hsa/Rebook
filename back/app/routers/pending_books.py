from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
import schemas
import crud 
from core.database import get_db
from models import PendingBookStatus

router = APIRouter(prefix="/pending_books", tags=["Pending Books"])

@router.post("/", response_model=schemas.PendingBookOut)
def request_book(book: schemas.PendingBookCreate, db: Session = Depends(get_db), user_id: int = 1):
    return crud.create_pending_book(db, book, user_id)

@router.get("/", response_model=list[schemas.PendingBookOut])
def get_all_pending_books(db: Session = Depends(get_db)):
    return crud.get_pending_books(db)

@router.put("/{book_id}", response_model=schemas.PendingBookOut)
def update_book_status(book_id: int, update_data: schemas.PendingBookUpdate, db: Session = Depends(get_db)):
    status = db.query(PendingBookStatus).filter_by(id=update_data.status_id).first()
    if not status:
        raise HTTPException(status_code=404, datail="Status not defined")
    
    updated_book = crud.update_pending_book_status(db, book_id, update_data.status_id)
    if not updated_book:
        raise HTTPException(status_code=404, detail="Book not found")
    return updated_book

@router.delete("/{book_id}")
def delete_book_request(book_id: int, db: Session = Depends(get_db)):
    if crud.delete_pending_book(db, book_id):
        return {"message": "Book request deleted"}
    raise HTTPException(status_code=404, detail="Book not found")

