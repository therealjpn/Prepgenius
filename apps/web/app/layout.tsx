import type { Metadata } from 'next';
import Script from 'next/script';
import { Inter } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/lib/auth';
import { Navbar } from '@/components/Navbar';
import { ReferralPopup } from '@/components/ReferralPopup';
import { Footer } from '@/components/Footer';
import { ToastProvider } from '@/components/Toast';
import { AnalyticsBeacon } from '@/components/AnalyticsBeacon';

const inter = Inter({ subsets: ['latin'], weight: ['300','400','500','600','700','800','900'] });

const GA_ID = process.env.NEXT_PUBLIC_GA_ID || 'G-KDMMMZEJP5';

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://prepgenie.xyz'),
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
              url: process.env.NEXT_PUBLIC_SITE_URL || 'https://prepgenie.xyz',
              areaServed: { '@type': 'Country', name: 'Nigeria' },
              sameAs: [],
            }),
          }}
        />
      </head>
      <body className={inter.className} style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        <AuthProvider>
          <ToastProvider>
            <Navbar />
            <main style={{ flex: 1 }}>{children}</main>
            <Footer />
            <ReferralPopup />
          </ToastProvider>
        </AuthProvider>

        {/* Analytics Beacon — tracks page views to our own database */}
        <AnalyticsBeacon />

        {/* Google Analytics 4 */}
        {GA_ID && (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
              strategy="afterInteractive"
            />
            <Script id="google-analytics" strategy="afterInteractive">
              {`
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${GA_ID}', {
                  page_path: window.location.pathname,
                  send_page_view: true
                });
              `}
            </Script>
          </>
        )}

        {/* TikTok Pixel */}
        <Script id="tiktok-pixel" strategy="afterInteractive">
          {`
            !function (w, d, t) {
              w.TiktokAnalyticsObject=t;var ttq=w[t]=w[t]||[];ttq.methods=["page","track","identify","instances","debug","on","off","once","ready","alias","group","enableCookie","disableCookie","holdConsent","revokeConsent","grantConsent"],ttq.setAndDefer=function(t,e){t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}};for(var i=0;i<ttq.methods.length;i++)ttq.setAndDefer(ttq,ttq.methods[i]);ttq.instance=function(t){for(
              var e=ttq._i[t]||[],n=0;n<ttq.methods.length;n++)ttq.setAndDefer(e,ttq.methods[n]);return e},ttq.load=function(e,n){var r="https://analytics.tiktok.com/i18n/pixel/events.js",o=n&&n.partner;ttq._i=ttq._i||{},ttq._i[e]=[],ttq._i[e]._u=r,ttq._t=ttq._t||{},ttq._t[e]=+new Date,ttq._o=ttq._o||{},ttq._o[e]=n||{};n=document.createElement("script");n.type="text/javascript",n.async=!0,n.src=r+"?sdkid="+e+"&lib="+t;e=document.getElementsByTagName("script")[0];e.parentNode.insertBefore(n,e)};
              ttq.load('D7KPRSBC77U471PGS6H0');
              ttq.page();
            }(window, document, 'ttq');
          `}
        </Script>
      </body>
    </html>
  );
}
