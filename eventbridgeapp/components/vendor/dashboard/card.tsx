import type { LucideIcon } from "lucide-react";

interface CardProps {
    title: string;
    count: number;
    stat: string;
    icon: LucideIcon;
}

export default function Card({ title, count, stat, icon: Icon }: CardProps) {
    return (
        <div className="w-[254px] h-[162px] bg-[#222222] shadow-sm p-6 gap-4 rounded-[12px] border border-[#222222] opacity-100 flex flex-col justify-between">
            <div className="flex justify-between items-start">

            </div>
        </div>
    )
}