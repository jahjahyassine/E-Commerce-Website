from pydantic import BaseModel, EmailStr, Field



class UserRegister (BaseModel):
    username: str
    full_name: str
    email: EmailStr
    password: str


class UserLogin (BaseModel):
    identifier: str
    rememberOption: bool
    password: str
    

class UserResponse(BaseModel):
    id: int
    username: str
    full_name: str | None
    email: EmailStr
    role: str

    phone: str | None = None

    address: str | None = None
    city: str | None = None
    region: str | None = None
    postal_code: str | None = None

    is_active: bool
    profile_pic_path: str

    model_config = {
        "from_attributes": True
    }



class UserPatch(BaseModel):
    username: str | None = None
    full_name: str | None = None
    email: EmailStr | None = None
    phone: str | None = None

    address: str | None = None
    city: str | None = None
    region: str | None = None
    postal_code: str | None = None



class ChangePasswordRequest(BaseModel):
    current_password: str
    new_password: str = Field(min_length=8)


