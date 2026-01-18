'use client';

import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  CategoryHeader,
  CategoryFooter,
  PlanningEventCTA,
  ServiceGrid,
} from '@/components/category';
import type { ServiceCardProps } from '@/components/category';
import { Loader2 } from 'lucide-react';

function getSearchValue(searchParams: URLSearchParams, keys: string[]) {
  for (const key of keys) {
    const value = searchParams.get(key);
    if (value) return value;
  }
  return '';
}

export default function SearchPage() {
  const searchParams = useSearchParams();
  const [services, setServices] = useState<ServiceCardProps[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);

  const what = useMemo(
    () => getSearchValue(searchParams, ['what', 'service', 'category', 'search']),
    [searchParams]
  );
  const where = useMemo(
    () => getSearchValue(searchParams, ['where', 'location']),
    [searchParams]
  );
  const when = useMemo(
    () => getSearchValue(searchParams, ['when', 'date']),
    [searchParams]
  );

  useEffect(() => {
    const fetchResults = async () => {
      setIsLoading(true);
      setError(false);

      try {
        const params = new URLSearchParams();
        if (what) params.set('search', what);
        if (where) params.set('location', where);

        const response = await fetch(`/api/public/vendors?${params.toString()}`);
        if (!response.ok) throw new Error('Failed to fetch vendors');
        const data = await response.json();
        setServices(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error('Error fetching search results:', err);
        setError(true);
      } finally {
        setIsLoading(false);
      }
    };

    fetchResults();
  }, [what, where]);

  return (
    <div className="min-h-screen bg-background">
      <CategoryHeader />

      <main className="max-w-7xl mx-auto px-6 py-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">Search results</h1>
        <p className="text-neutrals-06 mb-6">
          {what || where || when
            ? `Showing results for ${[what, where, when].filter(Boolean).join(' • ')}`
            : 'Browse available vendors and services.'}
        </p>

        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-primary-01" />
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <p className="text-neutrals-06 text-lg">Unable to load results right now.</p>
          </div>
        ) : services.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-neutrals-06 text-lg">No vendors match your search yet.</p>
          </div>
        ) : (
          <ServiceGrid services={services} />
        )}

        <div className="mt-16">
          <PlanningEventCTA />
        </div>
      </main>

      <CategoryFooter />
    </div>
  );
}
