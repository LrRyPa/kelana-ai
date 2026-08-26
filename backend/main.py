from typing import List
from fastapi import FastAPI, HTTPException, status
from pydantic import BaseModel
from services.bedrock_service import generate_trip_itinerary

from database import SessionLocal, init_db
from models.trip import Trip
from services.trip_service import (
    get_trip_category,
    calculate_daily_budget
)

app = FastAPI(
    title="KelanaAI API",
    description="Layanan backend KelanaAI dengan PostgreSQL Persistence",
    version="1.0.0"
)

init_db()


class TripRequest(BaseModel):
    destination: str
    days: int
    budget: float


class TripUpdateRequest(BaseModel):
    budget: float

@app.get("/", tags=["General"])
def home():
    return {"message": "Welcome to KelanaAI"}


@app.get("/health", tags=["General"])
def health_check():
    return {"status": "OK"}

@app.post("/api/v1/trips", tags=["Trips"])
def create_trip(request: TripRequest):
    daily_budget = calculate_daily_budget(request.budget, request.days)
    category = get_trip_category(request.budget)

    trip = Trip(
        destination=request.destination,
        days=request.days,
        budget=request.budget,
        category=category,
        daily_budget=daily_budget
    )

    db = SessionLocal()
    db.add(trip)
    db.commit()
    db.refresh(trip)
    db.close()

    return trip

@app.get("/api/v1/trips", tags=["Trips"])
def list_trips():
    db = SessionLocal()
    trips = db.query(Trip).all()
    db.close()
    return trips

@app.get("/api/v1/trips/{trip_id}", tags=["Trips"])
def get_trip(trip_id: int):
    db = SessionLocal()
    trip = db.query(Trip).filter(Trip.id == trip_id).first()
    db.close()

    if trip is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Trip with id {trip_id} not found"
        )
    return trip

@app.put("/api/v1/trips/{trip_id}", tags=["Trips"])
def update_trip(trip_id: int, request: TripUpdateRequest):
    db = SessionLocal()
    trip = db.query(Trip).filter(Trip.id == trip_id).first()

    if trip is None:
        db.close()
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Trip with id {trip_id} not found"
        )

    trip.budget = request.budget
    trip.daily_budget = calculate_daily_budget(trip.budget, trip.days)
    trip.category = get_trip_category(trip.budget)

    db.commit()
    db.refresh(trip)
    db.close()

    return trip


@app.delete("/api/v1/trips/{trip_id}", tags=["Trips"])
def delete_trip(trip_id: int):
    db = SessionLocal()
    trip = db.query(Trip).filter(Trip.id == trip_id).first()

    if trip is None:
        db.close()
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Trip with id {trip_id} not found"
        )

    db.delete(trip)
    db.commit()
    db.close()

    return {"message": f"Trip with id {trip_id} deleted successfully"}

@app.get("/api/v1/recommendations", response_model=List[str], tags=["Recommendations"])
def get_recommendations() -> list[str]:
    return ["Tokyo Tower", "Mount Fuji", "Shibuya"]


@app.get("/api/v1/transportations", response_model=List[str], tags=["Transportations"])
def get_transportations() -> list[str]:
    return ["Bus", "Train", "Flight"]

@app.post("/api/v1/trips/{trip_id}/generate", tags=["Trips"])
def generate_trip_recommendation(trip_id: int):
    """
    Mengambil data trip dari DB, mengirim prompt ke Amazon Bedrock,
    menyimpan hasil AI ke kolom ai_recommendation di DB, lalu mengembalikannya.
    """
    db = SessionLocal()
    trip = db.query(Trip).filter(Trip.id == trip_id).first()

    if trip is None:
        db.close()
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Trip with id {trip_id} not found"
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
    db.close()

    return {
        "trip_id": trip.id,
        "destination": trip.destination,
        "recommendation": trip.ai_recommendation
    }