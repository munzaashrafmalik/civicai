'use client';

import React from 'react';

interface StatusTrackerProps {
  currentStatus: 'pending' | 'in_progress' | 'resolved' | 'rejected';
  language?: 'en' | 'ur';
}

const t = (key: { en: string; ur: string }, lang: 'en' | 'ur') => lang === 'ur' ? key.ur : key.en;

const statusSteps = [
  { key: 'pending', label: { en: 'Pending', ur: 'زیر التوا' }, icon: 'clock' },
  { key: 'in_progress', label: { en: 'In Progress', ur: 'کارروائی جاری' }, icon: 'refresh' },
  { key: 'resolved', label: { en: 'Resolved', ur: 'حل ہو گیا' }, icon: 'check' },
];

export default function StatusTracker({ currentStatus, language = 'en' }: StatusTrackerProps) {
  const getStepIndex = (status: string) => statusSteps.findIndex(s => s.key === status);
  const currentStepIndex = getStepIndex(currentStatus);

  return (
    <div className="card">
      <div className="card-header">
        <h3 className="text-lg font-semibold text-neutral-900">
          {t({ en: 'Complaint Status', ur: 'شکایت کی حالت' }, language)}
        </h3>
      </div>
      <div className="card-body">
        {currentStatus === 'rejected' ? (
          <div className="text-center py-4" role="alert">
            <div className="w-12 h-12 rounded-full bg-danger-100 flex items-center justify-center mx-auto mb-3">
              <svg className="w-6 h-6 text-danger-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <p className="text-danger-600 font-medium">{t({ en: 'Complaint Rejected', ur: 'شکایت مسترد' }, language)}</p>
          </div>
        ) : (
          <div className="relative" role="list" aria-label={t({ en: 'Status progress', ur: 'کارروائی کی پیشرفت' }, language)}>
            <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-neutral-200" aria-hidden="true"></div>

            {statusSteps.map((step, index) => {
              const isCompleted = index <= currentStepIndex;
              const isCurrent = index === currentStepIndex;
              const Icon = step.icon === 'clock' ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              ) : step.icon === 'refresh' ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              );

              return (
                <div key={step.key} className="relative flex items-start pb-8 last:pb-0" role="listitem">
                  <div className={`relative z-10 flex items-center justify-center w-8 h-8 rounded-full transition-all duration-300 ${
                    isCompleted
                      ? isCurrent
                        ? 'bg-secondary-500 ring-4 ring-secondary-100'
                        : 'bg-success-500'
                      : 'bg-neutral-200'
                  }`} aria-current={isCurrent ? 'step' : undefined}>
                    <svg className={`w-4 h-4 ${isCompleted ? 'text-white' : 'text-neutral-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      {Icon}
                    </svg>
                  </div>
                  <div className="ml-3 flex-1">
                    <p className={`text-sm font-medium ${
                      isCompleted ? 'text-neutral-900' : 'text-neutral-400'
                    }`}>
                      {t(step.label, language)}
                    </p>
                    {isCurrent && (
                      <p className="text-xs text-secondary-600 mt-0.5 animate-pulse">
                        {t({ en: 'Current status', ur: 'موجودہ حالت' }, language)}
                      </p>
                    )}
                  </div>
                  {isCompleted && (
                    <div className="ml-2">
                      <svg className="w-5 h-5 text-success-500" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}