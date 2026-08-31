"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import TripCard from "@/components/TripCard";
import { Trip } from "@/types/trip";

export default function TripsPage() {
    const router = useRouter();
    const [trips, setTrips] = useState<Trip[]>([]);
    const [loading, setLoading] = useState(true);

    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (!token) {
        router.push("/login");
        return;
        }

        fetch("http://localhost:8000/api/v1/trips", {
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        },
        })
        .then(async (res) => {
            if (res.status === 401) {
            localStorage.removeItem("token");
            router.push("/login");
            return null;
            }
            if (!res.ok) {
            throw new Error(`Server Error: ${res.status}`);
            }
            return res.json();
        })
        .then((data) => {
            if (data) setTrips(data);
        })
        .catch((err) => {
            console.error("Gagal memuat trips:", err);
        })
        .finally(() => setLoading(false));
    }, [router]);

    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        router.push("/login");
    };

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
        <main className="min-h-screen bg-slate-950 text-white flex items-center justify-center font-sans">
            <div className="flex flex-col items-center gap-3">
            <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-xs text-slate-400 font-medium tracking-wide">
                Memuat riwayat perjalanan...
            </p>
            </div>
        </main>
        );
    }

    return (
        <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-indigo-500 selection:text-white">
        {/* Header Navigasi Konsisten */}
        <header className="border-b border-slate-800/80 bg-slate-900/50 backdrop-blur-md sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2">
                <span className="text-xl font-bold bg-gradient-to-r from-indigo-400 to-cyan-400 bg-clip-text text-transparent">
                KelanaAI
                </span>
            </Link>
            <nav className="flex items-center gap-6 text-sm text-slate-400">
                <Link href="/" className="hover:text-indigo-400 transition-colors">
                Planner
                </Link>
                <Link href="/trips" className="text-indigo-400 font-semibold">
                Riwayat
                </Link>
                <Link href="/profile" className="hover:text-indigo-400 transition-colors">
                Profil
                </Link>
                <button
                onClick={handleLogout}
                className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg transition-colors text-xs font-semibold cursor-pointer"
                >
                Logout
                </button>
            </nav>
            </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
            
            {/* Header Seksi */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-slate-800 gap-4">
            <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
                Riwayat Perjalanan
                </h1>
                <p className="text-xs text-slate-400 mt-1">
                Tersimpan {trips.length} {trips.length === 1 ? "rencana perjalanan" : "rencana perjalanan"}
                </p>
            </div>
            <Link
                href="/"
                className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs transition-all shadow-lg shadow-indigo-600/20 w-fit cursor-pointer flex items-center gap-1.5"
            >
                <span>+ Buat Perjalanan Baru</span>
            </Link>
            </div>

            {/* Dynamic Trip List atau Empty State */}
            {trips.length === 0 ? (
            <div className="bg-slate-900/70 border border-slate-800 rounded-3xl p-12 text-center space-y-4 shadow-xl backdrop-blur-sm">
                <div className="w-14 h-14 bg-slate-950 text-indigo-400 flex items-center justify-center rounded-2xl mx-auto border border-slate-800">
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="w-7 h-7"
                >
                    <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M6 12 3.269 3.125A59.769 59.769 0 0 1 21.485 12 59.768 59.768 0 0 1 3.27 20.875L5.999 12Zm0 0h7.5"
                    />
                </svg>
                </div>
                <h3 className="text-lg font-bold text-white">Belum Ada Riwayat Perjalanan</h3>
                <p className="text-slate-400 text-xs max-w-md mx-auto leading-relaxed">
                Kamu belum membuat itinerary perjalanan. Mulai rencanakan liburan impianmu sekarang dengan bantuan AI.
                </p>
                <div className="pt-2">
                <Link
                    href="/"
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs transition-all shadow-md shadow-indigo-600/20"
                >
                    <span>Mulai Buat Itinerary</span>
                    <span>&rarr;</span>
                </Link>
                </div>
            </div>
            ) : (
            <div className="space-y-6">
                <div className="space-y-4">
                {paginatedTrips.map((trip) => (
                    <TripCard key={trip.id} trip={trip} />
                ))}
                </div>

                {/* Pagination Component */}
                {totalPages > 1 && (
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-slate-800/80 text-xs">
                    <p className="text-slate-400">
                    Menampilkan <span className="font-semibold text-white">{startIndex + 1}</span> hingga{" "}
                    <span className="font-semibold text-white">
                        {Math.min(endIndex, trips.length)}
                    </span>{" "}
                    dari <span className="font-semibold text-white">{trips.length}</span> rencana
                    </p>

                    <div className="flex items-center gap-2">
                    <button
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                        className="px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-300 disabled:opacity-40 disabled:hover:bg-slate-900 transition-colors font-semibold cursor-pointer"
                    >
                        &larr; Sebelumnya
                    </button>

                    <div className="flex items-center gap-1 px-1">
                        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                        <button
                            key={page}
                            onClick={() => handlePageChange(page)}
                            className={`w-8 h-8 rounded-lg font-bold transition-all cursor-pointer ${
                            currentPage === page
                                ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
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
                        className="px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-300 disabled:opacity-40 disabled:hover:bg-slate-900 transition-colors font-semibold cursor-pointer"
                    >
                        Selanjutnya &rarr;
                    </button>
                    </div>
                </div>
                )}
            </div>
            )}
        </main>

        {/* Footer */}
        <footer className="border-t border-slate-900 bg-slate-950 py-6 mt-12">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-xs text-slate-500">
            © {new Date().getFullYear()} KelanaAI. Hak Cipta Dilindungi Undang-Undang.
            </div>
        </footer>
        </div>
    );
}