'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { X, MessageSquare, Lock, Loader2 } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { toast } from 'sonner';

interface InquiryModalProps {
    isOpen: boolean;
    onClose: () => void;
    vendorName: string;
    vendorId: string;
}

export function InquiryModal({ isOpen, onClose, vendorName, vendorId }: InquiryModalProps) {
    const router = useRouter();
    const { data: session } = useSession();
    const [loading, setLoading] = useState(false);
    const [budget, setBudget] = useState('1,500,000');
    const [date, setDate] = useState('');
    const [guests, setGuests] = useState('100+');

    if (!isOpen) return null;

    const handleSendInquiry = async () => {
        if (!session) {
            router.push('/login?callbackUrl=' + window.location.pathname);
            return;
        }

        if (!date) {
            toast.error('Please select a date');
            return;
        }

        setLoading(true);
        try {
            // Create content for the message
            const content = `Inquiry for ${vendorName}\n\nBudget: UGX ${budget}\nDate: ${date}\nGuests: ${guests}`;

            // Create thread and send message (API gets customerId from session)
            const response = await fetch('/api/customer/messages/threads', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    vendorId: parseInt(vendorId),
                    content: content
                })
            });

            if (response.ok) {
                toast.success('Inquiry sent successfully!');
                onClose();
                router.push('/customer/messages');
            } else {
                const error = await response.json();
                toast.error(error.message || 'Failed to send inquiry');
            }
        } catch (error) {
            console.error('Inquiry error:', error);
            toast.error('Something went wrong');
        } finally {
            setLoading(false);
        }
    };

    const handleChat = async () => {
        if (!session) {
            router.push('/login?callbackUrl=' + window.location.pathname);
            return;
        }

        setLoading(true);
        try {
            // Create thread or get existing one (API gets customerId from session)
            const response = await fetch('/api/customer/messages/threads', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    vendorId: parseInt(vendorId),
                    content: "Hi! I'm interested in your services."
                })
            });

            if (response.ok) {
                router.push('/customer/messages');
            } else {
                toast.error('Failed to start chat');
            }
        } catch (error) {
            console.error('Chat error:', error);
            toast.error('Connection failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl p-6 md:p-8 animate-in zoom-in-95 duration-200">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 p-2 rounded-full hover:bg-neutrals-02 transition-colors text-neutrals-06"
                >
                    <X size={20} />
                </button>

                <div className="text-center mb-6">
                    <h2 className="text-2xl font-bold text-shades-black mb-1">Make an Inquiry</h2>
                    <p className="text-neutrals-06 text-sm">Send details to {vendorName}</p>
                </div>

                <div className="space-y-4 mb-6">
                    {/* Budget Input */}
                    <div>
                        <label className="block text-xs font-bold text-neutrals-04 uppercase mb-1.5 ml-1">Budget</label>
                        <div className="relative">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-primary-01 font-bold">UGX</span>
                            <input
                                type="text"
                                value={budget}
                                onChange={(e) => setBudget(e.target.value)}
                                className="w-full pl-14 pr-4 py-3 rounded-xl border border-neutrals-03 focus:border-primary-01 focus:ring-1 focus:ring-primary-01 outline-none font-bold text-primary-01 text-lg transition-all"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {/* Date Input */}
                        <div>
                            <label className="block text-xs font-bold text-neutrals-04 uppercase mb-1.5 ml-1">Date</label>
                            <input
                                type="date"
                                value={date}
                                onChange={(e) => setDate(e.target.value)}
                                className="w-full px-4 py-3 rounded-xl border border-neutrals-03 focus:border-primary-01 focus:ring-1 focus:ring-primary-01 outline-none font-bold text-primary-01 transition-all"
                            />
                        </div>

                        {/* Guests Input */}
                        <div>
                            <label className="block text-xs font-bold text-neutrals-04 uppercase mb-1.5 ml-1">Guests</label>
                            <div className="relative">
                                <select
                                    value={guests}
                                    onChange={(e) => setGuests(e.target.value)}
                                    className="w-full px-4 py-3 rounded-xl border border-neutrals-03 focus:border-primary-01 focus:ring-1 focus:ring-primary-01 outline-none font-bold text-primary-01 transition-all appearance-none cursor-pointer"
                                >
                                    <option>10-50</option>
                                    <option>50-100</option>
                                    <option>100+</option>
                                    <option>200+</option>
                                    <option>500+</option>
                                </select>
                                {/* Custom Arrow */}
                                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                                    <svg width="10" height="6" viewBox="0 0 10 6" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M1 1L5 5L9 1" stroke="#FF4D00" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="space-y-3">
                    <button
                        onClick={handleSendInquiry}
                        disabled={loading}
                        className="w-full py-3.5 bg-primary-01 hover:bg-primary-02 text-white rounded-2xl font-bold text-lg shadow-lg shadow-primary-01/20 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-70 disabled:hover:scale-100 flex items-center justify-center gap-2"
                    >
                        {loading ? <Loader2 className="animate-spin" /> : 'Send Inquiry'}
                    </button>

                    <button
                        onClick={handleChat}
                        disabled={loading}
                        className="w-full py-3.5 bg-white border-2 border-primary-01/10 hover:bg-primary-01/5 text-shades-black rounded-2xl font-bold text-lg transition-all flex items-center justify-center gap-2 hover:border-primary-01/20"
                    >
                        <MessageSquare size={20} className="text-shades-black" />
                        Chat with Vendor
                    </button>
                </div>

                <div className="mt-6 flex items-center justify-center gap-2 text-neutrals-06">
                    <Lock size={14} />
                    <span className="text-xs font-medium">You won't be charged on the platform</span>
                </div>
            </div>
        </div>
    );
}
