'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowLeft, Save, Send, Plus, Trash2, Download, Search, ZoomIn } from 'lucide-react';
import InvoicePreview from '@/components/vendor/invoices/InvoicePreview';

interface InvoiceItem {
    id: string;
    description: string;
    quantity: number;
    rate: number;
    amount: number;
}

export default function CreateInvoicePage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const leadId = searchParams.get('leadId');

    // State for invoice details
    const [clientName, setClientName] = useState('Sarah Jenkins');
    const [eventName, setEventName] = useState('Wedding Reception');
    const [invoiceDate, setInvoiceDate] = useState('2023-10-24'); // Default from screenshot
    const [dueDate, setDueDate] = useState('2023-11-07'); // Default from screenshot
    const [items, setItems] = useState<InvoiceItem[]>([
        { id: '1', description: 'Professional Sound System (Tier 1)', quantity: 1, rate: 1200000, amount: 1200000 },
        { id: '2', description: 'Intelligent Stage Lighting Package', quantity: 2, rate: 850000, amount: 1700000 },
    ]);
    const [vendorName, setVendorName] = useState('Vendor Business Name');
    const [vendorAddress, setVendorAddress] = useState('Vendor Adress');
    const [vendorContact, setVendorContact] = useState('Contact Details');

    // Calculate totals for display outside preview if needed, or just rely on preview
    const subtotal = items.reduce((acc, item) => acc + item.amount, 0);
    const total = subtotal * 1.08;

    const [zoomLevel, setZoomLevel] = useState(1);
    const handleZoom = () => {
        setZoomLevel(prev => prev >= 1.2 ? 0.8 : prev + 0.2);
    };

    const handleSaveDraft = () => {
        // In a real app, this would make an API call
        const toast = document.createElement('div');
        toast.className = 'fixed bottom-4 right-4 bg-shades-black text-white px-6 py-3 rounded-lg shadow-xl z-50 animate-fade-in';
        toast.textContent = 'Draft saved successfully';
        document.body.appendChild(toast);
        setTimeout(() => toast.remove(), 3000);
    };

    const handleSendInvoice = () => {
        // In a real app, this would send the invoice
        const toast = document.createElement('div');
        toast.className = 'fixed bottom-4 right-4 bg-[#ff5e3a] text-white px-6 py-3 rounded-lg shadow-xl z-50 animate-fade-in';
        toast.textContent = 'Invoice sent successfully!';
        document.body.appendChild(toast);
        setTimeout(() => {
            toast.remove();
            // Navigate back to the conversation if leadId is present, or messages page
            if (leadId) {
                router.push('/vendor/messages');
            } else {
                router.back();
            }
        }, 1500);
    };

    const handleDownload = () => {
        window.print();
    };

    const handleAddItem = () => {
        const newItem: InvoiceItem = {
            id: Date.now().toString(),
            description: 'New Service Item',
            quantity: 1,
            rate: 0,
            amount: 0,
        };
        setItems([...items, newItem]);
    };

    const handleUpdateItem = (id: string, field: keyof InvoiceItem, value: any) => {
        setItems(items.map(item => {
            if (item.id === id) {
                const updated = { ...item, [field]: value };
                if (field === 'quantity' || field === 'rate') {
                    updated.amount = updated.quantity * updated.rate;
                }
                return updated;
            }
            return item;
        }));
    };

    const handleDeleteItem = (id: string) => {
        setItems(items.filter(item => item.id !== id));
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
                        <h1 className="text-2xl font-bold text-shades-black">Create Invoice</h1>
                        <p className="text-sm text-neutrals-06">Draft your professional event invoice with ease.</p>
                    </div>
                </div>

                {/* Scrollable Form Area */}
                <div className="flex-1 overflow-y-auto p-8 space-y-8">

                    {/* Client & Event Details Section */}
                    <section>
                        <div className="flex items-center gap-2 mb-6">
                            <div className="p-1.5 bg-[#ff5e3a]/10 rounded-lg">
                                <Search size={16} className="text-[#ff5e3a]" />
                            </div>
                            <h2 className="text-lg font-bold text-shades-black">Client, Event & Vendor Details</h2>
                        </div>

                        <div className="grid grid-cols-2 gap-6 mb-6 pb-6 border-b border-neutrals-02">
                            <div className="col-span-2">
                                <h3 className="text-sm font-bold text-neutrals-06 uppercase tracking-wider mb-4">Vendor Information</h3>
                            </div>
                            <div className="col-span-2 space-y-2">
                                <label className="text-xs font-semibold text-neutrals-06 uppercase tracking-wider">Business Name</label>
                                <input
                                    type="text"
                                    value={vendorName}
                                    onChange={(e) => setVendorName(e.target.value)}
                                    className="w-full p-3 bg-shades-white border border-neutrals-03 rounded-xl text-shades-black focus:border-[#ff5e3a] focus:ring-1 focus:ring-[#ff5e3a] outline-none transition-all"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-semibold text-neutrals-06 uppercase tracking-wider">Address</label>
                                <input
                                    type="text"
                                    value={vendorAddress}
                                    onChange={(e) => setVendorAddress(e.target.value)}
                                    className="w-full p-3 bg-shades-white border border-neutrals-03 rounded-xl text-shades-black focus:border-[#ff5e3a] focus:ring-1 focus:ring-[#ff5e3a] outline-none transition-all"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-semibold text-neutrals-06 uppercase tracking-wider">Contact Details</label>
                                <input
                                    type="text"
                                    value={vendorContact}
                                    onChange={(e) => setVendorContact(e.target.value)}
                                    className="w-full p-3 bg-shades-white border border-neutrals-03 rounded-xl text-shades-black focus:border-[#ff5e3a] focus:ring-1 focus:ring-[#ff5e3a] outline-none transition-all"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-xs font-semibold text-neutrals-06 uppercase tracking-wider">Client Name</label>
                                <input
                                    type="text"
                                    value={clientName}
                                    onChange={(e) => setClientName(e.target.value)}
                                    className="w-full p-3 bg-shades-white border border-neutrals-03 rounded-xl text-shades-black focus:border-[#ff5e3a] focus:ring-1 focus:ring-[#ff5e3a] outline-none transition-all"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-semibold text-neutrals-06 uppercase tracking-wider">Event Name</label>
                                <input
                                    type="text"
                                    value={eventName}
                                    onChange={(e) => setEventName(e.target.value)}
                                    className="w-full p-3 bg-shades-white border border-neutrals-03 rounded-xl text-shades-black focus:border-[#ff5e3a] focus:ring-1 focus:ring-[#ff5e3a] outline-none transition-all"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-semibold text-neutrals-06 uppercase tracking-wider">Invoice Date</label>
                                <input
                                    type="date"
                                    value={invoiceDate}
                                    onChange={(e) => setInvoiceDate(e.target.value)}
                                    className="w-full p-3 bg-shades-white border border-neutrals-03 rounded-xl text-shades-black focus:border-[#ff5e3a] focus:ring-1 focus:ring-[#ff5e3a] outline-none transition-all"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-semibold text-neutrals-06 uppercase tracking-wider">Due Date</label>
                                <input
                                    type="date"
                                    value={dueDate}
                                    onChange={(e) => setDueDate(e.target.value)}
                                    className="w-full p-3 bg-shades-white border border-neutrals-03 rounded-xl text-shades-black focus:border-[#ff5e3a] focus:ring-1 focus:ring-[#ff5e3a] outline-none transition-all"
                                />
                            </div>
                        </div>
                    </section>

                    {/* Service Items Section */}
                    <section>
                        <div className="flex items-center gap-2 mb-6">
                            <div className="p-1.5 bg-[#ff5e3a]/10 rounded-lg">
                                <Plus size={16} className="text-[#ff5e3a]" />
                            </div>
                            <h2 className="text-lg font-bold text-shades-black">Service Items</h2>
                        </div>

                        <div className="space-y-4">
                            {items.map((item) => (
                                <div key={item.id} className="p-5 bg-neutrals-01  rounded-xl border-2 border-neutrals-06 hover:border-[#ff5e3a]/30 transition-all group relative">
                                    <div className="space-y-4">
                                        {/* Description Row */}
                                        <div className="space-y-1">
                                            <label className="text-[10px] font-bold text-neutrals-05 uppercase tracking-wider">DESCRIPTION</label>
                                            <input
                                                type="text"
                                                value={item.description}
                                                onChange={(e) => handleUpdateItem(item.id, 'description', e.target.value)}
                                                className="w-full bg-transparent border-none p-0 text-sm font-bold text-shades-black focus:ring-0 placeholder-neutrals-04"
                                                placeholder="Item Name"
                                            />
                                        </div>

                                        {/* Metrics Row */}
                                        <div className="grid grid-cols-12 gap-4">
                                            <div className="col-span-2 space-y-1">
                                                <label className="text-[10px] font-bold text-neutrals-05 uppercase tracking-wider">QTY</label>
                                                <input
                                                    type="number"
                                                    value={item.quantity}
                                                    onChange={(e) => handleUpdateItem(item.id, 'quantity', parseFloat(e.target.value))}
                                                    className="w-full bg-transparent border-none p-0 text-sm font-bold text-shades-black focus:ring-0"
                                                />
                                            </div>
                                            <div className="col-span-5 space-y-1">
                                                <label className="text-[10px] font-bold text-neutrals-05 uppercase tracking-wider">RATE</label>
                                                <div className="flex items-center">
                                                    <span className="text-sm font-bold text-shades-black mr-1">UGX</span>
                                                    <input
                                                        type="number"
                                                        value={item.rate}
                                                        onChange={(e) => handleUpdateItem(item.id, 'rate', parseFloat(e.target.value))}
                                                        className="w-full bg-transparent border-none p-0 text-sm font-bold text-shades-black focus:ring-0"
                                                    />
                                                </div>
                                            </div>
                                            <div className="col-span-5 space-y-1 text-right">
                                                <label className="text-[10px] font-bold text-neutrals-05 uppercase tracking-wider">TOTAL</label>
                                                <p className="text-sm font-bold text-shades-black">UGX {item.amount.toLocaleString()}</p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Delete Action */}
                                    <button
                                        onClick={() => handleDeleteItem(item.id)}
                                        className="absolute top-4 right-4 text-neutrals-04 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            ))}
                        </div>

                        <button
                            onClick={handleAddItem}
                            className="w-full mt-6 py-4 bg-[#ff5e3a] hover:bg-[#ff451a] text-white rounded-xl font-bold text-sm flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transition-all"
                        >
                            <div className="w-5 h-5 rounded-full border-2 border-white flex items-center justify-center">
                                <Plus size={12} strokeWidth={3} />
                            </div>
                            Add New Item
                        </button>
                    </section>

                    {/* Footer Summary (Mobile/Small screen mainly, but visible here too) */}
                    <div className="mt-8 pt-6 border-t border-neutrals-03">
                        <div className="flex justify-between items-center mb-2">
                            <span className="text-neutrals-06 font-medium">Subtotal</span>
                            <span className="text-lg font-bold text-shades-black">UGX {subtotal.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-neutrals-06 font-medium">Grand Total (inc tax)</span>
                            <span className="text-2xl font-extrabold text-[#ff5e3a]">UGX {total.toLocaleString()}</span>
                        </div>
                    </div>

                </div>
            </div>

            {/* Right Column - Preview */}
            <div className="w-1/2 bg-neutrals-02 flex flex-col h-full relative">
                {/* Actions Toolbar - Realign to match screenshot: Top Right of page or container, 
                    but in screenshot buttons are top right, let's keep them absolute but adjust or make them part of a header if needed.
                    Actually, in the screenshot, "Save Draft" is Black, "Send Invoice" is Orange. They look right aligned above the paper.
                */}
                <div className="absolute top-6 right-8 z-20 flex gap-3 print:hidden">
                    <button onClick={handleSaveDraft} className="px-5 py-2.5 bg-shades-black text-shades-white rounded-lg font-bold text-sm hover:bg-neutrals-08 transition-colors flex items-center gap-2 shadow-sm">
                        Save Draft
                    </button>
                    <button
                        onClick={handleSendInvoice}
                        className="px-5 py-2.5 bg-primary-01 hover:bg-primary-01 text-shades-white rounded-lg font-bold text-sm shadow-lg shadow-primary-01/30 transition-all flex items-center gap-2"
                    >
                        {/*icon from iconify*/}
                        <svg xmlns="http://www.w3.org/2000/svg" width={24} height={24} viewBox="0 0 24 24"><g fill="none"><path fill="#fff" d="M21.124 2.888s.01.547.01 1.439c.037 4.23-.116 16.305-2.888 16.305c-3.357 0-.48-3.836-2.877-3.836H8.194c1.065-5.324.959-13.908.959-13.908s.029-1.439.988-1.439h11.96c-.958 0-.977 1.439-.977 1.439"></path><path fill="#e3e3e3" d="M22.102 1.449H20.22c-.058 5.783-3.585 13.539-8.943 15.347h4.091c2.398 0-.48 3.837 2.878 3.837c2.772 0 2.925-12.076 2.887-16.306c0-.892-.01-1.44-.01-1.44s.02-1.438.979-1.438"></path><path stroke="#191919" strokeLinecap="round" strokeLinejoin="round" d="M21.124 2.888s.01.547.01 1.439c.037 4.23-.116 16.305-2.888 16.305c-3.357 0-.48-3.836-2.877-3.836H8.194c1.065-5.324.959-13.908.959-13.908s.029-1.439.988-1.439h11.96c-.958 0-.977 1.439-.977 1.439m-9.092 2.398h1.918m-1.677 5.754h5.515m-5.515-2.877h5.515m-6.235 5.755h5.755" strokeWidth={1}></path><path fill="#b2b2b2" stroke="#191919" strokeLinecap="round" strokeLinejoin="round" d="M22.994 3.252a.96.96 0 0 1-.24.748a.94.94 0 0 1-.71.327h-.91c0-.892-.01-1.44-.01-1.44s.019-1.438.978-1.438c.566 0 .796.988.892 1.803" strokeWidth={1}></path><path fill="#fff" stroke="#191919" strokeLinecap="round" strokeLinejoin="round" d="M15.368 16.796c-1.467 0-.959 2.168-1.122 3.837c-.096 1.055-.46 1.918-1.755 1.918H1c3.357 0 .48-5.755 2.878-5.755z" strokeWidth={1}></path><path fill="#b2b2b2" stroke="#191919" strokeLinecap="round" strokeLinejoin="round" d="M18.246 20.633h-4c.163-1.67-.345-3.837 1.122-3.837c2.398 0-.48 3.837 2.878 3.837" strokeWidth={1}></path></g></svg>
                        Send Invoice
                    </button>
                </div>

                {/* Actions Floating Button (Zoom & Download) */}
                <div className="absolute bottom-8 right-8 z-10 print:hidden flex flex-col gap-3">
                    <button onClick={handleZoom} className="w-12 h-12 bg-shades-black rounded-full text-shades-white flex items-center justify-center shadow-lg hover:scale-110 transition-transform">
                        <ZoomIn size={22} />
                    </button>
                    <button onClick={handleDownload} className="w-12 h-12 bg-primary-01 rounded-full text-white flex items-center justify-center shadow-lg shadow-primary-01/30 hover:scale-110 transition-transform">
                        <Download size={24} />
                    </button>
                </div>

                {/* Preview Container - centered nicely */}
                <div className="flex-1 overflow-y-auto pt-24 pb-8 px-8 custom-scrollbar flex justify-center bg-neutrals-02 transition-all duration-300">
                    <div
                        className="w-full max-w-[600px] h-fit bg-white shadow-xl transition-transform duration-300 origin-top"
                        style={{ transform: `scale(${zoomLevel})` }}
                    >
                        <InvoicePreview data={{
                            invoiceNumber: 'INV-2023-00892',
                            issueDate: new Date(invoiceDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
                            dueDate: new Date(dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
                            clientName: clientName,
                            eventTitle: eventName,
                            vendorName,
                            vendorAddress,
                            vendorContact,
                            items: items
                        }} />
                    </div>
                </div>
            </div>
        </div>
    );
}
