'use client';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/lib/auth';

export function Navbar() {
  const { user, logout } = useAuth();
  const pathname = usePathname();

  const links = [
    { href: '/', label: 'Home' },
    { href: '/subjects', label: 'Practice' },
    { href: '/leaderboard', label: 'Leaderboard' },
    { href: '/profile', label: 'Profile' },
    { href: '/invite', label: '🎁 Invite' },
    { href: '/support', label: 'Support' },
    ...((user as any)?.isAdmin ? [{ href: '/admin', label: '🛡️ Admin' }] : []),
  ];

  return (
    <nav className="navbar">
      <div className="nav-inner">
        <Link href="/" className="nav-brand">
          <Image src="/logo.png" alt="PrepGenie" width={32} height={32} style={{ borderRadius: 6 }} />
          Prep<span>Genie</span>
        </Link>
        <div className="nav-links">
          {links.map(l => (
            <Link key={l.href} href={l.href} className={`nav-link ${pathname === l.href ? 'active' : ''}`}>
              {l.label}
            </Link>
          ))}
        </div>
        <div className="nav-right">
          {user ? (
            <div className="nav-user">
              <div className="nav-avatar">{user.fullName?.charAt(0).toUpperCase()}</div>
              <span style={{ color: 'var(--text)' }}>{user.fullName?.split(' ')[0]}</span>
              {user.isPaid ? (
                <span style={{
                  padding: '2px 8px', borderRadius: 6, fontSize: '0.65rem', fontWeight: 700,
                  background: 'linear-gradient(135deg, rgba(245,158,11,0.2), rgba(245,158,11,0.1))',
                  border: '1px solid rgba(245,158,11,0.3)', color: '#f59e0b',
                  letterSpacing: '0.02em',
                }}>⚡ PRO</span>
              ) : (
                <Link href="/payment" style={{
                  padding: '2px 8px', borderRadius: 6, fontSize: '0.65rem', fontWeight: 700,
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid var(--border)', color: 'var(--text-dim)',
                  textDecoration: 'none', transition: 'all 0.2s',
                }}>FREE</Link>
              )}
              <button className="btn btn-sm btn-ghost" onClick={logout}>Logout</button>
            </div>
          ) : (
            <Link href="/login" className="btn btn-sm btn-primary">Login</Link>
          )}
        </div>
      </div>
    </nav>
  );
}
