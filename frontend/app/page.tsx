"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";

interface TripData {
  id?: number;
  destination: string;
  budget: number;
  days: number;
  category: string;
  ai_itinerary?: string;
}

export default function Home() {
  const router = useRouter();
  const [destination, setDestination] = useState("Japan");
  const [budget, setBudget] = useState(2000);
  const [days, setDays] = useState(5);
  const [category, setCategory] = useState("Family");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [trip, setTrip] = useState<TripData | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
    }
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setTrip(null);

    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }

    const authHeaders = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    };

    try {
      const createRes = await fetch("http://localhost:8000/api/v1/trips", {
        method: "POST",
        headers: authHeaders,
        body: JSON.stringify({
          destination,
          budget: Number(budget),
          days: Number(days),
          category,
        }),
      });

      if (!createRes.ok) {
        if (createRes.status === 401) {
          localStorage.removeItem("token");
          router.push("/login");
          return;
        }
        throw new Error("Gagal menyimpan data perjalanan.");
      }
      const newTrip = await createRes.json();

      const genRes = await fetch(
        `http://localhost:8000/api/v1/trips/${newTrip.id}/generate`,
        {
          method: "POST",
          headers: authHeaders,
        }
      );

      if (!genRes.ok) throw new Error("Gagal merekomendasikan Rencana Perjalanan dengan AI.");
      const updatedTrip = await genRes.json();

      setTrip(updatedTrip);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Terjadi kesalahan saat memproses Rencana Perjalanan.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    router.push("/login");
  };

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
            <Link href="/" className="text-indigo-400 font-semibold">
              Planner
            </Link>
            <Link href="/trips" className="hover:text-indigo-400 transition-colors">
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
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
        
        {/* Hero Section */}
        <section className="relative rounded-3xl overflow-hidden border border-slate-800/80 shadow-2xl bg-slate-900">
          <div className="relative h-72 sm:h-96 w-full">
            <Image
              src="https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?q=80&w=1600&auto=format&fit=crop"
              alt="Hero Destination"
              fill
              priority
              className="object-cover object-center brightness-75 scale-100"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />
            <div className="absolute inset-0 flex flex-col justify-end p-6 sm:p-10 max-w-3xl space-y-2">
              <span className="inline-block px-3 py-1 rounded-full text-[11px] font-bold tracking-wider uppercase bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 w-fit">
                AI Travel Assistant
              </span>
              <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight leading-tight">
                Rencanakan Petualangan Impianmu dalam Hitungan Detik
              </h1>
              <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
                Didukung oleh Amazon Bedrock AI untuk menyusun rencana perjalanan harian yang presisi, efisien, dan personal.
              </p>
            </div>
          </div>
        </section>

        {/* Form Parameter Perjalanan */}
        <section id="planner" className="bg-slate-900/80 border border-slate-800/90 rounded-2xl p-6 sm:p-8 shadow-xl backdrop-blur-sm">
          <h2 className="text-lg sm:text-xl font-bold text-white mb-6">
            Atur Parameter Perjalanan
          </h2>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  Destinasi
                </label>
                <input
                  type="text"
                  required
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                  placeholder="Misal: Japan, Bali, Paris"
                  className="w-full bg-slate-950/80 border border-slate-700/80 focus:border-indigo-500 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 transition-all shadow-inner"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  Budget (USD)
                </label>
                <input
                  type="number"
                  required
                  min={100}
                  value={budget}
                  onChange={(e) => setBudget(Number(e.target.value))}
                  className="w-full bg-slate-950/80 border border-slate-700/80 focus:border-indigo-500 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 transition-all shadow-inner"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  Durasi (Hari)
                </label>
                <input
                  type="number"
                  required
                  min={1}
                  max={30}
                  value={days}
                  onChange={(e) => setDays(Number(e.target.value))}
                  className="w-full bg-slate-950/80 border border-slate-700/80 focus:border-indigo-500 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 transition-all shadow-inner"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  Gaya Perjalanan
                </label>
                <input
                  type="text"
                  required
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  placeholder="Family, Backpacker, Luxury"
                  className="w-full bg-slate-950/80 border border-slate-700/80 focus:border-indigo-500 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 transition-all shadow-inner"
                />
              </div>

            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-indigo-600 via-indigo-500 to-indigo-600 hover:from-indigo-500 hover:to-indigo-400 disabled:opacity-50 text-white font-bold py-3.5 px-6 rounded-xl shadow-lg shadow-indigo-600/30 transition-all flex items-center justify-center gap-2 cursor-pointer text-sm"
            >
              {loading ? (
                <>
                  <span className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></span>
                  <span>Menyusun Rencana Perjalanan...</span>
                </>
              ) : (
                <>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={2}
                    stroke="currentColor"
                    className="w-4 h-4"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 0 0-2.456 2.456Z"
                    />
                  </svg>
                  <span>Generate AI Trip</span>
                </>
              )}
            </button>
          </form>
        </section>

        {/* Loading State */}
        {loading && (
          <section className="bg-slate-900/60 border border-indigo-500/30 rounded-2xl p-10 text-center space-y-4 animate-pulse">
            <div className="inline-flex items-center justify-center p-3 rounded-full bg-indigo-500/10 text-indigo-400">
              <span className="w-6 h-6 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin"></span>
            </div>
            <h3 className="text-lg font-bold text-white">Sedang Menyusun Rencana Perjalanan...</h3>
            <p className="text-xs text-slate-400 max-w-md mx-auto">
              Amazon Bedrock AI sedang menganalisis destinasi <strong className="text-indigo-300">{destination}</strong> dengan budget <strong className="text-indigo-300 font-semibold">${budget}</strong>.
            </p>
          </section>
        )}

        {/* Error State */}
        {error && (
          <section className="bg-rose-950/40 border border-rose-800/80 rounded-2xl p-6 text-center space-y-3">
            <h3 className="text-base font-bold text-rose-300">Gagal Memproses Rencana</h3>
            <p className="text-xs text-rose-400">{error}</p>
            <button
              onClick={handleSubmit}
              className="px-4 py-2 bg-rose-900/60 hover:bg-rose-800 text-rose-200 text-xs font-semibold rounded-lg border border-rose-700 transition-colors cursor-pointer"
            >
              Coba Lagi
            </button>
          </section>
        )}

        {/* Result Output */}
        {trip && trip.ai_itinerary && (
          <section className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-2xl space-y-8 backdrop-blur-sm">
            
            {/* Trip Header Summary */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-slate-800 gap-4">
              <div>
                <span className="text-[11px] font-bold text-indigo-400 uppercase tracking-widest block">
                  Hasil Rekomendasi AI
                </span>
                <h3 className="text-xl sm:text-2xl font-bold text-white mt-1">
                  Rencana Perjalanan {trip.destination} ({trip.days} Hari)
                </h3>
              </div>
              <div className="flex items-center gap-3 text-xs bg-slate-950/80 px-4 py-2.5 rounded-xl border border-slate-800 w-fit">
                <span className="text-slate-400">Budget:</span>
                <span className="font-bold text-emerald-400">${trip.budget}</span>
                <span className="text-slate-700">|</span>
                <span className="text-slate-400">Gaya:</span>
                <span className="font-bold text-indigo-300">{trip.category}</span>
              </div>
            </div>

            {/* Parsed Itinerary Days */}
            <div className="space-y-6">
              {trip.ai_itinerary
                .split(/(?=Day \d+:)/g)
                .map((b) => b.trim())
                .filter((block) => block.length > 0 && block.startsWith("Day"))
                .map((dayBlock, dayIdx) => {
                  const validLines = dayBlock
                    .split("\n")
                    .map((l) => l.trim())
                    .filter((l) => {
                      if (!l || l === "---" || l === "***" || l === "___") return false;
                      return l.replace(/[^a-zA-Z0-9]/g, "").length > 0;
                    });

                  const rawTitle = validLines[0] || "";
                  const dayTitle = rawTitle.replace(/\*/g, "").replace(/^Day \d+:\s*/, "");
                  const contentLines = validLines.slice(1);

                  type GroupItem = {
                    type: "time" | "activities_header" | "item" | "closing";
                    text: string;
                    rawLine: string;
                  };

                  const groups: GroupItem[] = [];

                  contentLines.forEach((line) => {
                    const isBulletInput = line.startsWith("- ");
                    const cleanLine = isBulletInput ? line.slice(2).trim() : line;
                    const rawClean = cleanLine.replace(/\*/g, "").trim();
                    const lowerClean = rawClean.toLowerCase();

                    if (
                      lowerClean.startsWith("morning:") ||
                      lowerClean.startsWith("afternoon:") ||
                      lowerClean.startsWith("evening:")
                    ) {
                      groups.push({
                        type: "time",
                        text: rawClean.replace(":", "").trim(),
                        rawLine: line,
                      });
                    } else if (
                      lowerClean.startsWith("activities:") ||
                      lowerClean === "activities"
                    ) {
                      groups.push({
                        type: "activities_header",
                        text: "Aktivitas:",
                        rawLine: line,
                      });
                    } else if (
                      lowerClean.includes("this itinerary") ||
                      lowerClean.includes("enjoy your") ||
                      lowerClean.includes("have a great")
                    ) {
                      groups.push({
                        type: "closing",
                        text: cleanLine,
                        rawLine: line,
                      });
                    } else {
                      groups.push({
                        type: "item",
                        text: cleanLine,
                        rawLine: line,
                      });
                    }
                  });

                  const finalGroups = groups.filter((item, idx) => {
                    if (item.type === "activities_header") {
                      const nextItem = groups[idx + 1];
                      return nextItem && nextItem.type === "item";
                    }
                    return true;
                  });

                  return (
                    <div
                      key={dayIdx}
                      className="bg-slate-950/60 border border-slate-800/90 rounded-2xl p-5 sm:p-6 shadow-md space-y-4"
                    >
                      <div className="flex items-center gap-3 pb-3 border-b border-slate-800/80">
                        <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-indigo-500/10 text-indigo-400 font-bold text-xs border border-indigo-500/20">
                          {dayIdx + 1}
                        </span>
                        <h4 className="text-base sm:text-lg font-bold text-indigo-300">
                          Day {dayIdx + 1}: {dayTitle}
                        </h4>
                      </div>

                      <div className="space-y-3 sm:pl-2">
                        {finalGroups.map((group, gIdx) => {
                          if (group.type === "time") {
                            return (
                              <div key={gIdx} className="pt-3 pb-1">
                                <span className="inline-block px-3 py-1 rounded-md text-[11px] font-bold bg-slate-800 text-cyan-400 border border-slate-700/80 uppercase tracking-wider">
                                  {group.text}
                                </span>
                              </div>
                            );
                          }

                          if (group.type === "activities_header") {
                            return (
                              <div key={gIdx} className="pt-2 pb-1">
                                <span className="font-semibold text-indigo-300 text-xs tracking-wide block">
                                  {group.text}
                                </span>
                              </div>
                            );
                          }

                          if (group.type === "closing") {
                            return (
                              <div key={gIdx} className="pt-3 border-t border-slate-800/60 mt-3">
                                <p className="text-xs text-slate-400 italic leading-relaxed">
                                  {group.text}
                                </p>
                              </div>
                            );
                          }

                          const isBulletLine = group.rawLine.trim().startsWith("- ");
                          const cleanLower = group.text.toLowerCase().replace(/\*/g, "");
                          const isMealLine = /^(breakfast|lunch|dinner):/i.test(cleanLower);

                          let isUnderActivities = false;
                          for (let i = gIdx - 1; i >= 0; i--) {
                            if (finalGroups[i].type === "activities_header") {
                              isUnderActivities = true;
                              break;
                            }
                            if (finalGroups[i].type === "time") break;
                          }

                          const showBullet = isBulletLine || isUnderActivities || isMealLine;
                          const parts = group.text.split(/(\*\*.*?\*\*)/g);

                          return (
                            <div
                              key={gIdx}
                              className={`flex items-start gap-2 text-slate-300 text-xs sm:text-sm ${
                                showBullet ? "pl-3" : "pl-0 font-normal text-slate-300"
                              }`}
                            >
                              {showBullet && (
                                <span className="text-indigo-400 mt-1 text-[10px] select-none">•</span>
                              )}
                              <p className="flex-1 leading-relaxed">
                                {parts.map((part, pIdx) => {
                                  if (part.startsWith("**") && part.endsWith("**")) {
                                    const innerText = part.slice(2, -2).trim();
                                    if (!innerText.replace(/[^a-zA-Z0-9]/g, "")) return null;

                                    const isLabelHeader = /^(activities|breakfast|lunch|dinner|notes):?$/i.test(innerText);

                                    if (isLabelHeader) {
                                      return (
                                        <span key={pIdx} className="font-bold text-indigo-300 mr-1.5">
                                          {innerText}
                                        </span>
                                      );
                                    }

                                    return (
                                      <strong
                                        key={pIdx}
                                        className="font-semibold text-white bg-slate-800/80 px-1.5 py-0.5 rounded border border-slate-700/60 inline-block"
                                      >
                                        {innerText}
                                      </strong>
                                    );
                                  }
                                  return part;
                                })}
                              </p>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
            </div>
          </section>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950 py-6 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>© {new Date().getFullYear()} KelanaAI. Hak Cipta Dilindungi Undang-Undang.</p>
          <div className="flex items-center gap-6">
            <a href="#" className="hover:text-slate-300 transition-colors">
              Kebijakan Privasi
            </a>
            <a href="#" className="hover:text-slate-300 transition-colors">
              Syarat & Ketentuan
            </a>
            <a href="https://github.com/LrRyPa/kelana-ai" target="_blank" rel="noreferrer" className="hover:text-slate-300 transition-colors">
              GitHub Repo
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}