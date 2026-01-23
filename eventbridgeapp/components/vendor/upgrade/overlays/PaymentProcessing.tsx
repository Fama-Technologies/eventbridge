"use client";

import { Smartphone } from "lucide-react";
import { useEffect, useState } from "react";

interface PaymentProcessingProps {
    onCancel: () => void;
    onResend: () => void;
    onChangeNumber: () => void;
    phoneNumber: string;
    paymentMethod: string;
}

export default function PaymentProcessing({
    onCancel,
    onResend,
    onChangeNumber,
    phoneNumber,
    paymentMethod
}: PaymentProcessingProps) {
    const [timeLeft, setTimeLeft] = useState(300); // 5 minutes in seconds

    useEffect(() => {
        const timer = setInterval(() => {
            setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
        }, 1000);

        return () => clearInterval(timer);
    }, []);

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-shades-black/90 backdrop-blur-sm">
            <div className="bg-neutrals-08 rounded-3xl w-full max-w-md mx-4 shadow-2xl animate-in fade-in zoom-in-95 duration-300 p-8 text-center">
                {/* Animated Phone Icon */}
                <div className="relative w-32 h-32 mx-auto mb-8">
                    {/* Outer pulsing ring */}
                    <div className="absolute inset-0 bg-primary-01/20 rounded-full animate-ping"></div>
                    {/* Middle ring */}
                    <div className="absolute inset-4 border-2 border-primary-01/30 rounded-full"></div>
                    {/* Inner circle */}
                    <div className="absolute inset-8 bg-neutrals-07 rounded-full border border-primary-01/50 flex items-center justify-center">
                        <Smartphone size={40} className="text-primary-01" />
                    </div>
                    {/* Small dot indicator */}
                    <div className="absolute top-2 right-8 w-4 h-4 bg-primary-01 rounded-full animate-pulse"></div>
                </div>

                {/* Title */}
                <h2 className="text-2xl font-bold text-shades-white mb-3">
                    We're waiting for your approval
                </h2>

                {/* Description */}
                <p className="text-neutrals-05 text-sm mb-1">
                    Check your phone for the <span className="font-semibold text-shades-white">{paymentMethod}</span> prompt
                </p>
                <p className="text-neutrals-05 text-sm mb-8">
                    Enter your PIN • Usually takes 30–60 seconds
                </p>

                {/* Timer */}
                <div className="inline-flex items-center gap-2 px-5 py-2 bg-neutrals-07 rounded-full border border-neutrals-04 mb-10">
                    <svg className="w-4 h-4 text-neutrals-05" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="text-sm font-semibold text-shades-white">Expires in {formatTime(timeLeft)}</span>
                </div>

                {/* Action Links */}
                <div className="flex items-center justify-center gap-3 text-sm mb-6">
                    <button
                        onClick={onResend}
                        className="text-primary-01 font-semibold hover:underline"
                    >
                        Didn't receive prompt? Resend
                    </button>
                    <span className="text-neutrals-06">|</span>
                    <button
                        onClick={onChangeNumber}
                        className="text-neutrals-05 hover:text-shades-white transition-colors"
                    >
                        Wrong number? Change
                    </button>
                </div>

                {/* Progress Bar */}
                <div className="w-full bg-neutrals-06 rounded-full h-1.5 mb-6 overflow-hidden">
                    <div
                        className="h-full bg-primary-01 transition-all duration-1000 ease-linear"
                        style={{ width: `${(timeLeft / 300) * 100}%` }}
                    ></div>
                </div>

                {/* Cancel Button */}
                <button
                    onClick={onCancel}
                    className="text-neutrals-05 text-sm hover:text-shades-white font-semibold underline transition-colors"
                >
                    Cancel
                </button>
            </div>
        </div>
    );
}

