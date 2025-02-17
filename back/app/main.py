from fastapi import FastAPI
from core.database import init_db, SessionLocal
from routers import auth, author, book, user
import core.crud as crud
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

app.include_router(author.router , prefix="/authors")
app.include_router(auth.router)
app.include_router(book.router, prefix="/books", tags=["book"])
app.include_router(user.router, prefix="/users", tags=["user"])

origins = [
    "http://localhost:5173",  
    "http://127.0.0.1:3000",
    "https://yourfrontend.com", 
] 

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,  
    allow_credentials=True,  
    allow_methods=["*"],  
    allow_headers=["*"],  
)

@app.get("/")
def read_root():
    return {"message": "CORS настроен!"}

@app.on_event("startup")
def startup():
    init_db()
    db = SessionLocal()
    crud.init_statuses(db)
    db.close()

