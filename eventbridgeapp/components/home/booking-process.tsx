'use client';

import Image from 'next/image';

export default function BookingProcess() {
  const steps = [
    {
      number: 1,
      icon: '/icons/search-normal.svg',
      title: 'Discover Vendors',
      description: 'Browse thousands of verified event pros tailored to your specific needs.',
      bgColor: 'bg-blue-100',
      iconBg: 'bg-blue-200',
    },
    {
      number: 2,
      icon: '/icons/message-search.svg',
      title: 'Compare & Connect',
      description: 'Check reviews, availability, and chat directly with vendors in real-time.',
      bgColor: 'bg-purple-100',
      iconBg: 'bg-purple-200',
    },
    {
      number: 3,
      icon: '/icons/security.svg',
      title: 'Secure Booking',
      description: 'Pay safely through our protected platform with zero hidden fees.',
      bgColor: 'bg-green-100',
      iconBg: 'bg-green-200',
    },
    {
      number: 4,
      icon: 'icons/confetti.svg',
      title: 'Enjoy Your Event',
      description: 'Relax knowing your team is ready to go for your big event.',
      bgColor: 'bg-pink-100',
      iconBg: 'bg-pink-200',
    },
  ];

  return (
    <section className="py-16 px-6 bg-background">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-14">
          <p className="text-primary-01 font-semibold text-[24px] uppercase tracking-wider mb-3">
            THE PROCESS
          </p>
          <h2 className="text-[64px] font-bold text-shades-black mb-4">
            Booking made Simple
          </h2>
          <p className="text-neutrals-06 text-base max-w-xl mx-auto">
            From initial discovery to the big day, we&apos;ve streamlined event planning into four effortless steps.
          </p>
        </div>

        {/* Steps Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step) => (
            <div
              key={step.number}
              className="relative flex flex-col items-center text-center"
            >
              {/* Icon Container with Number Badge */}
              <div className="relative mb-6">
                <div
                  className={`w-18 h-18 rounded-full ${step.bgColor} flex items-center justify-center`}
                >
                  <div className={`w-16 h-16 rounded-full  flex items-center justify-center`}>
                    <Image
                      src={step.icon}
                      alt={step.title}
                      width={32}
                      height={32}
                      className="w-8 h-8"
                    />
                  </div>
                </div>
                
                {/* Number Badge - positioned at top right */}
                <div className="absolute -top-1 -right-1 w-7 h-7 bg-primary-01 text-white rounded-full flex items-center justify-center text-sm font-bold">
                  {step.number}
                </div>
              </div>

              {/* Content */}
              <h3 className="text-lg font-bold text-shades-black mb-2">
                {step.title}
              </h3>
              <p className="text-neutrals-06 text-sm leading-relaxed max-w-[200px]">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
