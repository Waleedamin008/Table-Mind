import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Logo, OnlineBadge, Card, Badge, useViewport } from '../components/Shared';
import { MENU_ITEMS } from '../data';
import {
  Wifi, WifiOff, RefreshCw, CheckCircle, AlertCircle, Clock, Plus, Home, ArrowRight,
  Target, ClipboardList, Smartphone, Monitor, LayoutDashboard, QrCode, Save, Inbox, Sparkles, Check,
  CupSoda, Sandwich, Dessert, Utensils
} from 'lucide-react';

// Helper category icon mapping component
function ItemIcon({ category, size = 24, color = 'var(--terracotta)' }) {
  const props = { size, color, strokeWidth: 2 };
  if (category === 'Drinks') return <CupSoda {...props} />;
  if (category === 'Sides') return <Sandwich {...props} />;
  if (category === 'Desserts') return <Dessert {...props} />;
  return <Utensils {...props} />;
}

export default function OfflineScreen() {
  const { isOnline, toggleOnline, pendingSyncOrders, kdsOrders, setCurrentScreen, addToCart, cart, sendOrderToKitchen, setSelectedTable, setOrderType, showNotification } = useApp();
  const [step, setStep] = useState(0);
  const [offlineCart, setOfflineCart] = useState([]);
  const [orderCreated, setOrderCreated] = useState(false);
  const { isMobile } = useViewport();

  const demoItems = MENU_ITEMS.slice(0, 4);

  const addOfflineItem = (item) => {
    setOfflineCart(prev => {
      const ex = prev.find(c => c.id === item.id);
      if (ex) return prev.map(c => c.id === item.id ? { ...c, qty: c.qty + 1 } : c);
      return [...prev, { ...item, qty: 1 }];
    });
  };

  const createOfflineOrder = () => {
    if (offlineCart.length === 0) return;
    setSelectedTable({ id: 6, number: 'Table 06' });
    setOrderType('Dine In');
    offlineCart.forEach(item => addToCart(item, item.qty));
    sendOrderToKitchen();
    setOrderCreated(true);
    setStep(3);
  };

  const doSync = () => {
    toggleOnline();
    setStep(4);
  };

  const STEPS = [
    { id: 0, label: 'Start', icon: <Target size={16} /> },
    { id: 1, label: 'Go Offline', icon: <WifiOff size={16} /> },
    { id: 2, label: 'Create Order', icon: <ClipboardList size={16} /> },
    { id: 3, label: 'Pending Sync', icon: <RefreshCw size={16} /> },
    { id: 4, label: 'Sync!', icon: <CheckCircle size={16} /> },
  ];

  return (
    <div style={{ minHeight: '100vh', background: 'var(--cream)', fontFamily: 'var(--font-body)' }}>
      {/* Top bar */}
      <div style={{ background: '#fff', borderBottom: '1px solid var(--border)', padding: isMobile ? '14px 16px' : '14px 24px', position: 'sticky', top: 0, zIndex: 10 }}>
        <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', alignItems: isMobile ? 'flex-start' : 'center', justifyContent: 'space-between', gap: isMobile ? 14 : 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, width: isMobile ? '100%' : 'auto', minWidth: 0 }}>
            <div style={{ flexShrink: 0 }}>
              <Logo size="sm" />
            </div>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: isMobile ? 14 : 16, fontWeight: 700, color: 'var(--espresso)', fontFamily: 'var(--font-display)', lineHeight: 1.1 }}>
                Offline Mode
              </div>
              {/* <div style={{ fontSize: 11, color: 'var(--text-muted)', lineHeight: 1.5, marginTop: 4, maxWidth: isMobile ? 240 : 'none' }}>
                Follow the steps to see offline ordering and sync in action
              </div> */}
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', width: isMobile ? '100%' : 'auto', justifyContent: isMobile ? 'space-between' : 'flex-end' }}>
            <OnlineBadge />
            <button onClick={() => setCurrentScreen('home')} style={{ background: 'var(--cream)', border: '1.5px solid var(--border)', borderRadius: 8, padding: '7px 12px', cursor: 'pointer', fontSize: 12, fontFamily: 'var(--font-body)', display: 'flex', alignItems: 'center', gap: 5, color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>
              <Home size={12} /> Home
            </button>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 900, margin: '0 auto', padding: isMobile ? '20px 16px' : '32px 24px' }}>
        {/* Progress steps */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0, marginBottom: 40, overflowX: 'auto', paddingBottom: 6 }}>
          {STEPS.map((s, i) => (
            <React.Fragment key={s.id}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
                <div style={{
                  width: 44, height: 44, borderRadius: 22,
                  background: step >= s.id ? (step === s.id ? 'var(--terracotta)' : 'var(--success)') : '#fff',
                  border: `2px solid ${step >= s.id ? (step === s.id ? 'var(--terracotta)' : 'var(--success)') : 'var(--border)'}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 18, transition: 'all 0.3s', boxShadow: step === s.id ? '0 0 0 4px rgba(192,69,42,0.2)' : 'none',
                }}>
                  {step > s.id ? <Check size={16} style={{ color: '#fff' }} /> : s.icon}
                </div>
                <span style={{ fontSize: 10, fontWeight: 600, color: step >= s.id ? 'var(--espresso)' : 'var(--text-muted)' }}>{s.label}</span>
              </div>
              {i < STEPS.length - 1 && (
                <div style={{ width: 60, height: 2, background: step > i ? 'var(--success)' : 'var(--border)', margin: '0 4px', marginBottom: 22, transition: 'all 0.3s' }} />
              )}
            </React.Fragment>
          ))}
        </div>

        {/* Connection status banner */}
        <div style={{
          background: isOnline ? 'var(--success-bg)' : 'var(--warning-bg)',
          border: `2px solid ${isOnline ? 'var(--success)' : 'var(--warning)'}`,
          borderRadius: 'var(--radius-lg)', padding: '20px 24px', marginBottom: 28,
          display: 'flex', flexDirection: isMobile ? 'column' : 'row', alignItems: isMobile ? 'flex-start' : 'center', gap: 16, animation: 'fadeIn 0.3s ease',
        }}>
          {isOnline ? <Wifi size={28} style={{ color: 'var(--success)', flexShrink: 0 }} /> : <WifiOff size={28} style={{ color: 'var(--warning)', flexShrink: 0 }} />}
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--espresso)', marginBottom: 2, display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ display: 'inline-block', width: 8, height: 8, borderRadius: '50%', background: isOnline ? 'var(--success)' : 'var(--terracotta)' }} />
              {isOnline ? 'Connected to the Internet' : 'No Internet Connection'}
            </div>
            <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
              {isOnline
                ? 'All orders are syncing in real-time to the kitchen and dashboard.'
                : 'TableMind is operating offline. Orders will be saved locally and synced when reconnected.'}
            </div>
          </div>
          {pendingSyncOrders.length > 0 && !isOnline && (
            <div style={{ background: 'var(--warning)', color: '#fff', borderRadius: 10, padding: '4px 12px', fontSize: 12, fontWeight: 700 }}>
              {pendingSyncOrders.length} pending
            </div>
          )}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: 20 }}>
          {/* Step actions */}
          <div>
            {/* Step 1: Go Offline */}
            <Card style={{ marginBottom: 16, opacity: step < 1 ? 1 : step === 1 ? 1 : 0.6, border: step === 1 ? '2px solid var(--terracotta)' : '1px solid var(--border)' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                <div style={{ width: 36, height: 36, borderRadius: 10, background: step === 1 ? 'var(--terracotta-pale)' : step > 1 ? 'var(--success-bg)' : 'var(--cream)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  {step > 1 ? <Check size={14} style={{ color: 'var(--success)' }} /> : <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)' }}>1</span>}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--espresso)', marginBottom: 4 }}>Simulate Internet Drop</div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 12, lineHeight: 1.5 }}>
                    Toggle offline mode to simulate a network outage. In real restaurants, this happens during power cuts or poor connectivity.
                  </div>
                  {step === 0 && (
                    <button onClick={() => { toggleOnline(); setStep(1); }} style={{
                      background: 'var(--terracotta)', color: '#fff', border: 'none', borderRadius: 8, padding: '9px 16px',
                      cursor: 'pointer', fontSize: 12, fontWeight: 700, fontFamily: 'var(--font-body)', display: 'flex', alignItems: 'center', gap: 5,
                    }}>
                      <WifiOff size={13} /> Go Offline
                    </button>
                  )}
                  {step > 0 && <Badge color={step > 1 ? 'green' : 'red'}>{step > 1 ? 'Completed' : 'Offline mode active'}</Badge>}
                </div>
              </div>
            </Card>

            {/* Step 2: Create order */}
            <Card style={{ marginBottom: 16, opacity: step < 1 ? 0.4 : step === 2 ? 1 : step > 2 ? 0.6 : 1, border: step === 1 ? '2px solid var(--terracotta)' : '1px solid var(--border)', pointerEvents: step < 1 ? 'none' : 'auto' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                <div style={{ width: 36, height: 36, borderRadius: 10, background: step > 2 ? 'var(--success-bg)' : 'var(--cream)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  {step > 2 ? <Check size={14} style={{ color: 'var(--success)' }} /> : <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)' }}>2</span>}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--espresso)', marginBottom: 4 }}>Create Order While Offline</div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 12, lineHeight: 1.5 }}>
                    Staff can still take orders even without internet. The order gets saved locally on the device.
                  </div>
                  {step >= 1 && step < 3 && (
                    <>
                      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 10 }}>
                        {demoItems.map(item => (
                          <button key={item.id} onClick={() => { addOfflineItem(item); setStep(2); }} style={{
                            padding: '5px 10px', borderRadius: 8, border: '1.5px solid var(--border)', background: offlineCart.find(c => c.id === item.id) ? 'var(--terracotta-pale)' : '#fff',
                            cursor: 'pointer', fontSize: 11, fontWeight: 600, fontFamily: 'var(--font-body)', color: 'var(--espresso)',
                            borderColor: offlineCart.find(c => c.id === item.id) ? 'var(--terracotta)' : 'var(--border)',
                          }}>
                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                              <ItemIcon category={item.category} size={12} />
                              {item.name}
                            </span>
                            {offlineCart.find(c => c.id === item.id) && <span style={{ color: 'var(--terracotta)' }}> ×{offlineCart.find(c => c.id === item.id).qty}</span>}
                          </button>
                        ))}
                      </div>
                      {offlineCart.length > 0 && (
                        <button onClick={createOfflineOrder} style={{
                          background: isOnline ? '#ccc' : 'var(--terracotta)', color: '#fff', border: 'none', borderRadius: 8,
                          padding: '9px 16px', cursor: isOnline ? 'not-allowed' : 'pointer', fontSize: 12, fontWeight: 700, fontFamily: 'var(--font-body)',
                          display: 'flex', alignItems: 'center', gap: 5,
                        }}>
                          <Save size={12} style={{ marginRight: 4 }} /> Save Order Offline ({offlineCart.length} items)
                        </button>
                      )}
                    </>
                  )}
                  {step > 2 && <Badge color="amber">Order saved locally as Pending Sync</Badge>}
                </div>
              </div>
            </Card>

            {/* Step 3: Sync */}
            <Card style={{ opacity: step < 3 ? 0.4 : 1, pointerEvents: step < 3 ? 'none' : 'auto', border: step === 3 ? '2px solid var(--warning)' : '1px solid var(--border)' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                <div style={{ width: 36, height: 36, borderRadius: 10, background: step >= 4 ? 'var(--success-bg)' : 'var(--warning-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  {step >= 4 ? <Check size={14} style={{ color: 'var(--success)' }} /> : <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)' }}>3</span>}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--espresso)', marginBottom: 4 }}>Reconnect & Sync</div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 12, lineHeight: 1.5 }}>
                    When internet returns, TableMind automatically syncs queued orders — no duplicate kitchen tickets.
                  </div>
                  {step === 3 && (
                    <button onClick={doSync} style={{
                      background: 'var(--success)', color: '#fff', border: 'none', borderRadius: 8, padding: '9px 16px',
                      cursor: 'pointer', fontSize: 12, fontWeight: 700, fontFamily: 'var(--font-body)', display: 'flex', alignItems: 'center', gap: 5,
                    }}>
                      <Wifi size={13} /> Go Online & Sync
                    </button>
                  )}
                  {step >= 4 && (
                    <div>
                      <Badge color="green">✓ Synced — No duplicate tickets</Badge>
                      <div style={{ marginTop: 8, fontSize: 11, color: 'var(--text-muted)' }}>Orders are now live on the Kitchen Display and Dashboard</div>
                    </div>
                  )}
                </div>
              </div>
            </Card>
          </div>

          {/* Right panel: live state */}
          <div>
            <Card style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--espresso)', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
                <Wifi size={14} style={{ color: 'var(--terracotta)' }} /> Connection State
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {[
                  { label: 'POS App', icon: <Smartphone size={14} />, synced: isOnline },
                  { label: 'Kitchen Display', icon: <Monitor size={14} />, synced: isOnline },
                  { label: 'Owner Dashboard', icon: <LayoutDashboard size={14} />, synced: isOnline },
                  { label: 'QR Ordering', icon: <QrCode size={14} />, synced: isOnline },
                ].map(item => (
                  <div key={item.label} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 12px', borderRadius: 8, background: 'var(--cream)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, fontWeight: 500, color: 'var(--text-secondary)' }}>
                      <span>{item.icon}</span> {item.label}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, fontWeight: 600, color: item.synced ? 'var(--success)' : 'var(--warning)' }}>
                      <div style={{ width: 7, height: 7, borderRadius: 4, background: item.synced ? 'var(--success)' : 'var(--warning)', animation: !item.synced ? 'pulse 1.5s infinite' : 'none' }} />
                      {item.synced ? 'Synced' : 'Offline'}
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            {/* Pending orders */}
            <Card>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--espresso)', display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Package size={14} style={{ color: 'var(--terracotta)' }} /> Offline Queue
                </div>
                <Badge color={pendingSyncOrders.length > 0 ? 'amber' : 'green'}>
                  {pendingSyncOrders.length > 0 ? `${pendingSyncOrders.length} pending` : 'Empty'}
                </Badge>
              </div>

              {pendingSyncOrders.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '24px 16px', color: 'var(--text-muted)', fontSize: 12 }}>
                  {step >= 4
                    ? <><div style={{ display: 'flex', justifyContent: 'center', marginBottom: 6 }}><CheckCircle size={24} style={{ color: 'var(--success)' }} /></div> All orders synced successfully!</>
                    : <><div style={{ display: 'flex', justifyContent: 'center', marginBottom: 6 }}><Inbox size={24} style={{ color: 'var(--text-muted)' }} /></div> No pending orders</>
                  }
                </div>
              ) : (
                pendingSyncOrders.map((order, i) => (
                  <div key={order.id} style={{ background: 'var(--warning-bg)', border: '1.5px solid var(--warning)', borderRadius: 10, padding: 12, marginBottom: 8 }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                      <span style={{ fontSize: 13, fontWeight: 800, color: 'var(--espresso)' }}>#{order.id}</span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, color: 'var(--warning)', fontWeight: 600 }}>
                        <RefreshCw size={10} style={{ animation: 'spin 2s linear infinite' }} />
                        Pending Sync
                      </div>
                    </div>
                    <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginBottom: 4 }}>{order.table} · {order.type}</div>
                    {order.items.map((item, j) => (
                      <div key={j} style={{ fontSize: 11, color: 'var(--text-muted)' }}>· {item.name} ×{item.qty}</div>
                    ))}
                    <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 6, fontStyle: 'italic' }}>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}><Save size={10} /> Saved locally at {new Date(order.placedAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                  </div>
                ))
              )}
            </Card>

            {step >= 4 && (
              <Card style={{ marginTop: 16, background: 'linear-gradient(135deg, var(--espresso), var(--espresso-light))', border: 'none' }}>
                <div style={{ color: '#fff', fontSize: 14, fontWeight: 700, marginBottom: 6, fontFamily: 'var(--font-display)' }}>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}><Sparkles size={16} style={{ color: 'var(--warning)' }} /> Offline demo complete!</span>
                </div>
                <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: 12, lineHeight: 1.5, marginBottom: 14 }}>
                  You've seen how TableMind keeps your restaurant running even when internet drops — a key feature for the Ghana market.
                </div>
                <button onClick={() => setCurrentScreen('kds')} style={{ background: 'var(--terracotta)', color: '#fff', border: 'none', borderRadius: 8, padding: '9px 16px', cursor: 'pointer', fontSize: 12, fontWeight: 700, fontFamily: 'var(--font-body)', display: 'flex', alignItems: 'center', gap: 5 }}>
                  View Kitchen Display <ArrowRight size={12} />
                </button>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
