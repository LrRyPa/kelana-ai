def get_trip_category(budget: float) -> str:
    if budget < 1000:
        return "Backpacker"
    elif budget <= 3000:
        return "Standard"
    else:
        return "Luxury"


def get_travel_season(month: str) -> str:
    months = month.strip().capitalize()
    
    if months == "December":
        return "Peak Season"
    elif months == "June":
        return "Holiday Season"
    else:
        return "Regular Season"


def calculate_daily_budget(budget: float, days: int) -> float:
    if days <= 0:
        return 0.0
    return budget / days


def get_recommended_places(destination: str) -> list:
    recommendations = {
        "bali": ["Pantai Kuta", "Ubud Monkey Forest", "Tanah Lot"],
        "japan": ["Shinjuku", "Mount Fuji", "Kyoto Fushimi Inari"],
        "tokyo": ["Shibuya Crossing", "Tokyo Tower", "Senso-ji Temple"]
    }
    
    dest_key = destination.strip().lower()
    return recommendations.get(dest_key, ["Pusat Kota", "Taman Kota", "Museum Lokal"])