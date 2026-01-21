import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export interface MediaItem {
    src: string;
    alt?: string;
    overlay?: string;
}

interface HeroCarouselProps {
    mediaItems: MediaItem[];
    autoplayDelay?: number; // ms
    onSlideChange?: (index: number) => void;
}

const HeroCarousel: React.FC<HeroCarouselProps> = ({ mediaItems, autoplayDelay = 10000, onSlideChange }) => {
    const [current, setCurrent] = useState(0);

    // Autoplay effect
    useEffect(() => {
        const interval = setInterval(() => {
            setCurrent((prev) => {
                const next = (prev + 1) % mediaItems.length;
                onSlideChange?.(next);
                return next;
            });
        }, autoplayDelay);
        return () => clearInterval(interval);
    }, [mediaItems.length, autoplayDelay, onSlideChange]);

    const goToPrevious = () => {
        const prev = current === 0 ? mediaItems.length - 1 : current - 1;
        setCurrent(prev);
        onSlideChange?.(prev);
    };

    const goToNext = () => {
        const next = (current + 1) % mediaItems.length;
        setCurrent(next);
        onSlideChange?.(next);
    };

    const handleDotClick = (index: number) => {
        setCurrent(index);
        onSlideChange?.(index);
    };

    return (
        <div className="absolute inset-0 overflow-hidden">
            {mediaItems.map((item, idx) => (
                <div
                    key={idx}
                    className={`absolute inset-0 transition-opacity duration-700 ${idx === current ? 'opacity-100' : 'opacity-0'}`}
                >
                    <img src={item.src} alt={item.alt ?? ''} className="w-full h-full object-cover" />
                    {item.overlay && (
                        <div className={`absolute inset-0 ${item.overlay}`} />
                    )}
                </div>
            ))}

            {/* Left Arrow */}
            <button
                onClick={goToPrevious}
                className="absolute left-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm hover:bg-white/30 transition-all flex items-center justify-center text-white"
                aria-label="Previous slide"
            >
                <ChevronLeft size={24} />
            </button>

            {/* Right Arrow */}
            <button
                onClick={goToNext}
                className="absolute right-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm hover:bg-white/30 transition-all flex items-center justify-center text-white"
                aria-label="Next slide"
            >
                <ChevronRight size={24} />
            </button>

            {/* Bar indicators */}
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex space-x-2 z-20">
                {mediaItems.map((_, idx) => (
                    <button
                        key={idx}
                        onClick={() => handleDotClick(idx)}
                        className={`h-1.5 rounded-full transition-all duration-300 ${idx === current ? 'w-8 bg-[#FF5F38]' : 'w-4 bg-white/50 hover:bg-white/80'}`}
                        aria-label={`Slide ${idx + 1}`}
                    />
                ))}
            </div>
        </div>
    );
};

export default HeroCarousel;
