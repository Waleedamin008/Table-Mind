import React from 'react';
import { useApp } from '../context/AppContext';
import { useViewport } from '../components/Shared';
import { Monitor, Tablet, ChefHat, QrCode, BarChart3, Wifi, ArrowRight, Star } from 'lucide-react';

export default function HomeScreen() {
  const { setCurrentScreen } = useApp();
  const { isMobile, isTablet } = useViewport();

  const screens = [
    { id: 'dashboard', icon: <BarChart3 size={22} />, label: 'Owner Dashboard', desc: 'Sales, analytics, live orders & inventory overview', color: '#4A90D9', bg: '#EEF4FC' },
    { id: 'pos', icon: <Tablet size={22} />, label: 'Tablet POS', desc: 'Staff order-taking app with menu, cart & modifiers', color: '#3A7D44', bg: '#EAF4EB' },
    { id: 'kds', icon: <ChefHat size={22} />, label: 'Kitchen Display', desc: 'Live order flow from New to Preparing to Ready', color: '#C07830', bg: '#FBF0E0' },
    { id: 'qr', icon: <QrCode size={22} />, label: 'QR Ordering', desc: 'Customer scans table QR and orders from phone', color: 'var(--terracotta)', bg: 'var(--terracotta-pale)' },
    { id: 'history', icon: <Monitor size={22} />, label: 'Order History', desc: 'Completed orders with timing, sync & payment status', color: '#6B4C9A', bg: '#F0EBF8' },
    { id: 'offline', icon: <Wifi size={22} />, label: 'Offline Mode Demo', desc: 'Toggle offline, create orders, watch them sync back', color: '#1A7A8A', bg: '#E5F4F6' },
  ];

  return (
    <div style={{
      minHeight: '100vh', background: 'var(--cream)', display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center', padding: isMobile ? '28px 16px' : '40px 24px',
    }}>
      {/* Hero */}
      <div style={{ width: '100%', maxWidth: 960, marginBottom: isMobile ? 32 : 48, animation: 'fadeIn 0.5s ease' }}>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: isMobile ? 20 : 28 }}>
          <img
            src="/Home screen logo.png"
            alt="TableMind home screen logo"
            style={{
              width: isMobile ? 'min(82vw, 320px)' : 'clamp(240px, 34vw, 360px)',
              maxWidth: '100%',
              height: 'auto',
              display: 'block',
              objectFit: 'contain',
            }}
          />
        </div>
        <div style={{ textAlign: 'center' }}>
          <h1 style={{
            fontFamily: 'var(--font-display)', fontSize: 'clamp(28px, 5vw, 48px)',
            fontWeight: 700, color: 'var(--espresso)', lineHeight: 1.2, marginBottom: 12,
          }}>
            Smarter Orders.<br />
            <span style={{ color: 'var(--terracotta)' }}>Faster Service.</span>
          </h1>
          <p style={{ fontSize: isMobile ? 15 : 16, color: 'var(--text-secondary)', maxWidth: 520, margin: '0 auto 8px', lineHeight: 1.5 }}>
            The complete restaurant management system built for Ghana from QR ordering to kitchen display to owner analytics.
          </p>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, fontSize: 12, color: 'var(--text-muted)', fontWeight: 500, flexWrap: 'wrap' }}>
            <Star size={12} style={{ color: 'var(--terracotta)' }} /> Interactive Demo Prototype. Click any screen to explore
          </div>
        </div>
      </div>

      {/* Screen grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: isMobile ? '1fr' : isTablet ? 'repeat(2, minmax(0, 1fr))' : 'repeat(auto-fill, minmax(280px, 1fr))',
        gap: 16, width: '100%', maxWidth: 960,
      }}>
        {screens.map((s, i) => (
          <button
            key={s.id}
            onClick={() => setCurrentScreen(s.id)}
            style={{
              background: '#fff', borderRadius: 'var(--radius-lg)', border: '1.5px solid var(--border)',
              padding: isMobile ? '20px 18px' : '24px 20px', cursor: 'pointer', textAlign: 'left', fontFamily: 'var(--font-body)',
              boxShadow: 'var(--shadow-sm)', transition: 'all 0.25s',
              animation: `fadeIn 0.4s ease ${i * 0.06}s both`,
            }}
            onMouseEnter={e => { e.currentTarget.style.boxShadow = 'var(--shadow-lg)'; e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.borderColor = s.color; }}
            onMouseLeave={e => { e.currentTarget.style.boxShadow = 'var(--shadow-sm)'; e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.borderColor = 'var(--border)'; }}
          >
            <div style={{
              width: 48, height: 48, borderRadius: 14, background: s.bg, color: s.color,
              display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 14,
            }}>
              {s.icon}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
              <span style={{ fontSize: 15, fontWeight: 700, color: 'var(--espresso)' }}>{s.label}</span>
              <ArrowRight size={14} style={{ color: s.color }} />
            </div>
            <p style={{ fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.5 }}>{s.desc}</p>
          </button>
        ))}
      </div>

      {/* Footer */}
      <div style={{ marginTop: 48, textAlign: 'center', fontSize: 12, color: 'var(--text-muted)' }}>
        Made for Ghana · AI-Powered Restaurant Management · Pitch Demo v1.0
      </div>
    </div>
  );
}
