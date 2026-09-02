'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import Navbar from '@/components/Navbar/Navbar';
import Card3D from '@/components/Card3D/Card3D';
import ScrollReveal from '@/components/ScrollReveal/ScrollReveal';
import { adminApi, organizationsApi } from '@/lib/api';
import ComplaintTable from './complaints/ComplaintTable';
import AnalyticsCharts from './analytics/AnalyticsCharts';
import { getStoredLanguage } from '@/lib/i18n';

const t = (key: { en: string; ur: string }, lang: 'en' | 'ur') => lang === 'ur' ? key.ur : key.en;

interface DashboardData {
  overview: {
    totalComplaints: number;
    pendingComplaints: number;
    inProgressComplaints: number;
    resolvedComplaints: number;
    rejectedComplaints: number;
    totalUsers: number;
    totalOrganizations: number;
    resolutionRate: string;
  };
  recentComplaints: any[];
  categoryStats: Array<{ _id: string; count: number }>;
  cityStats: Array<{ _id: string; count: number }>;
  severityStats: Array<{ _id: string; count: number }>;
  weeklyTrend: Array<{ _id: string; count: number }>;
}

interface OrganizationItem {
  _id: string;
  name: string;
  nameUrdu?: string;
  city: string;
  email?: string;
  phone?: string;
  categories: string[];
  isActive: boolean;
}

export default function AdminDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [language, setLanguage] = useState<'en' | 'ur'>(getStoredLanguage);
  const [activeTab, setActiveTab] = useState<'overview' | 'complaints' | 'analytics' | 'organizations'>('overview');
  const [data, setData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [complaints, setComplaints] = useState<any[]>([]);
  const [complaintsLoading, setComplaintsLoading] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [organizations, setOrganizations] = useState<OrganizationItem[]>([]);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login?callbackUrl=/admin');
    } else if (status === 'authenticated' && (session?.user as any)?.role !== 'admin') {
      router.push('/unauthorized');
    }
  }, [status, session, router]);

  const fetchDashboardData = useCallback(async () => {
    try {
      setError(null);
      const response = await adminApi.getDashboard();
      setData(response.data as DashboardData);
    } catch (error: any) {
      console.error('Failed to fetch dashboard data:', error);
      setError(error?.message || 'Failed to load dashboard data');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchComplaints = useCallback(async () => {
    setComplaintsLoading(true);
    try {
      const response = await adminApi.getComplaints({
        status: filterStatus !== 'all' ? filterStatus : undefined,
        limit: 100,
      });
      setComplaints((response.data as any[]) || []);
    } catch (error: any) {
      console.error('Failed to fetch complaints:', error);
      setComplaints([]);
    } finally {
      setComplaintsLoading(false);
    }
  }, [filterStatus]);

  const fetchOrganizations = useCallback(async () => {
    try {
      const response = await organizationsApi.getAll();
      setOrganizations((response.data as any[]) || []);
    } catch (error: any) {
      console.error('Failed to fetch organizations:', error);
    }
  }, []);

  useEffect(() => {
    if (status === 'authenticated' && (session?.user as any)?.role === 'admin') {
      fetchDashboardData();
    }
  }, [status, session, fetchDashboardData]);

  useEffect(() => {
    if (status === 'authenticated' && (session?.user as any)?.role === 'admin') {
      fetchComplaints();
    }
  }, [status, session, filterStatus, fetchComplaints]);

  useEffect(() => {
    if (activeTab === 'organizations' && organizations.length === 0 && status === 'authenticated') {
      fetchOrganizations();
    }
  }, [activeTab, organizations.length, status, fetchOrganizations]);

  const handleStatusChange = async (id: string, newStatus: string) => {
    setUpdatingId(id);
    try {
      await adminApi.updateComplaintStatus(id, newStatus);
      setComplaints(prev => prev.map(c => c.id === id ? { ...c, status: newStatus } : c));
      fetchDashboardData();
    } catch (error: any) {
      console.error('Failed to update status:', error);
    } finally {
      setUpdatingId(null);
    }
  };

  const iconColors: Record<string, string> = {
    primary: 'bg-secondary-100 text-secondary-600',
    warning: 'bg-warning-100 text-warning-600',
    success: 'bg-success-100 text-success-600',
    secondary: 'bg-neutral-100 text-neutral-600',
  };

  const overview = data?.overview;
  const statCards = [
    { label: { en: 'Total Complaints', ur: 'کل شکایات' }, value: overview?.totalComplaints || 0, color: 'primary', icon: 'file-text' },
    { label: { en: 'Pending', ur: 'زیر التوا' }, value: overview?.pendingComplaints || 0, color: 'warning', icon: 'clock' },
    { label: { en: 'In Progress', ur: 'جاری ہیں' }, value: overview?.inProgressComplaints || 0, color: 'primary', icon: 'refresh-cw' },
    { label: { en: 'Resolved', ur: 'حل ہو گئے' }, value: overview?.resolvedComplaints || 0, color: 'success', icon: 'check-circle' },
    { label: { en: 'Total Users', ur: 'کل صارفین' }, value: overview?.totalUsers || 0, color: 'secondary', icon: 'users' },
    { label: { en: 'Resolution Rate', ur: 'حل ہونے کی شرح' }, value: `${overview?.resolutionRate || 0}%`, color: 'primary', icon: 'trending-up' },
  ];

  const tabs = [
    { id: 'overview', label: { en: 'Overview', ur: 'جائزہ' } },
    { id: 'complaints', label: { en: 'Complaints', ur: 'شکایات' } },
    { id: 'analytics', label: { en: 'Analytics', ur: 'تجزیہ' } },
    { id: 'organizations', label: { en: 'Organizations', ur: 'ادارے' } },
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-neutral-50">
        <Navbar language={language} onLanguageChange={setLanguage} />
        <main className="pt-16 p-6">
          <div className="max-w-7xl mx-auto animate-pulse space-y-6">
            <div className="grid grid-cols-2 lg:grid-cols-6 gap-4">
              {[1,2,3,4,5,6].map(i => <div key={i} className="card p-6"><div className="h-8 bg-neutral-200 rounded w-1/2 mb-2"></div><div className="h-4 bg-neutral-200 rounded w-3/4"></div></div>)}
            </div>
            <div className="h-64 bg-neutral-200 rounded-xl"></div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      <Navbar language={language} onLanguageChange={setLanguage} />

      <main className="pt-16 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <ScrollReveal animation="animate-slide-up">
            <div className="flex items-center justify-between mb-8">
              <div>
                <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-secondary-50 text-secondary-700 text-xs font-semibold border border-secondary-200/50 mb-3">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    </svg>
                    {t({ en: 'Administration', ur: 'انتظامیہ' }, language)}
                  </span>
                <h1 className="text-3xl font-bold text-neutral-900">{t({ en: 'Admin Dashboard', ur: 'ایڈمن ڈیش بورڈ' }, language)}</h1>
                <p className="text-neutral-500 mt-1">{t({ en: 'Manage and monitor civic complaints', ur: 'شہری شکایات کا انتظام اور نگرانی کریں' }, language)}</p>
              </div>
            </div>
          </ScrollReveal>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
            {statCards.map((stat, i) => (
              <Card3D key={i} intensity={8}>
              <div className="card p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-neutral-600">{t(stat.label, language)}</p>
                    <p className="text-3xl font-bold text-neutral-900 mt-1">{stat.value}</p>
                  </div>
                  <div className={`w-12 h-12 rounded-xl ${iconColors[stat.color]} flex items-center justify-center`}>
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      {stat.icon === 'file-text' && <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />}
                      {stat.icon === 'clock' && <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />}
                      {stat.icon === 'refresh-cw' && <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />}
                      {stat.icon === 'check-circle' && <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />}
                      {stat.icon === 'users' && <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />}
                      {stat.icon === 'trending-up' && <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />}
                    </svg>
                  </div>
                </div>
              </div>
              </Card3D>
            ))}
          </div>

          {/* Tabs */}
          <Card3D intensity={6}>
          <div className="card">
            <div className="border-b border-neutral-200" role="tablist">
              <nav className="flex flex-wrap -mb-px" aria-label={t({ en: 'Dashboard sections', ur: 'ڈیش بورڈ حصے' }, language)}>
                {tabs.map(tab => (
                  <button
                    key={tab.id}
                    role="tab"
                    aria-selected={activeTab === tab.id}
                    onClick={() => setActiveTab(tab.id as typeof activeTab)}
                    className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                      activeTab === tab.id
                        ? 'border-secondary-600 text-secondary-600'
                        : 'border-transparent text-neutral-500 hover:text-neutral-700 hover:border-neutral-300'
                    }`}
                  >
                    {t(tab.label, language)}
                  </button>
                ))}
              </nav>
            </div>

            {/* Overview Tab */}
            <div role="tabpanel" id="overview-panel" className="animate-fade-in" hidden={activeTab !== 'overview'}>
              {error && !data ? (
                <div className="p-12 text-center">
                  <div className="w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
                    <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-neutral-900 mb-2">
                    {t({ en: 'Failed to load dashboard', ur: 'ڈیش بورڈ لوڈ نہیں ہوا' }, language)}
                  </h3>
                  <p className="text-neutral-500 mb-4">{error}</p>
                  <button onClick={fetchDashboardData} className="btn-primary">
                    {t({ en: 'Try Again', ur: 'دوبارہ کوشش کریں' }, language)}
                  </button>
                </div>
              ) : data ? (
                <AnalyticsCharts
                  categoryStats={data.categoryStats || []}
                  cityStats={data.cityStats || []}
                  severityStats={data.severityStats || []}
                  weeklyTrend={data.weeklyTrend || []}
                  language={language}
                />
              ) : null}
            </div>

            {/* Complaints Tab */}
            <div role="tabpanel" id="complaints-panel" className="animate-fade-in" hidden={activeTab !== 'complaints'}>
              <div className="card-body p-0">
                <div className="p-6 border-b border-neutral-200">
                  <div className="flex flex-wrap gap-4">
                    {['all', 'pending', 'in_progress', 'resolved', 'rejected'].map(status => (
                      <button
                        key={status}
                        onClick={() => setFilterStatus(status)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                          filterStatus === status
                            ? 'bg-secondary-600 text-white'
                            : 'bg-white text-neutral-600 hover:bg-neutral-100 border border-neutral-200'
                        }`}
                      >
                        {t({
                          en: status === 'all' ? 'All' : status === 'in_progress' ? 'In Progress' : status.charAt(0).toUpperCase() + status.slice(1),
                          ur: status === 'all' ? 'سب' : status === 'pending' ? 'زیر التوا' : status === 'in_progress' ? 'کارروائی جاری' : status === 'resolved' ? 'حل ہو گیا' : 'مسترد'
                        }, language)}
                      </button>
                    ))}
                  </div>
                </div>
                {complaintsLoading ? (
                  <div className="p-6 animate-pulse space-y-3">
                    {[1,2,3,4,5].map(i => <div key={i} className="h-12 bg-neutral-100 rounded"></div>)}
                  </div>
                ) : complaints.length === 0 ? (
                  <div className="p-12 text-center text-neutral-500">
                    {t({ en: 'No complaints found', ur: 'کوئی شکایت نہیں ملی' }, language)}
                  </div>
                ) : (
                  <ComplaintTable
                    complaints={complaints}
                    onStatusChange={handleStatusChange}
                    language={language}
                  />
                )}
              </div>
            </div>

            {/* Analytics Tab */}
            <div role="tabpanel" id="analytics-panel" className="animate-fade-in p-6" hidden={activeTab !== 'analytics'}>
              {data ? (
                <AnalyticsCharts
                  categoryStats={data.categoryStats || []}
                  cityStats={data.cityStats || []}
                  severityStats={data.severityStats || []}
                  weeklyTrend={data.weeklyTrend || []}
                  language={language}
                />
              ) : error ? (
                <div className="p-12 text-center text-neutral-500">
                  {t({ en: 'Failed to load analytics. Please try again.', ur: 'تجزیہ لوڈ نہیں ہوا۔ دوبارہ کوشش کریں।' }, language)}
                </div>
              ) : null}
            </div>

            {/* Organizations Tab */}
            <div role="tabpanel" id="organizations-panel" className="animate-fade-in p-6" hidden={activeTab !== 'organizations'}>
              <div className="card">
                <div className="card-header flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-neutral-900">{t({ en: 'Registered Organizations', ur: 'رجسٹرڈ ادارے' }, language)}</h3>
                </div>
                <div className="card-body">
                  {organizations.length === 0 ? (
                    <div className="p-8 text-center text-neutral-500">
                      {t({ en: 'No organizations registered', ur: 'کوئی ادارہ رجسٹرڈ نہیں' }, language)}
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="text-left border-b border-neutral-200">
                            <th className="px-4 py-3 font-medium text-neutral-600">{t({ en: 'Organization', ur: 'ادارہ' }, language)}</th>
                            <th className="px-4 py-3 font-medium text-neutral-600">{t({ en: 'City', ur: 'شہر' }, language)}</th>
                            <th className="px-4 py-3 font-medium text-neutral-600">{t({ en: 'Categories', ur: 'اقسام' }, language)}</th>
                            <th className="px-4 py-3 font-medium text-neutral-600">{t({ en: 'Contact', ur: 'رابطہ' }, language)}</th>
                            <th className="px-4 py-3 font-medium text-neutral-600">{t({ en: 'Status', ur: 'حالت' }, language)}</th>
                          </tr>
                        </thead>
                        <tbody>
                          {organizations.map(org => (
                            <tr key={org._id} className="border-b border-neutral-100 hover:bg-neutral-50">
                              <td className="px-4 py-3 font-medium text-neutral-900">{language === 'ur' && org.nameUrdu ? org.nameUrdu : org.name}</td>
                              <td className="px-4 py-3 text-neutral-600 capitalize">{org.city}</td>
                              <td className="px-4 py-3">
                                <div className="flex flex-wrap gap-1">
                                  {org.categories?.map(cat => (
                                    <span key={cat} className="badge badge-secondary">{cat.replace(/_/g, ' ')}</span>
                                  ))}
                                </div>
                              </td>
                              <td className="px-4 py-3 text-neutral-600">
                                {org.email && <div>{org.email}</div>}
                                {org.phone && <div className="text-xs">{org.phone}</div>}
                              </td>
                              <td className="px-4 py-3">
                                <span className={`badge ${org.isActive ? 'badge-success' : 'badge-danger'}`}>
                                  {org.isActive ? t({ en: 'Active', ur: 'فعال' }, language) : t({ en: 'Inactive', ur: 'غیر فعال' }, language)}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
          </Card3D>
        </div>
      </main>
    </div>
  );
}
