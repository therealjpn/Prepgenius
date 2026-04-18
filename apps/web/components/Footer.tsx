'use client';
import Link from 'next/link';

export function Footer() {
  return (
    <footer style={{
      marginTop: 'auto', padding: '24px 20px',
      borderTop: '1px solid var(--border)',
      background: 'rgba(0,0,0,0.2)',
    }}>
      <div style={{
        maxWidth: 1000, margin: '0 auto',
        display: 'flex', justifyContent: 'space-between',
        alignItems: 'center', flexWrap: 'wrap', gap: 12,
      }}>
        {/* Left: Brand */}
        <div style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>
          © {new Date().getFullYear()} <strong style={{ color: 'var(--text)' }}>Prep<span style={{ color: 'var(--green)' }}>Genius</span></strong> by Cresthub Media Limited
        </div>

        {/* Center: Links */}
        <div style={{ display: 'flex', gap: 20 }}>
          <Link href="/privacy" style={{ color: 'var(--text-dim)', fontSize: '0.8rem', textDecoration: 'none', transition: 'color 0.2s' }}
            onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--green)')}
            onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-dim)')}>
            🔒 Privacy Policy
          </Link>
          <Link href="/support" style={{ color: 'var(--text-dim)', fontSize: '0.8rem', textDecoration: 'none', transition: 'color 0.2s' }}
            onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--green)')}
            onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-dim)')}>
            💬 Support
          </Link>
        </div>

        {/* Right: Made with */}
        <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>
          Made with 💚 for Nigerian Students
        </div>
      </div>
    </footer>
  );
}
