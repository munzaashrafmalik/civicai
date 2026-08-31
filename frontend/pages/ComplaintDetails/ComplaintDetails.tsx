'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useSession } from 'next-auth/react';
import { useToastHelpers } from '@/components/Toast';
import Navbar from '@/components/Navbar/Navbar';
import StatusTracker from '@/components/StatusTracker/StatusTracker';
import { complaintsApi } from '@/lib/api';
import { getStoredLanguage } from '@/lib/i18n';

const t = (key: { en: string; ur: string }, lang: 'en' | 'ur') => lang === 'ur' ? key.ur : key.en;

interface Complaint {
  id: string;
  complaintId?: string;
  _id?: string;
  title: string;
  description: string;
  issueCategory: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: 'pending' | 'in_progress' | 'resolved' | 'rejected';
  location: { address?: string; city?: string; latitude: number; longitude: number };
  createdAt: string;
  updatedAt: string;
  resolvedAt?: string;
  images?: string[];
  voiceTranscript?: string;
  aiAnalysis?: {
    confidence: number;
    detectedObjects?: string[];
  };
  assignedOrganization?: string;
}

const categoryLabels: Record<string, { en: string; ur: string }> = {
  pothole: { en: 'Pothole', ur: 'گڑھا' },
  garbage: { en: 'Garbage', ur: 'کوڑا' },
  water_leakage: { en: 'Water Leakage', ur: 'پانی کا رساو' },
  streetlight: { en: 'Streetlight', ur: 'سٹریٹ لائٹ' },
  drainage: { en: 'Drainage', ur: 'ڈرینج' },
  traffic_signal: { en: 'Traffic Signal', ur: 'ٹریفک سگنل' },
  road_damage: { en: 'Road Damage', ur: 'سڑک کا نقصان' },
  other: { en: 'Other', ur: 'دیگر' },
};

const severityLabels: Record<string, { en: string; ur: string }> = {
  low: { en: 'Low', ur: 'کم' },
  medium: { en: 'Medium', ur: 'متوسط' },
  high: { en: 'High', ur: 'اعلی' },
  critical: { en: 'Critical', ur: 'انتہائی' },
};

const statusLabels: Record<string, { en: string; ur: string }> = {
  pending: { en: 'Pending', ur: 'زیر التوا' },
  in_progress: { en: 'In Progress', ur: 'کارروائی جاری' },
  resolved: { en: 'Resolved', ur: 'حل ہو گیا' },
  rejected: { en: 'Rejected', ur: 'مسترد' },
};

export default function ComplaintDetailsPage() {
  const router = useRouter();
  const { id: routeId } = router.query;
  const { data: session, status } = useSession();
  const { success, error: toastError } = useToastHelpers();
  const [language, setLanguage] = useState<'en' | 'ur'>(getStoredLanguage);
  const [complaint, setComplaint] = useState<Complaint | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showSubmittedToast, setShowSubmittedToast] = useState(false);

  useEffect(() => {
    if (router.isReady && router.query.submitted === 'true') {
      setShowSubmittedToast(true);
      setTimeout(() => setShowSubmittedToast(false), 5000);
    }
  }, [router.isReady, router.query.submitted]);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login?callbackUrl=' + window.location.pathname + window.location.search);
      return;
    }

    if (routeId) {
      fetchComplaint(routeId as string);
    }
  }, [routeId, status]);

  const fetchComplaint = async (id: string) => {
    setIsLoading(true);
    try {
      const response = await complaintsApi.getById(id);
      setComplaint(response.data as any);
    } catch (err: any) {
      console.error('Failed to fetch complaint:', err);
      toastError(
        t({ en: 'Error', ur: 'خرابی' }, language),
        err.message || t({ en: 'Failed to load complaint details', ur: 'شکایت کی تفصیلات لوڈ کرنے میں ناکام' }, language)
      );
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-secondary-50">
        <Navbar language={language} onLanguageChange={setLanguage} />
        <main className="pt-16">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
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

  if (!complaint) {
    return (
      <div className="min-h-screen bg-secondary-50">
        <Navbar language={language} onLanguageChange={setLanguage} />
        <main className="pt-16">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="card text-center py-16">
              <h2 className="text-xl font-semibold text-secondary-900 mb-2">
                {t({ en: 'Complaint Not Found', ur: 'شکایت نہیں ملی' }, language)}
              </h2>
              <p className="text-secondary-600">
                {t({ en: 'The complaint you\'re looking for doesn\'t exist.', ur: 'آپ جو شکایت تلاش کر رہے ہیں وہ موجود نہیں ہے۔' }, language)}
              </p>
            </div>
          </div>
        </main>
      </div>
    );
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(language === 'ur' ? 'ur-PK' : 'en-GB', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="min-h-screen bg-secondary-50">
      <Navbar language={language} onLanguageChange={setLanguage} />

      {showSubmittedToast && (
        <div className="fixed top-20 right-4 left-4 md:right-auto md:left-auto md:w-96 z-50 animate-slide-down" role="alert">
          <div className="bg-success-50 border border-success-200 rounded-xl p-4 flex items-center gap-3 shadow-lg">
            <div className="w-8 h-8 rounded-full bg-success-500 flex items-center justify-center flex-shrink-0">
              <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
            <p className="text-success-800 text-sm font-medium">
              {t({ en: 'Complaint submitted successfully!', ur: 'شکایت کامیابی سے جمع ہو گئی!' }, language)}
            </p>
          </div>
        </div>
      )}

      <main className="pt-16 pb-12">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-6 flex items-center justify-between">
            <a href="/my-complaints" className="btn-outline">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              {t({ en: 'Back to Complaints', ur: 'شكایات پر واپس' }, language)}
            </a>
            <span className={`badge ${complaint.status === 'resolved' ? 'badge-success' : complaint.status === 'in_progress' ? 'badge-primary' : complaint.status === 'rejected' ? 'badge-danger' : 'badge-warning'}`}>
              {t(statusLabels[complaint.status], language)}
            </span>
          </div>

          <div className="card mb-6">
            <div className="card-header">
              <h1 className="text-xl font-bold text-secondary-900">{complaint.title}</h1>
            </div>
            <div className="card-body space-y-6">
              <div className="flex flex-wrap gap-2">
                <span className="badge-primary">
                  {t(categoryLabels[complaint.issueCategory] || { en: complaint.issueCategory, ur: complaint.issueCategory }, language)}
                </span>
                <span className={`badge ${
                  complaint.severity === 'low' ? 'badge-success' :
                  complaint.severity === 'medium' ? 'badge-warning' :
                  'badge-danger'
                }`}>
                  {t({ en: 'Severity', ur: 'شدید' }, language)}: {t(severityLabels[complaint.severity], language)}
                </span>
                {complaint.aiAnalysis && (
                  <span className="badge-secondary">
                    {t({ en: 'AI Confidence', ur: 'اے آئی اعتماد' }, language)}: {Math.round(complaint.aiAnalysis.confidence * 100)}%
                  </span>
                )}
              </div>

              <div className="border-t border-secondary-200 pt-6">
                <p className="text-secondary-700 leading-relaxed">{complaint.description}</p>
              </div>

              {complaint.images && complaint.images.length > 0 && (
                <div>
                  <h3 className="text-sm font-medium text-secondary-700 mb-3">
                    {t({ en: 'Images', ur: 'تصاویر' }, language)}
                  </h3>
                  <div className="grid grid-cols-2 gap-3">
                    {complaint.images.map((img, i) => (
                      <div key={i} className="aspect-video rounded-lg overflow-hidden bg-secondary-100">
                        <img src={img} alt={`${t({ en: 'Complaint image', ur: 'شکایت کی تصویر' }, language)} ${i + 1}`} className="w-full h-full object-cover" />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {complaint.voiceTranscript && (
                <div className="p-4 rounded-lg bg-secondary-50 border border-secondary-200">
                  <p className="text-sm font-medium text-secondary-700 mb-1">
                    {t({ en: 'Voice Transcript', ur: 'آواز سی سکرپٹ' }, language)}
                  </p>
                  <p className="text-secondary-900 italic">"{complaint.voiceTranscript}"</p>
                </div>
              )}

              <div className="grid sm:grid-cols-2 gap-4 border-t border-secondary-200 pt-6">
                <div>
                  <p className="text-sm font-medium text-secondary-700 mb-1">
                    {t({ en: 'Location', ur: 'مقام' }, language)}
                  </p>
                  <p className="text-secondary-900">
                    {complaint.location.address || `${complaint.location.latitude.toFixed(6)}, ${complaint.location.longitude.toFixed(6)}`}
                  </p>
                  <p className="text-xs text-secondary-500 mt-1 font-mono">
                    {t({ en: 'Lat', ur: 'العرض' }, language)}: {complaint.location.latitude.toFixed(6)}, {t({ en: 'Lng', ur: 'الطول' }, language)}: {complaint.location.longitude.toFixed(6)}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-secondary-700 mb-1">
                    {t({ en: 'Reported On', ur: 'رپورٹ کی تاریخ' }, language)}
                  </p>
                  <p className="text-secondary-900">{formatDate(complaint.createdAt)}</p>
                </div>
              </div>

              {complaint.assignedOrganization && (
                <div className="p-4 rounded-lg bg-primary-50 border border-primary-200 border-t border-secondary-200 pt-6">
                  <p className="text-sm font-medium text-primary-800 mb-1">
                    {t({ en: 'Assigned Organization', ur: 'مخصوص ادارہ' }, language)}
                  </p>
                  <p className="text-primary-900">{complaint.assignedOrganization}</p>
                </div>
              )}

              <div className="border-t border-secondary-200 pt-6">
                <StatusTracker currentStatus={complaint.status} language={language} />
              </div>

              <div className="border-t border-secondary-200 pt-6">
                <h3 className="text-sm font-medium text-secondary-700 mb-3">
                  {t({ en: 'Timeline', ur: 'وقت کی لائن' }, language)}
                </h3>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary-100 text-primary-600 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-secondary-900">{t({ en: 'Complaint Submitted', ur: 'شکایت جمع ہوئی' }, language)}</p>
                      <p className="text-sm text-secondary-500">{formatDate(complaint.createdAt)}</p>
                    </div>
                  </div>

                  {complaint.status !== 'pending' && (
                    <div className="flex items-start gap-3 ml-4 border-l-2 border-secondary-200 pl-4">
                      <div className="w-8 h-8 rounded-full bg-primary-100 text-primary-600 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-secondary-900">{t({ en: 'Under Review', ur: 'جائزہ تحت' }, language)}</p>
                        <p className="text-sm text-secondary-500">{formatDate(complaint.updatedAt)}</p>
                      </div>
                    </div>
                  )}

                  {complaint.status === 'in_progress' && (
                    <div className="flex items-start gap-3 ml-4 border-l-2 border-primary-200 pl-4">
                      <div className="w-8 h-8 rounded-full bg-primary-100 text-primary-600 flex items-center justify-center flex-shrink-0 mt-0.5 animate-pulse">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-primary-700">{t({ en: 'Work in Progress', ur: 'کام جاری ہے' }, language)}</p>
                        <p className="text-sm text-secondary-500">{t({ en: 'Organization is working on the issue', ur: 'ادارہ مسئلے پر کام کر رہا ہے' }, language)}</p>
                      </div>
                    </div>
                  )}

                  {complaint.status === 'resolved' && complaint.resolvedAt && (
                    <div className="flex items-start gap-3 ml-4 border-l-2 border-success-200 pl-4">
                      <div className="w-8 h-8 rounded-full bg-success-100 text-success-600 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-success-700">{t({ en: 'Issue Resolved', ur: 'مسئلہ حل ہو گیا' }, language)}</p>
                        <p className="text-sm text-secondary-500">{formatDate(complaint.resolvedAt)}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="card-header">
              <h3 className="text-lg font-semibold text-secondary-900">
                {t({ en: 'Need Help?', ur: 'مدد چاہیے؟' }, language)}
              </h3>
            </div>
            <div className="card-body">
              <p className="text-secondary-600 mb-4">
                {t({ en: 'If you have additional information or want to follow up on this complaint, please contact the assigned organization directly.', ur: 'اگر آپ کے پاس مزید معلومات ہیں یا اس شکایت پر تعاقب کرنا چاہتے ہیں، تو براہ کرم مخصوص ادارے سے براہ راست رابطہ کریں۔' }, language)}
              </p>
              <div className="flex flex-wrap gap-3">
                <a href="tel:+922111111111" className="btn-outline">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  {t({ en: 'Call Helpline', ur: 'ہیلپ لائن کال کریں' }, language)}
                </a>
                <a href="/my-complaints" className="btn-primary">
                  {t({ en: 'Back to My Complaints', ur: 'میری شکایات پر واپس' }, language)}
                </a>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}