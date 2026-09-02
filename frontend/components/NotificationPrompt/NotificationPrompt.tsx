'use client';

import React, { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { usePushNotifications } from '@/hooks/usePushNotifications';
import { getStoredLanguage } from '@/lib/i18n';

const t = (key: { en: string; ur: string }, lang: 'en' | 'ur') => lang === 'ur' ? key.ur : key.en;

export default function NotificationPrompt() {
  const { data: session } = useSession();
  const { isSupported, permission, requestPermission } = usePushNotifications();
  const [showPrompt, setShowPrompt] = useState(false);
  const [language, setLanguage] = useState<'en' | 'ur'>('en');

  useEffect(() => {
    setLanguage(getStoredLanguage());
  }, []);

  useEffect(() => {
    if (session && isSupported && permission === 'default') {
      const timer = setTimeout(() => {
        setShowPrompt(true);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [session, isSupported, permission]);

  const handleEnable = async () => {
    await requestPermission();
    setShowPrompt(false);
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    localStorage.setItem('notification_prompt_dismissed', Date.now().toString());
  };

  if (!showPrompt || !session) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-sm animate-slide-up">
      <div className="card shadow-2xl border-2 border-secondary-200">
        <div className="card-body p-6">
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0">
              <div className="w-12 h-12 rounded-full bg-secondary-100 flex items-center justify-center">
                <svg className="w-6 h-6 text-secondary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
              </div>
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-neutral-900 mb-2">
                {t({ en: 'Enable Notifications', ur: 'اطلاعات فعال کریں' }, language)}
              </h3>
              <p className="text-sm text-neutral-600 mb-4">
                {t({
                  en: 'Get real-time updates about your complaints via push notifications on your device.',
                  ur: 'اپنے ڈیوائس پر پوش اطلاعات کے ذریعے اپنی شکایات کے بارے میں حقیقی وقت میں اپ ڈیٹس حاصل کریں।'
                }, language)}
              </p>
              <div className="flex gap-2">
                <button
                  onClick={handleEnable}
                  className="btn-primary text-sm px-4 py-2"
                >
                  {t({ en: 'Enable', ur: 'فعال کریں' }, language)}
                </button>
                <button
                  onClick={handleDismiss}
                  className="btn-outline text-sm px-4 py-2"
                >
                  {t({ en: 'Not Now', ur: 'ابھی نہیں' }, language)}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
