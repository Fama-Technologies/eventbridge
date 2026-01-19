'use client';

import { X, Clock, Paperclip, Smile, Send } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import type { Transaction } from './data';

interface TransactionDetailsModalProps {
    isOpen: boolean;
    onClose: () => void;
    transaction: Transaction;
}

export default function TransactionDetailsModal({ isOpen, onClose, transaction }: TransactionDetailsModalProps) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-shades-black/60 backdrop-blur-sm transition-opacity"
                onClick={onClose}
            />

            {/* Modal Content */}
            <div className="relative w-full max-w-[600px] bg-shades-black rounded-2xl shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                {/* Header Section */}
                <div className="relative p-6 border-b border-neutrals-08 bg-neutrals-09">
                    {/* Close Button */}
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 p-2 text-neutrals-05 hover:text-shades-white hover:bg-neutrals-08 rounded-full transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>

                    {/* Status Badge */}
                    <div className="absolute top-6 right-16">
                        {transaction.status === 'pending' && (
                            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#B54708]/20 border border-[#B54708]/30">
                                <span className="text-xs font-bold text-[#FFA800] uppercase tracking-wider">
                                    Payout Pending
                                </span>
                                <Clock className="w-3 h-3 text-[#FFA800]" />
                                <span className="text-xs font-medium text-[#FFA800]">
                                    3h 42m
                                </span>
                            </div>
                        )}
                    </div>

                    <div className="flex gap-4 items-start pt-2">
                        {/* Avatar */}
                        <div className="relative">
                            <div className="w-16 h-16 rounded-full bg-neutrals-07 flex items-center justify-center text-xl font-medium text-shades-white overflow-hidden border-2 border-neutrals-08">
                                <img
                                    src={`https://ui-avatars.com/api/?name=${transaction.clientName}&background=random`}
                                    alt={transaction.clientName}
                                    className="w-full h-full object-cover"
                                />
                            </div>
                            <div className="absolute bottom-0 right-0 w-4 h-4 rounded-full bg-green-500 border-2 border-neutrals-09" />
                        </div>

                        {/* Title & Info */}
                        <div>
                            <h2 className="text-xl font-bold text-shades-white mb-1">
                                {transaction.title}
                            </h2>
                            <div className="flex items-center gap-2 text-sm text-neutrals-05">
                                <span>150-200 Guests</span>
                                <span className="w-1 h-1 rounded-full bg-neutrals-06" />
                                <span>$25,000 Est. Budget</span>
                                <span className="w-1 h-1 rounded-full bg-neutrals-06" />
                                <span>Napa Valley, CA</span>
                            </div>
                        </div>
                    </div>

                    {/* Tabs */}
                    <div className="flex gap-8 mt-8 border-b border-transparent">
                        <button className="pb-3 text-sm font-semibold text-primary-01 border-b-2 border-primary-01">
                            Details
                        </button>
                        <button className="pb-3 text-sm font-medium text-neutrals-05 hover:text-shades-white transition-colors">
                            Messages (1)
                        </button>
                        <button className="pb-3 text-sm font-medium text-neutrals-05 hover:text-shades-white transition-colors">
                            Attachments
                        </button>
                    </div>
                </div>

                {/* Body Content */}
                <div className="p-6 space-y-6 bg-[#1A1A1A]">
                    {/* Transaction Note */}
                    <div className="p-4 rounded-xl bg-neutrals-08/50 border border-neutrals-08">
                        <h4 className="text-xs font-bold text-neutrals-05 uppercase tracking-wider mb-2">
                            Transaction Note
                        </h4>
                        <p className="text-sm text-neutrals-04 leading-relaxed">
                            The client requested a specialized floral arrangement and premium sound system for the ceremony. Payout is scheduled once the venue confirms vendor delivery.
                        </p>
                    </div>

                    {/* Event Requirements */}
                    <div>
                        <h4 className="text-xs font-bold text-neutrals-05 uppercase tracking-wider mb-3">
                            Event Requirements
                        </h4>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="p-4 rounded-xl border border-neutrals-08 bg-transparent">
                                <span className="block text-xs text-neutrals-05 mb-1">Type</span>
                                <span className="block text-base font-semibold text-shades-white">Wedding</span>
                            </div>
                            <div className="p-4 rounded-xl border border-neutrals-08 bg-transparent">
                                <span className="block text-xs text-neutrals-05 mb-1">Duration</span>
                                <span className="block text-base font-semibold text-shades-white">1 Day</span>
                            </div>
                        </div>

                        <div className="mt-4 p-4 rounded-xl border border-neutrals-08 bg-transparent">
                            <span className="block text-xs text-neutrals-05 mb-3">Requirements</span>
                            <div className="flex flex-wrap gap-2">
                                {['Decor', 'Catering', 'DJ'].map((req) => (
                                    <span key={req} className="px-3 py-1 rounded-full bg-neutrals-08 text-xs font-bold text-shades-white uppercase tracking-wider">
                                        {req}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Financial Breakdown */}
                    <div>
                        <h4 className="text-xs font-bold text-neutrals-05 uppercase tracking-wider mb-3">
                            Financial Breakdown
                        </h4>
                        {/* This area seemed to be cut off in the screenshot, inferring content based on standard receipts */}
                        <div className="space-y-3 pb-4 border-b border-neutrals-08">
                            <div className="flex justify-between text-sm">
                                <span className="text-neutrals-04">Gross Amount</span>
                                <span className="text-shades-white font-medium">UGX {transaction.amount.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-neutrals-04">Service Fee (5%)</span>
                                <span className="text-shades-white font-medium">- UGX {(transaction.amount * 0.05).toLocaleString()}</span>
                            </div>
                        </div>
                        <div className="flex justify-between items-center pt-3">
                            <span className="text-sm font-semibold text-shades-white">Total Payout</span>
                            <span className="text-lg font-bold text-primary-01">UGX {(transaction.amount * 0.95).toLocaleString()}</span>
                        </div>
                    </div>

                    {/* Receipt Action */}
                    <button className="w-full py-3.5 bg-primary-01 hover:bg-primary-02 text-shades-white font-bold rounded-xl transition-colors flex items-center justify-center gap-2">
                        <Paperclip className="w-5 h-5" />
                        Send Receipt
                    </button>

                    {/* Footer Actions */}
                    <div className="grid grid-cols-2 gap-4">
                        <button className="py-3 px-4 border border-neutrals-07 rounded-xl text-sm font-semibold text-shades-white hover:bg-neutrals-08 transition-colors">
                            Chat with Client
                        </button>
                        <button className="py-3 px-4 border border-neutrals-07 rounded-xl text-sm font-semibold text-shades-white hover:bg-neutrals-08 transition-colors">
                            Cancel Transaction
                        </button>
                    </div>

                    {/* Chat Input Area (Visual only as per design) */}
                    <div className="flex items-center gap-3 mt-4 pt-4 border-t border-neutrals-08">
                        <Paperclip className="w-5 h-5 text-neutrals-05 cursor-pointer hover:text-shades-white" />
                        <Smile className="w-5 h-5 text-neutrals-05 cursor-pointer hover:text-shades-white" />
                        <div className="flex-1 bg-neutrals-09 rounded-lg px-4 py-2.5">
                            <input
                                type="text"
                                placeholder="Type a message..."
                                className="w-full bg-transparent border-none outline-none text-sm text-shades-white placeholder:text-neutrals-05"
                            />
                        </div>
                        <button className="p-2.5 bg-primary-01 rounded-lg hover:bg-primary-02 transition-colors">
                            <Send className="w-4 h-4 text-shades-white" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
