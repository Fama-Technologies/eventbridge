import { Icon } from "@iconify/react";
import QuickCard from "./quickcard";
import React from "react";

const CalendarIcon = (props: any) => <Icon icon="mdi:calendar-edit-outline" {...props} />;
const CameraIcon = (props: any) => <Icon icon="mdi:camera-plus-outline" {...props} />;
const MoneyIcon = (props: any) => <Icon icon="mdi:attach-money" {...props} />;
const SupportIcon = (props: any) => <Icon icon="mdi:customer-service" {...props} />;

const items = [
    { icon: CalendarIcon, title: "Block Dates", href: "/vendor/bookings" },
    { icon: CameraIcon, title: "Add Photos", href: "/vendor/settings" },
    { icon: MoneyIcon, title: "Update Prices", href: "/vendor/settings" },
    { icon: SupportIcon, title: "Complete Profile", href: "/vendor/settings" },
];

export default function QuickSection() {
    return (
        <section aria-label="Quick actions" className="flex flex-col gap-4 mt-6">
            <h1 className="font-font1 font-semibold text-[14px] leading-[20px] tracking-normal text-white">
                Quick Actions
            </h1>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {items.map((it) => (
                    <QuickCard key={it.title} icon={it.icon} title={it.title} href={it.href} />
                ))}
            </div>
        </section>
    );
}