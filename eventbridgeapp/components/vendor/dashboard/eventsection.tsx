import QuickSection from "./quicksection"
import RecentMessages from "./recentmessages"
import BookTrackerRecent from "./BookTrackerRecent";


export default function EventSection() {
    return (
        <section className="w-full grid grid-cols-1 lg:grid-cols-6 gap-6" aria-label="Vendor events and recent activity">
            <div className="col-span-1 lg:col-span-4 bg-shades-white p-6 rounded-lg border border-neutrals-03 shadow-sm transition-colors duration-300">
                <RecentMessages />

                <QuickSection />
            </div>
            <aside className="col-span-1 lg:col-span-2">
                <BookTrackerRecent />
            </aside>
        </section>
    )
}