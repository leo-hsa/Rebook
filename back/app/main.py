import os
from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from core.database import init_db, SessionLocal
from routers import auth, author, book, user, genre, shop, admin
import core.crud as crud
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()
app.mount("/static", StaticFiles(directory="static"), name="static")

app.include_router(author.router)
app.include_router(auth.router)
# app.include_router(book.router, prefix="/books", tags=["book"])
app.include_router(user.router, prefix="/users", tags=["user"])
app.include_router(genre.router)
app.include_router(shop.router)
app.include_router(admin.router)
origins = [
    "http://localhost:5173",  
    "http://127.0.0.1:3000",
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
    
    


