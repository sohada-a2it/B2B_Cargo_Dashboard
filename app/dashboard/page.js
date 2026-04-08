"use client"
import Dashbpard from "@/components/dashboard/dashboard"
import React, { useEffect } from 'react'
import { getAuthToken } from '@/helper/SessionHelper';
import { useRouter } from 'next/navigation';
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
      <Dashbpard/>
    </div>
  )
}

export default page
