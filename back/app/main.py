from fastapi import FastAPI
from core.database import init_db

app = FastAPI()

@app.on_event("startup")
def startup():
    init_db()
