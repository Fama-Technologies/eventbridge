"use client"
import { useState } from "react";
import { UserPlus, Eye, DollarSign, MessageSquareText } from "lucide-react";
import Card from "./dashboard/card";

export default function CardSection() {
    const [profileviews, setprofileviews] = useState(1248);
    const [profilestat, setprofilestat] = useState("12");
    const [newleads, setnewleads] = useState(8);
    const [newleadsstat, setnewleadsstat] = useState("2");
    const [earnings, setearnings] = useState(8);
    const [earningsstat, setearningsstat] = useState("2");
    const [response, setresponse] = useState(98);
    const [responsestat, setresponsestat] = useState("0");

    const cards = [
        {
            title: "Profile Views",
            count: profileviews,
            stat: profilestat,
            icon: Eye
        },
        {
            title: "New Leads",
            count: newleads,
            stat: newleadsstat,
            icon: UserPlus
        },
        {
            title: "Earnings (Mo)",
            count: earnings,
            stat: earningsstat,
            icon: DollarSign
        },
        {
            title: "Response Rate",
            count: response,
            stat: responsestat,
            icon: MessageSquareText
        }
    ]

    return (
        <div className="w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 p-8">
            {cards.map((card, index) => (
                <Card
                    key={index}
                    title={card.title}
                    count={card.count}
                    stat={card.stat}
                    icon={card.icon}
                />
            ))}
        </div>
    )
}