"use client"
import { useState, useEffect } from "react";
import { UserPlus, Eye, DollarSign, MessageSquareText } from "lucide-react";
import Card from "./card";

interface KPIStats {
    profileViews: { value: number; trend: string };
    newLeads: { value: number; trend: string };
    earnings: { value: number; trend: string };
    responseRate: { value: number; trend: string };
}

export default function CardSection() {
    const [stats, setStats] = useState<KPIStats>({
        profileViews: { value: 0, trend: "0%" },
        newLeads: { value: 0, trend: "0" },
        earnings: { value: 0, trend: "$0" },
        responseRate: { value: 0, trend: "0%" }
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchStats() {
            try {
                const response = await fetch('/api/vendor/stats/kpi');
                if (response.ok) {
                    const data = await response.json();
                    if (data.stats) {
                        setStats(data.stats);
                    }
                }
            } catch (error) {
                console.error("Failed to fetch KPI stats:", error);
            } finally {
                setLoading(false);
            }
        }
        fetchStats();
    }, []);

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-UG', {
            style: 'currency',
            currency: 'UGX',
            maximumSignificantDigits: 3,
            notation: "compact"
        }).format(amount);
    };

    const cards = [
        {
            title: "Profile Views",
            count: stats.profileViews.value,
            stat: stats.profileViews.trend,
            icon: Eye
        },
        {
            title: "New Leads",
            count: stats.newLeads.value,
            stat: stats.newLeads.trend,
            icon: UserPlus
        },
        {
            title: "Earnings (Mo)",
            count: stats.earnings.value, // Will be formatted by Card component or passed as string if needed, currently passing number
            stat: stats.earnings.trend,
            icon: DollarSign,
            isCurrency: true
        },
        {
            title: "Response Rate",
            count: stats.responseRate.value + "%", // Appending % here since Card expects string/number
            stat: stats.responseRate.trend,
            icon: MessageSquareText
        }
    ];

    return (
        <div className="w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {cards.map((card, index) => (
                <Card
                    key={index}
                    title={card.title}
                    count={card.isCurrency ? formatCurrency(card.count as number) : card.count}
                    stat={card.stat}
                    icon={card.icon}
                />
            ))}
        </div>
    )
}