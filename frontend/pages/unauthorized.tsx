'use client';

import React from 'react';
import Link from 'next/link';

export default function UnauthorizedPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-secondary-50 p-4">
      <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8 text-center">
        <div className="w-16 h-16 mx-auto mb-4 bg-warning-50 rounded-full flex items-center justify-center">
          <svg className="w-8 h-8 text-warning-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-secondary-900 mb-2">Access Denied</h1>
        <p className="text-secondary-600 mb-1">
          You do not have permission to view this page. This area is restricted to administrators.
        </p>
        <p className="text-sm text-secondary-500 mb-6" dir="rtl" lang="ur">
          آپ کو اس صفحے کو دیکھنے کی اجازت نہیں ہے۔ یہ حصہ صرف انتظامیہ کے لیے ہے۔
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/" className="btn-primary">Go to Home</Link>
          <Link href="/login" className="btn-outline">Login as Admin</Link>
        </div>
      </div>
    </div>
  );
}
