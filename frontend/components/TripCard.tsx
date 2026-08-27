import Link from "next/link";
import { Trip } from "@/types/trip";

interface TripCardProps {
    trip: Trip;
}

export default function TripCard({ trip }: TripCardProps) {
    const formattedBudget = new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
        maximumFractionDigits: 0,
    }).format(trip.budget).replace("$", "USD ");

    const getCategoryBadgeClass = (budget: number) => {
        if (budget <= 800) {
        return { label: "Backpacker", bg: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30" };
        } else if (budget <= 2500) {
        return { label: "Standard", bg: "bg-blue-500/10 text-blue-400 border-blue-500/30" };
        } else {
        return { label: "Luxury", bg: "bg-amber-500/10 text-amber-400 border-amber-500/30" };
        }
    };

    const getDestinationIcon = (destination: string) => {
        const dest = destination.toLowerCase();

        if (
            dest.includes("indonesia") ||
            dest.includes("bali") ||
            dest.includes("bontang") ||
            dest.includes("samarinda") ||
            dest.includes("jakarta")
        ) {
            return "https://flagcdn.com/w80/id.png";
        }

        if (dest.includes("japan") || dest.includes("tokyo") || dest.includes("osaka")) {
            return "https://flagcdn.com/w80/jp.png";
        }

        if (dest.includes("korea")) {
            return "https://flagcdn.com/w80/kr.png";
        }

        if (dest.includes("singapore")) {
            return "https://flagcdn.com/w80/sg.png";
        }

        return null; 
    };

    const flagUrl = getDestinationIcon(trip.destination);
    const budgetCategory = getCategoryBadgeClass(trip.budget);

    return (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 hover:border-slate-700 transition-all shadow-lg flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start sm:items-center gap-4">
            {/* Destination Icon / Flag */}
            <div className="w-12 h-12 rounded-xl bg-slate-800 border border-slate-700/60 flex items-center justify-center text-2xl shadow-inner shrink-0 overflow-hidden">
            {flagUrl ? (
                <img
                src={flagUrl}
                alt={trip.destination}
                className="w-7 h-auto object-cover rounded-sm shadow-sm"
                />
            ) : (
                <span>✈️</span>
            )}
            </div>

            <div className="space-y-1.5 flex-1">
            {/* Kontainer Utama: Berjajar ke bawah di Mobile, Sejajar di Desktop */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-1.5 sm:gap-2">
                <h3 className="text-lg sm:text-xl font-bold text-white tracking-tight">
                {trip.destination}
                </h3>

                {/* Sub-kontainer Badge: Selalu horizontal di bawah nama destinasi (Mobile) */}
                <div className="flex items-center gap-2 flex-wrap">
                <span className={`text-xs px-2.5 py-0.5 rounded-full border font-semibold ${budgetCategory.bg}`}>
                    {budgetCategory.label}
                </span>

                {trip.category && (
                    <span className="text-xs px-2.5 py-0.5 rounded-full border bg-indigo-500/10 text-indigo-300 border-indigo-500/30 font-semibold">
                    {trip.category}
                    </span>
                )}
                </div>
            </div>

            <p className="text-sm text-slate-400">
                <span className="text-slate-300 font-medium">{trip.days} days</span> •{" "}
                <span className="text-emerald-400 font-semibold">{formattedBudget}</span>
            </p>
            </div>
        </div>

        {/* Action Button */}
        <Link
            href={`/trips/${trip.id}`}
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm transition-colors w-full sm:w-auto shrink-0 shadow-md"
        >
            View Details →
        </Link>
        </div>
    );
}