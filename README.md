# 🧠 AI-Powered Engineering Roadmap & Progress Tracker

An intelligent, full-stack platform designed to guide engineering students through their academic journey by providing dynamic roadmaps, skill tracking, and AI-driven placement readiness predictions.

## 🚀 Key Features

- **Personalized Onboarding:** Generates custom roadmaps based on the student's chosen domain (e.g., AI/ML, Full Stack) and current skill level.
- **Dynamic Skill Tracking:** Visualizes progress across core competencies (Programming, Projects, Certifications).
- **AI "Analyzer" Engine:** Utilizes a Support Vector Machine (SVM) model trained on student data to predict internship/placement readiness with live confidence scoring.
- **Automated "Tutor" Analysis:** Identifies critical skill gaps in real-time and provides actionable study recommendations.
- **Senior Projects Hub:** A community-driven feature for discovering viable capstone project ideas.

## 🛠️ Tech Stack

* **Frontend:** React.js, Vite, Tailwind CSS, React Router
* **Backend:** Python, FastAPI, Uvicorn
* **Machine Learning:** Scikit-learn (SVM Classifier), Pandas, Joblib (Model Serialization)

## ⚙️ How to Run Locally

You will need two terminal windows to run the full-stack application.

**1. Start the Python AI Backend**
\`\`\`bash
cd backend
pip install fastapi uvicorn scikit-learn pandas pydantic joblib
uvicorn main:app --reload
\`\`\`

**2. Start the React Frontend**
\`\`\`bash
cd roadmap-project
npm install
npm run dev
\`\`\`

## 📊 Machine Learning Lifecycle
The backend features a complete ML lifecycle. On the first startup, the API ingests `students_data.csv`, trains the RBF Kernel SVM, evaluates accuracy via a train/test split, and serializes the model to `.pkl` for high-performance loading on subsequent boots.