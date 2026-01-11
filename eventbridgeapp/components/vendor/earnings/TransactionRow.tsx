import { ChevronRight } from "lucide-react";
import { format } from "date-fns";
import type { Transaction } from "./data";
import { cn } from "@/lib/utils";

interface TransactionRowProps {
    transaction: Transaction;
    compact?: boolean; // If true, hide some details for dashboard view
}

export default function TransactionRow({ transaction, compact = false }: TransactionRowProps) {
    const statusColor =
        transaction.status === 'paid' ? 'bg-[#E6F7ED] text-[#00A03E]' :
            transaction.status === 'pending' ? 'bg-[#FFF8E6] text-[#FFA800]' :
                'bg-[#FFEBEB] text-[#FF4D4D]';

    return (
        <div className="group flex items-center justify-between p-5 bg-shades-white border border-neutrals-03 rounded-2xl hover:border-primary-01/30 hover:shadow-sm transition-all duration-200 cursor-pointer">
            <div className="flex items-center gap-4 flex-1 min-w-0">
                {/* Avatar / Initials */}
                <div className="h-12 w-12 rounded-full bg-neutrals-03 flex items-center justify-center text-neutrals-06 font-medium shrink-0">
                    {transaction.clientInitials}
                </div>

                {/* Details */}
                <div className="flex flex-col min-w-0">
                    <span className="font-semibold text-shades-black truncate group-hover:text-primary-01 transition-colors">
                        {transaction.title}
                    </span>
                    <span className="text-sm text-neutrals-06 truncate">
                        {compact
                            ? format(new Date(transaction.date), "MMMM dd, yyyy")
                            : `Client: ${transaction.clientName}`
                        }
                    </span>
                </div>
            </div>

            {/* Middle Section (Hidden on compact or mobile) */}
            {!compact && (
                <div className="hidden md:flex flex-col items-start px-4 w-[20%]">
                    <span className="text-xs font-semibold text-neutrals-05 uppercase tracking-wide mb-1">Date</span>
                    <span className="text-sm text-shades-black">
                        {format(new Date(transaction.date), "MMM dd, yyyy")}
                    </span>
                </div>
            )}

            {/* Right Section: Amount & Status */}
            <div className="flex items-center justify-end gap-6 flex-[0_0_auto]">
                <div className="flex flex-col items-end">
                    {!compact && transaction.status !== 'cancelled' ? (
                        <span className="text-xs font-semibold text-neutrals-05 uppercase tracking-wide mb-1">Amount</span>
                    ) : null}
                    <span className="font-bold text-shades-black">
                        UGX {transaction.amount.toLocaleString()}
                    </span>
                </div>

                <div className={cn(
                    "px-3 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider min-w-[70px] text-center",
                    statusColor
                )}>
                    {transaction.status}
                </div>

                <div className="h-8 w-8 rounded-full bg-transparent hover:bg-neutrals-02 flex items-center justify-center transition-colors">
                    <ChevronRight size={18} className="text-neutrals-05" />
                </div>
            </div>
        </div>
    );
}
