import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/lib/auth';
import { Navbar } from '@/components/Navbar';

const inter = Inter({ subsets: ['latin'], weight: ['300','400','500','600','700','800','900'] });

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://prepgenius.onrender.com'),
  title: { default: 'PrepGenius — WAEC & NECO Past Questions | Ace Your Exams', template: '%s | PrepGenius' },
  description: 'Practice with 20,000+ authentic WAEC & NECO past questions. Instant grading, detailed explanations, and weekly leaderboard rewards. Built for Nigerian students.',
  keywords: ['WAEC past questions', 'NECO past questions', 'WAEC past questions and answers', 'Nigerian exam preparation', 'SSCE past questions', 'WAEC Mathematics', 'WAEC English', 'JAMB past questions', 'PrepGenius', 'exam prep Nigeria'],
  authors: [{ name: 'PrepGenius' }],
  openGraph: {
    type: 'website', locale: 'en_NG', siteName: 'PrepGenius',
    title: 'PrepGenius — WAEC & NECO Past Questions',
    description: 'Practice with 20,000+ authentic WAEC & NECO past questions. Instant grading and weekly rewards.',
    images: [{ url: '/og-image.png', width: 1200, height: 630, alt: 'PrepGenius — Ace Your WAEC & NECO Exams' }],
  },
  twitter: { card: 'summary_large_image', title: 'PrepGenius — WAEC & NECO Past Questions', description: 'Practice with 20,000+ real past questions. Ace your exams!', images: ['/og-image.png'] },
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
              name: 'PrepGenius',
              description: 'Nigeria\'s premier WAEC & NECO exam preparation platform with 20,000+ past questions.',
              url: process.env.NEXT_PUBLIC_SITE_URL || 'https://prepgenius.onrender.com',
              areaServed: { '@type': 'Country', name: 'Nigeria' },
              sameAs: [],
            }),
          }}
        />
      </head>
      <body className={inter.className}>
        <AuthProvider>
          <Navbar />
          <main>{children}</main>
        </AuthProvider>
      </body>
    </html>
  );
}
