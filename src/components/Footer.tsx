'use client';

import Link from 'next/link';

export default function Footer() {
  return (
    <footer
      style={{
        padding: '24px',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        gap: '24px',
        borderTop: '1px solid rgba(255,255,255,0.06)',
      }}
    >
      <span
        style={{
          fontSize: '12px',
          color: 'rgba(255,255,255,0.2)',
          letterSpacing: '0.02em',
        }}
      >
        © {new Date().getFullYear()} my mood
      </span>
      <Link
        href="/privacy"
        style={{
          fontSize: '12px',
          color: 'rgba(255,255,255,0.3)',
          textDecoration: 'none',
          letterSpacing: '0.02em',
          transition: 'color 0.2s',
        }}
      >
        Privacy
      </Link>
      <Link
        href="/terms"
        style={{
          fontSize: '12px',
          color: 'rgba(255,255,255,0.3)',
          textDecoration: 'none',
          letterSpacing: '0.02em',
          transition: 'color 0.2s',
        }}
      >
        Termini
      </Link>
    </footer>
  );
}
