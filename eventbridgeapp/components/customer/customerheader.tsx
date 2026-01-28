"use client";

import React, { useEffect, useState } from "react";
import { Search, ArrowRight, Sun } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { useTheme } from '@/providers/theme-provider';


const TABS = [
  { name: "Find Vendors", href: "/customer/dashboard/find-vendors" },
  { name: "Templates", href: "/customer/dashboard/templates" },
  { name: "My Events", href: "/customer/dashboard/my-events" },
];

export default function Customerheader() {
  const [activeTab, setActiveTab] = React.useState("");
  const [categories, setCategories] = React.useState<any[]>([]);
  const [services, setServices] = React.useState<any[]>([]);
  const [regionalServices, setRegionalServices] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [mounted, setMounted] = useState(false);
  const { setTheme: updateTheme, resolvedTheme } = useTheme();


  useEffect(() => {
    setMounted(true);


  }, []);

  const toggleTheme = () => {
    updateTheme(resolvedTheme === 'dark' ? 'light' : 'dark');
  };

  const textColorClass = 'text-shades-black hover:text-primary-01';

  return (
    <div>
      {/* Hero / Search Section - Sticky */}
      <div className="bg-shades-white shadow-sm pt-6 pb-4 px-4 sm:px-6 sticky top-0 z-30">
        <div className="max-w-2xl mx-auto">
          {/*a logo and the theme change toggle*/}
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center">
              <Image
                src="/logo.png"
                alt="Logo"
                width={100}
                height={100}
                className="w-24 h-24"
              />
            </Link>

            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className={`w-10 h-10 rounded-full border flex items-center justify-center transition-all duration-300 border-neutrals-04 ${textColorClass} hover:border-primary-01`}
              aria-label="Toggle theme"
            >
              {mounted && (
                <div className="relative w-5 h-5">
                  <Sun
                    size={20}
                    className={`absolute inset-0 transition-all duration-500 ${resolvedTheme === 'dark'
                      ? 'rotate-0 scale-100 opacity-100'
                      : 'rotate-90 scale-0 opacity-0'
                      }`}
                  />
                  <Image src="/icons/moon.svg"
                    alt="Moon"
                    width={20}
                    height={20}
                    className={`absolute inset-0 transition-all duration-500 ${resolvedTheme === 'light'
                      ? 'rotate-0 scale-100 opacity-100'
                      : '-rotate-90 scale-0 opacity-0'
                      }`}
                  />
                </div>
              )}
            </button>
          </div>
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



    </div>
  );
}

{/*if the tab == to Find Vendors* then man let it go to this thenext page */ }
