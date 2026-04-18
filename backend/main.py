from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import pandas as pd
import numpy as np
from sklearn.svm import SVC
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score
import joblib
import os
import json
import hashlib

from sqlalchemy import create_engine, Column, Integer, String
from sqlalchemy.orm import declarative_base, sessionmaker, Session

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- SQLite Database Setup ---
SQLALCHEMY_DATABASE_URL = "sqlite:///./roadmap_users.db"
engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={
                       "check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

# Define the Database Table (NEW: Added email and password)


class DBUserProgress(Base):
    __tablename__ = "user_progress"
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True)
    password_hash = Column(String)
    name = Column(String, default="Student")
    domain = Column(String, default="Data Science")
    python = Column(Integer, default=0)
    ml = Column(Integer, default=0)
    projects = Column(Integer, default=0)
    certs = Column(Integer, default=0)
    tasks_json = Column(String, default="[]")


Base.metadata.create_all(bind=engine)


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# --- Utility Function for Passwords ---


def hash_password(password: str):
    return hashlib.sha256(password.encode()).hexdigest()


# --- ML Lifecycle Setup (Unchanged) ---
csv_path = os.path.join(os.path.dirname(__file__), "students_data.csv")
model_path = os.path.join(os.path.dirname(__file__), "svm_model.pkl")
model = None
model_accuracy = 0.0


def train_and_save_model():
    global model, model_accuracy
    print("Training new model...")
    try:
        df = pd.read_csv(csv_path)
    except FileNotFoundError:
        df = pd.DataFrame([
            [90, 85, 80, 50, 1], [80, 70, 75, 40, 1], [40, 30, 20, 10, 0],
            [60, 50, 40, 20, 0], [85, 80, 90, 60, 1], [30, 40, 10, 0, 0]
        ], columns=['python', 'ml', 'projects', 'certs', 'placement_ready'])

    X = df[['python', 'ml', 'projects', 'certs']].values
    y = df['placement_ready'].values
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42)

    model = SVC(probability=True, kernel='rbf', C=1.0)
    model.fit(X_train, y_train)

    predictions = model.predict(X_test)
    model_accuracy = accuracy_score(y_test, predictions) * 100
    joblib.dump(model, model_path)


if os.path.exists(model_path):
    model = joblib.load(model_path)
    model_accuracy = 95.0
else:
    train_and_save_model()

# --- API Data Models ---


class StudentSkills(BaseModel):
    python: int
    ml: int
    projects: int
    certs: int


class UserSaveData(BaseModel):
    domain: str
    skills: StudentSkills
    tasks: list


class UserLogin(BaseModel):
    email: str
    password: str


class UserRegister(BaseModel):
    name: str
    email: str
    password: str

# --- API Endpoints ---

# NEW: Register Endpoint


@app.post("/api/register")
def register_user(user: UserRegister, db: Session = Depends(get_db)):
    db_user = db.query(DBUserProgress).filter(
        DBUserProgress.email == user.email).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Email already registered")

    new_user = DBUserProgress(
        email=user.email,
        password_hash=hash_password(user.password),
        name=user.name
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return {"message": "User created successfully", "user_id": new_user.id, "name": new_user.name}

# NEW: Login Endpoint


@app.post("/api/login")
def login_user(user: UserLogin, db: Session = Depends(get_db)):
    db_user = db.query(DBUserProgress).filter(
        DBUserProgress.email == user.email).first()
    if not db_user or db_user.password_hash != hash_password(user.password):
        raise HTTPException(
            status_code=400, detail="Invalid email or password")

    return {"message": "Login successful", "user_id": db_user.id, "name": db_user.name}


@app.post("/api/predict")
def predict_readiness(skills: StudentSkills):
    input_features = np.array(
        [[skills.python, skills.ml, skills.projects, skills.certs]])
    prediction = model.predict(input_features)[0]
    confidence = model.predict_proba(input_features)[0].max() * 100
    is_ready = bool(prediction == 1)

    return {
        "placement_ready": is_ready,
        "confidence": round(confidence, 2),
        "message": "Internship Ready" if is_ready else "Keep Learning"
    }


@app.post("/api/user/{user_id}/save")
def save_user_progress(user_id: int, data: UserSaveData, db: Session = Depends(get_db)):
    db_user = db.query(DBUserProgress).filter(
        DBUserProgress.id == user_id).first()
    if not db_user:
        raise HTTPException(status_code=404, detail="User not found")

    db_user.domain = data.domain
    db_user.python = data.skills.python
    db_user.ml = data.skills.ml
    db_user.projects = data.skills.projects
    db_user.certs = data.skills.certs
    db_user.tasks_json = json.dumps(data.tasks)

    db.commit()
    return {"status": "success"}


@app.get("/api/user/{user_id}/load")
def load_user_progress(user_id: int, db: Session = Depends(get_db)):
    db_user = db.query(DBUserProgress).filter(
        DBUserProgress.id == user_id).first()
    if not db_user:
        return {"exists": False}

    return {
        "exists": True,
        "name": db_user.name,
        "domain": db_user.domain,
        "skills": {
            "python": db_user.python,
            "ml": db_user.ml,
            "projects": db_user.projects,
            "certs": db_user.certs
        },
        "tasks": json.loads(db_user.tasks_json)
    }


# --- NEW: Dynamic Projects Database & Endpoint ---

PROJECTS_DB = {
    "Data Science": [
        {"title": "Crop Yield Prediction", "author": "Vikram S.",
            "tag": "ML", "color": "bg-blue-600"},
        {"title": "Customer Churn Analyzer", "author": "Priya R.",
            "tag": "Data", "color": "bg-blue-500"}
    ],
    "Full Stack Dev": [
        {"title": "E-Commerce Microservices", "author": "Anjali & Team",
            "tag": "Web", "color": "bg-indigo-600"},
        {"title": "Real-time Chat App", "author": "Rahul M.",
            "tag": "Sockets", "color": "bg-indigo-500"}
    ],
    "AI/ML": [
        {"title": "Project & Internship Analyzer", "author": "Jeevan",
            "tag": "AI System", "color": "bg-purple-600"},
        {"title": "Face Mask Detection", "author": "AI Club",
            "tag": "Vision", "color": "bg-purple-500"}
    ],
    "UI/UX Design": [
        {"title": "Fintech App Redesign", "author": "Design Hub",
            "tag": "Figma", "color": "bg-pink-600"},
        {"title": "Accessibility Audit Tool", "author": "Sarah K.",
            "tag": "Research", "color": "bg-pink-500"}
    ],
    "Default": [
        {"title": "Automated Study Planner", "author": "Senior Team",
            "tag": "General", "color": "bg-slate-600"},
        {"title": "Portfolio Website", "author": "Tech Club",
            "tag": "Web", "color": "bg-slate-500"}
    ]
}


# To this line:
@app.get("/api/projects/{domain:path}")
def get_recommended_projects(domain: str):
    domain_key = domain if domain in PROJECTS_DB else "Default"
    return PROJECTS_DB[domain_key]
