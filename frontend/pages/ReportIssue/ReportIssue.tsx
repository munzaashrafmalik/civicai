'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useSession } from 'next-auth/react';
import { useToastHelpers } from '@/components/Toast';
import Navbar from '@/components/Navbar/Navbar';
import ImageUploader from '@/components/ImageUploader/ImageUploader';
import VoiceRecorder from '@/components/VoiceRecorder/VoiceRecorder';
import LocationPicker from '@/components/LocationPicker/LocationPicker';
import AIAnalysis from '@/components/AIAnalysis/AIAnalysis';
import ComplaintPreview from '@/components/ComplaintPreview/ComplaintPreview';
import { aiApi, complaintsApi } from '@/lib/api';
import { getStoredLanguage } from '@/lib/i18n';

const t = (key: { en: string; ur: string }, lang: 'en' | 'ur') => lang === 'ur' ? key.ur : key.en;

function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

const MAX_IMAGE_DIM = 1280;
const JPEG_QUALITY = 0.8;

async function compressImageToDataUrl(file: File): Promise<string> {
  if (!file.type.startsWith('image/')) return fileToDataUrl(file);

  try {
    const bitmap = await createImageBitmap(file);
    const scale = Math.min(1, MAX_IMAGE_DIM / Math.max(bitmap.width, bitmap.height));
    const w = Math.round(bitmap.width * scale);
    const h = Math.round(bitmap.height * scale);

    const canvas = document.createElement('canvas');
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext('2d');
    if (!ctx) return fileToDataUrl(file);
    ctx.drawImage(bitmap, 0, 0, w, h);
    bitmap.close?.();

    return canvas.toDataURL('image/jpeg', JPEG_QUALITY);
  } catch {
    return fileToDataUrl(file);
  }
}

type Step = 'input' | 'analysis' | 'preview';

interface FormData {
  title: string;
  description: string;
  category: string;
  severity: string;
  images: File[];
  voiceTranscript: string;
  location: { latitude: number; longitude: number; address?: string } | null;
}

interface AIAnalysisResult {
  issueCategory: string;
  confidence: number;
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  suggestedTitle: string;
  detectedObjects?: string[];
}

export default function ReportIssuePage() {
  const router = useRouter();
  const { data: session } = useSession();
  const { success, error } = useToastHelpers();
  const [language, setLanguage] = useState<'en' | 'ur'>(getStoredLanguage);

  useEffect(() => {
    const sessionLang = (session?.user as any)?.language;
    if (sessionLang === 'ur') setLanguage('ur');
  }, [session]);
  const [step, setStep] = useState<Step>('input');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AIAnalysisResult | null>(null);

  const [formData, setFormData] = useState<FormData>({
    title: '',
    description: '',
    category: '',
    severity: 'medium',
    images: [],
    voiceTranscript: '',
    location: null,
  });

  const [previewUrls, setPreviewUrls] = useState<string[]>([]);

  const handleImagesChange = useCallback((images: File[]) => {
    setFormData(prev => ({ ...prev, images }));
    setPreviewUrls(prev => {
      prev.forEach(url => URL.revokeObjectURL(url));
      return images.map(f => URL.createObjectURL(f));
    });
  }, []);

  const handleVoiceTranscript = useCallback((transcript: string) => {
    setFormData(prev => ({ ...prev, voiceTranscript: transcript }));
  }, []);

  const handleLocationChange = useCallback((location: { latitude: number; longitude: number; address?: string } | null) => {
    setFormData(prev => ({ ...prev, location }));
  }, []);

  const analyzeWithAI = async () => {
    if (!formData.images.length && !formData.voiceTranscript.trim() && !formData.description.trim()) {
      error(t({ en: 'Input Required', ur: 'ان پٹ درکار ہے' }, language), t({ en: 'Please provide at least a photo, voice description, or text description', ur: 'براہ کرم کم از کم ایک تصویر، آوازی تفصیل، یا متن تفصیل فراہم کریں' }, language));
      return;
    }

    if (!formData.location) {
      error(t({ en: 'Location Required', ur: 'موقع درکار ہے' }, language), t({ en: 'Please select a location', ur: 'براہ کرم مقام منتخب کریں' }, language));
      return;
    }

    setIsAnalyzing(true);

    try {
      const imagesData = await Promise.all(formData.images.map(compressImageToDataUrl));

      const response = await aiApi.analyze({
        description: formData.description,
        images: imagesData,
        voiceTranscript: formData.voiceTranscript || undefined,
      });

      const result: AIAnalysisResult = {
        issueCategory: (response.data as any).issueCategory,
        confidence: (response.data as any).confidence,
        severity: (response.data as any).severity,
        description: (response.data as any).description,
        suggestedTitle: (response.data as any).suggestedTitle,
        detectedObjects: (response.data as any).detectedObjects,
      };

      setAnalysisResult(result);
      setFormData(prev => ({
        ...prev,
        title: result.suggestedTitle,
        description: result.description,
        category: result.issueCategory,
        severity: result.severity,
      }));
      setStep('analysis');
    } catch (err: any) {
      console.error('AI Analysis error:', err);
      error(t({ en: 'Analysis Failed', ur: 'تجزیہ ناکام' }, language), err.message || t({ en: 'Failed to analyze. Please try again.', ur: 'تجزیہ کرنے میں ناکام۔ براہ کرم دوبارہ کوشش کریں۔' }, language));
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);

    try {
      const imagesData = await Promise.all(formData.images.map(compressImageToDataUrl));

      const response = await complaintsApi.create({
        title: formData.title,
        description: formData.description,
        category: formData.category,
        severity: formData.severity,
        location: {
          latitude: formData.location!.latitude,
          longitude: formData.location!.longitude,
          address: formData.location!.address || '',
        },
        images: imagesData,
        voiceTranscript: formData.voiceTranscript || undefined,
        aiAnalysis: analysisResult ? {
          issueCategory: analysisResult.issueCategory,
          confidence: analysisResult.confidence,
          severity: analysisResult.severity,
          description: analysisResult.description,
          suggestedTitle: analysisResult.suggestedTitle,
          detectedObjects: analysisResult.detectedObjects,
        } : undefined,
      });

      success(t({ en: 'Success!', ur: 'کامیابی!' }, language), t({ en: 'Complaint submitted successfully!', ur: 'شکایت کامیابی سے جمع ہو گئی!' }, language));

      setIsSubmitting(false);
      router.push(`/complaints/${(response.data as any).complaintId}?submitted=true`);
    } catch (err: any) {
      console.error('Submit error:', err);
      error(t({ en: 'Submission Failed', ur: 'جمع کرنے میں ناکام' }, language), err.message || t({ en: 'Failed to submit complaint. Please try again.', ur: 'شکایت جمع کرنے میں ناکام۔ براہ کرم دوبارہ کوشش کریں۔' }, language));
      setIsSubmitting(false);
    }
  };

  const goBack = () => {
    if (step === 'analysis') setStep('input');
    else if (step === 'preview') setStep('analysis');
  };

  const canAnalyze = formData.images.length > 0 || formData.voiceTranscript.trim() || formData.description.trim();

  return (
    <div className="min-h-screen bg-neutral-50">
      <Navbar language={language} onLanguageChange={setLanguage} />

      <main className="pt-16 pb-12">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Page Header */}
          <div className="mb-8">
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent-50 text-accent-700 text-xs font-semibold border border-accent-200/50 mb-3">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.734-.988-2.386l-.548-.547z" />
              </svg>
              {t({ en: 'AI-Powered', ur: 'اے آئی سے لیس' }, language)}
            </span>
            <h1 className="text-2xl sm:text-3xl font-bold text-neutral-900">
              {t({ en: 'Report an Issue', ur: 'مسئلہ رپورٹ کریں' }, language)}
            </h1>
            <p className="text-neutral-500 mt-1">
              {t({ en: 'Our AI will analyze and route your complaint automatically', ur: 'ہماری اے آئی آپ کی شکایت خود بخود تجزیہ اور روٹ کرے گی' }, language)}
            </p>
          </div>

          {/* Progress indicator */}
          <div className="mb-8" role="navigation" aria-label="Progress">
            <div className="flex items-center justify-between">
              {(['input', 'analysis', 'preview'] as const).map((s, i) => {
                const stepLabels = {
                  input: { en: 'Report', ur: 'رپورٹ' },
                  analysis: { en: 'AI Analysis', ur: 'اے آئی تجزیہ' },
                  preview: { en: 'Review & Submit', ur: 'جائزہ اور جمع' },
                };
                const isActive = ['input', 'analysis', 'preview'].indexOf(step) >= i;
                const isCurrent = step === s;
                return (
                  <React.Fragment key={s}>
                    <div className="flex flex-col items-center">
                      <div className={`relative w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300 ${
                        isActive ? 'bg-gradient-to-br from-secondary-500 to-secondary-600 text-white shadow-lg shadow-secondary-500/20' : 'bg-neutral-200 text-neutral-400'
                      } ${isCurrent ? 'ring-4 ring-secondary-100 scale-110' : ''}`}>
                        {isActive && i < ['input', 'analysis', 'preview'].indexOf(step) ? (
                          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        ) : i + 1}
                      </div>
                      <span className={`mt-2 text-xs font-medium text-center transition-colors duration-300 ${isActive ? 'text-neutral-900' : 'text-neutral-400'}`}>
                        {t(stepLabels[s], language)}
                      </span>
                    </div>
                    {i < 2 && (
                      <div className={`flex-1 h-0.5 mx-2 rounded-full transition-colors duration-300 ${isActive ? 'bg-gradient-to-r from-secondary-500 to-secondary-400' : 'bg-neutral-200'}`} />
                    )}
                  </React.Fragment>
                );
              })}
            </div>
          </div>

          {/* Step 1: Input */}
          {step === 'input' && (
            <div className="animate-fade-in">
              <div className="card">
                <div className="card-header">
                  <h2 className="text-xl font-semibold text-neutral-900">
                    {t({ en: 'Report an Issue', ur: 'مسئلہ رپورٹ کریں' }, language)}
                  </h2>
                </div>
                <div className="card-body space-y-6">
                  <div>
                    <label className="label">{t({ en: 'Title', ur: 'عنوان' }, language)}</label>
                    <input
                      type="text"
                      value={formData.title}
                      onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                      placeholder={t({ en: 'Brief title of the issue', ur: 'مسئلے کا مختصر عنوان' }, language)}
                      className="input"
                    />
                  </div>

                  <div>
                    <label className="label">{t({ en: 'Description', ur: 'تفصیل' }, language)}</label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                      rows={4}
                      placeholder={t({ en: 'Describe the issue in detail...', ur: 'مسئلے کی تفصیل سے وضاحت کریں...' }, language)}
                      className="input"
                    />
                  </div>

                  <ImageUploader
                    onImagesChange={handleImagesChange}
                    language={language}
                  />

                  <VoiceRecorder
                    onTranscriptChange={handleVoiceTranscript}
                    language={language}
                  />

                  <LocationPicker
                    onLocationChange={handleLocationChange}
                    language={language}
                  />
                </div>
              </div>

              <div className="mt-6 flex justify-end">
                <button
                  onClick={analyzeWithAI}
                  disabled={!canAnalyze || isAnalyzing}
                  className="btn-ai px-8 py-3 flex items-center"
                >
                  {isAnalyzing ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      {t({ en: 'Analyzing...', ur: 'تجزیہ ہو رہا ہے...' }, language)}
                    </>
                  ) : (
                    t({ en: 'Analyze with AI', ur: 'اے آئی سے تجزیہ کریں' }, language)
                  )}
                </button>
              </div>
            </div>
          )}

          {/* Step 2: AI Analysis */}
          {step === 'analysis' && (
            <div className="animate-fade-in">
              <AIAnalysis
                analysis={analysisResult}
                isLoading={false}
                language={language}
              />

              <div className="mt-6 flex justify-between">
                <button onClick={goBack} className="btn-outline">
                  {t({ en: 'Back', ur: 'واپس' }, language)}
                </button>
                <button
                  onClick={() => setStep('preview')}
                  className="btn-primary"
                >
                  {t({ en: 'Review & Submit', ur: 'جائزہ اور جمع کریں' }, language)}
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Preview & Submit */}
          {step === 'preview' && (
            <div className="animate-fade-in">
              <ComplaintPreview
                title={formData.title}
                description={formData.description}
                category={formData.category}
                severity={formData.severity}
                location={formData.location || { latitude: 0, longitude: 0 }}
                images={previewUrls}
                voiceTranscript={formData.voiceTranscript || undefined}
                language={language}
              />

              <div className="mt-6 flex justify-between">
                <button onClick={goBack} className="btn-outline">
                  {t({ en: 'Back', ur: 'واپس' }, language)}
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="btn-primary"
                >
                  {isSubmitting ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      {t({ en: 'Submitting...', ur: 'جمع کیا جا رہا ہے...' }, language)}
                    </>
                  ) : (
                    t({ en: 'Submit Complaint', ur: 'شکایت جمع کریں' }, language)
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}