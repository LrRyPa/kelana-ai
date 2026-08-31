from typing import List
from fastapi import FastAPI, HTTPException, status, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from sqlalchemy.orm import Session

from database import SessionLocal, engine, get_db
from models.trip import Base, User, Trip 
from services.bedrock_service import generate_trip_itinerary
from services.trip_service import get_trip_category, calculate_daily_budget
import auth

Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="KelanaAI API",
    description="Layanan backend KelanaAI dengan Auth & PostgreSQL Persistence",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- SCHEMAS (PYDANTIC) ---

class UserRegister(BaseModel):
    name: str
    email: str
    password: str

class UserLogin(BaseModel):
    email: str
    password: str

class TripRequest(BaseModel):
    destination: str
    days: int
    budget: float
    category: str = "Family"

class TripUpdateRequest(BaseModel):
    budget: float


# --- GENERAL ENDPOINTS ---

@app.get("/", tags=["General"])
def home():
    return {"message": "Welcome to KelanaAI"}

@app.get("/health", tags=["General"])
def health_check():
    return {"status": "OK"}


# --- AUTHENTICATION ENDPOINTS (SESI 8) ---

@app.post("/api/v1/auth/register", tags=["Auth"])
def register(user_data: UserRegister, db: Session = Depends(get_db)):
    existing_user = db.query(User).filter(User.email == user_data.email).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="Email sudah terdaftar")
    
    hashed_pwd = auth.hash_password(user_data.password)
    new_user = User(
        name=user_data.name,
        email=user_data.email,
        password_hash=hashed_pwd
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return {"id": new_user.id, "name": new_user.name, "email": new_user.email}

@app.post("/api/v1/auth/login", tags=["Auth"])
def login(login_data: UserLogin, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == login_data.email).first()
    if not user or not auth.verify_password(login_data.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Email atau password salah")
    
    token = auth.create_access_token(data={"sub": str(user.id)})
    
    return {
        "access_token": token,
        "token_type": "Bearer",
        "user": {"id": user.id, "name": user.name, "email": user.email}
    }

@app.get("/api/v1/auth/me", tags=["Auth"])
def get_me(current_user: User = Depends(auth.get_current_user)):
    return {"id": current_user.id, "name": current_user.name, "email": current_user.email}


# --- TRIPS ENDPOINTS (DIPROTEKSI SESI 8) ---

# 1. CREATE: Mengunci user_id otomatis dari JWT
@app.post("/api/v1/trips", tags=["Trips"])
def create_trip(
    request: TripRequest, 
    db: Session = Depends(get_db),
    current_user: User = Depends(auth.get_current_user)
):
    daily_budget = calculate_daily_budget(request.budget, request.days)
    category = request.category if request.category else get_trip_category(request.budget)

    trip = Trip(
        destination=request.destination,
        days=request.days,
        budget=request.budget,
        category=category,
        daily_budget=daily_budget,
        user_id=current_user.id  # Diset otomatis dari token JWT
    )

    db.add(trip)
    db.commit()
    db.refresh(trip)
    return trip


# 2. VIEW: Hanya menampilkan trip milik pengguna yang login
@app.get("/api/v1/trips", tags=["Trips"])
def list_trips(
    db: Session = Depends(get_db),
    current_user: User = Depends(auth.get_current_user)
):
    return db.query(Trip).filter(Trip.user_id == current_user.id).all()


@app.get("/api/v1/trips/{trip_id}", tags=["Trips"])
def get_trip(
    trip_id: int, 
    db: Session = Depends(get_db),
    current_user: User = Depends(auth.get_current_user)
):
    trip = db.query(Trip).filter(Trip.id == trip_id).first()

    if trip is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Trip dengan id {trip_id} tidak ditemukan"
        )
    
    # Proteksi Otorisasi
    if trip.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Akses ditolak"
        )
        
    return trip


# 3. UPDATE: Tolak dengan HTTP 403 Forbidden jika user_id tidak cocok
@app.put("/api/v1/trips/{trip_id}", tags=["Trips"])
def update_trip(
    trip_id: int, 
    request: TripUpdateRequest, 
    db: Session = Depends(get_db),
    current_user: User = Depends(auth.get_current_user)
):
    trip = db.query(Trip).filter(Trip.id == trip_id).first()

    if trip is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Trip dengan id {trip_id} tidak ditemukan"
        )

    # Proteksi Otorisasi
    if trip.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Anda tidak memiliki izin untuk mengubah trip ini"
        )

    trip.budget = request.budget
    trip.daily_budget = calculate_daily_budget(trip.budget, trip.days)
    trip.category = get_trip_category(trip.budget)

    db.commit()
    db.refresh(trip)
    return trip


# 4. DELETE: Tolak dengan HTTP 403 Forbidden jika user_id tidak cocok
@app.delete("/api/v1/trips/{trip_id}", tags=["Trips"])
def delete_trip(
    trip_id: int, 
    db: Session = Depends(get_db),
    current_user: User = Depends(auth.get_current_user)
):
    trip = db.query(Trip).filter(Trip.id == trip_id).first()

    if trip is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Trip dengan id {trip_id} tidak ditemukan"
        )

    # Proteksi Otorisasi
    if trip.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Anda tidak memiliki izin untuk menghapus trip ini"
        )

    db.delete(trip)
    db.commit()
    return {"message": f"Trip dengan id {trip_id} berhasil dihapus"}


@app.post("/api/v1/trips/{trip_id}/generate", tags=["Trips"])
def generate_trip_recommendation(
    trip_id: int, 
    db: Session = Depends(get_db),
    current_user: User = Depends(auth.get_current_user)
):
    trip = db.query(Trip).filter(Trip.id == trip_id).first()

    if trip is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Trip dengan id {trip_id} tidak ditemukan"
        )

    if trip.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Akses ditolak"
        )

    itinerary_result = generate_trip_itinerary(
        destination=trip.destination,
        days=trip.days,
        budget=trip.budget,
        category=trip.category
    )

    trip.ai_recommendation = itinerary_result
    db.commit()
    db.refresh(trip)

    return {
        "id": trip.id,
        "destination": trip.destination,
        "days": trip.days,
        "budget": trip.budget,
        "category": trip.category,
        "ai_itinerary": trip.ai_recommendation
    }