'use client';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function F1IndexPage() {
  const router = useRouter();
  
  useEffect(() => {
    router.replace('/f1/live');
  }, [router]);
  
  return null;
}
