'use client';

import React from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar/Navbar';

const t = (key: { en: string; ur: string }, lang: 'en' | 'ur') => lang === 'ur' ? key.ur : key.en;

export default function HomePage() {
  const [language, setLanguage] = React.useState<'en' | 'ur'>('en');
  const [stats, setStats] = React.useState<{ totalComplaints: number; totalOrganizations: number } | null>(null);

  React.useEffect(() => {
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

  const features = [
    {
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      ),
      title: { en: 'Photo Upload', ur: 'تصویر اپ لوڈ' },
      description: { en: 'Snap a photo of the issue and let AI identify it', ur: 'مسئلے کی تصویر کھینچیں اور اے آئی اسے شناخت کرے گا' },
    },
    {
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6m0 0z" />
        </svg>
      ),
      title: { en: 'Voice Input', ur: 'آواز ان پٹ' },
      description: { en: 'Describe the issue in Urdu or English by voice', ur: 'مسئلے کو اردو یا انگریزی میں آواز سے بیان کریں' },
    },
    {
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.734-.988-2.386l-.548-.547z" />
        </svg>
      ),
      title: { en: 'AI Analysis', ur: 'اے آئی تجزیہ' },
      description: { en: 'AI classifies, generates complaint & routes to right org', ur: 'اے آئی درجہ بندی کرتا ہے، شکایت بناتا ہے اور متعلقہ ادارے تک پہنچاتا ہے' },
    },
    {
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z" />
        </svg>
      ),
      title: { en: 'Location Auto', ur: 'خودکار مقام' },
      description: { en: 'GPS location automatically attached to complaint', ur: 'جے پی ایس مقام خود بخود شکایت کے ساتھ شامل ہو جاتا ہے' },
    },
    {
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
      ),
      title: { en: 'Track Progress', ur: 'پیشرفت دیکھیں' },
      description: { en: 'Follow status from pending to resolved', ur: 'حالت کا تعاقب کریں: زیر التوا سے حل تک' },
    },
    {
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
        </svg>
      ),
      title: { en: 'Bilingual', ur: 'دوزبانی' },
      description: { en: 'Full Urdu and English support', ur: 'مکمل اردو اور انگریزی سپورٹ' },
    },
  ];

  return (
    <div className="min-h-screen bg-secondary-50">
      <Navbar language={language} onLanguageChange={setLanguage} />

      <main className="pt-16">
        <section className="relative overflow-hidden bg-gradient-to-b from-primary-50 to-white py-20 sm:py-32">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-secondary-900 tracking-tight mb-6 animate-fade-in">
                {t({ en: 'Report Civic Issues', ur: 'شہری مسائل رپورٹ کریں' }, language)}
                <br />
                <span className="text-primary-600">{t({ en: 'Instantly with AI', ur: 'فوری طور پر اے آئی کے ساتھ' }, language)}</span>
              </h1>
              <p className="text-lg sm:text-xl text-secondary-600 mb-10 max-w-2xl mx-auto animate-slide-up" style={{ animationDelay: '100ms' }}>
                {t({ en: 'Snap a photo or speak the problem. AI analyzes, classifies, generates a complaint, and routes it to the right department. Track progress in real-time.', ur: 'تصویر کھینچیں یا مسئلہ بولیں۔ اے آئی تجزیہ کرتا ہے، درجہ بندی کرتا ہے، شکایت تیار کرتا ہے اور متعلقہ محکمے تک پہنچاتا ہے۔ حقیقی وقت میں پیشرفت دیکھیں۔' }, language)}
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-slide-up" style={{ animationDelay: '200ms' }}>
                <Link href="/report" className="btn-primary text-lg px-8 py-3">
                  {t({ en: 'Report an Issue Now', ur: 'ابھی مسئلہ رپورٹ کریں' }, language)}
                </Link>
                <Link href="/my-complaints" className="btn-outline text-lg px-8 py-3">
                  {t({ en: 'View My Complaints', ur: 'میری شکایات دیکھیں' }, language)}
                </Link>
              </div>
            </div>
          </div>

          <div className="absolute inset-0 -z-10 overflow-hidden" aria-hidden="true">
            <div className="absolute -top-40 -right-40 w-80 h-80 rounded-full bg-primary-100 opacity-50 blur-3xl" />
            <div className="absolute -bottom-40 -left-40 w-80 h-80 rounded-full bg-primary-100 opacity-50 blur-3xl" />
          </div>
        </section>

        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl sm:text-4xl font-bold text-secondary-900 mb-4">
                {t({ en: 'How It Works', ur: 'یہ کیسے کام کرتا ہے' }, language)}
              </h2>
              <p className="text-lg text-secondary-600 max-w-2xl mx-auto">
                {t({ en: 'Report any civic issue in 3 simple steps', ur: 'کسی بھی شہری مسئلے کو 3 سادہ مرحلوں میں رپورٹ کریں' }, language)}
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {[
                {
                  step: '1',
                  title: { en: 'Report', ur: 'رپورٹ' },
                  description: { en: 'Upload a photo or record your voice describing the issue', ur: 'مسئلے کی تصویر اپ لوڈ کریں یا آواز سے بیان کریں' },
                  icon: (
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  ),
                },
                {
                  step: '2',
                  title: { en: 'AI Analyzes', ur: 'اے آئی تجزیہ' },
                  description: { en: 'AI identifies category, severity, generates complaint & adds location', ur: 'اے آئی زمرہ، شدت شناخت کرتا ہے، شکایت بناتا ہے اور مقام شامل کرتا ہے' },
                  icon: (
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.734-.988-2.386l-.548-.547z" />
                    </svg>
                  ),
                },
                {
                  step: '3',
                  title: { en: 'Track & Resolve', ur: 'تعاقب اور حل' },
                  description: { en: 'Get complaint ID, track status updates until resolved', ur: 'شکایت آئی ڈی حاصل کریں، حالت کے اپ ڈیٹس تک حل ہونے تک دیکھیں' },
                  icon: (
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                  ),
                },
              ].map((item, index) => (
                <div key={index} className="text-center p-6 rounded-2xl bg-secondary-50 hover:bg-secondary-100 transition-colors animate-fade-in" style={{ animationDelay: `${index * 100}ms` }}>
                  <div className="relative inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary-100 text-primary-600 mb-6">
                    <span className="text-3xl font-bold">{item.step}</span>
                    <span className="absolute -top-2 -right-2 w-8 h-8 bg-primary-600 text-white rounded-full flex items-center justify-center text-sm">
                      {item.icon}
                    </span>
                  </div>
                  <h3 className="text-xl font-semibold text-secondary-900 mb-2">{t(item.title, language)}</h3>
                  <p className="text-secondary-600">{t(item.description, language)}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="py-20 bg-secondary-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl sm:text-4xl font-bold text-secondary-900 mb-4">
                {t({ en: 'Key Features', ur: 'اہم خصوصیات' }, language)}
              </h2>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {features.map((feature, index) => (
                <div key={index} className="card p-6 hover:shadow-lg transition-shadow animate-fade-in" style={{ animationDelay: `${index * 50}ms` }}>
                  <div className="w-12 h-12 rounded-xl bg-primary-100 text-primary-600 flex items-center justify-center mb-4">
                    {feature.icon}
                  </div>
                  <h3 className="text-lg font-semibold text-secondary-900 mb-2">{t(feature.title, language)}</h3>
                  <p className="text-secondary-600">{t(feature.description, language)}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="py-20 bg-primary-600">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              {t({ en: 'Ready to Make a Difference?', ur: 'فرق لانے کے لیے تیار ہیں؟' }, language)}
            </h2>
            <p className="text-primary-100 text-lg mb-8 max-w-2xl mx-auto">
              {t({ en: 'Join thousands of citizens improving their communities. Report your first issue today.', ur: 'ہزاروں شہریوں کے ساتھ شامل ہوں جو اپنے علاقے کو بہتر بنا رہے ہیں۔ آج اپنی پہلی شکایت رجسٹر کریں۔' }, language)}
            </p>
            <Link href="/report" className="inline-flex items-center justify-center px-8 py-3 text-lg font-medium text-primary-600 bg-white rounded-lg hover:bg-primary-50 transition-colors">
              {t({ en: 'Start Reporting', ur: 'رپورٹنگ شروع کریں' }, language)}
            </Link>
          </div>
        </section>

        <section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid md:grid-cols-3 gap-8 text-center">
              <div className="p-6">
                <div className="text-4xl font-bold text-primary-600 mb-2">{stats ? stats.totalComplaints : '—'}</div>
                <div className="text-secondary-600">{t({ en: 'Issues Reported', ur: 'مسائل رپورٹ ہوئے' }, language)}</div>
              </div>
              <div className="p-6">
                <div className="text-4xl font-bold text-primary-600 mb-2">{stats ? stats.totalOrganizations : '—'}</div>
                <div className="text-secondary-600">{t({ en: 'Departments Connected', ur: 'مندرج ادارے' }, language)}</div>
              </div>
              <div className="p-6">
                <div className="text-4xl font-bold text-primary-600 mb-2">2</div>
                <div className="text-secondary-600">{t({ en: 'Languages: Urdu & English', ur: 'زبانیں: اردو اور انگریزی' }, language)}</div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-secondary-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg bg-primary-500 flex items-center justify-center">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <span className="text-xl font-bold">CivicAI</span>
              </div>
              <p className="text-secondary-400 text-sm">
                {t({ en: 'Smart AI Complaint & Assistance Platform for Pakistan', ur: 'پاکستان کے لیے سمارٹ اے آئی شکایت اور مدد کا پلیٹ فارم' }, language)}
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">{t({ en: 'Quick Links', ur: 'تیز لنکس' }, language)}</h4>
              <ul className="space-y-2 text-secondary-400 text-sm">
                <li><Link href="/" className="hover:text-white transition-colors">{t({ en: 'Home', ur: 'ہوم' }, language)}</Link></li>
                <li><Link href="/report" className="hover:text-white transition-colors">{t({ en: 'Report Issue', ur: 'مسئلہ رپورٹ کریں' }, language)}</Link></li>
                <li><Link href="/my-complaints" className="hover:text-white transition-colors">{t({ en: 'My Complaints', ur: 'میری شکایات' }, language)}</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">{t({ en: 'Support', ur: 'سپورٹ' }, language)}</h4>
              <ul className="space-y-2 text-secondary-400 text-sm">
                <li><a href="#" className="hover:text-white transition-colors">{t({ en: 'Help Center', ur: 'مدد سینٹر' }, language)}</a></li>
                <li><a href="#" className="hover:text-white transition-colors">{t({ en: 'Contact Us', ur: 'ہم سے رابطہ کریں' }, language)}</a></li>
                <li><a href="#" className="hover:text-white transition-colors">{t({ en: 'FAQ', ur: 'اکثر پوچھے جانے والے سوالات' }, language)}</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">{t({ en: 'Legal', ur: 'قانونی' }, language)}</h4>
              <ul className="space-y-2 text-secondary-400 text-sm">
                <li><a href="#" className="hover:text-white transition-colors">{t({ en: 'Privacy Policy', ur: 'رازداری کی پالیسی' }, language)}</a></li>
                <li><a href="#" className="hover:text-white transition-colors">{t({ en: 'Terms of Service', ur: 'خدمت کی شرائط' }, language)}</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-secondary-800 mt-8 pt-8 text-center text-secondary-400 text-sm">
            <p>&copy; 2026 CivicAI. {t({ en: 'Built for Alibaba Cloud AI Hackathon Pakistan 2026', ur: 'علیبابا کلاؤڈ اے آئی ہیکاتھون پاکستان 2026 کے لیے تیار' }, language)}</p>
          </div>
        </div>
      </footer>
    </div>
  );
}