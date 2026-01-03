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
            ? "bg-primary-01/15 text-primary-01"
            : normalized === "add photos"
                ? "bg-[#9333EA33] text-[#9333EA]"
                : normalized === "update prices"
                    ? "bg-[#008A0533] text-accents-discount"
                    : normalized === "add service package"
                        ? "bg-[#004CC433] text-[#004CC4]"
                        : "bg-[#FF704333] text-primary-02";

    return (
        <Link
            href={href}
            className={`w-full min-h-[120px] flex flex-col items-center justify-center p-4 rounded-xl border border-neutrals-03 bg-shades-white opacity-100 transition-all duration-300 hover:scale-105 hover:bg-neutrals-01 hover:border-neutrals-04 hover:shadow-md cursor-pointer ${className ?? ""
                }`}
        >
            <div className="flex flex-col items-center justify-center gap-3 w-full">
                <div className={`flex items-center justify-center w-10 h-10 rounded-full ${iconStyle}`}>
                    {Icon ? (
                        <Icon className="w-5 h-5" aria-hidden="true" />
                    ) : (
                        <div className="w-5 h-5" aria-hidden="true" />
                    )}
                </div>
                <p className="font-font1 font-semibold text-[14px] leading-5 tracking-normal text-shades-black text-center break-words px-2">
                    {title}
                </p>
            </div>
        </Link>
    );
}

export default memo(QuickCard);