'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { getStoredLanguage } from '@/lib/i18n';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  language: 'en' | 'ur';
}

const t = (key: { en: string; ur: string }, lang: 'en' | 'ur') => lang === 'ur' ? key.ur : key.en;

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    language: 'en',
  };

  constructor(props: Props) {
    super(props);
    if (typeof window !== 'undefined') {
      this.state.language = getStoredLanguage();
    }
  }

  public static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      const { language } = this.state;

      return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-neutral-50">
          <div className="max-w-md w-full bg-white rounded-2xl shadow-card border border-neutral-200/80 p-8 text-center">
            <div className="w-16 h-16 mx-auto mb-4 bg-danger-50 rounded-full flex items-center justify-center border-2 border-danger-200/50">
              <svg className="w-8 h-8 text-danger-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-neutral-900 mb-2">
              {t({ en: 'Something went wrong', ur: 'کچھ غلط ہو گیا' }, language)}
            </h2>
            <p className="text-neutral-500 mb-6">
              {t({
                en: 'We\'re sorry, but an unexpected error occurred. Please try refreshing the page.',
                ur: 'ہم معذرت خواہ ہیں، لیکن ایک غیر متوقع خرابی پیش آئی۔ براہ کرم صفحہ ریفریش کرنے کی کوشش کریں۔'
              }, language)}
            </p>
            <button
              onClick={() => window.location.reload()}
              className="btn-primary"
            >
              {t({ en: 'Refresh Page', ur: 'صفحہ ریفریش کریں' }, language)}
            </button>
            <details className="mt-6 text-start">
              <summary className="text-sm text-neutral-400 cursor-pointer">
                {t({ en: 'Error Details', ur: 'خرابی کی تفصیل' }, language)}
              </summary>
              <pre className="mt-2 p-3 bg-neutral-100 rounded-lg text-xs text-neutral-600 overflow-auto max-h-40">
                {this.state.error?.message}
                {this.state.error?.stack}
              </pre>
            </details>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
