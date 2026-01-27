"use client";

import React from "react";
import Image from "next/image";
import { Search, ArrowRight } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import CategoryCard from "@/components/home/category-card";
import ServiceCard from "@/components/home/service-card";

const TABS = [
    { name: "Find Vendors", href: "/customer/dashboard/find-vendors" },
    { name: "Templates", href: "/customer/dashboard/templates" },
    { name: "My Events", href: "/customer/dashboard/my-events" },
];

export default function CustomerDashboardPage() {
  const [activeTab, setActiveTab] = React.useState("");
  const [categories, setCategories] = React.useState<any[]>([]);
  const [services, setServices] = React.useState<any[]>([]);
  const [regionalServices, setRegionalServices] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    async function fetchData() {
      try {
        // Fetch categories
        const catResponse = await fetch("/api/categories");
        if (catResponse.ok) {
          const catData = await catResponse.json();
          setCategories(Array.isArray(catData) ? catData : []);
        }

        // Fetch featured services
        const servicesResponse = await fetch("/api/public/vendors/featured");
        if (servicesResponse.ok) {
          const servicesData = await servicesResponse.json();
          const fetchedServices = Array.isArray(servicesData)
            ? servicesData
            : servicesData.services || servicesData.data || [];
          setServices(fetchedServices);
          // Use same data for regional section for now
          setRegionalServices(fetchedServices);
        }
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  return (
    <div className="min-h-screen bg-neutrals-01 pb-20">
      {/* Hero / Search Section - Sticky */}
      <div className="bg-shades-white shadow-sm pt-6 pb-4 px-4 sm:px-6 sticky top-0 z-30">
        <div className="max-w-2xl mx-auto">
          {/* Search Bar */}
          <div className="relative mb-4">
            <div className="flex items-center bg-shades-white border border-neutrals-03 rounded-full shadow-lg p-1.5 pl-5 transition-all focus-within:ring-2 focus-within:ring-primary-01/20 focus-within:border-primary-01">
              <input
                type="text"
                placeholder="Start your search"
                className="flex-1 bg-transparent border-none outline-none text-shades-black placeholder:text-neutrals-06 text-sm sm:text-base font-medium"
              />
              <button
                className="bg-primary-01 hover:bg-primary-02 text-shades-white p-2.5 sm:p-3 rounded-full transition-colors flex items-center justify-center"
                aria-label="Search"
              >
                <Search size={18} strokeWidth={2.5} />
              </button>
            </div>
          </div>

          {/* Tabs */}
          {/*if the tab == to Find Vendors* then man let it go to this thenext page */}
          <div className="flex items-center justify-center gap-6 sm:gap-8">
            {TABS.map((tab) => (
              <Link
                href={tab.href}
                key={tab.name}
                onClick={() => setActiveTab(tab.name)}
                className={cn(
                  "pb-2 text-xs sm:text-sm font-semibold transition-all relative whitespace-nowrap",
                  activeTab === tab.name
                    ? "text-shades-black"
                    : "text-neutrals-06 hover:text-neutrals-07",
                )}
              >
                {tab.name}
                {activeTab === tab.name && (
                  <span className="absolute bottom-0 left-0 w-full h-[3px] bg-primary-01 rounded-t-full" />
                )}
                </Link>
            ))}
            {/*  */}
          </div>
        </div>
      </div>

      {/* Explore Services by Event Type */}
      <section className="py-6 px-4 sm:px-6 bg-background">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg sm:text-xl font-bold text-shades-black">
              Explore Services by Event type
            </h2>
            <Link
              href="/categories"
              className="flex items-center gap-1 text-primary-01 hover:text-primary-02 font-medium transition-colors text-xs sm:text-sm"
            >
              View all <ArrowRight size={16} />
            </Link>
          </div>

          {loading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-01"></div>
            </div>
          ) : (
            <div className="overflow-x-auto snap-x snap-mandatory pb-4 ">
              {/*MAKING IT to have a horizontal scrolling of the cards */}

              <div className="grid grid-flow-col auto-cols-[minmax(220px,1fr)] gap-4">
                {categories.map((category) => (
                  <CategoryCard
                    key={category.slug}
                    title={category.name}
                    subtitle={category.description}
                    image={category.imageUrl}
                    href={`/vendor/${category.slug}`}
                    categoryId={category.id}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Top Recommended Services */}
      <section
        className="py-6 px-4 sm:px-6"

      >
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg sm:text-xl font-bold text-shades-black">
              Top Recommended Services
            </h2>
            <Link
              href="/search"
              className="flex items-center gap-1 text-primary-01 hover:text-primary-02 font-medium transition-colors text-xs sm:text-sm"
            >
              View all <ArrowRight size={16} />
            </Link>
          </div>

          {loading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-01"></div>
            </div>
          ) : services.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-neutrals-06">No services available</p>
            </div>
          ) : (
            <div className="overflow-x-auto snap-x snap-mandatory pb-4 ">
              <div className="grid grid-flow-col auto-cols-[minmax(220px,2fr)] gap-4">
                {services.map((service) => (
                  <ServiceCard key={service.id} {...service} />
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* In the Central Region */}
      <section className="py-6 px-4 sm:px-6 bg-background">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg sm:text-xl font-bold text-shades-black">
              In the Central Region
            </h2>
            <Link
              href="/search"
              className="flex items-center gap-1 text-primary-01 hover:text-primary-02 font-medium transition-colors text-xs sm:text-sm"
            >
              View all <ArrowRight size={16} />
            </Link>
          </div>

          {loading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-01"></div>
            </div>
          ) : regionalServices.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-neutrals-06">No services available</p>
            </div>
          ) : (
            <div className="overflow-x-auto snap-x snap-mandatory pb-4 ">
              <div className="grid grid-flow-col auto-cols-[minmax(220px,2fr)] gap-4">
                {regionalServices.map((service) => (
                  <ServiceCard key={service.id} {...service} />
                ))}
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

{/*if the tab == to Find Vendors* then man let it go to this thenext page */}
