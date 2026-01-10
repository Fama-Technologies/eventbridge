"use client";

import { useState, useEffect } from "react";
import { ArrowRight, Save, Calendar, Clock, AlertCircle } from "lucide-react";

interface AvailabilitySettingsProps {
  vendorId?: number;
}

export default function AvailabilitySettings({ vendorId }: AvailabilitySettingsProps = {}) {
    const [isLoading, setIsLoading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [hasChanges, setHasChanges] = useState(false);
    
    // Day availability (0 = Monday, 1 = Tuesday, etc.)
    const dayLabels = ["M", "T", "W", "T", "F", "S", "S"];
    const fullDayNames = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
    
    // State
    const [activeDays, setActiveDays] = useState([0, 1, 2, 3, 4]); // M-F by default
    const [sameDayService, setSameDayService] = useState(false);
    const [maxEvents, setMaxEvents] = useState(5);
    const [workingHours, setWorkingHours] = useState({
        start: "09:00",
        end: "17:00"
    });

    useEffect(() => {
        if (vendorId) {
            fetchAvailability();
        }
    }, [vendorId]);

    const fetchAvailability = async () => {
        try {
            setIsLoading(true);
            const response = await fetch(`/api/vendor/availability${vendorId ? `?vendorId=${vendorId}` : ''}`);
            const data = await response.json();
            
            if (data.success) {
                if (data.activeDays) {
                    setActiveDays(data.activeDays);
                }
                if (data.sameDayService !== undefined) {
                    setSameDayService(data.sameDayService);
                }
                if (data.maxEvents) {
                    setMaxEvents(data.maxEvents);
                }
                if (data.workingHours) {
                    setWorkingHours(data.workingHours);
                }
            }
        } catch (error) {
            console.error('Failed to fetch availability:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleDayToggle = (idx: number) => {
        const newActiveDays = activeDays.includes(idx) 
            ? activeDays.filter(d => d !== idx)
            : [...activeDays, idx];
        
        setActiveDays(newActiveDays);
        setHasChanges(true);
    };

    const handleTimeChange = (field: 'start' | 'end', value: string) => {
        setWorkingHours(prev => ({ ...prev, [field]: value }));
        setHasChanges(true);
    };

    const handleSave = async () => {
        try {
            setIsSaving(true);
            
            const response = await fetch('/api/vendor/availability', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    vendorId,
                    activeDays,
                    sameDayService,
                    maxEvents,
                    workingHours,
                }),
            });

            const data = await response.json();
            
            if (data.success) {
                setHasChanges(false);
                // Show success message or toast
                setTimeout(() => setIsSaving(false), 1000);
            } else {
                setIsSaving(false);
            }
        } catch (error) {
            console.error('Failed to save availability:', error);
            setIsSaving(false);
        }
    };

    const formatTimeRange = () => {
        return `${workingHours.start} - ${workingHours.end}`;
    };

    if (isLoading) {
        return (
            <div className="bg-shades-white p-6 md:p-8 rounded-2xl border border-neutrals-02">
                <div className="animate-pulse space-y-8">
                    <div className="h-8 bg-neutrals-03 rounded w-48"></div>
                    
                    {/* Days Open Skeleton */}
                    <div className="border border-neutrals-03 rounded-2xl p-6">
                        <div className="h-4 bg-neutrals-03 rounded w-32 mb-4"></div>
                        <div className="flex gap-3">
                            {[1, 2, 3, 4, 5, 6, 7].map((i) => (
                                <div key={i} className="w-10 h-10 bg-neutrals-03 rounded-full"></div>
                            ))}
                        </div>
                    </div>
                    
                    {/* Settings Skeleton */}
                    <div className="border border-neutrals-03 rounded-2xl p-6">
                        <div className="h-4 bg-neutrals-03 rounded w-40 mb-4"></div>
                        <div className="h-2 bg-neutrals-03 rounded-full"></div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-shades-white p-6 md:p-8 rounded-2xl border border-neutrals-02">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h2 className="text-xl font-bold text-shades-black">Availability Settings</h2>
                    <p className="text-sm text-neutrals-06 mt-1">
                        {activeDays.length} day{activeDays.length !== 1 ? 's' : ''} open • {maxEvents} max events/week
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    {hasChanges && (
                        <button
                            onClick={handleSave}
                            disabled={isSaving}
                            className="px-4 py-2 bg-primary-01 text-shades-white rounded-lg hover:bg-primary-02 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                        >
                            <Save size={16} />
                            {isSaving ? 'Saving...' : 'Save Changes'}
                        </button>
                    )}
                    <button className="flex items-center gap-1 text-primary-01 text-sm font-semibold hover:gap-2 transition-all">
                        Full Calendar Editor <ArrowRight size={16} />
                    </button>
                </div>
            </div>

            <div className="space-y-8">
                {/* Days Open */}
                <div className="border border-neutrals-03 rounded-2xl p-6">
                    <div className="flex items-center gap-2 mb-4">
                        <Calendar className="w-4 h-4 text-primary-01" />
                        <h3 className="text-sm font-semibold text-shades-black">Days Open for Business</h3>
                    </div>
                    
                    {/* Day Selector */}
                    <div className="flex gap-3 flex-wrap mb-6">
                        {dayLabels.map((day, idx) => {
                            const isActive = activeDays.includes(idx);
                            return (
                                <button
                                    key={idx}
                                    onClick={() => handleDayToggle(idx)}
                                    className={`
                                        w-10 h-10 rounded-full flex flex-col items-center justify-center text-sm transition-all
                                        ${isActive
                                            ? 'bg-primary-01 text-shades-white shadow-md shadow-primary-01/20'
                                            : 'bg-shades-white text-neutrals-06 border border-neutrals-03 hover:border-primary-01 hover:text-primary-01'
                                        }
                                    `}
                                >
                                    {day}
                                    <span className="text-xs opacity-75">{fullDayNames[idx].charAt(0)}</span>
                                </button>
                            );
                        })}
                    </div>

                    {/* Working Hours */}
                    {activeDays.length > 0 && (
                        <div className="mt-6 pt-6 border-t border-neutrals-03">
                            <div className="flex items-center gap-2 mb-3">
                                <Clock className="w-4 h-4 text-primary-01" />
                                <h4 className="text-sm font-medium text-shades-black">Working Hours</h4>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="flex-1">
                                    <label className="block text-xs text-neutrals-06 mb-1">Start Time</label>
                                    <input
                                        type="time"
                                        value={workingHours.start}
                                        onChange={(e) => handleTimeChange('start', e.target.value)}
                                        className="w-full px-3 py-2 rounded border border-neutrals-03 text-sm text-shades-black focus:border-primary-01 focus:outline-none"
                                    />
                                </div>
                                <div className="text-neutrals-06">to</div>
                                <div className="flex-1">
                                    <label className="block text-xs text-neutrals-06 mb-1">End Time</label>
                                    <input
                                        type="time"
                                        value={workingHours.end}
                                        onChange={(e) => handleTimeChange('end', e.target.value)}
                                        className="w-full px-3 py-2 rounded border border-neutrals-03 text-sm text-shades-black focus:border-primary-01 focus:outline-none"
                                    />
                                </div>
                            </div>
                            <p className="text-xs text-neutrals-06 mt-2">
                                Applies to all active days: {formatTimeRange()}
                            </p>
                        </div>
                    )}
                </div>

                {/* Same-Day Service Toggle */}
                <div className="border border-neutrals-03 rounded-2xl p-6 flex items-center justify-between">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <AlertCircle className="w-4 h-4 text-primary-01" />
                            <h3 className="text-sm font-semibold text-shades-black">Same-Day Service</h3>
                        </div>
                        <p className="text-xs text-neutrals-06">Allow clients to book you for events happening today.</p>
                    </div>
                    <button
                        onClick={() => {
                            setSameDayService(!sameDayService);
                            setHasChanges(true);
                        }}
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
                        <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-primary-01" />
                            <h3 className="text-sm font-semibold text-shades-black">Max Events Per Week</h3>
                        </div>
                        <span className="text-primary-01 font-bold text-sm">{maxEvents} Events</span>
                    </div>
                    <input
                        type="range"
                        min="1"
                        max="20"
                        value={maxEvents}
                        onChange={(e) => {
                            setMaxEvents(parseInt(e.target.value));
                            setHasChanges(true);
                        }}
                        className="w-full h-2 bg-neutrals-03 rounded-full appearance-none cursor-pointer accent-primary-01"
                    />
                    <div className="flex justify-between mt-2 text-xs text-neutrals-06 font-medium">
                        <span>Light (1)</span>
                        <span>Moderate (10)</span>
                        <span>Busy (20+)</span>
                    </div>
                </div>

                {/* Availability Summary */}
                <div className="border border-neutrals-03 rounded-2xl p-6">
                    <h3 className="text-sm font-semibold text-shades-black mb-4">Availability Summary</h3>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="p-3 bg-neutrals-01 rounded-lg">
                            <p className="text-xs text-neutrals-06">Active Days</p>
                            <p className="text-lg font-bold text-shades-black">{activeDays.length}</p>
                        </div>
                        <div className="p-3 bg-neutrals-01 rounded-lg">
                            <p className="text-xs text-neutrals-06">Working Hours</p>
                            <p className="text-lg font-bold text-shades-black">{formatTimeRange()}</p>
                        </div>
                        <div className="p-3 bg-neutrals-01 rounded-lg">
                            <p className="text-xs text-neutrals-06">Max Weekly Events</p>
                            <p className="text-lg font-bold text-shades-black">{maxEvents}</p>
                        </div>
                        <div className="p-3 bg-neutrals-01 rounded-lg">
                            <p className="text-xs text-neutrals-06">Same-Day Service</p>
                            <p className="text-lg font-bold text-shades-black">{sameDayService ? 'Yes' : 'No'}</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}