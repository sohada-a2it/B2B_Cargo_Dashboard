"use client"
import React, { useEffect } from 'react'
import { getAuthToken } from '@/helper/SessionHelper';
import { useRouter } from 'next/navigation';
import ReceivedShipments from "@/components/warehouse/cosolidationQueuePage"
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
      <ReceivedShipments />
    </div>
  )
}

export default page
