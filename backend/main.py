from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import uvicorn

from routes import product, inventory, auth, cart, user, wishlist
from routes.admin import products as admin_product, inventory as admin_inventory
import models

app = FastAPI()

origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(product.router)
app.include_router(inventory.router)
app.include_router(auth.router)
app.include_router(cart.router)
app.include_router(user.router)
app.include_router(wishlist.router)
app.include_router(admin_product.router)
app.include_router(admin_inventory.router)


if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host="127.0.0.1",
        port=8000,
        reload=True,
    )