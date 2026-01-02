'use client';

import Link from 'next/link';
import Image from 'next/image';
import { CategoryHeader, CategoryFooter, PlanningEventCTA } from '@/components/category';

const ALL_CATEGORIES = [
  {
    title: 'Weddings',
    subtitle: 'Venues, Photographers, Florists',
    image: '/categories/weddings.jpg',
    href: '/category/weddings',
    vendorCount: 245,
  },
  {
    title: 'Corporate',
    subtitle: 'Seminars, Catering, Team Building',
    image: '/categories/Corporate.jpg',
    href: '/category/corporate',
    vendorCount: 189,
  },
  {
    title: 'Parties',
    subtitle: 'DJs, Decor, Entertainment',
    image: '/categories/Parties.jpg',
    href: '/category/parties',
    vendorCount: 312,
  },
  {
    title: 'Birthdays',
    subtitle: 'Bakers, Caterers, Entertainment',
    image: '/categories/Birthdays.jpg',
    href: '/category/birthdays',
    vendorCount: 278,
  },
  {
    title: 'Photography',
    subtitle: 'Photographers, Videographers',
    image: '/categories/Corporate.jpg',
    href: '/category/photography',
    vendorCount: 156,
  },
  {
    title: 'Catering',
    subtitle: 'Catering Services, Chefs',
    image: '/categories/weddings.jpg',
    href: '/category/catering',
    vendorCount: 198,
  },
  {
    title: 'Venues',
    subtitle: 'Hotels, Gardens, Halls',
    image: '/categories/Parties.jpg',
    href: '/category/venues',
    vendorCount: 87,
  },
  {
    title: 'Decoration',
    subtitle: 'Event Stylists, Florists',
    image: '/categories/Birthdays.jpg',
    href: '/category/decoration',
    vendorCount: 134,
  },
  {
    title: 'Entertainment',
    subtitle: 'DJs, Bands, MCs',
    image: '/categories/Corporate.jpg',
    href: '/category/entertainment',
    vendorCount: 167,
  },
  {
    title: 'Fashion',
    subtitle: 'Designers, Stylists, Makeup',
    image: '/categories/weddings.jpg',
    href: '/category/fashion',
    vendorCount: 203,
  },
];

export default function CategoriesPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <CategoryHeader />

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">All Categories</h1>
        <p className="text-neutrals-06 mb-8">Browse through our extensive list of service categories</p>

        {/* Categories Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {ALL_CATEGORIES.map((category) => (
            <Link 
              key={category.title} 
              href={category.href}
              className="group block"
            >
              <div className="relative aspect-4/3 rounded-xl overflow-hidden mb-3">
                <Image
                  src={category.image}
                  alt={category.title}
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
                {category.title}
              </h3>
              <p className="text-neutrals-06 text-sm">{category.subtitle}</p>
            </Link>
          ))}
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
