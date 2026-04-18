import type { Metadata } from 'next';
import { Suspense } from 'react';
import { LoginForm } from './LoginForm';

export const metadata: Metadata = {
  title: 'Login',
  description: 'Login to PrepGenie to access WAEC & NECO past questions and continue your exam preparation.',
};

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="loading-container"><div className="spinner" /><p>Loading...</p></div>}>
      <LoginForm />
    </Suspense>
  );
}
