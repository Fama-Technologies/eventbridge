import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function BookingSidebar() {
    return (
        <div className="   flex flex-col">
         <Tabs defaultValue="upcoming" className="w-full">
            <TabsList className="flex w-full mb-6 bg-neutrals-02 rounded-lg p-1">
                <TabsTrigger value="upcoming" className="flex-1 text-center data-[state=active]:bg-shades-white data-[state=active]:shadow-sm data-[state=active]:text-primary-01 text-sm font-medium text-neutrals-08">
                    Upcoming
                </TabsTrigger>
                <TabsTrigger value="past" className="flex-1 text-center data-[state=active]:bg-shades-white data-[state=active]:shadow-sm data-[state=active]:text-primary-01 text-sm font-medium text-neutrals-08">
                    Past
                </TabsTrigger>
                <TabsTrigger value="all" className="flex-1 text-center data-[state=active]:text-primary-01">
                    All
                </TabsTrigger>
            </TabsList>
        </Tabs>
        </div>
    )
}