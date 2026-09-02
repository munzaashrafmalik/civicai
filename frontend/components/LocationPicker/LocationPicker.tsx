'use client';

import React, { useState, useCallback, useEffect } from 'react';

interface LocationPickerProps {
  onLocationChange: (location: { latitude: number; longitude: number; address?: string } | null) => void;
  language?: 'en' | 'ur';
  defaultLocation?: { latitude: number; longitude: number } | null;
}

const t = (key: { en: string; ur: string }, lang: 'en' | 'ur') => lang === 'ur' ? key.ur : key.en;

export default function LocationPicker({ onLocationChange, language = 'en', defaultLocation }: LocationPickerProps) {
  const [location, setLocation] = useState<{ latitude: number; longitude: number; address?: string } | null>(defaultLocation || null);
  const [address, setAddress] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [permissionDenied, setPermissionDenied] = useState(false);

  useEffect(() => {
    if (defaultLocation && !location) {
      setLocation(defaultLocation);
      onLocationChange(defaultLocation);
    }
  }, [defaultLocation, location, onLocationChange]);

  const getCurrentLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setError(t({ en: 'Geolocation is not supported by your browser', ur: 'جيو لوکیشن آپ کے براؤزر میں سپورٹڈ نہیں ہے' }, language));
      return;
    }

    setIsLoading(true);
    setError(null);
    setPermissionDenied(false);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const newLocation = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        };
        setLocation(newLocation);
        onLocationChange(newLocation);
        setIsLoading(false);
        // Reverse geocode to get address
        reverseGeocode(newLocation.latitude, newLocation.longitude);
      },
      (err) => {
        setIsLoading(false);
        if (err.code === err.PERMISSION_DENIED) {
          setPermissionDenied(true);
          setError(t({ en: 'Location permission denied. Please enable in browser settings.', ur: 'موقع کی اجازت ممنوع۔ براؤزر سیٹنگز میں فعال کریں۔' }, language));
        } else {
          setError(t({ en: 'Unable to retrieve location', ur: 'موقع حاصل کرنے میں ناکام' }, language));
        }
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  }, [language, onLocationChange]);

  const reverseGeocode = async (lat: number, lng: number) => {
    try {
      // Using OpenStreetMap Nominatim API (free, no key needed for demo)
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&accept-language=${language === 'ur' ? 'ur' : 'en'}`
      );
      const data = await response.json();
      if (data.display_name) {
        setAddress(data.display_name);
        setLocation(prev => prev ? { ...prev, address: data.display_name } : null);
      }
    } catch {
      // Silently fail - address is optional
    }
  };

  const handleAddressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAddress(e.target.value);
    if (location) {
      const newLocation = { ...location, address: e.target.value };
      setLocation(newLocation);
      onLocationChange(newLocation);
    }
  };

  const clearLocation = () => {
    setLocation(null);
    setAddress('');
    setError(null);
    onLocationChange(null);
  };

  return (
    <div className="w-full">
      <label className="label">
        {t({ en: 'Location', ur: 'موقع' }, language)}
      </label>

      <div className="space-y-3">
        <div className="flex gap-2">
          <button
            type="button"
            onClick={getCurrentLocation}
            disabled={isLoading}
            className="btn-primary flex-1"
            aria-busy={isLoading}
          >
            {isLoading ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                {t({ en: 'Getting location...', ur: 'موقع حاصل کیا جا رہا ہے...' }, language)}
              </>
            ) : (
              t({ en: 'Use Current Location', ur: 'موجودہ موقع استعمال کریں' }, language)
            )}
          </button>

          {location && (
            <button
              type="button"
              onClick={clearLocation}
              className="btn-outline"
              aria-label={t({ en: 'Clear location', ur: 'موقع صاف کریں' }, language)}
            >
              {t({ en: 'Clear', ur: 'صاف کریں' }, language)}
            </button>
          )}
        </div>

        <div className="relative">
          <input
            type="text"
            value={address}
            onChange={handleAddressChange}
            placeholder={t({ en: 'Enter or adjust address manually', ur: 'پتہ دستی طور پر داخل یا ترمیم کریں' }, language)}
            className="input pr-10"
            disabled={isLoading}
          />
          {location && (
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
              <svg className="w-5 h-5 text-success-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
          )}
        </div>

        {permissionDenied && (
          <div className="p-3 rounded-lg bg-warning-50 border border-warning-200 text-warning-800 text-sm" role="alert">
            <p className="font-medium mb-1">{t({ en: 'Location access blocked', ur: 'موقع کی رسائی بلاک ہے' }, language)}</p>
            <p>{t({ en: 'Please click the location icon in your browser address bar and allow access, then try again.', ur: 'براہ کرم اپنے براؤزر کے ایڈریس بار میں لوکیشن آئیکون پر کلک کریں اور اجازت دیں، پھر دوبارہ کوشش کریں۔' }, language)}</p>
          </div>
        )}

        {error && !permissionDenied && (
          <p className="text-sm text-danger-600" role="alert">{error}</p>
        )}

        {location && (
          <div className="p-3 rounded-lg bg-success-50 border border-success-200 text-success-800 text-sm" role="status">
            <p className="font-medium">{t({ en: 'Location captured', ur: 'موقع حاصل ہو گیا' }, language)}</p>
            <p className="font-mono text-xs mt-1">
              {t({ en: 'Lat', ur: 'العرض' }, language)}: {location.latitude.toFixed(6)}, {t({ en: 'Lng', ur: 'الطول' }, language)}: {location.longitude.toFixed(6)}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}