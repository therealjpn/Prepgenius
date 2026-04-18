import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Terms and Conditions',
  description: 'Terms and Conditions for using Prep Genius by Cresthub Media Limited.',
};

export default function TermsPage() {
  return (
    <div className="page-container" style={{ maxWidth: 780, margin: '0 auto' }}>
      <div style={{
        padding: '36px 32px', borderRadius: 18,
        background: 'var(--bg-card)', border: '1px solid var(--border)',
      }}>
        <h1 style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--text-bright)', marginBottom: 4 }}>
          📜 Terms and Conditions
        </h1>
        <p style={{ color: 'var(--text-dim)', fontSize: '0.85rem', marginBottom: 28 }}>
          Last Updated: April 18, 2026
        </p>

        <p style={S.body}>
          Welcome to <strong>Prep Genius</strong>. These Terms and Conditions ("Terms") govern your use of our platform.
          Prep Genius is owned and operated by <strong>Cresthub Media Limited</strong>. By using our services, you agree to these Terms.
        </p>

        <Section num="1" title="Account Creation and Google Auth">
          <ul style={S.list}>
            <li><strong>Authentication:</strong> For your security, Prep Genius exclusively uses Google Authentication for
              registration. You agree to provide accurate information through your Google Account.</li>
            <li><strong>Account Responsibility:</strong> You are responsible for maintaining the security of your Google Account.
              Any activity performed under your Prep Genius profile is your responsibility.</li>
          </ul>
        </Section>

        <Section num="2" title="Payments and No-Refund Policy">
          <ul style={S.list}>
            <li><strong>Access Fee:</strong> A one-time payment of ₦2,000 grants you unlimited access to all subjects and past questions.</li>
            <li><strong>No Refunds:</strong> Since Prep Genius provides instant access to digital educational content, all payments
              are final and non-refundable. By completing your purchase, you acknowledge that you waive the right to a refund once
              the digital content has been accessed.</li>
          </ul>
        </Section>

        <Section num="3" title="User-Initiated Account Deletion">
          <ul style={S.list}>
            <li><strong>Right to Delete:</strong> You have the right to delete your profile at any time via the Profile section of the platform.</li>
            <li><strong>Consequences of Deletion:</strong> Deleting your profile will result in the immediate and permanent removal
              of your practice history and leaderboard standings.</li>
            <li><strong>Forfeiture of Access:</strong> Because access is tied to a specific authenticated profile, deleting your profile
              terminates your access to the platform. Cresthub Media Limited is not obligated to restore access or provide a refund if
              you choose to delete your account.</li>
          </ul>
        </Section>

        <Section num="4" title="Intellectual Property">
          <p style={S.body}>
            All materials, including the 20,000+ past questions, explanations, and site design, are the intellectual property of
            Cresthub Media Limited.
          </p>
          <p style={S.body}>
            You are granted a personal, non-transferable license to use the content for exam preparation. You may not scrape, copy,
            or redistribute our content for commercial purposes.
          </p>
        </Section>

        <Section num="5" title="Leaderboard and Weekly Rewards">
          <ul style={S.list}>
            <li><strong>Eligibility:</strong> Only registered users who participate in timed practice sessions are eligible for the leaderboard.</li>
            <li><strong>Fair Play:</strong> Any attempt to manipulate scores using bots or scripts will result in immediate account
              termination without a refund.</li>
            <li><strong>Rewards:</strong> Airtime rewards for the "Top 3" are at the discretion of Cresthub Media Limited and will
              be sent to the contact details associated with your Google Auth profile.</li>
          </ul>
        </Section>

        <Section num="6" title="Data Privacy & GDPR">
          <p style={S.body}>
            Your use of the platform is also governed by our{' '}
            <a href="/privacy" style={{ color: 'var(--green)', textDecoration: 'underline' }}>Privacy Policy</a>,
            which outlines how we handle your data via Google OAuth and your rights regarding data portability and deletion.
          </p>
        </Section>

        <Section num="7" title="Limitation of Liability">
          <p style={S.body}>
            Prep Genius is a study aid. While we aim for maximum accuracy, Cresthub Media Limited does not guarantee specific
            results in official WAEC or NECO exams. We are not liable for any discrepancies between our practice questions and
            official exam papers.
          </p>
        </Section>

        <Section num="8" title="Amendments">
          <p style={S.body}>
            We reserve the right to update these Terms at any time. Continued use of the platform after changes are posted
            constitutes your acceptance of the new Terms.
          </p>
        </Section>

        <Section num="9" title="Contact">
          <p style={S.body}>For legal inquiries or support, please contact:</p>
          <div style={{
            padding: '16px 20px', borderRadius: 12, background: 'rgba(16,185,129,0.06)',
            border: '1px solid rgba(16,185,129,0.15)', marginTop: 8,
          }}>
            <p style={{ margin: 0, color: 'var(--text-bright)', fontWeight: 600, fontSize: '0.9rem' }}>Cresthub Media Limited</p>
            <p style={{ margin: '4px 0 0', color: 'var(--text-dim)', fontSize: '0.85rem' }}>
              📧 Email: <a href="mailto:info@cresthub.com" style={{ color: 'var(--green)', textDecoration: 'none' }}>Info@cresthub.com</a>
            </p>
            <p style={{ margin: '2px 0 0', color: 'var(--text-dim)', fontSize: '0.85rem' }}>
              📍 Rayfield, Jos, Nigeria
            </p>
          </div>
        </Section>
      </div>
    </div>
  );
}

function Section({ num, title, children }: { num: string; title: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 24 }}>
      <h2 style={{
        fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-bright)',
        marginBottom: 8, display: 'flex', alignItems: 'center', gap: 8,
      }}>
        <span style={{
          width: 26, height: 26, borderRadius: 8, background: 'rgba(16,185,129,0.12)',
          color: 'var(--green)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '0.75rem', fontWeight: 800, flexShrink: 0,
        }}>{num}</span>
        {title}
      </h2>
      {children}
    </div>
  );
}

const S = {
  body: { color: 'var(--text)', fontSize: '0.88rem', lineHeight: 1.7, margin: '0 0 10px' } as React.CSSProperties,
  list: { color: 'var(--text)', fontSize: '0.88rem', lineHeight: 1.8, paddingLeft: 20, margin: '6px 0 0' } as React.CSSProperties,
};
