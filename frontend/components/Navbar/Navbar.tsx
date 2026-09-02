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
  const [isScrolled, setIsScrolled] = useState(false);

  const isAdmin = (session?.user as any)?.role === 'admin';

  useEffect(() => {
    document.documentElement.dir = language === 'ur' ? 'rtl' : 'ltr';
    document.documentElement.lang = language;
  }, [language]);

  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 10);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

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
    if (typeof window !== 'undefined') localStorage.setItem('civicai_lang', lang);
    onLanguageChange?.(lang);
  };

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ease-smooth ${isScrolled ? 'bg-white/90 backdrop-blur-xl shadow-soft border-b border-neutral-200/60' : 'bg-white/60 backdrop-blur-lg border-b border-transparent'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          <Link href="/" className="flex items-center space-x-3 rtl:space-x-reverse group" aria-label="CivicAI Home">
            <div className="relative">
              <img src="/logo.png" alt="CivicAI" className="w-14 h-14 rounded-xl object-contain shadow-soft transition-transform duration-300 group-hover:scale-105" />
              <div className="absolute -inset-1 bg-gradient-to-r from-secondary-500/20 to-accent-500/20 rounded-xl blur opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </div>
            <span className="text-xl font-bold hidden sm:block tracking-tight bg-gradient-to-r from-primary-800 to-primary-700 bg-clip-text text-transparent">CivicAI</span>
          </Link>

          <div className="hidden md:flex items-center space-x-1 rtl:space-x-reverse">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`relative px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                  pathname === link.href
                    ? 'bg-secondary-50 text-secondary-700'
                    : 'text-neutral-600 hover:bg-neutral-100/80 hover:text-neutral-900'
                }`}
              >
                {t(link.label)}
                {pathname === link.href && (
                  <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-5 h-0.5 bg-gradient-to-r from-secondary-500 to-accent-500 rounded-full" />
                )}
              </Link>
            ))}
          </div>

          <div className="hidden md:flex items-center space-x-3 rtl:space-x-reverse">
            <button
              onClick={() => handleLanguageChange(language === 'en' ? 'ur' : 'en')}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-neutral-100 text-neutral-600 hover:bg-neutral-200 hover:text-neutral-800 transition-all duration-200 border border-neutral-200/50"
              aria-label={language === 'en' ? 'Switch to Urdu' : 'انگریزی پر سوئچ کریں'}
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {language === 'en' ? 'اردو' : 'English'}
            </button>

            {session?.user ? (
              <div className="flex items-center space-x-2 rtl:space-x-reverse">
                <Link
                  href="/profile"
                  className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-xl text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900 transition-all duration-200"
                >
                  <div className="w-7 h-7 rounded-full bg-gradient-to-br from-secondary-500 to-accent-500 flex items-center justify-center text-white text-xs font-bold">
                    {(session.user.name || 'U')[0].toUpperCase()}
                  </div>
                  <span className="max-w-[100px] truncate">{session.user.name || t({ en: 'Profile', ur: 'پروفائل' })}</span>
                </Link>
                <button
                  onClick={handleLogout}
                  className="px-3 py-1.5 text-sm font-medium rounded-xl text-danger-600 hover:bg-danger-50 transition-all duration-200"
                >
                  {t({ en: 'Logout', ur: 'لاگ آؤٹ' })}
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-2 rtl:space-x-reverse">
                <Link
                  href="/login"
                  className="px-4 py-2 text-sm font-medium rounded-xl text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900 transition-all duration-200"
                >
                  {t({ en: 'Login', ur: 'لاگ ان' })}
                </Link>
                <Link
                  href="/register"
                  className="bg-gradient-to-r from-secondary-600 to-secondary-500 text-white px-4 py-2 text-sm font-semibold rounded-xl shadow-sm hover:shadow-md hover:shadow-secondary-500/20 transition-all duration-200"
                >
                  {t({ en: 'Sign Up', ur: 'سائن اپ' })}
                </Link>
              </div>
            )}
          </div>

          <button
            className="md:hidden p-2 rounded-xl text-neutral-500 hover:bg-neutral-100 transition-all duration-200"
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
          <div id="mobile-menu" className="md:hidden py-4 border-t border-neutral-200/60 animate-slide-down">
            <div className="flex flex-col space-y-1">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`px-4 py-2.5 rounded-xl text-base font-medium transition-all duration-200 ${
                    pathname === link.href
                      ? 'bg-secondary-50 text-secondary-700'
                      : 'text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900'
                  }`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  {t(link.label)}
                </Link>
              ))}
              <div className="pt-3 mt-2 border-t border-neutral-200/60 flex items-center justify-between">
                <button
                  onClick={() => handleLanguageChange(language === 'en' ? 'ur' : 'en')}
                  className="flex items-center gap-1.5 px-3 py-2 text-sm font-semibold rounded-lg bg-neutral-100 text-neutral-600 border border-neutral-200/50"
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {language === 'en' ? 'اردو' : 'English'}
                </button>
              </div>
              {session?.user ? (
                <div className="flex flex-col space-y-1 pt-3 mt-2 border-t border-neutral-200/60">
                  <Link
                    href="/profile"
                    className="px-4 py-2.5 text-base font-medium rounded-xl text-neutral-600 hover:bg-neutral-100 transition-all duration-200"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {t({ en: 'Profile', ur: 'پروفائل' })}
                  </Link>
                  <button
                    onClick={() => { handleLogout(); setIsMenuOpen(false); }}
                    className="px-4 py-2.5 text-base font-medium rounded-xl text-danger-600 hover:bg-danger-50 transition-all duration-200 text-start"
                  >
                    {t({ en: 'Logout', ur: 'لاگ آؤٹ' })}
                  </button>
                </div>
              ) : (
                <div className="flex flex-col space-y-2 pt-3 mt-2 border-t border-neutral-200/60">
                  <Link
                    href="/login"
                    className="px-4 py-2.5 text-base font-medium rounded-xl text-neutral-600 hover:bg-neutral-100 transition-all duration-200 text-center border border-neutral-200"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {t({ en: 'Login', ur: 'لاگ ان' })}
                  </Link>
                  <Link
                    href="/register"
                    className="bg-gradient-to-r from-secondary-600 to-secondary-500 text-white px-4 py-2.5 text-base font-semibold rounded-xl text-center shadow-sm"
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
