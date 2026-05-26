import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { Logo, OnlineBadge, Card, Badge, useViewport, TimerBadge } from '../components/Shared';
import {
  LayoutDashboard, ShoppingBag, Package, Users, BarChart2, Settings, Bell,
  TrendingUp, TrendingDown, AlertCircle, ArrowUpRight, Home, Menu, X,
  Clock, DollarSign, Activity, FileText, CheckCircle2, QrCode, ClipboardList,
  ThumbsUp, UserCheck, Star, Sparkles, ChevronRight, Save, Plus, Trash2,
  MessageSquare
} from 'lucide-react';
import ReportsScreen from './ReportsScreen';
import InventoryScreen from './InventoryScreen';
import StaffScreen from './StaffScreen';
import FeedbackScreen from './FeedbackScreen';

const NAV = [
  { id: 'dashboard', icon: <LayoutDashboard size={15} />, label: 'Dashboard' },
  { id: 'orders', icon: <ShoppingBag size={15} />, label: 'Orders' },
  { id: 'inventory', icon: <Package size={15} />, label: 'Inventory' },
  { id: 'customers', icon: <Users size={15} />, label: 'Customers' },
  { id: 'reports-analytics', icon: <BarChart2 size={15} />, label: 'Reports & Analytics' },
  { id: 'staff', icon: <Users size={15} />, label: 'Staff' },
  { id: 'feedback-complaints', icon: <MessageSquare size={15} />, label: 'Feedback' },
  { id: 'settings', icon: <Settings size={15} />, label: 'Settings' },
];

const SPARKLINE_SALES = [8200, 9400, 7800, 11200, 10500, 13800, 12400, 15600, 14200, 18540];

// Original MiniBarChart component
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

// Custom Sparkline component using SVGs
function Sparkline({ data, color = 'var(--terracotta)', height = 36, width = 120 }) {
  const max = Math.max(...data, 1);
  const min = Math.min(...data, 0);
  const range = max - min || 1;
  const padding = 4;
  const usableHeight = height - padding * 2;
  const norm = data.map(v => height - padding - ((v - min) / range) * usableHeight);
  const step = width / (data.length - 1 || 1);
  const path = norm.map((y, i) => `${i === 0 ? 'M' : 'L'} ${i * step} ${y}`).join(' ');
  return (
    <svg width={width} height={height + 4} style={{ overflow: 'visible' }}>
      <path d={path} fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx={(data.length - 1) * step} cy={norm[norm.length - 1]} r="3.5" fill={color} stroke="#fff" strokeWidth="1.5" />
    </svg>
  );
}

export default function DashboardScreen() {
  const {
    dashboardStats,
    kdsOrders,
    orderHistory,
    setCurrentScreen,
    tick,
    getElapsedMins,
    showNotification
  } = useApp();

  // Reset default state to 'dashboard' to keep the original view intact
  const [navActive, setNavActive] = useState('dashboard');
  const [navOpen, setNavOpen] = useState(false);
  const { isMobile, isTablet } = useViewport();

  // Ref to the main scrolling content area
  const contentRef = useRef(null);

  // Scroll to top of right pane when sub-view tab changes
  useEffect(() => {
    if (contentRef.current) {
      contentRef.current.scrollTop = 0;
    }
  }, [navActive]);

  // Local state for interactive features
  const [lowStockItems, setLowStockItems] = useState([
    { id: 1, name: 'Chicken Breast', category: 'Mains', stock: 3.5, unit: 'kg', threshold: 10, status: 'critical' },
    { id: 2, name: 'Sobolo Leaves', category: 'Drinks', stock: 1.2, unit: 'kg', threshold: 5, status: 'critical' },
    { id: 3, name: 'Yam Tubers', category: 'Mains', stock: 6, unit: 'tubers', threshold: 15, status: 'warning' },
    { id: 4, name: 'Vegetable Oil', category: 'Ingredients', stock: 4.8, unit: 'L', threshold: 10, status: 'warning' },
    { id: 5, name: 'Plantains (Ripened)', category: 'Sides', stock: 8, unit: 'bunches', threshold: 20, status: 'warning' }
  ]);

  const [staffList, setStaffList] = useState([
    { id: 1, name: 'Kofi Mensah', role: 'Server', status: 'Active', sales: 480, orders: 12, rating: 4.9, activeTable: 'Table 04' },
    { id: 2, name: 'Esi Boateng', role: 'Chef', status: 'Active', sales: 1240, orders: 28, rating: 4.8, activeTable: 'Kitchen Station 1' },
    { id: 3, name: 'Ama Osei', role: 'Server', status: 'Active', sales: 320, orders: 9, rating: 4.6, activeTable: 'Table 08' },
    { id: 4, name: 'Yaw Addo', role: 'Chef', status: 'Break', sales: 940, orders: 18, rating: 4.7, activeTable: 'On Break' },
    { id: 5, name: 'Kweku Appiah', role: 'Server', status: 'Offline', sales: 150, orders: 4, rating: 4.5, activeTable: 'Shift Ended' }
  ]);

  const [settings, setSettings] = useState({
    vatRate: 15,
    nhilRate: 2.5,
    serviceChargeRate: 5,
    currency: 'GHS',
    autoBackup: true,
    kitchenPrinters: 'Active',
    receiptPrinters: 'Active',
    quickPayments: true
  });

  const [selectedOrderDetails, setSelectedOrderDetails] = useState(null);

  // Original menu items metrics
  const topItems = [
    { name: 'Jollof Rice', orders: 48, revenue: 2160, trend: 'up' },
    { name: 'Grilled Tilapia', orders: 35, revenue: 2275, trend: 'up' },
    { name: 'Waakye', orders: 29, revenue: 1015, trend: 'down' },
    { name: 'Kelewele', orders: 27, revenue: 540, trend: 'up' },
    { name: 'Sobolo', orders: 24, revenue: 360, trend: 'neutral' },
  ];

  // Time & Date strings
  const now = new Date();
  const timeStr = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  const dateStr = now.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });

  // Handle restock trigger
  const handleRestock = (id, name) => {
    setLowStockItems(prev => prev.map(item => {
      if (item.id === id) {
        return { ...item, stock: item.threshold * 2, status: 'in-stock' };
      }
      return item;
    }));
    showNotification(`Restocked ${name} successfully!`, 'success');
  };

  const activeLowStock = lowStockItems.filter(item => item.status !== 'in-stock');

  // Handle staff state changes
  const toggleStaffStatus = (id, currentStatus) => {
    const nextStatus = currentStatus === 'Active' ? 'Break' : currentStatus === 'Break' ? 'Offline' : 'Active';
    setStaffList(prev => prev.map(staff => staff.id === id ? { ...staff, status: nextStatus, activeTable: nextStatus === 'Active' ? 'Roaming' : nextStatus === 'Break' ? 'On Break' : 'Logged Out' } : staff));
    showNotification(`Staff status changed to ${nextStatus}`, 'success');
  };

  const completedOrders = orderHistory.filter(o => o.serviceTime !== null && o.serviceTime !== undefined);
  const avgKitchenTime = completedOrders.length > 0
    ? (completedOrders.reduce((sum, o) => sum + o.serviceTime, 0) / completedOrders.length).toFixed(1)
    : '11.4';

  // Helper renderer for General Dashboard Tab (Exactly matching the original visual style and content)
  const renderGeneralDashboard = () => {
    const statCards = [
      { label: 'Live Orders', value: kdsOrders.length, icon: <Activity size={12} style={{ color: 'var(--terracotta)' }} />, sub: `+${kdsOrders.filter(o => getElapsedMins(o.placedAt) < 5).length} new`, color: 'var(--terracotta)', chart: <Sparkline data={[14, 18, 20, 16, 22, 24]} color="var(--terracotta)" /> },
      { label: 'Total Sales', value: `GH₵ ${dashboardStats.totalSales.toLocaleString()}`, icon: <DollarSign size={12} style={{ color: 'var(--success)' }} />, sub: '+12.5% vs last week', color: 'var(--success)', chart: <Sparkline data={SPARKLINE_SALES} color="var(--success)" /> },
      { label: 'Inventory', value: dashboardStats.inventory, icon: <Package size={12} style={{ color: '#C07830' }} />, sub: 'Low stock items', color: '#C07830', chart: null, alert: activeLowStock.length > 0 },
      { label: 'Food Waste', value: `${dashboardStats.waste}%`, icon: <Trash2 size={12} style={{ color: 'var(--text-secondary)' }} />, sub: '-4% vs last week', color: 'var(--text-secondary)', chart: null },
      { label: 'Customers', value: dashboardStats.customers, icon: <Users size={12} style={{ color: '#4A90D9' }} />, sub: '+18 new this week', color: '#4A90D9', chart: <MiniBarChart /> },
      { label: 'Peak Hours', value: dashboardStats.peakHours, icon: <Clock size={12} style={{ color: 'var(--warning)' }} />, sub: 'Busiest time', color: 'var(--warning)', chart: null },
    ];

    return (
      <>
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
                <span>Avg. Service Time</span><span style={{ fontWeight: 700 }}>{avgKitchenTime} min</span>
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
              <Sparkline data={SPARKLINE_SALES} color="var(--terracotta)" height={48} width={280} />
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
                <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>Mon</span>
                <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>Sun</span>
              </div>
            </div>
            <div style={{ marginTop: 12 }}>
              <button
                onClick={() => setNavActive('reports-analytics')}
                style={{ width: '100%', background: 'var(--terracotta)', color: '#fff', border: 'none', borderRadius: 8, padding: '10px', cursor: 'pointer', fontSize: 13, fontWeight: 600, fontFamily: 'var(--font-body)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}
              >
                View Detailed Analytics <ArrowUpRight size={13} />
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
      </>
    );
  };



  const renderCustomersView = () => {
    const customers = [
      { id: 1, name: 'Abena Koomson', phone: '+233 24 456 7890', visits: 18, spend: 1140, rating: 5, notes: 'Prefers extra spicy Jollof, loyal QR customer' },
      { id: 2, name: 'Emmanuel Osei', phone: '+233 50 123 4567', visits: 12, spend: 980, rating: 5, notes: 'Orders Banku & Tilapia weekly' },
      { id: 3, name: 'Sherifa Bello', phone: '+233 27 987 6543', visits: 9, spend: 450, rating: 4, notes: 'Usually takeaway, likes ginger Sobolo' },
      { id: 4, name: 'Kwame Mensah Jr.', phone: '+233 20 555 1234', visits: 6, spend: 280, rating: 5, notes: 'Vegetarian, orders Waakye with no egg' }
    ];

    return (
      <Card style={{ padding: 20, maxWidth: '100%', overflow: 'hidden' }}>
        <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 16, color: 'var(--espresso)', marginBottom: 12 }}>Customer Loyalty Directory</h3>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12, textAlign: 'left', minWidth: 600 }}>
            <thead>
              <tr style={{ borderBottom: '1.5px solid var(--border)', color: 'var(--text-muted)' }}>
                <th style={{ padding: '8px 4px' }}>Name</th>
                <th style={{ padding: '8px 4px' }}>Contact Info</th>
                <th style={{ padding: '8px 4px' }}>Visits</th>
                <th style={{ padding: '8px 4px' }}>Total Spend</th>
                <th style={{ padding: '8px 4px' }}>Sentiment</th>
                <th style={{ padding: '8px 4px' }}>Notes</th>
              </tr>
            </thead>
            <tbody>
              {customers.map(c => (
                <tr key={c.id} style={{ borderBottom: '1px solid var(--border)' }}>
                  <td style={{ padding: '10px 4px', fontWeight: 600 }}>{c.name}</td>
                  <td style={{ padding: '10px 4px' }}>{c.phone}</td>
                  <td style={{ padding: '10px 4px', fontWeight: 700 }}>{c.visits} times</td>
                  <td style={{ padding: '10px 4px', fontWeight: 700 }}>GH₵ {c.spend}</td>
                  <td style={{ padding: '10px 4px' }}>
                    <div style={{ display: 'flex', gap: 2 }}>
                      {[...Array(5)].map((_, idx) => (
                        <Star key={idx} size={11} fill={idx < c.rating ? '#F1C40F' : 'none'} stroke={idx < c.rating ? '#F1C40F' : 'var(--text-muted)'} />
                      ))}
                    </div>
                  </td>
                  <td style={{ padding: '10px 4px', color: 'var(--text-secondary)' }}>{c.notes}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    );
  };


  const renderSettingsView = () => {
    return (
      <Card style={{ padding: 20 }}>
        <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 16, color: 'var(--espresso)', marginBottom: 14 }}>
          TableMind Local Settings Configuration
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: 20 }}>
          {/* Taxation and Currency rules */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <h4 style={{ fontSize: 13, color: 'var(--espresso)', borderBottom: '1px solid var(--border)', paddingBottom: 6 }}>
              Local Taxation & Fees
            </h4>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: 12 }}>VAT Percentage Rate (%)</span>
              <input
                type="number"
                value={settings.vatRate}
                onChange={e => setSettings(prev => ({ ...prev, vatRate: Number(e.target.value) }))}
                style={{ width: 80, padding: 6, border: '1px solid var(--border)', borderRadius: 6 }}
              />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: 12 }}>NHIL Percentage Rate (%)</span>
              <input
                type="number"
                value={settings.nhilRate}
                onChange={e => setSettings(prev => ({ ...prev, nhilRate: Number(e.target.value) }))}
                style={{ width: 80, padding: 6, border: '1px solid var(--border)', borderRadius: 6 }}
              />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: 12 }}>Service Charge rate (%)</span>
              <input
                type="number"
                value={settings.serviceChargeRate}
                onChange={e => setSettings(prev => ({ ...prev, serviceChargeRate: Number(e.target.value) }))}
                style={{ width: 80, padding: 6, border: '1px solid var(--border)', borderRadius: 6 }}
              />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: 12 }}>Default currency symbol</span>
              <select
                value={settings.currency}
                onChange={e => setSettings(prev => ({ ...prev, currency: e.target.value }))}
                style={{ width: 80, padding: 6, border: '1px solid var(--border)', borderRadius: 6, background: '#fff' }}
              >
                <option value="GHS">GHS (GH₵)</option>
                <option value="USD">USD ($)</option>
                <option value="EUR">EUR (€)</option>
              </select>
            </div>
          </div>

          {/* Device and printer controls */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <h4 style={{ fontSize: 13, color: 'var(--espresso)', borderBottom: '1px solid var(--border)', paddingBottom: 6 }}>
              Devices & System rules
            </h4>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: 12 }}>Receipt Printer Service</span>
              <Badge color={settings.receiptPrinters === 'Active' ? 'green' : 'red'}>
                {settings.receiptPrinters}
              </Badge>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: 12 }}>Kitchen Ticket Printer Service</span>
              <Badge color={settings.kitchenPrinters === 'Active' ? 'green' : 'red'}>
                {settings.kitchenPrinters}
              </Badge>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: 12 }}>Automatic Offline Syncing</span>
              <button
                onClick={() => setSettings(prev => ({ ...prev, autoBackup: !prev.autoBackup }))}
                style={{
                  background: settings.autoBackup ? 'var(--success)' : 'var(--text-muted)',
                  border: 'none', borderRadius: 14, width: 44, height: 22, cursor: 'pointer',
                  position: 'relative', transition: 'all 0.2s'
                }}
              >
                <span style={{
                  position: 'absolute', top: 2, left: settings.autoBackup ? 24 : 2,
                  width: 18, height: 18, borderRadius: 9, background: '#fff', transition: 'all 0.2s'
                }} />
              </button>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: 12 }}>Quick cash register payouts</span>
              <button
                onClick={() => setSettings(prev => ({ ...prev, quickPayments: !prev.quickPayments }))}
                style={{
                  background: settings.quickPayments ? 'var(--success)' : 'var(--text-muted)',
                  border: 'none', borderRadius: 14, width: 44, height: 22, cursor: 'pointer',
                  position: 'relative', transition: 'all 0.2s'
                }}
              >
                <span style={{
                  position: 'absolute', top: 2, left: settings.quickPayments ? 24 : 2,
                  width: 18, height: 18, borderRadius: 9, background: '#fff', transition: 'all 0.2s'
                }} />
              </button>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', borderTop: '1px solid var(--border)', paddingTop: 14, marginTop: 20 }}>
          <button
            onClick={() => showNotification('Settings changes saved!', 'success')}
            style={{
              background: 'var(--terracotta)', color: '#fff', border: 'none',
              borderRadius: 8, padding: '10px 20px', cursor: 'pointer',
              fontSize: 12, fontWeight: 600, fontFamily: 'var(--font-body)',
              display: 'flex', alignItems: 'center', gap: 6
            }}
          >
            <Save size={13} /> Save Configuration
          </button>
        </div>
      </Card>
    );
  };

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
            {item.id === 'orders' && kdsOrders.length > 0 && (
              <span style={{ marginLeft: 'auto', background: 'var(--terracotta)', color: '#fff', borderRadius: 10, padding: '1px 6px', fontSize: 10, fontWeight: 700 }}>
                {kdsOrders.length}
              </span>
            )}
            {item.id === 'inventory' && activeLowStock.length > 0 && (
              <span style={{ marginLeft: 'auto', background: 'var(--warning)', color: '#fff', borderRadius: 10, padding: '1px 6px', fontSize: 10, fontWeight: 700 }}>
                {activeLowStock.length}
              </span>
            )}
          </button>
        ))}
      </div>

      <div style={{ marginTop: 'auto', paddingTop: 12, borderTop: '1px solid var(--border)', display: 'flex', flexDirection: 'column', gap: 8 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px' }}>
          <div style={{ width: 28, height: 28, borderRadius: 8, background: 'var(--terracotta-pale)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <UserCheck size={14} style={{ color: 'var(--terracotta)' }} />
          </div>
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

      {/* Attach contentRef here to control scroll position on sub-view tab changes */}
      <div ref={contentRef} style={{ flex: 1, overflow: 'auto', background: 'var(--cream)', minWidth: 0 }}>
        {/* Sticky Header */}
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
            <button
              onClick={() => showNotification('East Legon Branch selected', 'info')}
              style={{ background: 'var(--terracotta)', color: '#fff', border: 'none', borderRadius: 8, padding: '7px 14px', cursor: 'pointer', fontSize: 12, fontWeight: 600, fontFamily: 'var(--font-body)', whiteSpace: 'nowrap' }}
            >
              East Legon ▾
            </button>
          </div>
        </div>

        {/* Content View Routing */}
        <div style={{ padding: isMobile ? 16 : 24 }}>
          {navActive === 'dashboard' && renderGeneralDashboard()}
          {navActive === 'reports-analytics' && <ReportsScreen />}
          {navActive === 'orders' && <OrdersView setSelectedOrderDetails={setSelectedOrderDetails} />}
          {navActive === 'inventory' && <InventoryScreen />}
          {navActive === 'customers' && renderCustomersView()}
          {navActive === 'staff' && <StaffScreen />}
          {navActive === 'feedback-complaints' && <FeedbackScreen />}
          {navActive === 'settings' && renderSettingsView()}
        </div>
      </div>

      {/* Transaction Details Modal Overlay */}
      {selectedOrderDetails && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(26,15,10,0.45)',
          backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center',
          justifyContent: 'center', zIndex: 1000, padding: 16
        }}>
          <div className="fade-in" style={{
            background: '#fff', borderRadius: 'var(--radius-lg)',
            width: '100%', maxWidth: 500, border: '1px solid var(--border)',
            boxShadow: 'var(--shadow-lg)', overflow: 'hidden'
          }}>
            <div style={{ background: 'var(--espresso)', color: '#fff', padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h4 style={{ margin: 0, fontFamily: 'var(--font-display)', fontSize: 16 }}>Order details #{selectedOrderDetails.id}</h4>
                <span style={{ fontSize: 10, opacity: 0.8 }}>Placed via {selectedOrderDetails.type}</span>
              </div>
              <button
                onClick={() => setSelectedOrderDetails(null)}
                style={{ background: 'transparent', border: 'none', color: '#fff', cursor: 'pointer' }}
              >
                <X size={18} />
              </button>
            </div>
            <div style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                <span>Table Location:</span><strong>{selectedOrderDetails.table}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                <span>Payment State:</span>
                <Badge color={selectedOrderDetails.payment === 'Paid' ? 'green' : 'amber'}>
                  {selectedOrderDetails.payment}
                </Badge>
              </div>
              {selectedOrderDetails.serviceTime && (
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                  <span>Kitchen Cooking Time:</span><strong>{selectedOrderDetails.serviceTime} mins</strong>
                </div>
              )}

              {/* Items List */}
              <div style={{ borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)', padding: '10px 0', margin: '4px 0' }}>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 8, fontWeight: 700 }}>ORDERED ITEMS</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {Array.isArray(selectedOrderDetails.items) ? (
                    selectedOrderDetails.items.map((item, idx) => (
                      <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12 }}>
                        <span>{item.name || item}</span>
                        {item.qty && <span>x{item.qty}</span>}
                      </div>
                    ))
                  ) : (
                    <div style={{ fontSize: 12 }}>{selectedOrderDetails.items}</div>
                  )}
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 15, fontWeight: 700, color: 'var(--espresso)' }}>
                <span>Total Amount:</span><span>GH₵ {selectedOrderDetails.total}</span>
              </div>
            </div>
            <div style={{ background: 'var(--cream)', padding: '12px 20px', display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
              {selectedOrderDetails.payment === 'Pending' && (
                <button
                  onClick={() => {
                    selectedOrderDetails.payment = 'Paid';
                    setSelectedOrderDetails(null);
                    showNotification('Order payment settled successfully!', 'success');
                  }}
                  style={{
                    background: 'var(--success)', color: '#fff', border: 'none',
                    borderRadius: 6, padding: '8px 14px', fontSize: 12, fontWeight: 600, cursor: 'pointer'
                  }}
                >
                  Settle Bill (Cash/MoMo)
                </button>
              )}
              <button
                onClick={() => setSelectedOrderDetails(null)}
                style={{
                  background: 'var(--cream-dark)', color: 'var(--espresso)', border: '1px solid var(--border)',
                  borderRadius: 6, padding: '8px 14px', fontSize: 12, fontWeight: 600, cursor: 'pointer'
                }}
              >
                Close details
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Standalone component to satisfy React hook rules (avoiding renderOrdersView nested hook renders)
function OrdersView({ setSelectedOrderDetails }) {
  const { kdsOrders, orderHistory } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('All');

  const combinedOrders = [
    ...kdsOrders.map(o => ({ ...o, total: o.items.length * 40, payment: 'Pending', timestamp: o.placedAt, source: 'Kitchen' })),
    ...orderHistory.map(o => ({ ...o, timestamp: Date.now() - 30 * 60000, source: 'History' }))
  ];

  const filtered = combinedOrders.filter(o => {
    const matchSearch = String(o.id).includes(searchTerm) || o.table.toLowerCase().includes(searchTerm.toLowerCase());
    const matchType = typeFilter === 'All' || o.type === typeFilter;
    return matchSearch && matchType;
  });

  return (
    <Card style={{ padding: 20, maxWidth: '100%', overflow: 'hidden' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12, marginBottom: 16 }}>
        <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 16, color: 'var(--espresso)', margin: 0 }}>Orders Manager</h3>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
          <input
            type="text"
            placeholder="Search table/order..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            style={{
              padding: '6px 12px', border: '1px solid var(--border)', borderRadius: 6,
              fontSize: 12, fontFamily: 'var(--font-body)', outline: 'none', background: 'var(--cream)'
            }}
          />
          <div style={{ display: 'flex', background: 'var(--cream)', borderRadius: 6, padding: 2, border: '1px solid var(--border)' }}>
            {['All', 'Dine In', 'Takeaway'].map(t => (
              <button
                key={t}
                onClick={() => setTypeFilter(t)}
                style={{
                  border: 'none', background: typeFilter === t ? '#fff' : 'transparent',
                  fontSize: 11, fontWeight: typeFilter === t ? 700 : 500, padding: '4px 10px',
                  borderRadius: 4, cursor: 'pointer', color: typeFilter === t ? 'var(--terracotta)' : 'var(--text-secondary)'
                }}
              >
                {t}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12, textAlign: 'left', minWidth: 650 }}>
          <thead>
            <tr style={{ borderBottom: '1.5px solid var(--border)', color: 'var(--text-muted)' }}>
              <th style={{ padding: '8px 4px' }}>ID</th>
              <th style={{ padding: '8px 4px' }}>Table</th>
              <th style={{ padding: '8px 4px' }}>Type</th>
              <th style={{ padding: '8px 4px' }}>Source</th>
              <th style={{ padding: '8px 4px' }}>Billing Total</th>
              <th style={{ padding: '8px 4px' }}>Payment</th>
              <th style={{ padding: '8px 4px', textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(o => (
              <tr key={o.id} style={{ borderBottom: '1px solid var(--border)' }}>
                <td style={{ padding: '10px 4px', fontWeight: 700 }}>#{o.id}</td>
                <td style={{ padding: '10px 4px', fontWeight: 600 }}>{o.table}</td>
                <td style={{ padding: '10px 4px' }}>{o.type}</td>
                <td style={{ padding: '10px 4px' }}>
                  <Badge color={o.source === 'Kitchen' ? 'red' : 'nude'}>{o.source}</Badge>
                </td>
                <td style={{ padding: '10px 4px', fontWeight: 700 }}>GH₵ {o.total}</td>
                <td style={{ padding: '10px 4px' }}>
                  <Badge color={o.payment === 'Paid' ? 'green' : 'amber'}>{o.payment}</Badge>
                </td>
                <td style={{ padding: '10px 4px', textAlign: 'right' }}>
                  <button
                    onClick={() => setSelectedOrderDetails(o)}
                    style={{ background: 'var(--cream)', border: 'none', borderRadius: 4, padding: '4px 8px', fontSize: 11, cursor: 'pointer', fontWeight: 600 }}
                  >
                    Details
                  </button>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={7} style={{ textAlign: 'center', padding: '30px 0', color: 'var(--text-muted)' }}>No orders match filters.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
