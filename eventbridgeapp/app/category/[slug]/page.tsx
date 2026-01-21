'use client';

import { useState, useMemo, useEffect } from 'react';
import {
  CategoryHeader,
  CategoryPills,
  ServiceGrid,
  PlanningEventCTA,
  CategoryFooter
} from '@/components/category';
import type { ServiceCardProps } from '@/components/category';
import Footer from '@/components/footer';

// Category title mapping
const CATEGORY_TITLES: Record<string, string> = {
  weddings: 'Wedding Services',
  corporate: 'Corporate Services',
  parties: 'Party Services',
  birthdays: 'Birthday Services',
  photography: 'Photography Services',
  catering: 'Catering Services',
  venues: 'Venue Services',
  decoration: 'Decoration Services',
  entertainment: 'Entertainment Services',
};

interface CategoryPageProps {
  params: { slug: string };
}

export default function CategoryPage({ params }: CategoryPageProps) {
  const { slug } = params;
  const [selectedFilter, setSelectedFilter] = useState<string | undefined>();
  const [services, setServices] = useState<ServiceCardProps[]>([]);
  const [loading, setLoading] = useState(true);

  // Get category title
  const categoryTitle = CATEGORY_TITLES[slug] || `${slug.charAt(0).toUpperCase() + slug.slice(1)} Services`;

  useEffect(() => {
    async function fetchVendors() {
      setLoading(true);
      try {
        const response = await fetch(`/api/public/vendors?category=${slug}`);
        if (!response.ok) throw new Error('Failed to fetch vendors');
        const data = await response.json();
        setServices(data);
      } catch (error) {
        console.error('Error fetching vendors:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchVendors();
  }, [slug]);

  // Filter services based on selected category pill (local filtering of fetched results)
  const filteredServices = useMemo(() => {
    if (!selectedFilter) return services;

    return services.filter((service: ServiceCardProps) =>
      service.category.toLowerCase().includes(selectedFilter.toLowerCase()) ||
      selectedFilter.toLowerCase().includes(service.category.split(' ')[0].toLowerCase())
    );
  }, [selectedFilter, services]);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <CategoryHeader />

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Left Section - Services */}
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-foreground mb-6">{categoryTitle}</h1>
            {loading ? (
              <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-01"></div>
              </div>
            ) : filteredServices.length > 0 ? (
              <ServiceGrid services={filteredServices} />
            ) : (
              <p className="text-neutrals-06">No vendors found in this category.</p>
            )}
          </div>

          {/* Right Section - Category Pills */}
          <div className="lg:w-72 shrink-0">
            <h2 className="text-lg font-semibold text-foreground mb-4">Search Categories</h2>
            <CategoryPills
              selectedCategory={selectedFilter}
              onCategorySelect={(cat) => setSelectedFilter(cat === selectedFilter ? undefined : cat)}
            />
          </div>
        </div>


      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}
