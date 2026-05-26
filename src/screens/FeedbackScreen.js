import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Card, Badge, useViewport } from '../components/Shared';
import {
  MessageSquare, AlertCircle, AlertTriangle, CheckCircle, Clock, Link,
  ChevronRight, Sparkles, User, Info, ThumbsUp, X, Save, RefreshCw,
  ShoppingBag, ClipboardList, HelpCircle
} from 'lucide-react';

export default function FeedbackScreen() {
  const { showNotification, orderHistory } = useApp();
  const { isMobile, isTablet } = useViewport();

  // 1. Initial State for Feedback Tickets
  const [tickets, setTickets] = useState([
    {
      id: 'T-101',
      source: 'Table QR',
      table: 'Table 04',
      customer: 'Abena Koomson',
      issue: 'Jollof Rice is too spicy, requested a mild replacement',
      priority: 'High',
      status: 'Open',
      orderId: 1010,
      assignee: 'Kofi Mensah',
      timeline: [
        { time: '12:15 PM', text: 'Guest submitted feedback via Table 04 QR' }
      ]
    },
    {
      id: 'T-102',
      source: 'Table QR',
      table: 'Table 02',
      customer: 'Emmanuel Osei',
      issue: 'Ordered Sobolo drink but received fresh orange juice',
      priority: 'Medium',
      status: 'Assigned',
      orderId: 1013,
      assignee: 'Ama Osei',
      timeline: [
        { time: '12:20 PM', text: 'Guest logged complaint on Table 02 QR' },
        { time: '12:22 PM', text: 'Assigned to server Ama Osei' }
      ]
    },
    {
      id: 'T-103',
      source: 'Web Feedback',
      table: 'Takeaway',
      customer: 'Sherifa Bello',
      issue: 'Takeaway soup container was leaking sauce inside paper bag',
      priority: 'Low',
      status: 'Resolved',
      orderId: 1011,
      assignee: 'Kojo Mensah',
      resolutionNote: 'Offered free Kelewele side order on next visit, guest satisfied.',
      timeline: [
        { time: '11:50 AM', text: 'Guest feedback logged via email link' },
        { time: '11:55 AM', text: 'Resolved by Kojo Mensah' }
      ]
    },
    {
      id: 'T-104',
      source: 'Table QR',
      table: 'Table 08',
      customer: 'Kwame Mensah Jr.',
      issue: 'Waakye arrived cold, requested to reheat or replace the egg',
      priority: 'Urgent',
      status: 'Open',
      orderId: 1012,
      assignee: 'Unassigned',
      timeline: [
        { time: '12:35 PM', text: 'Guest submitted critical food temperature alert' }
      ]
    }
  ]);

  // Selected ticket for resolution drawer
  const [selectedTicket, setSelectedTicket] = useState(null);
  
  // Selected order details for popup overlay
  const [selectedOrderDetails, setSelectedOrderDetails] = useState(null);

  // Form states for resolution drawer
  const [resolutionText, setResolutionText] = useState('');
  const [ticketAssignee, setTicketAssignee] = useState('Ama Osei');

  // Overview Counts
  const openCount = tickets.filter(t => t.status !== 'Resolved').length;
  const resolvedCount = tickets.filter(t => t.status === 'Resolved').length;
  const urgentCount = tickets.filter(t => t.priority === 'Urgent' && t.status !== 'Resolved').length;

  // Render CSAT percentage circle helper
  const DonutProgress = ({ percentage, color = 'var(--terracotta)', size = 56, strokeWidth = 5 }) => {
    const radius = (size - strokeWidth) / 2;
    const circumference = radius * 2 * Math.PI;
    const strokeDashoffset = circumference - (percentage / 100) * circumference;

    return (
      <div style={{ position: 'relative', width: size, height: size, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
          <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="var(--border)" strokeWidth={strokeWidth} />
          <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke={color} strokeWidth={strokeWidth}
            strokeDasharray={circumference} strokeDashoffset={strokeDashoffset} strokeLinecap="round" style={{ transition: 'stroke-dashoffset 0.35s' }} />
        </svg>
        <span style={{ position: 'absolute', fontSize: 11, fontWeight: 700, color: 'var(--espresso)' }}>
          {percentage}%
        </span>
      </div>
    );
  };

  // Inspect order details trigger
  const inspectOrder = (orderId) => {
    const order = orderHistory.find(o => o.id === orderId);
    if (order) {
      setSelectedOrderDetails(order);
    } else {
      // Create a mock order structure in case it's not found in active orderHistory
      setSelectedOrderDetails({
        id: orderId,
        table: 'Table 04',
        type: 'Dine In',
        items: ['Jollof Rice x1', 'Grilled Chicken x1'],
        total: 65,
        payment: 'Paid',
        placedAt: '12:15 PM'
      });
    }
  };

  // Select ticket handler
  const openTicketDrawer = (ticket) => {
    setSelectedTicket(ticket);
    setResolutionText(ticket.resolutionNote || '');
    setTicketAssignee(ticket.assignee === 'Unassigned' ? 'Ama Osei' : ticket.assignee);
  };

  // Save ticket changes
  const saveTicketResolution = (newStatus) => {
    const timeString = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
    
    setTickets(prev => prev.map(t => {
      if (t.id === selectedTicket.id) {
        const statusChanged = t.status !== newStatus;
        const assigneeChanged = t.assignee !== ticketAssignee;
        
        let newTimeline = [...t.timeline];
        if (assigneeChanged) {
          newTimeline.push({ time: timeString, text: `Assigned to ${ticketAssignee}` });
        }
        if (statusChanged) {
          newTimeline.push({ time: timeString, text: `Status updated to ${newStatus}` });
        }

        return {
          ...t,
          status: newStatus,
          assignee: ticketAssignee,
          resolutionNote: newStatus === 'Resolved' ? resolutionText : t.resolutionNote,
          timeline: newTimeline
        };
      }
      return t;
    }));

    showNotification(`Ticket ${selectedTicket.id} marked as ${newStatus}`, 'success');
    setSelectedTicket(null);
  };

  // Priority Styles mapping
  const priorityColors = {
    'Low': 'blue',
    'Medium': 'nude',
    'High': 'amber',
    'Urgent': 'red'
  };

  // Status Styles mapping
  const statusColors = {
    'Open': 'red',
    'Assigned': 'amber',
    'Resolved': 'green'
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
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 18, color: 'var(--espresso)', margin: 0 }}>Guest Feedback & Incident Roster</h2>
          <p style={{ fontSize: 11, color: 'var(--text-muted)', margin: '2px 0 0 0' }}>Trace guest satisfaction, track resolutions, review service voids, and link table complaints</p>
        </div>
        <Badge color="red">{openCount} Active Tickets</Badge>
      </div>

      {/* OVERVIEW CARDS */}
      <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : isTablet ? '1fr 1fr' : 'repeat(5, 1fr)', gap: 14 }}>
        {/* Open Tickets */}
        <Card style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 12, border: openCount > 0 ? '1.5px solid var(--terracotta)' : '1px solid var(--border)' }}>
          <div style={{ width: 38, height: 38, borderRadius: 8, background: 'var(--terracotta-pale)', color: 'var(--terracotta)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <AlertCircle size={18} />
          </div>
          <div>
            <div style={{ fontSize: 9, color: 'var(--text-muted)', fontWeight: 600, letterSpacing: '0.04em' }}>OPEN TICKETS</div>
            <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--espresso)', fontFamily: 'var(--font-display)', marginTop: 2 }}>{openCount} active</div>
          </div>
        </Card>

        {/* Resolved Today */}
        <Card style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 38, height: 38, borderRadius: 8, background: '#EAF4EB', color: 'var(--success)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <CheckCircle size={18} />
          </div>
          <div>
            <div style={{ fontSize: 9, color: 'var(--text-muted)', fontWeight: 600, letterSpacing: '0.04em' }}>RESOLVED TODAY</div>
            <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--espresso)', fontFamily: 'var(--font-display)', marginTop: 2 }}>{resolvedCount} closed</div>
          </div>
        </Card>

        {/* Urgent Tickets */}
        <Card style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 38, height: 38, borderRadius: 8, background: 'var(--warning-bg)', color: 'var(--warning)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <AlertTriangle size={18} />
          </div>
          <div>
            <div style={{ fontSize: 9, color: 'var(--text-muted)', fontWeight: 600, letterSpacing: '0.04em' }}>URGENT ALERTS</div>
            <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--espresso)', fontFamily: 'var(--font-display)', marginTop: 2 }}>{urgentCount} critical</div>
          </div>
        </Card>

        {/* Avg Response Time */}
        <Card style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 38, height: 38, borderRadius: 8, background: '#EEF4FC', color: '#4A90D9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Clock size={18} />
          </div>
          <div>
            <div style={{ fontSize: 9, color: 'var(--text-muted)', fontWeight: 600, letterSpacing: '0.04em' }}>AVG RESPONSE TIME</div>
            <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--espresso)', fontFamily: 'var(--font-display)', marginTop: 2 }}>14.5 mins</div>
          </div>
        </Card>

        {/* Common Issue */}
        <Card style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 38, height: 38, borderRadius: 8, background: 'var(--cream)', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <MessageSquare size={18} />
          </div>
          <div>
            <div style={{ fontSize: 9, color: 'var(--text-muted)', fontWeight: 600, letterSpacing: '0.04em' }}>MOST COMMON</div>
            <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--espresso)', fontFamily: 'var(--font-display)', marginTop: 2 }}>Spicy Food Level</div>
          </div>
        </Card>
      </div>

      {/* MID SECTION: TICKET LIST & SENTIMENT INSIGHTS */}
      <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '5fr 3fr', gap: 16 }}>
        {/* Ticket Inbox Table */}
        <Card style={{ padding: 20, maxWidth: '100%', overflow: 'hidden' }}>
          <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 15, color: 'var(--espresso)', marginBottom: 14 }}>Feedback Tickets Inbox</h3>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12, textAlign: 'left', minWidth: 700 }}>
              <thead>
                <tr style={{ borderBottom: '1.5px solid var(--border)', color: 'var(--text-muted)' }}>
                  <th style={{ padding: '8px 4px' }}>Ticket ID</th>
                  <th style={{ padding: '8px 4px' }}>Source</th>
                  <th style={{ padding: '8px 4px' }}>Customer/Table</th>
                  <th style={{ padding: '8px 4px' }}>Issue Description</th>
                  <th style={{ padding: '8px 4px' }}>Priority</th>
                  <th style={{ padding: '8px 4px' }}>Linked Order</th>
                  <th style={{ padding: '8px 4px' }}>Status</th>
                  <th style={{ padding: '8px 4px', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {tickets.map(t => (
                  <tr key={t.id} style={{ borderBottom: '1px solid var(--border)', background: t.priority === 'Urgent' && t.status !== 'Resolved' ? 'rgba(192, 69, 42, 0.02)' : 'inherit' }}>
                    <td style={{ padding: '12px 4px', fontWeight: 700 }}>{t.id}</td>
                    <td style={{ padding: '12px 4px' }}>
                      <span style={{ fontSize: 10, display: 'inline-flex', alignItems: 'center', gap: 3, fontWeight: 500, color: 'var(--text-secondary)' }}>
                        <MessageSquare size={10} /> {t.source}
                      </span>
                    </td>
                    <td style={{ padding: '12px 4px' }}>
                      <div style={{ fontWeight: 600 }}>{t.customer}</div>
                      <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>{t.table}</div>
                    </td>
                    <td style={{ padding: '12px 4px', color: 'var(--text-secondary)', maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={t.issue}>
                      {t.issue}
                    </td>
                    <td style={{ padding: '12px 4px' }}>
                      <Badge color={priorityColors[t.priority]}>{t.priority.toUpperCase()}</Badge>
                    </td>
                    <td style={{ padding: '12px 4px' }}>
                      <button
                        onClick={() => inspectOrder(t.orderId)}
                        style={{
                          background: 'none', border: 'none', cursor: 'pointer',
                          display: 'inline-flex', alignItems: 'center', gap: 4,
                          fontSize: 11, fontWeight: 700, color: 'var(--terracotta)', padding: 0
                        }}
                      >
                        <Link size={10} /> #{t.orderId}
                      </button>
                    </td>
                    <td style={{ padding: '12px 4px' }}>
                      <Badge color={statusColors[t.status]}>{t.status.toUpperCase()}</Badge>
                    </td>
                    <td style={{ padding: '12px 4px', textAlign: 'right' }}>
                      <button
                        onClick={() => openTicketDrawer(t)}
                        style={{
                          background: 'var(--cream)', border: 'none', borderRadius: 4,
                          padding: '4px 8px', fontSize: 10, cursor: 'pointer',
                          fontWeight: 700, color: 'var(--espresso)', display: 'inline-flex',
                          alignItems: 'center', gap: 3
                        }}
                      >
                        Detail <ChevronRight size={10} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Sentiment & CSAT Widget */}
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
                <Sparkles size={16} style={{ color: 'var(--terracotta)' }} /> Guest Sentiment Summary
              </h3>
              <Badge color="green">CSAT Widget</Badge>
            </div>

            <div style={{ display: 'flex', gap: 16, alignItems: 'center', background: '#fff', padding: 14, borderRadius: 10, border: '1px solid var(--border)', marginBottom: 14 }}>
              <DonutProgress percentage={94} color="var(--success)" size={60} strokeWidth={6} />
              <div>
                <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>Customer Satisfaction</div>
                <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--espresso)', marginTop: 2 }}>94% Positive Feedback</div>
                <div style={{ fontSize: 9, color: 'var(--text-secondary)', marginTop: 2 }}>Based on 156 guest QR scans this week</div>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, background: '#fff', padding: 14, borderRadius: 10, border: '1px solid var(--border)' }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--espresso)', borderBottom: '1px dashed var(--border)', paddingBottom: 6 }}>OPERATIONAL SATISFACTION SCORES</div>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: 'var(--text-secondary)', marginTop: 2 }}>
                <span>Food Quality</span><strong>4.8 / 5.0</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: 'var(--text-secondary)' }}>
                <span>Service Efficiency</span><strong>4.2 / 5.0</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: 'var(--text-secondary)' }}>
                <span>Staff Friendliness</span><strong>4.9 / 5.0</strong>
              </div>
            </div>
          </div>

          <div style={{
            marginTop: 18, borderTop: '1px dashed var(--border)', paddingTop: 12,
            fontSize: 10, color: 'var(--text-muted)', lineHeight: 1.4, display: 'flex', alignItems: 'center', gap: 4
          }}>
            <ThumbsUp size={11} style={{ color: 'var(--success)' }} /> Top compliment today: <strong>Spicy Kelewele taste profile</strong>
          </div>
        </Card>
      </div>

      {/* RESOLUTION TRACKING DRAWER PANEL (MODAL COMPONENT) */}
      {selectedTicket && (
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
                <h4 style={{ margin: 0, fontFamily: 'var(--font-display)', fontSize: 15 }}>Resolution Dashboard ({selectedTicket.id})</h4>
                <span style={{ fontSize: 10, opacity: 0.8 }}>Logged from {selectedTicket.source} · Linked Order #{selectedTicket.orderId}</span>
              </div>
              <button
                onClick={() => setSelectedTicket(null)}
                style={{ background: 'transparent', border: 'none', color: '#fff', cursor: 'pointer' }}
              >
                <X size={18} />
              </button>
            </div>

            <div style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 14 }}>
              {/* Customer and Issue */}
              <div style={{ background: 'var(--cream)', padding: 12, borderRadius: 8, fontSize: 12 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                  <strong>Guest: {selectedTicket.customer} ({selectedTicket.table})</strong>
                  <Badge color={priorityColors[selectedTicket.priority]}>{selectedTicket.priority}</Badge>
                </div>
                <div style={{ color: 'var(--text-primary)', marginTop: 6, lineHeight: 1.4 }}>
                  <strong>Complaint:</strong> "{selectedTicket.issue}"
                </div>
              </div>

              {/* Status and Assignment inputs */}
              <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: 12 }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  <label style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-secondary)' }}>Assign Operations Staff</label>
                  <select
                    value={ticketAssignee}
                    onChange={e => setTicketAssignee(e.target.value)}
                    style={{ width: '100%', padding: 8, border: '1px solid var(--border)', borderRadius: 6, background: '#fff', fontSize: 12 }}
                  >
                    <option value="Kofi Mensah">Kofi Mensah (Server)</option>
                    <option value="Ama Osei">Ama Osei (Server)</option>
                    <option value="Kojo Mensah">Kojo Mensah (Cashier)</option>
                    <option value="Esi Boateng">Esi Boateng (Manager)</option>
                  </select>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  <label style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-secondary)' }}>Current Status</label>
                  <div style={{ display: 'flex', alignItems: 'center', height: '100%' }}>
                    <Badge color={statusColors[selectedTicket.status]}>{selectedTicket.status.toUpperCase()}</Badge>
                  </div>
                </div>
              </div>

              {/* Resolution Note text */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                <label style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-secondary)' }}>Resolution & Remedial Notes</label>
                <textarea
                  placeholder="e.g. Substituted meal for a mild version and waived Sobolo beverage fee."
                  value={resolutionText}
                  onChange={e => setResolutionText(e.target.value)}
                  style={{ width: '100%', padding: 8, border: '1px solid var(--border)', borderRadius: 6, fontSize: 12, height: 60, fontFamily: 'var(--font-body)', resize: 'none' }}
                />
              </div>

              {/* Resolution Timeline */}
              <div>
                <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-secondary)', marginBottom: 6 }}>TICKET TIMELINE</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6, maxHeight: 90, overflowY: 'auto' }}>
                  {selectedTicket.timeline.map((event, idx) => (
                    <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'var(--text-secondary)', borderLeft: '1.5px solid var(--border)', paddingLeft: 8 }}>
                      <span>{event.text}</span>
                      <span style={{ fontSize: 9, color: 'var(--text-muted)' }}>{event.time}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div style={{ background: 'var(--cream)', padding: '12px 20px', display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
              <button
                onClick={() => saveTicketResolution('Assigned')}
                style={{
                  background: '#fff', color: 'var(--espresso)', border: '1px solid var(--border)',
                  borderRadius: 6, padding: '8px 14px', fontSize: 12, fontWeight: 600, cursor: 'pointer'
                }}
              >
                Assign Staff
              </button>
              <button
                onClick={() => saveTicketResolution('Resolved')}
                style={{
                  background: 'var(--success)', color: '#fff', border: 'none',
                  borderRadius: 6, padding: '8px 14px', fontSize: 12, fontWeight: 600, cursor: 'pointer'
                }}
              >
                Resolve Ticket
              </button>
            </div>
          </div>
        </div>
      )}

      {/* LINKED ORDER INSPECTION OVERLAY */}
      {selectedOrderDetails && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(26,15,10,0.45)',
          backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center',
          justifyContent: 'center', zIndex: 1010, padding: 16
        }}>
          <div className="fade-in" style={{
            background: '#fff', borderRadius: 'var(--radius-lg)',
            width: '100%', maxWidth: 450, border: '1px solid var(--border)',
            boxShadow: 'var(--shadow-lg)', overflow: 'hidden'
          }}>
            <div style={{ background: 'var(--espresso)', color: '#fff', padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h4 style={{ margin: 0, fontFamily: 'var(--font-display)', fontSize: 15 }}>Order Details Audit: #{selectedOrderDetails.id}</h4>
                <span style={{ fontSize: 10, opacity: 0.8 }}>Location: {selectedOrderDetails.table} · Payment: {selectedOrderDetails.payment}</span>
              </div>
              <button
                onClick={() => setSelectedOrderDetails(null)}
                style={{ background: 'transparent', border: 'none', color: '#fff', cursor: 'pointer' }}
              >
                <X size={18} />
              </button>
            </div>

            <div style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12 }}>
                <span>Order Placement Time:</span><strong>{selectedOrderDetails.placedAt || '12:15 PM'}</strong>
              </div>
              {selectedOrderDetails.serviceTime && (
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12 }}>
                  <span>Kitchen Cooking Duration:</span><strong>{selectedOrderDetails.serviceTime} mins</strong>
                </div>
              )}
              
              <div style={{ borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)', padding: '10px 0', margin: '4px 0' }}>
                <div style={{ fontSize: 10, color: 'var(--text-muted)', marginBottom: 6, fontWeight: 700 }}>ORDERED ITEMS</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                  {Array.isArray(selectedOrderDetails.items) ? (
                    selectedOrderDetails.items.map((item, idx) => (
                      <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12 }}>
                        <span>{item}</span>
                      </div>
                    ))
                  ) : (
                    <div style={{ fontSize: 12 }}>{selectedOrderDetails.items}</div>
                  )}
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, fontWeight: 700, color: 'var(--espresso)' }}>
                <span>Total Bill Amount:</span><strong>GH₵ {selectedOrderDetails.total || 65}</strong>
              </div>
            </div>

            <div style={{ background: 'var(--cream)', padding: '12px 20px', display: 'flex', justifyContent: 'flex-end' }}>
              <button
                onClick={() => setSelectedOrderDetails(null)}
                style={{
                  background: 'var(--cream-dark)', color: 'var(--espresso)', border: '1px solid var(--border)',
                  borderRadius: 6, padding: '8px 14px', fontSize: 12, fontWeight: 600, cursor: 'pointer'
                }}
              >
                Close Audit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
