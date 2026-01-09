"use client";

import { useState } from "react";
import { ArrowRight } from "lucide-react";

export default function AvailabilitySettings() {
    const [days, setDays] = useState(["M", "T", "W", "T", "F", "S"]);
    const dayLabels = ["M", "T", "W", "T", "F", "S", "S"];
    const [sameDayService, setSameDayService] = useState(false);
    const [maxEvents, setMaxEvents] = useState(5);

    const toggleDay = (index: number) => {
        // Simple logic fordemo: Using index to diff Days (M T W...) 
        // In real app, might map to 0-6. 
        // Since labels duplicate (T, S), using index is better key.
        // But for mock state I used strings. I'll switch to indices in state.
    };

    // Better State for days
    const [activeDays, setActiveDays] = useState([0, 1, 2, 3, 4, 5]); // M-Sat

    const handleDayToggle = (idx: number) => {
        if (activeDays.includes(idx)) {
            setActiveDays(activeDays.filter(d => d !== idx));
        } else {
            setActiveDays([...activeDays, idx]);
        }
    };

    return (
        <div className="bg-shades-white p-6 md:p-8 rounded-2xl border border-neutrals-02">
            <div className="flex items-center justify-between mb-8">
                <h2 className="text-xl font-bold text-shades-black">Availability Settings</h2>
                <button className="flex items-center gap-1 text-primary-01 text-sm font-semibold hover:gap-2 transition-all">
                    Full Calendar Editor <ArrowRight size={16} />
                </button>
            </div>

            <div className="space-y-8">
                {/* Days Open */}
                <div className="border border-neutrals-03 rounded-2xl p-6">
                    <h3 className="text-sm font-semibold text-shades-black mb-4">Days Open for Business</h3>
                    <div className="flex gap-3 flex-wrap">
                        {dayLabels.map((day, idx) => {
                            const isActive = activeDays.includes(idx);
                            return (
                                <button
                                    key={idx}
                                    onClick={() => handleDayToggle(idx)}
                                    className={`
                                        w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium transition-all
                                        ${isActive
                                            ? 'bg-primary-01 text-shades-white shadow-md shadow-primary-01/20'
                                            : 'bg-shades-white text-neutrals-06 border border-neutrals-03 hover:border-primary-01 hover:text-primary-01'
                                        }
                                    `}
                                >
                                    {day}
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Same-Day Service Toggle */}
                <div className="border border-neutrals-03 rounded-2xl p-6 flex items-center justify-between">
                    <div>
                        <h3 className="text-sm font-semibold text-shades-black">Same-Day Service</h3>
                        <p className="text-xs text-neutrals-06 mt-1">Allow clients to book you for events happening today.</p>
                    </div>
                    <button
                        onClick={() => setSameDayService(!sameDayService)}
                        className={`w-12 h-6 rounded-full transition-colors relative ${sameDayService ? 'bg-primary-01' : 'bg-neutrals-04'}`}
                    >
                        <div className={`
                            absolute top-1 w-4 h-4 rounded-full bg-shades-white shadow-sm transition-transform
                            ${sameDayService ? 'left-[calc(100%-1.25rem)]' : 'left-1'}
                        `} />
                    </button>
                </div>

                {/* Max Events Slider */}
                <div className="border border-neutrals-03 rounded-2xl p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-sm font-semibold text-shades-black">Max Events Per Week</h3>
                        <span className="text-primary-01 font-bold text-sm">{maxEvents} Events</span>
                    </div>
                    <input
                        type="range"
                        min="1"
                        max="20"
                        value={maxEvents}
                        onChange={(e) => setMaxEvents(parseInt(e.target.value))}
                        className="w-full h-2 bg-neutrals-03 rounded-full appearance-none cursor-pointer accent-primary-01"
                    />
                    <div className="flex justify-between mt-2 text-xs text-neutrals-06 font-medium">
                        <span>1</span>
                        <span>10</span>
                        <span>20+</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
