import os

DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://gringrant:password@localhost/gringrantdb")
