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
    const badgeColor = normalizedBadge === "URGENT" ? "bg-[#FF00001A] text-[#FF6B4F]" : normalizedBadge === "PENDING" ? "bg-[#FEF3C780] text-[#A44801]" : "bg-[#FFFFFF33] text-[#00E64D]";
    const displayBadge = String(badge).charAt(0).toUpperCase() + String(badge).slice(1).toLowerCase();

    const formattedDate = typeof date === "string" ? date : date.toISOString().split("T")[0];

    return (
        <div className="w-full bg-[#222222] p-4 rounded-lg border border-[#4D4D4D]">
            <article className="flex flex-col md:flex-row items-start md:items-center justify-between w-full gap-4" aria-label={`Message: ${title}`}>
                <div className="flex flex-col items-start gap-2 w-full">
                    <div className="flex flex-row items-center gap-2 flex-wrap">
                        <h3 className="font-font1 font-semibold text-[14px] leading-5 tracking-normal text-white">{title}</h3>
                        <span className={`${badgeColor} font-font1 font-normal text-[12px] leading-4 tracking-normal px-2 py-1 rounded whitespace-nowrap`}>{displayBadge}</span>
                    </div>
                    <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                        <p className="font-font1 font-normal text-[12px] leading-4 tracking-normal text-[#8C8C8C]">Requested by <span className="text-white">{firstname} {lastname}</span></p>
                        <time className="font-font1 font-normal text-[12px] leading-4 tracking-normal text-[#8C8C8C]" dateTime={String(formattedDate)}>{formattedDate}</time>
                    </div>

                </div>
                <div className="flex items-center gap-2 w-full md:w-auto mt-2 md:mt-0">
                    <button type="button" onClick={onDecline} aria-label={`Decline ${title}`} className="flex-1 md:flex-none w-[84px] md:min-w-[84px] h-[40px] md:h-[50px] bg-[#222222] border border-[#3A3A3A] rounded-lg flex items-center justify-center font-normal px-4 py-2.5 text-[14px] leading-4 tracking-normal text-[#FFFFFF] transition-colors duration-150 hover:bg-[#FF4D3A] hover:border-[#FF4D3A] focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#FF4D3A]/40">Decline</button>
                    <button type="button" onClick={onRespond} aria-label={`Respond to ${title}`} className="flex-1 md:flex-none w-[117px] md:min-w-[117px] h-[40px] md:h-[50px] bg-[#FF7043] border border-[#666666] rounded-lg flex items-center justify-center gap-2 font-normal px-4 py-2.5 text-[14px] leading-4 tracking-normal text-[#FFFFFF] transition duration-150 transform hover:bg-[#FF5A2B] hover:scale-[1.02] focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#FF7043]/40">
                        <Undo2 size={16} className="text-[#FFFFFF]" aria-hidden />
                        <span>Respond</span>
                    </button>

                </div>
            </article>
        </div>
    )
}