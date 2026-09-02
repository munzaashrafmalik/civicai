'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import { useToastHelpers } from '@/components/Toast';
import Navbar from '@/components/Navbar/Navbar';
import ScrollReveal from '@/components/ScrollReveal/ScrollReveal';
import Card3D from '@/components/Card3D/Card3D';
import { userApi, complaintsApi } from '@/lib/api';
import { getStoredLanguage } from '@/lib/i18n';

const t = (key: { en: string; ur: string }, lang: 'en' | 'ur') => lang === 'ur' ? key.ur : key.en;

interface NotificationSettings {
  emailNotifications: boolean;
  smsNotifications: boolean;
  pushNotifications: boolean;
  statusChanges: boolean;
  assignmentUpdates: boolean;
}

interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone?: string;
  language: 'en' | 'ur';
  role: string;
  profileImage?: string | null;
  notificationSettings?: NotificationSettings;
  createdAt?: string;
}

interface Notification {
  id: string;
  title: { en: string; ur: string };
  time: string;
  read: boolean;
  type: 'status' | 'assignment' | 'resolved' | 'welcome';
}

export default function ProfilePage() {
  const { data: session, status, update } = useSession();
  const router = useRouter();
  const { success, error: toastError } = useToastHelpers();
  const [language, setLanguage] = useState<'en' | 'ur'>(getStoredLanguage);
  const [activeTab, setActiveTab] = useState<'profile' | 'settings' | 'notifications'>('profile');
  const [user, setUser] = useState<UserProfile | null>(null);
  const [editName, setEditName] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editImage, setEditImage] = useState<string | null>(null);
  const [notifSettings, setNotifSettings] = useState<NotificationSettings>({
    emailNotifications: true,
    smsNotifications: false,
    pushNotifications: true,
    statusChanges: true,
    assignmentUpdates: true,
  });
  const [stats, setStats] = useState({
    totalComplaints: 0,
    resolvedComplaints: 0,
    pendingComplaints: 0,
    inProgressComplaints: 0,
  });
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login?callbackUrl=/profile');
      return;
    }
    if (session?.user) {
      fetchProfile();
      fetchStats();
      fetchNotifications();
    }
  }, [session, status]);

  const fetchProfile = async () => {
    try {
      const response = await userApi.getProfile();
      const profile = response.data as any;
      const profileData: UserProfile = {
        id: profile.id || (session?.user as any)?.id || '',
        name: profile.name || session?.user?.name || '',
        email: profile.email || session?.user?.email || '',
        phone: profile.phone || '',
        language: profile.language === 'ur' ? 'ur' : 'en',
        role: profile.role || 'citizen',
        profileImage: profile.profileImage || null,
        notificationSettings: profile.notificationSettings || {
          emailNotifications: true,
          smsNotifications: false,
          pushNotifications: true,
          statusChanges: true,
          assignmentUpdates: true,
        },
        createdAt: profile.createdAt,
      };
      setUser(profileData);
      setEditName(profileData.name);
      setEditPhone(profileData.phone || '');
      setEditImage(profileData.profileImage || null);
      setNotifSettings(profileData.notificationSettings || {
        emailNotifications: true,
        smsNotifications: false,
        pushNotifications: true,
        statusChanges: true,
        assignmentUpdates: true,
      });
      setLanguage(profileData.language);
    } catch (err) {
      console.error('Failed to fetch profile:', err);
      if (session?.user) {
        const fallback: UserProfile = {
          id: (session.user as any).id,
          name: session.user.name || '',
          email: session.user.email || '',
          phone: '',
          language: (session.user as any).language === 'ur' ? 'ur' : 'en',
          role: (session.user as any).role || 'citizen',
          profileImage: null,
          createdAt: new Date().toISOString(),
        };
        setUser(fallback);
        setEditName(fallback.name);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await complaintsApi.getAll({ userId: (session?.user as any)?.id });
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

  const fetchNotifications = async () => {
    try {
      const response = await fetch('/api/notifications');
      if (response.ok) {
        const data = await response.json();
        const notifs: Notification[] = (data.notifications || []).map((n: any) => ({
          id: n._id,
          title: { en: n.title, ur: n.title },
          time: n.createdAt,
          read: n.read,
          type: n.type,
        }));
        setNotifications(notifs);
      }
    } catch (err) {
      console.error('Failed to fetch notifications:', err);
    }
  };

  const markAsRead = async (notificationId: string) => {
    try {
      await fetch('/api/notifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'markRead', notificationId }),
      });
      setNotifications(prev =>
        prev.map(n => (n.id === notificationId ? { ...n, read: true } : n))
      );
    } catch (err) {
      console.error('Failed to mark notification as read:', err);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      toastError(t({ en: 'Invalid file', ur: 'غلط فائل' }, language), t({ en: 'Please select an image file', ur: 'براہ کرم ایک تصویر فائل منتخب کریں' }, language));
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      toastError(t({ en: 'File too large', ur: 'فائل بہت بڑی ہے' }, language), t({ en: 'Image must be under 2MB', ur: 'تصویر 2MB سے کم ہونی چاہیے' }, language));
      return;
    }
    const reader = new FileReader();
    reader.onload = (ev) => {
      setEditImage(ev.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSaveProfile = async () => {
    if (!editName.trim()) {
      toastError(t({ en: 'Name required', ur: 'نام ضروری ہے' }, language), t({ en: 'Please enter your name', ur: 'براہ کرم اپنا نام درج کریں' }, language));
      return;
    }
    setIsSaving(true);
    try {
      await userApi.updateProfile({
        name: editName.trim(),
        phone: editPhone.trim() || undefined,
        language,
        profileImage: editImage,
      });
      if (session?.user) {
        await update({ ...session.user, name: editName.trim() });
      }
      setUser(prev => prev ? { ...prev, name: editName.trim(), phone: editPhone.trim(), language, profileImage: editImage } : null);
      success(t({ en: 'Success!', ur: 'کامیابی!' }, language), t({ en: 'Profile updated successfully', ur: 'پروفائل کامیابی سے اپ ڈیٹ ہو گیا' }, language));
    } catch (err: any) {
      toastError(t({ en: 'Error', ur: 'خرابی' }, language), err.message || t({ en: 'Failed to update profile', ur: 'پروفائل اپ ڈیٹ کرنے میں ناکام' }, language));
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveSettings = async () => {
    setIsSaving(true);
    try {
      await userApi.updateProfile({ notificationSettings: notifSettings as unknown as Record<string, boolean> });
      setUser(prev => prev ? { ...prev, notificationSettings: notifSettings } : null);
      success(t({ en: 'Settings saved', ur: 'سیٹنگز محفوظ ہو گئیں' }, language), t({ en: 'Notification preferences updated', ur: 'اطلاعات کی ترجیحات اپ ڈیٹ ہو گئیں' }, language));
    } catch (err: any) {
      toastError(t({ en: 'Error', ur: 'خرابی' }, language), err.message || t({ en: 'Failed to save settings', ur: 'سیٹنگز محفوظ کرنے میں ناکام' }, language));
    } finally {
      setIsSaving(false);
    }
  };

  const markAllRead = async () => {
    try {
      await fetch('/api/notifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'markAllRead' }),
      });
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      success(t({ en: 'Done', ur: 'ہو گیا' }, language), t({ en: 'All notifications marked as read', ur: 'تمام اطلاعات پڑھی ہوئی نشان زد ہو گئیں' }, language));
    } catch (err) {
      console.error('Failed to mark all notifications as read:', err);
    }
  };

  const formatMemberSince = (dateStr?: string) => {
    if (!dateStr) return '—';
    const d = new Date(dateStr);
    return d.toLocaleDateString(language === 'ur' ? 'ur-PK' : 'en-GB', { month: 'long', year: 'numeric' });
  };

  const formatNotifTime = (dateStr: string) => {
    const d = new Date(dateStr);
    const now = new Date();
    const diff = now.getTime() - d.getTime();
    const mins = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    if (mins < 1) return t({ en: 'Just now', ur: 'ابھی' }, language);
    if (mins < 60) return t({ en: `${mins}m ago`, ur: `${mins} منٹ پہلے` }, language);
    if (hours < 24) return t({ en: `${hours}h ago`, ur: `${hours} گھنٹے پہلے` }, language);
    if (days < 7) return t({ en: `${days}d ago`, ur: `${days} دن پہلے` }, language);
    return d.toLocaleDateString(language === 'ur' ? 'ur-PK' : 'en-GB', { day: 'numeric', month: 'short' });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-neutral-50">
        <Navbar language={language} onLanguageChange={setLanguage} />
        <main className="pt-16">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="animate-pulse space-y-6">
              <div className="h-32 bg-neutral-200 rounded-2xl"></div>
              <div className="grid grid-cols-4 gap-4">
                {[1,2,3,4].map(i => <div key={i} className="h-20 bg-neutral-200 rounded-xl"></div>)}
              </div>
              <div className="h-64 bg-neutral-200 rounded-2xl"></div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-neutral-50">
        <Navbar language={language} onLanguageChange={setLanguage} />
        <main className="pt-16">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="card text-center py-16">
              <h2 className="text-xl font-semibold text-neutral-900 mb-2">
                {t({ en: 'Profile Not Found', ur: 'پروفائل نہیں ملا' }, language)}
              </h2>
            </div>
          </div>
        </main>
      </div>
    );
  }

  const unreadCount = notifications.filter(n => !n.read).length;

  const tabs = [
    { id: 'profile' as const, label: { en: 'Profile', ur: 'پروفائل' } },
    { id: 'settings' as const, label: { en: 'Settings', ur: 'سیٹنگز' } },
    { id: 'notifications' as const, label: { en: 'Notifications', ur: 'اطلاعات' }, badge: unreadCount },
  ];

  return (
    <div className="min-h-screen bg-neutral-50">
      <Navbar language={language} onLanguageChange={setLanguage} />

      <main className="pt-16 pb-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Profile Header */}
          <ScrollReveal animation="animate-slide-up">
            <Card3D intensity={8}>
            <div className="card mb-6">
            <div className="card-body">
              <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
                {/* Profile Image */}
                <div className="relative group">
                  <div
                    className="w-24 h-24 rounded-full overflow-hidden bg-secondary-100 flex items-center justify-center cursor-pointer border-4 border-white shadow-lg"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    {editImage ? (
                      <img src={editImage} alt={user.name} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-3xl font-bold text-secondary-600">{user.name.charAt(0).toUpperCase()}</span>
                    )}
                  </div>
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="absolute bottom-0 right-0 w-8 h-8 bg-secondary-600 rounded-full flex items-center justify-center text-white shadow-lg hover:bg-secondary-700 transition-colors"
                    aria-label={t({ en: 'Upload photo', ur: 'تصویر اپ لوڈ کریں' }, language)}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h.86a2 2 0 011.664.89l.812 1.22A2 2 0 0015.07 7H16a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </div>

                <div className="flex-1 text-center sm:text-left">
                  <h1 className="text-2xl font-bold text-neutral-900">{user.name}</h1>
                  <p className="text-neutral-500">{user.email}</p>
                  <p className="text-sm text-neutral-400 mt-1">
                    {t({ en: 'Member since', ur: 'رکنیت' }, language)} {formatMemberSince(user.createdAt)}
                  </p>
                  {user.role === 'admin' && (
                    <span className="inline-block mt-2 px-3 py-1 text-xs font-medium bg-secondary-100 text-secondary-700 rounded-full">
                      {t({ en: 'Administrator', ur: 'ایڈمنسٹریٹر' }, language)}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
          </Card3D>
          </ScrollReveal>

          {/* Stats */}
          <ScrollReveal animation="animate-slide-up" delay={100}>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6" role="list" aria-label={t({ en: 'Complaint statistics', ur: 'شکایات کی شماریات' }, language)}>
              {[
                { value: stats.totalComplaints, label: { en: 'Total Reports', ur: 'کل رپورٹس' }, color: 'text-neutral-900' },
                { value: stats.resolvedComplaints, label: { en: 'Resolved', ur: 'حل ہو گئے' }, color: 'text-success-600' },
                { value: stats.inProgressComplaints, label: { en: 'In Progress', ur: 'جاری ہیں' }, color: 'text-warning-600' },
                { value: stats.pendingComplaints, label: { en: 'Pending', ur: 'زیر التوا' }, color: 'text-secondary-600' },
              ].map((stat, i) => (
                <Card3D key={i} intensity={8}>
                <div className="card p-4 text-center hover:shadow-lg hover:-translate-y-1 transition-all duration-300" role="listitem">
                  <div className={`text-3xl font-bold ${stat.color}`}>{stat.value}</div>
                  <div className="text-sm text-neutral-500">{t(stat.label, language)}</div>
                </div>
                </Card3D>
              ))}
            </div>
          </ScrollReveal>

          {/* Tabs */}
          <Card3D intensity={6}>
          <div className="card">
            <div className="border-b border-neutral-200" role="tablist">
              <nav className="flex flex-wrap -mb-px">
                {tabs.map(tab => (
                  <button
                    key={tab.id}
                    role="tab"
                    aria-selected={activeTab === tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${
                      activeTab === tab.id
                        ? 'border-secondary-600 text-secondary-600'
                        : 'border-transparent text-neutral-400 hover:text-neutral-600 hover:border-neutral-300'
                    }`}
                  >
                    {t(tab.label, language)}
                    {tab.badge ? (
                      <span className="px-2 py-0.5 text-xs font-bold bg-secondary-600 text-white rounded-full">{tab.badge}</span>
                    ) : null}
                  </button>
                ))}
              </nav>
            </div>

            {/* Profile Tab */}
            <div role="tabpanel" className="card-body animate-fade-in" hidden={activeTab !== 'profile'}>
              <div className="space-y-6">
                <div className="grid sm:grid-cols-2 gap-6">
                  <div>
                    <label className="label">{t({ en: 'Full Name', ur: 'پورا نام' }, language)}</label>
                    <input
                      type="text"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="input"
                      placeholder={t({ en: 'Enter your name', ur: 'اپنا نام درج کریں' }, language)}
                    />
                  </div>
                  <div>
                    <label className="label">{t({ en: 'Email Address', ur: 'ای میل ایڈریس' }, language)}</label>
                    <input type="email" value={user.email} className="input bg-neutral-100 cursor-not-allowed" disabled />
                    <p className="text-xs text-neutral-400 mt-1">{t({ en: 'Email cannot be changed', ur: 'ای میل تبدیل نہیں ہو سکتی' }, language)}</p>
                  </div>
                  <div>
                    <label className="label">{t({ en: 'Phone Number', ur: 'فون نمبر' }, language)}</label>
                    <input
                      type="tel"
                      value={editPhone}
                      onChange={(e) => setEditPhone(e.target.value)}
                      className="input"
                      placeholder="+92-300-0000000"
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

                {/* Profile Image Section */}
                <div className="pt-4 border-t border-neutral-200">
                  <label className="label">{t({ en: 'Profile Photo', ur: 'پروفائل تصویر' }, language)}</label>
                  <div className="flex items-center gap-4">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="btn-outline text-sm"
                    >
                      {editImage
                        ? t({ en: 'Change Photo', ur: 'تصویر تبدیل کریں' }, language)
                        : t({ en: 'Upload Photo', ur: 'تصویر اپ لوڈ کریں' }, language)}
                    </button>
                    {editImage && (
                      <button
                        type="button"
                        onClick={() => setEditImage(null)}
                        className="text-sm text-danger-600 hover:text-danger-700"
                      >
                        {t({ en: 'Remove', ur: 'حذف کریں' }, language)}
                      </button>
                    )}
                    <span className="text-xs text-neutral-400">{t({ en: 'JPG, PNG or GIF. Max 2MB.', ur: 'JPG، PNG یا GIF۔ زیادہ سے زیادہ 2MB۔' }, language)}</span>
                  </div>
                </div>

                <div className="pt-4 border-t border-neutral-200">
                  <button
                    className="btn-primary"
                    disabled={isSaving}
                    onClick={handleSaveProfile}
                  >
                    {isSaving ? t({ en: 'Saving...', ur: 'محفوظ ہو رہا ہے...' }, language) : t({ en: 'Save Changes', ur: 'تبدیلیاں محفوظ کریں' }, language)}
                  </button>
                </div>
              </div>
            </div>

            {/* Settings Tab */}
            <div role="tabpanel" className="card-body animate-fade-in" hidden={activeTab !== 'settings'}>
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-neutral-900 mb-1">{t({ en: 'Notification Preferences', ur: 'اطلاعات کی ترجیحات' }, language)}</h3>
                  <p className="text-sm text-neutral-400 mb-4">{t({ en: 'Choose how you want to be notified', ur: 'منتخب کریں کہ آپ کو کیسے مطلع کیا جائے' }, language)}</p>
                </div>

                <div className="space-y-3">
                  {([
                    { key: 'emailNotifications', label: { en: 'Email Notifications', ur: 'ای میل اطلاعات' }, desc: { en: 'Receive updates about your complaints via email', ur: 'ای میل کے ذریعے اپنی شکایات کے بارے میں اپ ڈیٹس حاصل کریں' } },
                    { key: 'smsNotifications', label: { en: 'SMS Notifications', ur: 'ایس ایم ایس اطلاعات' }, desc: { en: 'Receive updates via text message', ur: 'ٹیکسٹ پیغام کے ذریعے اپ ڈیٹس حاصل کریں' } },
                    { key: 'pushNotifications', label: { en: 'Push Notifications', ur: 'پش اطلاعات' }, desc: { en: 'Receive browser push notifications', ur: 'براؤزر پش اطلاعات حاصل کریں' } },
                    { key: 'statusChanges', label: { en: 'Status Changes', ur: 'حالت کی تبدیلیاں' }, desc: { en: 'Get notified when complaint status changes', ur: 'جب شکایت کی حالت بدلے تو مطلع کریں' } },
                    { key: 'assignmentUpdates', label: { en: 'Assignment Updates', ur: 'تعیناتی کے اپ ڈیٹس' }, desc: { en: 'Get notified when a complaint is assigned to an organization', ur: 'جب شکایت کسی ادارے کو متعین ہو تو مطلع کریں' } },
                  ] as const).map(item => (
                    <label key={item.key} className="flex items-center justify-between p-4 rounded-xl bg-neutral-50 hover:bg-neutral-100 transition-colors cursor-pointer">
                      <div className="flex-1 mr-4">
                        <p className="font-medium text-neutral-900">{t(item.label, language)}</p>
                        <p className="text-sm text-neutral-400 mt-0.5">{t(item.desc, language)}</p>
                      </div>
                      <button
                        type="button"
                        role="switch"
                        aria-checked={notifSettings[item.key]}
                        onClick={() => setNotifSettings(prev => ({ ...prev, [item.key]: !prev[item.key] }))}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors flex-shrink-0 ${
                          notifSettings[item.key] ? 'bg-secondary-600' : 'bg-secondary-300'
                        }`}
                      >
                        <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          notifSettings[item.key] ? 'translate-x-6' : 'translate-x-1'
                        }`} />
                      </button>
                    </label>
                  ))}
                </div>

                <div className="pt-4 border-t border-neutral-200">
                  <button
                    className="btn-primary"
                    disabled={isSaving}
                    onClick={handleSaveSettings}
                  >
                    {isSaving ? t({ en: 'Saving...', ur: 'محفوظ ہو رہا ہے...' }, language) : t({ en: 'Save Settings', ur: 'سیٹنگز محفوظ کریں' }, language)}
                  </button>
                </div>

                <div className="pt-6 border-t border-neutral-200">
                  <h3 className="text-lg font-semibold text-neutral-900 mb-4">{t({ en: 'Account', ur: 'اکاؤنٹ' }, language)}</h3>
                  <div className="space-y-3">
                    <button className="btn-outline w-full justify-start text-neutral-500">
                      {t({ en: 'Change Password', ur: 'پاس ورڈ تبدیل کریں' }, language)}
                    </button>
                    <button className="btn-outline w-full justify-start text-danger-600 hover:bg-danger-50 border-danger-200">
                      {t({ en: 'Delete Account', ur: 'اکاؤنٹ حذف کریں' }, language)}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Notifications Tab */}
            <div role="tabpanel" className="card-body animate-fade-in" hidden={activeTab !== 'notifications'}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-neutral-900">
                  {t({ en: 'Notifications', ur: 'اطلاعات' }, language)}
                  {unreadCount > 0 && (
                    <span className="ml-2 px-2 py-0.5 text-xs font-bold bg-secondary-100 text-secondary-700 rounded-full">{unreadCount}</span>
                  )}
                </h3>
                {unreadCount > 0 && (
                  <button onClick={markAllRead} className="text-sm text-secondary-600 hover:text-secondary-700 font-medium">
                    {t({ en: 'Mark all as read', ur: 'سب کو پڑھا ہوا نشان دیں' }, language)}
                  </button>
                )}
              </div>

              {notifications.length === 0 ? (
                <div className="text-center py-12">
                  <svg className="w-16 h-16 mx-auto text-neutral-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                  </svg>
                  <p className="text-neutral-400">{t({ en: 'No notifications yet', ur: 'ابھی تک کوئی اطلاع نہیں' }, language)}</p>
                  <p className="text-sm text-neutral-400 mt-1">{t({ en: 'You\'ll be notified when your complaints are updated', ur: 'جب آپ کی شکایات اپ ڈیٹ ہوں گی تو آپ کو مطلع کیا جائے گا' }, language)}</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {notifications.map(notif => (
                    <div
                      key={notif.id}
                      className={`flex items-start gap-3 p-4 rounded-xl transition-colors ${
                        !notif.read ? 'bg-secondary-50 border border-secondary-200' : 'bg-neutral-50 hover:bg-neutral-100'
                      }`}
                    >
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                        notif.type === 'resolved' ? 'bg-success-100 text-success-600'
                        : notif.type === 'status' ? 'bg-secondary-100 text-secondary-600'
                        : notif.type === 'assignment' ? 'bg-warning-100 text-warning-600'
                        : 'bg-secondary-100 text-neutral-500'
                      }`}>
                        {notif.type === 'resolved' ? (
                          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                        ) : notif.type === 'welcome' ? (
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        ) : (
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`font-medium ${!notif.read ? 'text-neutral-900' : 'text-neutral-600'}`}>
                          {t(notif.title, language)}
                        </p>
                        <p className="text-sm text-neutral-400 mt-1">{formatNotifTime(notif.time)}</p>
                      </div>
                      {!notif.read && (
                        <span className="w-2.5 h-2.5 rounded-full bg-secondary-600 flex-shrink-0 mt-2" />
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
          </Card3D>
        </div>
      </main>
    </div>
  );
}
