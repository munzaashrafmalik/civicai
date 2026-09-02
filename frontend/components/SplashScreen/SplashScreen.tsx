'use client';

import React, { useEffect, useState } from 'react';
import { getStoredLanguage } from '@/lib/i18n';

const t = (key: { en: string; ur: string }, lang: 'en' | 'ur') => lang === 'ur' ? key.ur : key.en;

interface SplashScreenProps {
  onComplete?: () => void;
}

export default function SplashScreen({ onComplete }: SplashScreenProps) {
  const [progress, setProgress] = useState(0);
  const [fadeOut, setFadeOut] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [language, setLanguage] = useState<'en' | 'ur'>('en');

  useEffect(() => {
    setLanguage(getStoredLanguage());
  }, []);

  useEffect(() => {
    const startTime = Date.now();
    const minDuration = 2400;

    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const pct = Math.min((elapsed / minDuration) * 100, 100);
      setProgress(pct);

      if (pct >= 100) {
        clearInterval(interval);
        setFadeOut(true);
        setTimeout(() => {
          setHidden(true);
          onComplete?.();
        }, 600);
      }
    }, 30);

    return () => clearInterval(interval);
  }, [onComplete]);

  if (hidden) return null;

  return (
    <div
      className={`fixed inset-0 z-[9999] flex flex-col items-center justify-center transition-opacity duration-500 ${
        fadeOut ? 'opacity-0' : 'opacity-100'
      }`}
      style={{
        background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 40%, #0c4a6e 100%)',
      }}
      role="status"
      aria-label={t({ en: 'Loading', ur: 'لوڈ ہو رہا ہے' }, language)}
    >
      {/* Ambient glow effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div
          className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full opacity-20 blur-3xl"
          style={{ background: 'radial-gradient(circle, #06b6d4, transparent 70%)' }}
        />
        <div
          className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full opacity-15 blur-3xl"
          style={{ background: 'radial-gradient(circle, #3b82f6, transparent 70%)' }}
        />
      </div>

      {/* Logo and branding */}
      <div className="relative flex flex-col items-center animate-fade-in">
        {/* Logo container with glow */}
        <div className="relative mb-8">
          <div
            className="absolute inset-0 rounded-full blur-2xl opacity-40 animate-ai-pulse"
            style={{ background: 'radial-gradient(circle, #06b6d4, transparent 70%)' }}
          />
          <div className="relative w-32 h-32 sm:w-40 sm:h-40 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center shadow-2xl">
            <img
              src="/logo.png"
              alt="CivicAI Logo"
              className="w-24 h-24 sm:w-32 sm:h-32 object-contain drop-shadow-lg"
            />
          </div>
        </div>

        {/* Brand name */}
        <h1 className="text-4xl sm:text-5xl font-bold tracking-tight mb-2">
          <span
            className="bg-clip-text text-transparent"
            style={{
              backgroundImage: 'linear-gradient(135deg, #ffffff 0%, #06b6d4 50%, #3b82f6 100%)',
            }}
          >
            CivicAI
          </span>
        </h1>
        <p className="text-neutral-400 text-sm sm:text-base tracking-wide">
          {t({ en: 'Smart Complaints for Smart Cities', ur: 'سمارٹ شہروں کے لیے سمارٹ شکایات' }, language)}
        </p>
      </div>

      {/* Loading bar */}
      <div className="absolute bottom-16 sm:bottom-20 left-1/2 -translate-x-1/2 w-64 sm:w-80">
        <div className="h-1 rounded-full bg-white/10 overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-100 ease-linear"
            style={{
              width: `${progress}%`,
              background: 'linear-gradient(90deg, #06b6d4, #3b82f6, #06b6d4)',
              backgroundSize: '200% 100%',
              animation: 'shimmer 1.5s linear infinite',
            }}
          />
        </div>
        <p className="text-center text-neutral-500 text-xs mt-3 tracking-widest uppercase">
          {t({ en: 'Loading', ur: 'لوڈ ہو رہا ہے' }, language)}
        </p>
      </div>
    </div>
  );
}
