import React from 'react';
import { useApp } from '../context/AppContext';
import { TimerBadge, OnlineBadge, useViewport } from '../components/Shared';
import { Bell, Home, ChevronDown, Utensils, TableProperties, Package } from 'lucide-react';

const COLUMN_CONFIG = [
  { status: 'new', label: 'New', color: 'var(--terracotta)', bg: 'var(--terracotta-pale)', nextLabel: 'Start Preparing', nextStatus: 'preparing' },
  { status: 'preparing', label: 'Preparing', color: 'var(--warning)', bg: 'var(--warning-bg)', nextLabel: 'Mark Ready', nextStatus: 'ready' },
  { status: 'ready', label: 'Ready', color: 'var(--success)', bg: 'var(--success-bg)', nextLabel: 'Complete & Serve', nextStatus: 'completed' },
];

function KDSOrderCard({ order, col }) {
  const { updateKdsStatus, getElapsedMins, tick } = useApp();
  const elapsed = getElapsedMins(order.placedAt);
  const pct = order.targetMins ? elapsed / order.targetMins : 0;
  const isLate = pct >= 1;
  const isWarning = pct >= 0.75;

  return (
    <div style={{
      background: '#fff', borderRadius: 'var(--radius-md)', border: `2px solid ${isLate ? 'var(--terracotta)' : isWarning ? 'var(--warning)' : 'var(--border)'}`,
      padding: 14, marginBottom: 10, animation: 'fadeIn 0.3s ease',
      boxShadow: isLate ? '0 0 0 3px rgba(192,69,42,0.1)' : 'var(--shadow-sm)',
    }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ fontSize: 14, fontWeight: 800, color: 'var(--espresso)', fontFamily: 'var(--font-display)' }}>#{order.id}</span>
            <span style={{ fontSize: 10, background: order.type === 'Dine In' ? '#EEF4FC' : 'var(--cream)', color: order.type === 'Dine In' ? '#1A56A0' : 'var(--text-muted)', padding: '2px 6px', borderRadius: 6, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 3 }}>
              {order.type === 'Dine In' ? <TableProperties size={10} /> : <Package size={10} />} {order.type}
            </span>
          </div>
          <div style={{ fontSize: 12, color: 'var(--text-secondary)', fontWeight: 600, marginTop: 2 }}>{order.table}</div>
          <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>
            {new Date(order.placedAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
          </div>
        </div>
        <TimerBadge placedAt={order.placedAt} targetMins={order.targetMins} />
      </div>

      {/* Progress bar */}
      <div style={{ width: '100%', height: 4, background: 'var(--cream-dark)', borderRadius: 2, marginBottom: 10, overflow: 'hidden' }}>
        <div style={{
          width: `${Math.min(100, pct * 100)}%`, height: '100%', borderRadius: 2,
          background: isLate ? 'var(--terracotta)' : isWarning ? 'var(--warning)' : 'var(--success)',
          transition: 'width 1s linear',
        }} />
      </div>

      {/* Items */}
      <div style={{ marginBottom: 10 }}>
        {order.items.map((item, i) => (
          <div key={i} style={{ display: 'flex', gap: 6, padding: '4px 0', borderBottom: i < order.items.length - 1 ? '1px solid var(--border)' : 'none' }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-secondary)', minWidth: 16 }}>×{item.qty}</span>
            <div>
              <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--espresso)' }}>{item.name}</span>
              {item.note && <div style={{ fontSize: 10, color: 'var(--terracotta)', fontStyle: 'italic' }}>⚡ {item.note}</div>}
            </div>
          </div>
        ))}
      </div>

      {/* Action button */}
      <button onClick={() => updateKdsStatus(order.id, col.nextStatus)} style={{
        width: '100%', border: 'none', borderRadius: 8, padding: '9px',
        cursor: 'pointer', fontSize: 11, fontWeight: 700, fontFamily: 'var(--font-body)',
        background: col.bg, color: col.color, transition: 'all 0.15s',
      }}
        onMouseEnter={e => { e.currentTarget.style.background = col.color; e.currentTarget.style.color = '#fff'; }}
        onMouseLeave={e => { e.currentTarget.style.background = col.bg; e.currentTarget.style.color = col.color; }}
      >
        {col.nextLabel} →
      </button>
    </div>
  );
}

export default function KDSScreen() {
  const { kdsOrders, isOnline, setCurrentScreen, tick } = useApp();
  const { isMobile } = useViewport();

  const now = new Date();
  const timeStr = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  const dateStr = now.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: '#1A0F0A', fontFamily: 'var(--font-body)' }}>
      {/* Header */}
      <div style={{ background: '#fff', borderBottom: '2px solid var(--border)', padding: isMobile ? '12px 16px' : '12px 24px', display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: isMobile ? 0 : 'auto' }}>
          <div style={{ color: 'var(--terracotta)' }}><Utensils size={24} /></div>
          <div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 16, fontWeight: 700, color: 'var(--espresso)' }}>
              Table<span style={{ color: 'var(--terracotta)' }}>Mind</span>
            </div>
            <div style={{ fontSize: 9, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>AI-Powered Kitchen Operations</div>
          </div>
        </div>

        <div style={{ flex: 1, textAlign: isMobile ? 'left' : 'center', minWidth: 180 }}>
          <div style={{ fontSize: 22, fontWeight: 800, color: 'var(--espresso)', fontFamily: 'var(--font-display)' }}>{timeStr}</div>
          <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{dateStr}</div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', width: isMobile ? '100%' : 'auto', justifyContent: isMobile ? 'space-between' : 'flex-end' }}>
          <button style={{ background: 'var(--cream)', border: '1px solid var(--border)', borderRadius: 8, padding: '6px 12px', cursor: 'pointer', fontSize: 12, fontFamily: 'var(--font-body)', display: 'flex', alignItems: 'center', gap: 5, color: 'var(--text-secondary)' }}>
            All Stations <ChevronDown size={12} />
          </button>
          <OnlineBadge />
          <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)', position: 'relative' }}>
            <Bell size={18} />
            <span style={{ position: 'absolute', top: -3, right: -3, width: 8, height: 8, borderRadius: 4, background: 'var(--terracotta)' }} />
          </button>
          <button onClick={() => setCurrentScreen('home')} style={{ background: 'var(--cream)', border: '1px solid var(--border)', borderRadius: 8, padding: '6px 10px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: 'var(--text-secondary)', fontFamily: 'var(--font-body)' }}>
            <Home size={12} /> Home
          </button>
        </div>
      </div>

      {/* KDS Columns */}
      <div style={{ flex: 1, overflowX: isMobile ? 'auto' : 'hidden', overflowY: 'hidden', display: 'flex', gap: 0 }}>
        {COLUMN_CONFIG.map(col => {
          const orders = kdsOrders.filter(o => o.status === col.status);
          return (
            <div key={col.status} style={{ flex: isMobile ? '0 0 320px' : 1, minWidth: isMobile ? 320 : 'auto', display: 'flex', flexDirection: 'column', borderRight: '1px solid rgba(255,255,255,0.08)' }}>
              {/* Column header */}
              <div style={{ padding: '12px 16px', borderBottom: `3px solid ${col.color}`, background: 'rgba(255,255,255,0.05)' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: 15, fontWeight: 800, color: '#fff', fontFamily: 'var(--font-display)' }}>{col.label}</span>
                    <span style={{ width: 22, height: 22, borderRadius: 11, background: col.color, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 800 }}>
                      {orders.length}
                    </span>
                  </div>
                </div>
              </div>

              {/* Order cards */}
              <div style={{ flex: 1, overflow: 'auto', padding: 12 }}>
                {orders.map(order => (
                  <KDSOrderCard key={order.id} order={order} col={col} />
                ))}
                {orders.length === 0 && (
                  <div style={{ textAlign: 'center', padding: '40px 16px', color: 'rgba(255,255,255,0.2)', fontSize: 12 }}>
                    No orders
                  </div>
                )}
                {orders.length > 2 && (
                  <div style={{ textAlign: 'center', fontSize: 11, color: 'rgba(255,255,255,0.3)', padding: '4px 0', cursor: 'pointer' }}>
                    + {orders.length - 2} more orders
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer */}
      <div style={{ background: '#fff', borderTop: '1px solid var(--border)', padding: '6px 24px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Made for Ghana</div>
      </div>
    </div>
  );
}
