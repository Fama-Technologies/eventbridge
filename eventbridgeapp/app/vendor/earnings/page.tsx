"use client";

import Link from "next/link";
import { CheckCircle2, Wallet, CreditCard } from "lucide-react";
import StatsCard from "@/components/vendor/earnings/StatsCard";
import TransactionList from "@/components/vendor/earnings/TransactionList";
import { earningsStats, transactionsData } from "@/components/vendor/earnings/data";

export default function EarningsPage() {
    // Show only the 3 most recent transactions for the dashboard
    const recentTransactions = transactionsData.slice(0, 3);

    return (
        <div className="max-w-5xl mx-auto space-y-8 pb-10">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-shades-black">Earnings</h1>
                <p className="text-neutrals-06 mt-1">Track and manage your revenue and payouts.</p>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Total Bookings Value is visually dominant in designs, maybe separate row? 
                    Design puts "Total Bookings Value" as a large text, and cards below.
                    Let's follow design: Large Text Header for Value, then Cards. 
                 */}

                {/* Actually, looking at the mockup, "Total Bookings Value" is a text header above the cards. 
                    Let's adjust the layout to match the mockup exactly.
                 */}
            </div>

            <div className="flex flex-col md:flex-row justify-between items-end mb-6">
                <div>
                    <span className="text-sm font-semibold text-neutrals-06">Total Bookings Value</span>
                    <div className="text-4xl font-bold text-shades-black mt-1">
                        UGX {earningsStats.totalBookingsValue.toLocaleString()}
                    </div>
                </div>
                <div className="text-right mt-4 md:mt-0">
                    <span className="text-sm font-semibold text-neutrals-06">This Month</span>
                    <div className="text-xl font-bold text-[#00A03E] mt-1">
                        UGX {earningsStats.thisMonthValue.toLocaleString()}
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <StatsCard
                    title="Completed & Paid"
                    value={earningsStats.completedPaidCount}
                    icon={<CheckCircle2 size={24} />}
                    variant="success"
                />
                <StatsCard
                    title="Pending Payments"
                    value={earningsStats.pendingPaymentsCount}
                    icon={<CreditCard size={24} />} // Using CreditCard as a proxy for the generic "card" icon in mockup
                    variant="warning"
                />
            </div>

            {/* Recent Transactions Section */}
            <div className="space-y-4 pt-4">
                <div className="flex items-center justify-between">
                    <h2 className="text-lg font-bold text-shades-black">Recent Transactions</h2>
                    <Link
                        href="/vendor/earnings/history"
                        className="text-sm font-semibold text-primary-01 hover:text-primary-02 transition-colors"
                    >
                        View All
                    </Link>
                </div>

                <TransactionList transactions={recentTransactions} compact={true} />
            </div>
        </div>
    );
}