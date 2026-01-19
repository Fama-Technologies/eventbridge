"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ChevronRight, Loader2 } from "lucide-react";
import TransactionList from "@/components/vendor/earnings/TransactionList";
import FilterBar from "@/components/vendor/earnings/FilterBar";
import Pagination from "@/components/vendor/earnings/Pagination";
import type { Transaction } from "@/components/vendor/earnings/data";

export default function TransactionHistoryPage() {
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [currentTab, setCurrentTab] = useState("all"); // 'all', 'paid', 'pending', 'cancelled'
    const [currentPage, setCurrentPage] = useState(1);
    const [isDateRangeOpen, setIsDateRangeOpen] = useState(false);
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");

    // Fetch Transactions
    useEffect(() => {
        async function fetchHistory() {
            setLoading(true);
            try {
                const response = await fetch('/api/vendor/earnings');
                if (response.ok) {
                    const data = await response.json();
                    // Handle wrapped response { transactions: [...] } or array [...]
                    const result = data.transactions || (Array.isArray(data) ? data : []);
                    setTransactions(result);
                }
            } catch (error) {
                console.error("Failed to fetch transaction history:", error);
            } finally {
                setLoading(false);
            }
        }
        fetchHistory();
    }, []);

    useEffect(() => {
        setCurrentPage(1);
    }, [searchQuery, currentTab, startDate, endDate]);

    // Filter Logic (Client-side for now, can be moved to API query params later)
    const filteredTransactions = transactions.filter(tx => {
        // Filter by Tab
        if (currentTab !== 'all' && tx.status !== currentTab) return false;

        // Filter by Search
        if (searchQuery) {
            const lowerQuery = searchQuery.toLowerCase();
            return (
                tx.title.toLowerCase().includes(lowerQuery) ||
                (tx.clientName && tx.clientName.toLowerCase().includes(lowerQuery))
            );
        }

        if (startDate || endDate) {
            const txDate = new Date(tx.date);
            if (Number.isNaN(txDate.getTime())) return false;
            if (startDate && txDate < new Date(startDate)) return false;
            if (endDate && txDate > new Date(endDate)) return false;
        }

        return true;
    });

    // Pagination Logic
    const ITEMS_PER_PAGE = 5;
    const totalPages = Math.ceil(filteredTransactions.length / ITEMS_PER_PAGE);

    const displayedTransactions = filteredTransactions.slice(
        (currentPage - 1) * ITEMS_PER_PAGE,
        currentPage * ITEMS_PER_PAGE
    );


    return (
        <div className="max-w-5xl mx-auto pb-10">
            {/* Breadcrumbs */}
            <div className="flex items-center gap-2 text-sm text-neutrals-06 mb-4">
                <Link href="/vendor/earnings" className="hover:text-primary-01 transition-colors">Earnings</Link>
                <ChevronRight size={14} />
                <span className="font-medium text-shades-black">Transaction History</span>
            </div>

            <h1 className="text-2xl font-bold text-shades-black mb-6">Transaction History</h1>

            {loading ? (
                <div className="flex justify-center py-12">
                    <Loader2 className="animate-spin text-primary-01 h-8 w-8" />
                </div>
            ) : (
                <>
                    <FilterBar
                        searchQuery={searchQuery}
                        onSearchChange={setSearchQuery}
                        currentTab={currentTab}
                        onTabChange={setCurrentTab}
                        dateRangeLabel={
                            startDate || endDate
                                ? `${startDate || 'Start'} - ${endDate || 'End'}`
                                : "All dates"
                        }
                        onDateRangeClick={() => setIsDateRangeOpen(prev => !prev)}
                    />
                    {isDateRangeOpen && (
                        <div className="mb-6 rounded-2xl border border-neutrals-03 bg-shades-white p-4">
                            <div className="grid gap-4 md:grid-cols-3 items-end">
                                <label className="flex flex-col text-sm text-neutrals-06">
                                    Start date
                                    <input
                                        type="date"
                                        value={startDate}
                                        onChange={(e) => setStartDate(e.target.value)}
                                        className="mt-2 rounded-lg border border-neutrals-03 px-3 py-2 text-sm text-shades-black"
                                    />
                                </label>
                                <label className="flex flex-col text-sm text-neutrals-06">
                                    End date
                                    <input
                                        type="date"
                                        value={endDate}
                                        onChange={(e) => setEndDate(e.target.value)}
                                        className="mt-2 rounded-lg border border-neutrals-03 px-3 py-2 text-sm text-shades-black"
                                    />
                                </label>
                                <div className="flex gap-3">
                                    <button
                                        type="button"
                                        onClick={() => setIsDateRangeOpen(false)}
                                        className="rounded-full border border-neutrals-03 px-4 py-2 text-sm font-medium text-neutrals-06 hover:text-neutrals-08"
                                    >
                                        Apply
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setStartDate("");
                                            setEndDate("");
                                        }}
                                        className="rounded-full border border-neutrals-03 px-4 py-2 text-sm font-medium text-neutrals-06 hover:text-neutrals-08"
                                    >
                                        Clear
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    <TransactionList
                        transactions={displayedTransactions}
                        compact={false}
                        emptyMessage="No transactions match your search."
                    />

                    <Pagination
                        currentPage={currentPage}
                        totalPages={totalPages || 1}
                        onPageChange={setCurrentPage}
                    />
                </>
            )}

        </div>
    );
}
