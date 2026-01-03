'use client';

import Link from 'next/link';

export default function PlanningEventCTA() {
  return (
    <div className="relative overflow-hidden rounded-2xl flex flex-col md:flex-row bg-linear-to-r from-[#222222] via-[#3d2f1f] to-[#CB5E21]">
      {/* Left side - Text content */}
      <div className="flex-1 p-8 md:p-10">
        <h3 className="text-2xl md:text-3xl font-bold text-white mb-3">
          Planning an Event
        </h3>
        <p className="text-white/80 text-sm leading-relaxed max-w-md">
          Connect with trusted service providers seamlessly to make your vision a
          reality. From intimate gatherings to grand celebrations
        </p>
      </div>

      {/* Right side - CTA Button */}
      <div className="bg-[#CB5E21] md:rounded-l-[40px] flex justify-center items-center w-full md:w-auto py-6 md:py-0" style={{ boxShadow: '0px 4px 6px -4px var(--primary-01), 0px 10px 15px -3px var(--primary-01)' }}>
        <Link
          href="/get-started"
          className="group relative flex items-center justify-center px-12 md:px-20 min-w-[200px] md:min-w-[280px] overflow-hidden"
        >
          <span className="relative flex items-center gap-6 text-white font-semibold text-lg whitespace-nowrap">
            Get Started
            <span
              className="text-2xl transition-transform group-hover:translate-x-1"
              style={{
                animation: 'pointRight 1.5s ease-in-out infinite',
              }}
            >
              →
            </span>
          </span>
        </Link>
      </div>

      <style jsx>{`
        @keyframes pointRight {
          0%, 100% {
            transform: scale(1) translateX(0);
          }
          50% {
            transform: scale(1.3) translateX(8px);
          }
        }
      `}</style>
    </div>
  );
}
