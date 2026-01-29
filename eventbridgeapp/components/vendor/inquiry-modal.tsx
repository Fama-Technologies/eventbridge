'use client';

import { useState, useEffect } from 'react';
import { Lock, MessageSquare } from 'lucide-react';

interface InquiryModalProps {
    isOpen: boolean;
    onClose: () => void;
    vendorName?: string;
}

export default function InquiryModal({
    isOpen,
    onClose,
    vendorName = 'Vendor'
}: InquiryModalProps) {
    const [isVisible, setIsVisible] = useState(false);
    const [isAnimating, setIsAnimating] = useState(false);
    const [budget, setBudget] = useState('1,500,000');
    const [date, setDate] = useState('');
    const [guests, setGuests] = useState('100+');

    useEffect(() => {
        if (isOpen) {
            setIsVisible(true);
            // Trigger animation after mount
            requestAnimationFrame(() => {
                setIsAnimating(true);
            });
            // Prevent scrolling when modal is open
            document.body.style.overflow = 'hidden';
        } else {
            setIsAnimating(false);
            // Restore scrolling after delay
            const timer = setTimeout(() => {
                setIsVisible(false);
                document.body.style.overflow = 'unset';
            }, 300);
            return () => clearTimeout(timer);
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen]);

    if (!isVisible) return null;

    return (
        <div
            className={`fixed inset-0 z-[100] flex items-center justify-center p-4 transition-all duration-300 ${isAnimating ? 'bg-shades-black-30 backdrop-blur-sm' : 'bg-transparent'
                }`}
            onClick={onClose}
        >
            <div
                className={`
          bg-white rounded-3xl shadow-2xl p-6 sm:p-8 max-w-sm w-full
          transition-all duration-300 ease-out border border-neutrals-02
          ${isAnimating
                        ? 'opacity-100 scale-100 translate-y-0'
                        : 'opacity-0 scale-95 translate-y-4'
                    }
        `}
                onClick={(e) => e.stopPropagation()}
            >
                {/* Budget Input Section */}
                <div className="border border-neutrals-04 rounded-xl p-3 mb-3 hover:border-neutrals-05 transition-colors group">
                    <label className="block text-xs font-bold text-neutrals-06 uppercase mb-1 tracking-wider">
                        Budget
                    </label>
                    <div className="flex items-center">
                        <span className="text-xl sm:text-2xl font-bold text-primary-01 mr-2">UGX</span>
                        <input
                            type="text"
                            value={budget}
                            onChange={(e) => setBudget(e.target.value)}
                            className="w-full text-xl sm:text-2xl font-bold text-primary-01 bg-transparent border-none p-0 focus:ring-0 placeholder:text-primary-01/50"
                            placeholder="0"
                        />
                    </div>
                </div>

                {/* Date and Guests Row */}
                <div className="grid grid-cols-2 gap-3 mb-6">
                    {/* Date Input */}
                    <div className="border border-neutrals-04 rounded-xl p-3 hover:border-neutrals-05 transition-colors cursor-pointer">
                        <label className="block text-xs font-bold text-neutrals-06 uppercase mb-1 tracking-wider">
                            Date
                        </label>
                        <input
                            type="text"
                            onFocus={(e) => (e.target.type = 'date')}
                            onBlur={(e) => (e.target.type = 'text')}
                            value={date}
                            onChange={(e) => setDate(e.target.value)}
                            className="w-full text-base font-bold text-primary-01 bg-transparent border-none p-0 focus:ring-0 placeholder:text-primary-01 cursor-pointer"
                            placeholder="Add Date"
                        />
                    </div>

                    {/* Guests Input */}
                    <div className="border border-neutrals-04 rounded-xl p-3 hover:border-neutrals-05 transition-colors cursor-pointer">
                        <label className="block text-xs font-bold text-neutrals-06 uppercase mb-1 tracking-wider">
                            Guests
                        </label>
                        <input
                            type="text"
                            value={guests}
                            onChange={(e) => setGuests(e.target.value)}
                            className="w-full text-base font-bold text-primary-01 bg-transparent border-none p-0 focus:ring-0 placeholder:text-primary-01"
                            placeholder="Add Guests"
                        />
                    </div>
                </div>

                {/* Send Inquiry Button */}
                <button className="w-full bg-primary-01 hover:bg-primary-02 text-white font-bold py-3.5 rounded-2xl shadow-lg shadow-primary-01/20 active:scale-[0.98] transition-all mb-3 text-lg">
                    Send Inquiry
                </button>

                {/* Chat with Vendor Button */}
                <button className="w-full bg-white border border-neutrals-04 text-foreground font-bold py-3.5 rounded-2xl hover:bg-neutrals-01 hover:border-neutrals-05 active:scale-[0.98] transition-all flex items-center justify-center gap-2 mb-6">
                    <MessageSquare size={20} className="text-foreground" />
                    Chat with Vendor
                </button>

                {/* Security Disclaimer */}
                <div className="flex items-center justify-center gap-2 text-neutrals-06">
                    <Lock size={14} />
                    <span className="text-xs">You won't be charged on the platform</span>
                </div>
            </div>
        </div>
    );
}
