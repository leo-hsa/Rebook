from sqlalchemy.orm import Session
from models import PendingBook, PendingBookStatus, Role, Genre
import schemas

def create_pending_book(db: Session, book_data:schemas.PendingBookCreate, user_id: int):
    pending_status = db.query(PendingBookStatus).filter_by(name="pending").first()
    new_pending_book = PendingBook(
        
        title=book_data.title,
        author_name=book_data.author_name,
        requested_by=user_id,
        status_id=pending_status.id
    )
    db.add(new_pending_book)
    db.commit()
    db.refresh(new_pending_book)
    return new_pending_book


def get_pending_books(db:Session):
    return db.query(PendingBook).all()

def update_pending_book(db: Session, book_id:int, status_id:int):
    pending_book = db.query(PendingBook).filter_by(id=book_id).first()
    
    if pending_book:
        pending_book.status_id = status_id
        
        db.commit()
        db.refresh(pending_book)
    return pending_book

def delete_pending_book(db:Session, book_id:int):
    pending_book = db.query(PendingBook).filter_by(id=book_id).first()
    if pending_book:
        db.delete(pending_book)
        db.commit()
        return True
    return False



def init_statuses(db: Session):
    statuses = ["pending", "approved", "rejected"]
    for status in statuses:
        if not db.query(PendingBookStatus).filter_by(name=status).first():
            new_status = PendingBookStatus(name=status)  
            db.add(new_status)
            
    roles = ["admin", "user"]
    for role in roles:
        if not db.query(Role).filter_by(name=role).first():
            new_role = Role(name=role)
            db.add(new_role)
            
    db.commit()
    

def get_all_genres(db: Session):
    return db.query(Genre).all()
    