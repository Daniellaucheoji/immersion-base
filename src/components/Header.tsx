'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState, useRef, useEffect } from 'react';
import { usePathname } from 'next/navigation';

type Experience = { name: string; slug: string };

`export default function Header({ experiences = [] }: { experiences: Experience[] }) {`
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [experiencesDropdownOpen, setExperiencesDropdownOpen] = useState(false);
  const [mobileExperiencesOpen, setMobileExperiencesOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

  const isActive = (path: string) => pathname === path;

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setExperiencesDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="w-full">
      {/* Announcement Banner */}
      <div className="bg-purple-600 text-white text-center py-2 text-[11px] sm:text-sm whitespace-nowrap">
        NEW EXPERIENCE IN PARTNERSHIP WITH VWB TICKETS LIVE NOW
      </div>

      {/* Navigation */}
      <nav className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
        <div className="flex items-center gap-8">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-8 h-10 flex items-center justify-center transition-transform duration-300 group-hover:scale-110">
              <Image
                src="/logo.png"
                alt="Immersion Logo"
                width={32}
                height={40}
                className="w-auto h-8"
              />
            </div>
            <span className="font-semibold text-lg tracking-wide transition-colors duration-200 group-hover:text-purple-600">
              IMMERSION
            </span>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-6">
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setExperiencesDropdownOpen(!experiencesDropdownOpen)}
                className={`nav-link flex items-center gap-1 ${pathname.startsWith('/experiences') ? 'text-purple-600' : 'text-gray-700'}`}
              >
                Experiences
                <svg
                  className={`w-4 h-4 transition-transform duration-200 ${experiencesDropdownOpen ? 'rotate-180' : ''}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {/* Dropdown Menu */}
              {experiencesDropdownOpen && (
                <div className="absolute top-full left-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-100 py-2 z-50">
                  <Link
                    href="/experiences"
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-purple-50 hover:text-purple-600 transition-colors"
                    onClick={() => setExperiencesDropdownOpen(false)}
                  >
                    All Experiences
                  </Link>
                  <div className="border-t border-gray-100 my-1"></div>
                  {experiences.map((exp) => (
                    <Link
                      key={exp.slug}
                      href={`/experiences/${exp.slug}`}
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-purple-50 hover:text-purple-600 transition-colors"
                      onClick={() => setExperiencesDropdownOpen(false)}
                    >
                      {exp.name}
                    </Link>
                  ))}
                </div>
              )}
            </div>
            <Link
              href="/book-us"
              className={`nav-link ${isActive('/book-us') ? 'text-purple-600' : 'text-gray-700'}`}
            >
              Book us
            </Link>
            <Link
              href="/shop"
              className={`nav-link ${isActive('/shop') ? 'text-purple-600' : 'text-gray-700'}`}
            >
              Shop
            </Link>
            <Link
              href="/about"
              className={`nav-link ${isActive('/about') ? 'text-purple-600' : 'text-gray-700'}`}
            >
              About
            </Link>
          </div>
        </div>

        {/* CTA Button */}
        <div className="flex items-center gap-4">
          <Link
            href="/tickets"
            className="hidden md:block btn-secondary bg-black text-white px-4 py-2 rounded-full text-sm font-medium"
          >
            Buy Tickets
          </Link>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 rounded-lg transition-colors duration-200 hover:bg-gray-100"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            <svg className="w-6 h-6 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {mobileMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>
      </nav>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-gray-100 bg-white mobile-menu">
          <div className="flex flex-col px-6 py-4 gap-1">
            {/* Experiences with submenu */}
            <div>
              <button
                onClick={() => setMobileExperiencesOpen(!mobileExperiencesOpen)}
                className={`w-full py-3 px-4 rounded-lg transition-all duration-200 hover:bg-purple-50 hover:text-purple-600 flex items-center justify-between text-left ${
                  pathname.startsWith('/experiences') ? 'bg-purple-50 text-purple-600' : 'text-gray-700'
                }`}
              >
                Experiences
                <svg
                  className={`w-4 h-4 transition-transform duration-200 ${mobileExperiencesOpen ? 'rotate-180' : ''}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {mobileExperiencesOpen && (
                <div className="ml-4 mt-1 space-y-1">
                  <Link
                    href="/experiences"
                    className="block py-2 px-4 text-sm text-gray-600 hover:text-purple-600 transition-colors"
                    onClick={() => { setMobileMenuOpen(false); setMobileExperiencesOpen(false); }}
                  >
                    All Experiences
                  </Link>
                  {experiences.map((exp) => (
                    <Link
                      key={exp.slug}
                      href={`/experiences/${exp.slug}`}
                      className="block py-2 px-4 text-sm text-gray-600 hover:text-purple-600 transition-colors"
                      onClick={() => { setMobileMenuOpen(false); setMobileExperiencesOpen(false); }}
                    >
                      {exp.name}
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* Other nav items */}
            {[
              { href: '/book-us', label: 'Book us' },
              { href: '/shop', label: 'Shop' },
              { href: '/about', label: 'About' },
            ].map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`py-3 px-4 rounded-lg transition-all duration-200 hover:bg-purple-50 hover:text-purple-600 ${
                  isActive(item.href) ? 'bg-purple-50 text-purple-600' : 'text-gray-700'
                }`}
                onClick={() => setMobileMenuOpen(false)}
              >
                {item.label}
              </Link>
            ))}
            <Link
              href="/tickets"
              className="mt-2 btn-secondary bg-black text-white px-4 py-3 rounded-full text-sm font-medium text-center"
              onClick={() => setMobileMenuOpen(false)}
            >
              Buy Tickets
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
