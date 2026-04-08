"use client"
import React, { useEffect } from 'react'
import { getAuthToken } from '@/helper/SessionHelper';
import { useRouter } from 'next/navigation';
import Invoice from '@/components/invoice'
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
      <Invoice />
    </div>
  )
}

export default page
