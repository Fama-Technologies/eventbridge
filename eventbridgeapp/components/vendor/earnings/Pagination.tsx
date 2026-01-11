import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface PaginationProps {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
}

export default function Pagination({
    currentPage,
    totalPages,
    onPageChange
}: PaginationProps) {
    const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

    // Simplistic pagination logic for now (showing all pages)
    // In a real app, you'd want to truncate this list if totalPages is large (e.g., 1 2 3 ... 8)

    return (
        <div className="flex items-center justify-center gap-2 mt-8">
            <button
                onClick={() => onPageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="h-10 w-10 flex items-center justify-center rounded-full border border-neutrals-03 bg-shades-white text-neutrals-06 hover:bg-neutrals-01 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
                <ChevronLeft size={18} />
            </button>

            {pages.map((page) => (
                <button
                    key={page}
                    onClick={() => onPageChange(page)}
                    className={cn(
                        "h-10 w-10 flex items-center justify-center rounded-full text-sm font-medium transition-all duration-200",
                        currentPage === page
                            ? "bg-[#FF5F15] text-white shadow-md shadow-[#FF5F15]/20" // Using specific orange from designs
                            : "text-neutrals-06 hover:bg-neutrals-01"
                    )}
                >
                    {page}
                </button>
            ))}

            {/* Ellipis dummy for visual match with mockups if needed */}
            {totalPages > 5 && <span className="text-neutrals-05 px-2">...</span>}
            {totalPages > 5 && (
                <button className="h-10 w-10 flex items-center justify-center rounded-full text-neutrals-06 hover:bg-neutrals-01 text-sm font-medium">
                    {totalPages}
                </button>
            )}

            <button
                onClick={() => onPageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="h-10 w-10 flex items-center justify-center rounded-full border border-neutrals-03 bg-shades-white text-neutrals-06 hover:bg-neutrals-01 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
                <ChevronRight size={18} />
            </button>
        </div>
    );
}
