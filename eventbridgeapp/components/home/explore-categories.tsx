'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowRight, Loader2 } from 'lucide-react';
import CategoryCard from './category-card';

interface CategoryData {
  slug: string;
  name: string;
  description: string;
  imageUrl: string;
  vendorCount: number;
}

export default function ExploreCategories() {
  const [categories, setCategories] = useState<CategoryData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);

  // Mock data requested by user
  const MOCK_CATEGORIES: CategoryData[] = [
    {
      slug: 'weddings',
      name: 'Weddings',
      description: 'Plan your dream wedding',
      imageUrl: '/categories/weddings.jpg',
      vendorCount: 150
    },
    {
      slug: 'corporate',
      name: 'Corporate',
      description: 'Professional events & conferences',
      imageUrl: '/categories/Corporate.jpg',
      vendorCount: 85
    },
    {
      slug: 'birthdays',
      name: 'Birthdays',
      description: 'Celebrate another year',
      imageUrl: '/categories/Birthdays.jpg',
      vendorCount: 120
    },
    {
      slug: 'parties',
      name: 'Parties',
      description: 'Fun gatherings & celebrations',
      imageUrl: '/categories/Parties.jpg',
      vendorCount: 200
    }
  ];

  useEffect(() => {
    // Simulate loading for effect, but use mock data
    const timer = setTimeout(() => {
      setCategories(MOCK_CATEGORIES);
      setIsLoading(false);
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  if (error) return null;

  return (
    <section className="py-12 px-6 bg-background">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-shades-black">Explore Services by Event type</h2>
          <Link
            href="/categories"
            className="flex items-center gap-2 text-shades-black hover:text-primary-01 font-medium transition-colors text-sm"
          >
            View all <ArrowRight size={18} />
          </Link>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center h-48">
            <Loader2 className="h-8 w-8 animate-spin text-primary-01" />
          </div>
        ) : categories.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-neutrals-06 text-lg">No categories found.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {categories.map((cat) => (
              <CategoryCard
                key={cat.slug}
                title={cat.name}
                subtitle={cat.description}
                image={cat.imageUrl}
                href={`/category/${cat.slug}`}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
