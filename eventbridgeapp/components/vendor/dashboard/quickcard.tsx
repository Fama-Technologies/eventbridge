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
                ? "bg-accents-peach text-primary-02"
                : normalized === "update prices"
                    ? "bg-neutrals-02 text-accents-discount"
                    : "bg-accents-peach text-primary-02";

    return (
        <Link
            href={href}
            className={`w-full min-h-[106px] flex flex-col items-center justify-center p-4 rounded-xl border border-neutrals-03 bg-shades-white opacity-100 transition-all duration-300 hover:scale-105 hover:bg-neutrals-01 hover:border-neutrals-04 hover:shadow-md cursor-pointer ${className ?? ""
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
                <p className="font-font1 font-semibold text-[14px] leading-5 tracking-normal text-shades-black whitespace-nowrap text-center">
                    {title}
                </p>
            </div>
        </Link>
    );
}

export default memo(QuickCard);