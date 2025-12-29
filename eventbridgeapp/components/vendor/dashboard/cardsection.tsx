"use client"
import { useState } from "react";
import { UserPlus, Eye, DollarSign, MessageSquareText } from "lucide-react";
import Card from "./card";

export default function CardSection() {
    const [profileviews] = useState(1248);
    const [profilestat] = useState("+12%");
    const [newleads] = useState(8);
    const [newleadsstat] = useState("+2");
    const [earnings] = useState(400250);
    const [earningsstat] = useState("+$500");
    const [response] = useState(98);
    const [responsestat] = useState("0%");

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
        <div className="w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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