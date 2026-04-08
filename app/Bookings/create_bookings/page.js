"use client" 
import React, { useEffect } from 'react'
import { getAuthToken } from '@/helper/SessionHelper';
import { useRouter } from 'next/navigation';
import CreateShipment from "@/components/bookings/createBookings"
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
      <CreateShipment/>
    </div>
  )
}

export default page
