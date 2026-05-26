import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Card, Badge, useViewport } from '../components/Shared';
import {
  Users, ShoppingBag, AlertOctagon, Clock, ClipboardList, ShieldAlert,
  TrendingUp, Sparkles, Plus, Shield, Check, X, UserCheck, Timer
} from 'lucide-react';

export default function StaffScreen() {
  const { showNotification, orderHistory } = useApp();
  const { isMobile, isTablet } = useViewport();

  // 1. Staff roster state
  const [staffList, setStaffList] = useState([
    { id: 1, name: 'Kwame Asante', role: 'Owner', status: 'Active', orders: 8, rating: 5.0, speed: '—' },
    { id: 2, name: 'Esi Boateng', role: 'Manager', status: 'Active', orders: 18, rating: 4.8, speed: '9.2 min' },
    { id: 3, name: 'Kojo Mensah', role: 'Cashier', status: 'Active', orders: 24, rating: 4.7, speed: '6.4 min' },
    { id: 4, name: 'Ama Osei', role: 'Server', status: 'Active', orders: 28, rating: 4.9, speed: '8.1 min' },
    { id: 5, name: 'Yaw Addo', role: 'Kitchen Staff', status: 'Break', orders: 15, rating: 4.7, speed: '11.8 min' },
    { id: 6, name: 'Kweku Appiah', role: 'Server', status: 'Offline', orders: 4, rating: 4.5, speed: '10.5 min' }
  ]);

  // 2. Timeline activity audit log state
  const [activities, setActivities] = useState([
    { time: '08:10 PM', member: 'Kojo Mensah', text: 'applied discount to Order #1048' },
    { time: '08:02 PM', member: 'Esi Boateng', text: 'cancelled item on Order #1036' },
    { time: '07:55 PM', member: 'Ama Osei', text: 'edited Order #1042: added Sobolo' },
    { time: '07:50 PM', member: 'Esi Boateng', text: 'marked Order #1039 as ready' },
    { time: '07:45 PM', member: 'Kojo Mensah', text: 'marked Order #1040 as paid cash' },
    { time: '07:42 PM', member: 'Ama Osei', text: 'created Order #1042, Table 05' }
  ]);

  // 3. Exceptions review log state
  const [exceptions, setExceptions] = useState([
    { id: 1, staff: 'Kojo Mensah', action: 'Void Item', order: 'Order #1036', amount: 'GH₵ 45', reason: 'Customer changed mind after cooking started' },
    { id: 2, staff: 'Yaw Addo', action: 'Waste Logged', order: 'Order #1039', amount: 'GH₵ 80', reason: 'Tilapia burnt in grill' },
    { id: 3, staff: 'Kojo Mensah', action: 'Manual Discount', order: 'Order #1048', amount: 'GH₵ 20', reason: 'Goodwill discount for loyal QR guest' },
    { id: 4, staff: 'Esi Boateng', action: 'Cancel Transaction', order: 'Order #1021', amount: 'GH₵ 120', reason: 'Billing correction (double entered)' }
  ]);

  // 4. Role Permissions state matrix
  const [permissions, setPermissions] = useState({
    'Owner': { menu: true, sales: true, voids: true, offline: true, settings: true },
    'Manager': { menu: true, sales: true, voids: true, offline: true, settings: false },
    'Cashier': { menu: false, sales: false, voids: true, offline: true, settings: false },
    'Server': { menu: false, sales: false, voids: false, offline: true, settings: false },
    'Kitchen Staff': { menu: false, sales: false, voids: false, offline: false, settings: false },
  });

  // Derived statistics
  const activeStaffCount = staffList.filter(s => s.status === 'Active').length;
  const totalOrdersTaken = staffList.reduce((sum, s) => sum + s.orders, 0);
  const totalVoids = exceptions.filter(e => e.action.includes('Void') || e.action.includes('Cancel')).length;
  const openUnpaidOrdersCount = orderHistory.filter(o => o.payment === 'Pending').length;

  // Cycle Status handler
  const cycleStatus = (id, name, currentStatus) => {
    const nextStatus = currentStatus === 'Active' ? 'Break' : currentStatus === 'Break' ? 'Offline' : 'Active';
    setStaffList(prev => prev.map(s => s.id === id ? { ...s, status: nextStatus } : s));
    showNotification(`Status for ${name} changed to ${nextStatus}`, 'success');
  };

  // Promote/Demote Role Handler
  const changeRole = (id, name, currentRole) => {
    const roles = ['Server', 'Cashier', 'Kitchen Staff', 'Manager'];
    const nextIdx = (roles.indexOf(currentRole) + 1) % roles.length;
    const nextRole = nextIdx === -1 ? 'Server' : roles[nextIdx];
    
    setStaffList(prev => prev.map(s => s.id === id && s.role !== 'Owner' ? { ...s, role: nextRole } : s));
    showNotification(`Updated ${name}'s role to ${nextRole}`, 'info');
  };

  // Toggle permission handler
  const togglePermission = (role, permKey) => {
    if (role === 'Owner') return; // Owner cannot be restricted
    setPermissions(prev => {
      const currentVal = prev[role][permKey];
      const updated = {
        ...prev,
        [role]: {
          ...prev[role],
          [permKey]: !currentVal
        }
      };
      showNotification(`Updated ${role} permission for ${permKey.toUpperCase()} to ${!currentVal ? 'ALLOWED' : 'DENIED'}`, 'info');
      return updated;
    });
  };

  // Simulate recent activity trigger
  const triggerSimulation = () => {
    const staffNames = ['Ama Osei', 'Kojo Mensah', 'Esi Boateng', 'Yaw Addo', 'Kweku Appiah'];
    const actions = [
      { text: 'created Order #1049, Table 03', type: 'info' },
      { text: 'processed MoMo payment for Order #1042', type: 'payment' },
      { text: 'marked Order #1042 as ready', type: 'kds' },
      { text: 'started afternoon shift roster', type: 'roster' },
      { text: 'logged kitchen waste entry for Perfume Rice', type: 'waste' }
    ];

    const randomStaff = staffNames[Math.floor(Math.random() * staffNames.length)];
    const randomAction = actions[Math.floor(Math.random() * actions.length)];

    const now = new Date();
    const timeString = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });

    // Update activities list
    setActivities(prev => [{ time: timeString, member: randomStaff, text: randomAction.text }, ...prev.slice(0, 10)]);

    // If simulated waste, add to exception logs to demonstrate full integration
    if (randomAction.type === 'waste') {
      const newException = {
        id: Date.now(),
        staff: randomStaff,
        action: 'Waste Logged',
        order: 'Order #1049',
        amount: 'GH₵ 60',
        reason: 'Rice prepared excess spoilage'
      };
      setExceptions(prev => [newException, ...prev]);
    }

    // Increment order count for that staff if they took/made an order
    if (randomAction.text.includes('created')) {
      setStaffList(prev => prev.map(s => s.name === randomStaff ? { ...s, orders: s.orders + 1 } : s));
    }

    showNotification(`Simulated: ${randomStaff} ${randomAction.text}`, 'success');
  };

  // Resolve exception action
  const resolveException = (id, actionName) => {
    setExceptions(prev => prev.filter(e => e.id !== id));
    showNotification(`Approved exception audit logs for ${actionName}`, 'success');
  };

  const statusColors = {
    'Active': 'green',
    'Break': 'amber',
    'Offline': 'nude'
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Header Panel */}
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        flexWrap: 'wrap', gap: 12, background: '#fff', padding: '12px 20px',
        borderRadius: 'var(--radius-md)', border: '1px solid var(--border)'
      }}>
        <div>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 18, color: 'var(--espresso)', margin: 0 }}>Staff & Operations Console</h2>
          <p style={{ fontSize: 11, color: 'var(--text-muted)', margin: '2px 0 0 0' }}>Monitor active shifts, audit actions, review void exceptions, and set permissions</p>
        </div>
        <button
          onClick={triggerSimulation}
          style={{
            background: 'var(--terracotta)', color: '#fff', border: 'none',
            borderRadius: 8, padding: '10px 16px', cursor: 'pointer', fontSize: 12,
            fontWeight: 600, fontFamily: 'var(--font-body)', display: 'flex', alignItems: 'center', gap: 6
          }}
        >
          <Plus size={14} /> Simulate Activity
        </button>
      </div>

      {/* OVERVIEW CARDS */}
      <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : isTablet ? '1fr 1fr' : 'repeat(5, 1fr)', gap: 14 }}>
        {/* Active Staff */}
        <Card style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 38, height: 38, borderRadius: 8, background: 'var(--success-bg)', color: 'var(--success)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Users size={18} />
          </div>
          <div>
            <div style={{ fontSize: 9, color: 'var(--text-muted)', fontWeight: 600, letterSpacing: '0.04em' }}>ACTIVE TODAY</div>
            <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--espresso)', fontFamily: 'var(--font-display)', marginTop: 2 }}>{activeStaffCount} / {staffList.length}</div>
          </div>
        </Card>

        {/* Orders Taken */}
        <Card style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 38, height: 38, borderRadius: 8, background: '#EEF4FC', color: '#1A56A0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <ShoppingBag size={18} />
          </div>
          <div>
            <div style={{ fontSize: 9, color: 'var(--text-muted)', fontWeight: 600, letterSpacing: '0.04em' }}>ORDERS TAKEN</div>
            <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--espresso)', fontFamily: 'var(--font-display)', marginTop: 2 }}>{totalOrdersTaken} shift</div>
          </div>
        </Card>

        {/* Voids & Cancellations */}
        <Card style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 12, border: totalVoids > 0 ? '1.5px solid var(--terracotta)' : '1px solid var(--border)' }}>
          <div style={{ width: 38, height: 38, borderRadius: 8, background: 'var(--terracotta-pale)', color: 'var(--terracotta)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <AlertOctagon size={18} />
          </div>
          <div>
            <div style={{ fontSize: 9, color: 'var(--text-muted)', fontWeight: 600, letterSpacing: '0.04em' }}>VOIDS / CANCELS</div>
            <div style={{ fontSize: 18, fontWeight: 700, color: totalVoids > 0 ? 'var(--terracotta)' : 'var(--espresso)', fontFamily: 'var(--font-display)', marginTop: 2 }}>{totalVoids} logged</div>
          </div>
        </Card>

        {/* Open Unpaid Orders */}
        <Card style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 38, height: 38, borderRadius: 8, background: 'var(--warning-bg)', color: 'var(--warning)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <ClipboardList size={18} />
          </div>
          <div>
            <div style={{ fontSize: 9, color: 'var(--text-muted)', fontWeight: 600, letterSpacing: '0.04em' }}>UNPAID ACTIVE</div>
            <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--espresso)', fontFamily: 'var(--font-display)', marginTop: 2 }}>{openUnpaidOrdersCount} orders</div>
          </div>
        </Card>

        {/* Avg Response Time */}
        <Card style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 38, height: 38, borderRadius: 8, background: 'var(--cream)', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Clock size={18} />
          </div>
          <div>
            <div style={{ fontSize: 9, color: 'var(--text-muted)', fontWeight: 600, letterSpacing: '0.04em' }}>AVG SERVICE TIME</div>
            <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--espresso)', fontFamily: 'var(--font-display)', marginTop: 2 }}>9.2 mins</div>
          </div>
        </Card>
      </div>

      {/* STAFF LIST TABLE & TIMELINE LOG */}
      <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '5fr 3fr', gap: 16 }}>
        {/* Staff Table */}
        <Card style={{ padding: 20, maxWidth: '100%', overflow: 'hidden' }}>
          <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 15, color: 'var(--espresso)', marginBottom: 14 }}>Staff Shift Roster</h3>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12, textAlign: 'left', minWidth: 600 }}>
              <thead>
                <tr style={{ borderBottom: '1.5px solid var(--border)', color: 'var(--text-muted)' }}>
                  <th style={{ padding: '8px 4px' }}>Staff Name</th>
                  <th style={{ padding: '8px 4px' }}>Role</th>
                  <th style={{ padding: '8px 4px' }}>Status</th>
                  <th style={{ padding: '8px 4px' }}>Orders Today</th>
                  <th style={{ padding: '8px 4px' }}>Avg Handling</th>
                  <th style={{ padding: '8px 4px', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {staffList.map(s => (
                  <tr key={s.id} style={{ borderBottom: '1px solid var(--border)' }}>
                    <td style={{ padding: '10px 4px', fontWeight: 600 }}>{s.name}</td>
                    <td style={{ padding: '10px 4px' }}>
                      <button
                        onClick={() => s.role !== 'Owner' && changeRole(s.id, s.name, s.role)}
                        disabled={s.role === 'Owner'}
                        style={{
                          background: 'none', border: 'none', cursor: s.role === 'Owner' ? 'default' : 'pointer',
                          color: 'var(--espresso)', fontWeight: 500, fontSize: 12, padding: 0,
                          textDecoration: s.role === 'Owner' ? 'none' : 'underline'
                        }}
                      >
                        {s.role}
                      </button>
                    </td>
                    <td style={{ padding: '10px 4px' }}>
                      <Badge color={statusColors[s.status]}>{s.status}</Badge>
                    </td>
                    <td style={{ padding: '10px 4px', fontWeight: 600 }}>{s.orders}</td>
                    <td style={{ padding: '10px 4px' }}>{s.speed}</td>
                    <td style={{ padding: '10px 4px', textAlign: 'right' }}>
                      <button
                        onClick={() => cycleStatus(s.id, s.name, s.status)}
                        style={{
                          background: 'var(--cream)', border: 'none', borderRadius: 4,
                          padding: '4px 8px', fontSize: 10, cursor: 'pointer',
                          fontWeight: 700, color: 'var(--espresso)', transition: 'all 0.15s'
                        }}
                      >
                        Toggle Status
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Live Timeline Audit Log */}
        <Card style={{ padding: 20, display: 'flex', flexDirection: 'column', maxWidth: '100%', overflow: 'hidden' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 15, color: 'var(--espresso)', margin: 0 }}>Roster Activity Timeline</h3>
            <span style={{ fontSize: 9, background: 'var(--terracotta-pale)', color: 'var(--terracotta)', padding: '2px 8px', borderRadius: 10, fontWeight: 700 }}>LIVE AUDIT</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 14, flex: 1, maxHeight: 310, overflowY: 'auto' }}>
            {activities.map((act, idx) => (
              <div key={idx} style={{ display: 'flex', gap: 10, alignItems: 'flex-start', borderLeft: '1.5px solid var(--border)', paddingLeft: 12, marginLeft: 6, position: 'relative' }}>
                {/* Dot */}
                <div style={{
                  position: 'absolute', left: -4, top: 4, width: 7, height: 7, borderRadius: 4,
                  background: idx === 0 ? 'var(--terracotta)' : 'var(--border)'
                }} />
                <div>
                  <div style={{ fontSize: 9, color: 'var(--text-muted)', fontWeight: 600 }}>{act.time}</div>
                  <div style={{ fontSize: 11, color: 'var(--espresso)', marginTop: 2 }}>
                    <strong>{act.member}</strong> {act.text}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* EXCEPTIONS & STAFF PERFORMANCE INSIGHTS */}
      <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '5fr 3fr', gap: 16 }}>
        {/* Exceptions Log Table */}
        <Card style={{ padding: 20, maxWidth: '100%', overflow: 'hidden' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 15, color: 'var(--espresso)', margin: 0, display: 'flex', alignItems: 'center', gap: 6 }}>
              <ShieldAlert size={16} style={{ color: 'var(--terracotta)' }} /> Exceptions & Review Log
            </h3>
            <Badge color="amber">Risk Tracking</Badge>
          </div>

          {exceptions.length === 0 ? (
            <div style={{ padding: '32px 0', textCenter: 'center', color: 'var(--text-muted)', fontSize: 12, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
              <Check size={28} style={{ color: 'var(--success)' }} /> All exceptions reviewed and approved!
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12, textAlign: 'left', minWidth: 650 }}>
                <thead>
                  <tr style={{ borderBottom: '1.5px solid var(--border)', color: 'var(--text-muted)' }}>
                    <th style={{ padding: '8px 4px' }}>Staff</th>
                    <th style={{ padding: '8px 4px' }}>Action Type</th>
                    <th style={{ padding: '8px 4px' }}>Order ID</th>
                    <th style={{ padding: '8px 4px' }}>Amount</th>
                    <th style={{ padding: '8px 4px' }}>Reason / Rationale</th>
                    <th style={{ padding: '8px 4px', textAlign: 'right' }}>Audit</th>
                  </tr>
                </thead>
                <tbody>
                  {exceptions.map(e => (
                    <tr key={e.id} style={{ borderBottom: '1px solid var(--border)' }}>
                      <td style={{ padding: '10px 4px', fontWeight: 600 }}>{e.staff}</td>
                      <td style={{ padding: '10px 4px' }}>
                        <Badge color={e.action.includes('Void') || e.action.includes('Cancel') ? 'red' : 'amber'}>
                          {e.action}
                        </Badge>
                      </td>
                      <td style={{ padding: '10px 4px', fontWeight: 700 }}>{e.order}</td>
                      <td style={{ padding: '10px 4px', color: 'var(--terracotta)', fontWeight: 700 }}>{e.amount}</td>
                      <td style={{ padding: '10px 4px', color: 'var(--text-secondary)', maxWidth: 220, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={e.reason}>{e.reason}</td>
                      <td style={{ padding: '10px 4px', textAlign: 'right' }}>
                        <button
                          onClick={() => resolveException(e.id, e.action)}
                          style={{
                            background: 'var(--cream)', border: 'none', borderRadius: 4,
                            padding: '4px 8px', fontSize: 10, cursor: 'pointer',
                            fontWeight: 700, color: 'var(--espresso)'
                          }}
                        >
                          Approve
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>

        {/* Staff Insights */}
        <Card style={{
          padding: 20,
          background: 'linear-gradient(135deg, rgba(44, 24, 16, 0.03), rgba(192, 69, 42, 0.03))',
          border: '1.5px solid var(--nude)',
          display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
          maxWidth: '100%', overflow: 'hidden'
        }}>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 15, color: 'var(--espresso)', margin: 0, display: 'flex', alignItems: 'center', gap: 6 }}>
                <Sparkles size={16} style={{ color: 'var(--terracotta)' }} /> Performance Insights
              </h3>
              <Badge color="blue">Operations</Badge>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                <Timer size={16} style={{ color: 'var(--success)', marginTop: 2, flexShrink: 0 }} />
                <div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--espresso)' }}>Fastest Order Handling</div>
                  <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginTop: 2 }}>
                    <strong>Kojo Mensah</strong> processed checkouts in <strong>6.4 min</strong> average time, followed by Esi Boateng at 9.2 min.
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                <TrendingUp size={16} style={{ color: '#1A56A0', marginTop: 2, flexShrink: 0 }} />
                <div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--espresso)' }}>Most Orders Processed</div>
                  <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginTop: 2 }}>
                    <strong>Ama Osei</strong> leads the team with <strong>28 orders</strong> handled today (sales total GH₵ 1,240).
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                <AlertOctagon size={16} style={{ color: 'var(--terracotta)', marginTop: 2, flexShrink: 0 }} />
                <div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--espresso)' }}>Highest Void Count</div>
                  <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginTop: 2 }}>
                    <strong>Kojo Mensah</strong> logged <strong>2 voids</strong> amounting to GH₵ 65. Reasons cited were ordering errors.
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div style={{
            marginTop: 18, borderTop: '1px dashed var(--border)', paddingTop: 12,
            fontSize: 10, color: 'var(--text-muted)', lineHeight: 1.4, display: 'flex', alignItems: 'center', gap: 4
          }}>
            <Clock size={11} /> Avg response time: <strong>9.2 mins</strong> (within 12 min benchmark)
          </div>
        </Card>
      </div>

      {/* ROLE PERMISSIONS GRID */}
      <Card style={{ padding: 20, maxWidth: '100%', overflow: 'hidden' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
          <div>
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 15, color: 'var(--espresso)', margin: 0, display: 'flex', alignItems: 'center', gap: 6 }}>
              <Shield size={16} style={{ color: 'var(--terracotta)' }} /> Role Authorization Permissions Matrix
            </h3>
            <p style={{ fontSize: 11, color: 'var(--text-muted)', margin: '2px 0 0' }}>Configure access rights. Owner credentials have full system privileges.</p>
          </div>
          <Badge color="green">Security Roster</Badge>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12, textAlign: 'left', minWidth: 650 }}>
            <thead>
              <tr style={{ borderBottom: '1.5px solid var(--border)', color: 'var(--text-muted)' }}>
                <th style={{ padding: '8px 4px', width: '30%' }}>System Capability</th>
                {Object.keys(permissions).map(role => (
                  <th key={role} style={{ padding: '8px 4px', textCenter: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      <UserCheck size={11} style={{ color: 'var(--text-secondary)' }} /> {role}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[
                { key: 'menu', label: 'Modify Menu Items & Pricing' },
                { key: 'sales', label: 'View Analytics & Sales Reports' },
                { key: 'voids', label: 'Authorize Voids, Cancellations & Discounts' },
                { key: 'offline', label: 'Access Offline Cache & Sync Queues' },
                { key: 'settings', label: 'Modify Store Profile & Taxes Settings' }
              ].map(perm => (
                <tr key={perm.key} style={{ borderBottom: '1px solid var(--border)' }}>
                  <td style={{ padding: '12px 4px', fontWeight: 600 }}>{perm.label}</td>
                  {Object.keys(permissions).map(role => {
                    const allowed = permissions[role][perm.key];
                    const isDisabled = role === 'Owner';
                    return (
                      <td key={role} style={{ padding: '12px 4px' }}>
                        <label style={{ display: 'flex', alignItems: 'center', cursor: isDisabled ? 'not-allowed' : 'pointer' }}>
                          <input
                            type="checkbox"
                            checked={allowed}
                            disabled={isDisabled}
                            onChange={() => togglePermission(role, perm.key)}
                            style={{
                              accentColor: 'var(--terracotta)',
                              cursor: isDisabled ? 'not-allowed' : 'pointer',
                              width: 14, height: 14
                            }}
                          />
                          <span style={{
                            fontSize: 10, marginLeft: 6, fontWeight: 600,
                            color: allowed ? 'var(--success)' : 'var(--text-muted)'
                          }}>
                            {allowed ? 'Allowed' : 'Denied'}
                          </span>
                        </label>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
