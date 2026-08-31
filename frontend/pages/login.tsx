'use client';

import React, { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/router';
import { useToastHelpers } from '@/components/Toast';
import Navbar from '@/components/Navbar/Navbar';

const t = (key: { en: string; ur: string }, lang: 'en' | 'ur') => lang === 'ur' ? key.ur : key.en;

export default function LoginPage() {
  const router = useRouter();
  const { error: toastError, success } = useToastHelpers();
  const [language, setLanguage] = useState<'en' | 'ur'>('en');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const callbackUrl = (router.query.callbackUrl as string) || '/';

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
        // Full navigation so the session cookie is picked up by the next page load
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
    <div className="min-h-screen bg-secondary-50">
      <Navbar language={language} onLanguageChange={setLanguage} />

      <main className="pt-16 pb-12 flex items-center justify-center min-h-[calc(100vh-4rem)]">
        <div className="max-w-md w-full mx-auto px-4 sm:px-6 lg:px-8">
          <div className="card">
            <div className="card-header text-center">
              <h1 className="text-2xl font-bold text-secondary-900">
                {t({ en: 'Welcome Back', ur: 'خیر مقدم' }, language)}
              </h1>
              <p className="text-secondary-600 mt-2">
                {t({ en: 'Sign in to your account', ur: 'اپنے اکاؤنٹ میں سائن ان کریں' }, language)}
              </p>
            </div>

            <div className="card-body">
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
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-secondary-500 hover:text-secondary-700"
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
                    <input type="checkbox" className="w-4 h-4 text-primary-600 border-secondary-300 rounded focus:ring-primary-500" />
                    <span className="text-sm text-secondary-700">{t({ en: 'Remember me', ur: 'مجھے یاد رکھیں' }, language)}</span>
                  </label>
                  <a href="#" className="text-sm text-primary-600 hover:underline">
                    {t({ en: 'Forgot Password?', ur: 'پاس ورڈ بھول گئے؟' }, language)}
                  </a>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="btn-primary w-full py-3"
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

              <div className="mt-6 text-center">
                <p className="text-secondary-600">
                  {t({ en: 'Don\'t have an account?', ur: 'اکاؤنٹ نہیں ہے؟' }, language)}&nbsp;
                  <a href="/register" className="text-primary-600 font-medium hover:underline">
                    {t({ en: 'Sign Up', ur: 'سائن اپ' }, language)}
                  </a>
                </p>
              </div>

            </div>
          </div>
        </div>
      </main>
    </div>
  );
}