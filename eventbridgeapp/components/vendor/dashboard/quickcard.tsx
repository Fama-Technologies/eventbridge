import React, { memo } from "react";
import Link from "next/link";

interface QuickCardProps {
    icon?: React.ElementType;
    title: string;
    className?: string;
    href: string;
}

function QuickCard({ icon: Icon, title, className, href }: QuickCardProps) {
    const normalized = String(title).toLowerCase();
    const iconStyle =
        normalized === "block dates"
            ? "bg-[#FF704333] text-[#FF7043]"
            : normalized === "add photos"
                ? "bg-[#F9FAFB33] text-[#9333EA]"
                : normalized === "update prices"
                    ? "bg-[#F1F5F933] text-[#00E64D]"
                    : "bg-[#F1F5F933] text-[#CB5E21]";

    return (
        <Link
            href={href}
            className={`w-full min-h-[106px] flex flex-col items-center justify-center p-4 rounded-xl border border-[#4D4D4D] opacity-100 transition-all duration-300 hover:scale-105 hover:bg-[#262626] cursor-pointer ${className ?? ""
                }`}
        >
            <div className="flex flex-col items-center justify-center gap-3">
                <div className={`flex items-center justify-center w-10 h-10 rounded-full ${iconStyle}`}>
                    {Icon ? (
                        <Icon className="w-5 h-5" aria-hidden="true" />
                    ) : (
                        <div className="w-5 h-5" aria-hidden="true" />
                    )}
                </div>
                <p className="font-font1 font-semibold text-[14px] leading-5 tracking-normal text-white whitespace-nowrap text-center">
                    {title}
                </p>
            </div>
        </Link>
    );
}

export default memo(QuickCard);