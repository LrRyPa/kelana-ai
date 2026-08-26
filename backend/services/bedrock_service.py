import os
import requests
from dotenv import load_dotenv

load_dotenv(override=True)

def generate_trip_itinerary(destination: str, days: int, budget: float, category: str) -> str:
    token = os.getenv("AWS_BEARER_TOKEN_BEDROCK", "").strip()
    region = os.getenv("AWS_REGION", "ap-southeast-2")
    model_id = os.getenv("MODEL_ID", "amazon.nova-lite-v1:0")

    url = f"https://bedrock-runtime.{region}.amazonaws.com/model/{model_id}/converse"

    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json"
    }

    prompt = f"""
You are an experienced and professional travel planner.
Create a structured and rich {days}-day travel itinerary for {destination} with a total budget of USD {budget} (Travel Style: {category}).

For EVERY single day of the trip, you MUST structure the plan exactly using the following format:

Day X: [Title of the day's theme]

Morning:
- Include 2-3 specific morning activities or sights to visit early.
- Include local breakfast spot recommendations.

Afternoon:
- Include cultural sites and authentic local experiences.
- Include lunch recommendations.

Evening:
- Include specific dinner spots (authentic restaurants or local cuisine).
- Include evening activities or nightlife experiences.

Keep the tone engaging, practical, and well-structured.
"""

    payload = {
        "messages": [
            {
                "role": "user",
                "content": [{"text": prompt}]
            }
        ]
    }

    response = requests.post(url, headers=headers, json=payload)

    if response.status_code != 200:
        raise Exception(f"Bedrock API Error ({response.status_code}): {response.text}")

    data = response.json()
    ai_response = data["output"]["message"]["content"][0]["text"]
    return ai_response
