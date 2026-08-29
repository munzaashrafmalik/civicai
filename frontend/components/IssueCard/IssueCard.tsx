'use client';

import React from 'react';
import Link from 'next/link';

interface IssueCardProps {
  complaint: {
    id: string;
    title: string;
    description: string;
    issueCategory: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    status: 'pending' | 'in_progress' | 'resolved' | 'rejected';
    location: { address?: string };
    createdAt: string | Date;
    images?: string[];
  };
  language?: 'en' | 'ur';
}

const t = (key: { en: string; ur: string }, lang: 'en' | 'ur') => lang === 'ur' ? key.ur : key.en;

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

const statusColors: Record<string, string> = {
  pending: 'badge-warning',
  in_progress: 'badge-primary',
  resolved: 'badge-success',
  rejected: 'badge-danger',
};

const statusLabels: Record<string, { en: string; ur: string }> = {
  pending: { en: 'Pending', ur: 'زیر التوا' },
  in_progress: { en: 'In Progress', ur: 'کارروائی جاری' },
  resolved: { en: 'Resolved', ur: 'حل ہو گیا' },
  rejected: { en: 'Rejected', ur: 'مسترد' },
};

export default function IssueCard({ complaint, language = 'en' }: IssueCardProps) {
  const date = new Date(complaint.createdAt).toLocaleDateString(language === 'ur' ? 'ur-PK' : 'en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  return (
    <Link
      href={`/complaints/${complaint.id}`}
      className="card hover:shadow-md transition-shadow group"
      aria-label={t({ en: `View complaint ${complaint.id}`, ur: `شکایت ${complaint.id} دیکھیں` }, language)}
    >
      <div className="card-body">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center flex-wrap gap-2 mb-2">
              <span className="badge-primary">
                {t(categoryLabels[complaint.issueCategory] || { en: complaint.issueCategory, ur: complaint.issueCategory }, language)}
              </span>
              <span className={`badge ${statusColors[complaint.status]}`}>
                {t(statusLabels[complaint.status] || { en: complaint.status, ur: complaint.status }, language)}
              </span>
            </div>
            <h3 className="text-lg font-semibold text-secondary-900 group-hover:text-primary-600 transition-colors mb-1 truncate">
              {complaint.title}
            </h3>
            <p className="text-sm text-secondary-600 line-clamp-2 mb-2">
              {complaint.description}
            </p>
            <div className="flex items-center gap-3 text-xs text-secondary-500">
              <span className="flex items-center gap-1">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z" />
                </svg>
                {complaint.location?.address || '—'}
              </span>
              <span className="flex items-center gap-1">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                {date}
              </span>
            </div>
          </div>

          {complaint.images && complaint.images.length > 0 && (
            <div className="relative w-20 h-20 rounded-lg overflow-hidden bg-secondary-100 flex-shrink-0">
              <img
                src={complaint.images[0]}
                alt={t({ en: 'Complaint image', ur: 'شکایت کی تصویر' }, language)}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}