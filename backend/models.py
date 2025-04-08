
from sqlalchemy import Column, Integer, String, create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

DATABASE_URL = "sqlite:///./passwords.db"
engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

# Modello utente
class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    password_hash = Column(String)

# Modello credenziali
class Credential(Base):
    __tablename__ = "credentials"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer)
    service = Column(String)
    login = Column(String)
    password_encrypted = Column(String)
    notes_encrypted = Column(String)

# Inizializzazione DB
Base.metadata.create_all(bind=engine)

# Ritorna la sessione del DB
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
