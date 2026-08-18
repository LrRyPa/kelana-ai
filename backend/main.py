from typing import List
from fastapi import FastAPI
from pydantic import BaseModel

from services.trip_service import (
    get_trip_category,
    calculate_daily_budget
)

app = FastAPI(
    title="KelanaAI API",
    description="Backend API untuk perencanaan perjalanan KelanaAI",
    version="1.0.0"
)

class TripRequest(BaseModel):
    destination: str
    days: int
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

    return {
        "destination": request.destination,
        "days": request.days,
        "budget": request.budget,
        "daily_budget": daily_budget,
        "category": category
    }

@app.get("/api/v1/recommendations", response_model=List[str], tags=["Recommendations"])
def get_recommendations() -> list[str]:
    return ["Tokyo Tower", "Mount Fuji", "Shibuya"]


@app.get("/api/v1/transportations", response_model=List[str], tags=["Transportations"])
def get_transportations() -> list[str]:
    return ["Bus", "Train", "Flight"]


@app.get("/api/v1/trip-categories", response_model=List[str], tags=["Categories"])
def get_trip_categories() -> list[str]:
    return ["Backpacker", "Standard", "Luxury"]