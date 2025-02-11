from fastapi import FastAPI
from core.database import init_db
from routers import authors, auth

app = FastAPI()

app.include_router(authors.router , prefix="/authors")
app.include_router(auth.router, prefix="/auth")

@app.on_event("startup")
def startup():
    init_db()
