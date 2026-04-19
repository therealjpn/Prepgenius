'use client';
import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

export default function JoinPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const ref = searchParams.get('ref') || '';

  useEffect(() => {
    // Save referral code to both localStorage and cookie for persistence through OAuth
    if (ref) {
      localStorage.setItem('pg_referral_code', ref);
      document.cookie = `pg_ref=${ref}; path=/; max-age=${60 * 60 * 24 * 7}; SameSite=Lax`;
    }
    // Redirect to login with ref param
    router.replace(`/login?ref=${ref}`);
  }, [ref, router]);

  return (
    <div className="loading-container">
      <div className="spinner" />
      <p>Redirecting you to sign up...</p>
    </div>
  );
}
