"use client"
import { UserPlus, Eye, DollarSign, MessageSquareText } from "lucide-react";
import Card from "./card";

interface CardSectionProps {
  stats?: {
    totalRevenue: number;
    revenueGrowth: number;
    totalBookings: number;
    bookingsGrowth: number;
    pendingRequests: number;
    activeEvents: number;
  };
  formatCurrency?: (amount: number) => string;
}

export default function CardSection({ 
  stats, 
  formatCurrency 
}: CardSectionProps) {
  
  // Default values if no stats provided
  const defaultStats = {
    totalRevenue: 0,
    revenueGrowth: 0,
    totalBookings: 0,
    bookingsGrowth: 0,
    pendingRequests: 0,
    activeEvents: 0,
  };

  const currentStats = stats || defaultStats;
  
  // Default currency formatter
  const defaultFormatCurrency = (amount: number) => {
    return `UGX ${new Intl.NumberFormat("en-UG", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)}`;
  };

  const currencyFormatter = (amount: number) => {
    if (formatCurrency) {
      return formatCurrency(amount).replace("UGX", "").trim();
    }
    return defaultFormatCurrency(amount).replace("UGX", "").trim();
  };

  // Calculate dynamic values from stats
  const profileViews = currentStats.totalBookings * 156; // Example: each booking generates ~156 views
  const profileViewsStat = currentStats.bookingsGrowth >= 0 ? `+${currentStats.bookingsGrowth}%` : `${currentStats.bookingsGrowth}%`;
  
  const newLeads = currentStats.pendingRequests;
  const newLeadsStat = currentStats.pendingRequests > 0 ? `+${currentStats.pendingRequests}` : "0";
  
  const earnings = currentStats.totalRevenue;
  const earningsStat = currentStats.revenueGrowth >= 0 ? `+${Math.abs(currentStats.revenueGrowth)}%` : `${currentStats.revenueGrowth}%`;
  
  const responseRate = 98; // Default response rate
  const responseRateStat = "0%"; // Default stat

  const cards = [
    {
      title: "Profile Views",
      count: profileViews,
      stat: profileViewsStat,
      icon: Eye
    },
    {
      title: "New Leads",
      count: newLeads,
      stat: newLeadsStat,
      icon: UserPlus
    },
    {
      title: "Earnings (Mo)",
      count: currencyFormatter(earnings),
      stat: earningsStat,
      icon: DollarSign
    },
    {
      title: "Response Rate",
      count: responseRate,
      stat: responseRateStat,
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