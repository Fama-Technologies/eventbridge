import { Undo2 } from "lucide-react";

interface RecentProps {
    title: string;
    badge: string;
    firstname: string;
    lastname: string;
    date: string | Date;
    onDecline?: () => void;
    onRespond?: () => void;
}

export default function Recent({ title, badge, firstname, lastname, date, onDecline, onRespond }: RecentProps) {
    const normalizedBadge = String(badge).toUpperCase();
    const badgeColor = normalizedBadge === "URGENT" 
        ? "bg-[#FF00001A] text-[#C13515]" 
        : normalizedBadge === "PENDING" 
            ? "bg-[#FEF3C780] text-[#A44801]" 
            : "bg-neutrals-02 text-accents-discount";
    const displayBadge = String(badge).charAt(0).toUpperCase() + String(badge).slice(1).toLowerCase();

    const formattedDate = typeof date === "string" ? date : date.toISOString().split("T")[0];
// bg-shades-white p-6 rounded-lg border border-neutrals-03 shadow-sm transition-colors duration-300
    return (
        <div className="w-full bg-shades-white p-6 rounded-lg border border-neutrals-03 shadow-sm transition-colors duration-300 hover:border-neutrals-04">
            <article className="flex flex-col md:flex-row items-start md:items-center justify-between w-full gap-4" aria-label={`Message: ${title}`}>
                <div className="flex flex-col items-start gap-2 w-full">
                    <div className="flex flex-row items-center gap-2 flex-wrap">
                        <h3 className="font-font1 font-semibold text-[14px] leading-5 tracking-normal text-shades-black">{title}</h3>
                        <span className={`${badgeColor} font-font1 font-semibold text-[10px] leading-4 tracking-wider px-2 py-0.5 rounded whitespace-nowrap uppercase`}>{displayBadge}</span>
                    </div>
                    <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                        <p className="font-font1 font-normal text-[12px] leading-4 tracking-normal text-neutrals-06">Requested by <span className="text-shades-black font-medium">{firstname} {lastname}</span></p>
                        <span className="hidden sm:inline text-neutrals-05">•</span>
                        <time className="font-font1 font-normal text-[12px] leading-4 tracking-normal text-neutrals-06" dateTime={String(formattedDate)}>{formattedDate}</time>
                    </div>

                </div>
                <div className="flex items-center gap-2 w-full md:w-auto mt-2 md:mt-0">
                    <button type="button" onClick={onDecline} aria-label={`Decline ${title}`} className="flex-1 md:flex-none w-[84px] md:min-w-[84px] h-[40px] md:h-[44px] bg-shades-white border border-neutrals-03 rounded-lg flex items-center justify-center font-medium px-4 py-2.5 text-[14px] leading-4 tracking-normal text-shades-black transition-all duration-200 hover:bg-errors-bg hover:text-errors-main hover:border-errors-main focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-errors-main">Decline</button>
                    <button type="button" onClick={onRespond} aria-label={`Respond to ${title}`} className="flex-1 md:flex-none w-[117px] md:min-w-[117px] h-[40px] md:h-[44px] bg-primary-01 border border-transparent rounded-lg flex items-center justify-center gap-2 font-medium px-4 py-2.5 text-[14px] leading-4 tracking-normal text-white transition-all duration-200 transform hover:bg-primary-02 hover:scale-[1.02] hover:shadow-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary-01/60">
                        <Undo2 size={16} className="text-white" aria-hidden />
                        <span>Respond</span>
                    </button>

                </div>
            </article>
        </div>
    )
}