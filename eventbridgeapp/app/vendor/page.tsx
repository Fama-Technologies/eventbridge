import { getCurrentUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import { cookies, headers } from 'next/headers';
import ProfileStrengthCard from "@/components/vendor/dashboard/ProfileStrengthCard";
import CardSection from "@/components/vendor/dashboard/cardsection";
import EventSection from "@/components/vendor/dashboard/eventsection";

export default async function VendorPage() {
    // Get cookies and headers to create a mock request
    const cookieStore = await cookies();
    const headersList = await headers();

    // Create a mock NextRequest-like object that getCurrentUser expects
    const mockRequest = {
        cookies: cookieStore,
        headers: headersList,
        url: '',
        nextUrl: { pathname: '' },
    } as any;

    // Pass the mock request to getCurrentUser
    const user = await getCurrentUser(mockRequest);

    if (!user) {
        redirect("/login");
    }

    // Add account type validation
    const accountType = user.accountType?.toUpperCase();
    if (accountType !== 'VENDOR') {
        if (accountType === 'ADMIN') {
            redirect("/admin/dashboard");
        } else {
            redirect("/dashboard");
        }
    }

    return (
        <div className="flex flex-col w-full gap-6 text-shades-black transition-colors">
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between w-full gap-4">
                <div>
                    <h1 className="font-font1 font-bold text-[28px] md:text-[36px] leading-[32px] md:leading-[40px] tracking-[-0.9px] align-middle pb-4">
                        Welcome back, <span className="text-primary-01">{user.firstName}</span>!
                    </h1>
                    <p className="font-font1 text-neutrals-06 font-normal text-[14px] md:text-[16px] leading-[22px] md:leading-[24px] tracking-[-0.5px]">
                        Here is what is happening with your business today.
                    </p>
                </div>
                <ProfileStrengthCard />
            </div>
            <div>
                <CardSection />
            </div>
            <div>
                <EventSection />
            </div>
        </div>
    );
}