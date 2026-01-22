'use client';

import DashboardHeader from '@/components/planner/dashboard/DashboardHeader';
import DashboardBanner from '@/components/planner/dashboard/DashboardBanner';
import StatsGrid from '@/components/planner/dashboard/StatsGrid';
import ActionRequired from '@/components/planner/dashboard/ActionRequired';
import QuickActions from '@/components/planner/dashboard/QuickActions';
import RecentActivity from '@/components/planner/dashboard/RecentActivity';

export default function PlannerDashboard() {
    return (
        <div className="container mx-auto max-w-7xl">
            <DashboardHeader />

            <div className="mb-8">
                <h1 className="text-3xl font-bold text-shades-black mb-1">
                    Welcome back, <span className="text-primary-01">Sarah!</span>
                </h1>
                <p className="text-neutrals-06">Your events are looking spectacular today.</p>
            </div>

            <DashboardBanner />

            <StatsGrid />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-10">
                    <ActionRequired />
                    <QuickActions />
                </div>
                <div className="lg:col-span-1">
                    <RecentActivity />
                </div>
            </div>
        </div>
    );
}