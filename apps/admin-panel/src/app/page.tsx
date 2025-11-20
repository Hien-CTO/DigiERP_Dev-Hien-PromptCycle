'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth';

export default function HomePage() {
  const router = useRouter();
  const { isAuthenticated, isLoading, initializeAuth } = useAuthStore();

  useEffect(() => {
    // Initialize auth state from localStorage
    initializeAuth();
  }, [initializeAuth]);

  useEffect(() => {
    if (!isLoading) {
      if (isAuthenticated) {
        // Redirect to admin if authenticated
        router.replace('/admin');
      } else {
        // Redirect to login if not authenticated
        router.replace('/login');
      }
    }
  }, [isAuthenticated, isLoading, router]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          DigiERP System
        </h1>
        <p className="text-gray-600">
          {isLoading ? 'Đang kiểm tra xác thực...' : 'Đang chuyển hướng...'}
        </p>
      </div>
    </div>
  );
}
