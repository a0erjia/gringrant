from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database.database import get_db
from app.models.models import Destination

router = APIRouter()

@router.get("/")
def get_categories(db: Session = Depends(get_db)):
    categories = db.query(Destination).all()
    return {"categories": [category.name for category in categories]}
