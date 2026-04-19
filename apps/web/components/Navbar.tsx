'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/lib/auth';

export function Navbar() {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  // Close menu on route change
  useEffect(() => { setMenuOpen(false); }, [pathname]);

  // Close menu on Escape key
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setMenuOpen(false); };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, []);

  // Prevent scroll when menu is open
  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [menuOpen]);

  const links = [
    { href: '/', label: 'Home', icon: '🏠' },
    { href: '/subjects', label: 'Practice', icon: '📝' },
    { href: '/leaderboard', label: 'Leaderboard', icon: '🏆' },
    { href: '/profile', label: 'Profile', icon: '👤' },
    { href: '/invite', label: 'Invite', icon: '🎁' },
    { href: '/support', label: 'Support', icon: '💬' },
    ...((user as any)?.isAdmin ? [{ href: '/admin', label: 'Admin', icon: '🛡️' }] : []),
  ];

  return (
    <>
      <nav className="navbar">
        <div className="nav-inner">
          {/* Brand */}
          <Link href="/" className="nav-brand">
            <Image src="/logo.png" alt="PrepGenie" width={32} height={32} style={{ borderRadius: 6 }} />
            Prep<span>Genie</span>
          </Link>

          {/* Desktop Nav Links */}
          <div className="nav-links">
            {links.map(l => (
              <Link key={l.href} href={l.href} className={`nav-link ${pathname === l.href ? 'active' : ''}`}>
                {l.label}
              </Link>
            ))}
          </div>

          {/* Right side: user info + hamburger */}
          <div className="nav-right">
            {user ? (
              <div className="nav-user">
                <div className="nav-avatar">{user.fullName?.charAt(0).toUpperCase()}</div>
                <span className="nav-username">{user.fullName?.split(' ')[0]}</span>
                {user.isPaid ? (
                  <span className="nav-badge nav-badge-pro">⚡ PRO</span>
                ) : (
                  <Link href="/payment" className="nav-badge nav-badge-free">FREE</Link>
                )}
                <button className="btn btn-sm btn-ghost nav-logout-btn" onClick={logout}>Logout</button>
              </div>
            ) : (
              <Link href="/login" className="btn btn-sm btn-primary">Login</Link>
            )}

            {/* Hamburger button — mobile only */}
            <button
              className="nav-hamburger"
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label="Toggle menu"
              aria-expanded={menuOpen}
            >
              <span className={`hamburger-line ${menuOpen ? 'open' : ''}`} />
              <span className={`hamburger-line ${menuOpen ? 'open' : ''}`} />
              <span className={`hamburger-line ${menuOpen ? 'open' : ''}`} />
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Overlay Menu */}
      {menuOpen && <div className="nav-overlay" onClick={() => setMenuOpen(false)} />}
      <div className={`nav-mobile ${menuOpen ? 'open' : ''}`}>
        <div className="nav-mobile-links">
          {links.map(l => (
            <Link
              key={l.href}
              href={l.href}
              className={`nav-mobile-link ${pathname === l.href ? 'active' : ''}`}
              onClick={() => setMenuOpen(false)}
            >
              <span className="nav-mobile-icon">{l.icon}</span>
              {l.label}
            </Link>
          ))}
        </div>

        {/* Mobile user section */}
        {user && (
          <div className="nav-mobile-user">
            <div className="nav-mobile-user-info">
              <div className="nav-avatar">{user.fullName?.charAt(0).toUpperCase()}</div>
              <div>
                <div style={{ fontWeight: 700, color: 'var(--text-bright)', fontSize: '0.9rem' }}>
                  {user.fullName}
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>
                  {user.isPaid ? '⚡ Pro Member' : 'Free Plan'}
                </div>
              </div>
            </div>
            <button className="btn btn-sm btn-ghost" onClick={() => { logout(); setMenuOpen(false); }} style={{ width: '100%', justifyContent: 'center' }}>
              Logout
            </button>
          </div>
        )}
      </div>
    </>
  );
}
