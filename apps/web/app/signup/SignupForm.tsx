'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export function SignupForm() {
  const router = useRouter();
  useEffect(() => { router.replace('/login'); }, [router]);
  return null;
}
