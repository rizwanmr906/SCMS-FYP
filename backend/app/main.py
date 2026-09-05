import base64
import hashlib
import hmac
import os
import re
import secrets
from datetime import datetime, timedelta, timezone
from pathlib import Path
from typing import Any, Dict, List, Optional, Tuple

import psycopg
from dotenv import load_dotenv
from fastapi import Depends, FastAPI, Header, HTTPException, Response, status
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from psycopg.rows import dict_row
from psycopg_pool import ConnectionPool

PROJECT_ROOT = Path(__file__).resolve().parents[2]
load_dotenv(PROJECT_ROOT / ".env")
MODEL_PATH = os.getenv("MODEL_PATH", str(PROJECT_ROOT / "Model" / "xlmr_final_model"))
SECRET_KEY = os.getenv("APP_SECRET_KEY", "")
SESSION_TTL_MINUTES = int(os.getenv("SESSION_TTL_MINUTES", "10080"))
ADMIN_EMAIL = os.getenv("ADMIN_EMAIL", "")
ADMIN_PASSWORD = os.getenv("ADMIN_PASSWORD", "")
DEPARTMENT_1_EMAIL = os.getenv("DEPARTMENT_1_EMAIL", "")
DEPARTMENT_1_PASSWORD = os.getenv("DEPARTMENT_1_PASSWORD", "")
DEPARTMENT_2_EMAIL = os.getenv("DEPARTMENT_2_EMAIL", "")
DEPARTMENT_2_PASSWORD = os.getenv("DEPARTMENT_2_PASSWORD", "")
DEPARTMENT_3_EMAIL = os.getenv("DEPARTMENT_3_EMAIL", "")
DEPARTMENT_3_PASSWORD = os.getenv("DEPARTMENT_3_PASSWORD", "")

required_settings = {
    "DATABASE_URL": os.getenv("DATABASE_URL", ""),
    "APP_SECRET_KEY": SECRET_KEY,
    "ADMIN_EMAIL": ADMIN_EMAIL,
    "ADMIN_PASSWORD": ADMIN_PASSWORD,
    "DEPARTMENT_1_EMAIL": DEPARTMENT_1_EMAIL,
    "DEPARTMENT_1_PASSWORD": DEPARTMENT_1_PASSWORD,
    "DEPARTMENT_2_EMAIL": DEPARTMENT_2_EMAIL,
    "DEPARTMENT_2_PASSWORD": DEPARTMENT_2_PASSWORD,
    "DEPARTMENT_3_EMAIL": DEPARTMENT_3_EMAIL,
    "DEPARTMENT_3_PASSWORD": DEPARTMENT_3_PASSWORD,
}
missing_settings = [name for name, value in required_settings.items() if not value]
if missing_settings:
    raise RuntimeError(f"Missing required environment settings: {', '.join(missing_settings)}")

MODEL_LABELS = {
    "electricity": "Electricity",
    "electrical": "Electricity",
    "power": "Electricity",
    "gas": "Gas",
    "water": "Water",
}

DEPARTMENT_NAMES = {
    1: "Electricity",
    2: "Gas",
    3: "Water",
}

app = FastAPI(title="Smart Complaint Management System API")
cors_origins = [
    origin.strip()
    for origin in os.getenv(
        "CORS_ORIGINS",
        os.getenv("FRONTEND_URL", "http://localhost:3000,http://127.0.0.1:3000"),
    ).split(",")
    if origin.strip()
]
app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins,
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

_tokenizer = None
_model = None
_device = "cpu"
DATABASE_URL = os.getenv("DATABASE_URL", "")


class PooledConnection:
    def __init__(self, pool: ConnectionPool):
        self._pool = pool
        self._connection = pool.getconn()
        self._returned = False

    def __getattr__(self, name: str) -> Any:
        return getattr(self._connection, name)

    def close(self) -> None:
        if not self._returned:
            self._connection.rollback()
            self._pool.putconn(self._connection)
            self._returned = True


connection_pool = ConnectionPool(
    DATABASE_URL,
    min_size=1,
    max_size=10,
    kwargs={"row_factory": dict_row, "connect_timeout": 10},
)


class PredictionRequest(BaseModel):
    text: str


class PredictionResponse(BaseModel):
    department: str
    confidence: float


class UserSignupRequest(BaseModel):
    name: str
    email: str
    password: str
    confirmPassword: str
    city: str
    phone: str
    streetAddress: str


class UserLoginRequest(BaseModel):
    email: str
    password: str


class ComplaintCreate(BaseModel):
    title: str = ""
    description: str
    category: Optional[str] = None
    language: str = "English"
    status: str = "Pending"
    voiceNoteData: Optional[str] = None
    voiceNoteMimeType: Optional[str] = None


class ComplaintUpdate(BaseModel):
    status: Optional[str] = None
    note: Optional[str] = None
    departmentId: Optional[int] = None


class ProfileUpdateRequest(BaseModel):
    name: Optional[str] = None
    city: Optional[str] = None
    phone: Optional[str] = None
    streetAddress: Optional[str] = None


class ComplaintOut(BaseModel):
    id: int
    userId: int
    userName: str
    userEmail: Optional[str] = None
    userCity: Optional[str] = None
    userPhone: Optional[str] = None
    userStreetAddress: Optional[str] = None
    departmentId: int
    department: str
    title: str
    description: str
    status: str
    createdAt: str
    updatedAt: str
    history: List[dict]
    voiceNoteUrl: Optional[str] = None


class DashboardSummary(BaseModel):
    totalComplaints: int
    pending: int
    inProgress: int
    resolved: int
    users: int
    departmentBreakdown: Dict[str, int]


class UserOut(BaseModel):
    id: int
    name: str
    email: str
    city: str
    phone: str
    streetAddress: str
    role: str
    departmentId: Optional[int]
    createdAt: str


def _normalize_status(value: Optional[str]) -> str:
    normalized = (value or "Pending").strip()
    mapping = {
        "ai routed": "Pending",
        "ai_routed": "Pending",
        "pending": "Pending",
        "in progress": "In Progress",
        "in_progress": "In Progress",
        "resolved": "Resolved",
    }
    return mapping.get(normalized.casefold(), normalized)


def db_connect() -> psycopg.Connection:
    if not DATABASE_URL:
        raise RuntimeError("DATABASE_URL is missing")
    return PooledConnection(connection_pool)


def hash_password(password: str) -> str:
    salt = secrets.token_hex(16)
    digest = hashlib.pbkdf2_hmac("sha256", password.encode("utf-8"), salt.encode("utf-8"), 200000)
    return f"pbkdf2_sha256$200000${salt}${digest.hex()}"


def verify_password(password: str, password_hash: str) -> bool:
    try:
        algorithm, iterations, salt, hashed = password_hash.split("$")
        if algorithm != "pbkdf2_sha256":
            return False
        digest = hashlib.pbkdf2_hmac("sha256", password.encode("utf-8"), salt.encode("utf-8"), int(iterations))
        return digest.hex() == hashed
    except (ValueError, TypeError):
        return False


def hash_session_token(token: str) -> str:
    return hmac.new(SECRET_KEY.encode("utf-8"), token.encode("utf-8"), hashlib.sha256).hexdigest()


def get_user_row_by_email(conn: psycopg.Connection, email: str) -> Optional[Dict[str, Any]]:
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM users WHERE email = %s", (email.strip().lower(),))
    return cursor.fetchone()


def row_to_user(row: Dict[str, Any]) -> Dict[str, Any]:
    return {
        "id": row["id"],
        "name": row["name"],
        "email": row["email"],
        "city": row["city"],
        "phone": row["phone"],
        "streetAddress": row["street_address"],
        "role": row["role"],
        "departmentId": row["department_id"],
        "createdAt": format_timestamp(row["created_at"]),
    }


def user_to_model(row: Dict[str, Any]) -> UserOut:
    return UserOut(
        id=row["id"],
        name=row["name"],
        email=row["email"],
        city=row["city"],
        phone=row["phone"],
        streetAddress=row["street_address"],
        role=row["role"],
        departmentId=row["department_id"],
        createdAt=format_timestamp(row["created_at"]),
    )


def row_value(row: Dict[str, Any], key: str, default: Optional[Any] = None) -> Optional[Any]:
    try:
        return row[key]
    except (KeyError, IndexError, TypeError):
        return default


def format_timestamp(value: Any) -> str:
    if isinstance(value, datetime):
        return value.isoformat().replace("+00:00", "Z")
    return str(value) if value is not None else ""


def serialize_complaint(row: Dict[str, Any], history: List[dict]) -> ComplaintOut:
    return ComplaintOut(
        id=row["id"],
        userId=row["user_id"],
        userName=row["user_name"],
        userEmail=row_value(row, "user_email"),
        userCity=row_value(row, "user_city"),
        userPhone=row_value(row, "user_phone"),
        userStreetAddress=row_value(row, "user_street_address"),
        departmentId=row["department_id"],
        department=row["department_name"],
        title=row["title"] or "Complaint",
        description=row["description"],
        status=_normalize_status(row["status"]),
        createdAt=format_timestamp(row["created_at"]),
        updatedAt=format_timestamp(row["updated_at"]),
        history=history,
        voiceNoteUrl=f"/api/complaints/{row['id']}/voice-note" if row_value(row, "voice_note_data") else None,
    )


def complaint_profile_from_row(row: Dict[str, Any]) -> Dict[str, str]:
    return {
        "name": row["user_name"],
        "email": row_value(row, "user_email") or "N/A",
        "city": row_value(row, "user_city") or "N/A",
        "phone": row_value(row, "user_phone") or "N/A",
        "streetAddress": row_value(row, "user_street_address") or "N/A",
    }


def ensure_database() -> None:
    """Seed reference departments and configured staff accounts in Supabase."""
    if not DATABASE_URL:
        raise RuntimeError("DATABASE_URL is missing")
    conn = db_connect()
    cursor = conn.cursor()
    for department_id, department_name in DEPARTMENT_NAMES.items():
        cursor.execute(
            "INSERT INTO departments (id, name) VALUES (%s, %s) ON CONFLICT (id) DO NOTHING",
            (department_id, department_name),
        )

    def seed_default_user(email: str, password: str, name: str, role: str, department_id: Optional[int], city: str, phone: str, street: str) -> None:
        cursor.execute(
            """
            INSERT INTO users (name, email, password_hash, city, phone, street_address, role, department_id, created_at)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)
            ON CONFLICT (email) DO NOTHING
            """,
            (name, email.strip().lower(), hash_password(password), city, phone, street, role, department_id, datetime.utcnow().isoformat() + "Z"),
        )

    seed_default_user(ADMIN_EMAIL, ADMIN_PASSWORD, "System Administrator", "admin", None, "Islamabad", "+923000000001", "Admin HQ")
    seed_default_user(DEPARTMENT_1_EMAIL, DEPARTMENT_1_PASSWORD, "Electricity Department", "department", 1, "Lahore", "+923000000002", "Department 1 Office")
    seed_default_user(DEPARTMENT_2_EMAIL, DEPARTMENT_2_PASSWORD, "Gas Department", "department", 2, "Karachi", "+923000000003", "Department 2 Office")
    seed_default_user(DEPARTMENT_3_EMAIL, DEPARTMENT_3_PASSWORD, "Water Department", "department", 3, "Peshawar", "+923000000004", "Department 3 Office")

    conn.commit()
    conn.close()


ensure_database()


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


def _looks_like_generic_model_label(label: str) -> bool:
    normalized = str(label or "").strip().casefold()
    return normalized.startswith("label_") or normalized in {"0", "1", "2", "-1"}


def _normalize_department_label(label: str, fallback_text: Optional[str] = None) -> str:
    normalized = str(label or "").strip().casefold()
    for alias, department in MODEL_LABELS.items():
        if alias in normalized:
            return department
    if _looks_like_generic_model_label(normalized):
        if fallback_text and fallback_text.strip():
            return _score_department(fallback_text)[0]
        return "Electricity"
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


def predict_department_from_text(text: str) -> Tuple[str, float]:
    if not text or not text.strip():
        return "Electricity", 0.0
    tokenizer, model, device = _load_model_if_available()
    if tokenizer is not None and model is not None:
        import torch

        inputs = tokenizer(text, return_tensors="pt", truncation=True, padding=True, max_length=128)
        with torch.no_grad():
            outputs = model(**{key: value.to(device) for key, value in inputs.items()})
            probabilities = torch.softmax(outputs.logits, dim=-1).cpu().numpy()[0]
        predicted_index = int(probabilities.argmax())
        id2label = getattr(model.config, "id2label", {}) or {}
        guessed_label = id2label.get(predicted_index, str(predicted_index))
        if not _looks_like_generic_model_label(str(guessed_label)):
            department = _normalize_department_label(str(guessed_label), text)
            confidence = float(probabilities.max())
            if confidence >= 0.35:
                return department, confidence
    return _score_department(text)


def department_name_to_id(name: str) -> int:
    lookup = {value: key for key, value in DEPARTMENT_NAMES.items()}
    return lookup.get(name.strip(), 1)


async def get_current_user(authorization: Optional[str] = Header(None, alias="Authorization")) -> Dict[str, Any]:
    if not authorization:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Authentication required")
    scheme, _, token = authorization.partition(" ")
    if scheme.lower() != "bearer" or not token:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid authentication token")
    digest = hashlib.sha256(token.encode("utf-8")).hexdigest()
    digest = hash_session_token(token)
    conn = db_connect()
    cursor = conn.cursor()
    cursor.execute(
        "SELECT s.user_id, s.expires_at, u.* FROM sessions s INNER JOIN users u ON u.id = s.user_id WHERE s.token_hash = %s",
        (digest,),
    )
    session_row = cursor.fetchone()
    conn.close()
    if not session_row:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Session not found or expired")
    expires_at = session_row["expires_at"]
    if isinstance(expires_at, str):
        expires_at = datetime.fromisoformat(expires_at.replace("Z", "+00:00"))
    elif expires_at and expires_at.tzinfo is None:
        expires_at = expires_at.replace(tzinfo=timezone.utc)
    if expires_at and datetime.now(timezone.utc) > expires_at:
        conn = db_connect()
        cursor = conn.cursor()
        cursor.execute("DELETE FROM sessions WHERE token_hash = %s", (digest,))
        conn.commit(); conn.close()
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Session expired")
    return row_to_user(session_row)


def require_roles(*allowed_roles: str):
    def dependency(current_user: Dict[str, Any] = Depends(get_current_user)) -> Dict[str, Any]:
        if current_user["role"] not in allowed_roles:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Forbidden")
        return current_user
    return dependency


@app.get("/health")
def health() -> Dict[str, str]:
    return {"status": "ok"}


@app.post("/api/auth/signup")
def signup(payload: UserSignupRequest):
    if payload.password != payload.confirmPassword:
        raise HTTPException(status_code=400, detail="Passwords do not match")
    if len(payload.password) < 8:
        raise HTTPException(status_code=400, detail="Password must contain at least 8 characters")
    if not payload.name.strip() or not payload.city.strip() or not payload.phone.strip() or not payload.streetAddress.strip():
        raise HTTPException(status_code=400, detail="All profile fields are required")
    email = payload.email.strip().lower()
    if not re.match(r"^[^@\s]+@[^@\s]+\.[^@\s]+$", email):
        raise HTTPException(status_code=400, detail="Valid email is required")
    if email.lower() in {ADMIN_EMAIL.lower(), DEPARTMENT_1_EMAIL.lower(), DEPARTMENT_2_EMAIL.lower(), DEPARTMENT_3_EMAIL.lower()}:
        raise HTTPException(status_code=403, detail="Administrator and department accounts cannot be created publicly")

    conn = db_connect()
    cursor = conn.cursor()
    cursor.execute("SELECT id FROM users WHERE email = %s", (email,))
    if cursor.fetchone():
        conn.close()
        raise HTTPException(status_code=409, detail="A user with this email already exists")

    cursor.execute(
        """
        INSERT INTO users (name, email, password_hash, city, phone, street_address, role, department_id, created_at)
        VALUES (%s, %s, %s, %s, %s, %s, 'user', NULL, %s)
        RETURNING id
        """,
        (payload.name.strip(), email, hash_password(payload.password), payload.city.strip(), payload.phone.strip(), payload.streetAddress.strip(), datetime.utcnow().isoformat() + "Z"),
    )
    user_id = cursor.fetchone()["id"]
    conn.commit()
    conn.close()
    return {"message": "User created successfully"}


@app.post("/api/auth/login")
def login(payload: UserLoginRequest):
    email = payload.email.strip().lower()
    conn = db_connect(); cursor = conn.cursor();
    row = get_user_row_by_email(conn, email)
    if not row or not verify_password(payload.password, row["password_hash"]):
        conn.close();
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")
    user = row_to_user(row)
    token = secrets.token_urlsafe(32)
    digest = hashlib.sha256(token.encode("utf-8")).hexdigest()
    digest = hash_session_token(token)
    expires_at = (datetime.utcnow() + timedelta(minutes=SESSION_TTL_MINUTES)).isoformat() + "Z"
    cursor.execute("INSERT INTO sessions (user_id, token_hash, created_at, expires_at) VALUES (%s, %s, %s, %s)", (user["id"], digest, datetime.utcnow().isoformat() + "Z", expires_at))
    conn.commit(); conn.close()
    return {"token": token, "user": user}


@app.post("/api/auth/logout")
def logout(current_user: Dict[str, Any] = Depends(get_current_user)):
    token = None
    conn = db_connect(); cursor = conn.cursor();
    cursor.execute("DELETE FROM sessions WHERE user_id = %s", (current_user["id"],))
    conn.commit(); conn.close()
    return {"message": "Logged out successfully"}


@app.get("/api/auth/me")
def me(current_user: Dict[str, Any] = Depends(get_current_user)):
    return current_user


@app.put("/api/users/me")
def update_my_profile(payload: ProfileUpdateRequest, current_user: Dict[str, Any] = Depends(get_current_user)):
    changes = []
    if payload.name is not None:
        name = payload.name.strip()
        if not name:
            raise HTTPException(status_code=400, detail="Name cannot be empty")
        changes.append(("name", name))
    if payload.city is not None:
        city = payload.city.strip()
        if not city:
            raise HTTPException(status_code=400, detail="City cannot be empty")
        changes.append(("city", city))
    if payload.phone is not None:
        phone = payload.phone.strip()
        if not phone:
            raise HTTPException(status_code=400, detail="Phone number cannot be empty")
        changes.append(("phone", phone))
    if payload.streetAddress is not None:
        street = payload.streetAddress.strip()
        if not street:
            raise HTTPException(status_code=400, detail="Street address cannot be empty")
        changes.append(("street_address", street))
    if not changes:
        raise HTTPException(status_code=400, detail="No profile changes provided")
    conn = db_connect(); cursor = conn.cursor();
    for field, value in changes:
        cursor.execute(f"UPDATE users SET {field} = %s WHERE id = %s", (value, current_user["id"]))
    conn.commit(); conn.close()
    return {"message": "Profile updated successfully"}


@app.get("/api/users/me")
def get_my_profile(current_user: Dict[str, Any] = Depends(get_current_user)):
    conn = db_connect(); cursor = conn.cursor();
    cursor.execute("SELECT * FROM users WHERE id = %s", (current_user["id"],))
    row = cursor.fetchone(); conn.close()
    if not row:
        raise HTTPException(status_code=404, detail="User not found")
    return user_to_model(row)


@app.get("/api/users/{user_id}")
def get_user_profile(user_id: int, current_user: Dict[str, Any] = Depends(get_current_user)):
    conn = db_connect(); cursor = conn.cursor();
    cursor.execute("SELECT * FROM users WHERE id = %s", (user_id,))
    row = cursor.fetchone();
    if not row:
        conn.close();
        raise HTTPException(status_code=404, detail="User not found")
    if current_user["role"] == "user" and row["id"] != current_user["id"]:
        conn.close();
        raise HTTPException(status_code=403, detail="You cannot access another user's profile")
    if current_user["role"] == "department":
        if current_user["departmentId"] is None:
            conn.close();
            raise HTTPException(status_code=403, detail="Department account is missing department assignment")
        cursor.execute(
            "SELECT EXISTS(SELECT 1 FROM complaints WHERE user_id = %s AND department_id = %s) AS allowed",
            (user_id, current_user["departmentId"]),
        )
        if not cursor.fetchone()["allowed"]:
            conn.close();
            raise HTTPException(status_code=403, detail="You are not authorized to view this profile")
    conn.close();
    return user_to_model(row).model_dump()


@app.get("/api/dashboard/summary")
def dashboard_summary(current_user: Dict[str, Any] = Depends(get_current_user)):
    conn = db_connect(); cursor = conn.cursor();
    if current_user["role"] == "user":
        cursor.execute("SELECT * FROM complaints WHERE user_id = %s ORDER BY created_at DESC", (current_user["id"],))
        rows = cursor.fetchall()
        pending = sum(1 for row in rows if _normalize_status(row["status"]) == "Pending")
        in_progress = sum(1 for row in rows if _normalize_status(row["status"]) == "In Progress")
        resolved = sum(1 for row in rows if _normalize_status(row["status"]) == "Resolved")
        result = {
            "totalComplaints": len(rows),
            "pending": pending,
            "inProgress": in_progress,
            "resolved": resolved,
            "users": 1,
            "departmentBreakdown": {},
        }
        conn.close()
        return result
    if current_user["role"] == "admin":
        cursor.execute("SELECT * FROM complaints ORDER BY created_at DESC")
        rows = cursor.fetchall()
        cursor.execute("SELECT COUNT(*) AS count FROM users")
        users = cursor.fetchone()["count"]
        breakdown = {"Electricity": 0, "Gas": 0, "Water": 0}
        for row in rows:
            department_name = DEPARTMENT_NAMES.get(row["department_id"], "Electricity")
            breakdown[department_name] = breakdown.get(department_name, 0) + 1
        result = {
            "totalComplaints": len(rows),
            "pending": sum(1 for row in rows if _normalize_status(row["status"]) == "Pending"),
            "inProgress": sum(1 for row in rows if _normalize_status(row["status"]) == "In Progress"),
            "resolved": sum(1 for row in rows if _normalize_status(row["status"]) == "Resolved"),
            "users": users,
            "departmentBreakdown": breakdown,
        }
        conn.close()
        return result
    cursor.execute("SELECT * FROM complaints WHERE department_id = %s ORDER BY created_at DESC", (current_user["departmentId"],))
    rows = cursor.fetchall()
    result = {
        "totalComplaints": len(rows),
        "pending": sum(1 for row in rows if _normalize_status(row["status"]) == "Pending"),
        "inProgress": sum(1 for row in rows if _normalize_status(row["status"]) == "In Progress"),
        "resolved": sum(1 for row in rows if _normalize_status(row["status"]) == "Resolved"),
        "users": 0,
        "departmentBreakdown": {DEPARTMENT_NAMES.get(current_user["departmentId"], "Electricity"): len(rows)},
    }
    conn.close()
    return result


@app.get("/api/admin/users")
def admin_users(current_user: Dict[str, Any] = Depends(require_roles("admin"))):
    conn = db_connect(); cursor = conn.cursor();
    cursor.execute("SELECT * FROM users ORDER BY created_at DESC")
    rows = cursor.fetchall(); conn.close();
    return [user_to_model(row).model_dump() for row in rows]


@app.get("/api/admin/complaints")
def admin_complaints(current_user: Dict[str, Any] = Depends(require_roles("admin"))):
    conn = db_connect(); cursor = conn.cursor();
    cursor.execute(
        """
        SELECT c.*, u.name as user_name, u.email as user_email, u.city as user_city, u.phone as user_phone, u.street_address as user_street_address, d.name as department_name
        FROM complaints c
        INNER JOIN users u ON u.id = c.user_id
        INNER JOIN departments d ON d.id = c.department_id
        ORDER BY c.created_at DESC
        """
    )
    rows = cursor.fetchall(); conn.close();
    records = []
    for row in rows:
        history = []
        conn_h = db_connect(); cursor_h = conn_h.cursor();
        cursor_h.execute("SELECT actor, note, created_at FROM complaint_events WHERE complaint_id = %s ORDER BY id ASC", (row["id"],))
        history = [{"actor": item["actor"], "note": item["note"], "time": format_timestamp(item["created_at"])} for item in cursor_h.fetchall()]
        conn_h.close()
        records.append(serialize_complaint(row, history))
    return [item.model_dump() for item in records]


@app.get("/api/departments/{department_id}/complaints")
def department_complaints(department_id: int, current_user: Dict[str, Any] = Depends(require_roles("department"))):
    if current_user["departmentId"] != department_id:
        raise HTTPException(status_code=403, detail="You are not authorized to access this department data")
    conn = db_connect(); cursor = conn.cursor();
    cursor.execute(
        """
        SELECT c.*, u.name as user_name, u.email as user_email, u.city as user_city, u.phone as user_phone, u.street_address as user_street_address, d.name as department_name
        FROM complaints c
        INNER JOIN users u ON u.id = c.user_id
        INNER JOIN departments d ON d.id = c.department_id
        WHERE c.department_id = %s
        ORDER BY c.created_at DESC
        """,
        (department_id,),
    )
    rows = cursor.fetchall(); conn.close();
    records = []
    for row in rows:
        conn_h = db_connect(); cursor_h = conn_h.cursor();
        cursor_h.execute("SELECT actor, note, created_at FROM complaint_events WHERE complaint_id = %s ORDER BY id ASC", (row["id"],))
        events = [{"actor": item["actor"], "note": item["note"], "time": format_timestamp(item["created_at"])} for item in cursor_h.fetchall()]
        conn_h.close()
        records.append(serialize_complaint(row, events))
    return [item.model_dump() for item in records]


@app.get("/api/complaints")
def list_user_complaints(current_user: Dict[str, Any] = Depends(get_current_user)):
    conn = db_connect(); cursor = conn.cursor();
    if current_user["role"] == "admin":
        cursor.execute(
            """
            SELECT c.*, u.name as user_name, u.email as user_email, u.city as user_city, u.phone as user_phone, u.street_address as user_street_address, d.name as department_name
            FROM complaints c
            INNER JOIN users u ON u.id = c.user_id
            INNER JOIN departments d ON d.id = c.department_id
            ORDER BY c.created_at DESC
            """
        )
    elif current_user["role"] == "department":
        cursor.execute(
            """
            SELECT c.*, u.name as user_name, u.email as user_email, u.city as user_city, u.phone as user_phone, u.street_address as user_street_address, d.name as department_name
            FROM complaints c
            INNER JOIN users u ON u.id = c.user_id
            INNER JOIN departments d ON d.id = c.department_id
            WHERE c.department_id = %s
            ORDER BY c.created_at DESC
            """,
            (current_user["departmentId"],),
        )
    else:
        cursor.execute(
            """
            SELECT c.*, u.name as user_name, u.email as user_email, u.city as user_city, u.phone as user_phone, u.street_address as user_street_address, d.name as department_name
            FROM complaints c
            INNER JOIN users u ON u.id = c.user_id
            INNER JOIN departments d ON d.id = c.department_id
            WHERE c.user_id = %s
            ORDER BY c.created_at DESC
            """,
            (current_user["id"],),
        )
    rows = cursor.fetchall(); conn.close();
    output = []
    for row in rows:
        conn_h = db_connect(); cursor_h = conn_h.cursor();
        cursor_h.execute("SELECT actor, note, created_at FROM complaint_events WHERE complaint_id = %s ORDER BY id ASC", (row["id"],))
        history = [{"actor": item["actor"], "note": item["note"], "time": format_timestamp(item["created_at"])} for item in cursor_h.fetchall()]
        conn_h.close()
        output.append(serialize_complaint(row, history))
    return [item.model_dump() for item in output]


@app.post("/api/complaints")
def create_complaint(payload: ComplaintCreate, current_user: Dict[str, Any] = Depends(get_current_user)):
    if not payload.description or not payload.description.strip():
        raise HTTPException(status_code=400, detail="Complaint description is required")
    department_name, confidence = predict_department_from_text(payload.description)
    department_id = department_name_to_id(department_name)
    voice_note = None
    voice_note_mime_type = None
    if payload.voiceNoteData:
        try:
            voice_note = base64.b64decode(payload.voiceNoteData, validate=True)
        except (ValueError, TypeError):
            raise HTTPException(status_code=400, detail="Invalid voice note")
        if len(voice_note) > 8 * 1024 * 1024:
            raise HTTPException(status_code=413, detail="Voice note must be 8 MB or smaller")
        voice_note_mime_type = payload.voiceNoteMimeType or "audio/webm"
        if not voice_note_mime_type.startswith("audio/"):
            raise HTTPException(status_code=400, detail="Invalid voice note type")
    created_at = datetime.utcnow().isoformat() + "Z"
    status_value = _normalize_status(payload.status)
    conn = db_connect(); cursor = conn.cursor();
    cursor.execute(
        """
        INSERT INTO complaints (user_id, department_id, title, description, status, language, created_at, updated_at, voice_note_data, voice_note_mime_type)
        VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
        RETURNING id
        """,
        (
            current_user["id"],
            department_id,
            (payload.title or f"Complaint for {department_name}").strip()[:120],
            payload.description.strip(),
            status_value,
            payload.language or "English",
            created_at,
            created_at,
            voice_note,
            voice_note_mime_type,
        ),
    )
    complaint_id = cursor.fetchone()["id"]
    cursor.execute(
        "INSERT INTO complaint_events (complaint_id, actor, note, created_at) VALUES (%s, %s, %s, %s)",
        (complaint_id, "Citizen", "Complaint submitted by user", created_at),
    )
    cursor.execute(
        "INSERT INTO complaint_events (complaint_id, actor, note, created_at) VALUES (%s, %s, %s, %s)",
        (complaint_id, "AI", f"Auto-routed to {department_name} ({confidence:.0%})", created_at),
    )
    conn.commit(); conn.close();
    return {"message": "Complaint created successfully", "department": department_name, "confidence": confidence}


@app.get("/api/complaints/{complaint_id}/voice-note")
def get_voice_note(complaint_id: int, current_user: Dict[str, Any] = Depends(get_current_user)):
    conn = db_connect(); cursor = conn.cursor()
    cursor.execute("SELECT user_id, department_id, voice_note_data, voice_note_mime_type FROM complaints WHERE id = %s", (complaint_id,))
    row = cursor.fetchone(); conn.close()
    if not row or not row["voice_note_data"]:
        raise HTTPException(status_code=404, detail="Voice note not found")
    if current_user["role"] == "user" and row["user_id"] != current_user["id"]:
        raise HTTPException(status_code=403, detail="Forbidden")
    if current_user["role"] == "department" and row["department_id"] != current_user["departmentId"]:
        raise HTTPException(status_code=403, detail="Forbidden")
    return Response(content=row["voice_note_data"], media_type=row["voice_note_mime_type"] or "audio/webm")


@app.get("/api/complaints/{complaint_id}")
def get_complaint_detail(complaint_id: int, current_user: Dict[str, Any] = Depends(get_current_user)):
    conn = db_connect(); cursor = conn.cursor();
    cursor.execute(
        """
        SELECT c.*, u.name as user_name, d.name as department_name
        FROM complaints c
        INNER JOIN users u ON u.id = c.user_id
        INNER JOIN departments d ON d.id = c.department_id
        WHERE c.id = %s
        """,
        (complaint_id,),
    )
    row = cursor.fetchone(); conn.close()
    if not row:
        raise HTTPException(status_code=404, detail="Complaint not found")
    if current_user["role"] == "user" and row["user_id"] != current_user["id"]:
        raise HTTPException(status_code=403, detail="You cannot access another user's complaint")
    if current_user["role"] == "department" and row["department_id"] != current_user["departmentId"]:
        raise HTTPException(status_code=403, detail="This complaint is assigned to another department")
    conn_h = db_connect(); cursor_h = conn_h.cursor();
    cursor_h.execute("SELECT actor, note, created_at FROM complaint_events WHERE complaint_id = %s ORDER BY id ASC", (complaint_id,))
    history = [{"actor": item["actor"], "note": item["note"], "time": format_timestamp(item["created_at"])} for item in cursor_h.fetchall()]
    conn_h.close()
    return serialize_complaint(row, history).model_dump()


@app.put("/api/complaints/{complaint_id}")
def update_complaint(complaint_id: int, payload: ComplaintUpdate, current_user: Dict[str, Any] = Depends(get_current_user)):
    conn = db_connect(); cursor = conn.cursor();
    cursor.execute("SELECT * FROM complaints WHERE id = %s", (complaint_id,))
    row = cursor.fetchone();
    if not row:
        conn.close()
        raise HTTPException(status_code=404, detail="Complaint not found")
    if current_user["role"] == "user" and row["user_id"] != current_user["id"]:
        conn.close(); raise HTTPException(status_code=403, detail="You cannot update another user's complaint")
    if current_user["role"] == "department" and row["department_id"] != current_user["departmentId"]:
        conn.close(); raise HTTPException(status_code=403, detail="This complaint belongs to another department")
    next_status = _normalize_status(payload.status) if payload.status else _normalize_status(row["status"])
    department_id = payload.departmentId if payload.departmentId is not None else row["department_id"]
    if current_user["role"] == "department" and department_id != current_user["departmentId"]:
        conn.close(); raise HTTPException(status_code=403, detail="Departments cannot reassign outside their own department")
    updated_at = datetime.utcnow().isoformat() + "Z"
    cursor.execute(
        "UPDATE complaints SET status = %s, department_id = %s, updated_at = %s WHERE id = %s",
        (next_status, department_id, updated_at, complaint_id),
    )
    note = payload.note or f"Status updated to {next_status}"
    cursor.execute(
        "INSERT INTO complaint_events (complaint_id, actor, note, created_at) VALUES (%s, %s, %s, %s)",
        (complaint_id, current_user["role"], note, updated_at),
    )
    conn.commit(); conn.close();
    return {"message": "Complaint updated successfully", "status": next_status}


@app.delete("/api/complaints/{complaint_id}")
def delete_complaint(complaint_id: int, current_user: Dict[str, Any] = Depends(get_current_user)):
    conn = db_connect(); cursor = conn.cursor()
    cursor.execute("SELECT user_id, department_id FROM complaints WHERE id = %s", (complaint_id,))
    row = cursor.fetchone()
    if not row:
        conn.close()
        raise HTTPException(status_code=404, detail="Complaint not found")
    if current_user["role"] != "user":
        conn.close()
        raise HTTPException(status_code=403, detail="Only citizens can delete complaints")
    if row["user_id"] != current_user["id"]:
        conn.close()
        raise HTTPException(status_code=403, detail="You cannot delete another user's complaint")
    cursor.execute("DELETE FROM complaint_events WHERE complaint_id = %s", (complaint_id,))
    cursor.execute("DELETE FROM complaints WHERE id = %s", (complaint_id,))
    conn.commit(); conn.close()
    return {"message": "Complaint deleted successfully"}


@app.get("/api/health")
def api_health():
    return {"status": "ok"}


@app.get("/")
def root():
    return {"message": "SCMS API is running"}


@app.get("/api/seed")
def seed_debug_info():
    return {"admin": ADMIN_EMAIL, "department1": DEPARTMENT_1_EMAIL, "department2": DEPARTMENT_2_EMAIL, "department3": DEPARTMENT_3_EMAIL}

