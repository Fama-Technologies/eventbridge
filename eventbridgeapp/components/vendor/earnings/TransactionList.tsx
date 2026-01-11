import type { Transaction } from "./data";
import TransactionRow from "./TransactionRow";

interface TransactionListProps {
    transactions: Transaction[];
    compact?: boolean;
    emptyMessage?: string;
}

export default function TransactionList({
    transactions,
    compact = false,
    emptyMessage = "No transactions found"
}: TransactionListProps) {
    if (transactions.length === 0) {
        return (
            <div className="bg-shades-white border border-neutrals-03 rounded-2xl p-12 text-center text-neutrals-06">
                {emptyMessage}
            </div>
        );
    }

    return (
        <div className="space-y-3">
            {/* Header for non-compact (History) view could go here if needed, like a table header */}
            {!compact && (
                <div className="hidden md:flex items-center justify-between px-5 mb-2 text-xs font-semibold text-neutrals-05 uppercase tracking-wider">
                    <div className="pl-16">Transaction Details</div>
                    <div className="flex items-center gap-6 pr-12">
                        <div className="w-[120px]">Date</div>
                        <div className="w-[150px] text-right">Amount</div>
                        <div className="w-[70px] text-center">Status</div>
                    </div>
                </div>
            )}

            {transactions.map((tx) => (
                <TransactionRow key={tx.id} transaction={tx} compact={compact} />
            ))}
        </div>
    );
}
