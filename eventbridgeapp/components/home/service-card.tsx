'use client';

import Image from 'next/image';
import { Heart, Star, ChevronLeft, ChevronRight } from 'lucide-react';
import { useState, useEffect } from 'react';

interface ServiceCardProps {
  id: string;
  businessName: string;
  category: string;
  location: string;
  availableDates: string;
  pricePerDay: string;
  rating: number;
  image?: string;
  isFavorite?: boolean;
}

export default function ServiceCard({
  businessName,
  category,
  location,
  availableDates,
  pricePerDay,
  rating,
  image,
  isFavorite = false,
}: ServiceCardProps) {
  const [favorite, setFavorite] = useState(isFavorite);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Category images for the carousel
  const categoryImages = [
    '/categories/weddings.jpg',
    '/categories/Corporate.jpg',
    '/categories/Parties.jpg',
    '/categories/Birthdays.jpg',
    image || '/categories/weddings.jpg', // Include the provided image or default
  ];

  // Auto-play carousel
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % categoryImages.length);
    }, 3000); // Change image every 3 seconds

    return () => clearInterval(interval);
  }, [categoryImages.length]);

  const nextImage = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev + 1) % categoryImages.length);
  };

  const prevImage = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentImageIndex((prev) =>
      prev === 0 ? categoryImages.length - 1 : prev - 1
    );
  };

  const goToImage = (index: number) => {
    setCurrentImageIndex(index);
  };

  return (
    <div className="group block">
      {/* Image Carousel */}
      <div className="relative h-44 w-full bg-neutrals-03 rounded-xl overflow-hidden mb-3">
        <Image
          src={categoryImages[currentImageIndex]}
          alt={businessName}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-300"
        />

        {/* Navigation Arrows - Show on hover */}
        <button
          onClick={prevImage}
          className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-opacity z-10"
          aria-label="Previous image"
        >
          <ChevronLeft size={16} className="text-shades-black" />
        </button>
        <button
          onClick={nextImage}
          className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-opacity z-10"
          aria-label="Next image"
        >
          <ChevronRight size={16} className="text-shades-black" />
        </button>

        {/* Favorite Button */}
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setFavorite(!favorite);
          }}
          className="absolute top-3 right-3 z-10"
          aria-label="Add to favorites"
        >
          <Heart
            size={22}
            className={`transition-colors ${favorite ? 'fill-red-500 text-red-500' : 'text-white hover:text-neutrals-02 drop-shadow-md'
              }`}
            strokeWidth={1.5}
          />
        </button>

        {/* Carousel Indicators */}
        <div className="absolute bottom-3 left-3 flex gap-1.5 z-10">
          {categoryImages.map((_, index) => (
            <button
              key={index}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                goToImage(index);
              }}
              className={`w-1.5 h-1.5 rounded-full transition-all ${index === currentImageIndex ? 'bg-white w-4' : 'bg-white/50 hover:bg-white/75'
                }`}
              aria-label={`Go to image ${index + 1}`}
            />
          ))}
        </div>
      </div>

      {/* Content */}
      <div>
        <div className="flex items-center justify-between mb-1">
          <h3 className="text-sm font-semibold text-black">{businessName}</h3>
          <div className="flex items-center gap-1">
            <Star size={14} className="fill-shades-black text-shades-black" />
            <span className="text-sm text-shades-black">{rating.toFixed(2)}</span>
          </div>
        </div>

        <p className="text-sm text-neutrals-06 mb-0.5">
          {category} - {location}
        </p>
        <p className="text-sm text-neutrals-06 mb-0.5">{availableDates}</p>
        <p className="text-sm text-shades-black">
          {pricePerDay} <span className="text-neutrals-06">/day</span>
        </p>
      </div>
    </div>
  );
}
