'use client';

import { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft, Save, Send, Download, Search, Banknote, SignatureIcon, Plus, ZoomIn } from 'lucide-react';
import { transactionsData } from '@/components/vendor/earnings/data';
import Image from 'next/image';

export default function ReceiptPage() {
    const router = useRouter();
    const params = useParams();
    const id = params.id as string;

    // Find transaction
    const transaction = transactionsData.find(t => t.id === id) || transactionsData[0];

    // Auto-generate receipt number based on transaction ID
    const receiptNumber = `REC-${transaction.id}`;

    // State for receipt details
    const [paymentMethod, setPaymentMethod] = useState('Bank Transfer');
    const [amountPaid, setAmountPaid] = useState(transaction.amount);
    const [remainingBalance, setRemainingBalance] = useState(0);
    const [signatureEnabled, setSignatureEnabled] = useState(true);
    const [signatureTitle, setSignatureTitle] = useState('Authorized Signatory');
    const [signatureDate, setSignatureDate] = useState('Oct 25, 2023');
    const [internalNotes, setInternalNotes] = useState('');
    const [vendorName, setVendorName] = useState('Vendor Business Name');
    const [vendorAddress, setVendorAddress] = useState('Vendor Address');
    const [vendorContact, setVendorContact] = useState('Contact Details');

    const [zoomLevel, setZoomLevel] = useState(1);

    const handleZoom = () => {
        setZoomLevel(prev => prev >= 1.2 ? 0.8 : prev + 0.2);
    };

    const handleSaveDraft = () => {
        const toast = document.createElement('div');
        toast.className = 'fixed bottom-4 right-4 bg-shades-black text-white px-6 py-3 rounded-lg shadow-xl z-50 animate-fade-in';
        toast.textContent = 'Draft saved successfully';
        document.body.appendChild(toast);
        setTimeout(() => toast.remove(), 3000);
    };

    const handleSendReceipt = () => {
        const toast = document.createElement('div');
        toast.className = 'fixed bottom-4 right-4 bg-[#ff5e3a] text-white px-6 py-3 rounded-lg shadow-xl z-50 animate-fade-in';
        toast.textContent = `Receipt sent to ${transaction.clientName}! Redirecting to chat...`;
        document.body.appendChild(toast);
        setTimeout(() => {
            toast.remove();
            router.push(`/vendor/messages?client=${encodeURIComponent(transaction.clientName)}`);
        }, 1500);
    };

    const handleDownload = () => {
        window.print();
    };

    return (
        <div className="flex h-screen bg-shades-white overflow-hidden">
            {/* Left Column - Editor */}
            <div className="w-1/2 flex flex-col h-full border-r border-neutrals-02">
                {/* Header */}
                <div className="px-8 py-6 bg-shades-white border-b border-neutrals-02 flex items-center gap-4">
                    <button onClick={() => router.back()} className="p-2 hover:bg-neutrals-01 rounded-lg transition-colors">
                        <ArrowLeft size={20} className="text-shades-black" />
                    </button>
                    <div>
                        <h1 className="text-2xl font-bold text-shades-black">Generate Receipt</h1>
                        <p className="text-sm text-neutrals-06">Confirm payments and issue digital proof of transaction.</p>
                    </div>
                </div>

                {/* Scrollable Form Area */}
                <div className="flex-1 overflow-y-auto p-8 space-y-8">

                    {/* Payment Information Section */}
                    <section>
                        <div className="flex items-center gap-2 mb-6 border-b border-neutrals-05 pb-3">
                            <div className="p-1.5 rounded-lg">
                                <span className="">
                                    <Banknote className="text-primary-01" />
                                </span>
                            </div>
                            <h2 className="text-lg font-bold text-shades-black">Payment Information</h2>
                        </div>

                        <div className="space-y-6">
                            {/* Receipt Number */}
                            <div className="space-y-2">
                                <label className="text-xs font-semibold text-neutrals-06 uppercase tracking-wider">Receipt Number</label>
                                <input
                                    type="text"
                                    value={receiptNumber}
                                    readOnly
                                    className="w-full p-3 bg-neutrals-01 border border-neutrals-03 rounded-4xl text-shades-black outline-none cursor-not-allowed"
                                />
                            </div>

                            {/* Payment Method */}
                            <div className="space-y-2">
                                <label className="text-xs font-semibold text-neutrals-06 uppercase tracking-wider">Payment Method</label>
                                <select
                                    value={paymentMethod}
                                    onChange={(e) => setPaymentMethod(e.target.value)}
                                    className="w-full p-3 bg-shades-white border border-neutrals-03 rounded-4xl text-shades-black focus:border-[#ff5e3a] focus:ring-1 focus:ring-[#ff5e3a] outline-none transition-all"
                                >
                                    <option>Bank Transfer</option>
                                    <option>Credit Card</option>
                                    <option>Cash</option>
                                    <option>Mobile Money</option>
                                </select>
                            </div>

                            {/* Amount Paid and Remaining Balance */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-xs font-semibold text-neutrals-06 uppercase tracking-wider">Amount Paid</label>
                                    <div className="p-3 bg-accents-discount/5 border border-accents-discount rounded-4xl">
                                        <p className="text-sm font-bold text-accents-discount">UGX {amountPaid.toLocaleString()}</p>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-semibold text-neutrals-06 uppercase tracking-wider">Remaining Balance</label>
                                    <input
                                        type="text"
                                        value={remainingBalance > 0 ? `UGX ${remainingBalance.toLocaleString()}` : 'UGX 0'}
                                        readOnly
                                        className="w-full p-3 bg-neutrals-01 border border-neutrals-03 rounded-4xl text-neutrals-05 outline-none"
                                    />
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Signature Settings Section */}
                    <section className='bg-neutrals-02 p-5 rounded-xl '>
                        <div className="flex items-center gap-2 mb-6">
                            <div className="p-1.5 rounded-lg">
                                <span className="text-primary-01">
                                    <SignatureIcon />
                                </span>
                            </div>
                            <h2 className="text-lg font-bold text-shades-black">Signature Settings</h2>
                            <div className="ml-auto">
                                <button
                                    onClick={() => setSignatureEnabled(!signatureEnabled)}
                                    className={`w-12 h-6 rounded-full relative transition-colors ${signatureEnabled ? 'bg-[#ff5e3a]' : 'bg-neutrals-04'}`}
                                >
                                    <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${signatureEnabled ? 'left-7' : 'left-1'}`} />
                                </button>
                            </div>
                        </div>

                        {signatureEnabled && (
                            <div className="space-y-4 animate-in fade-in slide-in-from-top-2">
                                <div className="space-y-2">
                                    <label className="text-xs font-semibold text-neutrals-06 uppercase tracking-wider">Signature Title</label>
                                    <input
                                        type="text"
                                        value={signatureTitle}
                                        onChange={(e) => setSignatureTitle(e.target.value)}
                                        className="w-full p-3 bg-shades-white border border-neutrals-03 rounded-xl text-shades-black focus:border-[#ff5e3a] focus:ring-1 focus:ring-[#ff5e3a] outline-none transition-all"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-semibold text-neutrals-06 uppercase tracking-wider">Date</label>
                                    <input
                                        type="text"
                                        value={signatureDate}
                                        onChange={(e) => setSignatureDate(e.target.value)}
                                        className="w-full p-3 bg-shades-white border border-neutrals-03 rounded-xl text-shades-black focus:border-[#ff5e3a] focus:ring-1 focus:ring-[#ff5e3a] outline-none transition-all"
                                    />
                                </div>
                            </div>
                        )}
                    </section>

                    {/* Internal Notes */}
                    <section>
                        <div className="space-y-2">
                            <label className="text-xs font-semibold text-neutrals-06 uppercase tracking-wider">Internal Notes</label>
                            <textarea
                                value={internalNotes}
                                onChange={(e) => setInternalNotes(e.target.value)}
                                placeholder="Add private notes about this transaction..."
                                className="w-full h-24 p-3 bg-shades-white border border-neutrals-03 rounded-xl text-shades-black focus:border-[#ff5e3a] focus:ring-1 focus:ring-[#ff5e3a] outline-none transition-all resize-none"
                            />
                        </div>
                    </section>
                </div>
            </div>

            {/* Right Column - Preview */}
            <div className="w-1/2 bg-neutrals-02 flex flex-col h-full relative">
                {/* Actions Toolbar */}
                <div className="absolute top-6 right-8 z-20 flex gap-3 print:hidden">
                    <button
                        onClick={handleSaveDraft}
                        className="px-5 py-2.5 bg-shades-black text-shades-white shadow-shades-black/30 transition-all  border border-shades-black rounded-lg font-bold text-sm hover:bg-neutrals-08 transition-colors flex items-center gap-2 shadow-sm"
                    >
                        Save Draft
                    </button>
                    <button
                        onClick={handleSendReceipt}
                        className="px-5 py-2.5 bg-primary-01 hover:bg-[#ff451a] text-shades-white border border-primary-01 rounded-lg font-bold text-sm shadow-lg shadow-[#ff5e3a]/30 transition-all flex items-center gap-2"
                    >
                        <Send size={16} />
                        Send Receipt
                    </button>
                </div>

                {/* Floating Action Buttons */}
                <div className="absolute bottom-8 right-8 z-10 print:hidden flex flex-col gap-3">
                    <button
                        onClick={handleZoom}
                        className="w-12 h-12 bg-shades-black rounded-full text-shades-white flex items-center justify-center shadow-lg hover:scale-110 transition-transform"
                    >
                        <ZoomIn size={22} />
                    </button>
                    <button
                        onClick={handleDownload}
                        className="w-12 h-12 bg-primary-01 rounded-full text-shades-white flex items-center justify-center shadow-lg hover:scale-110 transition-transform"
                    >
                        <Download size={24} />
                    </button>
                </div>

                {/* Preview Container */}
                <div className="flex-1 overflow-y-auto pt-24 pb-8 px-8 custom-scrollbar flex justify-center bg-neutrals-02 transition-all duration-300">
                    <div
                        className="w-full max-w-[600px] h-fit bg-shades-white shadow-xl transition-transform duration-300 origin-top p-12"
                        style={{ transform: `scale(${zoomLevel})` }}
                    >
                        {/* Receipt Header */}
                        <div className="flex justify-between items-start mb-12">
                            <div>
                                <div className="flex items-center gap-2 mb-4">
                                    <div className="w-8 h-8 relative">
                                        <Image
                                            src="/logo.svg"
                                            alt="EventBridge Logo"
                                            fill
                                            className="object-contain"
                                        />
                                    </div>
                                    <span className="font-bold text-xl text-shades-black">Event Bridge</span>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-xs font-bold text-shades-black">{vendorName}</p>
                                    <p className="text-xs text-neutrals-05">{vendorAddress}</p>
                                    <p className="text-xs text-neutrals-05">{vendorContact}</p>
                                </div>
                            </div>
                            <div className="text-right">
                                <h2 className="text-2xl font-black text-primary-01 mb-1 tracking-tight">RECEIPT</h2>
                                <p className="text-shades-black text-[10px] font-bold tracking-widest uppercase">NO. {receiptNumber}</p>
                            </div>
                        </div>

                        {/* Separator */}
                        <div className="border-b border-neutrals-03 mb-8" />

                        {/* Bill To */}
                        <div className="flex justify-between mb-8 border-b border-neutrals-03 pb-4">
                            <div>
                                <p className="text-[10px] uppercase tracking-widest text-neutrals-05 mb-2 font-bold">RECEIVED FROM</p>
                                <p className="font-bold text-shades-black text-base mb-1">{transaction.clientName}</p>
                                <p className="text-xs text-neutrals-05 italic">Event: {transaction.title}</p>
                            </div>
                            <div className="grid grid-cols-2 gap-x-5 gap-y-2 text-right">
                                <div>
                                    <p className="text-[10px] uppercase tracking-widest text-neutrals-05 mb-1 font-bold">DATE</p>
                                    <p className="font-bold text-shades-black pt-1 text-[10px]">{signatureDate}</p>
                                </div>
                                <div>
                                    <p className="text-[10px] uppercase tracking-widest text-neutrals-05 mb-1 font-bold">METHOD</p>
                                    <p className="font-bold text-shades-black pt-1 text-[10px]">{paymentMethod}</p>
                                </div>
                            </div>
                        </div>

                        {/* Line Items */}
                        <div className="mb-12">
                            <div className="flex justify-between text-[10px] uppercase tracking-widest text-neutrals-05 mb-4 font-bold">
                                <span>Description</span>
                                <span>Amount</span>
                            </div>
                            <div className="space-y-4 border-t border-neutrals-05 pt-4">
                                {transaction.lineItems && transaction.lineItems.length > 0 ? (
                                    transaction.lineItems.map((item, index) => (
                                        <div key={index} className="flex justify-between items-center border-b border-neutrals-03 pb-4">
                                            <span className="text-xs font-medium text-shades-black ">{item.description}</span>
                                            <span className="text-xs font-bold text-shades-black">UGX {item.amount.toLocaleString()}</span>
                                        </div>
                                    ))
                                ) : (
                                    <div className="flex justify-between items-center">
                                        <span className="text-xs font-medium text-shades-black">Event Services</span>
                                        <span className="text-xs font-bold text-shades-black">UGX {transaction.amount.toLocaleString()}</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Total */}
                        <div className="bg-neutrals-02/90 p-6 rounded-2xl mb-12 border-1 border-accents-discount">
                            <div className="flex flex-col items-center justify-center gap-2">
                                <p className="text-[9px] uppercase tracking-widest flex justify-end font-bold text-accents-discount ">TOTAL AMOUNT RECEIVED</p>
                                <p className="text-2xl font-black text-accents-discount">UGX {transaction.amount.toLocaleString()}</p>
                            </div>
                        </div>

                        {/* Signature */}
                        {signatureEnabled && (
                            <div className="flex justify-between items-end mt-8">
                                <div className="w-[45%]">
                                    <p className="text-xs text-neutrals-06 mb-1">{signatureTitle}</p>
                                    <div className="border-2 border-b border-shades-black w-full mb-3" />

                                    <p className="text-[10px] text-neutrals-07 uppercase tracking-wider font-bold">received by</p>
                                </div>
                                <div className="w-[25%] text-right">
                                    <p className="text-xs font-bold text-shades-black mb-1">{signatureDate}</p>
                                    <div className="border-2 border-b border-shades-black w-full mb-3" />

                                    <p className="text-[10px] text-neutrals-07 uppercase tracking-wider font-bold">DATE</p>

                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
