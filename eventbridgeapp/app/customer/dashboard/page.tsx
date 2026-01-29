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

const RECOMMENDED_EVENT_TYPES = [
  {
    label: "Weddings",
    query: "weddings",
  },
  {
    label: "Travels",
    query: "travels",
  },
  {
    label: "Anniversaries",
    query: "anniversaries",
  },
  {
    label: "Corporate Events",
    query: "corporate",
  },
  {
    label: "Venues",
    query: "venues",
  },
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
            <div className="overflow-x-auto snap-x snap-mandatory pb-4 scrollbar-hide">
              {/*MAKING IT to have a horizontal scrolling of the cards */}

              <div className="grid grid-flow-col auto-cols-[minmax(220px,1fr)] gap-4">
                {categories.map((category) => (
                  <CategoryCard
                    key={category.slug}
                    title={category.name}
                    subtitle={category.description}
                    image={category.imageUrl}
                    href={`/customer/vendor/${category.slug}`}
                    categoryId={category.id}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Top Recommended Services by Event Type */}
      <section className="py-6 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-lg sm:text-xl font-bold text-shades-black">
              Top Recommended by Event Type
            </h2>
            <Link
              href="/search"
              className="flex items-center gap-1 text-primary-01 hover:text-primary-02 font-medium transition-colors text-xs sm:text-sm"
            >
              View all <ArrowRight size={16} />
            </Link>
          </div>
          <p className="text-xs sm:text-sm text-neutrals-06 mb-5">
            Browse top providers by event focus so you can plan weddings, travel,
            anniversaries, corporate gatherings, and more in one place.
          </p>

          {RECOMMENDED_EVENT_TYPES.map((eventType) => (
            <div key={eventType.label} className="mb-6 last:mb-0">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-base sm:text-lg font-semibold text-shades-black">
                  Top Recommended in {eventType.label}
                </h3>
                <Link
                  href={`/customer/recommended?event=${eventType.query}`}
                  className="text-xs sm:text-sm text-primary-01 hover:text-primary-02 font-medium transition-colors flex items-center gap-1"
                >
                  View all <ArrowRight size={14} />
                </Link>
              </div>

              {loading ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-01"></div>
                </div>
              ) : services.length === 0 ? (
                <div className="text-center py-6">
                  <p className="text-neutrals-06">No services available</p>
                </div>
              ) : (
                <div className="overflow-x-auto snap-x snap-mandatory pb-4 scrollbar-hide">
                  <div className="grid grid-flow-col auto-cols-[minmax(220px,2fr)] gap-4">
                    {services.map((service) => (
                      <ServiceCard key={`${eventType.query}-${service.id}`} {...service} />
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Nearby Providers */}
      <section className="py-6 px-4 sm:px-6 bg-background">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-lg sm:text-xl font-bold text-shades-black">
              Nearby Providers Around You
            </h2>
            <Link
              href="/search"
              className="flex items-center gap-1 text-primary-01 hover:text-primary-02 font-medium transition-colors text-xs sm:text-sm"
            >
              View all <ArrowRight size={16} />
            </Link>
          </div>
          <p className="text-xs sm:text-sm text-neutrals-06 mb-5">
            Recommendations based on your location and recent searches, so you
            can find event services near your region.
          </p>

          {loading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-01"></div>
            </div>
          ) : regionalServices.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-neutrals-06">No services available</p>
            </div>
          ) : (
            <div className="overflow-x-auto snap-x snap-mandatory pb-4 scrollbar-hide">
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

{/*if the tab == to Find Vendors* then man let it go to this thenext page */ }
