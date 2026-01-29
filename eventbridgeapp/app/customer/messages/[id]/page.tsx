"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { ArrowLeft, MoreHorizontal, Paperclip, Smile, Send } from "lucide-react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

// Mock Data for a specific conversation
const CHAT_HISTORY = [
    {
        id: "m1",
        type: "system",
        text: "INQUIRY SENT",
    },
    {
        id: "m2",
        type: "received",
        text: "Hi Sarah! I've prepared the quote for your wedding décor based on our meeting yesterday.",
        time: "14:15",
    },
    {
        id: "m3",
        type: "system",
        text: "INVOICE RECIEVED", // Typo intended to match design if needed, but correcting to RECEIVED for good measure? Design says RECIEVED. Keeping "RECEIVED" or "RECIEVED" - let's stick to standard "RECEIVED" for now or match design strictly? Design usually has typos. Let's fix it: "INVOICE RECEIVED"
    },
    {
        id: "m4",
        type: "quote",
        title: "Wedding Décor Package",
        description: "Full venue styling, floral arrangements, and lighting.",
        price: "UGX 2,450,000",
        status: "pending",
    },
    {
        id: "m5",
        type: "sent",
        text: "This looks perfect! I'll accept it right away. Could you send over the deposit receipt as well?",
        time: "14:20",
        status: "read",
    },
    {
        id: "m6",
        type: "received",
        text: "Certainly! Here is the receipt for your records.",
        time: "14:21",
    },
];

export default function ChatPage({ params }: { params: { id: string } }) {
    const router = useRouter();
    const [messages, setMessages] = useState(CHAT_HISTORY);
    const [inputValue, setInputValue] = useState("");
    const scrollRef = useRef<HTMLDivElement>(null);

    // Mock checking which vendor this is based on ID
    const vendor = {
        name: "Royal Touch Décor",
        status: "Online",
        avatar: "/images/vendor1.jpg",
    };

    useEffect(() => {
        // Scroll to bottom on load
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, []);

    return (
        <div className="flex flex-col h-screen bg-shades-white">
            {/* Header */}
            <div className="shrink-0 flex items-center justify-between px-4 py-3 border-b border-neutrals-03 sticky top-0 bg-shades-white z-20">
                <div className="flex items-center gap-3">
                    <button onClick={() => router.back()} className="p-1">
                        <ArrowLeft size={24} className="text-shades-black" />
                    </button>
                    <div className="relative">
                        <div className="w-10 h-10 rounded-full bg-stone-800 flex items-center justify-center text-white font-bold text-sm overflow-hidden">
                            {vendor.name[0]}
                        </div>
                        <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-accents-discount rounded-full border-2 border-shades-white"></div>
                    </div>
                    <div className="flex flex-col">
                        <h1 className="text-base font-bold text-shades-black leading-tight">
                            {vendor.name}
                        </h1>
                        <span className="text-xs text-accents-discount font-medium">
                            {vendor.status}
                        </span>
                    </div>
                </div>
                <button className="p-1 text-neutrals-05">
                    <MoreHorizontal size={24} />
                </button>
            </div>

            {/* Chat Area */}
            <div className="flex-1 overflow-y-auto bg-neutrals-01 p-4 pb-24" ref={scrollRef}>
                <div className="space-y-6">
                    {messages.map((msg) => (
                        <div key={msg.id} className="flex flex-col w-full">
                            {/* System Message / Badge */}
                            {msg.type === "system" && (
                                <div className="flex justify-center my-2">
                                    <span className="bg-primary-01/10 text-primary-02 text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wide border border-primary-01/20">
                                        {msg.text}
                                    </span>
                                </div>
                            )}

                            {/* Received Message */}
                            {msg.type === "received" && (
                                <div className="flex justify-start max-w-[80%]">
                                    <div className="bg-neutrals-02 text-shades-black p-4 rounded-2xl rounded-tl-sm text-sm leading-relaxed">
                                        {msg.text}
                                    </div>
                                </div>
                            )}

                            {/* Sent Message */}
                            {msg.type === "sent" && (
                                <div className="flex justify-end w-full">
                                    <div className="max-w-[80%] flex flex-col items-end">
                                        <div className="bg-primary-01 text-shades-white p-4 rounded-2xl rounded-tr-sm text-sm leading-relaxed shadow-sm">
                                            {msg.text}
                                        </div>
                                        <span className="text-[10px] text-neutrals-05 mt-1 mr-1">
                                            Read {msg.time}
                                        </span>
                                    </div>
                                </div>
                            )}

                            {/* Quote Card */}
                            {msg.type === "quote" && (
                                <div className="flex justify-center my-2 w-full">
                                    <div className="bg-shades-white rounded-3xl p-5 shadow-sm border border-neutrals-03 w-full max-w-sm">
                                        <h3 className="font-bold text-shades-black text-base mb-1">
                                            {msg.title}
                                        </h3>
                                        <p className="text-sm text-neutrals-05 italic mb-4">
                                            {msg.description}
                                        </p>
                                        <div className="mb-4">
                                            <span className="text-[10px] text-neutrals-05 uppercase font-bold block mb-0.5">PRICE</span>
                                            <span className="text-lg font-bold text-shades-black">{msg.price}</span>
                                        </div>
                                        <button className="w-full bg-primary-01 hover:bg-primary-02 text-shades-white font-bold py-3 rounded-full transition-colors shadow-md">
                                            Accept Quote
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            {/* Input Area */}
            <div className="bg-shades-white border-t border-neutrals-03 px-4 py-3 fixed bottom-0 left-0 right-0 z-20 pb-safe-area-inset-bottom">
                <div className="flex items-center gap-2 max-w-7xl mx-auto">
                    <button className="text-neutrals-05 hover:text-neutrals-07 p-2">
                        <Paperclip size={24} className="rotate-45" />
                    </button>
                    <button className="text-neutrals-05 hover:text-neutrals-07 p-2">
                        <Smile size={24} />
                    </button>
                    <div className="flex-1 bg-neutrals-01 rounded-full px-4 py-2.5">
                        <input
                            type="text"
                            placeholder="Type a message..."
                            className="w-full bg-transparent border-none outline-none text-sm text-shades-black placeholder:text-neutrals-05"
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                        />
                    </div>
                    <button className="bg-primary-01 hover:bg-primary-02 text-shades-white p-3 rounded-full flex items-center justify-center shadow-lg transition-transform active:scale-95">
                        <Send size={20} className="ml-0.5" fill="currentColor" />
                    </button>
                </div>
            </div>
        </div>
    );
}
