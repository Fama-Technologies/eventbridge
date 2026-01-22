'use client';

import { ArrowRight, Flower2, Music } from 'lucide-react';
import { cn } from '@/lib/utils';
import Link from 'next/link';

interface ActionItemProps {
    title: string;
    requester: string;
    date: string;
    status: 'urgent' | 'pending';
    icon: React.ReactNode;
    iconColor: string;
    iconBg: string;
}

function ActionItem({ title, requester, date, status, icon, iconColor, iconBg }: ActionItemProps) {
    return (
        <div className="bg-shades-white p-5 rounded-xl border border-neutrals-03 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 hover:shadow-md transition-shadow">
            <div className="flex items-start md:items-center gap-4">
                <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center shrink-0", iconBg, iconColor)}>
                    {icon}
                </div>
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-bold text-shades-black">{title}</h4>
                        {status === 'urgent' && (
                            <span className="text-[10px] font-bold bg-[#FFF4E5] text-[#FF9500] px-1.5 py-0.5 rounded">URGENT</span>
                        )}
                        {status === 'pending' && (
                            <span className="text-[10px] font-bold bg-[#E6F0FF] text-[#007AFF] px-1.5 py-0.5 rounded">PENDING</span>
                        )}
                    </div>
                    <p className="text-sm text-neutrals-06">
                        Requested by <span className="text-shades-black font-medium">{requester}</span> • {date}
                    </p>
                </div>
            </div>

            <div className="flex items-center gap-3 w-full md:w-auto">
                <button className="flex-1 md:flex-none px-4 py-2 rounded-lg border border-neutrals-03 text-sm font-semibold text-shades-black hover:bg-neutrals-01 transition-colors">
                    Decline
                </button>
                <button className="flex-1 md:flex-none px-4 py-2 rounded-lg bg-primary-01 text-white text-sm font-semibold hover:bg-primary-02 transition-colors flex items-center justify-center gap-2">
                    Respond
                    <ArrowRight size={14} />
                </button>
            </div>
        </div>
    );
}

export default function ActionRequired() {
    return (
        <div className="mb-10">
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-bold text-shades-black">Action Required</h2>
                <Link href="/planner/activities" className="text-sm font-semibold text-primary-01 hover:text-primary-02 flex items-center gap-1">
                    See All
                    <ArrowRight size={14} />
                </Link>
            </div>

            <div className="space-y-4">
                <ActionItem
                    title="Floral Arrangement Quote"
                    requester="Bloom & Stem"
                    date="Oct 24"
                    status="urgent"
                    icon={<Flower2 size={24} />}
                    iconBg="bg-pink-50"
                    iconColor="text-pink-500"
                />
                <ActionItem
                    title="DJ Deposit Payment"
                    requester="SoundWave Ent."
                    date="Nov 12"
                    status="pending"
                    icon={<Music size={24} />}
                    iconBg="bg-blue-50"
                    iconColor="text-blue-500"
                />
            </div>
        </div>
    );
}
