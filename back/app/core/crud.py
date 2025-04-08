from sqlalchemy.orm import Session
from models import Role, Genre
import schemas

def init_statuses(db: Session):        
    roles = ["admin", "user"]
    for role in roles:
        if not db.query(Role).filter_by(name=role).first():
            new_role = Role(name=role)
            db.add(new_role)
            
    db.commit()
    

def get_all_genres(db: Session):
    return db.query(Genre).all()
    