from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    DATABASE_URL: str
    DEFAULT_AVATAR_URL: str
    SECRET_KEY: str
    ALGORITHM: str

    CLOUDINARY_NAME: str
    CLOUDINARY_API_KEY: str
    CLOUDINARY_API_SECRET: str

    SMTP_HOST: str
    SMTP_PORT: int
    SMTP_USER: str
    SMTP_PASSWORD: str

    GROQ_API_KEY: str

    class Config:
        env_file = ".env"


settings = Settings()