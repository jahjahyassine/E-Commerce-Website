from pydantic import BaseModel, EmailStr



class UserRegister (BaseModel):
    username: str
    full_name: str
    email: EmailStr
    password: str


class UserLogin (BaseModel):
    username: str | None = None
    email: EmailStr | None = None
    password: str
    

class UserResponse(BaseModel):
    id: int
    username: str
    full_name: str
    email: EmailStr
    role: str
    is_active: bool
    profile_pic_path: str

    model_config = {
        "from_attributes": True
    }