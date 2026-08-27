import { Trip } from "@/types/trip";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

export async function getTrips(): Promise<Trip[]> {
    const res = await fetch(`${API_URL}/trips`, { cache: "no-store" });
    if (!res.ok) throw new Error("Gagal mengambil data trips");
    return res.json();
}

export async function getTrip(id: string | number): Promise<Trip> {
    const res = await fetch(`${API_URL}/trips/${id}`, { cache: "no-store" });
    if (!res.ok) throw new Error("Gagal mengambil detail trip");
    return res.json();
}

export async function generateTrip(data: {
    destination: string;
    days: number;
    budget: number;
    category: string;
}): Promise<Trip> {
    const res = await fetch(`${API_URL}/trips`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error("Gagal membuat trip baru");
    return res.json();
}