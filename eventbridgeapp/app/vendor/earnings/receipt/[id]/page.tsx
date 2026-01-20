'use client';

import { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft, Save, Send, Download, Search } from 'lucide-react';
import { transactionsData } from '@/components/vendor/earnings/data';
import Image from 'next/image';

export default function ReceiptPage() {
    const router = useRouter();
    const params = useParams();
    const router = useRouter();
    const id = params.id as string;

    // Find transaction. In a real app we'd fetch it.
    const transaction = transactionsData.find(t => t.id === id) || transactionsData[0];

    // Form state
    const [receiptNumber, setReceiptNumber] = useState("REC-2023-00892");
    const [paymentMethod, setPaymentMethod] = useState("Bank Transfer");
    const [signatureEnabled, setSignatureEnabled] = useState(true);
    const [signatureTitle, setSignatureTitle] = useState("Authorized Signatory");
    const [date, setDate] = useState("Oct 25, 2023");
    const [internalNotes, setInternalNotes] = useState("");

    // UI state
    const [showModal, setShowModal] = useState(false);
    const [activeTab, setActiveTab] = useState<"details" | "messages" | "attachments">("details");
    const [zoomLevel, setZoomLevel] = useState(1);
    const [showToast, setShowToast] = useState(false);
    const [toastMessage, setToastMessage] = useState("");
    const [message, setMessage] = useState("");

    const receiptRef = useRef<HTMLDivElement>(null);

    // Toast helper
    const showToastMessage = (msg: string) => {
        setToastMessage(msg);
        setShowToast(true);
        setTimeout(() => setShowToast(false), 3000);
    };

    // Button handlers
    const handleSaveDraft = () => {
        // In a real app, save to backend
        showToastMessage("Draft saved successfully");
    };

    const handleSendReceipt = () => {
        // In a real app, send email/notification
        showToastMessage("Receipt sent to " + transaction.clientName);
        setShowModal(true);
    };

    const handleDownload = () => {
        // In a real app, generate PDF
        showToastMessage("Receipt downloaded");
    };

    const handleZoom = () => {
        setZoomLevel(prev => prev === 1 ? 1.5 : 1);
    };

    const handleChatWithClient = () => {
        router.push(`/vendor/messages?client=${transaction.clientName}`);
    };

    const handleCancelTransaction = () => {
        if (confirm("Are you sure you want to cancel this transaction?")) {
            showToastMessage("Transaction cancelled");
            setShowModal(false);
            router.push("/vendor/earnings");
        }
    };

    const handleSendMessage = () => {
        if (message.trim()) {
            showToastMessage("Message sent");
            setMessage("");
        }
    };

    return (
        <>
            <div className="h-full flex flex-col md:flex-row gap-6 font-sans selection:bg-primary-01/30">
                {/* Left Panel: Form */}
                <div className="w-full md:w-1/2 flex flex-col gap-6">
                    {/* Header / Nav Back */}
                    <div className="flex items-center gap-2">
                        <Link href="/vendor/earnings" className="p-2 -ml-2 rounded-full hover:bg-neutrals-02 text-neutrals-05 transition-colors">
                            <ArrowLeft size={20} />
                        </Link>
                        <h1 className="text-2xl font-bold text-shades-black dark:text-shades-white">Generate Receipt</h1>
                    </div>
                    <p className="text-neutrals-05 text-sm -mt-4">
                        Confirm payments and issue digital proof of transaction.
                    </p>

                    {/* Form Container */}
                    <div className="space-y-6">
                        {/* Payment Information */}
                        <div>
                            <h3 className="flex items-center gap-2 text-sm font-bold text-shades-black dark:text-shades-white mb-4">
                                <span className="text-primary-01">💵</span> Payment Information
                            </h3>

                            <div className="space-y-4">
                                <div className="space-y-1.5">
                                    <label className="text-xs font-medium text-neutrals-05">Receipt Number</label>
                                    <input
                                        type="text"
                                        value={receiptNumber}
                                        onChange={(e) => setReceiptNumber(e.target.value)}
                                        className="w-full bg-neutrals-01 dark:bg-neutrals-02 border border-neutrals-03 dark:border-neutrals-08 rounded-xl px-4 py-3 text-sm text-shades-black dark:text-shades-white focus:border-primary-01 focus:outline-none transition-colors"
                                    />
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-xs font-medium text-neutrals-05">Payment Method</label>
                                    <div className="relative">
                                        <select
                                            value={paymentMethod}
                                            onChange={(e) => setPaymentMethod(e.target.value)}
                                            className="w-full bg-neutrals-01 dark:bg-neutrals-02 border border-neutrals-03 dark:border-neutrals-08 rounded-xl px-4 py-3 text-sm text-shades-black dark:text-shades-white appearance-none focus:border-primary-01 focus:outline-none transition-colors cursor-pointer"
                                        >
                                            <option>Bank Transfer</option>
                                            <option>Credit Card</option>
                                            <option>Cash</option>
                                            <option>Mobile Money</option>
                                        </select>
                                        <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-neutrals-05 pointer-events-none" size={16} />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-medium text-neutrals-05">Amount Paid</label>
                                        <div className="relative">
                                            <input
                                                type="text"
                                                value={`UGX ${transaction.amount.toLocaleString()}`}
                                                readOnly
                                                className="w-full bg-neutrals-01/50 dark:bg-neutrals-02/50 border border-green-500/40 rounded-xl px-4 py-3 text-sm font-bold text-green-600 dark:text-green-500 focus:outline-none"
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-medium text-neutrals-05">Remaining Balance</label>
                                        <div className="relative">
                                            <input
                                                type="text"
                                                readOnly
                                                className="w-full bg-neutrals-01 dark:bg-neutrals-02 border border-neutrals-03 dark:border-neutrals-08 rounded-xl px-4 py-3 text-sm text-neutrals-05 focus:outline-none placeholder:text-neutrals-06"
                                                placeholder="UGX 0"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Signature Settings */}
                        <div className="p-5 rounded-2xl border border-neutrals-03 dark:border-neutrals-08 bg-shades-white dark:bg-neutrals-02/30 space-y-4">
                            <div className="flex items-center justify-between">
                                <h3 className="flex items-center gap-2 text-sm font-bold text-shades-black dark:text-shades-white">
                                    <span className="text-primary-01">✍️</span> Signature Settings
                                </h3>
                                <button
                                    onClick={() => setSignatureEnabled(!signatureEnabled)}
                                    className={cn(
                                        "w-10 h-6 rounded-full relative transition-colors duration-200",
                                        signatureEnabled ? "bg-primary-01" : "bg-neutrals-04 dark:bg-neutrals-07"
                                    )}
                                >
                                    <div className={cn(
                                        "absolute top-1 w-4 h-4 rounded-full bg-shades-white transition-all duration-200",
                                        signatureEnabled ? "left-5" : "left-1"
                                    )} />
                                </button>
                            </div>

                            {signatureEnabled && (
                                <div className="space-y-4 pt-2 animate-in fade-in slide-in-from-top-2">
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-medium text-neutrals-05">Signature Title</label>
                                        <input
                                            type="text"
                                            value={signatureTitle}
                                            onChange={(e) => setSignatureTitle(e.target.value)}
                                            className="w-full bg-neutrals-01 dark:bg-neutrals-02 border border-neutrals-03 dark:border-neutrals-08 rounded-xl px-4 py-3 text-sm text-shades-black dark:text-shades-white focus:border-primary-01 focus:outline-none transition-colors"
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-medium text-neutrals-05">Date</label>
                                        <input
                                            type="text"
                                            value={date}
                                            onChange={(e) => setDate(e.target.value)}
                                            className="w-full bg-neutrals-01 dark:bg-neutrals-02 border border-neutrals-03 dark:border-neutrals-08 rounded-xl px-4 py-3 text-sm text-shades-black dark:text-shades-white focus:border-primary-01 focus:outline-none transition-colors"
                                        />
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-xs font-medium text-neutrals-05">Internal Notes</label>
                            <textarea
                                value={internalNotes}
                                onChange={(e) => setInternalNotes(e.target.value)}
                                placeholder="Add private notes about this transaction..."
                                className="w-full h-24 bg-neutrals-01 dark:bg-neutrals-02 border border-neutrals-03 dark:border-neutrals-08 rounded-xl px-4 py-3 text-sm text-shades-black dark:text-shades-white focus:border-primary-01 focus:outline-none transition-colors resize-none"
                            />
                        </div>
                    </div>
                </div>

                {/* Right Panel: Preview */}
                <div className="w-full md:w-1/2 bg-neutrals-02 dark:bg-[#111] flex flex-col relative rounded-none border-l border-neutrals-03 dark:border-neutrals-08">
                    {/* Top Actions */}
                    <div className="absolute top-6 right-8 flex gap-3 z-10">
                        <button
                            onClick={handleSaveDraft}
                            className="px-5 py-2.5 rounded-lg bg-shades-white dark:bg-neutrals-02 text-shades-black dark:text-shades-white border border-neutrals-03 dark:border-neutrals-08 text-sm font-bold hover:bg-neutrals-02 dark:hover:bg-neutrals-03 transition-colors"
                        >
                            Save Draft
                        </button>
                        <button
                            onClick={handleSendReceipt}
                            className="px-5 py-2.5 rounded-lg bg-primary-01 text-shades-white text-sm font-bold hover:bg-primary-02 transition-colors flex items-center gap-2"
                        >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M20 6 9 17l-5-5" />
                            </svg>
                            Send Receipt
                        </button>
                    </div>

                    <div className="flex-1 flex items-center justify-center p-8 pt-24 overflow-y-auto custom-scrollbar">
                        {/* Receipt Card */}
                        <div
                            ref={receiptRef}
                            style={{ transform: `scale(${zoomLevel})`, transition: "transform 0.3s ease" }}
                            className="w-full max-w-[450px] bg-shades-white dark:bg-[#1A1A1A] text-shades-black dark:text-shades-white p-8 relative shadow-2xl min-h-[600px] flex flex-col origin-center"
                        >
                            {/* Receipt Header */}
                            <div className="flex justify-between items-start mb-12">
                                <div>
                                    <div className="flex items-center gap-2 mb-4">
                                        <div className="w-6 h-6 relative text-primary-01">
                                            <Image
                                                src="/logo.svg"
                                                alt="EventBridge Logo"
                                                fill
                                                className="object-contain dark:invert"
                                            />
                                        </div>
                                        <span className="font-bold text-lg text-shades-black dark:text-shades-white">Event Bridge</span>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-[10px] font-bold text-shades-black dark:text-shades-white">Vendor Business Name</p>
                                        <p className="text-[10px] text-neutrals-05">Vendor Adress</p>
                                        <p className="text-[10px] text-neutrals-05">Contact Details</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <h2 className="text-3xl font-black text-primary-01 mb-1 tracking-tight">RECEIPT</h2>
                                    <p className="text-neutrals-05 text-[8px] font-bold tracking-widest uppercase">NO. {receiptNumber}</p>
                                </div>
                            </div>

                            <div className="border-b border-neutrals-03 dark:border-neutrals-08 mb-8" />

                            <div className="flex justify-between mb-8">
                                <div>
                                    <p className="text-[8px] uppercase tracking-widest text-neutrals-05 mb-2 font-bold">RECEIVED FROM</p>
                                    <p className="font-bold text-shades-black dark:text-shades-white text-sm mb-1">{transaction.clientName}</p>
                                    <p className="text-[10px] text-neutrals-05 italic">Event: {transaction.title}</p>
                                </div>
                                <div className="grid grid-cols-2 gap-x-12 gap-y-2 text-right">
                                    <div>
                                        <p className="text-[8px] uppercase tracking-widest text-neutrals-05 mb-1 font-bold">DATE</p>
                                        <p className="font-bold text-shades-black dark:text-shades-white text-xs">{date}</p>
                                    </div>
                                    <div>
                                        <p className="text-[8px] uppercase tracking-widest text-neutrals-05 mb-1 font-bold">METHOD</p>
                                        <p className="font-bold text-shades-black dark:text-shades-white text-xs">{paymentMethod}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="mb-auto">
                                <div className="flex justify-between text-[8px] uppercase tracking-widest text-neutrals-05 mb-4 font-bold">
                                    <span>Description</span>
                                    <span>Amount</span>
                                </div>
                                <div className="space-y-4 border-t border-neutrals-03 dark:border-neutrals-08 pt-4">
                                    {transaction.lineItems && transaction.lineItems.length > 0 ? (
                                        transaction.lineItems.map((item, index) => (
                                            <div key={index} className="flex justify-between items-center">
                                                <span className="text-xs font-medium text-shades-black dark:text-shades-white">{item.description}</span>
                                                <span className="text-xs font-bold text-shades-black dark:text-shades-white">UGX {item.amount.toLocaleString()}</span>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="flex justify-between items-center">
                                            <span className="text-xs font-medium text-shades-black dark:text-shades-white">Event Services</span>
                                            <span className="text-xs font-bold text-shades-black dark:text-shades-white">UGX {transaction.amount.toLocaleString()}</span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="bg-neutrals-01 dark:bg-[#111] p-6 rounded-lg mb-12 mt-8">
                                <div className="flex flex-col items-center justify-center gap-1">
                                    <p className="text-[10px] uppercase tracking-widest text-[#00E64D] font-bold">TOTAL AMOUNT RECEIVED</p>
                                    <p className="text-3xl font-black text-[#00E64D]">UGX {transaction.amount.toLocaleString()}</p>
                                </div>
                            </div>

                            {signatureEnabled && (
                                <div className="flex justify-between items-end mt-4">
                                    <div className="w-[45%]">
                                        <div className="border-b border-neutrals-06 w-full mb-3" />
                                        <p className="text-[10px] font-bold text-shades-black dark:text-shades-white mb-1">{signatureTitle}</p>
                                        <p className="text-[8px] text-neutrals-06 uppercase tracking-wider font-bold">Authorized Signatory</p>
                                    </div>
                                    <div className="w-[25%] text-right">
                                        <div className="border-b border-neutrals-06 w-full mb-3" />
                                        <p className="text-[10px] font-bold text-shades-black dark:text-shades-white mb-1">{date}</p>
                                        <p className="text-[8px] text-neutrals-06 uppercase tracking-wider font-bold">DATE</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Floating Action Buttons */}
                    <div className="absolute right-8 bottom-8 flex flex-col gap-4 z-10">
                        <button
                            onClick={handleZoom}
                            className="w-14 h-14 bg-shades-white dark:bg-neutrals-02 rounded-full flex items-center justify-center text-shades-black dark:text-shades-white border border-neutrals-03 dark:border-neutrals-08 shadow-lg hover:bg-neutrals-02 dark:hover:bg-neutrals-03 transition-all group"
                        >
                            <ZoomIn size={24} className="group-hover:scale-110 transition-transform" />
                        </button>
                        <button
                            onClick={handleDownload}
                            className="w-14 h-14 bg-primary-01 rounded-full flex items-center justify-center text-shades-white shadow-lg hover:bg-primary-02 transition-all group"
                        >
                            <Download size={24} className="group-hover:scale-110 transition-transform" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Transaction Details Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-[#2A2A2A] text-shades-white rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
                        {/* Modal Header */}
                        <div className="p-6 border-b border-neutrals-08">
                            <div className="flex items-start justify-between mb-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 rounded-full bg-green-500 flex items-center justify-center">
                                        <span className="text-white font-bold">SW</span>
                                    </div>
                                    <div>
                                        <h2 className="font-bold text-lg">{transaction.title}</h2>
                                        <p className="text-sm text-neutrals-05">
                                            150-200 Guests • $25,000 Est. Budget • Napa Valley, CA
                                        </p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setShowModal(false)}
                                    className="p-2 hover:bg-neutrals-07 rounded-lg transition-colors"
                                >
                                    <X size={20} />
                                </button>
                            </div>

                            {/* Tabs */}
                            <div className="flex gap-6 border-b border-neutrals-08">
                                <button
                                    onClick={() => setActiveTab("details")}
                                    className={cn(
                                        "pb-3 px-1 text-sm font-medium transition-colors relative",
                                        activeTab === "details"
                                            ? "text-primary-01"
                                            : "text-neutrals-05 hover:text-shades-white"
                                    )}
                                >
                                    Details
                                    {activeTab === "details" && (
                                        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-01" />
                                    )}
                                </button>
                                <button
                                    onClick={() => setActiveTab("messages")}
                                    className={cn(
                                        "pb-3 px-1 text-sm font-medium transition-colors relative",
                                        activeTab === "messages"
                                            ? "text-primary-01"
                                            : "text-neutrals-05 hover:text-shades-white"
                                    )}
                                >
                                    Messages (1)
                                    {activeTab === "messages" && (
                                        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-01" />
                                    )}
                                </button>
                                <button
                                    onClick={() => setActiveTab("attachments")}
                                    className={cn(
                                        "pb-3 px-1 text-sm font-medium transition-colors relative",
                                        activeTab === "attachments"
                                            ? "text-primary-01"
                                            : "text-neutrals-05 hover:text-shades-white"
                                    )}
                                >
                                    Attachments
                                    {activeTab === "attachments" && (
                                        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-01" />
                                    )}
                                </button>
                            </div>
                        </div>

                        {/* Modal Content */}
                        <div className="flex-1 overflow-y-auto p-6 space-y-6">
                            {activeTab === "details" && (
                                <>
                                    <div className="bg-neutrals-08/50 rounded-xl p-4">
                                        <h4 className="text-xs font-bold text-neutrals-05 uppercase tracking-wider mb-2">
                                            Transaction Note
                                        </h4>
                                        <p className="text-sm text-shades-white">
                                            The client requested a specialized floral arrangement and premium sound system for the ceremony. Payout is scheduled once the venue confirms vendor delivery.
                                        </p>
                                    </div>

                                    <div>
                                        <h4 className="text-xs font-bold text-neutrals-05 uppercase tracking-wider mb-3">
                                            Event Requirements
                                        </h4>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="bg-neutrals-08/30 rounded-xl p-3">
                                                <p className="text-xs text-neutrals-05 mb-1">Type</p>
                                                <p className="font-bold">Wedding</p>
                                            </div>
                                            <div className="bg-neutrals-08/30 rounded-xl p-3">
                                                <p className="text-xs text-neutrals-05 mb-1">Duration</p>
                                                <p className="font-bold">1 Day</p>
                                            </div>
                                        </div>
                                        <div className="mt-3 bg-neutrals-08/30 rounded-xl p-3">
                                            <p className="text-xs text-neutrals-05 mb-2">Requirements</p>
                                            <div className="flex gap-2 flex-wrap">
                                                <span className="px-3 py-1 bg-neutrals-07 rounded-full text-xs font-medium">DECOR</span>
                                                <span className="px-3 py-1 bg-neutrals-07 rounded-full text-xs font-medium">CATERING</span>
                                                <span className="px-3 py-1 bg-neutrals-07 rounded-full text-xs font-medium">DJ</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div>
                                        <h4 className="text-xs font-bold text-neutrals-05 uppercase tracking-wider mb-3">
                                            Financial Breakdown
                                        </h4>
                                        <div className="bg-neutrals-08/30 rounded-xl p-4 space-y-3">
                                            {transaction.lineItems && transaction.lineItems.map((item, idx) => (
                                                <div key={idx} className="flex justify-between">
                                                    <span className="text-sm text-neutrals-05">{item.description}</span>
                                                    <span className="font-bold">UGX {item.amount.toLocaleString()}</span>
                                                </div>
                                            ))}
                                            <div className="border-t border-neutrals-08 pt-3 flex justify-between">
                                                <span className="text-sm font-bold">Total</span>
                                                <span className="font-black text-green-500">UGX {transaction.amount.toLocaleString()}</span>
                                            </div>
                                        </div>
                                    </div>
                                </>
                            )}

                            {activeTab === "messages" && (
                                <div className="space-y-4">
                                    <div className="bg-neutrals-08/30 rounded-2xl p-4 max-w-[80%]">
                                        <p className="text-sm">Hi! Looking forward to working with you on Sarah's wedding. Please confirm the setup time.</p>
                                        <p className="text-xs text-neutrals-05 mt-2">2 hours ago</p>
                                    </div>
                                    <div className="bg-primary-01/20 border border-primary-01/30 rounded-2xl p-4 max-w-[80%] ml-auto">
                                        <p className="text-sm">Thank you! We'll arrive at 8 AM for setup. Everything will be ready by 10 AM.</p>
                                        <p className="text-xs text-neutrals-05 mt-2">1 hour ago</p>
                                    </div>
                                </div>
                            )}

                            {activeTab === "attachments" && (
                                <div className="text-center py-12">
                                    <Paperclip size={48} className="mx-auto text-neutrals-06 mb-4" />
                                    <p className="text-neutrals-05">No attachments yet</p>
                                </div>
                            )}
                        </div>

                        {/* Modal Actions */}
                        <div className="p-6 border-t border-neutrals-08 space-y-3">
                            {activeTab === "messages" && (
                                <div className="flex gap-2 mb-3">
                                    <button className="p-3 hover:bg-neutrals-07 rounded-lg transition-colors">
                                        <Paperclip size={20} />
                                    </button>
                                    <input
                                        type="text"
                                        value={message}
                                        onChange={(e) => setMessage(e.target.value)}
                                        onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                                        placeholder="Type a message..."
                                        className="flex-1 bg-neutrals-08 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-01"
                                    />
                                    <button
                                        onClick={handleSendMessage}
                                        className="p-3 bg-primary-01 hover:bg-primary-02 rounded-lg transition-colors"
                                    >
                                        <Send size={20} />
                                    </button>
                                </div>
                            )}

                            <button
                                onClick={handleSendReceipt}
                                className="w-full bg-primary-01 hover:bg-primary-02 text-white py-4 rounded-xl font-bold transition-colors flex items-center justify-center gap-2"
                            >
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <rect x="3" y="3" width="18" height="18" rx="2" />
                                    <path d="M3 9h18" />
                                </svg>
                                Send Receipt
                            </button>

                            <div className="grid grid-cols-2 gap-3">
                                <button
                                    onClick={handleChatWithClient}
                                    className="py-3 bg-neutrals-07 hover:bg-neutrals-08 rounded-xl font-bold transition-colors"
                                >
                                    Chat with {transaction.clientName.split(' ')[0]}
                                </button>
                                <button
                                    onClick={handleCancelTransaction}
                                    className="py-3 bg-neutrals-07 hover:bg-red-500/20 text-red-500 rounded-xl font-bold transition-colors"
                                >
                                    Cancel Transaction
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Toast Notification */}
            {showToast && (
                <div className="fixed bottom-8 right-8 bg-shades-black dark:bg-shades-white text-shades-white dark:text-shades-black px-6 py-3 rounded-xl shadow-2xl z-50 animate-in slide-in-from-bottom-5 fade-in">
                    <p className="font-medium">{toastMessage}</p>
                </div>
            )}
        </>
    );
}
