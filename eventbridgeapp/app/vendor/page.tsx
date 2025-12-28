import { getCurrentUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import ProfileStrengthCard from "@/components/vendor/dashboard/ProfileStrengthCard";
import CardSection from "@/components/vendor/cardsection";


export default async function VendorPage() {
    const user = await getCurrentUser();

    if (!user) {
        redirect("/login");
    }

    return <div className="flex flex-col w-full gap-6 text-white">
        <div className="flex flex-row items-center justify-between w-full">
            <div>
                <h1 className="font-font1 font-bold text-[36px] leading-[40px] tracking-[-0.9px] align-middle pb-4">
                    Welcome back, <span className="text-[#FF7043]">{user.firstName}</span>!
                </h1>
                <p className="font-font1 text-[#8C8C8C] font-normal text-[16px] leading-[24px] tracking-[-0.5px]">
                    Here is what is happening with your business today.
                </p>
            </div>
            <ProfileStrengthCard />
        </div>
        <div >
            <CardSection />
        </div>
    </div>;
}
