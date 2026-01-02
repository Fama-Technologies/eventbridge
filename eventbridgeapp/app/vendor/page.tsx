import { getCurrentUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import ProfileStrengthCard from "@/components/vendor/dashboard/ProfileStrengthCard";
import CardSection from "@/components/vendor/dashboard/cardsection";
import EventSection from "@/components/vendor/dashboard/eventsection";


export default async function VendorPage() {
    const user = await getCurrentUser();

    if (!user) {
        redirect("/login");
    }

    return <div className="flex flex-col w-full gap-6 text-shades-black transition-colors">
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
    </div>;
}
