import { cn } from "@/lib/utils";
import { MoveUpRight, CheckCircle2, LayoutDashboard } from "lucide-react";

interface StatsCardProps {
    title: string;
    value: string | number;
    subValue?: string; // e.g. "UGX 3,450,000"
    subLabel?: string; // e.g. "This Month"
    icon?: React.ReactNode;
    variant?: 'default' | 'success' | 'warning';
}

export default function StatsCard({
    title,
    value,
    subValue,
    subLabel,
    icon,
    variant = 'default'
}: StatsCardProps) {
    return (
        <div className="bg-shades-white p-6 rounded-2xl border border-neutrals-03 shadow-sm flex flex-col justify-between h-full relative overflow-hidden group hover:shadow-md transition-all duration-300">
            <div className="flex justify-between items-start mb-4">
                <h3 className={cn(
                    "text-sm font-semibold",
                    variant === 'success' ? "text-green-600" :
                        variant === 'warning' ? "text-orange-500" :
                            "text-neutrals-06"
                )}>
                    {title}
                </h3>
                {icon && (
                    <div className={cn(
                        "p-2 rounded-lg transition-transform group-hover:scale-110 duration-300",
                        variant === 'success' ? "bg-green-50 text-green-600" :
                            variant === 'warning' ? "bg-orange-50 text-orange-500" :
                                "bg-neutrals-02 text-neutrals-05"
                    )}>
                        {icon}
                    </div>
                )}
            </div>

            <div className="flex items-end justify-between">
                <div>
                    <div className={cn(
                        "text-3xl font-bold tracking-tight",
                        variant === 'success' ? "text-green-600" :
                            variant === 'warning' ? "text-orange-500" :
                                "text-shades-black"
                    )}>
                        {value}
                    </div>
                </div>
                {(subValue && subLabel) && (
                    <div className="text-right flex flex-col items-end">
                        <span className="text-xs text-neutrals-05 font-medium mb-1">{subLabel}</span>
                        <span className={cn(
                            "text-lg font-bold",
                            variant === 'success' ? "text-green-600" : "text-green-600" // Usually positive
                        )}>
                            {subValue}
                        </span>
                    </div>
                )}
            </div>
        </div>
    );
}
