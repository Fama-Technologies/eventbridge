'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Instagram, MessageCircle, X } from 'lucide-react';
import { useTheme } from '@/providers/theme-provider';
import { Sun } from 'lucide-react';

export default function CategoryFooter() {
  const { resolvedTheme, setTheme } = useTheme();

  const toggleTheme = () => {
    setTheme(resolvedTheme === 'dark' ? 'light' : 'dark');
  };

  return (
    <footer className="bg-[#222222] text-white">
      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8">
          {/* For Customers */}
          <div>
            <h4 className="text-white/50 text-xs font-medium uppercase tracking-wider mb-4">
              For Customers
            </h4>
            <ul className="space-y-3">
              <li>
                <Link href="/find-vendors" className="text-white/80 hover:text-primary-01 transition-colors text-sm">
                  Find vendors
                </Link>
              </li>
              <li>
                <Link href="/budget-tools" className="text-white/80 hover:text-primary-01 transition-colors text-sm">
                  Budget tools
                </Link>
              </li>
              <li>
                <Link href="/my-events" className="text-white/80 hover:text-primary-01 transition-colors text-sm">
                  My Events
                </Link>
              </li>
              <li>
                <Link href="/success-stories" className="text-white/80 hover:text-primary-01 transition-colors text-sm">
                  Success Sories
                </Link>
              </li>
            </ul>
          </div>

          {/* For Providers */}
          <div>
            <h4 className="text-white/50 text-xs font-medium uppercase tracking-wider mb-4">
              For Providers
            </h4>
            <ul className="space-y-3">
              <li>
                <Link href="/list-business" className="text-white/80 hover:text-primary-01 transition-colors text-sm">
                  List your business
                </Link>
              </li>
              <li>
                <Link href="/vendor/dashboard" className="text-white/80 hover:text-primary-01 transition-colors text-sm">
                  Provider Dashboard
                </Link>
              </li>
              <li>
                <Link href="/vendor/earnings" className="text-white/80 hover:text-primary-01 transition-colors text-sm">
                  Bookings & Earnings
                </Link>
              </li>
              <li>
                <Link href="/guidelines" className="text-white/80 hover:text-primary-01 transition-colors text-sm">
                  Guidelines
                </Link>
              </li>
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h4 className="text-white/50 text-xs font-medium uppercase tracking-wider mb-4">
              Categories
            </h4>
            <ul className="space-y-3">
              <li>
                <Link href="/category/decor" className="text-white/80 hover:text-primary-01 transition-colors text-sm">
                  Decor & Styling
                </Link>
              </li>
              <li>
                <Link href="/category/catering" className="text-white/80 hover:text-primary-01 transition-colors text-sm">
                  Premium Catering
                </Link>
              </li>
              <li>
                <Link href="/category/djs" className="text-white/80 hover:text-primary-01 transition-colors text-sm">
                  Professional Djs
                </Link>
              </li>
              <li>
                <Link href="/category/photography" className="text-white/80 hover:text-primary-01 transition-colors text-sm">
                  Protography
                </Link>
              </li>
              <li>
                <Link href="/category/venues" className="text-white/80 hover:text-primary-01 transition-colors text-sm">
                  Venues
                </Link>
              </li>
            </ul>
          </div>

          {/* Info */}
          <div>
            <h4 className="text-white/50 text-xs font-medium uppercase tracking-wider mb-4">
              Info
            </h4>
            <ul className="space-y-3">
              <li>
                <Link href="/about" className="text-white/80 hover:text-primary-01 transition-colors text-sm">
                  About Event Bridge
                </Link>
              </li>
              <li>
                <Link href="/help" className="text-white/80 hover:text-primary-01 transition-colors text-sm">
                  Help Center/ FAQ
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-white/80 hover:text-primary-01 transition-colors text-sm">
                  Contact Support
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="text-white/80 hover:text-primary-01 transition-colors text-sm">
                  Privacy & Policies
                </Link>
              </li>
            </ul>
          </div>

          {/* Logo and Contact */}
          <div className="col-span-2 md:col-span-1 flex flex-col items-center md:items-end">
            <div className="flex flex-col items-center mb-6">
              <Image src="/logo.svg" alt="Event Bridge" width={80} height={80} />
              <span className="text-primary-01 font-bold text-lg mt-2">EVENT BRIDGE</span>
            </div>
            <div className="text-right text-sm text-white/60">
              <p>+1 981 981-23-19</p>
              <p>hello@logoipsum.com</p>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-white/10">
        <div className="max-w-7xl mx-auto px-6 py-4 flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Social Links */}
          <div className="flex items-center gap-8">
            <Link href="https://instagram.com" className="flex items-center gap-2 text-white/60 hover:text-white transition-colors text-sm">
              Instagram
              <Instagram size={16} />
            </Link>
            <Link href="https://whatsapp.com" className="flex items-center gap-2 text-white/60 hover:text-white transition-colors text-sm">
              Whatsapp
              <MessageCircle size={16} />
            </Link>
            <Link href="https://x.com" className="flex items-center gap-2 text-white/60 hover:text-white transition-colors text-sm">
              <X size={16} />
            </Link>
          </div>

          {/* Copyright */}
          <p className="text-white/40 text-xs">
            © 2025 Event Bridge. All rights reserved.
          </p>

          {/* Dark Mode Toggle */}
          <button
            onClick={toggleTheme}
            className="flex items-center gap-2 text-white/60 hover:text-white transition-colors"
          >
            <Sun size={16} className="text-primary-01" />
            <span className="text-sm">Dark mode</span>
            <div className={`w-5 h-5 rounded-full flex items-center justify-center transition-colors ${
              resolvedTheme === 'dark' ? 'bg-primary-01' : 'bg-white/20'
            }`}>
              {resolvedTheme === 'dark' && (
                <span className="text-white text-xs">✓</span>
              )}
            </div>
          </button>
        </div>
      </div>
    </footer>
  );
}
