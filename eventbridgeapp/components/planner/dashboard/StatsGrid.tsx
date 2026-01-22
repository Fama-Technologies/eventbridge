'use client';

import { Calendar, FileText, Wallet, ListChecks } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StatsCardProps {
    label: string;
    value: string | number;
    icon: React.ReactNode;
    trend?: {
        value: string;
        positive: boolean;
    };
    iconBgColor?: string;
    iconColor?: string;
}

function StatsCard({ label, value, icon, trend, iconBgColor, iconColor }: StatsCardProps) {
    return (
        <div className="bg-shades-white p-6 rounded-2xl border border-neutrals-03 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-between group">
            <div className="mb-6">
                <div className={cn(
                    "w-10 h-10 rounded-xl flex items-center justify-center mb-4 transition-transform group-hover:scale-110 duration-300",
                    iconBgColor || "bg-neutrals-02",
                    iconColor || "text-shades-black"
                )}>
                    {icon}
                </div>
                <h3 className="text-neutrals-06 text-sm font-medium">{label}</h3>
            </div>

            <div className="flex items-end gap-3">
                <span className="text-3xl font-bold text-shades-black">{value}</span>
                {trend && (
                    <span className={cn(
                        "text-[10px] font-bold px-1.5 py-0.5 rounded mb-1",
                        trend.positive
                            ? "bg-green-100 text-green-600"
                            : "bg-red-100 text-red-600"
                    )}>
                        {trend.value}
                    </span>
                )}
            </div>
        </div>
    );
}

export default function StatsGrid() {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
            <StatsCard
                label="Upcoming Events"
                value="4"
                icon={<Calendar size={20} />}
                iconBgColor="bg-blue-50"
                iconColor="text-blue-500"
            />
            <StatsCard
                label="Pending Quotes"
                value="12"
                icon={<FileText size={20} />}
                iconBgColor="bg-orange-50"
                iconColor="text-accents-orange"
            />
            <StatsCard
                label="Budget Spent"
                value="$12,450"
                icon={<Wallet size={20} />}
                trend={{ value: "+52%", positive: true }}
                iconBgColor="bg-green-50"
                iconColor="text-green-600"
            />
            <StatsCard
                label="Checklist Progress"
                value="42%"
                icon={<ListChecks size={20} />}
                iconBgColor="bg-purple-50"
                iconColor="text-purple-500"
            />
        </div>
    );
}
