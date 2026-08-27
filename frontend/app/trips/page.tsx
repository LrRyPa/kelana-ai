"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import TripCard from "@/components/TripCard";
import { getTrips } from "@/services/tripService";
import { Trip } from "@/types/trip";

export default function TripsPage() {
    const [trips, setTrips] = useState<Trip[]>([]);
    const [loading, setLoading] = useState(true);
    
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    useEffect(() => {
        getTrips()
        .then((data) => setTrips(data))
        .catch((err) => console.error(err))
        .finally(() => setLoading(false));
    }, []);

    const totalPages = Math.ceil(trips.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginatedTrips = trips.slice(startIndex, endIndex);

    const handlePageChange = (newPage: number) => {
        if (newPage >= 1 && newPage <= totalPages) {
        setCurrentPage(newPage);
        window.scrollTo({ top: 0, behavior: "smooth" });
        }
    };

    if (loading) {
        return (
        <main className="min-h-screen bg-slate-950 text-white p-6 sm:p-12 flex items-center justify-center">
            <div className="text-center space-y-3">
            <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="text-slate-400 text-sm">Loading trip history...</p>
            </div>
        </main>
        );
    }

    return (
        <main className="min-h-screen w-full bg-slate-950 text-white p-6 sm:p-12 pb-24">
        <div className="max-w-5xl mx-auto space-y-8">
            
            {/* Header Dashboard */}
            <div className="flex items-center justify-between pb-6 border-b border-slate-800">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Trip History</h1>
                <p className="text-slate-400 text-sm mt-1">
                {trips.length} saved {trips.length === 1 ? "itinerary" : "itineraries"}
                </p>
            </div>
            <Link
                href="/"
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-sm transition-colors shadow-md"
            >
                + Plan New Trip
            </Link>
            </div>

            {/* Empty State */}
            {trips.length === 0 ? (
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-12 text-center space-y-4">
                <div className="w-16 h-16 bg-slate-800 text-3xl flex items-center justify-center rounded-2xl mx-auto border border-slate-700/60">
                ✈️
                </div>
                <h3 className="text-xl font-bold text-white">No trips found.</h3>
                <p className="text-slate-400 text-sm max-w-md mx-auto">
                You haven&apos;t generated any travel itineraries yet. Start planning your dream vacation now!
                </p>
                <Link
                href="/"
                className="inline-block px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-sm transition-colors mt-2"
                >
                Generate a Trip →
                </Link>
            </div>
            ) : (
            <div className="space-y-6">
                {/* Daftar TripCard Ter-paginasi */}
                <div className="space-y-4">
                {paginatedTrips.map((trip) => (
                    <TripCard key={trip.id} trip={trip} />
                ))}
                </div>

                {/* Fitur Bonus: Kontrol Paginasi */}
                {totalPages > 1 && (
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-slate-800/80 text-sm">
                    <p className="text-slate-400 text-xs sm:text-sm">
                    Showing <span className="font-semibold text-white">{startIndex + 1}</span> to{" "}
                    <span className="font-semibold text-white">
                        {Math.min(endIndex, trips.length)}
                    </span>{" "}
                    of <span className="font-semibold text-white">{trips.length}</span> itineraries
                    </p>

                    <div className="flex items-center gap-2">
                    <button
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                        className="px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-300 disabled:opacity-40 disabled:hover:bg-slate-900 transition-colors text-xs font-semibold"
                    >
                        ← Previous
                    </button>

                    <div className="flex items-center gap-1 px-2">
                        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                        <button
                            key={page}
                            onClick={() => handlePageChange(page)}
                            className={`w-8 h-8 rounded-lg text-xs font-bold transition-all ${
                            currentPage === page
                                ? "bg-indigo-600 text-white shadow-md"
                                : "bg-slate-900 border border-slate-800 text-slate-400 hover:bg-slate-800"
                            }`}
                        >
                            {page}
                        </button>
                        ))}
                    </div>

                    <button
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        className="px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-300 disabled:opacity-40 disabled:hover:bg-slate-900 transition-colors text-xs font-semibold"
                    >
                        Next →
                    </button>
                    </div>
                </div>
                )}
            </div>
            )}
        </div>
    </main>
  );
}