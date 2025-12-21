'use client';

import Image from 'next/image';
import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-shades-white text-shades-black">
      {/* CTA Section */}
      {/* background: linear-gradient(90deg, #222222 36.07%, #CB5E21 71.72%); */}

      <div className="max-w-7xl mx-auto px-6 pt-12">
        <div className="relative overflow-hidden rounded-2xl mb-16 flex bg-gradient-to-r from-[#222222] via-[#3d2f1f] to-[#CB5E21] ">
          {/* Left side - Gradient background with text */}
          <div className="flex-1 p-8 md:p-10">
            <h3 className="text-2xl md:text-3xl font-bold text-white mb-3">
              Planning an Event
            </h3>
            <p className="text-white text-sm leading-relaxed max-w-md">
              Connect with trusted service providers seamlessly to make your vision a
              reality. From intimate gatherings to grand celebrations
            </p>
          </div>

          {/* Right side - Animated gradient button area */}
          <div className="bg-[#CB5E21] shadow-[0px_4px_40px_0px_rgba(0,0,0,0.4)]  rounded-l-[40px] flex justify-center items-center">
            <Link
              href="/get-started"
              className="group relative flex items-center justify-center px-12 md:px-20 min-w-[200px] md:min-w-[280px] overflow-hidden"
            >
              {/* Animated gradient background */}

              <span className="relative flex items-center gap-6 text-white font-semibold text-lg whitespace-nowrap">
                Get Started <span className="text-2xl transition-transform group-hover:translate-x-1 animate-bounce">→</span>
              </span>
            </Link>
          </div>
        </div>
      </div>

      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 md:gap-12 pb-16">
          {/* For Customers */}
          <div>
            <h4 className="text-neutrals-07 text-xs font-medium uppercase tracking-wider mb-6">
              For Customers
            </h4>
            <ul className="space-y-4">
              <li>
                <Link href="/find-vendors" className="text-shades-black hover:text-primary-01 transition-colors text-sm">
                  Find vendors
                </Link>
              </li>
              <li>
                <Link href="/budget-tools" className="text-shades-black hover:text-primary-01 transition-colors text-sm">
                  Budget tools
                </Link>
              </li>
              <li>
                <Link href="/my-events" className="text-shades-black hover:text-primary-01 transition-colors text-sm">
                  My Events
                </Link>
              </li>
              <li>
                <Link href="/success-stories" className="text-shades-black hover:text-primary-01 transition-colors text-sm">
                  Success Sories
                </Link>
              </li>
            </ul>
          </div>

          {/* For Providers */}
          <div>
            <h4 className="text-neutrals-07 text-xs font-medium uppercase tracking-wider mb-6">
              For Providers
            </h4>
            <ul className="space-y-4">
              <li>
                <Link href="/list-business" className="text-shades-black hover:text-primary-01 transition-colors text-sm">
                  List your business
                </Link>
              </li>
              <li>
                <Link href="/provider-dashboard" className="text-shades-black hover:text-primary-01 transition-colors text-sm">
                  Provider Dashboard
                </Link>
              </li>
              <li>
                <Link href="/bookings-earnings" className="text-shades-black hover:text-primary-01 transition-colors text-sm">
                  Bookings & Earnings
                </Link>
              </li>
              <li>
                <Link href="/guidelines" className="text-shades-black hover:text-primary-01 transition-colors text-sm">
                  Guidelines
                </Link>
              </li>
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h4 className="text-neutrals-07 text-xs font-medium uppercase tracking-wider mb-6">
              Categories
            </h4>
            <ul className="space-y-4">
              <li>
                <Link href="/category/decor-styling" className="text-shades-black hover:text-primary-01 transition-colors text-sm">
                  Decor & Styling
                </Link>
              </li>
              <li>
                <Link href="/category/catering" className="text-shades-black hover:text-primary-01 transition-colors text-sm">
                  Premium Catering
                </Link>
              </li>
              <li>
                <Link href="/category/djs" className="text-shades-black hover:text-primary-01 transition-colors text-sm">
                  Professional Djs
                </Link>
              </li>
              <li>
                <Link href="/category/photography" className="text-shades-black hover:text-primary-01 transition-colors text-sm">
                  Protography
                </Link>
              </li>
              <li>
                <Link href="/category/venues" className="text-shades-black hover:text-primary-01 transition-colors text-sm">
                  Venues
                </Link>
              </li>
            </ul>
          </div>

          {/* Info */}
          <div>
            <h4 className="text-neutrals-07 text-xs font-medium uppercase tracking-wider mb-6">
              Info
            </h4>
            <ul className="space-y-4">
              <li>
                <Link href="/about" className="text-shades-black hover:text-primary-01 transition-colors text-sm">
                  About Event Bridge
                </Link>
              </li>
              <li>
                <Link href="/faq" className="text-shades-black hover:text-primary-01 transition-colors text-sm">
                  Help Center/ FAQ
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-shades-black hover:text-primary-01 transition-colors text-sm">
                  Contact Support
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="text-shades-black hover:text-primary-01 transition-colors text-sm">
                  Privacy & Policies
                </Link>
              </li>
            </ul>
          </div>

          {/* Logo Section */}
          <div className="col-span-2 md:col-span-1 flex flex-col items-center md:items-end">
            <div className="mb-4">
              <Image
                src="/logo.svg"
                alt="Event Bridge Logo"
                width={120}
                height={120}
                className="w-24 h-24 md:w-28 md:h-28"
              />
            </div>
            <h3 className="text-lg font-bold text-primary-01 mb-6">EVENT BRIDGE</h3>
            <div className="w-12 h-[2px] bg-neutrals-07 mb-6" />
            <div className="text-right text-sm text-neutrals-07">
              <p className="mb-1">+1 981 981-23-19</p>
              <p>hello@logoipsum.com</p>
            </div>
          </div>
        </div>

        {/* Social Links Row */}
        <div className="border-t border-neutrals-07/30 py-8">
          <div className="flex flex-wrap items-center justify-between gap-6">
            <div className="flex items-center gap-12">
              {/* Instagram */}
              <div className="flex items-center gap-4">
                <span className="text-sm text-neutrals-07">Instagram</span>
                <Link href="#" className="text-primary-01 hover:opacity-80 transition">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
                  </svg>
                </Link>
              </div>

              {/* Whatsapp */}
              <div className="flex items-center gap-4">
                <span className="text-sm text-neutrals-07">Whatsapp</span>
                <Link href="#" className="text-primary-01 hover:opacity-80 transition">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                  </svg>
                </Link>
              </div>

              {/* X */}
              <div className="flex items-center gap-4">
                <span className="text-sm text-neutrals-07">X</span>
                <Link href="#" className="text-primary-01 hover:opacity-80 transition">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                  </svg>
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Copyright Row */}
        <div className="border-t border-neutrals-07/30 py-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <p className="text-xs text-neutrals-07">
              © 2025 Event Bridge. All rights reserved.
            </p>

            {/* Dark Mode Toggle */}
            <div className="flex items-center gap-3">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="text-primary-01">
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <span className="text-sm text-neutrals-07">Dark mode</span>
              <div className="w-6 h-6 rounded-full bg-primary-01 flex items-center justify-center">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                  <path d="M5 12l5 5L20 7" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
