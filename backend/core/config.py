from pydantic_settings import BaseSettings


class Settings (BaseSettings):
    DATABASE_URL: str
    DEFAULT_AVATAR_URL: str

    SECRET_KEY: str
    ALGORITHM: str


    class Config:
        env_file = ".env"



settings = Settings()