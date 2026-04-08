"use client"
import React, { useEffect } from 'react'
import { getAuthToken } from '@/helper/SessionHelper';
import { useRouter } from 'next/navigation';
import AllShipping from "@/components/shippings/allShipping"
function all_shipping() {
    const router = useRouter();
  useEffect(() => {  // ← এই পুরো useEffect যোগ করুন
    const token = getAuthToken();
    if (!token) {
      router.push('/');
    }
  }, []);
  return (
    <div>
      <AllShipping/>
    </div>
  )
}

export default all_shipping
