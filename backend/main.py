from fastapi import FastAPI, Depends
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

# --- NEW: Database Imports ---
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

# --- NEW: SQLite Database Setup ---
SQLALCHEMY_DATABASE_URL = "sqlite:///./roadmap_users.db"
engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={
                       "check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

# Define the Database Table


class DBUserProgress(Base):
    __tablename__ = "user_progress"
    id = Column(Integer, primary_key=True, index=True)
    domain = Column(String, default="Data Science")
    python = Column(Integer, default=0)
    ml = Column(Integer, default=0)
    projects = Column(Integer, default=0)
    certs = Column(Integer, default=0)
    tasks_json = Column(String, default="[]")  # Stores tasks as a JSON string


# Create the database file and tables
Base.metadata.create_all(bind=engine)

# Dependency to get the database session


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


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
    print("Model saved!")


if os.path.exists(model_path):
    print("Loading saved model...")
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

# --- API Endpoints ---


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

# NEW: Save User Progress to Database


@app.post("/api/user/{user_id}/save")
def save_user_progress(user_id: int, data: UserSaveData, db: Session = Depends(get_db)):
    # Check if user exists
    db_user = db.query(DBUserProgress).filter(
        DBUserProgress.id == user_id).first()

    if not db_user:
        # Create new user record
        db_user = DBUserProgress(id=user_id)
        db.add(db_user)

    # Update data
    db_user.domain = data.domain
    db_user.python = data.skills.python
    db_user.ml = data.skills.ml
    db_user.projects = data.skills.projects
    db_user.certs = data.skills.certs
    # Convert Python list to JSON string
    db_user.tasks_json = json.dumps(data.tasks)

    db.commit()
    return {"status": "success", "message": "Progress saved to database!"}

# NEW: Load User Progress from Database


@app.get("/api/user/{user_id}/load")
def load_user_progress(user_id: int, db: Session = Depends(get_db)):
    db_user = db.query(DBUserProgress).filter(
        DBUserProgress.id == user_id).first()
    if not db_user:
        return {"exists": False}

    return {
        "exists": True,
        "domain": db_user.domain,
        "skills": {
            "python": db_user.python,
            "ml": db_user.ml,
            "projects": db_user.projects,
            "certs": db_user.certs
        },
        # Convert JSON string back to list
        "tasks": json.loads(db_user.tasks_json)
    }
