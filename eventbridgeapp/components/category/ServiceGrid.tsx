'use client';

import { useState, useEffect } from 'react';
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
  const [userFavorites, setUserFavorites] = useState<any[]>([]);

  // Fetch favorites on mount
  useEffect(() => {
    const fetchFavorites = async () => {
      try {
        const res = await fetch('/api/customer/favorites');
        if (res.ok) {
          const data = await res.json();
          if (data.success && Array.isArray(data.favorites)) {
            setUserFavorites(data.favorites);
          }
        }
      } catch (err) {
        console.error('Failed to fetch favorites', err);
      }
    };
    fetchFavorites();
  }, []);

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
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        {displayedServices.map((service) => (
          <ServiceCard
            key={service.id}
            {...service}
            isFavorite={userFavorites.some(f => f.vendorId.toString() === service.id)}
          />
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
