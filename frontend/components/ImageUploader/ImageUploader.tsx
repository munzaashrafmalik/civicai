'use client';

import React, { useState, useCallback } from 'react';

interface ImageUploaderProps {
  onImagesChange: (images: File[]) => void;
  maxImages?: number;
  maxSizeMB?: number;
  acceptedTypes?: string[];
  language?: 'en' | 'ur';
}

const t = (key: { en: string; ur: string }, lang: 'en' | 'ur') => lang === 'ur' ? key.ur : key.en;

export default function ImageUploader({
  onImagesChange,
  maxImages = 5,
  maxSizeMB = 5,
  acceptedTypes = ['image/jpeg', 'image/png', 'image/webp'],
  language = 'en',
}: ImageUploaderProps) {
  const [images, setImages] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const validateFile = useCallback((file: File): boolean => {
    if (!acceptedTypes.includes(file.type)) {
      setError(t({ en: 'Invalid file type. Please upload JPEG, PNG, or WebP images.', ur: 'غلط فائل کی قسم۔ براہ کرم JPEG، PNG، یا WebP تصاویر اپ لوڈ کریں۔' }, language));
      return false;
    }
    if (file.size > maxSizeMB * 1024 * 1024) {
      setError(t({ en: `File size exceeds ${maxSizeMB}MB limit.`, ur: `فائل کا سائز ${maxSizeMB}MB کی حد سے زیادہ ہے۔` }, language));
      return false;
    }
    return true;
  }, [acceptedTypes, maxSizeMB, language]);

  const handleFiles = useCallback((files: FileList) => {
    const validFiles: File[] = [];
    const newPreviews: string[] = [];

    Array.from(files).forEach((file) => {
      if (images.length + validFiles.length >= maxImages) return;
      if (validateFile(file)) {
        validFiles.push(file);
        newPreviews.push(URL.createObjectURL(file));
      }
    });

    if (validFiles.length > 0) {
      const updatedImages = [...images, ...validFiles];
      setImages(updatedImages);
      setPreviews((prev) => [...prev, ...newPreviews]);
      onImagesChange(updatedImages);
      setError(null);
    }
  }, [images, maxImages, validateFile, onImagesChange]);

  const removeImage = useCallback((index: number) => {
    const updatedImages = images.filter((_, i) => i !== index);
    const updatedPreviews = previews.filter((_, i) => i !== index);
    URL.revokeObjectURL(previews[index]);
    setImages(updatedImages);
    setPreviews(updatedPreviews);
    onImagesChange(updatedImages);
  }, [images, previews, onImagesChange]);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files) {
      handleFiles(e.dataTransfer.files);
    }
  }, [handleFiles]);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      handleFiles(e.target.files);
    }
  }, [handleFiles]);

  return (
    <div className="w-full">
      <label className="label">
        {t({ en: 'Upload Photos', ur: 'تصاویر اپ لوڈ کریں' }, language)}
        <span className="text-secondary-500 ml-1">({t({ en: 'Max', ur: 'اکثرین' }, language)} {maxImages}, {t({ en: 'Max', ur: 'اکثرین' }, language)} {maxSizeMB}MB)</span>
      </label>

      <div
        className={`relative border-2 border-dashed rounded-xl p-6 transition-colors ${
          dragActive
            ? 'border-primary-500 bg-primary-50'
            : 'border-secondary-300 hover:border-primary-400'
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <input
          type="file"
          multiple
          accept={acceptedTypes.join(',')}
          onChange={handleInputChange}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          id="image-upload"
          aria-label={t({ en: 'Upload images', ur: 'تصاویر اپ لوڈ کریں' }, language)}
        />

        <div className="text-center">
          <svg
            className="mx-auto h-12 w-12 text-secondary-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
          <p className="mt-2 text-sm text-secondary-600">
            {t({ en: 'Drag & drop photos here, or click to select', ur: 'تصاویر یہاں ڈراگ اور ڈراپ کریں، یا منتخب کرنے کے لیے کلک کریں' }, language)}
          </p>
          <p className="mt-1 text-xs text-secondary-500">
            {t({ en: 'JPEG, PNG, WebP up to 5MB each', ur: 'JPEG، PNG، WebP، ہر ایک 5MB تک' }, language)}
          </p>
        </div>
      </div>

      {error && (
        <p className="mt-2 text-sm text-danger-600" role="alert">{error}</p>
      )}

      {previews.length > 0 && (
        <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3" role="list" aria-label={t({ en: 'Uploaded images', ur: 'اپ لوڈ کی گئی تصاویر' }, language)}>
          {previews.map((preview, index) => (
            <div key={index} className="relative aspect-square rounded-lg overflow-hidden bg-secondary-100 animate-scale-in" role="listitem">
              <img
                src={preview}
                alt={t({ en: `Uploaded image ${index + 1}`, ur: `اپ لوڈ کی گئی تصویر ${index + 1}` }, language)}
                className="w-full h-full object-cover"
              />
              <button
                type="button"
                onClick={() => removeImage(index)}
                className="absolute top-1 right-1 p-1 bg-danger-500 text-white rounded-full hover:bg-danger-600 transition-colors focus:outline-none focus:ring-2 focus:ring-danger-500 focus:ring-offset-2"
                aria-label={t({ en: `Remove image ${index + 1}`, ur: `تصویر ${index + 1} ہٹائیں` }, language)}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}