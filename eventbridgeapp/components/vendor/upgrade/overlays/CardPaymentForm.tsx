"use client";

import { ArrowLeft, X, HelpCircle } from "lucide-react";
import { useState } from "react";

interface CardPaymentFormProps {
    onClose: () => void;
    onSubmit: () => void;
    onBack: () => void;
    amount: number;
    plan: string;
}

export default function CardPaymentForm({
    onClose,
    onSubmit,
    onBack,
    amount,
    plan
}: CardPaymentFormProps) {
    const [cardNumber, setCardNumber] = useState("");
    const [expiry, setExpiry] = useState("");
    const [cvv, setCvv] = useState("");
    const [holderName, setHolderName] = useState("");

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-shades-black/90 backdrop-blur-sm">
            <div className="bg-shades-white rounded-3xl w-full max-w-lg mx-4 border border-neutrals-03 shadow-2xl animate-in fade-in zoom-in-95 duration-300 flex flex-col max-h-[90vh]">
                {/* Header */}
                <div className="p-6 md:p-7 border-b border-neutrals-02 flex-shrink-0 flex items-center justify-between">
                    <button onClick={onBack} className="p-2 hover:bg-neutrals-01 rounded-lg transition-colors">
                        <ArrowLeft size={20} className="text-shades-black" />
                    </button>
                    <h2 className="text-lg font-bold text-shades-black">Card Payment</h2>
                    <button onClick={onClose} className="p-2 hover:bg-neutrals-01 rounded-lg transition-colors">
                        <X size={20} className="text-shades-black" />
                    </button>
                </div>

                {/* Scrollable Content */}
                <div className="overflow-y-auto custom-scrollbar flex-1 p-6 md:p-7">
                    {/* Plan Info */}
                    <div className="bg-neutrals-01 rounded-xl p-4 mb-5">
                        <div className="flex justify-between items-center">
                            <div>
                                <p className="text-sm text-neutrals-06">Upgrading to</p>
                                <p className="text-base font-bold text-shades-black">{plan}</p>
                            </div>
                            <div className="text-right">
                                <p className="text-sm text-neutrals-06">Amount</p>
                                <p className="text-xl font-bold text-primary-01">UGX {amount.toLocaleString()}</p>
                            </div>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        {/* Card Number */}
                        <div>
                            <label className="block text-sm font-semibold text-shades-black mb-2">Card Number</label>
                            <div className="relative">
                                <input
                                    type="text"
                                    value={cardNumber}
                                    onChange={(e) => setCardNumber(e.target.value)}
                                    placeholder="0000 0000 0000 0000"
                                    className="w-full px-4 py-3 rounded-xl border border-neutrals-03 text-shades-black focus:border-primary-01 focus:ring-2 focus:ring-primary-01/10 outline-none transition-all"
                                    maxLength={19}
                                />
                                <div className="absolute right-3 top-3">
                                    <svg className="w-6 h-6 text-neutrals-05" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                                    </svg>
                                </div>
                            </div>
                        </div>

                        {/* Expiry and CVV */}
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-semibold text-shades-black mb-2">Expiry Date</label>
                                <input
                                    type="text"
                                    value={expiry}
                                    onChange={(e) => setExpiry(e.target.value)}
                                    placeholder="MM / YY"
                                    className="w-full px-4 py-3 rounded-xl border border-neutrals-03 text-shades-black focus:border-primary-01 focus:ring-2 focus:ring-primary-01/10 outline-none transition-all"
                                    maxLength={7}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-shades-black mb-2 flex items-center gap-1">
                                    CVV / CVC
                                    <HelpCircle size={14} className="text-neutrals-05" />
                                </label>
                                <input
                                    type="text"
                                    value={cvv}
                                    onChange={(e) => setCvv(e.target.value)}
                                    placeholder="123"
                                    className="w-full px-4 py-3 rounded-xl border border-neutrals-03 text-shades-black focus:border-primary-01 focus:ring-2 focus:ring-primary-01/10 outline-none transition-all"
                                    maxLength={4}
                                />
                            </div>
                        </div>

                        {/* Cardholder Name */}
                        <div>
                            <label className="block text-sm font-semibold text-shades-black mb-2">Account Holder Name</label>
                            <input
                                type="text"
                                value={holderName}
                                onChange={(e) => setHolderName(e.target.value)}
                                placeholder="Name on card"
                                className="w-full px-4 py-3 rounded-xl border border-neutrals-03 text-shades-black focus:border-primary-01 focus:ring-2 focus:ring-primary-01/10 outline-none transition-all"
                            />
                        </div>
                    </form>
                </div>

                {/* Footer */}
                <div className="border-t border-neutrals-02 p-5 md:p-6 flex-shrink-0">
                    <button
                        onClick={handleSubmit}
                        className="w-full py-3.5 bg-primary-01 hover:bg-primary-02 text-shades-white font-bold rounded-xl transition-all"
                    >
                        Proceed with Card Payment →
                    </button>
                </div>
            </div>
        </div>
    );
}
