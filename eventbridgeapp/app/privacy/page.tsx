'use client';

import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { useTheme } from '@/providers/theme-provider';
import { useState, useEffect } from 'react';

export default function PrivacyPage() {
    const { resolvedTheme } = useTheme();
    const [mounted, setMounted] = useState(false);
    
    const isDark = resolvedTheme === 'dark';
    
    useEffect(() => {
        setMounted(true);
    }, []);
    
    if (!mounted) {
        return null;
    }

    return (
        <div className="flex h-screen flex-col" style={{ backgroundColor: isDark ? '#000000' : '#f7f7f7' }}>
            {/* Header */}
            <header className="flex items-center justify-between border-b px-6 py-4" style={{ 
                backgroundColor: isDark ? '#1a1a1a' : '#ffffff',
                borderColor: isDark ? '#333333' : '#e5e5e5'
            }}>
                <div className="flex items-center gap-4">
                    <Link
                        href="/"
                        className="flex items-center gap-2 text-sm font-medium transition-colors"
                        style={{ color: isDark ? '#a3a3a3' : '#737373' }}
                    >
                        <ArrowLeft size={16} />
                        Back to Home
                    </Link>
                    <div className="h-6 w-px" style={{ backgroundColor: isDark ? '#333333' : '#e5e5e5' }} />
                    <h1 className="text-lg font-bold" style={{ color: isDark ? '#ffffff' : '#000000' }}>Data Privacy Policy</h1>
                </div>
                <div className="text-sm" style={{ color: isDark ? '#737373' : '#a3a3a3' }}>
                    Last Updated: Dec 22, 2025
                </div>
            </header>

            {/* Main Content - Scrollable */}
            <div className="flex-1 overflow-y-auto">
                <div className="mx-auto max-w-3xl px-6 py-12">
                    <div className="space-y-8" style={{ color: isDark ? '#d4d4d4' : '#000000' }}>
                        <section>
                            <h2 className="text-2xl font-bold mb-4">EventBridge Data Privacy Policy</h2>
                            <p className="mb-4 leading-relaxed">
                                EventBridge ("we," "our," or "us") is committed to protecting your privacy and handling your
                                personal data responsibly. This Data Privacy Policy explains how we collect, use, store, share,
                                and protect personal information when you access or use the EventBridge platform, including
                                our website, mobile applications, and related services (collectively, the "Platform").
                            </p>
                            <p className="leading-relaxed font-medium">
                                By using EventBridge, you agree to the practices described in this Policy.
                            </p>
                        </section>

                        <section>
                            <h3 className="text-xl font-semibold mb-3 text-primary-01">1. About EventBridge</h3>
                            <p className="mb-4 leading-relaxed">
                                EventBridge is a digital event planning and service-connection platform that enables users to:
                            </p>
                            <ul className="list-disc list-inside space-y-2 mb-4 ml-4">
                                <li>Discover and engage event service providers</li>
                                <li>View service packages and portfolios</li>
                                <li>Use event planning, budgeting, scheduling, and management tools</li>
                                <li>Communicate and coordinate with service providers</li>
                            </ul>
                            <p className="leading-relaxed">
                                EventBridge also offers subscription-based paid features for users and service providers.
                                EventBridge does not currently process payments for event services between users and
                                service providers.
                            </p>
                        </section>

                        <section>
                            <h3 className="text-xl font-semibold mb-3 text-primary-01">2. Information We Collect</h3>
                            
                            <h4 className="font-semibold mb-2 mt-4">2.1 Personal Information</h4>
                            <p className="mb-2 leading-relaxed">We may collect:</p>
                            <ul className="list-disc list-inside space-y-1 mb-4 ml-4">
                                <li>Full name</li>
                                <li>Email address</li>
                                <li>Phone number</li>
                                <li>Account login credentials</li>
                                <li>Profile information</li>
                            </ul>

                            <h4 className="font-semibold mb-2 mt-4">2.2 User Event & Planning Data</h4>
                            <ul className="list-disc list-inside space-y-1 mb-4 ml-4">
                                <li>Event details (event type, dates, location, budget estimates)</li>
                                <li>Planning tools data (checklists, timelines, calendars)</li>
                                <li>Communications between users and service providers on the Platform</li>
                            </ul>

                            <h4 className="font-semibold mb-2 mt-4">2.3 Service Provider Information</h4>
                            <ul className="list-disc list-inside space-y-1 mb-4 ml-4">
                                <li>Business name and description</li>
                                <li>Portfolio and service offerings</li>
                                <li>Pricing information (display purposes only)</li>
                                <li>Verification documents (where applicable)</li>
                                <li>Subscription and promotional preferences</li>
                            </ul>

                            <h4 className="font-semibold mb-2 mt-4">2.4 Payment & Subscription Information</h4>
                            <p className="mb-2 leading-relaxed">For platform subscriptions only, we may collect:</p>
                            <ul className="list-disc list-inside space-y-1 mb-4 ml-4">
                                <li>Payment confirmation and reference numbers</li>
                                <li>Subscription type (monthly or annual)</li>
                                <li>Billing status and transaction history</li>
                            </ul>
                            <p className="leading-relaxed font-medium">
                                EventBridge does not store full card numbers, mobile money PINs, or bank credentials.
                            </p>

                            <h4 className="font-semibold mb-2 mt-4">2.5 Technical & Usage Data</h4>
                            <ul className="list-disc list-inside space-y-1 ml-4">
                                <li>IP address</li>
                                <li>Device and browser information</li>
                                <li>Log data and analytics</li>
                                <li>Cookies and similar technologies</li>
                            </ul>
                        </section>

                        <section>
                            <h3 className="text-xl font-semibold mb-3 text-primary-01">3. Platform Payments & Subscription Structure</h3>
                            
                            <h4 className="font-semibold mb-2">3.1 What Users and Service Providers Pay For</h4>
                            <p className="mb-3 leading-relaxed">EventBridge charges fees only for platform services, including:</p>
                            
                            <div className="mb-4">
                                <p className="font-medium mb-2">a. Service Provider Subscriptions</p>
                                <p className="mb-2">Service providers may pay monthly or annual subscription fees for:</p>
                                <ul className="list-disc list-inside space-y-1 ml-4">
                                    <li>Boosting and promoting their business profiles</li>
                                    <li>Increased visibility in search results</li>
                                    <li>Featured service packages and portfolios</li>
                                    <li>Access to advanced engagement, quotation, and booking tools</li>
                                </ul>
                            </div>

                            <div className="mb-4">
                                <p className="font-medium mb-2">b. Event Planning Tools</p>
                                <p className="mb-2">Users and service providers may subscribe monthly or annually to premium planning tools such as:</p>
                                <ul className="list-disc list-inside space-y-1 ml-4">
                                    <li>Event budgeting tools</li>
                                    <li>Planning calendars and timelines</li>
                                    <li>Service provider management features</li>
                                    <li>Event coordination and tracking tools</li>
                                </ul>
                            </div>

                            <h4 className="font-semibold mb-2 mt-4">3.2 What EventBridge Does NOT Process</h4>
                            <p className="mb-2 leading-relaxed">EventBridge does not:</p>
                            <ul className="list-disc list-inside space-y-1 mb-4 ml-4">
                                <li>Process payments for event services</li>
                                <li>Collect deposits or service fees on behalf of providers</li>
                                <li>Hold escrow funds</li>
                                <li>Facilitate payouts to service providers</li>
                            </ul>
                            <p className="leading-relaxed">
                                All payments for event services are arranged directly between users and service providers
                                outside the Platform.
                            </p>
                        </section>

                        <section>
                            <h3 className="text-xl font-semibold mb-3 text-primary-01">4. How We Use Your Information</h3>
                            <p className="mb-2 leading-relaxed">We use your data to:</p>
                            <ul className="list-disc list-inside space-y-2 ml-4">
                                <li>Create and manage user and service provider accounts</li>
                                <li>Provide access to event planning tools and features</li>
                                <li>Enable discovery and communication between users and service providers</li>
                                <li>Manage subscriptions and paid platform features</li>
                                <li>Improve platform functionality and user experience</li>
                                <li>Conduct service provider verification (where applicable)</li>
                                <li>Send service updates, billing notices, and platform communications</li>
                                <li>Comply with legal, regulatory, and accounting obligations</li>
                            </ul>
                        </section>

                        <section>
                            <h3 className="text-xl font-semibold mb-3 text-primary-01">5. Third-Party Payment Processors</h3>
                            <p className="mb-3 leading-relaxed">
                                Subscription payments are processed through trusted third-party payment providers.
                            </p>
                            <ul className="list-disc list-inside space-y-2 mb-4 ml-4">
                                <li>These providers handle payment authorization and processing under their own privacy policies</li>
                                <li>EventBridge receives limited transaction data necessary for record-keeping and subscription management</li>
                                <li>EventBridge is not responsible for the independent data practices of third-party payment processors</li>
                            </ul>
                        </section>

                        <section>
                            <h3 className="text-xl font-semibold mb-3 text-primary-01">6. Data Sharing & Disclosure</h3>
                            <p className="mb-3 leading-relaxed font-medium">We do not sell personal data.</p>
                            <p className="mb-2 leading-relaxed">We may share data only:</p>
                            <ul className="list-disc list-inside space-y-2 mb-4 ml-4">
                                <li>With service providers to enable platform interactions</li>
                                <li>With trusted vendors (hosting, analytics, customer support)</li>
                                <li>When required by law or regulatory authorities</li>
                                <li>During business restructuring, merger, or acquisition</li>
                            </ul>
                            <p className="leading-relaxed">
                                All third parties are required to protect personal data appropriately.
                            </p>
                        </section>

                        <section>
                            <h3 className="text-xl font-semibold mb-3 text-primary-01">7. Service Providers & User Due Diligence</h3>
                            <p className="mb-3 leading-relaxed">
                                Service providers on EventBridge operate independently.
                            </p>
                            <ul className="list-disc list-inside space-y-2 mb-4 ml-4">
                                <li>EventBridge is not responsible for how service providers handle personal data outside the Platform</li>
                                <li>Verification status does not guarantee data handling practices or service quality</li>
                                <li>Users are encouraged to review service providers' privacy and refund policies before engagement</li>
                            </ul>
                        </section>

                        <section>
                            <h3 className="text-xl font-semibold mb-3 text-primary-01">8. Data Security</h3>
                            <p className="mb-3 leading-relaxed">
                                We apply reasonable technical and organizational safeguards, including:
                            </p>
                            <ul className="list-disc list-inside space-y-2 mb-4 ml-4">
                                <li>Secure servers and access controls</li>
                                <li>Encryption where appropriate</li>
                                <li>Restricted access to personal data</li>
                            </ul>
                            <p className="leading-relaxed">
                                However, no system is completely secure, and users acknowledge the inherent risks of online
                                platforms.
                            </p>
                        </section>

                        <section>
                            <h3 className="text-xl font-semibold mb-3 text-primary-01">9. Data Retention</h3>
                            <p className="mb-3 leading-relaxed">We retain personal data only for as long as necessary to:</p>
                            <ul className="list-disc list-inside space-y-2 mb-4 ml-4">
                                <li>Provide Platform services</li>
                                <li>Maintain subscription and billing records</li>
                                <li>Meet legal and regulatory requirements</li>
                                <li>Resolve disputes and enforce agreements</li>
                            </ul>
                            <p className="leading-relaxed">
                                Users may request deletion of their data, subject to legal obligations.
                            </p>
                        </section>

                        <section>
                            <h3 className="text-xl font-semibold mb-3 text-primary-01">10. Your Data Protection Rights</h3>
                            <p className="mb-2 leading-relaxed">Depending on applicable law, you may have the right to:</p>
                            <ul className="list-disc list-inside space-y-2 mb-4 ml-4">
                                <li>Access your personal data</li>
                                <li>Request correction of inaccurate data</li>
                                <li>Request deletion of your data</li>
                                <li>Restrict or object to certain processing</li>
                                <li>Withdraw consent where applicable</li>
                            </ul>
                            <p className="leading-relaxed">
                                Requests can be made through the contact details below.
                            </p>
                        </section>

                        <section>
                            <h3 className="text-xl font-semibold mb-3 text-primary-01">11. Cookies & Analytics</h3>
                            <p className="mb-2 leading-relaxed">EventBridge uses cookies and similar technologies to:</p>
                            <ul className="list-disc list-inside space-y-2 mb-4 ml-4">
                                <li>Improve platform performance</li>
                                <li>Analyze usage trends</li>
                                <li>Enhance user experience</li>
                            </ul>
                            <p className="leading-relaxed">
                                You may manage cookies through your browser settings.
                            </p>
                        </section>

                        <section>
                            <h3 className="text-xl font-semibold mb-3 text-primary-01">12. Children's Privacy</h3>
                            <p className="leading-relaxed">
                                EventBridge is not intended for individuals under the age of 18. We do not knowingly collect
                                personal data from minors.
                            </p>
                        </section>

                        <section>
                            <h3 className="text-xl font-semibold mb-3 text-primary-01">13. Changes to This Policy</h3>
                            <p className="leading-relaxed">
                                We may update this Privacy Policy from time to time. Updates will be posted on the Platform,
                                and continued use constitutes acceptance of the revised Policy.
                            </p>
                        </section>

                        <section>
                            <h3 className="text-xl font-semibold mb-3 text-primary-01">14. Governing Law</h3>
                            <p className="leading-relaxed">
                                This Privacy Policy is governed by and interpreted in accordance with the laws of Uganda.
                            </p>
                        </section>

                        <section>
                            <h3 className="text-xl font-semibold mb-3 text-primary-01">15. Contact Information</h3>
                            <p className="mb-2">For privacy questions, data requests, or concerns, contact:</p>
                            <p className="font-medium">Email: <a href="mailto:support@eventbridge.africa" className="text-primary-01 hover:underline">support@eventbridge.africa</a></p>
                            <p>Platform: EventBridge</p>
                        </section>
                    </div>
                </div>
            </div>
        </div>
    );
}
