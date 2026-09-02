'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import { useToastHelpers } from '@/components/Toast';
import Navbar from '@/components/Navbar/Navbar';
import IssueCard from '@/components/IssueCard/IssueCard';
import ScrollReveal from '@/components/ScrollReveal/ScrollReveal';
import Card3D from '@/components/Card3D/Card3D';
import { complaintsApi } from '@/lib/api';
import { getStoredLanguage } from '@/lib/i18n';

const t = (key: { en: string; ur: string }, lang: 'en' | 'ur') => lang === 'ur' ? key.ur : key.en;

interface Complaint {
  id?: string;
  complaintId?: string;
  _id?: string;
  title: string;
  description: string;
  issueCategory: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: 'pending' | 'in_progress' | 'resolved' | 'rejected';
  location: { address?: string; city?: string };
  createdAt: string;
  images?: string[];
  assignedOrganization?: string;
}

export default function MyComplaintsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { error: toastError } = useToastHelpers();
  const [language, setLanguage] = useState<'en' | 'ur'>(getStoredLanguage);
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'in_progress' | 'resolved'>('all');

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login?callbackUrl=/my-complaints');
      return;
    }

    if (session?.user) {
      fetchComplaints();
    }
  }, [session, status, filter]);

  const fetchComplaints = async () => {
    setIsLoading(true);
    try {
      const userId = (session?.user as any)?.id;
      const params: any = { limit: 50 };
      if (filter !== 'all') params.status = filter;
      if (userId) params.userId = userId;
      const response = await complaintsApi.getAll(params);
      setComplaints((response.data as any) || []);
    } catch (err: any) {
      console.error('Failed to fetch complaints:', err);
      toastError(
        t({ en: 'Error', ur: 'خرابی' }, language),
        err.message || t({ en: 'Failed to load complaints', ur: 'شکایات لوڈ کرنے میں ناکام' }, language)
      );
    } finally {
      setIsLoading(false);
    }
  };

  const filteredComplaints = complaints.filter(c => filter === 'all' || c.status === filter);

  const statusFilters = [
    { value: 'all', label: { en: 'All', ur: 'سب' } },
    { value: 'pending', label: { en: 'Pending', ur: 'زیر التوا' } },
    { value: 'in_progress', label: { en: 'In Progress', ur: 'کارروائی جاری' } },
    { value: 'resolved', label: { en: 'Resolved', ur: 'حل ہو گیا' } },
  ];

  return (
    <div className="min-h-screen bg-neutral-50">
      <Navbar language={language} onLanguageChange={setLanguage} />

      <main className="pt-16 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <ScrollReveal animation="animate-slide-up">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h1 className="text-3xl font-bold text-neutral-900">
                  {t({ en: 'My Complaints', ur: 'میری شکایات' }, language)}
                </h1>
                <p className="text-neutral-500 mt-1">
                  {t({ en: 'Track and manage all your reported issues', ur: 'اپنی رپورٹ کی گئی تمام مسائل کا تعاقب اور انتظام کریں' }, language)}
                </p>
              </div>
              <a href="/report" className="btn-primary">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                {t({ en: 'Report New Issue', ur: 'نیا مسئلہ رپورٹ کریں' }, language)}
              </a>
            </div>
          </ScrollReveal>

          {/* Filter tabs */}
          <ScrollReveal animation="animate-slide-up" delay={100}>
            <div className="mb-6 flex flex-wrap gap-2" role="tablist" aria-label={t({ en: 'Filter by status', ur: 'حالت کے لحاظ سے فلٹر کریں' }, language)}>
              {statusFilters.map(f => (
                <button
                  key={f.value}
                  role="tab"
                  aria-selected={filter === f.value}
                  onClick={() => setFilter(f.value as typeof filter)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    filter === f.value
                      ? 'bg-secondary-600 text-white shadow-lg shadow-secondary-600/25'
                      : 'bg-white text-neutral-500 hover:bg-neutral-100 border border-neutral-200 hover:border-secondary-200'
                  }`}
                >
                  {t(f.label, language)}
                </button>
              ))}
            </div>
          </ScrollReveal>

          {isLoading ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6" role="status" aria-live="polite">
              {[1, 2, 3, 4, 5, 6].map(i => (
                <div key={i} className="card animate-pulse">
                  <div className="card-body space-y-4">
                    <div className="h-4 bg-neutral-200 rounded w-1/3"></div>
                    <div className="h-4 bg-neutral-200 rounded w-1/2"></div>
                    <div className="h-4 bg-neutral-200 rounded w-1/4"></div>
                    <div className="h-32 bg-neutral-200 rounded"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : filteredComplaints.length === 0 ? (
            <Card3D intensity={8}>
            <div className="card text-center py-16">
              <svg className="mx-auto w-16 h-16 text-neutral-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <h3 className="text-lg font-medium text-neutral-900 mb-2">
                {t({ en: 'No complaints found', ur: 'کوئی شکایت نہیں ملی' }, language)}
              </h3>
              <p className="text-neutral-500 mb-6">
                {filter === 'all'
                  ? t({ en: 'You haven\'t reported any issues yet.', ur: 'آپ نے ابھی تک کوئی مسئلہ رپورٹ نہیں کیا۔' }, language)
                  : t({ en: `No ${t(statusFilters.find(f => f.value === filter)?.label || { en: '', ur: '' }, language)} complaints.`, ur: `کوئی ${t(statusFilters.find(f => f.value === filter)?.label || { en: '', ur: '' }, language)} شکایات نہیں۔` }, language)}
              </p>
              {filter !== 'all' && (
                <button onClick={() => setFilter('all')} className="text-secondary-600 hover:underline text-sm">
                  {t({ en: 'Show all complaints', ur: 'سب شکایات دکھائیں' }, language)}
                </button>
              )}
            </div>
            </Card3D>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6" role="list" aria-label={t({ en: 'Complaints list', ur: 'شکایات کی فہرست' }, language)}>
              {filteredComplaints.map((complaint, index) => (
                <ScrollReveal key={complaint._id || complaint.complaintId} animation="animate-slide-up" delay={index * 50}>
                  <Card3D intensity={8}>
                    <IssueCard complaint={{ ...complaint, id: complaint.complaintId || complaint._id || '' }} language={language} />
                  </Card3D>
                </ScrollReveal>
              ))}
            </div>
          )}

          {filteredComplaints.length > 0 && (
            <div className="mt-8 text-center text-sm text-neutral-400">
              {t({ en: 'Showing', ur: 'دکھا رہے ہیں' }, language)} {filteredComplaints.length} {t({ en: 'of', ur: 'میں سے' }, language)} {complaints.length} {t({ en: 'complaints', ur: 'شکایات' }, language)}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}