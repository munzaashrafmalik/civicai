'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import { useToastHelpers } from '@/components/Toast';
import Navbar from '@/components/Navbar/Navbar';
import { userApi, complaintsApi } from '@/lib/api';

const t = (key: { en: string; ur: string }, lang: 'en' | 'ur') => lang === 'ur' ? key.ur : key.en;

interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone?: string;
  language: 'en' | 'ur';
  role: string;
  createdAt?: string;
  totalComplaints?: number;
  resolvedComplaints?: number;
  pendingComplaints?: number;
  inProgressComplaints?: number;
}

export default function ProfilePage() {
  const { data: session, status, update } = useSession();
  const router = useRouter();
  const { success, error: toastError } = useToastHelpers();
  const [language, setLanguage] = useState<'en' | 'ur'>('en');
  const [activeTab, setActiveTab] = useState<'profile' | 'settings' | 'notifications'>('profile');
  const [user, setUser] = useState<UserProfile | null>(null);
  const [stats, setStats] = useState({
    totalComplaints: 0,
    resolvedComplaints: 0,
    pendingComplaints: 0,
    inProgressComplaints: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login?callbackUrl=/profile');
      return;
    }

    if (session?.user) {
      fetchProfile();
      fetchStats();
    }
  }, [session, status]);

  const fetchProfile = async () => {
    try {
      const response = await userApi.getProfile();
      const profile = response.data as any;
      setUser({
        id: profile.id || (session?.user as any)?.id || '',
        name: profile.name || session?.user?.name || '',
        email: profile.email || session?.user?.email || '',
        phone: profile.phone,
        language: profile.language === 'ur' ? 'ur' : 'en',
        role: profile.role || 'citizen',
        createdAt: profile.createdAt,
      });
      setLanguage(profile.language === 'ur' ? 'ur' : 'en');
    } catch (err) {
      console.error('Failed to fetch profile:', err);
      if (session?.user) {
        setUser({
          id: (session.user as any).id,
          name: session.user.name || '',
          email: session.user.email || '',
          phone: (session.user as any).phone,
          language: (session.user as any).language === 'ur' ? 'ur' : 'en',
          role: (session.user as any).role || 'citizen',
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await complaintsApi.getAll();
      const complaints: any[] = (response.data as any[]) || [];
      setStats({
        totalComplaints: complaints.length,
        resolvedComplaints: complaints.filter(c => c.status === 'resolved').length,
        pendingComplaints: complaints.filter(c => c.status === 'pending').length,
        inProgressComplaints: complaints.filter(c => c.status === 'in_progress').length,
      });
    } catch (err) {
      console.error('Failed to fetch stats:', err);
    }
  };

  const handleSaveProfile = async (formData: { name?: string; phone?: string; language?: string }) => {
    setIsSaving(true);
    try {
      const response = await userApi.updateProfile(formData);
      // Update session
      if (session?.user) {
        await update({
          ...session.user,
          name: formData.name || session.user.name,
        });
      }
      setUser(prev => prev ? { ...prev, ...formData, language: (formData.language as 'en' | 'ur') || prev.language } : null);
      success(t({ en: 'Success!', ur: 'کامیابی!' }, language), t({ en: 'Profile updated successfully', ur: 'پروفائل کامیابی سے اپ ڈیٹ ہو گیا' }, language));
    } catch (err: any) {
      console.error('Failed to update profile:', err);
      toastError(t({ en: 'Error', ur: 'خرابی' }, language), err.message || t({ en: 'Failed to update profile', ur: 'پروفائل اپ ڈیٹ کرنے میں ناکام' }, language));
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-secondary-50">
        <Navbar language={language} onLanguageChange={setLanguage} />
        <main className="pt-16">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="animate-pulse space-y-6">
              <div className="h-8 bg-secondary-200 rounded w-1/2"></div>
              <div className="h-32 bg-secondary-200 rounded"></div>
              <div className="h-4 bg-secondary-200 rounded w-3/4"></div>
              <div className="h-4 bg-secondary-200 rounded w-1/2"></div>
              <div className="h-4 bg-secondary-200 rounded w-1/4"></div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-secondary-50">
        <Navbar language={language} onLanguageChange={setLanguage} />
        <main className="pt-16">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="card text-center py-16">
              <h2 className="text-xl font-semibold text-secondary-900 mb-2">
                {t({ en: 'Profile Not Found', ur: 'پروفائل نہیں ملا' }, language)}
              </h2>
            </div>
          </div>
        </main>
      </div>
    );
  }

  const tabs = [
    { id: 'profile', label: { en: 'Profile', ur: 'پروفائل' }, icon: 'user' },
    { id: 'settings', label: { en: 'Settings', ur: 'سیٹنگز' }, icon: 'cog' },
    { id: 'notifications', label: { en: 'Notifications', ur: 'اطلاعات' }, icon: 'bell' },
  ];

  return (
    <div className="min-h-screen bg-secondary-50">
      <Navbar language={language} onLanguageChange={setLanguage} />

      <main className="pt-16 pb-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Profile Header */}
          <div className="card mb-6">
            <div className="card-body">
              <div className="flex flex-col sm:flex-row items-center sm:items-start justify-between gap-6">
                <div className="flex items-center gap-4">
                  <div className="w-20 h-20 rounded-full bg-primary-100 flex items-center justify-center">
                    <span className="text-2xl font-bold text-primary-600">
                      {user.name.charAt(0)}
                    </span>
                  </div>
                  <div>
                    <h1 className="text-2xl font-bold text-secondary-900">{user.name}</h1>
                    <p className="text-secondary-600">{user.email}</p>
                    <p className="text-sm text-secondary-500 mt-1">
                      {t({ en: 'Member since', ur: 'رکنیت' }, language)} {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : '—'}
                    </p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button className="btn-outline" onClick={() => setActiveTab('profile')}>{t({ en: 'Edit Profile', ur: 'پروفائل ترمیم کریں' }, language)}</button>
                </div>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6" role="list" aria-label={t({ en: 'Complaint statistics', ur: 'شکایات کی شماریات' }, language)}>
            <div className="card p-4 text-center" role="listitem">
              <div className="text-3xl font-bold text-secondary-900">{stats.totalComplaints}</div>
              <div className="text-sm text-secondary-600">{t({ en: 'Total Reports', ur: 'کل رپورٹس' }, language)}</div>
            </div>
            <div className="card p-4 text-center" role="listitem">
              <div className="text-3xl font-bold text-success-600">{stats.resolvedComplaints}</div>
              <div className="text-sm text-secondary-600">{t({ en: 'Resolved', ur: 'حل ہو گئے' }, language)}</div>
            </div>
            <div className="card p-4 text-center" role="listitem">
              <div className="text-3xl font-bold text-warning-600">{stats.inProgressComplaints}</div>
              <div className="text-sm text-secondary-600">{t({ en: 'In Progress', ur: 'جاری ہیں' }, language)}</div>
            </div>
            <div className="card p-4 text-center" role="listitem">
              <div className="text-3xl font-bold text-primary-600">{stats.pendingComplaints}</div>
              <div className="text-sm text-secondary-600">{t({ en: 'Pending', ur: 'زیر التوا' }, language)}</div>
            </div>
          </div>

          {/* Tabs */}
          <div className="card">
            <div className="border-b border-secondary-200" role="tablist" aria-label={t({ en: 'Profile sections', ur: 'پروفائل حصے' }, language)}>
              <nav className="flex flex-wrap -mb-px" aria-label={t({ en: 'Profile tabs', ur: 'پروفائل ٹیبز' }, language)}>
                {tabs.map(tab => (
                  <button
                    key={tab.id}
                    role="tab"
                    aria-selected={activeTab === tab.id}
                    aria-controls={`${tab.id}-panel`}
                    id={`${tab.id}-tab`}
                    onClick={() => setActiveTab(tab.id as typeof activeTab)}
                    className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                      activeTab === tab.id
                        ? 'border-primary-600 text-primary-600'
                        : 'border-transparent text-secondary-500 hover:text-secondary-700 hover:border-secondary-300'
                    }`}
                  >
                    {t(tab.label, language)}
                  </button>
                ))}
              </nav>
            </div>

            {/* Profile Tab */}
            <div role="tabpanel" id="profile-panel" aria-labelledby="profile-tab" className="card-body animate-fade-in" hidden={activeTab !== 'profile'}>
              <div className="space-y-6">
                <div className="grid sm:grid-cols-2 gap-6">
                  <div>
                    <label className="label">{t({ en: 'Full Name', ur: 'پورا نام' }, language)}</label>
                    <input type="text" defaultValue={user.name} className="input" disabled />
                  </div>
                  <div>
                    <label className="label">{t({ en: 'Email Address', ur: 'ای میل ایڈریس' }, language)}</label>
                    <input type="email" defaultValue={user.email} className="input" disabled />
                  </div>
                  <div>
                    <label className="label">{t({ en: 'Phone Number', ur: 'فون نمبر' }, language)}</label>
                    <input
                      type="tel"
                      value={user.phone || ''}
                      onChange={(e) => setUser(prev => prev ? { ...prev, phone: e.target.value } : prev)}
                      className="input"
                    />
                  </div>
                  <div>
                    <label className="label">{t({ en: 'Preferred Language', ur: 'ترجیبی زبان' }, language)}</label>
                    <select className="input" value={language} onChange={(e) => setLanguage(e.target.value as 'en' | 'ur')}>
                      <option value="en">{t({ en: 'English', ur: 'انگریزی' }, language)}</option>
                      <option value="ur">{t({ en: 'Urdu', ur: 'اردو' }, language)}</option>
                    </select>
                  </div>
                </div>
                <div className="pt-4 border-t border-secondary-200">
                  <button
                    className="btn-primary"
                    disabled={isSaving}
                    onClick={() => handleSaveProfile({ name: user.name, phone: user.phone, language })}
                  >
                    {isSaving ? t({ en: 'Saving...', ur: 'محفوظ ہو رہا ہے...' }, language) : t({ en: 'Save Changes', ur: 'تبدیلیاں محفوظ کریں' }, language)}
                  </button>
                </div>
              </div>
            </div>

            {/* Settings Tab */}
            <div role="tabpanel" id="settings-panel" aria-labelledby="settings-tab" className="card-body animate-fade-in" hidden={activeTab !== 'settings'}>
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-secondary-900">{t({ en: 'Notification Preferences', ur: 'اطلاعات کی ترجیحات' }, language)}</h3>
                <div className="space-y-4">
                  {[
                    { id: 'email', label: { en: 'Email notifications', ur: 'ای میل نوٹیفیکیشنز' }, desc: { en: 'Receive updates via email', ur: 'ای میل کے ذریعے اپ ڈیٹس حاصل کریں' } },
                    { id: 'sms', label: { en: 'SMS notifications', ur: 'ایم ایس نوٹیفیکیشنز' }, desc: { en: 'Receive updates via SMS', ur: 'ایم ایس کے ذریعے اپ ڈیٹس حاصل کریں' } },
                    { id: 'push', label: { en: 'Push notifications', ur: 'پش نوٹیفیکیشنز' }, desc: { en: 'Receive browser push notifications', ur: 'براؤزر پیش نوٹیفیکیشنز حاصل کریں' } },
                    { id: 'status', label: { en: 'Status changes', ur: 'حالت کی تبدیلیاں' }, desc: { en: 'Notify when complaint status changes', ur: 'جب شکایت کی حالت بدلے تو مطلع کریں' } },
                    { id: 'assignment', label: { en: 'Assignment updates', ur: 'تعیناتی کے اپ ڈیٹس' }, desc: { en: 'Notify when complaint is assigned', ur: 'جب شکایت متعین ہو تو مطلع کریں' } },
                  ].map(item => (
                    <label key={item.id} className="flex items-center justify-between p-4 rounded-lg bg-secondary-50 hover:bg-secondary-100 transition-colors cursor-pointer">
                      <div>
                        <p className="font-medium text-secondary-900">{t(item.label, language)}</p>
                        <p className="text-sm text-secondary-600">{t(item.desc, language)}</p>
                      </div>
                      <input
                        type="checkbox"
                        defaultChecked={item.id !== 'sms'}
                        className="w-5 h-5 text-primary-600 border-secondary-300 rounded focus:ring-primary-500"
                      />
                    </label>
                  ))}
                </div>

                <div className="pt-6 border-t border-secondary-200">
                  <h3 className="text-lg font-semibold text-secondary-900 mb-4">{t({ en: 'Account Actions', ur: 'اکاؤنٹ ایکشنز' }, language)}</h3>
                  <div className="space-y-3">
                    <button className="btn-outline w-full justify-start">Export My Data</button>
                    <button className="btn-outline w-full justify-start text-danger-600 hover:bg-danger-50 border-danger-200">Delete Account</button>
                  </div>
                </div>
              </div>
            </div>

            {/* Notifications Tab */}
            <div role="tabpanel" id="notifications-panel" aria-labelledby="notifications-tab" className="card-body animate-fade-in" hidden={activeTab !== 'notifications'}>
              <div className="space-y-4">
                {[
                  { title: { en: 'Complaint CIV-001234 updated', ur: 'شکایت CIV-001234 اپ ڈیٹ ہوئی' }, time: '2 hours ago', read: false, type: 'status' },
                  { title: { en: 'Complaint CIV-001235 assigned', ur: 'شکایت CIV-001235 متعین ہوئی' }, time: '1 day ago', read: false, type: 'assignment' },
                  { title: { en: 'Complaint CIV-001236 resolved', ur: 'شکایت CIV-001236 حل ہوئی' }, time: '3 days ago', read: true, type: 'resolved' },
                  { title: { en: 'Welcome to CivicAI!', ur: 'CivicAI میں خیر مقدمید!' }, time: '1 week ago', read: true, type: 'welcome' },
                ].map((notif, i) => (
                  <div key={i} className={`flex items-start gap-3 p-4 rounded-lg ${!notif.read ? 'bg-primary-50 border border-primary-200' : 'bg-secondary-50'}`}>
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${notif.type === 'resolved' ? 'bg-success-100 text-success-600' : notif.type === 'status' ? 'bg-primary-100 text-primary-600' : notif.type === 'assignment' ? 'bg-warning-100 text-warning-600' : 'bg-secondary-100 text-secondary-600'}`}>
                      {notif.type === 'resolved' ? (
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                      ) : notif.type === 'status' ? (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                      ) : notif.type === 'assignment' ? (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" /></svg>
                      ) : (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" /></svg>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`font-medium ${!notif.read ? 'text-secondary-900' : 'text-secondary-700'}`}>{t(notif.title, language)}</p>
                      <p className="text-sm text-secondary-500 mt-1">{t({ en: notif.time, ur: notif.time }, language)}</p>
                    </div>
                    {!notif.read && (
                      <span className="w-2 h-2 rounded-full bg-primary-600 flex-shrink-0 mt-2" />
                    )}
                  </div>
                ))}
              </div>
              <div className="mt-6 text-center">
                <button className="btn-outline">{t({ en: 'Mark all as read', ur: 'سب کو پڑھا ہوا نشان دیں' }, language)}</button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}