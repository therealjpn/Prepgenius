import type { Metadata } from 'next';
import { LoginForm } from './LoginForm';

export const metadata: Metadata = {
  title: 'Login',
  description: 'Login to PrepGenius to access WAEC & NECO past questions and continue your exam preparation.',
};

export default function LoginPage() {
  return <LoginForm />;
}
