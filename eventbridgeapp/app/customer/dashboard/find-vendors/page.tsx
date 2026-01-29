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

      {/*the context will display the event categories in 2 for mobile and 4 for desktop*/}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 gap-4">
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
    </div>
  );
}

{
  /*if the tab == to Find Vendors* then man let it go to this thenext page */
}
