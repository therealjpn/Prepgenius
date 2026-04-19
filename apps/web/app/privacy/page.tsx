import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description: 'Learn how Prep Genius by Cresthub Media Limited collects, uses, and safeguards your personal data.',
};

export default function PrivacyPolicyPage() {
  return (
    <div className="page-container" style={{ maxWidth: 780, margin: '0 auto' }}>
      <div style={{
        padding: '36px 32px', borderRadius: 18,
        background: 'var(--bg-card)', border: '1px solid var(--border)',
      }}>
        <h1 style={{
          fontSize: '1.6rem', fontWeight: 800, color: 'var(--text-bright)', marginBottom: 4,
        }}>🔒 Privacy Policy</h1>
        <p style={{ color: 'var(--text-dim)', fontSize: '0.85rem', marginBottom: 28 }}>
          Effective Date: April 18, 2026
        </p>

        <p style={styles.body}>
          At <strong>Prep Genius</strong>, we respect your privacy and are committed to protecting your personal data.
          This Privacy Policy explains how <strong>Cresthub Media Limited</strong> ("we," "us," or "our") collects, uses,
          and safeguards your information when you visit our platform.
        </p>

        <Section num="1" title="Information We Collect">
          <p style={styles.body}>
            We follow a <strong>"Data Minimization"</strong> principle, meaning we only collect what is strictly necessary
            to provide our service.
          </p>
          <ul style={styles.list}>
            <li><strong>Authentication Data:</strong> We exclusively use Google Authentication. When you sign in, we
              receive your Name, Email Address, and Profile Picture from Google. We do not see or store your Google password.</li>
            <li><strong>Performance Data:</strong> We track your practice scores, time spent on questions, and progress
              to generate your analytics and leaderboard standing.</li>
            <li><strong>Payment Data:</strong> Payments are processed via third-party secure gateways (e.g., Squad by GTBank).
              We do not store your credit card or bank details on our servers.</li>
          </ul>
        </Section>

        <Section num="2" title="How We Use Your Information">
          <p style={styles.body}>We use the collected data to:</p>
          <ul style={styles.list}>
            <li>Create and manage your user account.</li>
            <li>Display your rank on the Weekly Leaderboard.</li>
            <li>Process your one-time payment for "Unlimited Access."</li>
            <li>Send automated email notifications regarding your performance or platform updates.</li>
          </ul>
        </Section>

        <Section num="3" title="Legal Basis for Processing (GDPR Compliance)">
          <p style={styles.body}>Under GDPR, we process your data based on:</p>
          <ul style={styles.list}>
            <li><strong>Contractual Necessity:</strong> To provide the exam prep services you paid for.</li>
            <li><strong>Consent:</strong> Given by you when you choose to "Sign in with Google."</li>
            <li><strong>Legitimate Interest:</strong> To improve our question bank and maintain a competitive leaderboard environment.</li>
          </ul>
        </Section>

        <Section num="4" title="Data Sharing and Third Parties">
          <p style={styles.body}>We <strong>do not sell or rent</strong> your personal data. We only share data with:</p>
          <ul style={styles.list}>
            <li><strong>Google:</strong> To facilitate the OAuth login process.</li>
            <li><strong>Payment Processors:</strong> To verify your ₦1,000 transaction.</li>
            <li><strong>Cloud Hosting Providers:</strong> To securely store our database.</li>
          </ul>
        </Section>

        <Section num="5" title='Your Rights (The GDPR "Power" Clause)'>
          <p style={styles.body}>As a user, you have the following rights:</p>
          <ul style={styles.list}>
            <li><strong>Right to Access:</strong> You can request a summary of the data we hold about you.</li>
            <li><strong>Right to Rectification:</strong> You can update your profile info (via your Google Account).</li>
            <li><strong>Right to Erasure (The Right to be Forgotten):</strong> You may request that we delete your account
              and all associated practice data at any time.</li>
            <li><strong>Right to Withdraw Consent:</strong> You can disconnect your Google Account from Prep Genius in
              your Google Security settings.</li>
          </ul>
        </Section>

        <Section num="6" title="Cookies">
          <p style={styles.body}>
            We use <strong>"Essential Cookies"</strong> to keep you logged in during your session. We do not use tracking
            cookies for third-party advertising.
          </p>
        </Section>

        <Section num="7" title="Data Retention">
          <p style={styles.body}>
            We retain your practice history as long as your account is active to help you track your progress.
            If your account is inactive for more than <strong>24 months</strong>, we reserve the right to delete your data.
          </p>
          <p style={styles.note}>
            <strong>Note on Refunds:</strong> As stated in our Terms and Conditions, all sales are final.
            Data deletion does not entitle the user to a refund of the ₦1,000 access fee.
          </p>
        </Section>

        <Section num="8" title="Children's Privacy">
          <p style={styles.body}>
            Our service is intended for students. If a user is under 13 (or 16 in some jurisdictions), we encourage
            parental supervision. We do not knowingly collect data from children without the intent of providing
            educational services.
          </p>
        </Section>

        <Section num="9" title="Contact Our Data Protection Officer (DPO)">
          <p style={styles.body}>
            If you have questions about this policy or wish to exercise your data rights, please contact:
          </p>
          <div style={{
            padding: '16px 20px', borderRadius: 12, background: 'rgba(16,185,129,0.06)',
            border: '1px solid rgba(16,185,129,0.15)', marginTop: 8,
          }}>
            <p style={{ margin: 0, color: 'var(--text-bright)', fontWeight: 600, fontSize: '0.9rem' }}>Cresthub Media Limited</p>
            <p style={{ margin: '4px 0 0', color: 'var(--text-dim)', fontSize: '0.85rem' }}>
              📧 Email: <a href="mailto:info@cresthub.com" style={{ color: 'var(--green)', textDecoration: 'none' }}>info@cresthub.com</a>
            </p>
            <p style={{ margin: '2px 0 0', color: 'var(--text-dim)', fontSize: '0.85rem' }}>
              📝 Subject: Data Privacy Inquiry
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

const styles = {
  body: { color: 'var(--text)', fontSize: '0.88rem', lineHeight: 1.7, margin: '0 0 10px' } as React.CSSProperties,
  list: { color: 'var(--text)', fontSize: '0.88rem', lineHeight: 1.8, paddingLeft: 20, margin: '6px 0 0' } as React.CSSProperties,
  note: {
    color: 'var(--text-dim)', fontSize: '0.82rem', fontStyle: 'italic', lineHeight: 1.6,
    padding: '10px 14px', borderRadius: 10, background: 'rgba(245,158,11,0.06)',
    border: '1px solid rgba(245,158,11,0.15)', margin: '10px 0 0',
  } as React.CSSProperties,
};
