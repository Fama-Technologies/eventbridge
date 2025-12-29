import Link from "next/link";
import Recent from "./recent";
import { ArrowRight, MoveRight } from "lucide-react";

type Message = {
  id: number;
  sender: string;
  badge: 'Urgent' | 'Pending' | 'Completed' | string;
  firstname: string;
  lastname: string;
  date: string; // ISO date string
};

export default function RecentMessages() {
    const messages: Message[] = [
    {
        id: 1,
        sender: "Wedding Reception Inquiry",
        badge:"URGENT",
        firstname: "John",
        lastname: "Doe",
        date: "2023-10-24",

    },
    {
        id: 2,
        sender: "Corporate Annual Dinner", 
        badge:"PENDING",
        firstname: "TechCorp",
        lastname: "Inc",
        date:  "2023-11-12",
    },
    ];
    return (
        <div className="flex flex-col">
            <div className="w-full flex flex-row justify-between gap-6">
                <h2 className="font-font1 font-semibold text-[18px] leading-6 tracking-normal text-white">Action Required</h2>
               
                <Link href="/vendor/messages" className="text-[#FF7043] text-sm hover:text-[#FF5A2B] transition-colors">View all
                <ArrowRight size={16} className="inline-block ml-1" aria-hidden />
                </Link>
            </div>
            <div className="mt-6 flex flex-col gap-6">
                 <div className="flex flex-col gap-4">
                  {messages.map((m) => (
                    <Recent key={m.id} title={m.sender} badge={m.badge} firstname={m.firstname} lastname={m.lastname} date={m.date} />
                  ))}
                </div>
            </div>
        </div>
    )
}