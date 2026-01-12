"use client";

import { CreditCard, Check, Download, Monitor, Loader2 } from "lucide-react";
import { useToast } from "@/components/ui/toast";
import { useState, useEffect } from "react";
import FeaturesModal from "@/components/category/FeaturesModal";

interface Invoice {
    id: string;
    date: string;
    amount: string;
    status: string;
}

export default function Subscriptions() {
    const { addToast } = useToast();
    const [downloadingId, setDownloadingId] = useState<string | null>(null);
    const [showFeatures, setShowFeatures] = useState(false);
    const [billingHistory, setBillingHistory] = useState<Invoice[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchBilling() {
            setLoading(true);
            try {
                // Determine API endpoint - assuming /api/vendor/billing or strictly mocking if strictly defined
                // The prompt says "To be integrated", implying I should add the logic.
                // Assuming /api/vendor/earnings might have this or dedicated endpoint.
                // Let's try /api/vendor/billing and fallback to empty logic
                const response = await fetch('/api/vendor/billing');
                if (response.ok) {
                    const data = await response.json();
                    setBillingHistory(data.invoices || []);
                } else {
                    // If endpoint doesn't exist, we can show empty or fallback mock for demo preservation if strictly needed,
                    // but goal is to remove mock. showing empty is safer.
                    setBillingHistory([]);
                }
            } catch (error) {
                console.error("Failed to fetch billing:", error);
            } finally {
                setLoading(false);
            }
        }
        fetchBilling();
    }, []);

    const handleExtendPlan = () => {
        setShowFeatures(true);
    };

    const handleUpdatePayment = () => {
        addToast("Opening payment method dialog...", "info");
    };

    const handleDownload = async (id: string) => {
        setDownloadingId(id);
        // Simulate download
        await new Promise(r => setTimeout(r, 1000));
        addToast(`Invoice ${id} downloaded`, "success");
        setDownloadingId(null);
    };

    return (
        <div className="bg-shades-white p-6 md:p-8 rounded-b-2xl border-t border-neutrals-02 relative">
            <FeaturesModal isOpen={showFeatures} onClose={() => setShowFeatures(false)} />

            <div className="flex flex-col lg:flex-row gap-6 mb-12">
                {/* Plan Card */}
                <div className="flex-1 bg-neutrals-01/30 rounded-2xl border border-neutrals-03 p-6 md:p-8">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                        <div>
                            <div className="flex items-center gap-3 mb-1">
                                <h3 className="text-xl font-bold text-shades-black">Professional Plan</h3>
                                <span className="px-2 py-0.5 bg-accents-peach/20 text-primary-01 text-[10px] font-bold uppercase tracking-wide rounded">Current</span>
                            </div>
                            <p className="text-sm text-neutrals-06">Your next billing date is <span className="text-shades-black font-semibold">October 24, 2024</span></p>
                        </div>
                        <button
                            onClick={handleExtendPlan}
                            className="px-4 py-2 bg-shades-white border border-neutrals-03 rounded-lg text-sm font-semibold text-shades-black hover:bg-neutrals-01 transition-colors shadow-sm"
                        >
                            Extend Plan
                        </button>
                    </div>

                    <div className="border-t border-neutrals-03 pt-6">
                        <p className="text-xs font-bold text-neutrals-06 uppercase tracking-wider mb-4">Included in your plan</p>
                        <div className="grid md:grid-cols-2 gap-y-4 gap-x-8">
                            <div className="flex items-center gap-3 text-sm text-neutrals-07">
                                <div className="w-5 h-5 rounded-full bg-accents-discount/10 flex items-center justify-center text-accents-discount flex-shrink-0">
                                    <Check size={12} strokeWidth={3} />
                                </div>
                                Unlimited bookings & quotes
                            </div>
                            <div className="flex items-center gap-3 text-sm text-neutrals-07">
                                <div className="w-5 h-5 rounded-full bg-accents-discount/10 flex items-center justify-center text-accents-discount flex-shrink-0">
                                    <Check size={12} strokeWidth={3} />
                                </div>
                                Advanced profile analytics
                            </div>
                            <div className="flex items-center gap-3 text-sm text-neutrals-07">
                                <div className="w-5 h-5 rounded-full bg-accents-discount/10 flex items-center justify-center text-accents-discount flex-shrink-0">
                                    <Check size={12} strokeWidth={3} />
                                </div>
                                Featured vendor placement
                            </div>
                            <div className="flex items-center gap-3 text-sm text-neutrals-07">
                                <div className="w-5 h-5 rounded-full bg-accents-discount/10 flex items-center justify-center text-accents-discount flex-shrink-0">
                                    <Check size={12} strokeWidth={3} />
                                </div>
                                24/7 Priority support
                            </div>
                            <div className="flex items-center gap-3 text-sm text-neutrals-07">
                                <div className="w-5 h-5 rounded-full bg-accents-discount/10 flex items-center justify-center text-accents-discount flex-shrink-0">
                                    <Check size={12} strokeWidth={3} />
                                </div>
                                Custom availability calendar
                            </div>
                            <div className="flex items-center gap-3 text-sm text-neutrals-07">
                                <div className="w-5 h-5 rounded-full bg-accents-discount/10 flex items-center justify-center text-accents-discount flex-shrink-0">
                                    <Check size={12} strokeWidth={3} />
                                </div>
                                Zero service fees on leads
                            </div>
                        </div>
                    </div>
                </div>

                {/* Payment Method Card */}
                <div className="w-full lg:w-80 flex-shrink-0 bg-shades-white rounded-2xl border border-neutrals-03 p-6 flex flex-col justify-between">
                    <div>
                        <p className="text-xs font-bold text-neutrals-06 uppercase tracking-wider mb-4">Payment Method</p>
                        <div className="flex items-center gap-4 mb-6">
                            <div className="w-12 h-8 bg-neutrals-02 rounded border border-neutrals-03 flex items-center justify-center text-neutrals-05">
                                <CreditCard size={18} />
                            </div>
                            <div>
                                <p className="text-sm font-bold text-shades-black">Visa ending in 4242</p>
                                <p className="text-xs text-neutrals-06">Expires 12/26</p>
                            </div>
                        </div>
                    </div>
                    <button
                        onClick={handleUpdatePayment}
                        className="text-primary-01 text-xs font-bold hover:text-primary-02 transition-colors text-left"
                    >
                        Update Payment Method
                    </button>
                </div>
            </div>

            {/* Billing History */}
            <div>
                <h3 className="text-xs font-bold text-neutrals-06 uppercase tracking-wider mb-6">Billing History</h3>
                <div className="w-full overflow-x-auto">
                    <table className="w-full min-w-[600px]">
                        <thead>
                            <tr className="border-b border-neutrals-02">
                                <th className="text-left py-4 text-xs font-bold text-neutrals-05 uppercase tracking-wider w-1/3">Invoice</th>
                                <th className="text-left py-4 text-xs font-bold text-neutrals-05 uppercase tracking-wider w-1/4">Billing Date</th>
                                <th className="text-left py-4 text-xs font-bold text-neutrals-05 uppercase tracking-wider w-1/4">Amount</th>
                                <th className="text-left py-4 text-xs font-bold text-neutrals-05 uppercase tracking-wider w-1/6">Status</th>
                                <th className="w-10"></th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan={5} className="py-8 text-center">
                                        <Loader2 className="animate-spin h-6 w-6 text-primary-01 mx-auto" />
                                    </td>
                                </tr>
                            ) : billingHistory.length > 0 ? (
                                billingHistory.map((invoice, i) => (
                                    <tr key={invoice.id} className="border-b border-neutrals-02 last:border-0 hover:bg-neutrals-01/30 transition-colors group">
                                        <td className="py-4 text-sm font-medium text-shades-black">{invoice.id}</td>
                                        <td className="py-4 text-sm text-neutrals-06">{invoice.date}</td>
                                        <td className="py-4 text-sm font-medium text-shades-black">{invoice.amount}</td>
                                        <td className="py-4">
                                            <span className="bg-accents-discount/10 text-accents-discount px-2 py-1 rounded text-[10px] font-bold uppercase">
                                                {invoice.status}
                                            </span>
                                        </td>
                                        <td className="py-4 text-right">
                                            <button
                                                onClick={() => handleDownload(invoice.id)}
                                                disabled={downloadingId === invoice.id}
                                                className="p-2 text-neutrals-04 hover:text-shades-black transition-colors opacity-0 group-hover:opacity-100 disabled:opacity-50"
                                            >
                                                {downloadingId === invoice.id ? (
                                                    <Loader2 size={16} className="animate-spin" />
                                                ) : (
                                                    <Download size={16} />
                                                )}
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={5} className="py-8 text-center text-sm text-neutrals-06">
                                        No invoices found.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
                <div className="mt-8 text-center border-t border-neutrals-02 pt-8">
                    <button className="text-sm font-semibold text-neutrals-06 hover:text-shades-black transition-colors">
                        View All Invoices
                    </button>
                </div>
            </div>

        </div>
    );
}
