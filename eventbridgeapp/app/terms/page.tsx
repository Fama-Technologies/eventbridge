
import Link from 'next/link';
import { ArrowLeft, Check } from 'lucide-react';

export default function TermsPage({
    searchParams,
}: {
    searchParams: { [key: string]: string | string[] | undefined };
}) {
    const type = searchParams?.type;
    const returnUrl = type ? `/signup?accepted=true&type=${type}` : '/signup?accepted=true';
    const declineUrl = type ? `/signup?type=${type}` : '/signup';

    return (
        <div className="flex h-screen flex-col bg-neutrals-01 dark:bg-shades-black">
            {/* Header */}
            <header className="flex items-center justify-between border-b border-neutrals-04 bg-shades-white px-6 py-4 dark:bg-neutrals-02">
                <div className="flex items-center gap-4">
                    <Link
                        href={declineUrl}
                        className="flex items-center gap-2 text-sm font-medium text-neutrals-07 hover:text-shades-black dark:text-neutrals-05 dark:hover:text-shades-white"
                    >
                        <ArrowLeft size={16} />
                        Back to Sign Up
                    </Link>
                    <div className="h-6 w-px bg-neutrals-04" />
                    <h1 className="text-lg font-bold text-shades-black dark:text-shades-white">Terms of Service</h1>
                </div>
                <div className="text-sm text-neutrals-06">
                    Last Updated: Dec 22, 2025
                </div>
            </header>

            {/* Main Content - Scrollable */}
            <div className="flex-1 overflow-y-auto">
                <div className="mx-auto max-w-3xl px-6 py-12">
                    <div className="space-y-8 text-shades-black dark:text-neutrals-05">
                        <section>
                            <h2 className="text-2xl font-bold mb-4">Welcome to EventBridge</h2>
                            <p className="mb-4 leading-relaxed">
                                Welcome to EventBridge. These Terms of Service ("Terms") govern your access to and use of
                                the EventBridge website, mobile applications, and related services (collectively, the "Platform").
                                By accessing or using EventBridge, you agree to be bound by these Terms. If you do not agree,
                                do not use the Platform.
                            </p>
                        </section>

                        <section>
                            <h3 className="text-xl font-semibold mb-3 text-primary-01">1. About EventBridge</h3>
                            <p className="mb-4 leading-relaxed">
                                EventBridge is a digital event planning and service-connection platform that enables users
                                and service providers to:
                            </p>
                            <ul className="list-disc list-inside space-y-2 mb-4 ml-4">
                                <li>Discover and engage event service providers</li>
                                <li>View service packages and portfolios</li>
                                <li>Plan, manage, and organize events using digital tools</li>
                                <li>Communicate and coordinate with service providers</li>
                            </ul>
                            <p className="leading-relaxed">
                                EventBridge also offers subscription-based paid features for users and service providers.
                                EventBridge does not currently process payments for event services between users and
                                service providers.
                            </p>
                        </section>

                        <section>
                            <h3 className="text-xl font-semibold mb-3 text-primary-01">2. Eligibility</h3>
                            <p className="leading-relaxed">
                                You must be at least 18 years old and legally capable of entering into binding agreements to use
                                the Platform.
                            </p>
                        </section>

                        <section>
                            <h3 className="text-xl font-semibold mb-3 text-primary-01">3. User Accounts</h3>
                            <p className="mb-4 leading-relaxed">
                                You may be required to create an account to access certain features. You agree to:
                            </p>
                            <ul className="list-disc list-inside space-y-2 mb-4 ml-4">
                                <li>Provide accurate and complete information</li>
                                <li>Keep your login credentials secure</li>
                                <li>Notify EventBridge of unauthorized account use</li>
                            </ul>
                            <p className="leading-relaxed">
                                You are responsible for all activity under your account.
                            </p>
                        </section>

                        <section>
                            <h3 className="text-xl font-semibold mb-3 text-primary-01">4. Platform Role & Disclaimer</h3>
                            <p className="mb-4 leading-relaxed">
                                EventBridge acts solely as a technology and facilitation platform.
                            </p>
                            <ul className="list-disc list-inside space-y-2 mb-4 ml-4">
                                <li>We are not an event organizer, service provider, broker, agent, or guarantor</li>
                                <li>We do not supervise, control, or direct service providers</li>
                                <li>We are not a party to any agreement between users and service providers</li>
                            </ul>
                            <p className="leading-relaxed">
                                All engagements are directly between users and service providers.
                            </p>
                        </section>

                        <section>
                            <h3 className="text-xl font-semibold mb-3 text-primary-01">5. Subscription Services & Fees</h3>
                            
                            <h4 className="font-semibold mb-2">5.1 Paid Platform Features</h4>
                            <p className="mb-3 leading-relaxed">
                                EventBridge offers subscription-based access to certain features, including:
                            </p>
                            
                            <div className="mb-4">
                                <p className="font-medium mb-2">a. Service Provider Subscriptions</p>
                                <p className="mb-2">Service providers may subscribe monthly or annually for:</p>
                                <ul className="list-disc list-inside space-y-1 ml-4">
                                    <li>Business profile boosting and visibility</li>
                                    <li>Featured service listings and portfolios</li>
                                    <li>Access to booking, quotation, and analytics tools</li>
                                    <li>Promotional and engagement features</li>
                                </ul>
                            </div>

                            <div className="mb-4">
                                <p className="font-medium mb-2">b. Event Planning Tools</p>
                                <p className="mb-2">Users and service providers may subscribe monthly or annually to premium planning tools, including:</p>
                                <ul className="list-disc list-inside space-y-1 ml-4">
                                    <li>Event budgeting tools</li>
                                    <li>Planning calendars and checklists</li>
                                    <li>Service provider management tools</li>
                                    <li>Event coordination features</li>
                                </ul>
                            </div>

                            <h4 className="font-semibold mb-2 mt-4">5.2 Subscription Billing</h4>
                            <ul className="list-disc list-inside space-y-2 mb-4 ml-4">
                                <li>Subscription fees are billed in advance on a recurring basis (monthly or annually)</li>
                                <li>Prices, features, and billing cycles will be clearly displayed before purchase</li>
                                <li>EventBridge reserves the right to change subscription pricing with reasonable notice</li>
                            </ul>

                            <h4 className="font-semibold mb-2 mt-4">5.3 Renewals, Cancellation & Refunds</h4>
                            <ul className="list-disc list-inside space-y-2 ml-4">
                                <li>Subscriptions automatically renew unless canceled before the renewal date</li>
                                <li>Users may cancel subscriptions through their account settings</li>
                                <li>Fees paid are non-refundable, except where required by law or expressly stated</li>
                                <li>Access to paid features may continue until the end of the current billing cycle</li>
                            </ul>
                        </section>

                        <section>
                            <h3 className="text-xl font-semibold mb-3 text-primary-01">6. Payments & Financial Transactions</h3>
                            
                            <h4 className="font-semibold mb-2">6.1 Platform Payments Only</h4>
                            <p className="mb-2 leading-relaxed">EventBridge processes payments only for:</p>
                            <ul className="list-disc list-inside space-y-1 mb-4 ml-4">
                                <li>Platform subscriptions</li>
                                <li>Feature upgrades and promotional tools</li>
                            </ul>
                            
                            <p className="mb-2 leading-relaxed">EventBridge does not:</p>
                            <ul className="list-disc list-inside space-y-1 mb-4 ml-4">
                                <li>Process payments for event services</li>
                                <li>Collect deposits or service fees</li>
                                <li>Hold escrow funds</li>
                                <li>Facilitate payouts to service providers</li>
                            </ul>

                            <h4 className="font-semibold mb-2 mt-4">6.2 Event Service Payments (Outside the Platform)</h4>
                            <p className="mb-3 leading-relaxed">
                                All payments for event services are arranged directly between users and service providers,
                                outside EventBridge.
                            </p>
                            <p className="mb-2 leading-relaxed">EventBridge bears no responsibility or liability for:</p>
                            <ul className="list-disc list-inside space-y-1 ml-4">
                                <li>Payment disputes</li>
                                <li>Refunds or cancellations</li>
                                <li>Non-performance or service failures</li>
                            </ul>
                        </section>

                        <section>
                            <h3 className="text-xl font-semibold mb-3 text-primary-01">7. Due Diligence & Provider Verification</h3>
                            <p className="mb-4 leading-relaxed">
                                While EventBridge may verify service providers, verification does not guarantee quality,
                                availability, pricing, or performance.
                            </p>
                            <p className="mb-2 leading-relaxed">Users are strongly encouraged to:</p>
                            <ul className="list-disc list-inside space-y-2 mb-4 ml-4">
                                <li>Conduct independent due diligence</li>
                                <li>Review portfolios, references, and reviews</li>
                                <li>Carefully read refund, cancellation, and rescheduling policies</li>
                                <li>Confirm all service terms in writing before payment</li>
                            </ul>
                            <p className="leading-relaxed font-medium">
                                You engage service providers at your own risk, even if they are verified or promoted on the
                                Platform.
                            </p>
                        </section>

                        <section>
                            <h3 className="text-xl font-semibold mb-3 text-primary-01">8. Service Providers</h3>
                            <p className="mb-2 leading-relaxed">Service providers:</p>
                            <ul className="list-disc list-inside space-y-2 mb-4 ml-4">
                                <li>Operate as independent contractors</li>
                                <li>Are responsible for the accuracy of their profiles and pricing</li>
                                <li>Must comply with applicable laws and regulations</li>
                            </ul>
                            <p className="leading-relaxed">
                                EventBridge does not guarantee service availability, quality, or outcomes.
                            </p>
                        </section>

                        <section>
                            <h3 className="text-xl font-semibold mb-3 text-primary-01">9. Platform Tools & Information</h3>
                            <p className="mb-4 leading-relaxed">
                                EventBridge provides planning, budgeting, scheduling, and management tools for informational
                                and organizational purposes only.
                            </p>
                            <ul className="list-disc list-inside space-y-2 ml-4">
                                <li>Tools are provided "as is"</li>
                                <li>EventBridge does not guarantee accuracy or suitability</li>
                                <li>Final decisions remain the user's responsibility</li>
                            </ul>
                        </section>

                        <section>
                            <h3 className="text-xl font-semibold mb-3 text-primary-01">10. Acceptable Use</h3>
                            <p className="mb-2 leading-relaxed">You agree not to:</p>
                            <ul className="list-disc list-inside space-y-2 mb-4 ml-4">
                                <li>Use the Platform for unlawful or fraudulent purposes</li>
                                <li>Misrepresent identity or services</li>
                                <li>Harass or exploit other users</li>
                                <li>Circumvent Platform safeguards</li>
                            </ul>
                            <p className="leading-relaxed">
                                EventBridge may suspend or terminate accounts for violations.
                            </p>
                        </section>

                        <section>
                            <h3 className="text-xl font-semibold mb-3 text-primary-01">11. Intellectual Property</h3>
                            <p className="leading-relaxed">
                                All Platform content, software, branding, and tools are owned by or licensed to EventBridge and
                                may not be used without permission.
                            </p>
                        </section>

                        <section>
                            <h3 className="text-xl font-semibold mb-3 text-primary-01">12. Limitation of Liability</h3>
                            <p className="mb-2 leading-relaxed">To the fullest extent permitted by law:</p>
                            <ul className="list-disc list-inside space-y-2 ml-4">
                                <li>EventBridge is not liable for losses arising from third-party services</li>
                                <li>EventBridge is not responsible for event failures, cancellations, or disputes</li>
                                <li>Your use of the Platform is at your own risk</li>
                            </ul>
                        </section>

                        <section>
                            <h3 className="text-xl font-semibold mb-3 text-primary-01">13. Indemnification</h3>
                            <p className="mb-2 leading-relaxed">You agree to indemnify and hold harmless EventBridge from claims arising from:</p>
                            <ul className="list-disc list-inside space-y-2 ml-4">
                                <li>Your use of the Platform</li>
                                <li>Your engagement with service providers</li>
                                <li>Your breach of these Terms</li>
                            </ul>
                        </section>

                        <section>
                            <h3 className="text-xl font-semibold mb-3 text-primary-01">14. Termination</h3>
                            <p className="mb-2 leading-relaxed">EventBridge may suspend or terminate access for:</p>
                            <ul className="list-disc list-inside space-y-2 ml-4">
                                <li>Breach of these Terms</li>
                                <li>Misuse of Platform features</li>
                                <li>Risk to other users or the Platform</li>
                            </ul>
                        </section>

                        <section>
                            <h3 className="text-xl font-semibold mb-3 text-primary-01">15. Changes to These Terms</h3>
                            <p className="leading-relaxed">
                                EventBridge may update these Terms from time to time. Continued use constitutes acceptance of
                                revised Terms.
                            </p>
                        </section>

                        <section>
                            <h3 className="text-xl font-semibold mb-3 text-primary-01">16. Governing Law</h3>
                            <p className="leading-relaxed">
                                These Terms are governed by the laws of Uganda.
                            </p>
                        </section>

                        <section>
                            <h3 className="text-xl font-semibold mb-3 text-primary-01">17. Contact Information</h3>
                            <p className="mb-2">For questions or concerns, contact:</p>
                            <p className="font-medium">Email: <a href="mailto:support@eventbridge.africa" className="text-primary-01 hover:underline">support@eventbridge.africa</a></p>
                            <p>Platform: EventBridge</p>
                        </section>
                    </div>
                </div>
            </div>

            {/* Footer / Accept Action */}
            <div className="border-t border-neutrals-04 bg-shades-white p-6 dark:bg-neutrals-02">
                <div className="mx-auto flex max-w-3xl flex-col items-center justify-between gap-4 sm:flex-row">
                    <div className="text-sm text-neutrals-07">
                        By clicking accept, you agree to these Terms.
                    </div>
                    <div className="flex gap-4">
                        <Link
                            href={declineUrl}
                            className="inline-flex items-center justify-center whitespace-nowrap rounded-lg text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-01 disabled:pointer-events-none disabled:opacity-50 border border-neutrals-04 bg-transparent text-shades-black hover:bg-neutrals-02 h-10 px-4 py-2"
                        >
                            Decline
                        </Link>
                        <Link
                            href={returnUrl}
                            className="inline-flex items-center justify-center whitespace-nowrap rounded-lg text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-01 disabled:pointer-events-none disabled:opacity-50 bg-primary-01 text-shades-white hover:bg-primary-02 h-10 px-4 py-2"
                        >
                            Accept & Continue
                            <Check className="ml-2 h-4 w-4" />
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
