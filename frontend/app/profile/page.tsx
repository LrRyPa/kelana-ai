"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface UserProfile {
    id: number;
    name: string;
    email: string;
    }

    export default function ProfilePage() {
    const router = useRouter();
    const [user, setUser] = useState<UserProfile | null>(null);
    const [tripCount, setTripCount] = useState(0);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (!token) {
        router.push("/login");
        return;
        }

        fetch("http://localhost:8000/api/v1/auth/me", {
        headers: { Authorization: `Bearer ${token}` },
        })
        .then((res) => {
            if (res.status === 401) {
            localStorage.removeItem("token");
            router.push("/login");
            return null;
            }
            if (!res.ok) throw new Error("Gagal memuat profil");
            return res.json();
        })
        .then((userData) => {
            if (!userData) return;
            setUser(userData);
            return fetch("http://localhost:8000/api/v1/trips", {
            headers: { Authorization: `Bearer ${token}` },
            });
        })
        .then((res) => (res && res.ok ? res.json() : []))
        .then((trips) => {
            if (Array.isArray(trips)) setTripCount(trips.length);
        })
        .catch((err) => console.error("Error loading profile:", err))
        .finally(() => setLoading(false));
    }, [router]);

    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        router.push("/login");
    };

    const getInitial = (name?: string) => {
        return name ? name.charAt(0).toUpperCase() : "U";
    };

    if (loading) {
        return (
        <main className="min-h-screen bg-slate-950 text-white flex items-center justify-center font-sans">
            <div className="flex flex-col items-center gap-3">
            <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-xs text-slate-400 font-medium tracking-wide">Memuat profil pengguna...</p>
            </div>
        </main>
        );
    }

    return (
        <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-indigo-500 selection:text-white">
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
                <Link href="/trips" className="hover:text-indigo-400 transition-colors">
                Riwayat
                </Link>
                <Link href="/profile" className="text-indigo-400 font-semibold">
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

        <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
            
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
                Profil Pengguna
                </h1>
                <p className="text-xs text-slate-400 mt-1">
                Informasi akun dan statistik aktivitas pembuatan rencana perjalanan
                </p>
            </div>
            <Link
                href="/"
                className="text-xs text-slate-300 hover:text-indigo-400 transition-colors flex items-center gap-1.5 bg-slate-900 border border-slate-800 px-3.5 py-2 rounded-xl"
            >
                <span>&larr;</span>
                <span>Kembali ke Planner</span>
            </Link>
            </div>

            <div className="bg-slate-900/70 border border-slate-800/90 rounded-2xl p-6 sm:p-8 shadow-2xl backdrop-blur-sm space-y-8">
            
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5 pb-6 border-b border-slate-800/80">
                <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-indigo-600 to-cyan-600 text-white flex items-center justify-center font-bold text-2xl shadow-lg border border-white/10">
                {getInitial(user?.name)}
                </div>
                <div className="text-center sm:text-left space-y-1">
                <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                    {user?.name || "User"}
                </h2>
                <p className="text-sm text-slate-400">{user?.email}</p>
                <div className="pt-1">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-semibold tracking-wider uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                    Akun Terverifikasi
                    </span>
                </div>
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-4 sm:p-5 space-y-1">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                    Nama Lengkap
                </span>
                <p className="text-sm sm:text-base font-semibold text-white">
                    {user?.name}
                </p>
                </div>

                <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-4 sm:p-5 space-y-1">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                    Alamat Email
                </span>
                <p className="text-sm sm:text-base font-semibold text-white">
                    {user?.email}
                </p>
                </div>
            </div>

            <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-5 sm:p-6 flex items-center justify-between">
                <div className="space-y-1">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                    Total Perjalanan Dibuat
                </span>
                <p className="text-2xl sm:text-3xl font-extrabold text-white">
                    {tripCount} <span className="text-xs sm:text-sm font-normal text-slate-400">Rencana</span>
                </p>
                </div>
                <Link
                href="/trips"
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-lg transition-all shadow-md shadow-indigo-600/20 cursor-pointer flex items-center gap-1"
                >
                <span>Lihat Riwayat</span>
                <span>&rarr;</span>
                </Link>
            </div>

            <div className="pt-2">
                <button
                onClick={handleLogout}
                className="w-full py-3 bg-rose-500/10 border border-rose-500/20 hover:bg-rose-500/20 text-rose-300 font-semibold rounded-xl text-xs sm:text-sm transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.8}
                    stroke="currentColor"
                    className="w-4 h-4"
                >
                    <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15M12 9l3 3m0 0-3 3m3-3H9"
                    />
                </svg>
                <span>Keluar dari Akun</span>
                </button>
            </div>

            </div>
        </main>

        <footer className="border-t border-slate-900 bg-slate-950 py-6 mt-12">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-xs text-slate-500">
            © {new Date().getFullYear()} KelanaAI. Hak Cipta Dilindungi Undang-Undang.
            </div>
        </footer>
        </div>
    );
}