from typing import Annotated

from fastapi.params import Depends
from sqlalchemy.orm import Session

from core.database import get_db


# def storing_embedding (
#     embedding,
#     db: Annotated[Session, Depends(get_db)]
# ):
    