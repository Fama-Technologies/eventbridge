import { addMonths, subMonths } from "date-fns"
import { ChevronLeft, ChevronRight, Plus } from "lucide-react"

interface CalendarHeaderProps {
    currentDate: Date
    setCurrentDate: (date: Date) => void
    onAddBooking?: () => void
    onBlockDates?: () => void
}

export default function CalendarHeader({
    currentDate,
    setCurrentDate,
    onAddBooking,
    onBlockDates
}: CalendarHeaderProps) {
    if (!currentDate) {
        return (
            <div className="flex items-center justify-center h-20 text-neutrals-06">
                Loading calendar...
            </div>
        )
    }

    const goToPreviousMonth = () => setCurrentDate(subMonths(currentDate, 1))
    const goToNextMonth = () => setCurrentDate(addMonths(currentDate, 1))
    const goToToday = () => setCurrentDate(new Date())
    const handleAddBooking = () => onAddBooking?.()

    return (
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 py-3 border-b border-neutrals-02">
            {/* Left Section - Date Navigation */}
            <div className="flex items-center justify-between md:justify-start gap-4 w-full md:w-auto">
                <h1 className="text-shades-black text-xl md:text-2xl font-bold tracking-tight">
                    {currentDate.toLocaleString('default', { month: 'long' })} {currentDate.getFullYear()}
                </h1>

                <div className="flex items-center gap-2">
                    {/* Navigation Controls */}
                    <div className="flex items-center bg-neutrals-02 rounded-lg p-1">
                        <button
                            onClick={goToPreviousMonth}
                            className="p-1.5 md:p-2 hover:bg-neutrals-03 rounded-md transition-colors"
                            aria-label="Previous month"
                        >
                            <ChevronLeft size={18} className="text-neutrals-08" />
                        </button>
                        <button
                            onClick={goToNextMonth}
                            className="p-1.5 md:p-2 hover:bg-neutrals-03 rounded-md transition-colors"
                            aria-label="Next month"
                        >
                            <ChevronRight size={18} className="text-neutrals-08" />
                        </button>
                    </div>

                    {/* Today Button */}
                    <button
                        onClick={goToToday}
                        className="px-3 py-1.5 md:px-4 md:py-2 border border-neutrals-03 rounded-lg text-neutrals-08 text-sm font-medium hover:bg-neutrals-02 transition-colors whitespace-nowrap"
                    >
                        Today
                    </button>
                </div>
            </div>

            {/* Right Section - Legend & Actions */}
            <div className="flex flex-col sm:flex-row items-center gap-4 md:gap-6 w-full md:w-auto">
                {/* Status Legend */}
                <div className="flex items-center justify-between w-full sm:w-auto gap-4">
                    <div className="flex items-center gap-1.5">
                        <div className="w-2.5 h-2.5 md:w-3 md:h-3 rounded-full bg-accents-discount"></div>
                        <span className="text-neutrals-06 text-xs md:text-sm font-medium">Confirmed</span>
                    </div>

                    <div className="flex items-center gap-1.5">
                        <div className="w-2.5 h-2.5 md:w-3 md:h-3 rounded-full bg-amber-400"></div>
                        <span className="text-neutrals-06 text-xs md:text-sm font-medium">Pending</span>
                    </div>

                    <div className="flex items-center gap-1.5">
                        <div className="w-2.5 h-2.5 md:w-3 md:h-3 rounded-full bg-errors-main"></div>
                        <span className="text-neutrals-06 text-xs md:text-sm font-medium">Blocked</span>
                    </div>
                </div>

                {/* Divider - Hidden on mobile */}
                <div className="hidden sm:block w-px h-6 bg-neutrals-03"></div>

                {/* Add Booking Button */}
                <button
                    onClick={handleAddBooking}
                    className="w-full sm:w-auto flex items-center justify-center gap-2 bg-primary-01 hover:bg-primary-02 text-shades-white px-4 py-2 rounded-lg font-medium transition-colors shadow-sm whitespace-nowrap"
                >
                    <Plus size={16} />
                    Add Booking
                </button>
            </div>
        </div>
    )
}