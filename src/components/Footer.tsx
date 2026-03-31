'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';

type SocialLink = {
  platform: 'twitter' | 'instagram' | 'linkedin' | 'youtube' | 'tiktok';
  url: string;
};

type SiteSettings = {
  privacyPolicyUrl?: string;
  termsUrl?: string;
  footerAboutLabel?: string;
  footerAboutUrl?: string;
  footerBookLabel?: string;
  footerBookUrl?: string;
  footerPrivacyLabel?: string;
  footerTermsLabel?: string;
  socialLinks?: SocialLink[];
};

function SocialIcon({ platform }: { platform: SocialLink['platform'] }) {
  if (platform === 'twitter') {
    return (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
      </svg>
    );
  }
  if (platform === 'instagram') {
    return (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
      </svg>
    );
  }
  if (platform === 'linkedin') {
    return (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
      </svg>
    );
  }
  if (platform === 'youtube') {
    return (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
        <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
      </svg>
    );
  }
  return (
    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
      <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1v-3.5a6.37 6.37 0 00-.79-.05A6.34 6.34 0 003.15 15.2a6.34 6.34 0 0010.86 4.48v-7.15a8.16 8.16 0 005.58 2.2v-3.46a4.85 4.85 0 01-4-.58z"/>
    </svg>
  );
}

export default function Footer({ siteSettings }: { siteSettings?: SiteSettings }) {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const termsUrl = siteSettings?.termsUrl || '/terms';
  const privacyUrl = siteSettings?.privacyPolicyUrl || '/privacy';
  const fallbackSocialLinks: SocialLink[] = [
    { platform: 'twitter', url: 'https://twitter.com' },
    { platform: 'instagram', url: 'https://instagram.com' },
    { platform: 'linkedin', url: 'https://linkedin.com' },
    { platform: 'youtube', url: 'https://youtube.com' },
    { platform: 'tiktok', url: 'https://tiktok.com/@immersionco' },
  ];
  const socialLinks: SocialLink[] =
    siteSettings?.socialLinks && siteSettings.socialLinks.length > 0
      ? siteSettings.socialLinks
      : fallbackSocialLinks;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    // TODO: Integrate with Sanity or email service
    await new Promise(resolve => setTimeout(resolve, 500));
    console.log('Email submitted:', email);
    setEmail('');
    setIsSubmitting(false);
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 3000);
  };

  return (
    <footer className="w-full bg-white border-t border-gray-200">
      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Social Links */}
        <div className="flex items-center gap-4 mb-6">
          <span className="text-gray-500 text-sm">Follow us</span>
          <div className="flex items-center gap-4">
            {socialLinks.map((social) => (
              <a key={social.platform} href={social.url} target="_blank" rel="noopener noreferrer" className="social-icon text-gray-600">
                <SocialIcon platform={social.platform} />
              </a>
            ))}
          </div>
        </div>

        {/* Email Signup - Full Width */}
        <form onSubmit={handleSubmit} className="mb-6">
          <div className="flex gap-2">
            <div className="flex-1 flex items-center gap-2 border border-gray-300 rounded-lg px-4 py-2 transition-all duration-300 focus-within:border-purple-500 focus-within:ring-2 focus-within:ring-purple-100">
              <svg className="w-5 h-5 text-gray-400 flex-shrink-0 transition-colors duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Sign up for updates on our latest innovations"
                className="flex-1 outline-none text-sm bg-transparent"
              />
            </div>
            <button
              type="submit"
              disabled={isSubmitting}
              className={`btn-primary bg-purple-600 text-white px-6 py-2 rounded-lg text-sm font-medium transition-all duration-300 flex-shrink-0 ${
                submitted ? 'bg-green-500' : ''
              } ${isSubmitting ? 'opacity-70 cursor-not-allowed' : ''}`}
            >
              {submitted ? (
                <span className="flex items-center gap-1">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Done
                </span>
              ) : isSubmitting ? (
                <span className="flex items-center gap-1">
                  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                </span>
              ) : (
                'Sign up'
              )}
            </button>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            By proceeding, I accept Immersion&apos;s{' '}
            <Link href={termsUrl} className="underline hover:text-purple-600 transition-colors">Terms & Conditions</Link> and{' '}
            <Link href={privacyUrl} className="underline hover:text-purple-600 transition-colors">Privacy Policy</Link>, and I understand that media from this social experience may be captured for promotional use.
          </p>
        </form>

        {/* Footer Links */}
        <div className="flex flex-col sm:flex-row items-center justify-between pt-6 border-t border-gray-200 gap-4">
          <div className="flex items-center gap-2 group">
            <div className="w-6 h-8 transition-transform duration-300 group-hover:scale-110">
              <Image
                src="/logo.png"
                alt="Immersion Logo"
                width={24}
                height={32}
                className="w-auto h-6"
              />
            </div>
          </div>
          <div className="flex items-center gap-6 text-sm text-gray-600">
            <Link href={siteSettings?.footerAboutUrl || '/about'} className="hover:text-purple-600 transition-colors duration-200">{siteSettings?.footerAboutLabel || 'About Immersion'}</Link>
            <Link href={siteSettings?.footerBookUrl || '/book-us'} className="hover:text-purple-600 transition-colors duration-200">{siteSettings?.footerBookLabel || 'Book an Activation'}</Link>
            <Link href={privacyUrl} className="hover:text-purple-600 transition-colors duration-200">{siteSettings?.footerPrivacyLabel || 'Privacy'}</Link>
            <Link href={termsUrl} className="hover:text-purple-600 transition-colors duration-200">{siteSettings?.footerTermsLabel || 'Terms'}</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
