from .config import settings

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, DeclarativeBase

class Base (DeclarativeBase):
    pass

DATABASE_URL = settings.DATABASE_URL
engine = create_engine(DATABASE_URL)

SessionLocal = sessionmaker (autocommit = False, autoflush = False, bind = engine)

def get_db():
    with SessionLocal() as db:
        yield db