import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth-options";
import { redirect } from "next/navigation";
import ProfileStrengthCard from "@/components/vendor/dashboard/ProfileStrengthCard";
import CardSection from "@/components/vendor/dashboard/cardsection";
import EventSection from "@/components/vendor/dashboard/eventsection";
import { DashboardDataProvider } from "@/components/vendor/dashboard/DashboardDataProvider";

export default async function VendorPage() {
    const session = await getServerSession(authOptions);
    const user = session?.user;

    if (!user) {
        console.log('VendorPage: no user, redirecting to /login');
        redirect("/login");
    }

    // Add account type validation
    console.log('VendorPage: user:', user);
    const accountType = user.accountType?.toUpperCase();
    console.log('VendorPage: accountType:', accountType);
    if (accountType !== 'VENDOR') {
        console.log('VendorPage: not vendor, redirecting to appropriate dashboard');
        if (accountType === 'ADMIN') {
            redirect("/admin/dashboard");
        } else {
            redirect("/customer/dashboard");
        }
    }

    return (
        <DashboardDataProvider>
            <div className="flex flex-col w-full gap-6 text-shades-black transition-colors">
                <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between w-full gap-4">
                    <div>
                        <h1 className="font-font1 font-bold text-[28px] md:text-[36px] leading-[32px] md:leading-[40px] tracking-[-0.9px] align-middle pb-4">
                            Welcome back, <span className="text-primary-01">{user.name?.split(' ')[0]}</span>!
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
        </DashboardDataProvider>
    );
}
