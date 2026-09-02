'use client';

import React from 'react';

interface AIAnalysisProps {
  analysis: {
    issueCategory: string;
    confidence: number;
    severity: 'low' | 'medium' | 'high' | 'critical';
    description: string;
    suggestedTitle: string;
    detectedObjects?: string[];
  } | null;
  isLoading?: boolean;
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
  medium: { en: 'Medium', ur: 'درمیانہ' },
  high: { en: 'High', ur: 'زیادہ' },
  critical: { en: 'Critical', ur: 'انتہائی اہم' },
};

const severityColors: Record<string, string> = {
  low: 'badge-success',
  medium: 'badge-warning',
  high: 'badge-danger',
  critical: 'badge-danger',
};

export default function AIAnalysis({ analysis, isLoading, language = 'en' }: AIAnalysisProps) {
  if (!analysis && !isLoading) return null;

  return (
    <div className="card animate-fade-in">
      <div className="card-header">
        <h3 className="text-lg font-semibold text-neutral-900 flex items-center gap-2">
          <svg className="w-5 h-5 text-accent-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.734-.988-2.386l-.548-.547z" />
          </svg>
          {t({ en: 'AI Analysis', ur: 'اے آئی تجزیہ' }, language)}
        </h3>
      </div>
      <div className="card-body">
        {isLoading ? (
          <div className="space-y-4" role="status" aria-live="polite">
            <div className="animate-pulse">
              <div className="h-4 bg-neutral-200 rounded w-1/3 mb-2"></div>
              <div className="h-4 bg-neutral-200 rounded w-1/2"></div>
            </div>
            <div className="animate-pulse">
              <div className="h-4 bg-neutral-200 rounded w-1/4 mb-2"></div>
              <div className="h-4 bg-neutral-200 rounded w-3/4"></div>
            </div>
            <div className="animate-pulse">
              <div className="h-4 bg-neutral-200 rounded w-1/5 mb-2"></div>
              <div className="h-4 bg-neutral-200 rounded w-full"></div>
            </div>
          </div>
        ) : analysis ? (
          <div className="space-y-4">
            <div className="flex flex-wrap gap-2">
              <span className={`badge ${severityColors[analysis.severity]}`}>
                {t({ en: 'Severity', ur: 'شدید' }, language)}: {t(severityLabels[analysis.severity], language)}
              </span>
              <span className="badge-primary">
                {t({ en: 'Category', ur: 'زمرہ' }, language)}: {t(categoryLabels[analysis.issueCategory] || { en: analysis.issueCategory, ur: analysis.issueCategory }, language)}
              </span>
              <span className="badge-secondary">
                {t({ en: 'Confidence', ur: 'اعتماد' }, language)}: {Math.round(analysis.confidence * 100)}%
              </span>
            </div>

            <div>
              <p className="text-sm font-medium text-neutral-600 mb-1">
                {t({ en: 'Suggested Title', ur: 'تجویز کردہ عنوان' }, language)}
              </p>
              <p className="text-neutral-900">{analysis.suggestedTitle}</p>
            </div>

            <div>
              <p className="text-sm font-medium text-neutral-600 mb-1">
                {t({ en: 'AI Description', ur: 'اے آئی تفصیل' }, language)}
              </p>
              <p className="text-neutral-900">{analysis.description}</p>
            </div>

            {analysis.detectedObjects && analysis.detectedObjects.length > 0 && (
              <div>
                <p className="text-sm font-medium text-neutral-600 mb-1">
                  {t({ en: 'Detected Objects', ur: 'پتہ چلے اشیاء' }, language)}
                </p>
                <div className="flex flex-wrap gap-2">
                  {analysis.detectedObjects.map((obj, index) => (
                    <span key={index} className="badge-secondary">{obj}</span>
                  ))}
                </div>
              </div>
            )}

            <div className="p-3 rounded-lg bg-secondary-50 border border-secondary-200">
              <p className="text-sm text-neutral-600">
                {t({ en: 'Review the analysis above. You can edit the title and description before submitting.', ur: 'اوپر کے تجزیے کا جائزہ لیں۔ جمع کرانے سے پہلے عنوان اور تفصیل میں ترمیم کر سکتے ہیں۔' }, language)}
              </p>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}