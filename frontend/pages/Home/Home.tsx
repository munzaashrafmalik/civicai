'use client';

import React, { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar/Navbar';
import ScrollReveal from '@/components/ScrollReveal/ScrollReveal';
import Card3D from '@/components/Card3D/Card3D';
import { getStoredLanguage } from '@/lib/i18n';

const t = (key: { en: string; ur: string }, lang: 'en' | 'ur') => lang === 'ur' ? key.ur : key.en;

function AnimatedCounter({ target, duration = 2000 }: { target: number | null; duration?: number }) {
  const [count, setCount] = useState(0);
  const [hasAnimated, setHasAnimated] = useState(false);
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (target === null || hasAnimated) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated) {
          setHasAnimated(true);
          const startTime = Date.now();
          const animate = () => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            setCount(Math.floor(eased * target));
            if (progress < 1) requestAnimationFrame(animate);
          };
          requestAnimationFrame(animate);
        }
      },
      { threshold: 0.5 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [target, duration, hasAnimated]);

  return <span ref={ref}>{target !== null ? count : '—'}</span>;
}

export default function HomePage() {
  const [language, setLanguage] = React.useState<'en' | 'ur'>(getStoredLanguage);
  const [stats, setStats] = React.useState<{ totalComplaints: number; totalOrganizations: number } | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [complaintsRes, orgsRes] = await Promise.all([
          fetch('/api/complaints?limit=1'),
          fetch('/api/organizations'),
        ]);
        const complaintsData = await complaintsRes.json();
        const orgsData = await orgsRes.json();
        if (complaintsData.success && orgsData.success) {
          setStats({
            totalComplaints: complaintsData.pagination?.total ?? 0,
            totalOrganizations: (orgsData.data || []).length,
          });
        }
      } catch (err) {
        console.error('Failed to fetch stats:', err);
      }
    };
    fetchStats();
  }, []);

  const aiProcessSteps = [
    {
      icon: (
        <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      ),
      label: { en: 'Photo / Voice / Text', ur: 'تصویر / آواز / ٹیکسٹ' },
    },
    {
      icon: (
        <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.734-.988-2.386l-.548-.547z" />
        </svg>
      ),
      label: { en: 'AI Analysis', ur: 'اے آئی تجزیہ' },
    },
    {
      icon: (
        <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      ),
      label: { en: 'Issue Detection', ur: 'مسئلے کی شناخت' },
    },
    {
      icon: (
        <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
      label: { en: 'Complaint Generation', ur: 'شکایت کی تخلیق' },
    },
    {
      icon: (
        <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
        </svg>
      ),
      label: { en: 'Relevant Organization', ur: 'متعلقہ ادارہ' },
    },
    {
      icon: (
        <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
      ),
      label: { en: 'Complaint Tracking', ur: 'شکایت کی نگرانی' },
    },
  ];

  const features = [
    {
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      ),
      title: { en: 'Photo Upload', ur: 'تصویر اپ لوڈ' },
      description: { en: 'Snap a photo of the issue and let AI identify it automatically', ur: 'مسئلے کی تصویر کھینچیں اور اے آئی اسے خود بخود شناخت کرے گا' },
    },
    {
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6m0 0z" />
        </svg>
      ),
      title: { en: 'Voice Input', ur: 'آواز ان پٹ' },
      description: { en: 'Describe the issue in Urdu or English using voice recognition', ur: 'مسئلے کو اردو یا انگریزی میں آواز سے بیان کریں' },
    },
    {
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.734-.988-2.386l-.548-.547z" />
        </svg>
      ),
      title: { en: 'AI Analysis', ur: 'اے آئی تجزیہ' },
      description: { en: 'AI classifies, generates complaint & routes to the right organization', ur: 'اے آئی درجہ بندی کرتا ہے، شکایت بناتا ہے اور متعلقہ ادارے تک پہنچاتا ہے' },
    },
    {
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z" />
        </svg>
      ),
      title: { en: 'Location Auto-Detect', ur: 'خودکار مقام' },
      description: { en: 'GPS location automatically attached to every complaint', ur: 'جی پی ایس مقام خود بخود شکایت کے ساتھ شامل ہو جاتا ہے' },
    },
    {
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
      ),
      title: { en: 'Track Progress', ur: 'پیشرفت دیکھیں' },
      description: { en: 'Follow status from pending to resolved with real-time updates', ur: 'حالت کا تعاقب کریں: زیر التوا سے حل تک حقیقی وقت میں' },
    },
    {
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
        </svg>
      ),
      title: { en: 'Bilingual Support', ur: 'دوزبانی سپورٹ' },
      description: { en: 'Full Urdu and English support with RTL layout', ur: 'مکمل اردو اور انگریزی سپورٹ RTL لے آؤٹ کے ساتھ' },
    },
  ];

  return (
    <div className="min-h-screen bg-neutral-50">
      <Navbar language={language} onLanguageChange={setLanguage} />

      <main className="pt-20">
        {/* ============ HERO SECTION ============ */}
        <section className="relative overflow-hidden bg-gradient-to-br from-primary-900 via-primary-800 to-primary-950 min-h-[85vh] flex items-center">
          {/* Background effects */}
          <div className="absolute inset-0 overflow-hidden" aria-hidden="true">
            <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-secondary-500/10 rounded-full blur-3xl -translate-y-1/3 translate-x-1/4" />
            <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-accent-500/10 rounded-full blur-3xl translate-y-1/3 -translate-x-1/4" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-secondary-600/5 rounded-full blur-3xl" />
            {/* Grid overlay */}
            <div className="absolute inset-0 opacity-[0.03]" style={{
              backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)',
              backgroundSize: '60px 60px',
            }} />
            {/* Floating dots */}
            <div className="absolute top-20 left-[15%] w-2 h-2 bg-accent-400/40 rounded-full animate-float" />
            <div className="absolute top-40 right-[20%] w-3 h-3 bg-secondary-400/30 rounded-full animate-float" style={{ animationDelay: '2s' }} />
            <div className="absolute bottom-32 left-[30%] w-2 h-2 bg-accent-300/30 rounded-full animate-float" style={{ animationDelay: '4s' }} />
          </div>

          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-28">
            <div className="text-center max-w-4xl mx-auto">
              <ScrollReveal animation="animate-bounce-in" delay={0}>
                <div className="mb-8">
                  <span className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-white/10 backdrop-blur-sm text-accent-300 text-sm font-semibold border border-white/10">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-accent-400"></span>
                    </span>
                    {t({ en: 'AI-Powered Civic Platform', ur: 'اے آئی سے لیس شہری پلیٹ فارم' }, language)}
                  </span>
                </div>
              </ScrollReveal>

              <ScrollReveal animation="animate-slide-up" delay={100}>
                <h1 className="text-4xl sm:text-5xl lg:text-7xl font-extrabold text-white tracking-tight mb-6 leading-tight">
                  {t({ en: 'Report Civic Issues', ur: 'شہری مسائل رپورٹ کریں' }, language)}
                  <br />
                  <span className="bg-gradient-to-r from-accent-400 via-secondary-400 to-accent-300 bg-clip-text text-transparent">
                    {t({ en: 'Instantly with AI', ur: 'فوری طور پر اے آئی کے ساتھ' }, language)}
                  </span>
                </h1>
              </ScrollReveal>

              <ScrollReveal animation="animate-slide-up" delay={200}>
                <p className="text-lg sm:text-xl text-primary-200 mb-12 max-w-3xl mx-auto leading-relaxed">
                  {t({
                    en: 'CivicAI helps citizens report public problems using AI. Snap a photo or speak the problem — our AI analyzes, classifies, generates a complaint, and routes it to the right department automatically.',
                    ur: 'سوک اے آئی شہریوں کو اے آئی کے ذریعے عوامی مسائل رپورٹ کرنے میں مدد کرتا ہے۔ تصویر کھینچیں یا مسئلہ بولیں — ہماری اے آئی تجزیہ کرتی ہے، درجہ بندی کرتی ہے، شکایت تیار کرتی ہے اور خود بخود متعلقہ محکمے تک پہنچاتی ہے۔'
                  }, language)}
                </p>
              </ScrollReveal>

              <ScrollReveal animation="animate-slide-up" delay={300}>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                  <Link href="/report" className="group relative inline-flex items-center gap-2 px-8 py-4 text-lg font-semibold text-primary-900 bg-gradient-to-r from-accent-400 to-secondary-400 rounded-2xl hover:from-accent-300 hover:to-secondary-300 shadow-lg shadow-accent-500/20 hover:shadow-accent-500/40 hover:-translate-y-0.5 transition-all duration-300">
                    {t({ en: 'Report an Issue', ur: 'مسئلہ رپورٹ کریں' }, language)}
                    <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </Link>
                  <Link href="/my-complaints" className="inline-flex items-center gap-2 px-8 py-4 text-lg font-semibold text-white bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20 hover:bg-white/20 hover:-translate-y-0.5 transition-all duration-300">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                    {t({ en: 'Track Complaints', ur: 'شکایات ٹریک کریں' }, language)}
                  </Link>
                </div>
              </ScrollReveal>
            </div>
          </div>

          {/* Bottom gradient fade */}
          <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-neutral-50 to-transparent" />
        </section>

        {/* ============ AI PROCESS SECTION ============ */}
        <section className="py-28 bg-white relative overflow-hidden">
          {/* Subtle background */}
          <div className="absolute inset-0 opacity-[0.015]" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)', backgroundSize: '32px 32px' }} />
          <div className="absolute top-0 right-0 w-96 h-96 bg-accent-200/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-secondary-200/20 rounded-full blur-3xl translate-y-1/2 -translate-x-1/3" />

          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <ScrollReveal>
              <div className="text-center mb-16">
                <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gradient-to-r from-accent-50 to-secondary-50 text-accent-700 text-sm font-semibold border border-accent-200/50 mb-4">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  {t({ en: 'AI-Powered Civic Reporting', ur: 'اے آئی سے لیس شہری رپورٹنگ' }, language)}
                </span>
                <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-neutral-900 mb-4">
                  {t({ en: 'How AI Solves Your Issues', ur: 'اے آئی آپ کے مسائل کیسے حل کرتا ہے' }, language)}
                </h2>
                <p className="text-lg text-neutral-500 max-w-2xl mx-auto">
                  {t({ en: 'From photo to resolution — our AI handles the entire process', ur: 'تصویر سے حل تک — ہماری اے آئی پورا عمل سنبھالتی ہے' }, language)}
                </p>
              </div>
            </ScrollReveal>

            {/* Process Flow */}
            <div className="relative">
              {/* Connection line - dashed animated */}
              <div className="hidden lg:block absolute top-[52px] left-[8%] right-[8%] h-0.5 -translate-y-1/2">
                <div className="w-full h-full bg-gradient-to-r from-accent-200 via-secondary-300 to-accent-200 rounded-full" />
                <div className="absolute inset-0 bg-[length:12px_2px]" style={{ backgroundImage: 'repeating-linear-gradient(90deg, transparent, transparent 4px, rgba(255,255,255,0.8) 4px, rgba(255,255,255,0.8) 8px)' }} />
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8 lg:gap-2">
                {aiProcessSteps.map((step, index) => (
                  <ScrollReveal key={index} animation="animate-slide-up" delay={index * 100}>
                    <div className="group relative flex flex-col items-center text-center">
                      {/* Step circle */}
                      <div className="relative z-10 w-20 h-20 lg:w-[104px] lg:h-[104px] rounded-2xl bg-white border-2 border-neutral-200/80 flex items-center justify-center text-neutral-500 group-hover:border-accent-400 group-hover:text-accent-600 group-hover:shadow-xl group-hover:shadow-accent-500/10 group-hover:-translate-y-1 transition-all duration-300 mb-5">
                        {/* Inner gradient bg on hover */}
                        <div className="absolute inset-[3px] rounded-[14px] bg-gradient-to-br from-white to-neutral-50 group-hover:from-accent-50/50 group-hover:to-secondary-50/30 transition-all duration-300" />
                        <div className="relative">
                          {step.icon}
                        </div>
                        {/* Number badge */}
                        <div className="absolute -top-2.5 -right-2.5 w-7 h-7 rounded-full bg-gradient-to-br from-secondary-500 to-accent-500 text-white text-xs font-bold flex items-center justify-center shadow-lg shadow-secondary-500/20 group-hover:scale-110 transition-transform duration-300">
                          {index + 1}
                        </div>
                      </div>
                      <p className="text-sm font-semibold text-neutral-700 group-hover:text-neutral-900 transition-colors leading-snug max-w-[120px]">
                        {t(step.label, language)}
                      </p>
                      {/* Arrow for mobile */}
                      {index < aiProcessSteps.length - 1 && index % 2 === 0 && (
                        <div className="lg:hidden absolute -right-4 top-10 text-neutral-300">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </div>
                      )}
                      {/* Desktop arrow between steps */}
                      {index < aiProcessSteps.length - 1 && (
                        <div className="hidden lg:block absolute top-[40px] -right-3 text-neutral-300/60 z-20">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </div>
                      )}
                    </div>
                  </ScrollReveal>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ============ KEY FEATURES ============ */}
        <section className="py-28 bg-neutral-50 relative overflow-hidden">
          <div className="absolute inset-0 opacity-[0.015]" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)', backgroundSize: '40px 40px' }} />
          <div className="absolute -top-32 -right-32 w-96 h-96 bg-secondary-100/30 rounded-full blur-3xl" />
          <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-accent-100/20 rounded-full blur-3xl" />

          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <ScrollReveal>
              <div className="text-center mb-16">
                <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-secondary-50 text-secondary-700 text-sm font-semibold border border-secondary-200/50 mb-4">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  {t({ en: 'Powerful Capabilities', ur: 'طاقتور صلاحیتیں' }, language)}
                </span>
                <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-neutral-900 mb-4">
                  {t({ en: 'Key Features', ur: 'اہم خصوصیات' }, language)}
                </h2>
                <p className="text-lg text-neutral-500 max-w-2xl mx-auto">
                  {t({ en: 'Everything you need to report and track civic issues', ur: 'شہری مسائل رپورٹ اور ٹریک کرنے کے لیے ہر چیز' }, language)}
                </p>
              </div>
            </ScrollReveal>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {features.map((feature, index) => (
                <ScrollReveal key={index} animation="animate-slide-up" delay={index * 80}>
                  <Card3D intensity={10}>
                    <div className="group relative p-7 h-full rounded-2xl bg-gradient-to-br from-white via-secondary-50/30 to-accent-50/20 border border-secondary-100/60 hover:border-secondary-200 hover:shadow-xl hover:shadow-secondary-500/10 hover:-translate-y-1 transition-all duration-300 overflow-hidden">
                      {/* Left accent bar */}
                      <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-secondary-400 to-accent-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-l-2xl" />
                      {/* Corner glow on hover */}
                      <div className="absolute -top-8 -right-8 w-24 h-24 bg-secondary-400/10 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                      <div className="relative">
                        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-secondary-500 to-secondary-600 text-white flex items-center justify-center mb-5 group-hover:from-secondary-400 group-hover:to-accent-500 group-hover:scale-110 group-hover:shadow-lg group-hover:shadow-secondary-500/25 transition-all duration-300">
                          {feature.icon}
                        </div>
                        <h3 className="text-lg font-bold text-neutral-900 mb-2 group-hover:text-secondary-700 transition-colors duration-200">{t(feature.title, language)}</h3>
                        <p className="text-neutral-500 text-sm leading-relaxed">{t(feature.description, language)}</p>
                      </div>
                    </div>
                  </Card3D>
                </ScrollReveal>
              ))}
            </div>
          </div>
        </section>

        {/* ============ STATS SECTION ============ */}
        <section className="py-28 bg-white relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-neutral-200 to-transparent" />
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[400px] bg-secondary-50/40 rounded-full blur-3xl" />

          <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <ScrollReveal>
              <div className="text-center mb-14">
                <h2 className="text-2xl sm:text-3xl font-bold text-neutral-900 mb-3">
                  {t({ en: 'Platform Overview', ur: 'پلیٹ فارم کا جائزہ' }, language)}
                </h2>
                <p className="text-neutral-500 max-w-lg mx-auto">
                  {t({ en: 'Real-time numbers from our civic platform', ur: 'ہمارے شہری پلیٹ فارم سے حقیقی وقت کے اعداد' }, language)}
                </p>
              </div>
            </ScrollReveal>

            <div className="grid md:grid-cols-3 gap-6">
              {[
                { value: stats ? stats.totalComplaints : null, label: { en: 'Issues Reported', ur: 'مسائل رپورٹ ہوئے' }, icon: (
                  <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                )},
                { value: stats ? stats.totalOrganizations : null, label: { en: 'Departments Connected', ur: 'مندرج ادارے' }, icon: (
                  <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
                )},
                { value: 2, label: { en: 'Languages Supported', ur: 'زبانیں' }, icon: (
                  <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" /></svg>
                )},
              ].map((stat, index) => (
                <ScrollReveal key={index} animation="animate-slide-up" delay={index * 150}>
                  <div className="group relative p-8 rounded-2xl bg-gradient-to-br from-white to-secondary-50/20 border border-neutral-200/50 hover:border-secondary-200 hover:shadow-xl hover:shadow-secondary-500/8 transition-all duration-300 text-center">
                    <div className="absolute top-0 left-10 right-10 h-px bg-gradient-to-r from-transparent via-secondary-300/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-secondary-500 to-secondary-600 text-white flex items-center justify-center mx-auto mb-5 group-hover:from-secondary-400 group-hover:to-accent-500 group-hover:scale-110 group-hover:shadow-lg group-hover:shadow-secondary-500/20 transition-all duration-300">
                      {stat.icon}
                    </div>
                    <div className="text-4xl sm:text-5xl font-black text-neutral-900 mb-2 tracking-tight">
                      <AnimatedCounter target={stat.value} />
                    </div>
                    <div className="text-neutral-500 text-base font-medium">{t(stat.label, language)}</div>
                  </div>
                </ScrollReveal>
              ))}
            </div>
          </div>
        </section>

        {/* ============ CTA SECTION ============ */}
        <section className="relative py-28 overflow-hidden bg-gradient-to-br from-primary-900 via-primary-800 to-primary-950">
          {/* Background effects */}
          <div className="absolute inset-0 overflow-hidden" aria-hidden="true">
            <div className="absolute top-0 left-0 w-96 h-96 bg-accent-500/15 rounded-full blur-3xl -translate-x-1/3 -translate-y-1/3 animate-float" />
            <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-secondary-500/10 rounded-full blur-3xl translate-x-1/4 translate-y-1/4 animate-float" style={{ animationDelay: '3s' }} />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-accent-400/5 rounded-full blur-3xl" />
            {/* Grid overlay */}
            <div className="absolute inset-0 opacity-[0.03]" style={{
              backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)',
              backgroundSize: '48px 48px',
            }} />
            {/* Floating dots */}
            <div className="absolute top-12 left-[10%] w-3 h-3 bg-accent-400/30 rounded-full animate-float" />
            <div className="absolute top-20 right-[15%] w-2 h-2 bg-secondary-400/30 rounded-full animate-float" style={{ animationDelay: '1.5s' }} />
            <div className="absolute bottom-16 left-[25%] w-2.5 h-2.5 bg-white/15 rounded-full animate-float" style={{ animationDelay: '2.5s' }} />
            <div className="absolute bottom-24 right-[20%] w-2 h-2 bg-accent-300/25 rounded-full animate-float" style={{ animationDelay: '4s' }} />
            <div className="absolute top-1/3 right-[8%] w-1.5 h-1.5 bg-secondary-300/20 rounded-full animate-float" style={{ animationDelay: '3.5s' }} />
          </div>

          <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <ScrollReveal animation="animate-slide-up">
              {/* AI badge */}
              <div className="mb-8">
                <span className="inline-flex items-center gap-2.5 px-5 py-2.5 rounded-full bg-white/[0.07] backdrop-blur-md border border-white/10 text-accent-300 text-sm font-medium">
                  <span className="relative flex h-2.5 w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-accent-400"></span>
                  </span>
                  <svg className="w-4 h-4 text-accent-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                  {t({ en: 'AI-Powered Platform', ur: 'اے آئی سے لیس پلیٹ فارم' }, language)}
                </span>
              </div>

              {/* Headline */}
              <h2 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white mb-6 leading-tight tracking-tight">
                {t({ en: 'Ready to Make', ur: 'فرق لانے کے لیے' }, language)}
                <br />
                <span className="bg-gradient-to-r from-accent-300 via-white to-accent-300 bg-clip-text text-transparent">
                  {t({ en: 'a Difference?', ur: 'تیار ہیں؟' }, language)}
                </span>
              </h2>

              {/* Description */}
              <p className="text-lg sm:text-xl text-primary-200/80 mb-12 max-w-2xl mx-auto leading-relaxed">
                {t({
                  en: 'Join thousands of citizens improving their communities with AI. Report issues in seconds, track in real-time.',
                  ur: 'اے آئی کے ساتھ اپنے علاقے کو بہتر بنانے والے ہزاروں شہریوں کے ساتھ شامل ہوں۔ سیکنڈوں میں مسائل رپورٹ کریں، حقیقی وقت میں ٹریک کریں۔'
                }, language)}
              </p>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link href="/report" className="group relative inline-flex items-center gap-2.5 px-12 py-5 text-lg font-bold rounded-2xl transition-all duration-300 hover:-translate-y-1">
                  {/* Outer glow */}
                  <div className="absolute -inset-1 bg-gradient-to-r from-accent-400 to-secondary-400 rounded-2xl blur-xl opacity-40 group-hover:opacity-70 transition-opacity duration-300" />
                  {/* Shimmer effect */}
                  <div className="absolute inset-0 overflow-hidden rounded-2xl">
                    <div className="absolute inset-0 bg-gradient-to-r from-accent-400 to-secondary-400" />
                    <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/25 to-transparent" />
                  </div>
                  <span className="relative text-primary-900 flex items-center gap-2.5 font-extrabold">
                    {t({ en: 'Start Reporting', ur: 'رپورٹنگ شروع کریں' }, language)}
                    <svg className="w-5 h-5 group-hover:translate-x-1.5 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </span>
                </Link>
                <Link href="/my-complaints" className="group inline-flex items-center gap-2 px-8 py-5 text-lg font-semibold text-white/90 bg-white/[0.07] backdrop-blur-sm rounded-2xl border border-white/15 hover:bg-white/[0.12] hover:text-white hover:-translate-y-0.5 hover:border-white/25 transition-all duration-300">
                  <svg className="w-5 h-5 text-accent-400/70 group-hover:text-accent-300 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                  {t({ en: 'Track Complaints', ur: 'شکایات ٹریک کریں' }, language)}
                </Link>
              </div>
            </ScrollReveal>
          </div>
        </section>
      </main>

      {/* ============ FOOTER ============ */}
      <footer className="relative bg-primary-950 text-white pt-16 pb-8">
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-accent-500/40 to-transparent" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-12 mb-12">
            <div className="md:col-span-1">
              <div className="flex items-center gap-3 mb-5">
                <img src="/logo.png" alt="CivicAI" className="w-14 h-14 rounded-xl object-contain" />
                <span className="text-2xl font-bold bg-gradient-to-r from-white to-primary-200 bg-clip-text text-transparent">CivicAI</span>
              </div>
              <p className="text-primary-300 text-sm leading-relaxed">
                {t({ en: 'AI-Powered Smart Civic Reporting & Assistance Platform for Pakistan.', ur: 'پاکستان کے لیے اے آئی سے لیس سمارٹ شہری رپورٹنگ اور مدد کا پلیٹ فارم۔' }, language)}
              </p>
            </div>
            <div>
              <h4 className="font-bold text-sm uppercase tracking-wider text-primary-400 mb-5">{t({ en: 'Quick Links', ur: 'تیز لنکس' }, language)}</h4>
              <ul className="space-y-3 text-sm">
                <li><Link href="/" className="text-primary-300 hover:text-white transition-colors duration-200">{t({ en: 'Home', ur: 'ہوم' }, language)}</Link></li>
                <li><Link href="/report" className="text-primary-300 hover:text-white transition-colors duration-200">{t({ en: 'Report Issue', ur: 'مسئلہ رپورٹ کریں' }, language)}</Link></li>
                <li><Link href="/my-complaints" className="text-primary-300 hover:text-white transition-colors duration-200">{t({ en: 'My Complaints', ur: 'میری شکایات' }, language)}</Link></li>
                <li><Link href="/profile" className="text-primary-300 hover:text-white transition-colors duration-200">{t({ en: 'Profile', ur: 'پروفائل' }, language)}</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-sm uppercase tracking-wider text-primary-400 mb-5">{t({ en: 'Features', ur: 'خصوصیات' }, language)}</h4>
              <ul className="space-y-3 text-sm">
                <li><span className="text-primary-300">{t({ en: 'AI Analysis', ur: 'اے آئی تجزیہ' }, language)}</span></li>
                <li><span className="text-primary-300">{t({ en: 'Voice Input', ur: 'آواز ان پٹ' }, language)}</span></li>
                <li><span className="text-primary-300">{t({ en: 'Photo Upload', ur: 'تصویر اپ لوڈ' }, language)}</span></li>
                <li><span className="text-primary-300">{t({ en: 'Real-time Tracking', ur: 'حقیقی وقت ٹریکنگ' }, language)}</span></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-sm uppercase tracking-wider text-primary-400 mb-5">{t({ en: 'Legal', ur: 'قانونی' }, language)}</h4>
              <ul className="space-y-3 text-sm">
                <li><Link href="/privacy-policy" className="text-primary-300 hover:text-white transition-colors duration-200">{t({ en: 'Privacy Policy', ur: 'رازداری کی پالیسی' }, language)}</Link></li>
                <li><Link href="/terms-of-service" className="text-primary-300 hover:text-white transition-colors duration-200">{t({ en: 'Terms of Service', ur: 'خدمات کی شرائط' }, language)}</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-primary-800 pt-8 text-center">
            <p className="text-primary-400 text-sm">&copy; 2026 CivicAI. {t({ en: 'Built for Alibaba Cloud AI Hackathon Pakistan 2026', ur: 'علیبابا کلاؤڈ اے آئی ہیکاتھون پاکستان 2026 کے لیے تیار' }, language)}</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
