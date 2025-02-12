from fastapi import FastAPI
from core.database import init_db
from routers import auth, author, book, user

app = FastAPI()

app.include_router(author.router , prefix="/authors")
# app.include_router(auth.router, prefix="/auth", tags=["auth"])
app.include_router(book.router, prefix="/books", tags=["book"])
app.include_router(user.router, prefix="/users", tags=["user"])

@app.on_event("startup")
def startup():
    init_db()
