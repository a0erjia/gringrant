from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from pydantic import BaseModel
from app.database.database import get_db
from app.models.models import User, Session as UserSession
import secrets

router = APIRouter()
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")


class UserCreate(BaseModel):
    nickname: str
    password: str


class UserLogin(BaseModel):
    nickname: str
    password: str


class LogoutRequest(BaseModel):
    token: str


@router.post("/register")
def register(user: UserCreate, db: Session = Depends(get_db)):
    hashed_password = user.password  # You should hash the password here
    db_user = User(nickname=user.nickname, password=hashed_password)
    db.add(db_user)
    db.commit()
    db.refresh(db_user)

    # Создание сессии после регистрации
    token = secrets.token_hex(16)
    user_session = UserSession(user_id=db_user.id, token=token)
    db.add(user_session)
    db.commit()

    return {"token": token}


@router.post("/login")
def login(user: UserLogin, db: Session = Depends(get_db)):
    db_user = db.query(User).filter(User.nickname == user.nickname).first()
    if db_user and db_user.password == user.password:  # You should verify the hashed password here
        token = secrets.token_hex(16)
        user_session = UserSession(user_id=db_user.id, token=token)
        db.add(user_session)
        db.commit()
        return {"token": token}
    raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")


@router.post("/logout")
def logout(request: LogoutRequest, db: Session = Depends(get_db)):
    session = db.query(UserSession).filter(UserSession.token == request.token).first()
    if session:
        db.delete(session)
        db.commit()
        return {"message": "Successfully logged out"}
    raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Session not found")
