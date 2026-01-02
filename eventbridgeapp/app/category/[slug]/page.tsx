'use client';

import { useState, useMemo } from 'react';
import { 
  CategoryHeader, 
  CategoryPills, 
  ServiceGrid,
  PlanningEventCTA,
  CategoryFooter 
} from '@/components/category';
import type { ServiceCardProps } from '@/components/category';

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

// Mock services data - in production, fetch from API
const MOCK_SERVICES: ServiceCardProps[] = [
  {
    id: '1',
    name: 'Royal Touch Decor',
    category: 'Event Décor & Styling',
    location: 'Kampala',
    availability: 'Mon–Sun',
    price: '1,200,000',
    priceUnit: 'event',
    rating: 4.91,
    images: ['/categories/weddings.jpg', '/categories/Corporate.jpg'],
  },
  {
    id: '2',
    name: 'Echo Beats Entertainment',
    category: 'DJ & Sound Systems',
    location: 'Wakiso',
    availability: 'Fri-Sun',
    price: '600,000',
    priceUnit: 'day',
    rating: 4.8,
    images: ['/categories/Corporate.jpg', '/categories/Parties.jpg'],
  },
  {
    id: '3',
    name: 'Golden Frame Studios',
    category: 'Photography & Videography',
    location: 'Kampala',
    availability: 'Mon - Sat',
    price: '1,500,000',
    priceUnit: 'day',
    rating: 4.91,
    images: ['/categories/Birthdays.jpg', '/categories/weddings.jpg'],
  },
  {
    id: '4',
    name: 'Taste Buds Catering',
    category: 'Catering Services',
    location: 'Mukono',
    availability: 'Mon - Sun',
    price: '25,000',
    priceUnit: 'plate',
    rating: 4.91,
    images: ['/categories/weddings.jpg', '/categories/Parties.jpg'],
  },
  {
    id: '5',
    name: 'Echo Beats Entertainment',
    category: 'DJ & Sound Systems',
    location: 'Wakiso',
    availability: 'Fri-Sun',
    price: '600,000',
    priceUnit: 'day',
    rating: 4.8,
    images: ['/categories/Parties.jpg', '/categories/Corporate.jpg'],
  },
  {
    id: '6',
    name: 'Golden Frame Studios',
    category: 'Photography & Videography',
    location: 'Kampala',
    availability: 'Mon - Sat',
    price: '1,600,000',
    priceUnit: 'day',
    rating: 4.91,
    images: ['/categories/Corporate.jpg', '/categories/Birthdays.jpg'],
  },
  {
    id: '7',
    name: 'Elite Events',
    category: 'Event Planning',
    location: 'Entebbe',
    availability: 'Mon - Sat',
    price: '2,000,000',
    priceUnit: 'event',
    rating: 4.95,
    images: ['/categories/weddings.jpg'],
  },
  {
    id: '8',
    name: 'Flower Paradise',
    category: 'Floral Arrangements',
    location: 'Kampala',
    availability: 'Mon - Sun',
    price: '300,000',
    priceUnit: 'arrangement',
    rating: 4.7,
    images: ['/categories/Birthdays.jpg'],
  },
];

interface CategoryPageProps {
  params: { slug: string };
}

export default function CategoryPage({ params }: CategoryPageProps) {
  const { slug } = params;
  const [selectedFilter, setSelectedFilter] = useState<string | undefined>();

  // Get category title
  const categoryTitle = CATEGORY_TITLES[slug] || `${slug.charAt(0).toUpperCase() + slug.slice(1)} Services`;

  // Filter services based on selected category pill
  const filteredServices = useMemo(() => {
    if (!selectedFilter) return MOCK_SERVICES;
    
    return MOCK_SERVICES.filter(service => 
      service.category.toLowerCase().includes(selectedFilter.toLowerCase()) ||
      selectedFilter.toLowerCase().includes(service.category.split(' ')[0].toLowerCase())
    );
  }, [selectedFilter]);

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
            <ServiceGrid services={filteredServices} />
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

        {/* Planning Event CTA */}
        <div className="mt-16">
          <PlanningEventCTA />
        </div>
      </main>

      {/* Footer */}
      <CategoryFooter />
    </div>
  );
}
