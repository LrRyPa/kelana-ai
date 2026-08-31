const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

export interface Trip {
    id: number;
    destination: string;
    days: number;
    budget: number;
    category: string;
    daily_budget?: number;
    ai_recommendation?: string;
    user_id: number;
}

export const getTrips = async (): Promise<Trip[]> => {
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;

    const res = await fetch(`${API_URL}/trips`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`, 
        },
    });

    if (!res.ok) {
        throw new Error(`Gagal mengambil data trips: ${res.status}`);
    }

    return res.json();
};

export const getTripById = async (id: string | number): Promise<Trip> => {
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;

    const res = await fetch(`${API_URL}/trips/${id}`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        },
    });

    if (!res.ok) {
        throw new Error(`Gagal mengambil detail trip: ${res.status}`);
    }

    return res.json();
};

export const getTrip = getTripById;