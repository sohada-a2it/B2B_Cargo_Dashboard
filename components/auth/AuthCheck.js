// components/AuthCheck.jsx
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getAuthToken } from '@/helper/SessionHelper';

export default function AuthCheck({ children }) {
  const router = useRouter();

  useEffect(() => {
    const token = getAuthToken();
    if (!token) { 
      router.push('/');
    }
  }, [router]);

  return children;
}