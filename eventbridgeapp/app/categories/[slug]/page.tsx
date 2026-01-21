// app/category/[slug]/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Star, MapPin, BadgeCheck, ChevronLeft, ChevronRight } from 'lucide-react';

interface Vendor {
  id: number;
  name: string;
  businessName: string | null;
  description: string | null;
  location: string | null;
  rating: number;
  reviewCount: number;
  image: string;
  verified: boolean;
  slug: string;
}

interface Category {
  id: number;
  name: string;
  slug: string;
  description: string | null;
}

interface PaginationInfo {
  page: number;
  limit: number;
  totalVendors: number;
  totalPages: number;
  hasMore: boolean;
}

export default function CategoryDetailPage() {
  const params = useParams();
  const slug = params.slug as string;

  const [category, setCategory] = useState<Category | null>(null);
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [pagination, setPagination] = useState<PaginationInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    if (slug) {
      fetchVendors(currentPage);
    }
  }, [slug, currentPage]);

  const fetchVendors = async (page: number) => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/categories/${slug}/vendors?page=${page}&limit=12`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch vendors');
      }

      const data = await response.json();

      if (data.success) {
        setCategory(data.category);
        setVendors(data.vendors);
        setPagination(data.pagination);
      } else {
        throw new Error(data.error || 'Failed to load vendors');
      }
    } catch (err) {
      console.error('Fetch vendors error:', err);
      setError(err instanceof Error ? err.message : 'Failed to load vendors');
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (loading && !category) {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-2/3 mb-8"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="bg-white rounded-lg overflow-hidden shadow-sm">
                  <div className="h-48 bg-gray-200"></div>
                  <div className="p-4">
                    <div className="h-6 bg-gray-200 rounded mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 text-lg mb-4">{error}</p>
          <button
            onClick={() => fetchVendors(currentPage)}
            className="px-6 py-2 bg-primary-01 text-white rounded-lg hover:bg-primary-02"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!category) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-neutrals-06 text-lg">Category not found</p>
          <Link href="/categories" className="text-primary-01 underline mt-4 inline-block">
            Back to Categories
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-neutrals-06 mb-6">
          <Link href="/" className="hover:text-primary-01">Home</Link>
          <span>/</span>
          <Link href="/categories" className="hover:text-primary-01">Categories</Link>
          <span>/</span>
          <span className="text-foreground">{category.name}</span>
        </div>

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">{category.name}</h1>
          <p className="text-neutrals-06">
            {category.description || `Find the best ${category.name.toLowerCase()} for your event`}
          </p>
          {pagination && (
            <p className="text-sm text-neutrals-05 mt-2">
              {pagination.totalVendors} vendor{pagination.totalVendors !== 1 ? 's' : ''} available
            </p>
          )}
        </div>

        {/* Vendors Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="bg-white rounded-lg overflow-hidden shadow-sm animate-pulse">
                <div className="h-48 bg-gray-200"></div>
                <div className="p-4">
                  <div className="h-6 bg-gray-200 rounded mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        ) : vendors.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-neutrals-06 text-lg">No vendors found in this category yet.</p>
            <Link href="/categories" className="text-primary-01 underline mt-4 inline-block">
              Browse other categories
            </Link>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {vendors.map((vendor) => (
                <Link
                  key={vendor.id}
                  href={`/vendor/${vendor.slug}`}
                  className="group bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="relative h-48">
                    <Image
                      src={vendor.image}
                      alt={vendor.name}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    {vendor.verified && (
                      <div className="absolute top-3 right-3 bg-white rounded-full p-1.5">
                        <BadgeCheck className="w-5 h-5 text-primary-01" />
                      </div>
                    )}
                  </div>

                  <div className="p-4">
                    <h3 className="font-semibold text-lg text-foreground mb-1 group-hover:text-primary-01 transition-colors">
                      {vendor.name}
                    </h3>

                    {vendor.location && (
                      <div className="flex items-center gap-1 text-sm text-neutrals-06 mb-2">
                        <MapPin className="w-4 h-4" />
                        <span>{vendor.location}</span>
                      </div>
                    )}

                    <div className="flex items-center gap-1 mb-2">
                      <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      <span className="font-medium text-sm">
                        {vendor.rating > 0 ? vendor.rating.toFixed(1) : 'New'}
                      </span>
                      {vendor.reviewCount > 0 && (
                        <span className="text-sm text-neutrals-06">
                          ({vendor.reviewCount} review{vendor.reviewCount !== 1 ? 's' : ''})
                        </span>
                      )}
                    </div>

                    {vendor.description && (
                      <p className="text-sm text-neutrals-06 line-clamp-2">
                        {vendor.description}
                      </p>
                    )}
                  </div>
                </Link>
              ))}
            </div>

            {/* Pagination */}
            {pagination && pagination.totalPages > 1 && (
              <div className="flex items-center justify-center gap-2">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="p-2 rounded-lg border border-neutrals-03 hover:bg-neutrals-01 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>

                <div className="flex items-center gap-2">
                  {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((page) => (
                    <button
                      key={page}
                      onClick={() => handlePageChange(page)}
                      className={`px-4 py-2 rounded-lg ${
                        currentPage === page
                          ? 'bg-primary-01 text-white'
                          : 'border border-neutrals-03 hover:bg-neutrals-01'
                      }`}
                    >
                      {page}
                    </button>
                  ))}
                </div>

                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={!pagination.hasMore}
                  className="p-2 rounded-lg border border-neutrals-03 hover:bg-neutrals-01 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}