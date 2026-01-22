'use client';

import { Plus, Calendar, FileText } from 'lucide-react';
import { cn } from '@/lib/utils'; // Assuming this exists

interface QuickActionCardProps {
    label: string;
    icon: React.ReactNode;
    iconFullClass: string; // Tailwind classes for bg and text
}

function QuickActionCard({ label, icon, iconFullClass }: QuickActionCardProps) {
    return (
        <button className="flex flex-col items-center justify-center bg-shades-white p-6 rounded-2xl border border-neutrals-03 shadow-sm hover:shadow-md transition-all duration-300 w-full group">
            <div className={cn(
                "w-12 h-12 rounded-full flex items-center justify-center mb-3 transition-transform group-hover:scale-110",
                iconFullClass
            )}>
                {icon}
            </div>
            <span className="text-sm font-medium text-neutrals-06 group-hover:text-shades-black transition-colors">{label}</span>
        </button>
    );
}

export default function QuickActions() {
    return (
        <div>
            <h2 className="text-lg font-bold text-shades-black mb-6">Quick Actions</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <QuickActionCard
                    label="New Event"
                    icon={<Plus size={24} />}
                    iconFullClass="bg-orange-50 text-accents-orange border border-orange-100"
                />
                <QuickActionCard
                    label="Continue"
                    icon={<Calendar size={24} />}
                    iconFullClass="bg-purple-50 text-purple-600 border border-purple-100"
                />
                <QuickActionCard
                    label="Get Quote"
                    icon={<FileText size={24} />}
                    iconFullClass="bg-green-50 text-green-600 border border-green-100"
                />
            </div>
        </div>
    );
}
