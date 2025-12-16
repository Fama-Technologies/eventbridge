'use client';

import Image from 'next/image';
import { Heart, Star } from 'lucide-react';
import { useState } from 'react';

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
  id,
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

  return (
    <div className="group relative rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all bg-neutrals-02">
      {/* Image */}
      <div className="relative h-48 w-full bg-neutrals-04">
        {image ? (
          <Image
            src={image}
            alt={businessName}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-neutrals-06">
            No image
          </div>
        )}

        {/* Favorite Button */}
        <button
          onClick={() => setFavorite(!favorite)}
          className="absolute top-3 right-3 w-10 h-10 rounded-full bg-white/90 hover:bg-white flex items-center justify-center shadow-md transition-colors"
          aria-label="Add to favorites"
        >
          <Heart
            size={20}
            className={`transition-colors ${
              favorite ? 'fill-red-500 text-red-500' : 'text-neutrals-07'
            }`}
          />
        </button>

        {/* Carousel Indicators */}
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
          {[1, 2, 3, 4, 5].map((dot) => (
            <div
              key={dot}
              className={`w-1.5 h-1.5 rounded-full ${
                dot === 1 ? 'bg-white' : 'bg-white/50'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <div className="flex items-start justify-between mb-2">
          <h3 className="text-lg font-semibold text-shades-black">{businessName}</h3>
          <div className="flex items-center gap-1">
            <Star size={16} className="fill-primary-01 text-primary-01" />
            <span className="text-sm font-medium text-shades-black">{rating.toFixed(1)}</span>
          </div>
        </div>

        <p className="text-sm text-neutrals-07 mb-1">
          {category} • {location}
        </p>
        <p className="text-sm text-neutrals-06 mb-2">{availableDates}</p>
        <p className="text-lg font-bold text-shades-black">
          {pricePerDay} <span className="text-sm font-normal text-neutrals-07">/day</span>
        </p>
      </div>
    </div>
  );
}
