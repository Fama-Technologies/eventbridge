'use client';

import { Eye, DollarSign, MessageSquareText, CalendarCheck2 } from 'lucide-react';
import Card from './card';
import { useDashboardData } from './DashboardDataProvider';

export default function CardSection() {
  const { data, loading } = useDashboardData();

  const stats = data?.stats;

  const cards = [
    {
      title: 'Total Bookings',
      count: stats?.totalBookings ?? 0,
      stat: stats ? `${stats.bookingsGrowth}%` : '0%',
      icon: CalendarCheck2,
    },
    {
      title: 'Pending Requests',
      count: stats?.pendingRequests ?? 0,
      stat: stats ? `${stats.pendingRequests}` : '0',
      icon: MessageSquareText,
    },
    {
      title: 'Monthly Revenue',
      count: stats?.totalRevenue ?? 0,
      stat: stats ? `${stats.revenueGrowth}%` : '0%',
      icon: DollarSign,
    },
    {
      title: 'Response Rate',
      count: stats?.responseRate ?? 0,
      stat: stats ? `${stats.responseRate}%` : '0%',
      icon: Eye,
    },
  ];

  if (loading) {
    return (
      <div className="w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {cards.map((card) => (
          <Card key={card.title} title={card.title} count={0} stat="" icon={card.icon} />
        ))}
      </div>
    );
  }

  return (
    <div className="w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {cards.map((card) => (
        <Card
          key={card.title}
          title={card.title}
          count={card.count}
          stat={card.stat}
          icon={card.icon}
        />
      ))}
    </div>
  );
}
