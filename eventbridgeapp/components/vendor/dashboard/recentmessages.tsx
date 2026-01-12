"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import Recent from "./recent";
import { ArrowRight, Loader2 } from "lucide-react";

type Message = {
    id: number;
    sender: string;
    badge: 'Urgent' | 'Pending' | 'Completed' | string;
    firstname: string;
    lastname: string;
    date: string;
};

export default function RecentMessages() {
    const [messages, setMessages] = useState<Message[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchMessages() {
            try {
                const response = await fetch('/api/vendor/conversations');
                if (response.ok) {
                    const data = await response.json();
                    const conversations = data.conversations || [];

                    // Map API conversations to simplified Message format for dashboard
                    const mappedMessages: Message[] = conversations
                        .slice(0, 3) // Only show top 3
                        .map((c: any, index: number) => ({
                            id: index + 1,
                            sender: c.eventName || c.name, // Use event name as main title
                            badge: c.unread ? 'URGENT' : (c.status === 'pending-quote' ? 'PENDING' : 'COMPLETED'),
                            firstname: c.name.split(' ')[0] || "Client",
                            lastname: c.name.split(' ')[1] || "",
                            // Use timestamp but keep it simple
                            date: c.timestamp.includes(',') ? c.timestamp.split(',')[0] : c.timestamp
                        }));

                    setMessages(mappedMessages);
                }
            } catch (error) {
                console.error("Failed to fetch recent messages:", error);
            } finally {
                setLoading(false);
            }
        }
        fetchMessages();
    }, []);

    if (loading) {
        return <div className="py-8 flex justify-center"><Loader2 className="animate-spin h-5 w-5 text-primary-01" /></div>;
    }

    return (
        <div className="flex flex-col">
            <div className="w-full flex flex-row justify-between ">
                <h2 className="font-font1 font-semibold text-[18px] leading-6 tracking-normal text-shades-black">Action Required</h2>

                <Link href="/vendor/messages" className="text-primary-01 text-sm hover:text-primary-02 transition-colors flex items-center gap-1">
                    View all
                    <ArrowRight size={16} className="inline-block" aria-hidden />
                </Link>
            </div>
            <div className="mt-6 flex flex-col gap-4 ">
                {messages.length > 0 ? (
                    messages.map((m) => (
                        <Recent key={m.id} title={m.sender} badge={m.badge} firstname={m.firstname} lastname={m.lastname} date={m.date} />
                    ))
                ) : (
                    <p className="text-sm text-neutrals-06 text-center">No new messages action required.</p>
                )}
            </div>
        </div>
    )
}