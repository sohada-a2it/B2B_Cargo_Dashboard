'use client'
import React, { useEffect } from 'react'
import { getAuthToken } from '@/helper/SessionHelper';
import { useRouter } from 'next/navigation';
import CreateStaff from "@/components/user/createStaff"
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
      <CreateStaff/>
    </div>
  )
}

export default page
