import React, { useState, useEffect } from 'react';

export interface MediaItem {
    type: 'image' | 'video';
    src: string;
    alt?: string;
}

interface HeroCarouselProps {
    mediaItems: MediaItem[];
    autoplayDelay?: number; // ms
}

// Helper to detect YouTube URL
const getYouTubeId = (url: string) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
};

const isYouTube = (url: string) => url.includes('youtube.com') || url.includes('youtu.be');

const HeroCarousel: React.FC<HeroCarouselProps> = ({ mediaItems, autoplayDelay = 10000 }) => {
    const [current, setCurrent] = useState(0);

    // Autoplay effect
    useEffect(() => {
        const interval = setInterval(() => {
            setCurrent((prev) => (prev + 1) % mediaItems.length);
        }, autoplayDelay);
        return () => clearInterval(interval);
    }, [mediaItems.length, autoplayDelay]);

    return (
        <div className="absolute inset-0 overflow-hidden">
            {mediaItems.map((item, idx) => (
                <div
                    key={idx}
                    className={`absolute inset-0 transition-opacity duration-700 ${idx === current ? 'opacity-100' : 'opacity-0'}`}
                >
                    {item.type === 'image' ? (
                        <img src={item.src} alt={item.alt ?? ''} className="w-full h-full object-cover" />
                    ) : isYouTube(item.src) ? (
                        <div className="absolute inset-0 w-full h-full pointer-events-none">
                            <iframe
                                src={`https://www.youtube.com/embed/${getYouTubeId(item.src)}?autoplay=1&mute=1&controls=0&loop=1&playlist=${getYouTubeId(item.src)}&playsinline=1&showinfo=0&rel=0&iv_load_policy=3&disablekb=1`}
                                className="w-full h-[300%] -mt-[100%] lg:h-full lg:mt-0 object-cover scale-150"
                                allow="autoplay; encrypted-media"
                                title={item.alt ?? 'Video'}
                            />
                        </div>
                    ) : (
                        <video
                            src={item.src}
                            muted
                            autoPlay
                            loop
                            playsInline
                            className="w-full h-full object-cover"
                        />
                    )}
                </div>
            ))}

            {/* Dot indicators */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2">
                {mediaItems.map((_, idx) => (
                    <button
                        key={idx}
                        onClick={() => setCurrent(idx)}
                        className={`w-3 h-3 rounded-full ${idx === current ? 'bg-white' : 'bg-white/50'}`}
                        aria-label={`Slide ${idx + 1}`}
                    />
                ))}
            </div>
        </div>
    );
};

export default HeroCarousel;
