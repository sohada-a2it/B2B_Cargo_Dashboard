"use client"
import React, { useEffect } from 'react'
import { getAuthToken } from '@/helper/SessionHelper';
import { useRouter } from 'next/navigation';
import Warehouse from '@/components/warehouse/warehouse';
function page() {
    const router = useRouter();
  useEffect(() => {  // ← এই পুরো useEffect যোগ করুন
    const token = getAuthToken();
    if (!token) {
      router.push('/');
    }
  }, []);
  return (
    <div>
      <Warehouse />
    </div>
  )
}

export default page
