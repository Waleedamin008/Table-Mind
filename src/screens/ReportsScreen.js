import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Card, Badge, useViewport, TimerBadge } from '../components/Shared';
import {
  ShoppingBag, TrendingUp, TrendingDown, AlertCircle, ArrowUpRight,
  Clock, DollarSign, Activity, CheckCircle2, Star, ChevronRight, X,
  AlertTriangle, Info
} from 'lucide-react';

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

// Custom Donut Progress Component
function DonutProgress({ percentage, color = 'var(--terracotta)', size = 56, strokeWidth = 5 }) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div style={{ position: 'relative', width: size, height: size, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        {/* Background track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="var(--border)"
          strokeWidth={strokeWidth}
        />
        {/* Progress arc */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 0.35s' }}
        />
      </svg>
      <span style={{ position: 'absolute', fontSize: 11, fontWeight: 700, color: 'var(--espresso)' }}>
        {percentage}%
      </span>
    </div>
  );
}

export default function ReportsScreen() {
  const {
    dashboardStats,
    kdsOrders,
    orderHistory,
    getElapsedMins,
    showNotification
  } = useApp();

  const [period, setPeriod] = useState('7days'); // 'today' | '7days' | 'month'
  const { isMobile, isTablet } = useViewport();
  const [selectedOrderDetails, setSelectedOrderDetails] = useState(null);

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

  // Handle staff status
  const toggleStaffStatus = (id, currentStatus) => {
    const nextStatus = currentStatus === 'Active' ? 'Break' : currentStatus === 'Break' ? 'Offline' : 'Active';
    setStaffList(prev => prev.map(staff => staff.id === id ? { ...staff, status: nextStatus, activeTable: nextStatus === 'Active' ? 'Roaming' : nextStatus === 'Break' ? 'On Break' : 'Logged Out' } : staff));
    showNotification(`Staff status changed to ${nextStatus}`, 'success');
  };

  // Dynamic calculations from app state
  const unpaidOrders = orderHistory.filter(o => o.payment === 'Pending');
  const unpaidCount = unpaidOrders.length;
  const unpaidValue = unpaidOrders.reduce((sum, o) => sum + (o.total || 0), 0);

  const delayedOrdersList = kdsOrders.filter(o => {
    const elapsed = getElapsedMins(o.placedAt);
    return elapsed > (o.targetMins || 12);
  });
  const delayedCount = delayedOrdersList.length;

  const completedOrders = orderHistory.filter(o => o.serviceTime !== null && o.serviceTime !== undefined);
  const avgKitchenTime = completedOrders.length > 0
    ? (completedOrders.reduce((sum, o) => sum + o.serviceTime, 0) / completedOrders.length).toFixed(1)
    : '11.4';

  const readyOrdersCount = kdsOrders.filter(o => o.status === 'ready').length;

  // Period datasets
  const reportData = {
    today: {
      sales: dashboardStats.totalSales - 13200,
      ordersCount: 28,
      avgOrderValue: 84.50,
      trendingUp: true,
      trendText: '+15.2% vs yesterday',
      sparklineData: [620, 850, 720, 1100, 950, 1380, 1200, 1540],
      peakHoursData: [8, 12, 19, 15, 26, 42, 38, 22, 12, 6],
      qrCount: 12,
      qrRevenue: 980,
      qrRate: 64,
      topItems: [
        { name: 'Jollof Rice', count: 18, revenue: 810 },
        { name: 'Grilled Tilapia', count: 12, revenue: 780 },
        { name: 'Waakye', count: 8, revenue: 280 }
      ]
    },
    '7days': {
      sales: dashboardStats.totalSales,
      ordersCount: 246,
      avgOrderValue: 75.36,
      trendingUp: true,
      trendText: '+12.5% vs last week',
      sparklineData: [8200, 9400, 7800, 11200, 10500, 13800, 12400, 15600, 14200, 18540],
      peakHoursData: [12, 18, 35, 28, 54, 82, 76, 44, 25, 12],
      qrCount: 104,
      qrRevenue: 7820,
      qrRate: 72,
      topItems: [
        { name: 'Jollof Rice', count: 98, revenue: 4410 },
        { name: 'Grilled Tilapia', count: 68, revenue: 4420 },
        { name: 'Waakye', count: 52, revenue: 1820 },
        { name: 'Kelewele', count: 48, revenue: 960 },
        { name: 'Sobolo', count: 36, revenue: 540 }
      ]
    },
    month: {
      sales: dashboardStats.totalSales * 4.2,
      ordersCount: 1048,
      avgOrderValue: 76.80,
      trendingUp: true,
      trendText: '+18.4% vs last month',
      sparklineData: [62000, 68000, 72000, 69000, 75000, 78000, 74000, 81000],
      peakHoursData: [45, 68, 120, 102, 210, 310, 290, 180, 92, 48],
      qrCount: 442,
      qrRevenue: 34120,
      qrRate: 75,
      topItems: [
        { name: 'Jollof Rice', count: 420, revenue: 18900 },
        { name: 'Grilled Tilapia', count: 290, revenue: 18850 },
        { name: 'Waakye', count: 210, revenue: 7350 },
        { name: 'Kelewele', count: 180, revenue: 3600 },
        { name: 'Sobolo', count: 154, revenue: 2310 }
      ]
    }
  };

  const activePeriodData = reportData[period] || reportData['7days'];

  // Attention alerts
  const alertsList = [
    { id: 1, type: 'danger', message: `Kitchen delay: Order #1020 has been in preparation for ${getElapsedMins(kdsOrders.find(o => o.id === 1020)?.placedAt || Date.now() - 6 * 60000)}m (Table 05)` },
    ...(activeLowStock.slice(0, 2).map(item => ({
      id: `stock-${item.id}`,
      type: item.status === 'critical' ? 'danger' : 'warning',
      message: `Low Stock Alert: ${item.name} has only ${item.stock} ${item.unit} remaining.`
    }))),
    ...(unpaidCount > 0 ? [{ id: 'unpaid', type: 'warning', message: `${unpaidCount} unpaid orders currently active. Total pending: GH₵ ${unpaidValue}.` }] : []),
    { id: 4, type: 'info', message: 'Staff Kofi Mensah achieved a 5-star rating on Table 02 feedback.' }
  ];

  const hoursLabels = ['11am', '12pm', '1pm', '2pm', '3pm', '4pm', '5pm', '6pm', '7pm', '8pm'];
  const maxHourValue = Math.max(...activePeriodData.peakHoursData, 1);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* CSS tooltip injection to simulate hover triggers on customized charts */}
      <style>{`
        div[group="true"]:hover .chart-tooltip {
          opacity: 1 !important;
        }
      `}</style>

      {/* Period Filter Selector */}
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        flexWrap: 'wrap', gap: 12, background: '#fff', padding: '12px 20px',
        borderRadius: 'var(--radius-md)', border: '1px solid var(--border)'
      }}>
        <div>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 18, color: 'var(--espresso)', margin: 0 }}>Reports & Analytics</h2>
          <p style={{ fontSize: 11, color: 'var(--text-muted)', margin: '2px 0 0 0' }}>Comprehensive sales, operations, and service insights</p>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <div style={{ display: 'flex', background: 'var(--cream)', borderRadius: 8, padding: 3, border: '1px solid var(--border)' }}>
            {[
              { id: 'today', label: 'Today' },
              { id: '7days', label: 'Last 7 Days' },
              { id: 'month', label: 'This Month' }
            ].map(t => (
              <button
                key={t.id}
                onClick={() => setPeriod(t.id)}
                style={{
                  border: 'none', background: period === t.id ? '#fff' : 'transparent',
                  color: period === t.id ? 'var(--terracotta)' : 'var(--text-secondary)',
                  fontWeight: period === t.id ? 700 : 500, fontSize: 12,
                  padding: '6px 14px', borderRadius: 6, cursor: 'pointer', transition: 'all 0.15s'
                }}
              >
                {t.label}
              </button>
            ))}
          </div>
          <button
            onClick={() => showNotification('Downloading PDF Report...', 'success')}
            style={{
              background: 'var(--terracotta-pale)', color: 'var(--terracotta)', border: 'none',
              borderRadius: 8, padding: '8px 14px', cursor: 'pointer', fontSize: 12,
              fontWeight: 600, fontFamily: 'var(--font-body)', display: 'flex', alignItems: 'center', gap: 6
            }}
          >
            Export PDF
          </button>
        </div>
      </div>

      {/* TOP ROW: KPIs */}
      <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : isTablet ? '1fr 1fr' : 'repeat(4, 1fr)', gap: 14 }}>
        {/* Sales */}
        <Card style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', height: 115 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 5 }}>
                <DollarSign size={13} style={{ color: 'var(--success)' }} /> TOTAL SALES
              </div>
              <div style={{ fontSize: 22, fontWeight: 700, color: 'var(--espresso)', fontFamily: 'var(--font-display)', marginTop: 4, whiteSpace: 'nowrap' }}>
                GH₵ {activePeriodData.sales.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
            </div>
            <Badge color={activePeriodData.trendingUp ? 'green' : 'red'}>
              {activePeriodData.trendingUp ? <TrendingUp size={10} style={{ display: 'inline', marginRight: 2 }} /> : <TrendingDown size={10} style={{ display: 'inline', marginRight: 2 }} />}
              {activePeriodData.trendingUp ? '▲' : '▼'}
            </Badge>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: 8 }}>
            <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>{activePeriodData.trendText}</span>
            <Sparkline data={activePeriodData.sparklineData} color="var(--success)" width={90} height={20} />
          </div>
        </Card>

        {/* Orders */}
        <Card style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', height: 115 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 5 }}>
                <ShoppingBag size={13} style={{ color: '#4A90D9' }} /> TOTAL ORDERS
              </div>
              <div style={{ fontSize: 24, fontWeight: 700, color: 'var(--espresso)', fontFamily: 'var(--font-display)', marginTop: 4 }}>
                {activePeriodData.ordersCount}
              </div>
            </div>
            <Badge color="blue">Orders</Badge>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 }}>
            <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>
              Dine In: <strong>{Math.round(activePeriodData.ordersCount * 0.75)}</strong> | Takeaway: <strong>{Math.round(activePeriodData.ordersCount * 0.25)}</strong>
            </div>
          </div>
        </Card>

        {/* Average Order Value */}
        <Card style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', height: 115 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 5 }}>
                <Activity size={13} style={{ color: '#C07830' }} /> AVG ORDER VALUE
              </div>
              <div style={{ fontSize: 22, fontWeight: 700, color: 'var(--espresso)', fontFamily: 'var(--font-display)', marginTop: 4, whiteSpace: 'nowrap' }}>
                GH₵ {activePeriodData.avgOrderValue.toFixed(2)}
              </div>
            </div>
            <Badge color="nude">+3.4%</Badge>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 }}>
            <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>Avg. items/basket: <strong>3.2</strong></span>
          </div>
        </Card>

        {/* Unpaid Orders */}
        <Card style={{
          padding: '16px 20px', display: 'flex', flexDirection: 'column',
          justifyContent: 'space-between', height: 115,
          border: unpaidCount > 0 ? '1.5px solid var(--warning)' : '1px solid var(--border)',
          background: unpaidCount > 0 ? 'var(--warning-bg)' : '#fff'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 5 }}>
                <AlertCircle size={13} style={{ color: unpaidCount > 0 ? 'var(--warning)' : 'var(--text-muted)' }} /> UNPAID ORDERS
              </div>
              <div style={{ fontSize: 24, fontWeight: 700, color: unpaidCount > 0 ? 'var(--warning)' : 'var(--espresso)', fontFamily: 'var(--font-display)', marginTop: 4 }}>
                {unpaidCount}
              </div>
            </div>
            {unpaidCount > 0 && <span style={{ width: 8, height: 8, borderRadius: 4, background: 'var(--warning)', animation: 'pulse 1.5s infinite' }} />}
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 }}>
            <span style={{ fontSize: 10, color: 'var(--text-secondary)' }}>
              Value: <strong>GH₵ {unpaidValue.toLocaleString()}</strong>
            </span>
          </div>
        </Card>
      </div>

      {/* SECOND ROW: Kitchen & Live Operations */}
      <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : isTablet ? '1fr 1fr' : 'repeat(4, 1fr)', gap: 14 }}>
        {/* Live Orders */}
        <Card style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', height: 105 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600 }}>LIVE ORDERS</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 10, color: 'var(--terracotta)', fontWeight: 700 }}>
              <span style={{ width: 6, height: 6, borderRadius: 3, background: 'var(--terracotta)', animation: 'pulse 1.5s infinite' }} />
              Active
            </span>
          </div>
          <div style={{ fontSize: 28, fontWeight: 700, color: 'var(--espresso)', fontFamily: 'var(--font-display)', margin: '4px 0' }}>
            {kdsOrders.length}
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: 'var(--text-muted)' }}>
            <span>New: <strong>{kdsOrders.filter(o => o.status === 'new').length}</strong></span>
            <span>Preparing: <strong>{kdsOrders.filter(o => o.status === 'preparing').length}</strong></span>
          </div>
        </Card>

        {/* Delayed Orders */}
        <Card style={{
          padding: '16px 20px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', height: 105,
          border: delayedCount > 0 ? '1.5px solid var(--terracotta)' : '1px solid var(--border)',
          background: delayedCount > 0 ? 'var(--terracotta-pale)' : '#fff'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600 }}>DELAYED ORDERS</span>
            {delayedCount > 0 && <span style={{ background: 'var(--terracotta)', color: '#fff', borderRadius: 4, padding: '1px 5px', fontSize: 9, fontWeight: 700 }}>CRITICAL</span>}
          </div>
          <div style={{ fontSize: 28, fontWeight: 700, color: delayedCount > 0 ? 'var(--terracotta)' : 'var(--espresso)', fontFamily: 'var(--font-display)', margin: '4px 0' }}>
            {delayedCount}
          </div>
          <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>
            {delayedCount > 0 ? 'Orders exceeding preparation target' : 'All kitchen targets on track'}
          </div>
        </Card>

        {/* Kitchen Average Cooking Time */}
        <Card style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', height: 105 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600 }}>KITCHEN AVG TIME</span>
            <Clock size={12} style={{ color: 'var(--text-muted)' }} />
          </div>
          <div style={{ fontSize: 28, fontWeight: 700, color: 'var(--espresso)', fontFamily: 'var(--font-display)', margin: '4px 0' }}>
            {avgKitchenTime} <span style={{ fontSize: 14, fontWeight: 500, fontFamily: 'var(--font-body)' }}>mins</span>
          </div>
          <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>
            Target benchmark: <strong>12.0 mins</strong>
          </div>
        </Card>

        {/* Ready Orders */}
        <Card style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', height: 105 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600 }}>READY ORDERS</span>
            <CheckCircle2 size={12} style={{ color: 'var(--success)' }} />
          </div>
          <div style={{ fontSize: 28, fontWeight: 700, color: 'var(--success)', fontFamily: 'var(--font-display)', margin: '4px 0' }}>
            {readyOrdersCount}
          </div>
          <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>
            Waiting to be served / picked up
          </div>
        </Card>
      </div>

      {/* THIRD ROW: Peak Hours, QR Performance, Top Selling Items */}
      <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : isTablet ? '3fr 2fr' : '3fr 2fr', gap: 16 }}>
        {/* Left panel: Peak Hours & QR performance */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Peak Hours SVG Chart */}
          <Card style={{ padding: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <div>
                <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 15, color: 'var(--espresso)', margin: 0 }}>Peak Order Hours</h3>
                <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Distribution of transaction volume throughout the day</span>
              </div>
              <Badge color="nude">Busiest: 1pm & 7pm</Badge>
            </div>

            {/* Responsive SVG Bar Chart */}
            <div style={{ position: 'relative', height: 140, display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', padding: '0 10px', borderBottom: '1px solid var(--border)' }}>
              {activePeriodData.peakHoursData.map((val, idx) => {
                const pctHeight = (val / maxHourValue) * 110;
                return (
                  <div key={idx} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', group: true }}>
                    {/* Bar */}
                    <div style={{
                      width: isMobile ? 12 : 24, height: Math.max(pctHeight, 4),
                      background: idx === 5 || idx === 6 ? 'linear-gradient(180deg, var(--terracotta), var(--terracotta-light))' : 'linear-gradient(180deg, var(--nude), var(--nude-light))',
                      borderRadius: '4px 4px 0 0', cursor: 'pointer', transition: 'all 0.25s',
                      position: 'relative'
                    }}>
                      {/* Tooltip on hover simulation */}
                      <div style={{
                        position: 'absolute', top: -30, left: '50%', transform: 'translateX(-50%)',
                        background: 'var(--espresso)', color: '#fff', padding: '3px 6px', borderRadius: 4,
                        fontSize: 9, fontWeight: 700, pointerEvents: 'none', whiteSpace: 'nowrap', opacity: 0,
                        transition: 'opacity 0.2s', boxShadow: '0 2px 5px rgba(0,0,0,0.2)'
                      }} className="chart-tooltip">
                        {val} orders
                      </div>
                    </div>
                    {/* Label */}
                    <span style={{ fontSize: 8, color: 'var(--text-muted)', marginTop: 6, marginBottom: -25 }}>
                      {hoursLabels[idx]}
                    </span>
                  </div>
                );
              })}
            </div>
            <div style={{ height: 25 }} /> {/* Spacer for labels */}
          </Card>

          {/* QR Ordering Performance */}
          <Card style={{ padding: 20 }}>
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 15, color: 'var(--espresso)', marginBottom: 14 }}>
              QR Table Ordering Performance
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)', gap: 14 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, background: 'var(--cream)', padding: 12, borderRadius: 10 }}>
                <DonutProgress percentage={activePeriodData.qrRate} color="var(--terracotta)" />
                <div>
                  <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>Scan conversion</div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--espresso)' }}>{activePeriodData.qrRate}% of guests</div>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', background: 'var(--cream)', padding: 12, borderRadius: 10 }}>
                <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>QR Order Count</div>
                <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--espresso)', marginTop: 4 }}>
                  {activePeriodData.qrCount} orders
                </div>
                <div style={{ fontSize: 9, color: 'var(--text-secondary)', marginTop: 2 }}>
                  Average ticket size: GH₵ {(activePeriodData.qrRevenue / activePeriodData.qrCount).toFixed(0)}
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', background: 'var(--cream)', padding: 12, borderRadius: 10 }}>
                <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>QR Total Revenue</div>
                <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--success)', marginTop: 4 }}>
                  GH₵ {activePeriodData.qrRevenue.toLocaleString()}
                </div>
                <div style={{ fontSize: 9, color: 'var(--text-secondary)', marginTop: 2 }}>
                  Most scans: <strong>Table 12</strong>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Right panel: Top Selling Items progress grid */}
        <Card style={{ padding: 20, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 15, color: 'var(--espresso)' }}>Top Selling Items</h3>
              <Badge color="nude">By volume</Badge>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {activePeriodData.topItems.map((item, idx) => {
                const maxCount = Math.max(...activePeriodData.topItems.map(i => i.count), 1);
                const pct = (item.count / maxCount) * 100;
                return (
                  <div key={idx}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, fontWeight: 600, color: 'var(--espresso)', marginBottom: 4 }}>
                      <span>{idx + 1}. {item.name}</span>
                      <span>{item.count} orders</span>
                    </div>
                    <div style={{ height: 6, background: 'var(--cream-dark)', borderRadius: 3, overflow: 'hidden' }}>
                      <div style={{
                        height: '100%', width: `${pct}%`,
                        background: idx === 0 ? 'var(--terracotta)' : idx === 1 ? 'var(--nude)' : 'var(--sand)',
                        borderRadius: 3
                      }} />
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 9, color: 'var(--text-muted)', marginTop: 3 }}>
                      <span>Volume Share: {Math.round(pct)}%</span>
                      <span>Revenue: GH₵ {item.revenue.toLocaleString()}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div style={{ borderTop: '1px solid var(--border)', paddingTop: 12, marginTop: 14, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>
              Highly popular item: <strong>Jollof Rice</strong>
            </div>
            <button
              onClick={() => showNotification('Opening Full Menu Performance...', 'info')}
              style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: 'var(--terracotta)', fontSize: 11, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 2 }}
            >
              Menu Report <ChevronRight size={12} />
            </button>
          </div>
        </Card>
      </div>

      {/* FOURTH ROW: Staff Activity, Customer Insights, Low Stock Alerts */}
      <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : isTablet ? '1fr 1fr' : 'repeat(3, 1fr)', gap: 16 }}>
        {/* Low Stock Alerts */}
        <Card style={{ padding: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 15, color: 'var(--espresso)' }}>Inventory Alerts</h3>
            <Badge color={activeLowStock.length > 0 ? 'red' : 'green'}>
              {activeLowStock.length} Alerts
            </Badge>
          </div>

          {activeLowStock.length === 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '24px 0', gap: 8 }}>
              <CheckCircle2 size={32} style={{ color: 'var(--success)' }} />
              <span style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 600 }}>All inventory items stocked!</span>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, maxHeight: 220, overflowY: 'auto' }}>
              {activeLowStock.map((item, idx) => (
                <div key={idx} style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  background: item.status === 'critical' ? 'var(--terracotta-pale)' : 'var(--warning-bg)',
                  padding: '8px 12px', borderRadius: 8, borderLeft: `3px solid ${item.status === 'critical' ? 'var(--terracotta)' : 'var(--warning)'}`
                }}>
                  <div>
                    <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--espresso)' }}>{item.name}</div>
                    <div style={{ fontSize: 10, color: 'var(--text-secondary)' }}>
                      Stock: <strong style={{ color: item.status === 'critical' ? 'var(--terracotta)' : 'var(--warning)' }}>{item.stock} {item.unit}</strong> (Min: {item.threshold})
                    </div>
                  </div>
                  <button
                    onClick={() => handleRestock(item.id, item.name)}
                    style={{
                      background: '#fff', border: '1px solid var(--border)', borderRadius: 6,
                      padding: '4px 8px', fontSize: 10, fontWeight: 700, cursor: 'pointer',
                      color: 'var(--espresso)', transition: 'all 0.15s'
                    }}
                    onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--terracotta)'}
                    onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
                  >
                    Restock
                  </button>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Staff Activity */}
        <Card style={{ padding: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 15, color: 'var(--espresso)' }}>Staff Status</h3>
            <Badge color="blue">Roster</Badge>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxHeight: 220, overflowY: 'auto' }}>
            {staffList.slice(0, 4).map((s, idx) => (
              <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 0', borderBottom: idx < 3 ? '1px solid var(--border)' : 'none' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{
                    width: 8, height: 8, borderRadius: 4,
                    background: s.status === 'Active' ? 'var(--success)' : s.status === 'Break' ? 'var(--warning)' : 'var(--text-muted)'
                  }} />
                  <div>
                    <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--espresso)' }}>{s.name}</div>
                    <div style={{ fontSize: 9, color: 'var(--text-muted)' }}>{s.role} · {s.activeTable}</div>
                  </div>
                </div>
                <button
                  onClick={() => toggleStaffStatus(s.id, s.status)}
                  style={{
                    border: 'none', background: 'transparent', cursor: 'pointer',
                    fontSize: 10, fontWeight: 700, color: 'var(--text-secondary)',
                    padding: '2px 6px', borderRadius: 4, textDecoration: 'underline'
                  }}
                >
                  Change
                </button>
              </div>
            ))}
          </div>
        </Card>

        {/* Customer Insights */}
        <Card style={{ padding: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 15, color: 'var(--espresso)' }}>Customer Insights</h3>
            <div style={{ display: 'flex', alignItems: 'center', gap: 3, color: '#F1C40F' }}>
              <Star size={12} fill="#F1C40F" />
              <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--espresso)' }}>4.8</span>
            </div>
          </div>

          <div style={{ background: 'var(--cream)', borderRadius: 10, padding: 12, display: 'flex', flexDirection: 'column', gap: 8 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: 'var(--text-secondary)' }}>
              <span>Repeat Guests</span><strong style={{ color: 'var(--success)' }}>34%</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: 'var(--text-secondary)' }}>
              <span>Avg Rating (QR)</span><strong>4.9/5 stars</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: 'var(--text-secondary)' }}>
              <span>Service Index</span><strong>96% positive</strong>
            </div>
          </div>

          <div style={{ marginTop: 10, fontSize: 10, color: 'var(--text-secondary)', fontStyle: 'italic', borderLeft: '2px solid var(--nude)', paddingLeft: 8 }}>
            "Jollof was absolutely incredible and the table QR payment was super smooth. Kwame was a great server!"
          </div>
        </Card>
      </div>

      {/* BOTTOM SECTION: Recent Orders + Attention Alerts */}
      <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : isTablet ? '1fr' : '5fr 3fr', gap: 16 }}>
        {/* Recent Orders */}
        <Card style={{ padding: 20, maxWidth: '100%', overflow: 'hidden' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 15, color: 'var(--espresso)' }}>Recent Sales Transactions</h3>
          </div>

          <div style={{ overflowX: 'auto', width: '100%' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12, textAlign: 'left', minWidth: 600 }}>
            <thead>
              <tr style={{ borderBottom: '1.5px solid var(--border)' }}>
                <th style={{ padding: '8px 4px', color: 'var(--text-muted)' }}>ID</th>
                <th style={{ padding: '8px 4px', color: 'var(--text-muted)' }}>Table/Type</th>
                <th style={{ padding: '8px 4px', color: 'var(--text-muted)' }}>Items</th>
                <th style={{ padding: '8px 4px', color: 'var(--text-muted)' }}>Total</th>
                <th style={{ padding: '8px 4px', color: 'var(--text-muted)' }}>Status</th>
                <th style={{ padding: '8px 4px', color: 'var(--text-muted)', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {orderHistory.slice(0, 5).map((order) => (
                <tr key={order.id} style={{ borderBottom: '1px solid var(--border)' }}>
                  <td style={{ padding: '10px 4px', fontWeight: 700 }}>#{order.id}</td>
                  <td style={{ padding: '10px 4px' }}>
                    <span style={{ fontSize: 10, display: 'block', fontWeight: 600 }}>{order.table}</span>
                    <span style={{ fontSize: 8, color: 'var(--text-muted)' }}>{order.type}</span>
                  </td>
                  <td style={{ padding: '10px 4px', color: 'var(--text-secondary)', maxWidth: 150, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {Array.isArray(order.items) ? order.items.join(', ') : order.items}
                  </td>
                  <td style={{ padding: '10px 4px', fontWeight: 700 }}>GH₵ {order.total}</td>
                  <td style={{ padding: '10px 4px' }}>
                    <Badge color={order.payment === 'Paid' ? 'green' : 'amber'}>
                      {order.payment}
                    </Badge>
                  </td>
                  <td style={{ padding: '10px 4px', textAlign: 'right' }}>
                    <button
                      onClick={() => setSelectedOrderDetails(order)}
                      style={{ background: 'var(--cream)', border: 'none', borderRadius: 4, padding: '4px 8px', fontSize: 10, cursor: 'pointer', fontWeight: 600, color: 'var(--espresso)' }}
                    >
                      Detail
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
            </table>
          </div>
        </Card>

        {/* Attention Alerts Log */}
        <Card style={{ padding: 20 }}>
          <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 15, color: 'var(--espresso)', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
            <AlertCircle size={16} style={{ color: 'var(--terracotta)' }} /> Attention Log
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {alertsList.map((alert) => (
              <div key={alert.id} style={{
                display: 'flex', gap: 8, padding: '10px 12px', borderRadius: 8,
                background: alert.type === 'danger' ? 'var(--terracotta-pale)' : alert.type === 'warning' ? 'var(--warning-bg)' : '#E8F0FE',
                border: `1px solid ${alert.type === 'danger' ? 'rgba(192, 69, 42, 0.2)' : alert.type === 'warning' ? 'rgba(192, 120, 48, 0.2)' : 'rgba(26, 86, 160, 0.1)'}`
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {alert.type === 'danger' ? <AlertCircle size={14} style={{ color: 'var(--terracotta)' }} /> : alert.type === 'warning' ? <AlertTriangle size={14} style={{ color: 'var(--warning)' }} /> : <Info size={14} style={{ color: '#1A56A0' }} />}
                </div>
                <div style={{ fontSize: 11, color: 'var(--text-primary)', lineHeight: 1.4 }}>
                  {alert.message}
                </div>
              </div>
            ))}
          </div>
        </Card>
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
