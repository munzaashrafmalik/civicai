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

const categoryLabels: Record<string, { en: string; ur: string }> = {
  pothole: { en: 'Pothole', ur: 'گڑھا' },
  garbage: { en: 'Garbage', ur: 'کوڑا' },
  water_leakage: { en: 'Water Leakage', ur: 'پانی کا رساو' },
  streetlight: { en: 'Streetlight', ur: 'سٹریٹ لائٹ' },
  drainage: { en: 'Drainage', ur: 'ڈرینج' },
  traffic_signal: { en: 'Traffic Signal', ur: 'ٹریفک سگنل' },
  road_damage: { en: 'Road Damage', ur: 'سڑک نقصان' },
  other: { en: 'Other', ur: 'دیگر' },
};

const cityLabels: Record<string, { en: string; ur: string }> = {
  karachi: { en: 'Karachi', ur: 'کراچی' },
  lahore: { en: 'Lahore', ur: 'لاہور' },
  islamabad: { en: 'Islamabad', ur: 'اسلام آباد' },
  rawalpindi: { en: 'Rawalpindi', ur: 'راولپنڈی' },
  peshawar: { en: 'Peshawar', ur: 'پشاور' },
  quetta: { en: 'Quetta', ur: 'کوئٹہ' },
  multan: { en: 'Multan', ur: 'ملتان' },
  faisalabad: { en: 'Faisalabad', ur: 'فیصل آباد' },
};

export default function AnalyticsCharts({
  categoryStats,
  cityStats,
  severityStats,
  weeklyTrend,
  language = 'en',
}: AnalyticsChartsProps) {
  // Simple SVG-based charts (no external dependencies)
  const renderBarChart = (
    data: Array<{ _id: string; count: number }>,
    color: string,
    maxValue: number,
    labelMap?: Record<string, { en: string; ur: string }>
  ) => {
    if (data.length === 0) return <p className="text-secondary-500 text-center py-8">{t({ en: 'No data', ur: 'کوئی ڈیٹا نہیں' }, language)}</p>;

    return (
      <div className="space-y-3">
        {data.slice(0, 8).map((item, i) => {
          const label = labelMap?.[item._id]
            ? t(labelMap[item._id], language)
            : item._id.replace(/_/g, ' ');
          return (
            <div key={i} className="flex items-center gap-3">
              <div className="w-28 text-sm text-secondary-600 truncate">{label}</div>
              <div className="flex-1 h-6 bg-secondary-100 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{ width: `${(item.count / maxValue) * 100}%`, backgroundColor: color }}
                />
              </div>
              <div className="w-12 text-sm font-medium text-secondary-900 text-right">{item.count}</div>
            </div>
          );
        })}
      </div>
    );
  };

  const renderLineChart = (data: Array<{ _id: string; count: number }>, color: string) => {
    // Build last 7 days array, filling missing days with 0
    const days: Array<{ date: string; count: number; label: { en: string; ur: string } }> = [];
    const dayNamesEn = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const dayNamesUr = ['اتوار', 'پیر', 'منگل', 'بدھ', 'جمعرات', 'جمعہ', 'ہفتہ'];

    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const key = d.toISOString().slice(0, 10);
      const found = data.find(x => x._id === key);
      days.push({
        date: key,
        count: found?.count || 0,
        label: { en: dayNamesEn[d.getDay()], ur: dayNamesUr[d.getDay()] },
      });
    }

    const maxCount = Math.max(...days.map(d => d.count), 1);
    const W = 300;
    const H = 120;
    const PAD = { top: 20, right: 10, bottom: 30, left: 30 };
    const chartW = W - PAD.left - PAD.right;
    const chartH = H - PAD.top - PAD.bottom;

    const pts = days.map((d, i) => ({
      x: PAD.left + (i / 6) * chartW,
      y: PAD.top + chartH - (d.count / maxCount) * chartH,
      count: d.count,
      label: d.label,
    }));

    const polyline = pts.map(p => `${p.x},${p.y}`).join(' ');
    const area = `${pts[0].x},${PAD.top + chartH} ${polyline} ${pts[pts.length - 1].x},${PAD.top + chartH}`;

    // Y-axis ticks
    const yTicks = [0, Math.round(maxCount / 2), maxCount];

    return (
      <div className="overflow-x-auto">
        <svg width={W} height={H} className="w-full" viewBox={`0 0 ${W} ${H}`}>
          {/* Y axis ticks */}
          {yTicks.map((tick, i) => {
            const y = PAD.top + chartH - (tick / maxCount) * chartH;
            return (
              <g key={i}>
                <line x1={PAD.left - 4} y1={y} x2={PAD.left + chartW} y2={y} stroke="#e2e8f0" strokeWidth="0.8" />
                <text x={PAD.left - 6} y={y + 4} textAnchor="end" fontSize="8" fill="#94a3b8">{tick}</text>
              </g>
            );
          })}

          {/* Area fill */}
          <polygon points={area} fill={color} fillOpacity="0.12" />

          {/* Line */}
          <polyline fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" points={polyline} />

          {/* Dots + labels */}
          {pts.map((p, i) => (
            <g key={i}>
              {p.count > 0 && (
                <text x={p.x} y={p.y - 6} textAnchor="middle" fontSize="8" fill={color} fontWeight="600">{p.count}</text>
              )}
              <circle cx={p.x} cy={p.y} r="4" fill="white" stroke={color} strokeWidth="2" />
              <text x={p.x} y={H - 4} textAnchor="middle" fontSize="8" fill="#64748b">
                {language === 'ur' ? p.label.ur : p.label.en}
              </text>
            </g>
          ))}

          {/* Y axis line */}
          <line x1={PAD.left} y1={PAD.top} x2={PAD.left} y2={PAD.top + chartH} stroke="#cbd5e1" strokeWidth="1" />
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
          {renderBarChart(categoryStats, '#0ea5e9', maxCategory, categoryLabels)}
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <h3 className="text-lg font-semibold text-secondary-900">{t({ en: 'Complaints by City', ur: 'شہر کے لحاظ سے شکایات' }, language)}</h3>
        </div>
        <div className="card-body">
          {renderBarChart(cityStats, '#22c55e', maxCity, cityLabels)}
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