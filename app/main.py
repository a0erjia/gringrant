from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import auth, categories, grant  # Импортируйте роутер grant

app = FastAPI()

# Настройка CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Разрешить все источники
    allow_credentials=True,
    allow_methods=["*"],  # Разрешить все методы
    allow_headers=["*"],  # Разрешить все заголовки
)

app.include_router(auth.router, prefix="/auth")
app.include_router(categories.router, prefix="/categories")
app.include_router(grant.router, prefix="/grants")  # Включите роутер с префиксом /grants
