"use client";

import { ArrowLeft, Check, X } from "lucide-react";
import Image from "next/image";
import { useState } from "react";

interface PaymentMethodSelectionProps {
    onClose: () => void;
    onSelectMethod: (method: 'momo' | 'airtel' | 'card' | 'bank') => void;
    amount: number;
    plan: string;
}

export default function PaymentMethodSelection({
    onClose,
    onSelectMethod,
    amount,
    plan
}: PaymentMethodSelectionProps) {
    const [selectedMethod, setSelectedMethod] = useState<'momo' | 'airtel' | 'card' | null>(null);
    const [phoneNumber, setPhoneNumber] = useState("+256 772 123 456");
    const [cardDetails, setCardDetails] = useState({ number: "", expiry: "", cvv: "", name: "" });

    const handleMethodClick = (method: 'momo' | 'airtel' | 'card') => {
        setSelectedMethod(method);
    };

    const handleProceed = () => {
        if (selectedMethod) {
            onSelectMethod(selectedMethod);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-shades-black/90 backdrop-blur-sm">
            <div className="bg-shades-white rounded-3xl w-full max-w-lg mx-4 shadow-2xl animate-in fade-in zoom-in-95 duration-300 flex flex-col max-h-[90vh]">
                {/* Header */}
                <div className="p-4 flex-shrink-0">
                    <button onClick={onClose} className="p-2 hover:bg-neutrals-07 rounded-lg transition-colors mb-6">
                        <ArrowLeft size={20} className="text-shades-black" />
                    </button>
                    <h2 className="text-xl font-bold text-shades-black text-center mb-8">Choose your payment method</h2>
                </div>

                {/* Scrollable Content */}
                <div className="overflow-y-auto custom-scrollbar flex-1 px-6 pb-6">
                    {/* Payment Methods Grid */}
                    <div className="grid grid-cols-2 gap-4 mb-6">
                        {/* MTN MoMo */}
                        <button
                            onClick={() => handleMethodClick('momo')}
                            className={`relative p-6 rounded-2xl border-2 transition-all ${selectedMethod === 'momo'
                                ? 'border-primary-01 bg-primary-01/10'
                                : 'border-neutrals-04 bg-neutrals-07 hover:bg-neutrals-06'
                                }`}
                        >
                            {selectedMethod === 'momo' && (
                                <div className="absolute top-2 right-2 w-5 h-5 bg-primary-01 rounded-full flex items-center justify-center">
                                    <Check size={14} className="text-shades-white" />
                                </div>
                            )}
                            <div className="absolute top-2 left-2 px-2 py-1 bg-primary-01 text-shades-white text-[10px] font-bold rounded">
                                MOST POPULAR IN UGANDA
                            </div>
                            <div className="flex flex-col items-center pt-6">
                                <div className="w-16 h-16 mb-3 flex items-center justify-center">
                                    <Image src="/icons/mtn.svg" alt="MTN" width={48} height={48} />
                                </div>
                                <p className="font-bold text-shades-white text-sm">MTN MoMo</p>
                                <p className="text-xs text-primary-01">Instant prompt on phone</p>
                            </div>
                        </button>

                        {/* Airtel Money */}
                        <button
                            onClick={() => handleMethodClick('airtel')}
                            className={`relative p-6 rounded-2xl border-2 transition-all ${selectedMethod === 'airtel'
                                ? 'border-primary-01 bg-primary-01/10'
                                : 'border-neutrals-04 bg-neutrals-07 hover:bg-neutrals-06'
                                }`}
                        >
                            {selectedMethod === 'airtel' && (
                                <div className="absolute top-2 right-2 w-5 h-5 bg-primary-01 rounded-full flex items-center justify-center">
                                    <Check size={14} className="text-white" />
                                </div>
                            )}
                            <div className="flex flex-col items-center">
                                <div className="w-16 h-16 mb-3 flex items-center justify-center">
                                    <Image src="/icons/airtel.svg" alt="Airtel" width={48} height={48} />
                                </div>
                                <p className="font-bold text-shades-white text-sm">Airtel Money</p>
                                <p className="text-xs text-neutrals-05">Instant prompt on phone</p>
                            </div>
                        </button>
                    </div>

                    {/* Card Payment or Bank Transfer */}
                    <div className="space-y-4">
                        <button
                            onClick={() => handleMethodClick('card')}
                            className={`w-full p-6 rounded-2xl border-2 transition-all ${selectedMethod === 'card'
                                ? 'border-primary-01 bg-primary-01/10'
                                : 'border-neutrals-04 bg-neutrals-07 hover:bg-neutrals-06'
                                }`}
                        >
                            <div className="flex items-center justify-between relative">
                                {selectedMethod === 'card' && (
                                    <div className="absolute -top-2 -right-2 w-5 h-5 bg-primary-01 rounded-full flex items-center justify-center">
                                        <Check size={14} className="text-white" />
                                    </div>
                                )}
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-neutrals-06 rounded-lg flex items-center justify-center">
                                        <svg className="w-6 h-6 text-shades-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                                        </svg>
                                    </div>
                                    <div className="text-left">
                                        <p className="font-bold text-shades-white">Visa / Mastercard</p>
                                        <p className="text-xs text-neutrals-05">Credit/Debit or Virtual</p>
                                    </div>
                                </div>
                            </div>
                        </button>

                        {/* Bank Transfer Option */}
                        <button
                            onClick={() => onSelectMethod('bank')}
                            className="w-full p-5 rounded-2xl border-2 border-neutrals-04 bg-neutrals-07 hover:bg-neutrals-06 transition-all"
                        >
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-neutrals-06 rounded-lg flex items-center justify-center">
                                    <svg className="w-6 h-6 text-shades-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z" />
                                    </svg>
                                </div>
                                <div className="text-left">
                                    <p className="font-bold text-shades-white">Bank Transfer</p>
                                    <p className="text-xs text-neutrals-05">Other options</p>
                                </div>
                            </div>
                        </button>
                    </div>

                    {/* Phone Number Input for MoMo/Airtel */}
                    {(selectedMethod === 'momo' || selectedMethod === 'airtel') && (
                        <div className="mt-6 p-6 bg-neutrals-07 rounded-2xl border border-neutrals-04">
                            <label className="block text-sm font-semibold text-shades-white mb-3">MoMo Phone Number</label>
                            <div className="relative">
                                <div className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
                                    <span className="text-lg">🇺🇬</span>
                                </div>
                                <input
                                    type="text"
                                    value={phoneNumber}
                                    onChange={(e) => setPhoneNumber(e.target.value)}
                                    className="w-full pl-14 pr-4 py-4 rounded-xl bg-neutrals-08 border border-neutrals-04 text-shades-white placeholder-neutrals-05 focus:border-primary-01 focus:ring-2 focus:ring-primary-01/20 outline-none transition-all"
                                />
                            </div>
                            <p className="mt-3 text-xs text-neutrals-05 flex items-start gap-2">
                                <span className="text-primary-01">⚠</span>
                                We'll send a secure prompt to your phone — please approve with your PIN to complete.
                            </p>
                        </div>
                    )}

                    {/* Card Details Form */}
                    {selectedMethod === 'card' && (
                        <div className="mt-6 p-6 bg-neutrals-07 rounded-2xl border border-neutrals-04 space-y-4">
                            <div>
                                <label className="block text-sm font-semibold text-shades-white mb-2">Card Number</label>
                                <input
                                    type="text"
                                    placeholder="0000 0000 0000 0000"
                                    value={cardDetails.number}
                                    onChange={(e) => setCardDetails({ ...cardDetails, number: e.target.value })}
                                    className="w-full px-4 py-3 rounded-xl bg-neutrals-08 border border-neutrals-04 text-shades-white placeholder-neutrals-06 focus:border-primary-01 focus:ring-2 focus:ring-primary-01/20 outline-none transition-all"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-semibold text-shades-white mb-2">Expiry Date</label>
                                    <input
                                        type="text"
                                        placeholder="MM / YY"
                                        value={cardDetails.expiry}
                                        onChange={(e) => setCardDetails({ ...cardDetails, expiry: e.target.value })}
                                        className="w-full px-4 py-3 rounded-xl bg-black/30 border border-white/10 text-white placeholder-gray-600 focus:border-primary-01 focus:ring-2 focus:ring-primary-01/20 outline-none transition-all"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-shades-white mb-2 flex items-center gap-1">
                                        CVV / CVC
                                        <svg className="w-3 h-3 text-neutrals-05" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="123"
                                        value={cardDetails.cvv}
                                        onChange={(e) => setCardDetails({ ...cardDetails, cvv: e.target.value })}
                                        className="w-full px-4 py-3 rounded-xl bg-black/30 border border-white/10 text-white placeholder-gray-600 focus:border-primary-01 focus:ring-2 focus:ring-primary-01/20 outline-none transition-all"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-shades-white mb-2">Account Holder Name</label>
                                <input
                                    type="text"
                                    placeholder="Name on card"
                                    value={cardDetails.name}
                                    onChange={(e) => setCardDetails({ ...cardDetails, name: e.target.value })}
                                    className="w-full px-4 py-3 rounded-xl bg-black/30 border border-white/10 text-white placeholder-gray-600 focus:border-primary-01 focus:ring-2 focus:ring-primary-01/20 outline-none transition-all"
                                />
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                {selectedMethod && (
                    <div className="border-t border-white/10 p-6 flex-shrink-0">
                        <button
                            onClick={handleProceed}
                            className="w-full py-4 bg-primary-01 hover:bg-primary-02 text-white font-bold rounded-xl transition-all flex items-center justify-center gap-2"
                        >
                            Proceed with {selectedMethod === 'momo' ? 'MTN MoMo' : selectedMethod === 'airtel' ? 'Airtel Money' : 'Card Payment'} →
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
