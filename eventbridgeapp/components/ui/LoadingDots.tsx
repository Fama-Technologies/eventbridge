import React from 'react';

interface LoadingDotsProps {
    className?: string;
    size?: 'sm' | 'md' | 'lg';
}

export default function LoadingDots({ className = '', size = 'md' }: LoadingDotsProps) {
    const sizes = {
        sm: { container: 'w-24 h-24', dot: 'w-8 h-8' },
        md: { container: 'w-32 h-32', dot: 'w-12 h-12' },
        lg: { container: 'w-48 h-48', dot: 'w-16 h-16' }
    };

    const sizeClasses = sizes[size];

    return (
        <div className={`relative ${className}`}>
            {/* Container with dots */}
            <div className={`${sizeClasses.container} absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 loading-container`}>
                <div className={`${sizeClasses.dot} rounded-full bg-[#ffc400] absolute top-0 bottom-0 left-0 right-0 m-auto loading-dot-1`}></div>
                <div className={`${sizeClasses.dot} rounded-full bg-[#0051ff] absolute top-0 bottom-0 left-0 right-0 m-auto loading-dot-2`}></div>
                <div className={`${sizeClasses.dot} rounded-full bg-[#ff1717] absolute top-0 bottom-0 left-0 right-0 m-auto loading-dot-3`}></div>
            </div>

            {/* SVG Filter */}
            <svg className="absolute w-0 h-0" version="1.1" xmlns="http://www.w3.org/2000/svg">
                <defs>
                    <filter id="goo">
                        <feGaussianBlur
                            result="blur"
                            stdDeviation="10"
                            in="SourceGraphic"
                        ></feGaussianBlur>
                        <feColorMatrix
                            values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 21 -7"
                            mode="matrix"
                            in="blur"
                        ></feColorMatrix>
                    </filter>
                </defs>
            </svg>

            <style jsx>{`
        .loading-container {
          filter: url("#goo");
          animation: rotate-move 2s ease-in-out infinite;
        }

        .loading-dot-3 {
          animation: dot-3-move 2s ease infinite, index 6s ease infinite;
        }

        .loading-dot-2 {
          animation: dot-2-move 2s ease infinite, index 6s -4s ease infinite;
        }

        .loading-dot-1 {
          animation: dot-1-move 2s ease infinite, index 6s -2s ease infinite;
        }

        @keyframes dot-3-move {
          20% {
            transform: scale(1);
          }
          45% {
            transform: translateY(-18px) scale(0.45);
          }
          60% {
            transform: translateY(-90px) scale(0.45);
          }
          80% {
            transform: translateY(-90px) scale(0.45);
          }
          100% {
            transform: translateY(0px) scale(1);
          }
        }

        @keyframes dot-2-move {
          20% {
            transform: scale(1);
          }
          45% {
            transform: translate(-16px, 12px) scale(0.45);
          }
          60% {
            transform: translate(-80px, 60px) scale(0.45);
          }
          80% {
            transform: translate(-80px, 60px) scale(0.45);
          }
          100% {
            transform: translateY(0px) scale(1);
          }
        }

        @keyframes dot-1-move {
          20% {
            transform: scale(1);
          }
          45% {
            transform: translate(16px, 12px) scale(0.45);
          }
          60% {
            transform: translate(80px, 60px) scale(0.45);
          }
          80% {
            transform: translate(80px, 60px) scale(0.45);
          }
          100% {
            transform: translateY(0px) scale(1);
          }
        }

        @keyframes rotate-move {
          55% {
            transform: translate(-50%, -50%) rotate(0deg);
          }
          80% {
            transform: translate(-50%, -50%) rotate(360deg);
          }
          100% {
            transform: translate(-50%, -50%) rotate(360deg);
          }
        }

        @keyframes index {
          0%,
          100% {
            z-index: 3;
          }
          33.3% {
            z-index: 2;
          }
          66.6% {
            z-index: 1;
          }
        }
      `}</style>
        </div>
    );
}
