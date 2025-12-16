import { ArrowRight } from 'lucide-react';
import Link from 'next/link';
import CategoryCard from './category-card';

export default function ExploreCategories() {
  const categories = [
    {
      title: 'Weddings',
      subtitle: 'Venues, Photographers, Florists',
      image: '/categories/weddings.jpg',
      href: '/category/weddings',
    },
    {
      title: 'Corporate',
      subtitle: 'Seminars, Catering, Team Building',
      image: '/categories/corporate.jpg',
      href: '/category/corporate',
    },
    {
      title: 'Parties',
      subtitle: 'DJs, Decor, Entertainments',
      image: '/categories/parties.jpg',
      href: '/category/parties',
    },
    {
      title: 'Birthdays',
      subtitle: 'Bakers, Caterers, Entertainment',
      image: '/categories/birthdays.jpg',
      href: '/category/birthdays',
    },
  ];

  return (
    <section className="py-16 px-6 bg-background">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-4xl font-bold text-shades-black">Explore by Category</h2>
          <Link
            href="/categories"
            className="flex items-center gap-2 text-primary-01 hover:text-primary-02 font-semibold transition-colors"
          >
            View all <ArrowRight size={20} />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {categories.map((category) => (
            <CategoryCard key={category.title} {...category} />
          ))}
        </div>
      </div>
    </section>
  );
}
