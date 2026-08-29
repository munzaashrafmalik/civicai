'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useSession, signOut } from 'next-auth/react';

interface NavbarProps {
  language?: 'en' | 'ur';
  onLanguageChange?: (lang: 'en' | 'ur') => void;
}

export default function Navbar({ language = 'en', onLanguageChange }: NavbarProps) {
  const router = useRouter();
  const pathname = router.pathname;
  const { data: session } = useSession();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const isAdmin = (session?.user as any)?.role === 'admin';

  useEffect(() => {
    document.documentElement.dir = language === 'ur' ? 'rtl' : 'ltr';
    document.documentElement.lang = language;
  }, [language]);

  const navLinks = [
    { href: '/', label: { en: 'Home', ur: 'ہوم' } },
    { href: '/report', label: { en: 'Report Issue', ur: 'مسئلہ رپورٹ کریں' } },
    { href: '/my-complaints', label: { en: 'My Complaints', ur: 'میری شکایات' } },
    { href: '/profile', label: { en: 'Profile', ur: 'پروفائل' } },
    ...(isAdmin ? [{ href: '/admin', label: { en: 'Admin', ur: 'ایڈمن' } }] : []),
  ];

  const t = (key: { en: string; ur: string }) => language === 'ur' ? key.ur : key.en;

  const handleLogout = () => {
    signOut({ callbackUrl: '/' });
  };

  const handleLanguageChange = (lang: 'en' | 'ur') => {
    onLanguageChange?.(lang);
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-b border-secondary-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center space-x-2 rtl:space-x-reverse" aria-label="CivicAI Home">
            <div className="w-8 h-8 rounded-lg bg-primary-600 flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <span className="text-xl font-bold text-secondary-900 hidden sm:block">CivicAI</span>
          </Link>

          <div className="hidden md:flex items-center space-x-1 rtl:space-x-reverse">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  pathname === link.href
                    ? 'bg-primary-50 text-primary-700'
                    : 'text-secondary-600 hover:bg-secondary-100 hover:text-secondary-900'
                }`}
              >
                {t(link.label)}
              </Link>
            ))}
          </div>

          <div className="hidden md:flex items-center space-x-4 rtl:space-x-reverse">
            <button
              onClick={() => handleLanguageChange(language === 'en' ? 'ur' : 'en')}
              className="px-3 py-1.5 text-sm font-medium rounded-lg bg-secondary-100 text-secondary-700 hover:bg-secondary-200 transition-colors"
              aria-label={language === 'en' ? 'Switch to Urdu' : 'انگریزی پر سوئچ کریں'}
            >
              {language === 'en' ? 'اردو' : 'English'}
            </button>

            {session?.user ? (
              <div className="flex items-center space-x-3 rtl:space-x-reverse">
                <Link
                  href="/profile"
                  className="px-3 py-1.5 text-sm font-medium rounded-lg text-secondary-600 hover:bg-secondary-100 hover:text-secondary-900 transition-colors"
                >
                  {session.user.name || t({ en: 'Profile', ur: 'پروفائل' })}
                </Link>
                <button
                  onClick={handleLogout}
                  className="px-3 py-1.5 text-sm font-medium rounded-lg text-danger-600 hover:bg-danger-50 transition-colors"
                >
                  {t({ en: 'Logout', ur: 'لاگ آؤٹ' })}
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-2 rtl:space-x-reverse">
                <Link
                  href="/login"
                  className="px-3 py-1.5 text-sm font-medium rounded-lg text-secondary-600 hover:bg-secondary-100 hover:text-secondary-900 transition-colors"
                >
                  {t({ en: 'Login', ur: 'لاگ ان' })}
                </Link>
                <Link
                  href="/register"
                  className="btn-primary text-sm"
                >
                  {t({ en: 'Sign Up', ur: 'سائن اپ' })}
                </Link>
              </div>
            )}
          </div>

          <button
            className="md:hidden p-2 rounded-lg text-secondary-600 hover:bg-secondary-100 transition-colors"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-expanded={isMenuOpen}
            aria-controls="mobile-menu"
            aria-label="Toggle menu"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {isMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {isMenuOpen && (
          <div id="mobile-menu" className="md:hidden py-4 border-t border-secondary-200 animate-slide-down">
            <div className="flex flex-col space-y-2">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`px-3 py-2 rounded-lg text-base font-medium ${
                    pathname === link.href
                      ? 'bg-primary-50 text-primary-700'
                      : 'text-secondary-600 hover:bg-secondary-100 hover:text-secondary-900'
                  }`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  {t(link.label)}
                </Link>
              ))}
              <div className="pt-2 border-t border-secondary-200 flex items-center justify-between">
                <button
                  onClick={() => handleLanguageChange(language === 'en' ? 'ur' : 'en')}
                  className="px-3 py-2 text-sm font-medium rounded-lg bg-secondary-100 text-secondary-700"
                >
                  {language === 'en' ? 'اردو' : 'English'}
                </button>
              </div>
              {session?.user ? (
                <div className="flex flex-col space-y-2 pt-2 border-t border-secondary-200">
                  <Link
                    href="/profile"
                    className="px-3 py-2 text-base font-medium rounded-lg text-secondary-600 hover:bg-secondary-100"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {t({ en: 'Profile', ur: 'پروفائل' })}
                  </Link>
                  <button
                    onClick={() => { handleLogout(); setIsMenuOpen(false); }}
                    className="px-3 py-2 text-base font-medium rounded-lg text-danger-600 hover:bg-danger-50"
                  >
                    {t({ en: 'Logout', ur: 'لاگ آؤٹ' })}
                  </button>
                </div>
              ) : (
                <div className="flex flex-col space-y-2 pt-2 border-t border-secondary-200">
                  <Link
                    href="/login"
                    className="px-3 py-2 text-base font-medium rounded-lg text-secondary-600 hover:bg-secondary-100"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {t({ en: 'Login', ur: 'لاگ ان' })}
                  </Link>
                  <Link
                    href="/register"
                    className="btn-primary text-center"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {t({ en: 'Sign Up', ur: 'سائن اپ' })}
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
