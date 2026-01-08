import { Users, MessageSquare, FileText } from "lucide-react";

interface BookingCardProps {
    title: string;
    date: string;
    avatarUrl?: string;
    initials: string;
    guestCount: number;    
    budget: number;
    status: "confirmed" | "pending";
}

export default function BookingCard({ 
    title, 
    date, 
    avatarUrl, 
    initials, 
    guestCount, 
    budget, 
    status 
}: BookingCardProps) {
    
    const statusStyles = {
        confirmed: {
            badge: "bg-[#D1FAE510] text-accents-discount",
            dot: "bg-accents-discount"
        },
        pending: {
            badge: "bg-[#FEF3C720] text-[#F59E0B]",
            dot: "bg-[#F59E0B]"
        }
    };

    const currentStatus = statusStyles[status];

    return (
        <div className="bg-shades-white border border-neutrals-03 rounded-2xl overflow-hidden mb-4">
            {/* Header: Status + Date */}
            <div className="flex items-center justify-between px-4 pt-4 pb-2">
                <span className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full ${currentStatus.badge}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${currentStatus.dot}`}></span>
                    {status === 'confirmed' ? 'Confirmed' : 'Pending Quote'}
                </span>
                <span className="text-xs text-neutrals-06">{date}</span>
            </div>

            {/* Content: Avatar + Details */}
            <div className="px-4 py-3">
                <div className="flex items-start gap-3">
                    {/* Avatar */}
                    <div className="w-12 h-12 rounded-full overflow-hidden bg-primary-01/10 flex items-center justify-center flex-shrink-0">
                        {avatarUrl ? (
                            <img src={avatarUrl} alt={title} className="w-full h-full object-cover" />
                        ) : (
                            <span className="text-sm font-semibold text-primary-01">{initials}</span>
                        )}
                    </div>

                    {/* Details */}
                    <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-shades-black text-base truncate">
                            {title}
                        </h3>
                        <div className="flex items-center gap-1 text-sm text-neutrals-06 mt-0.5">
                            <Users size={14} />
                            <span>{guestCount} Guests</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Footer: Budget + Actions */}
            <div className="flex items-center justify-between px-4 pb-4 pt-2 border-t border-neutrals-02">
                <div className="font-bold text-shades-black text-base">
                    UGX {budget.toLocaleString()}
                </div>
                
                {status === 'confirmed' ? (
                    <div className="flex items-center gap-1">
                        <button className="p-2 hover:bg-neutrals-02 rounded-lg transition-colors text-neutrals-06 hover:text-shades-black">
                            <MessageSquare size={18} />
                        </button>
                        <button className="p-2 hover:bg-neutrals-02 rounded-lg transition-colors text-neutrals-06 hover:text-shades-black">
                            <FileText size={18} />
                        </button>
                    </div>
                ) : (
                    <button className="bg-primary-01 hover:bg-primary-02 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors">
                        Review Request
                    </button>
                )}
            </div>
        </div>
    );
}