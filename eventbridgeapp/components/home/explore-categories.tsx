'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import CategoryCard from './category-card';

export default function ExploreCategories() {
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchCategories() {
      try {
        const response = await fetch('/api/categories?limit=4');
        if (!response.ok) throw new Error('Failed to fetch categories');
        const data = await response.json();
        // Ensure we only show 4 items if the API returns more
        setCategories(Array.isArray(data) ? data.slice(0, 4) : []);
      } catch (error) {
        console.error('Error fetching categories:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchCategories();
  }, []);

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

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-01"></div>
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
