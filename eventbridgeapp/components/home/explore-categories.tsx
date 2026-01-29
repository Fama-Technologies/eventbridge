'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import CategoryCard from './category-card';

export default function ExploreCategories() {
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const eventTypeSlugs = new Set([
    'weddings',
    'birthdays',
    'corporate',
    'engagements',
    'baby-showers',
    'graduations',
    'conferences',
    'funerals',
    'parties',
    'product-launchers',
    'workshops',
  ]);

  useEffect(() => {
    async function fetchCategories() {
      try {
        const response = await fetch('/api/categories');
        if (!response.ok) throw new Error('Failed to fetch categories');
        const data = await response.json();

        console.log('📊 Categories API Response:', data);
        console.log('📊 Is Array?', Array.isArray(data));
        console.log('📊 Data length:', data?.length);

        // Filter for event type categories
        const filtered =
          Array.isArray(data)
            ? data.filter((category) =>
              eventTypeSlugs.has(String(category.slug || '').toLowerCase())
            )
            : [];

        console.log('📊 Filtered categories:', filtered);
        console.log('📊 Filtered length:', filtered.length);

        // If we have filtered results, use them; otherwise show first 4 categories
        const categoriesToShow = filtered.length > 0 ? filtered : (Array.isArray(data) ? data : []);
        console.log('📊 Categories to show:', categoriesToShow.slice(0, 4));
        setCategories(categoriesToShow.slice(0, 4));
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
          <h2 className="text-2xl font-bold text-shades-black">Explore services by event type</h2>
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
          <div className="overflow-x-auto snap-x snap-mandatory pb-4 scrollbar-hide">
            <div className="grid grid-flow-col auto-cols-[minmax(220px,1fr)] gap-4">
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
          </div>
        )}
      </div>
    </section>
  );
}
