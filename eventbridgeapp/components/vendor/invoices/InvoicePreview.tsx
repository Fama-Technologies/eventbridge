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
        <div className="bg-shades-white p-8 md:p-12 shadow-sm  h-full min-h-[800px] flex flex-col relative  font-sans" id="invoice-preview">

            {/* Receipt Header */}
            <div className="flex justify-between items-start ">
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
                        <p className="text-xs font-bold text-shades-black">{data.vendorName}</p>
                        <p className="text-xs text-neutrals-05">{data.vendorAddress}</p>
                        <p className="text-xs text-neutrals-05">{data.vendorContact}</p>
                    </div>
                </div>
                <div className="text-right">
                    <h2 className="text-2xl font-black text-primary-01 mb-1 tracking-tight">INVOICE</h2>
                    <p className="text-shades-black text-[10px] font-bold tracking-widest uppercase"> {data.invoiceNumber}</p>
                </div>
            </div>


            {/* Bill To & Dates */}
            <div className="flex justify-between mb-10 border-t border-neutral-06 pt-5 mt-10">
                <div className="w-[40%]">
                    <h3 className="text-[10px] font-bold text-[#ff5e3a] uppercase tracking-widest mb-3">BILL TO</h3>
                    <p className="font-bold  text-shades-black mb-1">{data.clientName}</p>
                    {data.clientCompany && <p className="text-xs text-neutrals-03 mb-1">{data.clientCompany}</p>}
                </div>
                <div className="w-[50%] grid grid-cols-2 gap-x-4 gap-y-8">
                    <div>
                        <h3 className="text-[10px] font-bold text-primary-01 uppercase tracking-widest mb-2">ISSUE DATE</h3>
                        <p className="text-[11px] pt-1 font-bold text-shades-black">{data.issueDate}</p>
                    </div>
                    <div>
                        <h3 className="text-[10px] font-bold text-primary-01 uppercase tracking-widest mb-2">DUE DATE</h3>
                        <p className="text-[11px] font-bold text-shades-black pt-1">{data.dueDate}</p>
                    </div>
                    <div className="col-span-2">
                        <h3 className="text-[10px] font-bold text-primary-01 uppercase tracking-widest mb-2">EVENT</h3>
                        <p className="text-[11px] font-bold text-shades-black italic">{data.eventTitle}</p>
                    </div>
                </div>
            </div>

            {/* Table Header */}
            <div className="grid grid-cols-12 gap-4 border-b-2 border-shades-black pb-3 mb-6">
                <div className="col-span-6 text-[11px] font-bold text-shades-black uppercase tracking-widest">DESCRIPTION</div>
                <div className="col-span-2 text-right text-[11px] font-bold text-shades-black uppercase tracking-widest">QTY</div>
                <div className="col-span-2 text-right text-[11px] font-bold text-shades-black uppercase tracking-widest">RATE</div>
                <div className="col-span-2 text-right text-[11px] font-bold text-shades-black uppercase tracking-widest">AMOUNT</div>
            </div>

            {/* Table Rows */}
            <div className="space-y-0 mb-12 flex-1">
                {data.items.map((item) => (
                    <div key={item.id} className="grid grid-cols-12 gap-3 items-center py-2 border-b border-neutrals-06">
                        <div className="col-span-6">
                            <p className="text-[9px] font-medium text-shades-black">{item.description}</p>
                        </div>
                        <div className="col-span-2 text-right text-[9px] text-shades-black">{item.quantity}</div>
                        <div className="col-span-2 text-right text-[9px] text-shades-black">UGX {item.rate.toLocaleString()}</div>
                        <div className="col-span-2 text-right text-[9px] font-bold text-shades-black">UGX {item.amount.toLocaleString()}</div>
                    </div>
                ))}
            </div>

            {/* Totals */}
            <div className="w-full max-w-sm ml-auto">
                <div className="flex justify-between items-center mb-4">
                    <span className="text-xl font-medium text-neutrals-05">Subtotal</span>
                    <span className="text-xl font-bold text-shades-black">UGX {subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center mb-8">
                    <span className="text-xl font-medium text-neutrals-05">Tax (8%)</span>
                    <span className="text-xl font-bold text-shades-black">UGX {tax.toLocaleString()}</span>
                </div>

                {/* Orange Divider */}
                <div className="w-full h-[2px] bg-[#ff5e3a] mb-6"></div>

                <div className="flex justify-between items-center">
                    <span className="text-sm font-black text-shades-black uppercase tracking-wider">TOTAL AMOUNT</span>
                    <span className="text-2xl  font-black text-primary-01 leading-none">UGX {total.toLocaleString()}</span>
                </div>
            </div>

        </div>
    );
}
