'use client';

import React from 'react';

interface ComplaintPreviewProps {
  title: string;
  description: string;
  category: string;
  severity: string;
  location: { latitude: number; longitude: number; address?: string };
  images?: string[];
  voiceTranscript?: string;
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

const severityLabels: Record<string, { en: string; ur: string }> = {
  low: { en: 'Low', ur: 'کم' },
  medium: { en: 'Medium', ur: 'متوسط' },
  high: { en: 'High', ur: 'اعلی' },
  critical: { en: 'Critical', ur: 'انتہائی' },
};

export default function ComplaintPreview({
  title,
  description,
  category,
  severity,
  location,
  images = [],
  voiceTranscript,
  language = 'en'
}: ComplaintPreviewProps) {
  return (
    <div className="card">
      <div className="card-header">
        <h3 className="text-lg font-semibold text-secondary-900">
          {t({ en: 'Complaint Preview', ur: 'شکایت کا پیش نظارہ' }, language)}
        </h3>
      </div>
      <div className="card-body space-y-4">
        <div className="flex flex-wrap gap-2">
          <span className="badge-primary">
            {t(categoryLabels[category] || { en: category, ur: category }, language)}
          </span>
          <span className="badge-warning">
            {t(severityLabels[severity] || { en: severity, ur: severity }, language)}
          </span>
        </div>

        <div>
          <p className="text-sm font-medium text-secondary-700 mb-1">
            {t({ en: 'Title', ur: 'عنوان' }, language)}
          </p>
          <p className="text-secondary-900">{title || '---'}</p>
        </div>

        <div>
          <p className="text-sm font-medium text-secondary-700 mb-1">
            {t({ en: 'Description', ur: 'تفصیل' }, language)}
          </p>
          <p className="text-secondary-900">{description || '---'}</p>
        </div>

        <div>
          <p className="text-sm font-medium text-secondary-700 mb-1">
            {t({ en: 'Location', ur: 'مقام' }, language)}
          </p>
          <p className="text-secondary-900">
            {location.address || `${t({ en: 'Lat', ur: 'عرض' }, language)}: ${location.latitude}, ${t({ en: 'Lng', ur: 'طول' }, language)}: ${location.longitude}`}
          </p>
        </div>

        {images && images.length > 0 && (
          <div>
            <p className="text-sm font-medium text-secondary-700 mb-1">
              {t({ en: 'Images', ur: 'تصاویر' }, language)} ({images.length})
            </p>
            <div className="grid grid-cols-2 gap-2">
              {images.slice(0, 4).map((img, i) => (
                <div key={i} className="aspect-square rounded-lg bg-secondary-100 overflow-hidden">
                  <img src={img} alt={t({ en: `Image ${i + 1}`, ur: `تصویر ${i + 1}` }, language)} className="w-full h-full object-cover" />
                </div>
              ))}
              {images.length > 4 && (
                <div className="aspect-square rounded-lg bg-secondary-100 flex items-center justify-center text-secondary-600 font-medium">
                  +{images.length - 4}
                </div>
              )}
            </div>
          </div>
        )}

        {voiceTranscript && (
          <div>
            <p className="text-sm font-medium text-secondary-700 mb-1">
              {t({ en: 'Voice Transcript', ur: 'آواز سی سکرپٹ' }, language)}
            </p>
            <p className="text-secondary-900 italic">"{voiceTranscript}"</p>
          </div>
        )}
      </div>
    </div>
  );
}