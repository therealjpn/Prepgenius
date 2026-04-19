import type { Metadata } from 'next';
import Link from 'next/link';
import { GenieWrapper } from '@/components/GenieWrapper';

export const metadata: Metadata = {
  title: 'PrepGenie — WAEC & NECO Past Questions | Practice & Ace Your Exams',
  description: 'Practice with 20,000+ authentic WAEC and NECO past questions and answers. Get instant grading, detailed explanations, and compete on the weekly leaderboard. Nigeria\'s #1 exam prep platform.',
  keywords: ['WAEC past questions', 'NECO past questions', 'WAEC past questions and answers', 'NECO past questions and answers', 'WAEC 2024', 'WAEC 2023', 'SSCE past questions', 'Nigerian exam preparation', 'WAEC Mathematics past questions', 'WAEC English past questions', 'WAEC Biology past questions', 'WAEC Chemistry past questions', 'WAEC Physics past questions'],
  alternates: { canonical: '/' },
};

const faqs = [
  { q: 'What exams does PrepGenie cover?', a: 'PrepGenie covers WAEC (West African Examinations Council) and NECO (National Examinations Council) past questions across 8+ SSCE subjects including Mathematics, English Language, Biology, Chemistry, Physics, Economics, and Government.' },
  { q: 'How many past questions are available?', a: 'We have over 20,000 authenticated past questions sourced from official WAEC and NECO examination archives spanning from 2015 to 2024.' },
  { q: 'How much does PrepGenie cost?', a: 'PrepGenie costs a one-time payment of ₦1,000 for unlimited lifetime access to all subjects, past questions, detailed explanations, and the weekly leaderboard competition.' },
  { q: 'Can I win rewards on PrepGenie?', a: 'Yes! The top 3 students on our weekly leaderboard win airtime rewards: 1st place gets ₦1,000, 2nd place gets ₦500, and 3rd place gets ₦300.' },
  { q: 'Is PrepGenie available on mobile?', a: 'Yes, PrepGenie is fully responsive and works perfectly on phones, tablets, and computers. No app download required — just visit our website.' },
];

export default function HomePage() {
  return (
    <div className="page-container landing">
      {/* JSON-LD FAQ Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'FAQPage',
            mainEntity: faqs.map(f => ({
              '@type': 'Question',
              name: f.q,
              acceptedAnswer: { '@type': 'Answer', text: f.a },
            })),
          }),
        }}
      />

      {/* JSON-LD Course Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'Course',
            name: 'WAEC & NECO Exam Preparation',
            description: 'Comprehensive WAEC and NECO past questions practice platform with 20,000+ questions across 8+ subjects.',
            provider: {
              '@type': 'Organization',
              name: 'PrepGenie',
              sameAs: 'https://prepgenie.xyz',
            },
            offers: {
              '@type': 'Offer',
              price: '1000',
              priceCurrency: 'NGN',
              availability: 'https://schema.org/InStock',
            },
          }),
        }}
      />

      {/* Hero Section — Two Column */}
      <div className="hero-split">
        <div className="hero-text">
          <div className="landing-badge">🇳🇬 Built for Nigerian Students</div>

          <h1>
            Ace Your <span className="gradient-text">WAEC &amp; NECO</span> Exams
          </h1>

          <p className="landing-subtitle">
            Practice with <strong>20,000+ real past questions</strong> from WAEC and NECO.
            Get instant grading, detailed explanations, and compete on the weekly leaderboard.
            Top 3 win airtime every week!
          </p>

          <div className="landing-price">
            <div className="price">₦1,000</div>
            <div className="detail">One-time payment • Unlimited access • All subjects</div>
          </div>

          <div className="landing-actions">
            <Link href="/login" className="btn btn-primary btn-lg">
              Get Started Now
            </Link>
            <Link href="/leaderboard" className="btn btn-glass btn-lg">
              🏆 View Leaderboard
            </Link>
          </div>
        </div>

        <div className="hero-genie">
          <GenieWrapper />
        </div>
      </div>

      <section className="features-grid">
        <div className="feature-card">
          <div className="feature-icon">📝</div>
          <h3>20,000+ Real Past Questions</h3>
          <p>Authentic WAEC &amp; NECO questions across Mathematics, English, Biology, Chemistry, Physics, Economics, and Government.</p>
        </div>
        <div className="feature-card">
          <div className="feature-icon">⚡</div>
          <h3>Instant Grading &amp; Explanations</h3>
          <p>Get your score immediately with detailed step-by-step explanations for every question.</p>
        </div>
        <div className="feature-card">
          <div className="feature-icon">🏆</div>
          <h3>Weekly Airtime Rewards</h3>
          <p>Top 3 students on the weekly leaderboard win ₦1,000, ₦500, and ₦300 airtime respectively.</p>
        </div>
      </section>

      <section className="faq-section">
        <h2>Frequently Asked Questions</h2>
        {faqs.map((f, i) => (
          <div key={i} className="faq-item">
            <h3>{f.q}</h3>
            <p>{f.a}</p>
          </div>
        ))}
      </section>
    </div>
  );
}
