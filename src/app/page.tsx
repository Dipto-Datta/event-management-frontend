'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    console.log(token);
    if (token) {
      router.replace('/dashboard');
    } else {
      router.replace('/login');
    }
    setIsChecking(false);
  }, [router]);

  if (isChecking) {
    return <div>Loading...</div>;
  }

  return null;
}