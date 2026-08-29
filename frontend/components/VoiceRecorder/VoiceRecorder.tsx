'use client';

import React, { useState, useRef, useCallback, useEffect } from 'react';

interface VoiceRecorderProps {
  onTranscriptChange: (transcript: string) => void;
  language?: 'en' | 'ur';
}

const t = (key: { en: string; ur: string }, lang: 'en' | 'ur') => lang === 'ur' ? key.ur : key.en;

type SpeechRecognitionLike = {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  maxAlternatives: number;
  start: () => void;
  stop: () => void;
  abort: () => void;
  onresult: ((event: any) => void) | null;
  onerror: ((event: any) => void) | null;
  onend: (() => void) | null;
};

function getSpeechRecognition(): (new () => SpeechRecognitionLike) | null {
  if (typeof window === 'undefined') return null;
  const w = window as any;
  return w.SpeechRecognition || w.webkitSpeechRecognition || null;
}

export default function VoiceRecorder({ onTranscriptChange, language = 'en' }: VoiceRecorderProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [support, setSupport] = useState(true);
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);
  const shouldListenRef = useRef(false);
  const finalTextRef = useRef('');

  useEffect(() => {
    const impl = getSpeechRecognition();
    setSupport(!!impl);
  }, []);

  useEffect(() => {
    return () => {
      shouldListenRef.current = false;
      recognitionRef.current?.abort();
    };
  }, []);

  const startRecording = useCallback(() => {
    const Impl = getSpeechRecognition();
    if (!Impl) {
      setError(t({ en: 'Voice input is not supported in this browser. Please use Chrome/Edge, or type instead.', ur: 'اس براؤزر میں آواز کی سپورٹ نہیں ہے۔ براہ کرم کروم/ایج استعمال کریں یا ٹائپ کریں۔' }, language));
      return;
    }

    setError(null);
    finalTextRef.current = '';
    setTranscript('');
    onTranscriptChange('');

    const recognition = new Impl();
    recognitionRef.current = recognition;
    recognition.lang = language === 'ur' ? 'ur-PK' : 'en-US';
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.maxAlternatives = 1;

    recognition.onresult = (event: any) => {
      let interim = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        if (result.isFinal) {
          finalTextRef.current += result[0].transcript;
        } else {
          interim += result[0].transcript;
        }
      }
      const combined = (finalTextRef.current + ' ' + interim).trim();
      setTranscript(combined);
      if (finalTextRef.current.trim()) {
        onTranscriptChange(finalTextRef.current.trim());
      }
    };

    recognition.onerror = (event: any) => {
      if (event.error === 'no-speech') return;
      if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
        setError(t({ en: 'Microphone access denied', ur: 'مائیکروفون کی اجازت ممنوع' }, language));
        shouldListenRef.current = false;
        setIsRecording(false);
        return;
      }
      setError(t({ en: 'Voice recognition error. Please try again.', ur: 'آواز کی شناخت میں خرابی۔ براہ کرم دوبارہ کوشش کریں۔' }, language));
    };

    // Chrome ends the session after silence; restart while the user hasn't tapped stop
    recognition.onend = () => {
      if (shouldListenRef.current) {
        try {
          recognition.start();
        } catch {
          // start() throws if called too soon after stop; ignore — next onend retries
        }
      }
    };

    try {
      recognition.start();
      shouldListenRef.current = true;
      setIsRecording(true);
    } catch {
      setError(t({ en: 'Could not start voice input. Please try again.', ur: 'آواز شروع نہیں ہو سکی۔ دوبارہ کوشش کریں۔' }, language));
    }
  }, [language, onTranscriptChange]);

  const stopRecording = useCallback(() => {
    shouldListenRef.current = false;
    recognitionRef.current?.stop();
    setIsRecording(false);
    if (finalTextRef.current.trim()) {
      onTranscriptChange(finalTextRef.current.trim());
    }
  }, [onTranscriptChange]);

  const clearTranscript = useCallback(() => {
    finalTextRef.current = '';
    setTranscript('');
    onTranscriptChange('');
  }, [onTranscriptChange]);

  return (
    <div className="w-full">
      <label className="label">
        {t({ en: 'Voice Description', ur: 'آواز سے تفصیل' }, language)}
      </label>

      {!support && (
        <div className="p-4 rounded-lg bg-warning-50 border border-warning-200 text-warning-800 text-sm" role="alert">
          {t({ en: 'Voice input is not supported in this browser. Please use Chrome or Edge, or type your description instead.', ur: 'اس براؤزر میں آواز سپورٹڈ نہیں ہے۔ براہ کرم کروم یا ایج استعمال کریں، یا اپنی تفصیل ٹائپ کریں۔' }, language)}
        </div>
      )}

      {support && (
        <>
          <div className="relative">
            <button
              type="button"
              onClick={isRecording ? stopRecording : startRecording}
              disabled={!support}
              className={`w-full flex items-center justify-center gap-3 px-6 py-4 rounded-xl border-2 transition-all ${
                isRecording
                  ? 'bg-danger-50 border-danger-500 text-danger-700 animate-pulse'
                  : 'bg-secondary-50 border-secondary-200 text-secondary-700 hover:bg-secondary-100 hover:border-primary-300'
              } focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent`}
              aria-pressed={isRecording}
              aria-label={isRecording
                ? t({ en: 'Stop recording', ur: 'ریکارڈنگ بند کریں' }, language)
                : t({ en: 'Start recording', ur: 'ریکارڈنگ شروع کریں' }, language)}
            >
              <div className={`flex items-center justify-center w-12 h-12 rounded-full ${
                isRecording
                  ? 'bg-danger-500'
                  : 'bg-primary-500'
              }`}>
                <svg
                  className="w-6 h-6 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  {isRecording ? (
                    <rect x="6" y="4" width="12" height="16" rx="2" />
                  ) : (
                    <circle cx="12" cy="12" r="8" />
                  )}
                </svg>
              </div>
              <div className="text-left rtl:text-right">
                <p className="font-medium">
                  {isRecording
                    ? t({ en: 'Listening... Tap to stop', ur: 'سن رہے ہیں... بند کرنے کے لیے ٹیب کریں' }, language)
                    : t({ en: 'Tap to speak about the issue', ur: 'مسئلے کے بارے میں بولنے کے لیے ٹیب کریں' }, language)}
                </p>
                <p className="text-sm opacity-75">
                  {isRecording
                    ? t({ en: 'Live transcription — speak in Urdu or English', ur: 'براہ راست تحریر — اردو یا انگریزی میں بولیں' }, language)
                    : t({ en: 'Speech-to-text • Urdu or English', ur: 'اسپیچ ٹو ٹیکسٹ • اردو یا انگریزی' }, language)}
                </p>
              </div>
            </button>

            {isRecording && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="w-20 h-20 rounded-full border-4 border-danger-500 border-t-transparent animate-spin" aria-hidden="true" />
              </div>
            )}
          </div>

          {transcript && (
            <div className="mt-4 p-4 rounded-lg bg-secondary-50 border border-secondary-200 animate-fade-in">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1">
                  <p className="text-sm font-medium text-secondary-700 mb-1">
                    {t({ en: 'Transcript', ur: 'تحریر' }, language)}
                  </p>
                  <p className="text-secondary-900">{transcript}</p>
                </div>
                <button
                  type="button"
                  onClick={clearTranscript}
                  className="p-2 text-secondary-500 hover:text-danger-600 hover:bg-danger-50 rounded-lg transition-colors"
                  aria-label={t({ en: 'Clear transcript', ur: 'تحریر صاف کریں' }, language)}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
          )}

          {error && (
            <p className="mt-2 text-sm text-danger-600" role="alert">{error}</p>
          )}
        </>
      )}
    </div>
  );
}
