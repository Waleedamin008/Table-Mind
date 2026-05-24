import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Logo, OnlineBadge, Card, Badge, useViewport } from '../components/Shared';
import {
  LayoutDashboard, ShoppingBag, Package, Users, BarChart2, Settings, Bell,
  TrendingUp, TrendingDown, AlertCircle, ArrowUpRight, Home, Menu, X,
} from 'lucide-react';

const NAV = [
  { id: 'dashboard', icon: <LayoutDashboard size={15} />, label: 'Dashboard' },
  { id: 'orders', icon: <ShoppingBag size={15} />, label: 'Orders', badge: 24 },
  { id: 'inventory', icon: <Package size={15} />, label: 'Inventory', badge: 7 },
  { id: 'customers', icon: <Users size={15} />, label: 'Customers' },
  { id: 'reports-analytics', icon: <BarChart2 size={15} />, label: 'Reports & Analytics' },
  { id: 'staff', icon: <Users size={15} />, label: 'Staff' },
  { id: 'settings', icon: <Settings size={15} />, label: 'Settings' },
];

const SPARKLINE_SALES = [8200, 9400, 7800, 11200, 10500, 13800, 12400, 15600, 14200, 18540];

function Sparkline({ data, color = 'var(--terracotta)', height = 36 }) {
  const max = Math.max(...data);
  const min = Math.min(...data);
  const norm = data.map(v => height - ((v - min) / (max - min)) * height);
  const w = 120;
  const step = w / (data.length - 1);
  const path = norm.map((y, i) => `${i === 0 ? 'M' : 'L'} ${i * step} ${y}`).join(' ');
  return (
    <svg width={w} height={height + 4} style={{ overflow: 'visible' }}>
      <path d={path} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx={(data.length - 1) * step} cy={norm[norm.length - 1]} r="3" fill={color} />
    </svg>
  );
}

function MiniBarChart() {
  const bars = [60, 75, 55, 80, 90, 85, 95];
  const days = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 3, height: 36 }}>
      {bars.map((h, i) => (
        <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
          <div style={{ width: 10, height: h * 0.36, background: i === 6 ? 'var(--terracotta)' : 'var(--nude)', borderRadius: 3 }} />
          <span style={{ fontSize: 8, color: 'var(--text-muted)' }}>{days[i]}</span>
        </div>
      ))}
    </div>
  );
}

export default function DashboardScreen() {
  const { dashboardStats, kdsOrders, setCurrentScreen, tick } = useApp();
  const [navActive, setNavActive] = useState('dashboard');
  const [navOpen, setNavOpen] = useState(false);
  const { isMobile, isTablet } = useViewport();

  const now = new Date(tick);
  const timeStr = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  const dateStr = now.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });

  const topItems = [
    { name: 'Jollof Rice', orders: 48, revenue: 2160, trend: 'up' },
    { name: 'Grilled Tilapia', orders: 35, revenue: 2275, trend: 'up' },
    { name: 'Waakye', orders: 29, revenue: 1015, trend: 'down' },
    { name: 'Kelewele', orders: 27, revenue: 540, trend: 'up' },
    { name: 'Sobolo', orders: 24, revenue: 360, trend: 'neutral' },
  ];

  const statCards = [
    { label: 'Live Orders', value: dashboardStats.liveOrders, icon: '🔴', sub: '+8 new', color: 'var(--terracotta)', chart: <Sparkline data={[14, 18, 20, 16, 22, 24]} color="var(--terracotta)" /> },
    { label: 'Total Sales', value: `GH₵ ${dashboardStats.totalSales.toLocaleString()}`, icon: '💰', sub: '+12.5% vs last week', color: 'var(--success)', chart: <Sparkline data={SPARKLINE_SALES} color="var(--success)" /> },
    { label: 'Inventory', value: dashboardStats.inventory, icon: '📦', sub: 'Low stock items', color: '#C07830', chart: null, alert: true },
    { label: 'Food Waste', value: `${dashboardStats.waste}%`, icon: '♻️', sub: '-4% vs last week', color: 'var(--text-secondary)', chart: null },
    { label: 'Customers', value: dashboardStats.customers, icon: '👥', sub: '+18 new this week', color: '#4A90D9', chart: <MiniBarChart /> },
    { label: 'Peak Hours', value: dashboardStats.peakHours, icon: '⏰', sub: 'Busiest time', color: 'var(--warning)', chart: null },
  ];

  const sidebar = (
    <nav style={{
      width: isMobile ? 'min(86vw, 320px)' : 220,
      height: isMobile ? '100vh' : 'auto',
      flexShrink: 0,
      background: '#fff',
      borderRight: '1px solid var(--border)',
      display: 'flex',
      flexDirection: 'column',
      padding: isMobile ? '18px 14px' : '20px 12px',
      boxShadow: isMobile ? '0 18px 42px rgba(0,0,0,0.16)' : 'none',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, marginBottom: 14, paddingLeft: isMobile ? 0 : 8 }}>
        <Logo size="sm" />
        {isMobile && (
          <button onClick={() => setNavOpen(false)} style={{ background: 'var(--cream)', border: '1px solid var(--border)', borderRadius: 10, width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'var(--espresso)' }}>
            <X size={16} />
          </button>
        )}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 6, overflowY: 'auto', paddingBottom: 10 }}>
        {NAV.map(item => (
          <button
            key={item.id}
            onClick={() => { setNavActive(item.id); setNavOpen(false); }}
            style={{
              display: 'flex', alignItems: 'center', gap: 9, padding: '10px 12px',
              borderRadius: 8, border: 'none', cursor: 'pointer', width: '100%',
              background: navActive === item.id ? 'var(--terracotta-pale)' : 'transparent',
              color: navActive === item.id ? 'var(--terracotta)' : 'var(--text-secondary)',
              fontFamily: 'var(--font-body)', fontSize: 13, fontWeight: navActive === item.id ? 600 : 400,
              transition: 'all 0.15s', textAlign: 'left',
            }}
          >
            {item.icon} {item.label}
            {item.badge && <span style={{ marginLeft: 'auto', background: 'var(--terracotta)', color: '#fff', borderRadius: 10, padding: '1px 6px', fontSize: 10, fontWeight: 700 }}>{item.badge}</span>}
          </button>
        ))}
      </div>

      <div style={{ marginTop: 'auto', paddingTop: 12, borderTop: '1px solid var(--border)', display: 'flex', flexDirection: 'column', gap: 8 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px' }}>
          <div style={{ width: 28, height: 28, borderRadius: 8, background: 'var(--terracotta-pale)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14 }}>👤</div>
          <div>
            <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--espresso)' }}>Kwame Asante</div>
            <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>TableMind Admin</div>
          </div>
        </div>
        <button onClick={() => { setCurrentScreen('home'); setNavOpen(false); }} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px', border: 'none', background: 'transparent', cursor: 'pointer', color: 'var(--text-muted)', fontSize: 12, fontFamily: 'var(--font-body)', whiteSpace: 'nowrap' }}>
          <Home size={13} /> Back to Demo
        </button>
      </div>
    </nav>
  );

  return (
    <div style={{ display: 'flex', minHeight: '100vh', overflow: 'hidden', fontFamily: 'var(--font-body)', position: 'relative' }}>
      {!isMobile && sidebar}
      {isMobile && navOpen && (
        <>
          <div onClick={() => setNavOpen(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(26,15,10,0.34)', zIndex: 39 }} />
          <div style={{ position: 'fixed', top: 0, left: 0, zIndex: 40 }}>{sidebar}</div>
        </>
      )}

      <div style={{ flex: 1, overflow: 'auto', background: 'var(--cream)', minWidth: 0 }}>
        <div style={{
          position: 'sticky', top: 0, zIndex: 10, background: 'rgba(245,239,230,0.95)',
          backdropFilter: 'blur(8px)', borderBottom: '1px solid var(--border)',
          padding: isMobile ? '12px 16px' : '12px 24px', display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap',
        }}>
          {isMobile && (
            <button onClick={() => setNavOpen(true)} style={{ width: 40, height: 40, borderRadius: 10, border: '1px solid var(--border)', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'var(--espresso)' }}>
              <Menu size={18} />
            </button>
          )}
          <div key={tick} style={{ flex: 1, minWidth: isMobile ? 140 : 180 }}>
            <div style={{ fontSize: 22, fontWeight: 800, color: 'var(--espresso)', fontFamily: 'var(--font-display)', lineHeight: 1.1 }}>
              {timeStr}
            </div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{dateStr}</div>
          </div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap', width: isMobile ? '100%' : 'auto', justifyContent: isMobile ? 'space-between' : 'flex-end' }}>
            <OnlineBadge />
            <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)', position: 'relative' }}>
              <Bell size={18} />
              <span style={{ position: 'absolute', top: -3, right: -3, width: 8, height: 8, borderRadius: 4, background: 'var(--terracotta)' }} />
            </button>
            <button style={{ background: 'var(--terracotta)', color: '#fff', border: 'none', borderRadius: 8, padding: '7px 14px', cursor: 'pointer', fontSize: 12, fontWeight: 600, fontFamily: 'var(--font-body)', whiteSpace: 'nowrap' }}>
              All Outlets ▾
            </button>
          </div>
        </div>

        <div style={{ padding: isMobile ? 16 : 24 }}>
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : isTablet ? 'repeat(2, 1fr)' : 'repeat(3, 1fr)', gap: 14, marginBottom: 24 }}>
            {statCards.map((s, i) => (
              <Card key={i} style={{ padding: '18px 20px', animation: `fadeIn 0.3s ease ${i * 0.05}s both` }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 10 }}>
                  <div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 500, marginBottom: 6, display: 'flex', alignItems: 'center', gap: 5 }}>
                      <span>{s.icon}</span> {s.label}
                      {s.alert && <AlertCircle size={11} style={{ color: 'var(--warning)' }} />}
                    </div>
                    <div style={{ fontSize: 26, fontWeight: 700, color: 'var(--espresso)', fontFamily: 'var(--font-display)', lineHeight: 1 }}>
                      {s.value}
                    </div>
                    <div style={{ fontSize: 11, color: s.color, marginTop: 5, fontWeight: 500 }}>{s.sub}</div>
                  </div>
                  {s.chart && <div>{s.chart}</div>}
                </div>
              </Card>
            ))}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: 16 }}>
            <Card style={{ padding: 20 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 15, color: 'var(--espresso)' }}>Top Menu Items</h3>
                <Badge color="nude">This week</Badge>
              </div>
              {topItems.map((item, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0', borderBottom: i < topItems.length - 1 ? '1px solid var(--border)' : 'none' }}>
                  <div style={{ width: 24, height: 24, borderRadius: 6, background: 'var(--cream)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, color: 'var(--text-muted)' }}>{i + 1}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--espresso)' }}>{item.name}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{item.orders} orders</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--espresso)' }}>GH₵ {item.revenue.toLocaleString()}</div>
                    {item.trend === 'up' ? <TrendingUp size={11} style={{ color: 'var(--success)' }} /> : item.trend === 'down' ? <TrendingDown size={11} style={{ color: 'var(--terracotta)' }} /> : null}
                  </div>
                </div>
              ))}
            </Card>

            <Card style={{ padding: 20 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 15, color: 'var(--espresso)' }}>Live Orders</h3>
                <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: 'var(--terracotta)', fontWeight: 600 }}>
                  <span style={{ width: 6, height: 6, borderRadius: 3, background: 'var(--terracotta)', display: 'inline-block', animation: 'pulse 1.5s infinite' }} />
                  Live
                </span>
              </div>
              <div style={{ display: 'flex', gap: 10, marginBottom: 14, flexWrap: 'wrap' }}>
                {[
                  { label: 'New', count: kdsOrders.filter(o => o.status === 'new').length, color: 'var(--terracotta)' },
                  { label: 'Preparing', count: kdsOrders.filter(o => o.status === 'preparing').length, color: 'var(--warning)' },
                  { label: 'Ready', count: kdsOrders.filter(o => o.status === 'ready').length, color: 'var(--success)' },
                ].map(s => (
                  <div key={s.label} style={{ flex: 1, minWidth: 90, background: 'var(--cream)', borderRadius: 10, padding: '12px', textAlign: 'center' }}>
                    <div style={{ fontSize: 22, fontWeight: 700, color: s.color, fontFamily: 'var(--font-display)' }}>{s.count}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{s.label}</div>
                  </div>
                ))}
              </div>
              <div style={{ marginBottom: 14 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 6, color: 'var(--text-secondary)' }}>
                  <span>Avg. Service Time</span><span style={{ fontWeight: 700 }}>11.4 min</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 6, color: 'var(--text-secondary)' }}>
                  <span>Slowest Order</span><span style={{ fontWeight: 700, color: 'var(--terracotta)' }}>18 min (Table 08)</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: 'var(--text-secondary)' }}>
                  <span>On-time Rate</span><span style={{ fontWeight: 700, color: 'var(--success)' }}>87%</span>
                </div>
              </div>
              <div style={{ background: 'var(--cream)', borderRadius: 10, padding: 14 }}>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 4 }}>Weekly Revenue</div>
                <Sparkline data={SPARKLINE_SALES} color="var(--terracotta)" height={48} />
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
                  <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>Mon</span>
                  <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>Sun</span>
                </div>
              </div>
              <div style={{ marginTop: 12 }}>
                <button style={{ width: '100%', background: 'var(--terracotta)', color: '#fff', border: 'none', borderRadius: 8, padding: '10px', cursor: 'pointer', fontSize: 13, fontWeight: 600, fontFamily: 'var(--font-body)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                  View Insights <ArrowUpRight size={13} />
                </button>
              </div>
            </Card>
          </div>

          <div style={{ marginTop: 20, background: 'linear-gradient(135deg, var(--espresso), var(--espresso-light))', borderRadius: 'var(--radius-lg)', padding: '20px 24px', display: 'flex', flexDirection: isMobile ? 'column' : 'row', alignItems: isMobile ? 'flex-start' : 'center', justifyContent: 'space-between', gap: 14 }}>
            <div>
              <div style={{ color: '#fff', fontSize: 15, fontWeight: 700, fontFamily: 'var(--font-display)' }}>Smarter operations. Happier guests.</div>
              <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: 12, marginTop: 2 }}>Run your restaurant with clarity and confidence.</div>
            </div>
            <button onClick={() => setCurrentScreen('pos')} style={{ background: 'var(--terracotta)', color: '#fff', border: 'none', borderRadius: 10, padding: '10px 20px', cursor: 'pointer', fontSize: 13, fontWeight: 600, fontFamily: 'var(--font-body)', display: 'flex', alignItems: 'center', gap: 6 }}>
              Try POS App <ArrowUpRight size={13} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
