from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from pydantic import BaseModel, ValidationError
from uuid import uuid4
from collections import Counter


from app.database.database import get_db
from app.models.models import Request, Project, Session, Destination
from app.routers.auth import oauth2_scheme
from neural.neural import SentenceSimilarity, MultiLabelClassification, transform_label

router = APIRouter()

# Инициализация моделей нейросети
pipe = SentenceSimilarity()
pipe2 = MultiLabelClassification()

# Модель данных для запроса на оценку гранта
class GrantRequest(BaseModel):
    title: str
    destination_id: int
    description: str
    goals: str
    social_meaning: str
    target_audience: str
    tasks: str

@router.post("/evaluate")
def evaluate_grant(grant_request: GrantRequest, db: Session = Depends(get_db), token: str = Depends(oauth2_scheme)):
    try:
        # Проверка токена
        user_session = db.query(Session).filter(Session.token == token).first()
        if not user_session:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")

        # Сохранение заявки в таблицу requests
        new_request = Request(
            id=uuid4(),
            user_id=user_session.user_id,
            title=grant_request.title,
            destination_id=grant_request.destination_id,
            description=grant_request.description,
            goals=grant_request.goals,
            social_meaning=grant_request.social_meaning,
            target_audience=grant_request.target_audience,
            tasks=grant_request.tasks
        )
        db.add(new_request)
        db.commit()
        db.refresh(new_request)

        # Оценка заявки с использованием нейросети
        similarities = [
            pipe.get_similarity_score([grant_request.social_meaning, grant_request.goals]),
            pipe.get_similarity_score([grant_request.social_meaning, grant_request.tasks]),
            pipe.get_similarity_score([grant_request.social_meaning, grant_request.target_audience])
        ]

        classifications = [
            pipe2.get_class(grant_request.description),
            pipe2.get_class(grant_request.goals),
            pipe2.get_class(grant_request.tasks)
        ]

        label = int(Counter(classifications).most_common(1)[0][0])
        score = sum(similarities) / len(similarities)

        encoded_label = transform_label(label)
        label_trues = 0

        for item in classifications:
            if item == grant_request.destination_id:
                label_trues += 1

        result = (label_trues / len(classifications) + score) / 2

        # Сохранение результата оценки в таблицу projects
        new_project = Project(
            id=uuid4(),
            request_id=new_request.id,
            estimated_chance=result,
            is_bookmarked=False
        )
        db.add(new_project)
        db.commit()
        db.refresh(new_project)

        return {
            "grant_id": new_request.id,
            "title": new_request.title,
            "description": new_request.description,
            "score": result,
            "comments": f"Категория: {encoded_label}"
        }

    except ValidationError as e:
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail=e.errors())

    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))


@router.get("/history")
def get_history(db: Session = Depends(get_db), token: str = Depends(oauth2_scheme)):
    try:
        # Проверка токена
        user_session = db.query(Session).filter(Session.token == token).first()
        if not user_session:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")

        # Получение заявок и оценок пользователя
        query = (
            db.query(Request, Project, Destination)
            .join(Project, Project.request_id == Request.id)
            .join(Destination, Destination.id == Request.destination_id)
            .filter(Request.user_id == user_session.user_id)
            .all()
        )

        history = [
            {
                "id": request.id,
                "title": request.title,
                "description": request.description,
                "goals": request.goals,
                "social_meaning": request.social_meaning,
                "target_audience": request.target_audience,
                "tasks": request.tasks,
                "created_at": request.created_at,
                "estimated_chance": project.estimated_chance * 100,  # Умножаем на 100 для отображения в процентах
                "destination": destination.name
            }
            for request, project, destination in query
        ]

        return history

    except Exception as e:
        print(f"Error: {str(e)}")  # Логирование ошибки
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))


@router.get("/favorites")
def get_favorites(db: Session = Depends(get_db), token: str = Depends(oauth2_scheme)):
    try:
        # Проверка токена
        user_session = db.query(Session).filter(Session.token == token).first()
        if not user_session:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")

        # Получение избранных заявок пользователя
        query = (
            db.query(Request, Project, Destination)
            .join(Project, Project.request_id == Request.id)
            .join(Destination, Destination.id == Request.destination_id)
            .filter(Request.user_id == user_session.user_id, Project.is_bookmarked == True)
            .all()
        )

        favorites = [
            {
                "id": request.id,
                "title": request.title,
                "description": request.description,
                "goals": request.goals,
                "social_meaning": request.social_meaning,
                "target_audience": request.target_audience,
                "tasks": request.tasks,
                "created_at": request.created_at,
                "estimated_chance": project.estimated_chance * 100,  # Умножаем на 100 для отображения в процентах
                "destination": destination.name
            }
            for request, project, destination in query
        ]

        return favorites

    except Exception as e:
        print(f"Error: {str(e)}")  # Логирование ошибки
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))

class FavoriteRequest(BaseModel):
    grant_id: str

@router.post("/favorites")
def add_to_favorites(favorite_request: FavoriteRequest, db: Session = Depends(get_db), token: str = Depends(oauth2_scheme)):
    try:
        user_session = db.query(Session).filter(Session.token == token).first()
        if not user_session:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")

        project = db.query(Project).filter(Project.request_id == favorite_request.grant_id).first()
        if not project:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Grant not found")

        project.is_bookmarked = True
        db.commit()
        db.refresh(project)

        return {"message": "Grant added to favorites"}
    except Exception as e:
        print(f"Error: {str(e)}")  # Логирование ошибки
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))

@router.delete("/favorites/{grant_id}")
def remove_from_favorites(grant_id: str, db: Session = Depends(get_db), token: str = Depends(oauth2_scheme)):
    try:
        user_session = db.query(Session).filter(Session.token == token).first()
        if not user_session:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")

        project = db.query(Project).filter(Project.request_id == grant_id).first()
        if not project:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Grant not found")

        project.is_bookmarked = False
        db.commit()
        db.refresh(project)

        return {"message": "Grant removed from favorites"}
    except Exception as e:
        print(f"Error: {str(e)}")  # Логирование ошибки
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))
