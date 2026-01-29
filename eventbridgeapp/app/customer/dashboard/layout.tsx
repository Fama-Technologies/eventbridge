"use client";

import CustomerHeader from "@/components/customer/customerheader";

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <>
            <CustomerHeader />
            {children}
        </>
    );
}
