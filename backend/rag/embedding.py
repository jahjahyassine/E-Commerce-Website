from typing import Annotated, List

from fastapi import APIRouter
from fastapi.params import Depends

from schemas.product import ProductResponse
from routes.product import get_products


router = APIRouter(
    prefix="/rag"
)


def chunking (
    products: Annotated[List[ProductResponse], Depends(get_products)]
):
    



