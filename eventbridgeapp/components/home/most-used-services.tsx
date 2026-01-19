'use client';

import { useState, useEffect } from 'react';
import ServiceCard from './service-card';
import { Loader2 } from 'lucide-react';

interface FeaturedService {
  id: string;
  businessName: string;
  category: string;
  location: string;
  availableDates: string;
  pricePerDay: string;
  rating: number;
  images: string[];
}

export default function MostUsedServices() {
  const [services, setServices] = useState<FeaturedService[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    async function fetchServices() {
      try {
        const response = await fetch('/api/public/vendors/featured');
        if (!response.ok) throw new Error('Failed to fetch');
        const data = await response.json();

        // Ensure we handle both array and { data: [] } structures
        const fetchedServices = Array.isArray(data) ? data : (data.services || data.data || []);
        setServices(fetchedServices);
      } catch (err) {
        console.error('Error fetching featured services:', err);
        setError(true);
      } finally {
        setIsLoading(false);
      }
    }

    fetchServices();
  }, []);

  return (
    <section className="py-12 px-6" style={{ backgroundColor: '#fff5f2' }}>
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-1 h-8 bg-primary-01 rounded-full"></div>
          <h2 className="text-2xl font-bold text-black">Top Recommended Services</h2>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-primary-01" />
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <p className="text-neutrals-06 text-lg">
              We&apos;re having trouble loading top recommendations right now.
            </p>
          </div>
        ) : services.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-neutrals-06 text-lg">No featured services available at the moment.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {services.map((service) => (
              <ServiceCard key={service.id} {...service} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
