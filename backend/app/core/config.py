import os


SECRET_KEY = os.environ.get("SECRET_KEY", "tech-logistics-secret-2026")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 480
