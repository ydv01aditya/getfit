"""Get Fit Faster backend.

Endpoints grouped under /api:
- /auth/*        email+password JWT auth + Emergent Google OAuth
- /profile       get/update the authenticated user profile
- /stats/today   get/update today's steps/calories/water
- /activities    CRUD activity log entries (running, walking, cycling, ...)
- /meals         CRUD meal log entries (breakfast/lunch/dinner w/ macros)
- /ai/meal-suggest  single-shot GPT meal suggestion
- /ai/coach      multi-turn AI fitness coach chat
"""

from dotenv import load_dotenv
load_dotenv()

import os
import uuid
import logging
from datetime import datetime, timezone, timedelta, date
from typing import List, Optional, Literal

import bcrypt
import jwt
import httpx
from fastapi import FastAPI, APIRouter, HTTPException, Request, Response, Depends
from fastapi.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
from pydantic import BaseModel, Field, EmailStr

from emergentintegrations.llm.chat import LlmChat, UserMessage

# ---------- Setup ----------
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("getfit")

MONGO_URL = os.environ["MONGO_URL"]
DB_NAME = os.environ["DB_NAME"]
JWT_SECRET = os.environ["JWT_SECRET"]
EMERGENT_LLM_KEY = os.environ["EMERGENT_LLM_KEY"]
FRONTEND_URL = os.environ.get("FRONTEND_URL", "http://localhost:3000")

JWT_ALG = "HS256"
ACCESS_TTL_MIN = 60 * 24 * 7  # 7 days (mobile-friendly)

client = AsyncIOMotorClient(MONGO_URL)
db = client[DB_NAME]

app = FastAPI(title="Get Fit Faster API")
api = APIRouter(prefix="/api")

# CORS — allow the frontend origin + credentials
app.add_middleware(
    CORSMiddleware,
    allow_origins=[FRONTEND_URL, "http://localhost:3000", "http://localhost:19006"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ---------- Helpers ----------
def hash_password(pw: str) -> str:
    return bcrypt.hashpw(pw.encode(), bcrypt.gensalt()).decode()


def verify_password(pw: str, pw_hash: str) -> bool:
    return bcrypt.checkpw(pw.encode(), pw_hash.encode())


def create_access_token(user_id: str, email: str) -> str:
    payload = {
        "sub": user_id,
        "email": email,
        "exp": datetime.now(timezone.utc) + timedelta(minutes=ACCESS_TTL_MIN),
        "type": "access",
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALG)


def today_str() -> str:
    return date.today().isoformat()


def clean_doc(doc: dict) -> dict:
    """Strip Mongo's _id and stringify datetimes where necessary."""
    if not doc:
        return doc
    doc.pop("_id", None)
    doc.pop("password_hash", None)
    return doc


async def get_current_user(request: Request) -> dict:
    """Get the authenticated user from either JWT bearer or emergent session cookie."""
    # 1) JWT Bearer (email/pw)
    auth = request.headers.get("Authorization", "")
    if auth.startswith("Bearer "):
        token = auth[7:]
        try:
            payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALG])
            if payload.get("type") == "access":
                user = await db.users.find_one({"user_id": payload["sub"]}, {"_id": 0})
                if user:
                    user.pop("password_hash", None)
                    return user
        except jwt.InvalidTokenError:
            pass

    # 2) Emergent session token (cookie OR X-Session-Token header for mobile)
    session_token = request.cookies.get("session_token") or request.headers.get(
        "X-Session-Token"
    )
    if session_token:
        sess = await db.user_sessions.find_one({"session_token": session_token}, {"_id": 0})
        if sess:
            exp = sess["expires_at"]
            if isinstance(exp, str):
                exp = datetime.fromisoformat(exp)
            if exp.tzinfo is None:
                exp = exp.replace(tzinfo=timezone.utc)
            if exp >= datetime.now(timezone.utc):
                user = await db.users.find_one({"user_id": sess["user_id"]}, {"_id": 0})
                if user:
                    user.pop("password_hash", None)
                    return user

    raise HTTPException(status_code=401, detail="Not authenticated")


# ---------- Models ----------
class RegisterInput(BaseModel):
    email: EmailStr
    password: str = Field(min_length=6)
    name: str = Field(min_length=1)


class LoginInput(BaseModel):
    email: EmailStr
    password: str


class ProfileUpdate(BaseModel):
    name: Optional[str] = None
    height_cm: Optional[float] = None
    weight_kg: Optional[float] = None
    goal: Optional[str] = None  # e.g. "Lose 5 kg"
    target_weight_kg: Optional[float] = None


class StatsUpdate(BaseModel):
    steps: Optional[int] = None
    calories: Optional[int] = None
    water_l: Optional[float] = None


class ActivityInput(BaseModel):
    type: Literal["running", "walking", "cycling", "swimming", "yoga", "other"]
    duration_min: int = Field(gt=0)
    distance_km: float = Field(ge=0)
    calories: int = Field(ge=0)


class MealInput(BaseModel):
    meal_type: Literal["breakfast", "lunch", "dinner", "snack"]
    name: str
    calories: int = Field(ge=0)
    protein_g: float = Field(ge=0)
    carbs_g: float = Field(ge=0)
    fat_g: float = Field(ge=0)


class MealSuggestInput(BaseModel):
    goal: Optional[str] = None          # e.g. "lose weight"
    ingredients: Optional[str] = None   # e.g. "chicken, rice, broccoli"
    meal_type: Optional[str] = "lunch"


class CoachMessage(BaseModel):
    session_id: str
    message: str


# ---------- Startup: indexes ----------
@app.on_event("startup")
async def on_startup():
    await db.users.create_index("email", unique=True)
    await db.users.create_index("user_id", unique=True)
    await db.user_sessions.create_index("session_token", unique=True)
    await db.user_sessions.create_index("user_id")
    await db.activities.create_index([("user_id", 1), ("date", -1)])
    await db.meals.create_index([("user_id", 1), ("date", -1)])
    await db.daily_stats.create_index([("user_id", 1), ("date", 1)], unique=True)
    await db.coach_messages.create_index([("session_id", 1), ("created_at", 1)])
    logger.info("MongoDB indexes ensured")


@app.on_event("shutdown")
async def on_shutdown():
    client.close()


# =====================================================================
# AUTH — email/password JWT
# =====================================================================
@api.post("/auth/register")
async def auth_register(body: RegisterInput):
    email = body.email.lower()
    if await db.users.find_one({"email": email}):
        raise HTTPException(status_code=400, detail="Email already registered")
    user_id = f"user_{uuid.uuid4().hex[:12]}"
    doc = {
        "user_id": user_id,
        "email": email,
        "name": body.name.strip(),
        "password_hash": hash_password(body.password),
        "auth_provider": "password",
        "picture": None,
        "height_cm": 175.0,
        "weight_kg": 70.0,
        "goal": "Lose 5 kg",
        "target_weight_kg": 65.0,
        "created_at": datetime.now(timezone.utc),
    }
    await db.users.insert_one(doc)
    token = create_access_token(user_id, email)
    return {"token": token, "user": clean_doc({**doc})}


@api.post("/auth/login")
async def auth_login(body: LoginInput):
    email = body.email.lower()
    user = await db.users.find_one({"email": email})
    if not user or not user.get("password_hash"):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    if not verify_password(body.password, user["password_hash"]):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    token = create_access_token(user["user_id"], email)
    return {"token": token, "user": clean_doc({**user})}


@api.get("/auth/me")
async def auth_me(user: dict = Depends(get_current_user)):
    return user


@api.post("/auth/logout")
async def auth_logout(response: Response, request: Request):
    # Clear emergent cookie + return 200; mobile also just drops its stored JWT
    response.delete_cookie("session_token", path="/")
    session_token = request.cookies.get("session_token") or request.headers.get(
        "X-Session-Token"
    )
    if session_token:
        await db.user_sessions.delete_one({"session_token": session_token})
    return {"ok": True}


# =====================================================================
# AUTH — Emergent Google OAuth session exchange
# =====================================================================
# REMINDER: DO NOT HARDCODE THE URL, OR ADD ANY FALLBACKS OR REDIRECT URLS,
# THIS BREAKS THE AUTH (frontend derives redirect from window.location.origin).
@api.post("/auth/google/session")
async def auth_google_session(request: Request, response: Response):
    body = await request.json()
    session_id = body.get("session_id")
    if not session_id:
        raise HTTPException(status_code=400, detail="session_id required")

    async with httpx.AsyncClient(timeout=15.0) as hc:
        r = await hc.get(
            "https://demobackend.emergentagent.com/auth/v1/env/oauth/session-data",
            headers={"X-Session-ID": session_id},
        )
    if r.status_code != 200:
        raise HTTPException(status_code=401, detail="Invalid Google session")
    data = r.json()

    email = (data.get("email") or "").lower()
    name = data.get("name") or email.split("@")[0]
    picture = data.get("picture")
    session_token = data["session_token"]

    user = await db.users.find_one({"email": email})
    if not user:
        user_id = f"user_{uuid.uuid4().hex[:12]}"
        user = {
            "user_id": user_id,
            "email": email,
            "name": name,
            "picture": picture,
            "auth_provider": "google",
            "password_hash": None,
            "height_cm": 175.0,
            "weight_kg": 70.0,
            "goal": "Lose 5 kg",
            "target_weight_kg": 65.0,
            "created_at": datetime.now(timezone.utc),
        }
        await db.users.insert_one(user)
    else:
        # merge / refresh google picture
        await db.users.update_one(
            {"user_id": user["user_id"]},
            {"$set": {"picture": picture, "name": user.get("name") or name}},
        )

    expires_at = datetime.now(timezone.utc) + timedelta(days=7)
    await db.user_sessions.update_one(
        {"session_token": session_token},
        {
            "$set": {
                "user_id": user["user_id"],
                "session_token": session_token,
                "expires_at": expires_at,
                "created_at": datetime.now(timezone.utc),
            }
        },
        upsert=True,
    )

    response.set_cookie(
        key="session_token",
        value=session_token,
        httponly=True,
        secure=True,
        samesite="none",
        max_age=7 * 24 * 3600,
        path="/",
    )

    return {"user": clean_doc({**user}), "session_token": session_token}


# =====================================================================
# PROFILE
# =====================================================================
@api.get("/profile")
async def get_profile(user: dict = Depends(get_current_user)):
    return user


@api.put("/profile")
async def update_profile(
    body: ProfileUpdate, user: dict = Depends(get_current_user)
):
    updates = {k: v for k, v in body.dict().items() if v is not None}
    if updates:
        await db.users.update_one({"user_id": user["user_id"]}, {"$set": updates})
    updated = await db.users.find_one({"user_id": user["user_id"]}, {"_id": 0})
    updated.pop("password_hash", None)
    return updated


# =====================================================================
# DAILY STATS (steps / calories / water)
# =====================================================================
async def get_or_create_today_stats(user_id: str) -> dict:
    d = today_str()
    existing = await db.daily_stats.find_one({"user_id": user_id, "date": d}, {"_id": 0})
    if existing:
        return existing
    doc = {
        "user_id": user_id,
        "date": d,
        "steps": 0,
        "calories": 0,
        "water_l": 0.0,
        "steps_goal": 10000,
        "water_goal_l": 3.0,
    }
    await db.daily_stats.insert_one(doc)
    doc.pop("_id", None)
    return doc


@api.get("/stats/today")
async def stats_today(user: dict = Depends(get_current_user)):
    return await get_or_create_today_stats(user["user_id"])


@api.put("/stats/today")
async def update_stats(
    body: StatsUpdate, user: dict = Depends(get_current_user)
):
    await get_or_create_today_stats(user["user_id"])
    updates = {k: v for k, v in body.dict().items() if v is not None}
    if updates:
        await db.daily_stats.update_one(
            {"user_id": user["user_id"], "date": today_str()}, {"$set": updates}
        )
    return await db.daily_stats.find_one(
        {"user_id": user["user_id"], "date": today_str()}, {"_id": 0}
    )


# =====================================================================
# ACTIVITIES CRUD
# =====================================================================
@api.get("/activities")
async def list_activities(user: dict = Depends(get_current_user)):
    d = today_str()
    cursor = db.activities.find(
        {"user_id": user["user_id"], "date": d}, {"_id": 0}
    ).sort("created_at", -1)
    return await cursor.to_list(length=500)


@api.post("/activities")
async def create_activity(
    body: ActivityInput, user: dict = Depends(get_current_user)
):
    doc = {
        "id": str(uuid.uuid4()),
        "user_id": user["user_id"],
        "date": today_str(),
        "type": body.type,
        "duration_min": body.duration_min,
        "distance_km": body.distance_km,
        "calories": body.calories,
        "created_at": datetime.now(timezone.utc).isoformat(),
    }
    await db.activities.insert_one(doc.copy())
    return {k: v for k, v in doc.items() if k != "_id"}


@api.put("/activities/{activity_id}")
async def update_activity(
    activity_id: str,
    body: ActivityInput,
    user: dict = Depends(get_current_user),
):
    res = await db.activities.update_one(
        {"id": activity_id, "user_id": user["user_id"]},
        {"$set": body.dict()},
    )
    if res.matched_count == 0:
        raise HTTPException(status_code=404, detail="Activity not found")
    return await db.activities.find_one({"id": activity_id}, {"_id": 0})


@api.delete("/activities/{activity_id}")
async def delete_activity(
    activity_id: str, user: dict = Depends(get_current_user)
):
    res = await db.activities.delete_one(
        {"id": activity_id, "user_id": user["user_id"]}
    )
    if res.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Activity not found")
    return {"ok": True}


# =====================================================================
# MEALS CRUD
# =====================================================================
@api.get("/meals")
async def list_meals(user: dict = Depends(get_current_user)):
    d = today_str()
    cursor = db.meals.find(
        {"user_id": user["user_id"], "date": d}, {"_id": 0}
    ).sort("created_at", 1)
    return await cursor.to_list(length=500)


@api.post("/meals")
async def create_meal(body: MealInput, user: dict = Depends(get_current_user)):
    doc = {
        "id": str(uuid.uuid4()),
        "user_id": user["user_id"],
        "date": today_str(),
        "meal_type": body.meal_type,
        "name": body.name,
        "calories": body.calories,
        "protein_g": body.protein_g,
        "carbs_g": body.carbs_g,
        "fat_g": body.fat_g,
        "created_at": datetime.now(timezone.utc).isoformat(),
    }
    await db.meals.insert_one(doc.copy())
    return {k: v for k, v in doc.items() if k != "_id"}


@api.put("/meals/{meal_id}")
async def update_meal(
    meal_id: str, body: MealInput, user: dict = Depends(get_current_user)
):
    res = await db.meals.update_one(
        {"id": meal_id, "user_id": user["user_id"]}, {"$set": body.dict()}
    )
    if res.matched_count == 0:
        raise HTTPException(status_code=404, detail="Meal not found")
    return await db.meals.find_one({"id": meal_id}, {"_id": 0})


@api.delete("/meals/{meal_id}")
async def delete_meal(meal_id: str, user: dict = Depends(get_current_user)):
    res = await db.meals.delete_one(
        {"id": meal_id, "user_id": user["user_id"]}
    )
    if res.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Meal not found")
    return {"ok": True}


# =====================================================================
# AI — meal suggestion (single shot) + fitness coach (multi-turn)
# =====================================================================
def _safe_json_extract(text: str) -> Optional[dict]:
    import json, re
    m = re.search(r"\{[\s\S]*\}", text or "")
    if not m:
        return None
    try:
        return json.loads(m.group(0))
    except Exception:
        return None


@api.post("/ai/meal-suggest")
async def ai_meal_suggest(
    body: MealSuggestInput, user: dict = Depends(get_current_user)
):
    system = (
        "You are a certified nutritionist. Return ONLY a single JSON object with keys: "
        "name (string), description (1-2 sentence string), calories (integer kcal), "
        "protein_g (number), carbs_g (number), fat_g (number). No markdown, no prose outside JSON."
    )
    prompt_parts = [f"Suggest a healthy {body.meal_type or 'meal'}."]
    if body.goal:
        prompt_parts.append(f"User goal: {body.goal}.")
    if body.ingredients:
        prompt_parts.append(f"Preferred ingredients: {body.ingredients}.")
    prompt_parts.append(
        "Keep it practical and realistic. Respond with JSON only."
    )

    chat = LlmChat(
        api_key=EMERGENT_LLM_KEY,
        session_id=f"meal_{user['user_id']}_{uuid.uuid4().hex[:6]}",
        system_message=system,
    ).with_model("openai", "gpt-5.1")

    raw = await chat.send_message(UserMessage(text=" ".join(prompt_parts)))
    parsed = _safe_json_extract(raw) or {}
    return {
        "name": parsed.get("name") or "Healthy Bowl",
        "description": parsed.get("description") or raw[:200],
        "calories": int(parsed.get("calories") or 450),
        "protein_g": float(parsed.get("protein_g") or 30),
        "carbs_g": float(parsed.get("carbs_g") or 45),
        "fat_g": float(parsed.get("fat_g") or 15),
        "meal_type": body.meal_type or "lunch",
    }


@api.post("/ai/coach")
async def ai_coach(
    body: CoachMessage, user: dict = Depends(get_current_user)
):
    """Multi-turn AI fitness coach. Frontend passes a stable session_id per chat."""
    system = (
        "You are 'Coach Ace', a warm, motivating fitness & nutrition coach. "
        "Give concise, practical, science-backed advice. Ask clarifying "
        "questions when helpful. Keep answers under 120 words unless asked."
    )

    # Build LlmChat with this user's session history
    chat = LlmChat(
        api_key=EMERGENT_LLM_KEY,
        session_id=f"{user['user_id']}_{body.session_id}",
        system_message=system,
    ).with_model("openai", "gpt-5.1")

    # Replay prior messages from Mongo so LlmChat has context
    prior = (
        await db.coach_messages.find(
            {"session_id": f"{user['user_id']}_{body.session_id}"}, {"_id": 0}
        )
        .sort("created_at", 1)
        .to_list(length=50)
    )
    for m in prior:
        if m["role"] == "user":
            await chat.send_message(UserMessage(text=m["content"]))

    reply = await chat.send_message(UserMessage(text=body.message))

    # Persist this turn
    now = datetime.now(timezone.utc).isoformat()
    await db.coach_messages.insert_many(
        [
            {
                "id": str(uuid.uuid4()),
                "session_id": f"{user['user_id']}_{body.session_id}",
                "user_id": user["user_id"],
                "role": "user",
                "content": body.message,
                "created_at": now,
            },
            {
                "id": str(uuid.uuid4()),
                "session_id": f"{user['user_id']}_{body.session_id}",
                "user_id": user["user_id"],
                "role": "assistant",
                "content": reply,
                "created_at": now,
            },
        ]
    )
    return {"reply": reply}


@api.get("/ai/coach/history")
async def ai_coach_history(
    session_id: str, user: dict = Depends(get_current_user)
):
    full = f"{user['user_id']}_{session_id}"
    msgs = (
        await db.coach_messages.find({"session_id": full}, {"_id": 0})
        .sort("created_at", 1)
        .to_list(length=200)
    )
    return msgs


# ---------- Health ----------
@api.get("/")
async def root():
    return {"service": "Get Fit Faster API", "ok": True}


app.include_router(api)
