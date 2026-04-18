import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/lib/auth';
import { Navbar } from '@/components/Navbar';
import { ReferralPopup } from '@/components/ReferralPopup';
import { Footer } from '@/components/Footer';

const inter = Inter({ subsets: ['latin'], weight: ['300','400','500','600','700','800','900'] });

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://prepgenie.onrender.com'),
  title: { default: 'PrepGenie — WAEC & NECO Past Questions | Ace Your Exams', template: '%s | PrepGenie' },
  description: 'Practice with 20,000+ authentic WAEC & NECO past questions. Instant grading, detailed explanations, and weekly leaderboard rewards. Built for Nigerian students.',
  keywords: ['WAEC past questions', 'NECO past questions', 'WAEC past questions and answers', 'Nigerian exam preparation', 'SSCE past questions', 'WAEC Mathematics', 'WAEC English', 'JAMB past questions', 'PrepGenie', 'exam prep Nigeria'],
  authors: [{ name: 'PrepGenie' }],
  openGraph: {
    type: 'website', locale: 'en_NG', siteName: 'PrepGenie',
    title: 'PrepGenie — WAEC & NECO Past Questions',
    description: 'Practice with 20,000+ authentic WAEC & NECO past questions. Instant grading and weekly rewards.',
    images: [{ url: '/og-image.png', width: 1200, height: 630, alt: 'PrepGenie — Ace Your WAEC & NECO Exams' }],
  },
  twitter: { card: 'summary_large_image', title: 'PrepGenie — WAEC & NECO Past Questions', description: 'Practice with 20,000+ real past questions. Ace your exams!', images: ['/og-image.png'] },
  robots: { index: true, follow: true, googleBot: { index: true, follow: true } },
  alternates: { canonical: '/' },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" type="image/png" href="/icon.png" />
        <link rel="apple-touch-icon" href="/apple-icon.png" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'EducationalOrganization',
              name: 'PrepGenie',
              description: 'Nigeria\'s premier WAEC & NECO exam preparation platform with 20,000+ past questions.',
              url: process.env.NEXT_PUBLIC_SITE_URL || 'https://prepgenie.onrender.com',
              areaServed: { '@type': 'Country', name: 'Nigeria' },
              sameAs: [],
            }),
          }}
        />
      </head>
      <body className={inter.className} style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        <AuthProvider>
          <Navbar />
          <main style={{ flex: 1 }}>{children}</main>
          <Footer />
          <ReferralPopup />
        </AuthProvider>
      </body>
    </html>
  );
}
