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
  pothole:        { en: 'Pothole',        ur: 'گڑھا' },
  garbage:        { en: 'Garbage',        ur: 'کوڑا' },
  water_leakage:  { en: 'Water Leakage',  ur: 'پانی کا رساو' },
  streetlight:    { en: 'Streetlight',    ur: 'سٹریٹ لائٹ' },
  drainage:       { en: 'Drainage',       ur: 'ڈرینج' },
  traffic_signal: { en: 'Traffic Signal', ur: 'ٹریفک سگنل' },
  road_damage:    { en: 'Road Damage',    ur: 'سڑک نقصان' },
  other:          { en: 'Other',          ur: 'دیگر' },
};

const cityLabels: Record<string, { en: string; ur: string }> = {
  karachi:     { en: 'Karachi',     ur: 'کراچی' },
  lahore:      { en: 'Lahore',      ur: 'لاہور' },
  islamabad:   { en: 'Islamabad',   ur: 'اسلام آباد' },
  rawalpindi:  { en: 'Rawalpindi',  ur: 'راولپنڈی' },
  peshawar:    { en: 'Peshawar',    ur: 'پشاور' },
  quetta:      { en: 'Quetta',      ur: 'کوئٹہ' },
  multan:      { en: 'Multan',      ur: 'ملتان' },
  faisalabad:  { en: 'Faisalabad',  ur: 'فیصل آباد' },
};

const severityLabels: Record<string, { en: string; ur: string }> = {
  low:      { en: 'Low',      ur: 'کم' },
  medium:   { en: 'Medium',   ur: 'درمیانہ' },
  high:     { en: 'High',     ur: 'زیادہ' },
  critical: { en: 'Critical', ur: 'انتہائی' },
};

const severityColors: Record<string, string> = {
  low:      '#22c55e',
  medium:   '#f59e0b',
  high:     '#ef4444',
  critical: '#7c3aed',
};

export default function AnalyticsCharts({
  categoryStats,
  cityStats,
  severityStats,
  weeklyTrend,
  language = 'en',
}: AnalyticsChartsProps) {

  const renderBarChart = (
    data: Array<{ _id: string; count: number }>,
    gradientFrom: string,
    gradientTo: string,
    maxValue: number,
    labelMap?: Record<string, { en: string; ur: string }>,
    colorMap?: Record<string, string>
  ) => {
    if (data.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center py-12 text-secondary-400">
          <svg className="w-12 h-12 mb-3 opacity-40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
          <p className="text-sm">{t({ en: 'No data available', ur: 'کوئی ڈیٹا دستیاب نہیں' }, language)}</p>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        {data.slice(0, 8).map((item, i) => {
          const label = labelMap?.[item._id]
            ? t(labelMap[item._id], language)
            : item._id.replace(/_/g, ' ');
          const pct = Math.round((item.count / maxValue) * 100);
          const barColor = colorMap?.[item._id] || gradientFrom;

          return (
            <div key={i} className="group">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-sm font-medium text-secondary-700 truncate max-w-[60%]">{label}</span>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-secondary-400">{pct}%</span>
                  <span className="text-sm font-bold text-secondary-900 w-6 text-right">{item.count}</span>
                </div>
              </div>
              <div className="h-3 bg-secondary-100 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-700 ease-out"
                  style={{
                    width: `${pct}%`,
                    background: colorMap
                      ? barColor
                      : `linear-gradient(90deg, ${gradientFrom}, ${gradientTo})`,
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  const renderLineChart = (data: Array<{ _id: string; count: number }>, color: string) => {
    const dayNamesEn = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const dayNamesUr = ['اتوار', 'پیر', 'منگل', 'بدھ', 'جمعرات', 'جمعہ', 'ہفتہ'];

    const days = Array.from({ length: 7 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (6 - i));
      const key = d.toISOString().slice(0, 10);
      const found = data.find(x => x._id === key);
      return {
        count: found?.count || 0,
        label: { en: dayNamesEn[d.getDay()], ur: dayNamesUr[d.getDay()] },
        date: d.getDate(),
      };
    });

    const maxCount = Math.max(...days.map(d => d.count), 1);
    const W = 560;
    const H = 200;
    const PAD = { top: 30, right: 20, bottom: 45, left: 40 };
    const cW = W - PAD.left - PAD.right;
    const cH = H - PAD.top - PAD.bottom;

    const pts = days.map((d, i) => ({
      x: PAD.left + (i / 6) * cW,
      y: PAD.top + cH - (d.count / maxCount) * cH,
      count: d.count,
      label: d.label,
      date: d.date,
    }));

    const polyline = pts.map(p => `${p.x},${p.y}`).join(' ');
    const areaPath = `M${pts[0].x},${PAD.top + cH} ${pts.map(p => `L${p.x},${p.y}`).join(' ')} L${pts[pts.length - 1].x},${PAD.top + cH} Z`;

    const yTicks = [0, Math.ceil(maxCount / 4), Math.ceil(maxCount / 2), Math.ceil((maxCount * 3) / 4), maxCount]
      .filter((v, i, a) => a.indexOf(v) === i);

    return (
      <div className="w-full overflow-x-auto">
        <svg width={W} height={H} className="w-full" viewBox={`0 0 ${W} ${H}`} style={{ minWidth: 320 }}>
          <defs>
            <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity="0.25" />
              <stop offset="100%" stopColor={color} stopOpacity="0.02" />
            </linearGradient>
            <filter id="shadow">
              <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor={color} floodOpacity="0.3" />
            </filter>
          </defs>

          {/* Y grid + ticks */}
          {yTicks.map((tick, i) => {
            const y = PAD.top + cH - (tick / maxCount) * cH;
            return (
              <g key={i}>
                <line x1={PAD.left} y1={y} x2={PAD.left + cW} y2={y}
                  stroke="#f1f5f9" strokeWidth={tick === 0 ? 1 : 0.8} />
                <text x={PAD.left - 8} y={y + 4} textAnchor="end"
                  fontSize="10" fill="#94a3b8" fontFamily="system-ui">{tick}</text>
              </g>
            );
          })}

          {/* Area */}
          <path d={areaPath} fill="url(#areaGrad)" />

          {/* Line */}
          <polyline
            fill="none"
            stroke={color}
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            points={polyline}
            filter="url(#shadow)"
          />

          {/* Dots + count labels + day labels */}
          {pts.map((p, i) => (
            <g key={i}>
              {/* Count above dot */}
              {p.count > 0 && (
                <text x={p.x} y={p.y - 12} textAnchor="middle"
                  fontSize="11" fontWeight="700" fill={color} fontFamily="system-ui">
                  {p.count}
                </text>
              )}
              {/* Outer ring */}
              <circle cx={p.x} cy={p.y} r="6" fill="white"
                stroke={color} strokeWidth="2" filter="url(#shadow)" />
              {/* Inner dot */}
              <circle cx={p.x} cy={p.y} r="3" fill={p.count > 0 ? color : '#e2e8f0'} />

              {/* Day label */}
              <text x={p.x} y={H - 20} textAnchor="middle"
                fontSize="11" fontWeight="600" fill="#475569" fontFamily="system-ui">
                {language === 'ur' ? p.label.ur : p.label.en}
              </text>
              {/* Date number */}
              <text x={p.x} y={H - 6} textAnchor="middle"
                fontSize="9" fill="#94a3b8" fontFamily="system-ui">
                {p.date}
              </text>
            </g>
          ))}

          {/* Y axis */}
          <line x1={PAD.left} y1={PAD.top} x2={PAD.left} y2={PAD.top + cH}
            stroke="#e2e8f0" strokeWidth="1" />
          {/* X axis */}
          <line x1={PAD.left} y1={PAD.top + cH} x2={PAD.left + cW} y2={PAD.top + cH}
            stroke="#e2e8f0" strokeWidth="1" />
        </svg>
      </div>
    );
  };

  const maxCategory = Math.max(...categoryStats.map(d => d.count), 1);
  const maxCity     = Math.max(...cityStats.map(d => d.count), 1);
  const maxSeverity = Math.max(...severityStats.map(d => d.count), 1);

  return (
    <div className="space-y-6 p-6">
      {/* Row 1: Category + City */}
      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl border border-secondary-100 shadow-sm p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-9 h-9 rounded-xl bg-sky-50 flex items-center justify-center">
              <svg className="w-5 h-5 text-sky-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
              </svg>
            </div>
            <div>
              <h3 className="text-base font-semibold text-secondary-900">
                {t({ en: 'Complaints by Category', ur: 'زمرے کے لحاظ سے شکایات' }, language)}
              </h3>
              <p className="text-xs text-secondary-400">{t({ en: 'All time', ur: 'مجموعی' }, language)}</p>
            </div>
          </div>
          {renderBarChart(categoryStats, '#0ea5e9', '#38bdf8', maxCategory, categoryLabels)}
        </div>

        <div className="bg-white rounded-2xl border border-secondary-100 shadow-sm p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-9 h-9 rounded-xl bg-emerald-50 flex items-center justify-center">
              <svg className="w-5 h-5 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <div>
              <h3 className="text-base font-semibold text-secondary-900">
                {t({ en: 'Complaints by City', ur: 'شہر کے لحاظ سے شکایات' }, language)}
              </h3>
              <p className="text-xs text-secondary-400">{t({ en: 'All cities', ur: 'تمام شہر' }, language)}</p>
            </div>
          </div>
          {renderBarChart(cityStats, '#10b981', '#34d399', maxCity, cityLabels)}
        </div>
      </div>

      {/* Row 2: Severity + Weekly */}
      <div className="grid lg:grid-cols-5 gap-6">
        <div className="bg-white rounded-2xl border border-secondary-100 shadow-sm p-6 lg:col-span-2">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-9 h-9 rounded-xl bg-amber-50 flex items-center justify-center">
              <svg className="w-5 h-5 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <div>
              <h3 className="text-base font-semibold text-secondary-900">
                {t({ en: 'By Severity', ur: 'شدت کے لحاظ سے' }, language)}
              </h3>
              <p className="text-xs text-secondary-400">{t({ en: 'Impact level', ur: 'اثر کی سطح' }, language)}</p>
            </div>
          </div>
          {renderBarChart(severityStats, '#f59e0b', '#fbbf24', maxSeverity, severityLabels, severityColors)}
        </div>

        <div className="bg-white rounded-2xl border border-secondary-100 shadow-sm p-6 lg:col-span-3">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-9 h-9 rounded-xl bg-primary-50 flex items-center justify-center">
              <svg className="w-5 h-5 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
            <div>
              <h3 className="text-base font-semibold text-secondary-900">
                {t({ en: 'Weekly Trend', ur: 'ہفتہ وار رجحان' }, language)}
              </h3>
              <p className="text-xs text-secondary-400">{t({ en: 'Last 7 days', ur: 'گزشتہ 7 دن' }, language)}</p>
            </div>
          </div>
          {renderLineChart(weeklyTrend, '#0ea5e9')}
        </div>
      </div>
    </div>
  );
}
