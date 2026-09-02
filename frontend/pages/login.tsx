'use client';

import React, { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { useToastHelpers } from '@/components/Toast';
import Navbar from '@/components/Navbar/Navbar';
import { getStoredLanguage } from '@/lib/i18n';

const t = (key: { en: string; ur: string }, lang: 'en' | 'ur') => lang === 'ur' ? key.ur : key.en;

export default function LoginPage() {
  const router = useRouter();
  const { error: toastError, success } = useToastHelpers();
  const [language, setLanguage] = useState<'en' | 'ur'>(getStoredLanguage);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const rawCallbackUrl = (router.query.callbackUrl as string) || '/';
  const callbackUrl = rawCallbackUrl.startsWith('/') && !rawCallbackUrl.startsWith('//') ? rawCallbackUrl : '/';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !password) {
      toastError(t({ en: 'Error', ur: 'خرابی' }, language), t({ en: 'Please enter both email and password', ur: 'براہ کرم ای میل اور پاس ورڈ دونوں داخل کریں' }, language));
      return;
    }

    setIsLoading(true);

    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
        callbackUrl,
      });

      if (result?.error) {
        toastError(t({ en: 'Login Failed', ur: 'لاگ ان ناکام' }, language), t({ en: 'Invalid email or password', ur: 'غلط ای میل یا پاس ورڈ' }, language));
      } else {
        success(t({ en: 'Welcome back!', ur: 'خیر مقدم!' }, language), t({ en: 'Login successful', ur: 'لاگ ان کامیاب' }, language));
        window.location.href = callbackUrl;
      }
    } catch (err: any) {
      console.error('Login error:', err);
      toastError(t({ en: 'Error', ur: 'خرابی' }, language), t({ en: 'Login failed. Please try again.', ur: 'لاگ ان ناکام۔ براہ کرم دوبارہ کوشش کریں۔' }, language));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-50">
      <Navbar language={language} onLanguageChange={setLanguage} />

      <main className="relative pt-20 pb-12 flex items-center justify-center min-h-screen">
        {/* Background */}
        <div className="absolute inset-0 -z-10 overflow-hidden" aria-hidden="true">
          <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-secondary-100/40 blur-3xl" />
          <div className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full bg-accent-100/30 blur-3xl" />
        </div>

        <div className="w-full max-w-lg mx-auto px-4 sm:px-6 animate-slide-up">
          {/* Logo + Branding */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl shadow-lg mb-4">
              <img src="/logo.png" alt="CivicAI" className="w-16 h-16 rounded-2xl object-contain" />
            </div>
            <h1 className="text-2xl font-bold text-neutral-900">
              {t({ en: 'Welcome Back', ur: 'خیر مقدم' }, language)}
            </h1>
            <p className="text-neutral-500 mt-1">
              {t({ en: 'Sign in to your CivicAI account', ur: 'اپنے CivicAI اکاؤنٹ میں سائن ان کریں' }, language)}
            </p>
          </div>

          {/* Form Card */}
          <div className="bg-white rounded-2xl shadow-card border border-neutral-200/80 overflow-hidden">
            <div className="h-1 bg-gradient-to-r from-secondary-500 via-accent-500 to-secondary-500" />
            <div className="p-8">
              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label htmlFor="email" className="label">
                    {t({ en: 'Email Address', ur: 'ای میل ایڈریس' }, language)}
                  </label>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={t({ en: 'you@example.com', ur: 'آپ@example.com' }, language)}
                    className="input"
                    required
                    autoComplete="email"
                    disabled={isLoading}
                  />
                </div>

                <div>
                  <label htmlFor="password" className="label">
                    {t({ en: 'Password', ur: 'پاس ورڈ' }, language)}
                  </label>
                  <div className="relative">
                    <input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder={t({ en: 'Enter your password', ur: 'اپنا پاس ورڈ داخل کریں' }, language)}
                      className="input pr-10"
                      required
                      autoComplete="current-password"
                      disabled={isLoading}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600"
                      aria-label={showPassword ? t({ en: 'Hide password', ur: 'پاس ورڈ چھپائیں' }, language) : t({ en: 'Show password', ur: 'پاس ورڈ دکھائیں' }, language)}
                    >
                      {showPassword ? (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                        </svg>
                      ) : (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      )}
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" className="w-4 h-4 text-secondary-600 border-neutral-300 rounded focus:ring-secondary-500" />
                    <span className="text-sm text-neutral-600">{t({ en: 'Remember me', ur: 'مجھے یاد رکھیں' }, language)}</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => toastError(t({ en: 'Coming Soon', ur: 'جلد آ رہا ہے' }, language), t({ en: 'Password reset will be available soon.', ur: 'پاس ورڈ ری سیٹ جلد دستیاب ہوگا۔' }, language))}
                    className="text-sm text-secondary-600 hover:underline font-medium"
                  >
                    {t({ en: 'Forgot Password?', ur: 'پاس ورڈ بھول گئے؟' }, language)}
                  </button>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3 px-4 bg-gradient-to-r from-secondary-600 to-secondary-500 text-white text-sm font-semibold rounded-xl shadow-sm hover:from-secondary-700 hover:to-secondary-600 hover:shadow-md hover:shadow-secondary-500/20 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                >
                  {isLoading ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      {t({ en: 'Signing in...', ur: 'سائن ان ہو رہا ہے...' }, language)}
                    </>
                  ) : (
                    t({ en: 'Sign In', ur: 'سائن ان' }, language)
                  )}
                </button>
              </form>

              {/* Divider */}
              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-neutral-200"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-3 bg-white text-neutral-400">{t({ en: 'or continue with', ur: 'یا اس سے جاری رکھیں' }, language)}</span>
                </div>
              </div>

              {/* Google Login */}
              <button
                type="button"
                onClick={() => signIn('google', { callbackUrl })}
                className="w-full flex items-center justify-center gap-3 px-4 py-3 border border-neutral-200 rounded-xl hover:bg-neutral-50 hover:border-neutral-300 transition-all duration-200 text-neutral-700 font-medium text-sm"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
                {t({ en: 'Continue with Google', ur: 'گوگل سے جاری رکھیں' }, language)}
              </button>
            </div>

            {/* Footer */}
            <div className="px-8 py-4 bg-neutral-50/80 border-t border-neutral-200/60 text-center">
              <p className="text-sm text-neutral-500">
                {t({ en: 'Don\'t have an account?', ur: 'اکاؤنٹ نہیں ہے؟' }, language)}&nbsp;
                <Link href="/register" className="text-secondary-600 font-semibold hover:underline">
                  {t({ en: 'Sign Up', ur: 'سائن اپ' }, language)}
                </Link>
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
