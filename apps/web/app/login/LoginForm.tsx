'use client';
import { useEffect, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import { useAuth } from '@/lib/auth';
import { api } from '@/lib/api';

declare global {
  interface Window { google: any; }
}

export function LoginForm() {
  const googleBtnRef = useRef<HTMLDivElement>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { user, setUser } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const referralCode = searchParams.get('ref') || '';

  // Redirect if already logged in
  useEffect(() => {
    if (user) router.push('/subjects');
  }, [user, router]);

  const handleGoogleCallback = async (response: any) => {
    setError('');
    setLoading(true);
    try {
      const payload = JSON.parse(atob(response.credential.split('.')[1]));
      const data = await api.googleAuth({
        email: payload.email,
        googleId: payload.sub,
        name: payload.name,
        picture: payload.picture,
        referralCode,
      });
      localStorage.setItem('pg_token', data.token);
      setUser(data.user);
      router.push('/subjects');
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  };

  useEffect(() => {
    const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
    if (!clientId) return;

    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.onload = () => {
      window.google?.accounts.id.initialize({
        client_id: clientId,
        callback: handleGoogleCallback,
      });
      if (googleBtnRef.current) {
        window.google.accounts.id.renderButton(googleBtnRef.current, {
          type: 'standard',
          theme: 'filled_black',
          size: 'large',
          text: 'continue_with',
          shape: 'pill',
          width: 320,
        });
      }
    };
    document.body.appendChild(script);
    return () => { document.body.removeChild(script); };
  }, []);

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <Image src="/logo.png" alt="PrepGenius" width={56} height={56} style={{ borderRadius: 12, margin: '0 auto 12px' }} />
          <h2>Welcome to PrepGenius</h2>
          <p>Sign in to start practicing</p>
        </div>

        {error && <div className="auth-error">{error}</div>}
        {loading && <p style={{ textAlign: 'center', color: 'var(--text-dim)' }}>Signing in...</p>}

        <div style={{ display: 'flex', justifyContent: 'center', margin: '24px 0' }}>
          <div ref={googleBtnRef} />
        </div>

        {!process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID && (
          <div style={{ textAlign: 'center', padding: 16, borderRadius: 12, background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', color: 'var(--red)', fontSize: '0.85rem' }}>
            Google Client ID not configured. Add <code>NEXT_PUBLIC_GOOGLE_CLIENT_ID</code> to your environment variables.
          </div>
        )}

        <div style={{ textAlign: 'center', marginTop: 20, color: 'var(--text-dim)', fontSize: '0.8rem', lineHeight: 1.6 }}>
          <p>🔒 Secure sign-in powered by Google</p>
          <p>We never store your password</p>
        </div>
      </div>
    </div>
  );
}
