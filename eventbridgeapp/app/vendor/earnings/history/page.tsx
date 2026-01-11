"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { transactionsData } from "@/components/vendor/earnings/data";
import TransactionList from "@/components/vendor/earnings/TransactionList";
import FilterBar from "@/components/vendor/earnings/FilterBar";
import Pagination from "@/components/vendor/earnings/Pagination";

export default function TransactionHistoryPage() {
    const [searchQuery, setSearchQuery] = useState("");
    const [currentTab, setCurrentTab] = useState("all"); // 'all', 'paid', 'pending', 'cancelled'
    const [currentPage, setCurrentPage] = useState(1);

    // Mock filtering logic
    const filteredTransactions = transactionsData.filter(tx => {
        // Filter by Tab
        if (currentTab !== 'all' && tx.status !== currentTab) return false;

        // Filter by Search
        if (searchQuery) {
            const lowerQuery = searchQuery.toLowerCase();
            return (
                tx.title.toLowerCase().includes(lowerQuery) ||
                tx.clientName.toLowerCase().includes(lowerQuery)
            );
        }

        return true;
    });

    // Mock Pagination Logic (just standard slicing for display)
    const ITEMS_PER_PAGE = 5;
    const totalPages = Math.ceil(filteredTransactions.length / ITEMS_PER_PAGE);

    // In a real app, this would slice based on page. 
    // For this mockup, I'll just show all filtered results to avoid empty pages if data is small.
    // Or I can slice it to demonstrate pagination UI.
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

            <FilterBar
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                currentTab={currentTab}
                onTabChange={setCurrentTab}
                dateRangeLabel="Oct 1, 2023 - Dec 31, 2023"
                onDateRangeClick={() => { }}
            />

            <TransactionList
                transactions={displayedTransactions}
                compact={false}
                emptyMessage="No transactions match your search."
            />

            <Pagination
                currentPage={currentPage}
                totalPages={totalPages || 1} // Default to 1 to show controls at least
                onPageChange={setCurrentPage}
            />
        </div>
    );
}
