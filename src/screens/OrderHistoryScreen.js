import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Logo, OnlineBadge, Badge, useViewport } from '../components/Shared';
import { Search, Home, Clock, CheckCircle, RefreshCw, ClipboardList, Utensils, ShoppingBag } from 'lucide-react';

export default function OrderHistoryScreen() {
  const { orderHistory, pendingSyncOrders, setCurrentScreen } = useApp();
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const { isMobile, isTablet } = useViewport();

  const allOrders = [
    ...pendingSyncOrders.map(o => ({
      id: o.id,
      table: o.table,
      type: o.type,
      items: o.items.map(i => `${i.name} x${i.qty}`),
      total: null,
      payment: 'Pending',
      syncStatus: 'Pending Sync',
      serviceTime: null,
      placedAt: new Date(o.placedAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      servedAt: null,
    })),
    ...orderHistory,
  ];

  const filtered = allOrders.filter(o => {
    if (filter === 'pending') return o.syncStatus === 'Pending Sync';
    if (filter === 'dine') return o.type === 'Dine In';
    if (filter === 'takeaway') return o.type === 'Takeaway';
    if (search) return String(o.id).includes(search) || o.table.toLowerCase().includes(search.toLowerCase());
    return true;
  });

  const syncColor = (status) => status === 'Synced' ? 'green' : status === 'Pending Sync' ? 'amber' : status === 'Failed' ? 'red' : 'nude';
  const payColor = (status) => status === 'Paid' ? 'green' : 'amber';
  const avgTime = orderHistory.filter(o => o.serviceTime).reduce((s, o, _, a) => s + o.serviceTime / a.length, 0).toFixed(1);

  return (
    <div style={{ minHeight: '100vh', background: 'var(--cream)', fontFamily: 'var(--font-body)' }}>
      <div style={{ background: '#fff', borderBottom: '1px solid var(--border)', padding: isMobile ? '14px 16px' : '14px 24px', position: 'sticky', top: 0, zIndex: 10, display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, flex: isMobile ? '1 1 100%' : '1 1 auto', minWidth: isMobile ? '100%' : 320 }}>
          <Logo size="sm" />
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--espresso)', fontFamily: 'var(--font-display)' }}>Order History</div>
            {/* <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>All orders with timing, sync & payment status</div> */}
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', order: isMobile ? 2 : 0 }}>
          <OnlineBadge />
          <button onClick={() => setCurrentScreen('home')} style={{ background: 'var(--cream)', border: '1.5px solid var(--border)', borderRadius: 8, padding: '7px 12px', cursor: 'pointer', fontSize: 12, fontFamily: 'var(--font-body)', display: 'flex', alignItems: 'center', gap: 5, color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>
            <Home size={12} /> Home
          </button>
        </div>
        <div style={{ position: 'relative', minWidth: isMobile ? '100%' : 240, flex: isMobile ? '1 1 100%' : '0 0 auto', order: isMobile ? 3 : 0 }}>
          <Search size={13} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search order or table..."
            style={{ width: '100%', padding: '7px 10px 7px 30px', borderRadius: 8, border: '1.5px solid var(--border)', fontSize: 12, fontFamily: 'var(--font-body)', background: 'var(--cream)', outline: 'none' }} />
        </div>
      </div>

      <div style={{ maxWidth: 1100, margin: '0 auto', padding: isMobile ? '16px' : '24px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : isTablet ? 'repeat(2, 1fr)' : 'repeat(4, 1fr)', gap: 14, marginBottom: 24 }}>
          {[
            { icon: <ClipboardList size={12} style={{ color: 'var(--espresso)', display: 'inline-block', marginRight: 4, verticalAlign: 'middle' }} />, label: 'Total Orders', value: allOrders.length, color: 'var(--espresso)' },
            { icon: <CheckCircle size={12} style={{ color: 'var(--success)', display: 'inline-block', marginRight: 4, verticalAlign: 'middle' }} />, label: 'Synced', value: allOrders.filter(o => o.syncStatus === 'Synced').length, color: 'var(--success)' },
            { icon: <RefreshCw size={12} style={{ color: 'var(--warning)', display: 'inline-block', marginRight: 4, verticalAlign: 'middle' }} />, label: 'Pending Sync', value: allOrders.filter(o => o.syncStatus === 'Pending Sync').length, color: 'var(--warning)' },
            { icon: <Clock size={12} style={{ color: 'var(--terracotta)', display: 'inline-block', marginRight: 4, verticalAlign: 'middle' }} />, label: 'Avg. Service Time', value: `${avgTime} min`, color: 'var(--terracotta)' },
          ].map((s, i) => (
            <div key={i} style={{ background: '#fff', borderRadius: 14, padding: '16px 18px', border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)' }}>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 6 }}>{s.icon} {s.label}</div>
              <div style={{ fontSize: 22, fontWeight: 800, color: s.color, fontFamily: 'var(--font-display)' }}>{s.value}</div>
            </div>
          ))}
        </div>

        <div style={{ display: 'flex', gap: 6, marginBottom: 16, overflowX: 'auto' }}>
          {[
            { id: 'all', label: 'All Orders' },
            { id: 'pending', label: 'Pending Sync' },
            { id: 'dine', label: 'Dine In' },
            { id: 'takeaway', label: 'Takeaway' },
          ].map(f => (
            <button key={f.id} onClick={() => setFilter(f.id)} style={{
              padding: '6px 14px', borderRadius: 16, border: 'none', cursor: 'pointer',
              fontSize: 12, fontWeight: 600, fontFamily: 'var(--font-body)', whiteSpace: 'nowrap',
              background: filter === f.id ? 'var(--terracotta)' : '#fff',
              color: filter === f.id ? '#fff' : 'var(--text-secondary)',
              boxShadow: 'var(--shadow-sm)',
            }}>{f.label}</button>
          ))}
        </div>

        <div style={{ background: '#fff', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)', overflow: 'hidden', boxShadow: 'var(--shadow-sm)' }}>
          <div style={{ overflowX: 'auto' }}>
            <div style={{ minWidth: 860 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '80px 130px 100px 1fr 80px 110px 110px 100px', gap: 0, background: 'var(--cream)', padding: '10px 18px', borderBottom: '1px solid var(--border)' }}>
                {['Order #', 'Table', 'Type', 'Items', 'Total', 'Payment', 'Sync Status', 'Service Time'].map(h => (
                  <div key={h} style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{h}</div>
                ))}
              </div>

              {filtered.map((order, i) => (
                <div key={order.id} style={{
                  display: 'grid', gridTemplateColumns: '80px 130px 100px 1fr 80px 110px 110px 100px',
                  gap: 0, padding: '12px 18px', borderBottom: i < filtered.length - 1 ? '1px solid var(--border)' : 'none',
                  background: order.syncStatus === 'Pending Sync' ? 'rgba(192,120,48,0.04)' : '#fff',
                  animation: `fadeIn 0.25s ease ${i * 0.04}s both`,
                  alignItems: 'center',
                }}>
                  <div style={{ fontSize: 13, fontWeight: 800, color: 'var(--espresso)', fontFamily: 'var(--font-display)' }}>#{order.id}</div>
                  <div>
                    <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--espresso)' }}>{order.table}</div>
                    <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>{order.placedAt}</div>
                  </div>
                  <div>
                    <span style={{ fontSize: 11, background: order.type === 'Dine In' ? '#EEF4FC' : 'var(--cream)', color: order.type === 'Dine In' ? '#1A56A0' : 'var(--text-muted)', padding: '2px 8px', borderRadius: 8, fontWeight: 600 }}>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                        {order.type === 'Dine In' ? <Utensils size={10} style={{ color: '#1A56A0' }} /> : <ShoppingBag size={10} style={{ color: 'var(--text-muted)' }} />}
                        {order.type}
                      </span>
                    </span>
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                    {order.items.slice(0, 2).join(' · ')}{order.items.length > 2 && ` +${order.items.length - 2} more`}
                  </div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--espresso)', fontFamily: 'var(--font-display)' }}>
                    {typeof order.total === 'number' ? `GH₵ ${order.total}` : '—'}
                  </div>
                  <div><Badge color={payColor(order.payment)}>{order.payment}</Badge></div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                    {order.syncStatus === 'Pending Sync' ? <RefreshCw size={10} style={{ color: 'var(--warning)', animation: 'spin 2s linear infinite' }} /> : <CheckCircle size={10} style={{ color: 'var(--success)' }} />}
                    <Badge color={syncColor(order.syncStatus)}>{order.syncStatus}</Badge>
                  </div>
                  <div>
                    {order.serviceTime ? (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, fontWeight: 700, color: order.serviceTime > 15 ? 'var(--terracotta)' : 'var(--success)' }}>
                        <Clock size={11} /> {order.serviceTime} min
                      </div>
                    ) : (
                      <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>In progress...</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {filtered.length === 0 && (
            <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 8 }}><ClipboardList size={32} style={{ color: 'var(--text-muted)' }} /></div>
              <div>No orders match your filter</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
