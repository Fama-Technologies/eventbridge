'use client';

import { PartyPopper } from 'lucide-react';
import Image from 'next/image';

interface InvoiceItem {
    id: string;
    description: string;
    quantity: number;
    rate: number;
    amount: number;
}

interface InvoicePreviewProps {
    data: {
        invoiceNumber: string;
        issueDate: string;
        dueDate: string;
        clientName: string;
        clientCompany?: string;
        eventTitle: string;
        vendorName?: string;
        vendorAddress?: string;
        vendorContact?: string;
        items: InvoiceItem[];
    }
}

export default function InvoicePreview({ data }: InvoicePreviewProps) {
    const subtotal = data.items.reduce((acc, item) => acc + item.amount, 0);
    const tax = subtotal * 0.08; // Assuming 8% tax as per screenshot implied logic or standard
    const total = subtotal + tax;

    return (
        <div className="bg-white p-8 md:p-12 shadow-sm border border-gray-100 h-full min-h-[800px] flex flex-col relative text-gray-800 font-sans" id="invoice-preview">

            {/* Header */}
            <div className="flex justify-between items-start mb-16">
                <div className="flex items-center gap-3">
                    <img src="/logo.svg" alt="Event Bridge" className="h-10 w-auto" />
                    <span className="text-xl font-bold tracking-tight text-gray-900 whitespace-nowrap">Event Bridge</span>
                </div>
                <div className="text-right">
                    <h1 className="text-3xl font-black text-[#ff5e3a] tracking-wider mb-2">INVOICE</h1>
                    <p className="text-sm font-bold text-gray-900 tracking-widest">{data.invoiceNumber}</p>
                </div>
            </div>

            {/* Vendor Info */}
            <div className="mb-12">
                <p className="font-bold text-sm text-gray-900">{data.vendorName || 'Vendor Business Name'}</p>
                <p className="text-sm text-gray-500 mt-1">{data.vendorAddress || 'Vendor Address'}</p>
                <p className="text-sm text-gray-500">{data.vendorContact || 'Contact Details'}</p>
            </div>

            {/* Bill To & Dates */}
            <div className="flex justify-between mb-20 border-t border-gray-100 pt-12 mt-12">
                <div className="w-[40%]">
                    <h3 className="text-[11px] font-bold text-[#ff5e3a] uppercase tracking-widest mb-3">BILL TO</h3>
                    <p className="font-bold text-lg text-gray-900 mb-1">{data.clientName}</p>
                    {data.clientCompany && <p className="text-sm text-gray-500 mb-1">{data.clientCompany}</p>}
                    <p className="text-sm text-gray-500">Attn: Sarah Jenkins, Ops Manager</p>
                </div>
                <div className="w-[50%] grid grid-cols-2 gap-x-8 gap-y-8">
                    <div>
                        <h3 className="text-[11px] font-bold text-[#ff5e3a] uppercase tracking-widest mb-2">ISSUE DATE</h3>
                        <p className="text-sm font-bold text-gray-900">{data.issueDate}</p>
                    </div>
                    <div>
                        <h3 className="text-[11px] font-bold text-[#ff5e3a] uppercase tracking-widest mb-2">DUE DATE</h3>
                        <p className="text-sm font-bold text-gray-900">{data.dueDate}</p>
                    </div>
                    <div className="col-span-2">
                        <h3 className="text-[11px] font-bold text-[#ff5e3a] uppercase tracking-widest mb-2">EVENT</h3>
                        <p className="text-base font-bold text-gray-900 italic">{data.eventTitle}</p>
                    </div>
                </div>
            </div>

            {/* Table Header */}
            <div className="grid grid-cols-12 gap-4 border-b-[2px] border-black pb-3 mb-6">
                <div className="col-span-6 text-[11px] font-bold text-black uppercase tracking-widest">DESCRIPTION</div>
                <div className="col-span-2 text-right text-[11px] font-bold text-black uppercase tracking-widest">QTY</div>
                <div className="col-span-2 text-right text-[11px] font-bold text-black uppercase tracking-widest">RATE</div>
                <div className="col-span-2 text-right text-[11px] font-bold text-black uppercase tracking-widest">AMOUNT</div>
            </div>

            {/* Table Rows */}
            <div className="space-y-0 mb-12 flex-1">
                {data.items.map((item) => (
                    <div key={item.id} className="grid grid-cols-12 gap-4 items-center py-5 border-b border-gray-100">
                        <div className="col-span-6">
                            <p className="text-base font-medium text-gray-900">{item.description}</p>
                        </div>
                        <div className="col-span-2 text-right text-sm text-gray-600">{item.quantity}</div>
                        <div className="col-span-2 text-right text-sm text-gray-600">UGX {item.rate.toLocaleString()}</div>
                        <div className="col-span-2 text-right text-sm font-bold text-gray-900">UGX {item.amount.toLocaleString()}</div>
                    </div>
                ))}
            </div>

            {/* Totals */}
            <div className="w-full max-w-sm ml-auto">
                <div className="flex justify-between items-center mb-4">
                    <span className="text-sm font-medium text-gray-400">Subtotal</span>
                    <span className="text-sm font-bold text-gray-900">UGX {subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center mb-8">
                    <span className="text-sm font-medium text-gray-400">Tax (8%)</span>
                    <span className="text-sm font-bold text-gray-900">UGX {tax.toLocaleString()}</span>
                </div>

                {/* Orange Divider */}
                <div className="w-full h-[2px] bg-[#ff5e3a] mb-6"></div>

                <div className="flex justify-between items-center">
                    <span className="text-base font-black text-black uppercase tracking-wider">TOTAL AMOUNT</span>
                    <span className="text-[32px] font-black text-[#ff5e3a] leading-none">UGX {total.toLocaleString()}</span>
                </div>
            </div>

        </div>
    );
}
