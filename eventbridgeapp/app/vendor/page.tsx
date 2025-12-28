import { getCurrentUser } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function VendorPage() {
    const user = await getCurrentUser();

    if (!user) {
        redirect("/login");
    }

    return <div className="flex h-screen">
        <div className="flex flex-col">

            <div>
                <h1> Welcome back, <span>{user.firstName}</span></h1>

            </div>
            <div></div>
        </div>
        <div></div>
    </div>;
}
