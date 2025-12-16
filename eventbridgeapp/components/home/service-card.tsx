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
    <div className="group block">
      {/* Image */}
      <div className="relative h-44 w-full bg-neutrals-03 rounded-xl overflow-hidden mb-3">
        {image ? (
          <Image
            src={image}
            alt={businessName}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : null}

        {/* Favorite Button */}
        <button
          onClick={() => setFavorite(!favorite)}
          className="absolute top-3 right-3 z-10"
          aria-label="Add to favorites"
        >
          <Heart
            size={22}
            className={`transition-colors ${
              favorite ? 'fill-red-500 text-red-500' : 'text-neutrals-05 hover:text-neutrals-07'
            }`}
            strokeWidth={1.5}
          />
        </button>

        {/* Carousel Indicators */}
        <div className="absolute bottom-3 left-3 flex gap-1">
          {[1, 2, 3, 4, 5].map((dot) => (
            <div
              key={dot}
              className={`w-1.5 h-1.5 rounded-full ${
                dot === 1 ? 'bg-shades-black' : 'bg-neutrals-04'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Content */}
      <div>
        <div className="flex items-center justify-between mb-1">
          <h3 className="text-sm font-semibold text-shades-black">{businessName}</h3>
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
