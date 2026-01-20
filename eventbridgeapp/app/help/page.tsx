'use client';

import { useState } from 'react';
import { Search, Plus, X } from 'lucide-react';
import Link from 'next/link';
import Header from '@/components/header';
import Footer from '@/components/footer';

interface FAQItem {
    question: string;
    answer: string;
    isOpen?: boolean;
}

export default function HelpPage() {
    const [searchQuery, setSearchQuery] = useState('');
    const [faqs, setFaqs] = useState<FAQItem[]>([
        {
            question: "What is EventBridge?",
            answer: "Event Bridge is an E-services connection platform connecting event service providers to event organizers and planners providing them with tools to connect and manage their events."
        },
        {
            question: "Does EventBridge manage payments to the vendors?",
            answer: "No, Event Bridge does not currently process payment to the vendors. Payments are negotiable between the provider and customer but we provide digital invoicing and Receipt generation tools."
        },
        {
            question: "What features does EventBridge currently offer?",
            answer: "We offer Digital invoicing and Receipting generation. Manage Bookings and Calendar management. Event Budget management and checklists, Leads and inquires and direct customer chats."
        },
        {
            question: "Is EventBridge free?",
            answer: "Yes, Event Bridge has a free plan that all customers enjoy but we also provide premium features in our pro and pro max versions."
        },
        {
            question: "What businesses can list on EventBridge?",
            answer: "All service providers can create their business profile on event bridge and list their services and packages."
        }
    ]);

    const toggleFAQ = (index: number) => {
        setFaqs(faqs.map((faq, i) => ({
            ...faq,
            isOpen: i === index ? !faq.isOpen : false
        })));
    };

    const filteredFaqs = faqs.filter(faq =>
        faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
        faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="min-h-screen bg-shades-white text-shades-black">
            {/* Global Header */}
            <Header />

            <main className="max-w-4xl mx-auto px-6 py-16 md:py-24">
                {/* Hero Section */}
                <div className="text-center mb-16">
                    <h1 className="text-4xl md:text-5xl font-bold mb-4 text-shades-black">
                        Frequently Asked Questions
                    </h1>
                    <p className="text-neutrals-06 text-lg mb-8">
                        Everything you need to know about planning your next event with EventBridge.
                    </p>

                    {/* Search Bar */}
                    <div className="max-w-xl mx-auto relative">
                        <input
                            type="text"
                            placeholder="Search for answers..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-12 pr-4 py-4 rounded-full border border-neutrals-03 focus:border-primary-01 focus:ring-2 focus:ring-primary-01/10 outline-none shadow-sm text-shades-black bg-shades-white"
                        />
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-neutrals-05 w-5 h-5" />
                    </div>
                </div>

                {/* FAQ List */}
                <div className="space-y-4">
                    {filteredFaqs.length > 0 ? (
                        filteredFaqs.map((faq, index) => (
                            <div
                                key={index}
                                className="border-b border-neutrals-02 pb-4 last:border-0"
                            >
                                <button
                                    onClick={() => toggleFAQ(index)}
                                    className="w-full flex items-center justify-between py-4 text-left group"
                                >
                                    <span className="text-lg font-semibold text-shades-black group-hover:text-primary-01 transition-colors">
                                        {faq.question}
                                    </span>
                                    {faq.isOpen ? (
                                        <X className="w-5 h-5 text-neutrals-05" />
                                    ) : (
                                        <Plus className="w-5 h-5 text-neutrals-05" />
                                    )}
                                </button>

                                <div
                                    className={`overflow-hidden transition-all duration-300 ease-in-out ${faq.isOpen ? 'max-h-96 opacity-100 mb-4' : 'max-h-0 opacity-0'
                                        }`}
                                >
                                    <p className="text-neutrals-06 leading-relaxed bg-neutrals-01/50 p-4 rounded-lg text-sm md:text-base">
                                        {faq.answer}
                                    </p>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="text-center py-12">
                            <p className="text-neutrals-05">No questions found matching your search.</p>
                        </div>
                    )}
                </div>

                {/* Contact Support */}
                <div className="mt-20 text-center bg-neutrals-01 rounded-2xl p-8 md:p-12">
                    <h3 className="text-2xl font-bold mb-4">Still have questions?</h3>
                    <p className="text-neutrals-06 mb-8 max-w-lg mx-auto">
                        Can't find the answer you're looking for? Please chat to our friendly team.
                    </p>
                    <Link
                        href="/contact"
                        className="inline-flex items-center justify-center px-8 py-3 bg-primary-01 text-white font-semibold rounded-full hover:bg-primary-02 transition-colors shadow-lg shadow-primary-01/20"
                    >
                        Get in touch
                    </Link>
                </div>
            </main>

            <Footer />
        </div>
    );
}
