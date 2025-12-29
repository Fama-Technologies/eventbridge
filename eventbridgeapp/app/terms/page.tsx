
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
                                Welcome to EventBridge. These Terms of Service (“Terms”) govern your access to and use of
                                the EventBridge website, mobile applications, and related services (collectively, the “Platform”).
                                By accessing or using EventBridge, you agree to be bound by these Terms. If you do not agree,
                                do not use the Platform.
                            </p>
                        </section>
                        {/* ... rest of the content remains same ... */}
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
