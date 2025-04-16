# routers/author.py

from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session, joinedload # Импортируем joinedload
from typing import List
from models import Author, Book # Убедитесь, что импортировали модели Author и Book
# Импортируем нужные схемы из вашего файла схем
from schemas import AuthorListItem, Author as AuthorSchema, BookSummaryForAuthor
from core.database import get_db # Путь к вашей функции get_db

router = APIRouter(
    prefix="/authors", # Префикс для всех путей в этом роутере
    tags=["Author"]    # Тег для документации Swagger/OpenAPI
)

@router.get("/", response_model=List[AuthorListItem])
def get_authors(db: Session = Depends(get_db)):
    """
    Получает список всех авторов с их ID и именем.
    """
    # Выбираем только ID и имя для списка
    authors = db.query(Author.id, Author.name).order_by(Author.name).all()
    # Преобразуем результат в формат AuthorListItem
    # FastAPI >= 0.100 автоматически сделает это, если поля совпадают
    # Если нет, можно сделать вручную:
    # return [AuthorListItem(id=a.id, name=a.name) for a in authors]
    return authors # FastAPI сопоставит по именам полей

@router.get("/{author_id}", response_model=AuthorSchema)
def get_author_details(author_id: int, db: Session = Depends(get_db)):
    """
    Получает детальную информацию об одном авторе по его ID,
    включая список его книг (только базовая информация о книгах).
    """
    # Загружаем автора и СВЯЗАННЫЕ с ним книги ОДНИМ запросом
    author = db.query(Author).options(
        # Используем joinedload для загрузки связи 'books'
        # Это предотвращает N+1 запросы при доступе к author.books
        joinedload(Author.books)
    ).filter(Author.id == author_id).first()

    # Если автор не найден, возвращаем 404 ошибку
    if not author:
        raise HTTPException(status_code=404, detail=f"Author with id {author_id} not found")

    # FastAPI автоматически преобразует объект SQLAlchemy 'author'
    # (включая загруженные 'author.books') в формат схемы AuthorSchema,
    # используя BookSummaryForAuthor для элементов списка books.
    return author