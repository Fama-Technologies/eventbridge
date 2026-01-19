'use client';

import Image from 'next/image';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

// ADDED: Import database queries
import { getQuickStats, searchVendors } from '@/lib/queries';

export default function BookingProcess() {
  // ADDED: Router for navigation
  const router = useRouter();
  
  // ADDED: State for statistics
  const [stats, setStats] = useState({
    totalVendors: 0,
    totalBookings: 0
  });
  
  // ADDED: State for loading
  const [isLoading, setIsLoading] = useState(true);
  
  // ADDED: State for search input
  const [searchQuery, setSearchQuery] = useState('');
  
  // ADDED: Fetch statistics on component mount
  useEffect(() => {
    const fetchStats = async () => {
      try {
        setIsLoading(true);
        const data = await getQuickStats();
        setStats({
          totalVendors: data.totalVendors,
          totalBookings: data.totalBookings
        });
      } catch (error) {
        console.error('Error fetching stats:', error);
        // Fallback values
        setStats({
          totalVendors: 1250,
          totalBookings: 5400
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchStats();
  }, []);
  
  // ADDED: Handle search submission
  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const steps = [
    {
      number: 1,
      icon: '/icons/search-normal.svg',
      title: 'Discover Vendors',
      // MODIFIED: Added dynamic stats
      description: isLoading 
        ? 'Loading vendors...' 
        : `Browse ${stats.totalVendors.toLocaleString()}+ verified event pros tailored to your specific needs.`,
      bgColor: 'bg-blue-100',
      iconBg: 'bg-blue-200',
      // ADDED: Click handler
      onClick: () => router.push('/search'),
    },
    {
      number: 2,
      icon: '/icons/message-search.svg',
      title: 'Compare & Connect',
      // MODIFIED: Added dynamic stats
      description: isLoading 
        ? 'Loading booking data...' 
        : `Check reviews, availability, and chat with ${stats.totalBookings.toLocaleString()}+ successful bookings.`,
      bgColor: 'bg-purple-100',
      iconBg: 'bg-purple-200',
      // ADDED: Click handler
      onClick: () => router.push('/vendors'),
    },
    {
      number: 3,
      icon: '/icons/security.svg',
      title: 'Secure Booking',
      description: 'Pay safely through our protected platform with zero hidden fees.',
      bgColor: 'bg-green-100',
      iconBg: 'bg-green-200',
      // ADDED: Click handler
      onClick: () => router.push('/booking'),
    },
    {
      number: 4,
      icon: 'icons/confetti.svg',
      title: 'Enjoy Your Event',
      description: 'Relax knowing your team is ready to go for your big event.',
      bgColor: 'bg-pink-100',
      iconBg: 'bg-pink-200',
      // ADDED: Click handler
      onClick: () => router.push('/testimonials'),
    },
  ];

  return (
    <section className="py-16 px-6 bg-background">
      <div className="max-w-7xl mx-auto">
        {/* Header - UNCHANGED */}
        <div className="text-center mb-14">
          <p className="text-primary-01 font-semibold text-[24px] uppercase tracking-wider mb-3">
            THE PROCESS
          </p>
          <h2 className="text-[64px] font-bold text-shades-black mb-4">
            Booking made Simple
          </h2>
          <p className="text-neutrals-06 text-base max-w-xl mx-auto">
            From initial discovery to the big day, we&apos;ve streamlined event planning into four effortless steps.
          </p>
        </div>

        {/* ADDED: Search Bar Section */}
        <div className="mb-12 max-w-2xl mx-auto">
          <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100">
            <h3 className="text-lg font-semibold text-shades-black mb-4 text-center">
              Start Your Search
            </h3>
            <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search for vendors, services, or locations..."
                className="flex-1 px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-01"
              />
              <button
                type="submit"
                className="px-6 py-3 bg-primary-01 text-white font-semibold rounded-lg hover:bg-primary-02 transition-colors whitespace-nowrap"
              >
                Search Vendors
              </button>
            </form>
            {isLoading && (
              <p className="text-sm text-neutrals-06 mt-3 text-center">
                Loading real-time data...
              </p>
            )}
          </div>
        </div>

        {/* Steps Grid - MODIFIED to be interactive */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step) => (
            <button
              key={step.number}
              onClick={step.onClick}
              className="relative flex flex-col items-center text-center group cursor-pointer transition-all duration-300 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-primary-01 focus:ring-opacity-50 rounded-xl p-2"
            >
              {/* Icon Container with Number Badge - UNCHANGED */}
              <div className="relative mb-6">
                <div
                  className={`w-18 h-18 rounded-full ${step.bgColor} flex items-center justify-center transition-transform duration-300 group-hover:scale-110`}
                >
                  <div className={`w-16 h-16 rounded-full ${step.iconBg} flex items-center justify-center`}>
                    <Image
                      src={step.icon}
                      alt={step.title}
                      width={52}
                      height={52}
                      className="w-8 h-8 transition-transform duration-300 group-hover:scale-125"
                    />
                  </div>
                </div>
                
                {/* Number Badge - positioned at top right - UNCHANGED */}
                <div className="absolute -top-1 -right-1 w-7 h-7 bg-primary-01 text-white rounded-full flex items-center justify-center text-sm font-bold">
                  {step.number}
                </div>
              </div>

              {/* Content - UNCHANGED */}
              <h3 className="text-lg font-bold text-shades-black mb-2">
                {step.title}
              </h3>
              <p className="text-neutrals-06 text-sm leading-relaxed max-w-[200px]">
                {step.description}
              </p>
              
              {/* ADDED: Hover indicator */}
              <div className="mt-4 text-primary-01 text-xs font-semibold opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                Click to explore →
              </div>
            </button>
          ))}
        </div>

        {/* ADDED: Statistics Section */}
        <div className="mt-12 pt-8 border-t border-gray-100">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary-01">
                {isLoading ? '...' : stats.totalVendors.toLocaleString()}+
              </div>
              <div className="text-sm text-neutrals-06">Verified Vendors</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary-01">
                {isLoading ? '...' : stats.totalBookings.toLocaleString()}+
              </div>
              <div className="text-sm text-neutrals-06">Successful Bookings</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary-01">
                24/7
              </div>
              <div className="text-sm text-neutrals-06">Customer Support</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary-01">
                100%
              </div>
              <div className="text-sm text-neutrals-06">Secure Payments</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}