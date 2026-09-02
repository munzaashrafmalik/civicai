'use client';

import React from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar/Navbar';
import ScrollReveal from '@/components/ScrollReveal/ScrollReveal';
import { getStoredLanguage } from '@/lib/i18n';

const t = (key: { en: string; ur: string }, lang: 'en' | 'ur') => lang === 'ur' ? key.ur : key.en;

export default function UnauthorizedPage() {
  const [language, setLanguage] = React.useState<'en' | 'ur'>(getStoredLanguage);

  return (
    <div className="min-h-screen bg-neutral-50">
      <Navbar language={language} onLanguageChange={setLanguage} />

      <main className="pt-16 flex items-center justify-center min-h-screen">
        <div className="absolute inset-0 -z-10 overflow-hidden" aria-hidden="true">
          <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-danger-100/30 blur-3xl" />
          <div className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full bg-warning-100/20 blur-3xl" />
        </div>

        <div className="w-full max-w-md mx-auto px-4 sm:px-6">
          <ScrollReveal animation="animate-bounce-in">
            <div className="bg-white rounded-2xl shadow-card border border-neutral-200/80 overflow-hidden text-center">
              <div className="h-1 bg-gradient-to-r from-warning-500 via-danger-500 to-warning-500" />
              <div className="p-10">
                <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-warning-50 to-danger-50 flex items-center justify-center border-2 border-warning-200/50">
                  <svg className="w-10 h-10 text-warning-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>

                <h1 className="text-2xl font-bold text-neutral-900 mb-2">
                  {t({ en: 'Access Denied', ur: 'رسائی مسترد' }, language)}
                </h1>
                <p className="text-neutral-500 mb-2 leading-relaxed">
                  {t({
                    en: 'You do not have permission to view this page. This area is restricted to administrators.',
                    ur: 'آپ کو اس صفحے کو دیکھنے کی اجازت نہیں ہے۔ یہ حصہ صرف انتظامیہ کے لیے ہے۔'
                  }, language)}
                </p>

                <div className="flex flex-col sm:flex-row gap-3 justify-center mt-8">
                  <Link href="/" className="btn-primary flex items-center justify-center gap-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                    </svg>
                    {t({ en: 'Go to Home', ur: 'ہوم پر جائیں' }, language)}
                  </Link>
                  <Link href="/login" className="btn-outline flex items-center justify-center gap-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                    {t({ en: 'Login as Admin', ur: 'ایڈمن لاگ ان' }, language)}
                  </Link>
                </div>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </main>
    </div>
  );
}
