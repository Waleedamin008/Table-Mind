import React from 'react';
import { useApp } from '../context/AppContext';
import { Wifi, WifiOff, Bell, ChevronRight, Clock, AlertTriangle } from 'lucide-react';

export function Logo({ size = 'md' }) {
  const sizes = { sm: { img: 28, text: 16, sub: 9 }, md: { img: 36, text: 20, sub: 10 }, lg: { img: 48, text: 26, sub: 11 } };
  const s = sizes[size];
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
      <div style={{
        width: s.img, height: s.img, borderRadius: 10, background: 'linear-gradient(135deg, var(--terracotta), var(--espresso))',
        display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: s.img * 0.55, flexShrink: 0,
        boxShadow: '0 2px 8px rgba(192,69,42,0.3)'
      }}>🍽️</div>
      <div>
        <div style={{ fontFamily: 'var(--font-display)', fontSize: s.text, fontWeight: 700, color: 'var(--espresso)', lineHeight: 1 }}>
          Table<span style={{ color: 'var(--terracotta)' }}>Mind</span>
        </div>
        <div style={{ fontSize: s.sub, color: 'var(--text-muted)', letterSpacing: '0.08em', textTransform: 'uppercase', fontWeight: 500 }}>
          AI-Powered Restaurant
        </div>
      </div>
    </div>
  );
}

export function OnlineBadge() {
  const { isOnline, toggleOnline, pendingSyncOrders } = useApp();
  return (
    <button onClick={toggleOnline} style={{
      display: 'flex', alignItems: 'center', gap: 6, padding: '6px 12px',
      borderRadius: 20, border: `1.5px solid ${isOnline ? 'var(--success)' : '#E0A020'}`,
      background: isOnline ? 'var(--success-bg)' : 'var(--warning-bg)',
      color: isOnline ? 'var(--success)' : 'var(--warning)', cursor: 'pointer',
      fontSize: 12, fontWeight: 600, fontFamily: 'var(--font-body)',
      transition: 'all 0.2s', whiteSpace: 'nowrap',
    }}>
      {isOnline ? <Wifi size={13} /> : <WifiOff size={13} />}
      {isOnline ? 'Online' : `Offline${pendingSyncOrders.length > 0 ? ` (${pendingSyncOrders.length} pending)` : ''}`}
    </button>
  );
}

export function Notification() {
  const { notification } = useApp();
  if (!notification) return null;
  const colors = {
    success: { bg: 'var(--success)', border: '#2A6B34' },
    warning: { bg: '#C07830', border: '#A06020' },
    error: { bg: 'var(--terracotta)', border: '#A03020' },
  };
  const c = colors[notification.type] || colors.success;
  return (
    <div style={{
      position: 'fixed', top: 20, left: '50%', transform: 'translateX(-50%)',
      background: c.bg, color: '#fff', padding: '12px 24px', borderRadius: 30,
      fontSize: 13, fontWeight: 600, zIndex: 9999, boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
      animation: 'notifySlide 0.3s ease forwards', maxWidth: '90vw', textAlign: 'center',
    }}>
      {notification.msg}
    </div>
  );
}

export function TimerBadge({ placedAt, targetMins, style = {} }) {
  const { getElapsedMins, tick } = useApp();
  const elapsed = getElapsedMins(placedAt);
  const secs = Math.floor((Date.now() - placedAt) / 1000) % 60;
  const pct = targetMins ? (elapsed / targetMins) : 0;
  const isWarning = pct >= 0.75 && pct < 1;
  const isLate = pct >= 1;

  const color = isLate ? 'var(--terracotta)' : isWarning ? 'var(--warning)' : 'var(--success)';
  const bg = isLate ? 'var(--terracotta-pale)' : isWarning ? 'var(--warning-bg)' : 'var(--success-bg)';

  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 4, padding: '3px 8px',
      borderRadius: 12, background: bg, color, fontSize: 11, fontWeight: 700,
      animation: isLate ? 'pulse 1.5s infinite' : 'none', ...style
    }}>
      {isLate ? <AlertTriangle size={10} /> : <Clock size={10} />}
      {elapsed}m {String(secs).padStart(2, '0')}s
      {targetMins && <span style={{ opacity: 0.7, fontWeight: 400 }}>/ {targetMins}m</span>}
    </div>
  );
}

export function Card({ children, style = {}, onClick, hover = true }) {
  return (
    <div
      onClick={onClick}
      style={{
        background: '#fff', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)',
        boxShadow: 'var(--shadow-sm)', padding: 16,
        transition: hover ? 'all 0.2s' : 'none',
        cursor: onClick ? 'pointer' : 'default',
        ...style,
      }}
      onMouseEnter={e => hover && onClick && (e.currentTarget.style.boxShadow = 'var(--shadow-md)')}
      onMouseLeave={e => hover && onClick && (e.currentTarget.style.boxShadow = 'var(--shadow-sm)')}
    >
      {children}
    </div>
  );
}

export function Button({ children, variant = 'primary', size = 'md', onClick, style = {}, disabled = false, icon }) {
  const variants = {
    primary: { background: 'var(--terracotta)', color: '#fff', border: 'none' },
    secondary: { background: 'var(--cream-dark)', color: 'var(--espresso)', border: '1.5px solid var(--border)' },
    ghost: { background: 'transparent', color: 'var(--text-secondary)', border: '1.5px solid var(--border)' },
    danger: { background: 'var(--terracotta-pale)', color: 'var(--terracotta)', border: '1.5px solid var(--terracotta)' },
    success: { background: 'var(--success-bg)', color: 'var(--success)', border: '1.5px solid var(--success)' },
  };
  const sizes = {
    sm: { padding: '6px 12px', fontSize: 12, borderRadius: 'var(--radius-sm)' },
    md: { padding: '10px 18px', fontSize: 13, borderRadius: 'var(--radius-sm)' },
    lg: { padding: '14px 24px', fontSize: 15, borderRadius: 'var(--radius-md)' },
  };
  const v = variants[variant];
  const s = sizes[size];
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        ...v, ...s, fontFamily: 'var(--font-body)', fontWeight: 600, cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.5 : 1, display: 'inline-flex', alignItems: 'center', gap: 6,
        transition: 'all 0.2s', whiteSpace: 'nowrap', ...style,
      }}
      onMouseEnter={e => !disabled && (e.currentTarget.style.opacity = '0.88', e.currentTarget.style.transform = 'translateY(-1px)')}
      onMouseLeave={e => !disabled && (e.currentTarget.style.opacity = '1', e.currentTarget.style.transform = 'translateY(0)')}
    >
      {icon && icon}{children}
    </button>
  );
}

export function Badge({ children, color = 'nude' }) {
  const colors = {
    nude: { bg: 'var(--nude-light)', text: 'var(--espresso-light)' },
    green: { bg: 'var(--success-bg)', text: 'var(--success)' },
    red: { bg: 'var(--terracotta-pale)', text: 'var(--terracotta)' },
    amber: { bg: 'var(--warning-bg)', text: 'var(--warning)' },
    blue: { bg: '#E8F0FE', text: '#1A56A0' },
  };
  const c = colors[color] || colors.nude;
  return (
    <span style={{
      background: c.bg, color: c.text, padding: '2px 8px', borderRadius: 10,
      fontSize: 11, fontWeight: 600, letterSpacing: '0.02em',
    }}>
      {children}
    </span>
  );
}

export function SideNav({ items, active, onSelect, bottom }) {
  return (
    <nav style={{
      width: 200, flexShrink: 0, background: '#fff', borderRight: '1px solid var(--border)',
      display: 'flex', flexDirection: 'column', padding: '20px 12px',
      minHeight: '100%', gap: 4,
    }}>
      <div style={{ marginBottom: 24, paddingLeft: 8 }}>
        <Logo size="sm" />
      </div>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
        {items.map(item => (
          <button key={item.id} onClick={() => onSelect(item.id)} style={{
            display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px',
            borderRadius: 'var(--radius-sm)', border: 'none', cursor: 'pointer', width: '100%',
            background: active === item.id ? 'var(--terracotta-pale)' : 'transparent',
            color: active === item.id ? 'var(--terracotta)' : 'var(--text-secondary)',
            fontFamily: 'var(--font-body)', fontSize: 13, fontWeight: active === item.id ? 600 : 400,
            transition: 'all 0.15s', textAlign: 'left',
          }}>
            {item.icon} {item.label}
            {item.badge && (
              <span style={{ marginLeft: 'auto', background: 'var(--terracotta)', color: '#fff', borderRadius: 10, padding: '1px 7px', fontSize: 10, fontWeight: 700 }}>
                {item.badge}
              </span>
            )}
          </button>
        ))}
      </div>
      {bottom && <div style={{ paddingTop: 12, borderTop: '1px solid var(--border)' }}>{bottom}</div>}
    </nav>
  );
}
