"use client";

import { useEffect, useState, use } from "react";
import Link from "next/link";
import { getTrip } from "@/services/tripService";
import { Trip } from "@/types/trip";

export default function TripDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const resolvedParams = use(params);
    const [trip, setTrip] = useState<Trip | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        getTrip(resolvedParams.id)
        .then((data) => setTrip(data))
        .catch((err) => console.error(err))
        .finally(() => setLoading(false));
    }, [resolvedParams.id]);

    if (loading) {
        return (
        <main className="min-h-screen bg-slate-950 text-white p-6 sm:p-12 flex items-center justify-center">
            <div className="text-center space-y-3">
            <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="text-slate-400 text-sm">Loading itinerary details...</p>
            </div>
        </main>
        );
    }

    if (!trip) {
        return (
        <main className="min-h-screen bg-slate-950 text-white p-6 sm:p-12 text-center space-y-4">
            <h1 className="text-2xl font-bold">Trip Not Found</h1>
            <Link href="/trips" className="text-indigo-400 hover:underline text-sm">
            ← Back to Trips
            </Link>
        </main>
        );
    }

    const itineraryRaw = trip.ai_recommendation || (trip as unknown as { ai_itinerary?: string }).ai_itinerary || "";

    const formattedBudget = new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
        maximumFractionDigits: 0,
    }).format(trip.budget).replace("$", "USD ");

    return (
        <main className="min-h-screen w-full bg-slate-950 text-white p-6 sm:p-12 pb-24 overflow-y-auto">
        <div className="max-w-4xl mx-auto space-y-8">
            
            <Link 
            href="/trips" 
            className="text-slate-400 hover:text-indigo-400 text-sm font-medium transition-colors inline-flex items-center gap-1"
            >
            ← Back to Trips
            </Link>

            <div className="space-y-2 border-b border-slate-800 pb-6">
            <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white">
                {trip.destination}
            </h1>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-2xl shadow-sm">
                <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider block">DESTINATION</span>
                <span className="text-base sm:text-lg font-bold text-white mt-1 block truncate">{trip.destination}</span>
            </div>
            <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-2xl shadow-sm">
                <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider block">BUDGET</span>
                <span className="text-base sm:text-lg font-bold text-emerald-400 mt-1 block">{formattedBudget}</span>
            </div>
            <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-2xl shadow-sm">
                <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider block">CATEGORY</span>
                <span className="text-base sm:text-lg font-bold text-indigo-300 mt-1 block">{trip.category}</span>
            </div>
            <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-2xl shadow-sm">
                <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider block">DAYS</span>
                <span className="text-base sm:text-lg font-bold text-white mt-1 block">{trip.days} Days</span>
            </div>
            </div>

            {itineraryRaw && (
            <section className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
                <h3 className="text-xs font-semibold text-indigo-400 uppercase tracking-widest pb-4 border-b border-slate-800">
                AI RECOMMENDATION
                </h3>

                <div className="space-y-6">
                {itineraryRaw
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
                            text: "📌 Activities:",
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
                        className="bg-slate-950/60 border border-slate-800 rounded-2xl p-5 sm:p-6 shadow-md space-y-4"
                        >
                        <div className="flex items-center gap-3 pb-3 border-b border-slate-800/80">
                            <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-indigo-500/20 text-indigo-400 font-bold text-sm border border-indigo-500/30">
                            {dayIdx + 1}
                            </span>
                            <h4 className="text-lg sm:text-xl font-bold text-indigo-300">
                            Day {dayIdx + 1}: {dayTitle}
                            </h4>
                        </div>

                        <div className="space-y-3 sm:pl-2">
                            {finalGroups.map((group, gIdx) => {
                            if (group.type === "time") {
                                return (
                                <div key={gIdx} className="pt-4 pb-1">
                                    <span className="inline-block px-3 py-1 rounded-md text-xs font-bold bg-slate-800 text-cyan-400 border border-slate-700 uppercase tracking-wider">
                                    ⏱️ {group.text}
                                    </span>
                                </div>
                                );
                            }

                            if (group.type === "activities_header") {
                                return (
                                <div key={gIdx} className="pt-3 pb-1">
                                    <span className="font-semibold text-indigo-300 text-sm tracking-wide block">
                                    {group.text}
                                    </span>
                                </div>
                                );
                            }

                            if (group.type === "closing") {
                                return (
                                <div key={gIdx} className="pt-4 border-t border-slate-800/60 mt-4">
                                    <p className="text-xs sm:text-sm text-slate-400 italic leading-relaxed">
                                    💡 {group.text}
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
                                className={`flex items-start gap-2.5 text-slate-300 text-sm sm:text-base ${
                                    showBullet ? "pl-4" : "pl-0 font-normal text-slate-300"
                                }`}
                                >
                                {showBullet && (
                                    <span className="text-indigo-400 mt-1.5 text-xs select-none">◆</span>
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
                                            className="font-semibold text-white bg-slate-800/90 px-1.5 py-0.5 rounded border border-slate-700/60 inline-block"
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
        </div>
        </main>
    );
}