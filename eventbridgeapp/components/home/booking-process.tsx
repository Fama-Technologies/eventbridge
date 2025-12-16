'use client';

import Image from 'next/image';
import { Sparkles } from 'lucide-react';

export default function BookingProcess() {
  const steps = [
    {
      number: 1,
      icon: '/icons/search-normal.svg',
      title: 'Discover Vendors',
      description: 'Browse through our extensive network of verified event professionals in your area.',
      color: 'bg-blue-100',
    },
    {
      number: 2,
      icon: '/icons/message-search.svg',
      title: 'Compare & Connect',
      description: 'View profiles, read reviews, and message vendors directly to find the perfect match.',
      color: 'bg-purple-100',
    },
    {
      number: 3,
      icon: '/icons/security.svg',
      title: 'Secure Booking',
      description: 'Book with confidence using our secure platform with verified partners and protected payments.',
      color: 'bg-green-100',
    },
    {
      number: 4,
      icon: null,
      title: 'Enjoy Your Event',
      description: 'Relax knowing everything is ready to go for your big day. We make it easy to get the party started.',
      color: 'bg-pink-100',
    },
  ];

  return (
    <section className="py-20 px-6 bg-background">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <p className="text-primary-01 font-semibold text-sm uppercase tracking-wider mb-3">
            THE PROCESS
          </p>
          <h2 className="text-5xl font-bold text-shades-black mb-4">
            Booking made <span className="text-shades-black">Simple</span>
          </h2>
          <p className="text-neutrals-07 text-lg max-w-2xl mx-auto">
            From initial discovery to the big day, we've streamlined event planning into
            <br />
            four effortless steps.
          </p>
        </div>

        {/* Steps Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step) => (
            <div
              key={step.number}
              className="relative flex flex-col items-center text-center group"
            >
              {/* Step Number Badge */}
              <div className="absolute -top-2 -left-2 w-8 h-8 bg-shades-black text-white rounded-full flex items-center justify-center text-sm font-bold z-10">
                {step.number}
              </div>

              {/* Icon Container */}
              <div
                className={`w-24 h-24 rounded-full ${step.color} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}
              >
                {step.icon ? (
                  <Image
                    src={step.icon}
                    alt={step.title}
                    width={40}
                    height={40}
                    className="w-10 h-10"
                  />
                ) : (
                  <Sparkles size={40} className="text-pink-500" strokeWidth={2} />
                )}
              </div>

              {/* Content */}
              <h3 className="text-xl font-bold text-shades-black mb-3">
                {step.title}
              </h3>
              <p className="text-neutrals-07 text-sm leading-relaxed">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
