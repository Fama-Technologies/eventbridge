'use client';

import { useState } from 'react';
import ServiceCard from './ServiceCard';
import type { ServiceCardProps } from './ServiceCard';

interface ServiceGridProps {
  services: ServiceCardProps[];
  initialCount?: number;
  loadMoreCount?: number;
}

export default function ServiceGrid({ 
  services, 
  initialCount = 6,
  loadMoreCount = 6 
}: ServiceGridProps) {
  const [displayCount, setDisplayCount] = useState(initialCount);
  const [loading, setLoading] = useState(false);

  const displayedServices = services.slice(0, displayCount);
  const hasMore = displayCount < services.length;

  const handleLoadMore = () => {
    setLoading(true);
    // Simulate loading delay
    setTimeout(() => {
      setDisplayCount(prev => Math.min(prev + loadMoreCount, services.length));
      setLoading(false);
    }, 500);
  };

  return (
    <div>
      {/* Services Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {displayedServices.map((service) => (
          <ServiceCard key={service.id} {...service} />
        ))}
      </div>

      {/* Load More Button */}
      {hasMore && (
        <div className="text-center mt-8">
          <button
            onClick={handleLoadMore}
            disabled={loading}
            className="text-primary-01 hover:text-primary-02 font-medium text-sm transition-colors disabled:opacity-50"
          >
            {loading ? 'Loading...' : 'Load more'}
          </button>
        </div>
      )}
    </div>
  );
}
