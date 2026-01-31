'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState, useEffect } from 'react';

interface CategoryCardProps {
  title: string;
  subtitle: string;
  image: string;
  href: string;
  categoryId?: number;
}

interface VendorResult {
  vendor?: {
    businessName?: string;
    rating?: number;
  };
}

export default function CategoryCard({
  title,
  subtitle,
  image,
  href,
  categoryId,
}: CategoryCardProps) {
  const [vendorCount, setVendorCount] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [featuredVendors, setFeaturedVendors] = useState<string[]>([]);
  const [averageRating, setAverageRating] = useState<number | null>(null);

  useEffect(() => {
    if (!categoryId) return;

    const fetchCategoryData = async () => {
      try {
        setIsLoading(true);

        const response = await fetch(
          `/api/public/by-category?categoryId=${categoryId}`
        );

        if (!response.ok) {
          throw new Error('Failed to fetch category vendors');
        }

        const data = await response.json();
        
        // Ensure we have an array
        const vendors: VendorResult[] = Array.isArray(data) ? data : [];

        setVendorCount(vendors.length);

        const vendorNames = vendors
          .slice(0, 2)
          .map(v => v.vendor?.businessName)
          .filter(Boolean) as string[];

        setFeaturedVendors(vendorNames);

        if (vendors.length > 0) {
          const totalRating = vendors.reduce(
            (sum, v) => sum + (v.vendor?.rating || 0),
            0
          );
          setAverageRating(
            Math.round((totalRating / vendors.length) * 10) / 10
          );
        }
      } catch (error) {
        console.error(`Error fetching data for category ${title}:`, error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCategoryData();
  }, [categoryId, title]);

  const formatRating = (rating: number | null) => {
    if (rating === null) return '';
    return `${rating.toFixed(1)} ★`;
  };

  return (
    <Link
      href={href}
      className="group block relative"
      onClick={() => {
        if (typeof window !== 'undefined' && (window as any).gtag) {
          (window as any).gtag('event', 'category_click', {
            category_name: title,
            vendor_count: vendorCount,
          });
        }
      }}
    >
      {averageRating !== null && averageRating >= 4.5 && (
        <div className="absolute top-2 right-2 z-10 bg-yellow-500 text-white text-xs font-bold px-2 py-1 rounded-full">
          Popular
        </div>
      )}

      {isLoading && (
        <div className="absolute inset-0 bg-white bg-opacity-70 z-10 rounded-xl flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-01"></div>
        </div>
      )}

      {vendorCount !== null && (
        <div className="absolute bottom-16 right-3 z-10 bg-primary-01 text-white text-xs font-semibold px-2 py-1 rounded-full">
          {vendorCount}+ vendors
        </div>
      )}

      <div className="relative h-40 w-full rounded-xl overflow-hidden mb-3">
        <Image
          src={image}
          alt={title}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-300"
          priority={
            title.toLowerCase().includes('wedding') ||
            title.toLowerCase().includes('corporate')
          }
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
      </div>

      <h3 className="text-base font-semibold text-shades-black mb-1 flex items-center gap-2">
        {title}
        {averageRating !== null && (
          <span className="text-xs text-yellow-500 font-normal">
            {formatRating(averageRating)}
          </span>
        )}
      </h3>

      <p className="text-sm text-neutrals-06 mb-2">{subtitle}</p>

      {featuredVendors.length > 0 && !isLoading && (
        <div className="mt-2">
          <p className="text-xs text-neutrals-05 mb-1">
            Featured vendors:
          </p>
          <div className="flex flex-wrap gap-1">
            {featuredVendors.map((vendor, index) => (
              <span
                key={index}
                className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-full"
              >
                {vendor}
              </span>
            ))}
            {vendorCount !== null && vendorCount > 2 && (
              <span className="text-xs text-neutrals-05 px-2 py-1">
                +{vendorCount - 2} more
              </span>
            )}
          </div>
        </div>
      )}

      <div className="mt-3 flex items-center justify-between">
        <span className="text-sm text-primary-01 font-medium group-hover:text-primary-02 transition-colors">
          Explore category
        </span>
        <span className="text-primary-01 opacity-0 group-hover:opacity-100 translate-x-0 group-hover:translate-x-1 transition-all duration-300">
          →
        </span>
      </div>

      {process.env.NODE_ENV === 'development' && vendorCount !== null && (
        <div className="mt-2 text-xs text-gray-400 border-t pt-2">
          <div className="flex justify-between">
            <span>Vendors:</span>
            <span>{vendorCount}</span>
          </div>
          {averageRating !== null && (
            <div className="flex justify-between">
              <span>Avg. Rating:</span>
              <span>{averageRating.toFixed(1)}</span>
            </div>
          )}
        </div>
      )}
    </Link>
  );
}
