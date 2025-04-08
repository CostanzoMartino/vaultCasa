
from fastapi import FastAPI, HTTPException, Depends
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
from models import User, Credential, get_db
from sqlalchemy.orm import Session
from crypto_utils import hash_password, verify_password

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], #allow_credentials=True,
    allow_methods=["*"], allow_headers=["*"],
)

class UserLogin(BaseModel):
    username: str
    password: str

class UserRegister(BaseModel):
    username: str
    password: str

class CredentialIn(BaseModel):
    service: str
    login: str
    password_encrypted: str
    notes_encrypted: str
    user_id: int

@app.post("/register")
def register(data: UserRegister, db: Session = Depends(get_db)):
    if db.query(User).filter_by(username=data.username).first():
        raise HTTPException(status_code=400, detail="Username già in uso")
    pw_hash = hash_password(data.password)
    new_user = User(username=data.username, password_hash=pw_hash)
    db.add(new_user)
    db.commit()
    return {"message": "Registrazione completata"}

@app.post("/login")
def login(data: UserLogin, db: Session = Depends(get_db)):
    user = db.query(User).filter_by(username=data.username).first()
    if not user or not verify_password(data.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Credenziali errate")
    return {"user_id": user.id}

@app.post("/credentials")
def save_credential(data: CredentialIn, db: Session = Depends(get_db)):
    new_entry = Credential(**data.dict())
    db.add(new_entry)
    db.commit()
    return {"status": "ok"}

@app.get("/credentials/{user_id}")
def get_credentials(user_id: int, db: Session = Depends(get_db)):
    credentials = db.query(Credential).filter_by(user_id=user_id).all()
    return credentials
