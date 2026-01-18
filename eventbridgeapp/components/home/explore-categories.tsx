'use client';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import CategoryCard from './category-card';
import { CATEGORY_DATA } from '@/lib/categories-data';

export default function ExploreCategories() {
  const categories = CATEGORY_DATA.slice(0, 4);

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

        {categories.length === 0 ? (
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
