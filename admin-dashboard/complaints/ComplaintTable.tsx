'use client';

import React from 'react';

interface ComplaintTableProps {
  complaints: Array<{
    id: string;
    title: string;
    issueCategory: string;
    severity: string;
    status: string;
    location: { address?: string; city?: string };
    createdAt: string;
    userId?: string;
  }>;
  onStatusChange: (id: string, status: string) => void;
  language?: 'en' | 'ur';
}

const t = (key: { en: string; ur: string }, lang: 'en' | 'ur') => lang === 'ur' ? key.ur : key.en;

const statusOptions = [
  { value: 'pending', label: { en: 'Pending', ur: 'زیر التوا' } },
  { value: 'in_progress', label: { en: 'In Progress', ur: 'کارروائی جاری' } },
  { value: 'resolved', label: { en: 'Resolved', ur: 'حل ہو گیا' } },
  { value: 'rejected', label: { en: 'Rejected', ur: 'مسترد' } },
];

const statusColors: Record<string, string> = {
  pending: 'badge-warning',
  in_progress: 'badge-primary',
  resolved: 'badge-success',
  rejected: 'badge-danger',
};

export default function ComplaintTable({ complaints, onStatusChange, language = 'en' }: ComplaintTableProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(language === 'ur' ? 'ur-PK' : 'en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  if (complaints.length === 0) {
    return (
      <div className="card">
        <div className="card-body text-center py-12">
          <p className="text-secondary-600">{t({ en: 'No complaints found', ur: 'کوئی شکایت نہیں ملی' }, language)}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="card overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full" role="table">
          <thead className="bg-secondary-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                {t({ en: 'Complaint', ur: 'شکایت' }, language)}
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                {t({ en: 'Category', ur: 'زمرہ' }, language)}
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                {t({ en: 'Severity', ur: 'شدید' }, language)}
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                {t({ en: 'Status', ur: 'حالت' }, language)}
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                {t({ en: 'Location', ur: 'مقام' }, language)}
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                {t({ en: 'Date', ur: 'تاریخ' }, language)}
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                {t({ en: 'Action', ur: 'عمل' }, language)}
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-secondary-200">
            {complaints.map(complaint => (
              <tr key={complaint.id} className="hover:bg-secondary-50">
                <td className="px-6 py-4">
                  <div>
                    <p className="font-medium text-secondary-900 truncate max-w-xs">{complaint.title}</p>
                    <p className="text-xs text-secondary-500">ID: {complaint.id}</p>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className="badge-primary text-xs">
                    {complaint.issueCategory.replace('_', ' ')}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span className={`badge text-xs ${
                    complaint.severity === 'low' ? 'badge-success' :
                    complaint.severity === 'medium' ? 'badge-warning' :
                    'badge-danger'
                  }`}>
                    {complaint.severity}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span className={`badge text-xs ${statusColors[complaint.status]}`}>
                    {t(statusOptions.find(s => s.value === complaint.status)?.label || { en: complaint.status, ur: complaint.status }, language)}
                  </span>
                </td>
                <td className="px-6 py-4 text-secondary-600">
                  {complaint.location?.address || complaint.location?.city || '—'}
                </td>
                <td className="px-6 py-4 text-secondary-600 whitespace-nowrap">
                  {formatDate(complaint.createdAt)}
                </td>
                <td className="px-6 py-4">
                  <select
                    value={complaint.status}
                    onChange={(e) => onStatusChange(complaint.id, e.target.value)}
                    className="text-sm border border-secondary-300 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-primary-500"
                    aria-label={t({ en: 'Change status', ur: 'حالت تبدیل کریں' }, language)}
                  >
                    {statusOptions.map(opt => (
                      <option key={opt.value} value={opt.value}>
                        {t(opt.label, language)}
                      </option>
                    ))}
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}