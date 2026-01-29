'use client';

import Image from 'next/image';
import { Heart, Star } from 'lucide-react';
import { useState } from 'react';
import Link from 'next/link';

export interface ServiceCardProps {
  id: string;
  name: string;
  category: string;
  location: string;
  availability: string;
  price: string;
  priceUnit: string;
  rating: number;
  images: string[];
  isFavorite?: boolean;
}

export default function ServiceCard({
  id,
  name,
  category,
  location,
  availability,
  price,
  priceUnit,
  rating,
  images,
  isFavorite = false,
}: ServiceCardProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [favorite, setFavorite] = useState(isFavorite);

  const handleFavoriteClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    // Optimistic update
    const newStatus = !favorite;
    setFavorite(newStatus);

    try {
      if (newStatus) {
        // Add to favorites
        const res = await fetch('/api/customer/favorites', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ vendorId: parseInt(id) })
        });
        if (!res.ok) throw new Error('Failed to add favorite');
      } else {
        // Remove from favorites
        const res = await fetch(`/api/customer/favorites?vendorId=${id}`, {
          method: 'DELETE'
        });
        if (!res.ok) throw new Error('Failed to remove favorite');
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
      // Revert on error
      setFavorite(!newStatus);
    }
  };

  return (
    <Link href={`/customer/vendor-profile/${id}`} className="group block">
      {/* Image Container */}
      <div className="relative aspect-4/3 rounded-xl overflow-hidden mb-3">
        <Image
          src={images[currentImageIndex] || '/categories/placeholder.jpg'}
          alt={name}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-300"
        />

        {/* Favorite Button */}
        <button
          onClick={handleFavoriteClick}
          aria-label={favorite ? "Remove from favorites" : "Add to favorites"}
          className={`absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center transition-all ${favorite
            ? 'bg-primary-01 text-white'
            : 'bg-white/20 backdrop-blur-sm text-white hover:bg-white/30'
            }`}
        >
          <Heart size={16} fill={favorite ? 'currentColor' : 'none'} />
        </button>

        {/* Rating Badge */}
        <div className="absolute bottom-3 right-3 bg-black/60 backdrop-blur-sm rounded-full px-2 py-1 flex items-center gap-1">
          <Star size={12} className="text-white" fill="white" />
          <span className="text-white text-xs font-medium">{rating.toFixed(2)}</span>
        </div>

        {/* Image Dots */}
        {images.length > 1 && (
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1">
            {images.map((_, index) => (
              <button
                key={index}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setCurrentImageIndex(index);
                }}
                className={`w-1.5 h-1.5 rounded-full transition-all ${index === currentImageIndex
                  ? 'bg-white w-3'
                  : 'bg-white/50 hover:bg-white/70'
                  }`}
              />
            ))}
          </div>
        )}
      </div>

      {/* Card Content */}
      <div>
        <h3 className="font-semibold text-foreground text-sm mb-0.5">{name}</h3>
        <p className="text-neutrals-06 text-xs mb-0.5">
          {category} - {location}
        </p>
        <p className="text-neutrals-07 text-xs mb-2">{availability}</p>
        <p className="text-foreground font-medium text-sm">
          UGX {price} <span className="text-neutrals-06 font-normal">/{priceUnit}</span>
        </p>
      </div>
    </Link>
  );
}
