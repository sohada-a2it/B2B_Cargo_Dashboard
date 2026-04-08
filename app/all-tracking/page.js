"use client"
import React, { useEffect } from 'react'
import { getAuthToken } from '@/helper/SessionHelper';
import { useRouter } from 'next/navigation';
import  AllTracking from '@/components/allTracking'
function page() {
  const router = useRouter();
  useEffect(() => {
    const token = getAuthToken();
    if (!token) {
      router.push('/');
    }
  }, []);
  return (
    <div>
      <AllTracking />
    </div>
  )
}

export default page
