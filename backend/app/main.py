import os
import re
import sqlite3
from datetime import datetime
from typing import List, Optional, Tuple

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

MODEL_PATH = os.getenv(
    "MODEL_PATH",
    r"D:\Downloads from dektop\Shortcut\KhadijaF\SCMS\Model\xlmr_final_model",
)

MODEL_LABELS = {
    "electricity": "Electricity",
    "electrical": "Electricity",
    "power": "Electricity",
    "gas": "Gas",
    "water": "Water",
}

app = FastAPI(title="Smart Complaint Management System API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class PredictionRequest(BaseModel):
    text: str


class PredictionResponse(BaseModel):
    department: str
    confidence: float


class ComplaintOut(BaseModel):
    id: int
    citizen: str
    citizenEmail: str
    language: str
    text: str
    department: str
    status: str
    updatedAt: str
    history: List[dict]


class ComplaintCreate(BaseModel):
    citizen: str
    citizenEmail: str
    language: str
    text: str
    department: str
    status: str = "AI Routed"


class ComplaintUpdate(BaseModel):
    status: str


_tokenizer = None
_model = None
_device = "cpu"

DB_FILE = os.path.join(os.path.dirname(__file__), "complaints.db")

def init_db():
    conn = sqlite3.connect(DB_FILE)
    cursor = conn.cursor()
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS complaints (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            citizen TEXT NOT NULL,
            citizenEmail TEXT NOT NULL,
            language TEXT NOT NULL,
            text TEXT NOT NULL,
            department TEXT NOT NULL,
            status TEXT NOT NULL,
            updatedAt TEXT NOT NULL
        )
    ''')
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS history (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            complaint_id INTEGER,
            note TEXT,
            actor TEXT,
            time TEXT,
            FOREIGN KEY(complaint_id) REFERENCES complaints(id)
        )
    ''')
    
    conn.commit()
    conn.close()

init_db()


def _load_model_if_available() -> Tuple[Optional[object], Optional[object], Optional[str]]:
    global _tokenizer, _model, _device

    if _tokenizer is not None and _model is not None:
        return _tokenizer, _model, _device

    if not os.path.exists(MODEL_PATH):
        return None, None, None

    try:
        import torch
        from transformers import AutoModelForSequenceClassification, AutoTokenizer
    except Exception:
        return None, None, None

    _device = "cuda" if torch.cuda.is_available() else "cpu"
    _tokenizer = AutoTokenizer.from_pretrained(MODEL_PATH)
    _model = AutoModelForSequenceClassification.from_pretrained(MODEL_PATH)
    _model.to(_device)
    _model.eval()
    return _tokenizer, _model, _device


DEPARTMENT_KEYWORDS = {
    "Electricity": [
        "electric", "electricity", "power", "current", "voltage", "breaker", "fuse", "light", "lights",
        "lamp", "bulb", "socket", "wire", "cable", "outage", "blackout", "short circuit", "sparks",
        "meter", "transformer", "line", "connection", "load shedding", "tripping", "fault", "faulty",
        "بجلی", "برقی", "کرنٹ", "لائٹس", "تار", "بلب", "بلاک آؤٹ", "شور"
    ],
    "Gas": [
        "gas", "smell", "leak", "pipeline", "cylinder", "burner", "stove", "lpg", "methane", "odor",
        "fire", "explosion", "hose", "valve", "pipe", "گیس", "پائپ", "پائپ لائن", "لیک", "چولہا", "سٹیو"
    ],
    "Water": [
        "water", "tap", "pipe", "pipeline", "pressure", "drain", "drainage", "sewer", "tank", "supply",
        "flood", "leak", "toilet", "motor", "pump", "moisture", "pani", "پانی", "نل", "پائپ", "پائپ لائن",
        "پریشر", "ڈرین", "ٹینک", "پمپ", "ٹپک"
    ],
}


def _contains_keyword(text: str, keyword: str) -> bool:
    if not text or not keyword:
        return False
    pattern = rf"(?<!\w){re.escape(keyword)}(?!\w)"
    return re.search(pattern, text, flags=re.IGNORECASE) is not None


def _normalize_department(label: str) -> str:
    normalized = label.strip().casefold()

    for alias, department in MODEL_LABELS.items():
        if alias in normalized:
            return department

    department, _ = _score_department(label)
    return department


def _score_department(text: str) -> Tuple[str, float]:
    normalized = text.casefold().strip()
    scores = {department: 0 for department in DEPARTMENT_KEYWORDS}

    if not normalized:
        return "Electricity", 0.0

    for department, keywords in DEPARTMENT_KEYWORDS.items():
        for keyword in keywords:
            if _contains_keyword(normalized, keyword):
                scores[department] += 3

    if re.search(r"\b(gas|smell|leak|pipeline|cylinder|stove|burner|lpg|methane|odor|fire|explosion|hose|valve)\b", normalized):
        scores["Gas"] += 4
    if re.search(r"\b(water|pressure|tap|drain|drainage|sewer|tank|supply|flood|toilet|motor|pump|moisture|pani)\b", normalized):
        scores["Water"] += 4
    if re.search(r"\b(electric|electricity|power|current|light|lights|socket|wire|cable|outage|breaker|fuse|meter|transformer)\b", normalized):
        scores["Electricity"] += 4

    best_department = max(scores, key=scores.get)
    best_score = scores[best_department]

    if best_score == 0:
        return "Electricity", 0.0

    return best_department, round(min(best_score / 12.0, 0.99), 2)


def _route_department(text: str) -> Tuple[str, float]:
    if not text or not text.strip():
        return "Electricity", 0.0

    department, confidence = _predict_with_model(text)
    if department == "Electricity":
        keyword_department, keyword_confidence = _score_department(text)
        if keyword_confidence > 0.0 and keyword_department != "Electricity":
            return keyword_department, keyword_confidence
    return department, confidence


def _predict_with_model(text: str) -> Tuple[str, float]:
    tokenizer, model, device = _load_model_if_available()
    if tokenizer is None or model is None:
        return _score_department(text)

    import torch

    inputs = tokenizer(text, return_tensors="pt", truncation=True, padding=True, max_length=128)
    with torch.no_grad():
        outputs = model(**{key: value.to(device) for key, value in inputs.items()})
        probabilities = torch.softmax(outputs.logits, dim=-1).cpu().numpy()[0]

    predicted_index = int(probabilities.argmax())
    id2label = getattr(model.config, "id2label", {}) or {}
    guessed_label = id2label.get(predicted_index, str(predicted_index))
    department = _normalize_department(str(guessed_label))
    confidence = float(probabilities.max())
    if confidence < 0.35:
        return _score_department(text)
    return department, confidence


@app.get("/health")
def health():
    return {"status": "ok"}


@app.post("/api/predict", response_model=PredictionResponse)
def predict(req: PredictionRequest):
    department, confidence = _predict_with_model(req.text)
    return PredictionResponse(department=department, confidence=confidence)


def get_complaint_history(complaint_id: int) -> List[dict]:
    conn = sqlite3.connect(DB_FILE)
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()
    cursor.execute("SELECT note, actor, time FROM history WHERE complaint_id = ? ORDER BY id ASC", (complaint_id,))
    rows = cursor.fetchall()
    conn.close()
    return [{"note": row["note"], "actor": row["actor"], "time": row["time"]} for row in rows]


@app.get("/api/complaints", response_model=List[ComplaintOut])
def list_complaints():
    conn = sqlite3.connect(DB_FILE)
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM complaints ORDER BY id DESC")
    rows = cursor.fetchall()
    conn.close()
    
    complaints = []
    for row in rows:
        history = get_complaint_history(row["id"])
        complaints.append(ComplaintOut(
            id=row["id"],
            citizen=row["citizen"],
            citizenEmail=row["citizenEmail"],
            language=row["language"],
            text=row["text"],
            department=row["department"],
            status=row["status"],
            updatedAt=row["updatedAt"],
            history=history
        ))
    return complaints


@app.post("/api/complaints", response_model=ComplaintOut)
def create_complaint(payload: ComplaintCreate):
    routed_department, _ = _route_department(payload.text)
    time_now = datetime.utcnow().isoformat() + "Z"
    
    conn = sqlite3.connect(DB_FILE)
    cursor = conn.cursor()
    cursor.execute('''
        INSERT INTO complaints (citizen, citizenEmail, language, text, department, status, updatedAt)
        VALUES (?, ?, ?, ?, ?, ?, ?)
    ''', (payload.citizen, payload.citizenEmail, payload.language, payload.text, routed_department, payload.status, time_now))
    complaint_id = cursor.lastrowid
    
    cursor.execute('''
        INSERT INTO history (complaint_id, note, actor, time)
        VALUES (?, ?, ?, ?)
    ''', (complaint_id, "Submitted", "Citizen", "Just now"))
    
    cursor.execute('''
        INSERT INTO history (complaint_id, note, actor, time)
        VALUES (?, ?, ?, ?)
    ''', (complaint_id, f"Auto-routed to {routed_department}", "AI", "Just now"))
    
    conn.commit()
    conn.close()
    
    history = get_complaint_history(complaint_id)
    return ComplaintOut(
        id=complaint_id,
        citizen=payload.citizen,
        citizenEmail=payload.citizenEmail,
        language=payload.language,
        text=payload.text,
        department=routed_department,
        status=payload.status,
        updatedAt=time_now,
        history=history
    )


@app.put("/api/complaints/{complaint_id}", response_model=ComplaintOut)
def update_complaint(complaint_id: int, payload: ComplaintUpdate):
    time_now = datetime.utcnow().isoformat() + "Z"
    
    conn = sqlite3.connect(DB_FILE)
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()
    
    cursor.execute("SELECT * FROM complaints WHERE id = ?", (complaint_id,))
    row = cursor.fetchone()
    if not row:
        conn.close()
        return None
        
    cursor.execute("UPDATE complaints SET status = ?, updatedAt = ? WHERE id = ?", (payload.status, time_now, complaint_id))
    cursor.execute('''
        INSERT INTO history (complaint_id, note, actor, time)
        VALUES (?, ?, ?, ?)
    ''', (complaint_id, f"Updated to {payload.status}", "Dept", "Just now"))
    
    conn.commit()
    
    cursor.execute("SELECT * FROM complaints WHERE id = ?", (complaint_id,))
    updated_row = cursor.fetchone()
    conn.close()
    
    history = get_complaint_history(complaint_id)
    return ComplaintOut(
        id=updated_row["id"],
        citizen=updated_row["citizen"],
        citizenEmail=updated_row["citizenEmail"],
        language=updated_row["language"],
        text=updated_row["text"],
        department=updated_row["department"],
        status=updated_row["status"],
        updatedAt=updated_row["updatedAt"],
        history=history
    )
