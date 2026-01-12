"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { CheckCircle2, Wallet, CreditCard, Loader2 } from "lucide-react";
import StatsCard from "@/components/vendor/earnings/StatsCard";
import TransactionList from "@/components/vendor/earnings/TransactionList";
import type { Transaction } from "@/components/vendor/earnings/data";

interface EarningsStats {
    totalBookingsValue: number;
    thisMonthValue: number;
    completedPaidCount: number;
    pendingPaymentsCount: number;
}

export default function EarningsPage() {
    const [stats, setStats] = useState<EarningsStats>({
        totalBookingsValue: 0,
        thisMonthValue: 0,
        completedPaidCount: 0,
        pendingPaymentsCount: 0
    });
    const [recentTransactions, setRecentTransactions] = useState<Transaction[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        async function fetchData() {
            setIsLoading(true);
            try {
                // Fetch Stats
                const statsResponse = await fetch('/api/vendor/earnings/stats'); // Assuming a dedicated stats endpoint or parsing main endpoint
                // If specific stats endpoint doesn't exist, we might need to calculate from /api/vendor/earnings
                // For now, let's try to fetch from main earnings endpoint which might return a wrapper

                // FALLBACK: Fetch main earnings data which likely contains both or list
                const response = await fetch('/api/vendor/earnings');
                if (response.ok) {
                    const data = await response.json();

                    // Check if data has stats structure or provided by separate logic
                    // If API returns structured data { stats: ..., transactions: ... }
                    if (data.stats) {
                        setStats(data.stats);
                    } else if (Array.isArray(data)) {
                        // If it only returns transactions, calculate stats locally for now (backward compatibility)
                        // This ensures nothing breaks if API is simple
                        const total = data.reduce((acc: number, tx: any) => acc + (tx.amount || 0), 0);
                        setStats({
                            totalBookingsValue: total,
                            thisMonthValue: 0, // Needs date logic 
                            completedPaidCount: data.filter((tx: any) => tx.status === 'paid').length,
                            pendingPaymentsCount: data.filter((tx: any) => tx.status === 'pending').length
                        });
                    }

                    // Set Transactions
                    const transactions = data.transactions || (Array.isArray(data) ? data : []);
                    setRecentTransactions(transactions.slice(0, 3));
                }
            } catch (error) {
                console.error("Failed to fetch earnings data:", error);
            } finally {
                setIsLoading(false);
            }
        }
        fetchData();
    }, []);

    if (isLoading) {
        return (
            <div className="flex justify-center items-center min-h-[400px]">
                <Loader2 className="animate-spin text-primary-01 h-8 w-8" />
            </div>
        );
    }

    return (
        <div className="max-w-5xl mx-auto space-y-8 pb-10">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-shades-black">Earnings</h1>
                <p className="text-neutrals-06 mt-1">Track and manage your revenue and payouts.</p>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6"></div>

            <div className="flex flex-col md:flex-row justify-between items-end mb-6">
                <div>
                    <span className="text-sm font-semibold text-neutrals-06">Total Bookings Value</span>
                    <div className="text-4xl font-bold text-shades-black mt-1">
                        UGX {stats.totalBookingsValue.toLocaleString()}
                    </div>
                </div>
                <div className="text-right mt-4 md:mt-0">
                    <span className="text-sm font-semibold text-neutrals-06">This Month</span>
                    <div className="text-xl font-bold text-[#00A03E] mt-1">
                        UGX {stats.thisMonthValue.toLocaleString()}
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <StatsCard
                    title="Completed & Paid"
                    value={stats.completedPaidCount}
                    icon={<CheckCircle2 size={24} />}
                    variant="success"
                />
                <StatsCard
                    title="Pending Payments"
                    value={stats.pendingPaymentsCount}
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