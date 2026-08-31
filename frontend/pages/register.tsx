'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/router';
import { useToastHelpers } from '@/components/Toast';
import Navbar from '@/components/Navbar/Navbar';
import { authApi } from '@/lib/api';
import { getStoredLanguage } from '@/lib/i18n';

const t = (key: { en: string; ur: string }, lang: 'en' | 'ur') => lang === 'ur' ? key.ur : key.en;

export default function RegisterPage() {
  const router = useRouter();
  const { error: toastError, success } = useToastHelpers();
  const [language, setLanguage] = useState<'en' | 'ur'>(getStoredLanguage);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    language: 'en' as 'en' | 'ur',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.email) {
      toastError(t({ en: 'Error', ur: 'خرابی' }, language), t({ en: 'Name and email are required', ur: 'نام اور ای میل ضروری ہیں' }, language));
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      toastError(t({ en: 'Error', ur: 'خرابی' }, language), t({ en: 'Passwords do not match', ur: 'پاس ورڈ میل نہیں کھاتے' }, language));
      return;
    }

    if (formData.password.length < 6) {
      toastError(t({ en: 'Error', ur: 'خرابی' }, language), t({ en: 'Password must be at least 6 characters', ur: 'پاس ورڈ کم از کم 6 حروف کا ہونا چاہیے' }, language));
      return;
    }

    setIsLoading(true);

    try {
      await authApi.register({
        name: formData.name,
        email: formData.email,
        password: formData.password,
      });

      success(t({ en: 'Account created!', ur: 'اکاؤنٹ بن گیا!' }, language), t({ en: 'Registration successful! Please login.', ur: 'رجسٹریشن کامیاب! براہ کرم لاگ ان کریں۔' }, language));

      router.push('/login');
    } catch (err: any) {
      console.error('Registration error:', err);
      toastError(
        t({ en: 'Registration Failed', ur: 'رجسٹریشن ناکام' }, language),
        err.message || t({ en: 'Registration failed. Please try again.', ur: 'رجسٹریشن ناکام۔ براہ کرم دوبارہ کوشش کریں۔' }, language)
      );
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
                {t({ en: 'Create Account', ur: 'اکاؤنٹ بنائیں' }, language)}
              </h1>
              <p className="text-secondary-600 mt-2">
                {t({ en: 'Join CivicAI to report and track civic issues', ur: 'CivicAI میں شامل ہوں تاکہ شہری مسائل رپورٹ اور ٹریک کر سکیں' }, language)}
              </p>
            </div>

            <div className="card-body">
              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label htmlFor="name" className="label">
                    {t({ en: 'Full Name', ur: 'پورا نام' }, language)}
                  </label>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder={t({ en: 'Enter your full name', ur: 'اپنا پورا نام داخل کریں' }, language)}
                    className="input"
                    required
                    autoComplete="name"
                    disabled={isLoading}
                  />
                </div>

                <div>
                  <label htmlFor="email" className="label">
                    {t({ en: 'Email Address', ur: 'ای میل ایڈریس' }, language)}
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder={t({ en: 'you@example.com', ur: 'آپ@example.com' }, language)}
                    className="input"
                    required
                    autoComplete="email"
                    disabled={isLoading}
                  />
                </div>

                <div>
                  <label htmlFor="phone" className="label">
                    {t({ en: 'Phone Number (Optional)', ur: 'فون نمبر (اختیاری)' }, language)}
                  </label>
                  <input
                    id="phone"
                    name="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder={t({ en: '+92 300 1234567', ur: '+92 300 1234567' }, language)}
                    className="input"
                    autoComplete="tel"
                    disabled={isLoading}
                  />
                </div>

                <div>
                  <label htmlFor="language" className="label">
                    {t({ en: 'Preferred Language', ur: 'ترجیبی زبان' }, language)}
                  </label>
                  <select
                    id="language"
                    name="language"
                    value={formData.language}
                    onChange={handleChange}
                    className="input"
                    disabled={isLoading}
                  >
                    <option value="en">{t({ en: 'English', ur: 'انگریزی' }, language)}</option>
                    <option value="ur">{t({ en: 'Urdu', ur: 'اردو' }, language)}</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="password" className="label">
                    {t({ en: 'Password', ur: 'پاس ورڈ' }, language)}
                  </label>
                  <div className="relative">
                    <input
                      id="password"
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      value={formData.password}
                      onChange={handleChange}
                      placeholder={t({ en: 'Create a password', ur: 'پاس ورڈ بنائیں' }, language)}
                      className="input pr-10"
                      required
                      autoComplete="new-password"
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

                <div>
                  <label htmlFor="confirmPassword" className="label">
                    {t({ en: 'Confirm Password', ur: 'پاس ورڈ کی تصدیق' }, language)}
                  </label>
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showPassword ? 'text' : 'password'}
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    placeholder={t({ en: 'Confirm your password', ur: 'اپنا پاس ورڈ تصدیق کریں' }, language)}
                    className="input"
                    required
                    autoComplete="new-password"
                    disabled={isLoading}
                  />
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
                      {t({ en: 'Creating account...', ur: 'اکاؤنٹ بنایا جا رہا ہے...' }, language)}
                    </>
                  ) : (
                    t({ en: 'Sign Up', ur: 'سائن اپ' }, language)
                  )}
                </button>
              </form>

              <div className="mt-6 text-center">
                <p className="text-secondary-600">
                  {t({ en: 'Already have an account?', ur: 'پہلے سے اکاؤنٹ ہے؟' }, language)}&nbsp;
                  <a href="/login" className="text-primary-600 font-medium hover:underline">
                    {t({ en: 'Sign In', ur: 'سائن ان' }, language)}
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