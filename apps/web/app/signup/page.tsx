import type { Metadata } from 'next';
import { SignupForm } from './SignupForm';

export const metadata: Metadata = {
  title: 'Sign Up — Start Practicing WAEC & NECO Past Questions',
  description: 'Create your PrepGenius account and start practicing with 20,000+ WAEC & NECO past questions. One-time ₦2,000 payment for unlimited lifetime access.',
};

export default function SignupPage() {
  return <SignupForm />;
}
