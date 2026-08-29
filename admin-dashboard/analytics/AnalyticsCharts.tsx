'use client';

import React from 'react';

interface AnalyticsChartsProps {
  categoryStats: Array<{ _id: string; count: number }>;
  cityStats: Array<{ _id: string; count: number }>;
  severityStats: Array<{ _id: string; count: number }>;
  weeklyTrend: Array<{ _id: string; count: number }>;
  language?: 'en' | 'ur';
}

const t = (key: { en: string; ur: string }, lang: 'en' | 'ur') => lang === 'ur' ? key.ur : key.en;

export default function AnalyticsCharts({
  categoryStats,
  cityStats,
  severityStats,
  weeklyTrend,
  language = 'en',
}: AnalyticsChartsProps) {
  // Simple SVG-based charts (no external dependencies)
  const renderBarChart = (data: Array<{ _id: string; count: number }>, color: string, maxValue: number) => {
    if (data.length === 0) return <p className="text-secondary-500 text-center py-8">{t({ en: 'No data', ur: 'کوئی ڈیٹا نہیں' }, language)}</p>;

    return (
      <div className="space-y-3">
        {data.slice(0, 8).map((item, i) => (
          <div key={i} className="flex items-center gap-3">
            <div className="w-24 text-sm text-secondary-600 truncate">{item._id}</div>
            <div className="flex-1 h-6 bg-secondary-100 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  width: `${(item.count / maxValue) * 100}%`,
                  backgroundColor: color,
                }}
              />
            </div>
            <div className="w-12 text-sm font-medium text-secondary-900 text-right">{item.count}</div>
          </div>
        ))}
      </div>
    );
  };

  const renderLineChart = (data: Array<{ _id: string; count: number }>, color: string) => {
    if (data.length === 0) return <p className="text-secondary-500 text-center py-8">{t({ en: 'No data', ur: 'کوئی ڈیٹا نہیں' }, language)}</p>;

    const maxCount = Math.max(...data.map(d => d.count), 1);
    const points = data.map((d, i) => {
      const x = (i / (data.length - 1)) * 100;
      const y = 100 - (d.count / maxCount) * 90;
      return `${x}% ${y}%`;
    }).join(',');

    return (
      <div className="relative h-48">
        <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
          {/* Grid lines */}
          <defs>
            <pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse">
              <path d="M 10 0 L 0 0 0 10" fill="none" stroke="#e2e8f0" strokeWidth="0.5" />
            </pattern>
          </defs>
          <rect width="100" height="100" fill="url(#grid)" />

          {/* Area */}
          <polyline
            fill="none"
            stroke={color}
            strokeWidth="2"
            points={points}
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Dots */}
          {data.map((d, i) => {
            const x = (i / (data.length - 1)) * 100;
            const y = 100 - (d.count / maxCount) * 90;
            return (
              <circle
                key={i}
                cx={`${x}%`}
                cy={`${y}%`}
                r="3"
                fill={color}
              />
            );
          })}
        </svg>
      </div>
    );
  };

  const maxCategory = Math.max(...categoryStats.map(d => d.count), 1);
  const maxCity = Math.max(...cityStats.map(d => d.count), 1);
  const maxSeverity = Math.max(...severityStats.map(d => d.count), 1);

  return (
    <div className="grid lg:grid-cols-2 gap-6">
      <div className="card">
        <div className="card-header">
          <h3 className="text-lg font-semibold text-secondary-900">{t({ en: 'Complaints by Category', ur: 'زمرے کے لحاظ سے شکایات' }, language)}</h3>
        </div>
        <div className="card-body">
          {renderBarChart(categoryStats, '#0ea5e9', maxCategory)}
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <h3 className="text-lg font-semibold text-secondary-900">{t({ en: 'Complaints by City', ur: 'شہر کے لحاظ سے شکایات' }, language)}</h3>
        </div>
        <div className="card-body">
          {renderBarChart(cityStats, '#22c55e', maxCity)}
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <h3 className="text-lg font-semibold text-secondary-900">{t({ en: 'Complaints by Severity', ur: 'شدید کے لحاظ سے شکایات' }, language)}</h3>
        </div>
        <div className="card-body">
          {renderBarChart(severityStats, '#f59e0b', maxSeverity)}
        </div>
      </div>

      <div className="card lg:col-span-2">
        <div className="card-header">
          <h3 className="text-lg font-semibold text-secondary-900">{t({ en: 'Weekly Trend', ur: 'ہفتہ وار رجحان' }, language)}</h3>
        </div>
        <div className="card-body">
          {renderLineChart(weeklyTrend, '#0ea5e9')}
        </div>
      </div>
    </div>
  );
}