'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Loader2 } from 'lucide-react';
import { CategoryHeader, CategoryFooter, PlanningEventCTA } from '@/components/category';

interface CategoryData {
  slug: string;
  name: string;
  description: string;
  imageUrl: string;
  vendorCount: number;
}

export default function CategoriesPage() {
  const [categories, setCategories] = useState<CategoryData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    async function fetchCategories() {
      try {
        const response = await fetch('/api/public/categories');
        if (!response.ok) throw new Error('Failed to fetch');
        const data = await response.json();
        setCategories(data);
      } catch (err) {
        console.error('Error fetching categories:', err);
        setError(true);
      } finally {
        setIsLoading(false);
      }
    }

    fetchCategories();
  }, []);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <CategoryHeader />

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">All Categories</h1>
        <p className="text-neutrals-06 mb-8">Browse through our extensive list of service categories</p>

        {/* Categories Grid */}
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-primary-01" />
          </div>
        ) : error || categories.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-neutrals-06 text-lg">No categories found at the moment.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {categories.map((category) => (
              <Link
                key={category.slug}
                href={`/category/${category.slug}`}
                className="group block"
              >
                <div className="relative aspect-4/3 rounded-xl overflow-hidden mb-3">
                  <Image
                    src={category.imageUrl}
                    alt={category.name}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-linear-to-t from-black/60 to-transparent" />

                  {/* Vendor count badge */}
                  <div className="absolute bottom-3 right-3 bg-white/20 backdrop-blur-sm rounded-full px-3 py-1">
                    <span className="text-white text-xs font-medium">{category.vendorCount} vendors</span>
                  </div>
                </div>
                <h3 className="text-foreground font-semibold text-lg mb-1 group-hover:text-primary-01 transition-colors">
                  {category.name}
                </h3>
                <p className="text-neutrals-06 text-sm">{category.description}</p>
              </Link>
            ))}
          </div>
        )}

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
