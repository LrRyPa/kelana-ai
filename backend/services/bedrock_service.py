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
    You are an experienced travel planner.
    Create a structured {days}-day travel itinerary for {destination} with a budget of USD {budget} (Travel Style: {category}).

    STRICT OUTPUT FORMAT RULES:
    - Do NOT use asterisk bold (**) on sub-headings like Morning, Afternoon, Evening, or Day.
    - Use simple hyphen (-) for list items.
    - Only use standard bold **Location/Restaurant Name** for actual names of places or restaurants.
    - Follow this structure EXACTLY for every day:

    Day X: [Title of the day]

    Morning:
    - Visit [Place 1] for [Activity].
    - Visit [Place 2] for [Activity].
    - Breakfast at **[Restaurant Name]**.

    Afternoon:
    - Explore [Cultural Site/Place].
    - Lunch at **[Restaurant Name]**.

    Evening:
    - Dinner at **[Restaurant Name]**.
    - Enjoy [Evening Activity].

    End the itinerary with 1 closing sentence.
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