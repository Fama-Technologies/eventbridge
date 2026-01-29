import BottomNav from "@/components/customer/BottomNav";

export default function CustomerLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen bg-neutrals-01 flex flex-col">
            <main className="flex-1 pb-20">
                {children}
            </main>
            <BottomNav />
        </div>
    );
}
