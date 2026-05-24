import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Logo, OnlineBadge, TimerBadge, Card, Button, Badge } from '../components/Shared';
import { MENU_ITEMS, CATEGORIES, TABLES } from '../data';
import { Search, Plus, Minus, Trash2, ChefHat, Home, X, Check, Edit3 } from 'lucide-react';

function ModifierModal({ item, onClose, onAdd }) {
  const [selected, setSelected] = useState([]);
  const [note, setNote] = useState('');
  const [qty, setQty] = useState(1);

  const toggle = (m) => setSelected(prev => prev.includes(m) ? prev.filter(x => x !== m) : [...prev, m]);

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <div style={{ background: '#fff', borderRadius: 'var(--radius-xl)', padding: 28, width: '100%', maxWidth: 380, animation: 'scaleIn 0.2s ease' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 18, color: 'var(--espresso)' }}>{item.name}</div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Customise your order</div>
          </div>
          <button onClick={onClose} style={{ background: 'var(--cream)', border: 'none', borderRadius: 8, padding: 6, cursor: 'pointer' }}><X size={16} /></button>
        </div>

        {item.modifiers.length > 0 && (
          <div style={{ marginBottom: 18 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>
              {item.name} Modifiers
            </div>
            {item.modifiers.map(m => (
              <div key={m} onClick={() => toggle(m)} style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                padding: '10px 12px', borderRadius: 8, cursor: 'pointer', marginBottom: 4,
                background: selected.includes(m) ? 'var(--terracotta-pale)' : 'var(--cream)',
                border: `1.5px solid ${selected.includes(m) ? 'var(--terracotta)' : 'transparent'}`,
              }}>
                <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--espresso)' }}>{m}</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>GH₵ 0.00</span>
                  {selected.includes(m) && <Check size={14} style={{ color: 'var(--terracotta)' }} />}
                </div>
              </div>
            ))}
          </div>
        )}

        <div style={{ marginBottom: 18 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>
            Note to Kitchen
          </div>
          <input value={note} onChange={e => setNote(e.target.value)} placeholder="e.g. No onions, extra sauce..."
            style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1.5px solid var(--border)', fontSize: 13, fontFamily: 'var(--font-body)', color: 'var(--espresso)', background: 'var(--cream)', outline: 'none' }} />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <button onClick={() => setQty(q => Math.max(1, q - 1))} style={{ width: 32, height: 32, borderRadius: 8, border: '1.5px solid var(--border)', background: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Minus size={14} /></button>
            <span style={{ fontSize: 18, fontWeight: 700, width: 24, textAlign: 'center' }}>{qty}</span>
            <button onClick={() => setQty(q => q + 1)} style={{ width: 32, height: 32, borderRadius: 8, border: 'none', background: 'var(--terracotta)', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Plus size={14} /></button>
          </div>
          <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--espresso)', fontFamily: 'var(--font-display)' }}>
            GH₵ {(item.price * qty).toFixed(2)}
          </div>
        </div>

        <button onClick={() => { onAdd(item, qty, selected, note); onClose(); }} style={{
          width: '100%', background: 'var(--terracotta)', color: '#fff', border: 'none',
          borderRadius: 10, padding: '13px', cursor: 'pointer', fontSize: 14, fontWeight: 700, fontFamily: 'var(--font-body)',
        }}>
          Add to Cart
        </button>
      </div>
    </div>
  );
}

export default function POSScreen() {
  const { cart, addToCart, removeFromCart, updateCartQty, cartTotal, serviceCharge, cartGrandTotal, sendOrderToKitchen, isOnline, selectedTable, setSelectedTable, orderType, setOrderType, setCurrentScreen } = useApp();
  const [category, setCategory] = useState('All');
  const [search, setSearch] = useState('');
  const [navTab, setNavTab] = useState('menu');
  const [modalItem, setModalItem] = useState(null);
  const [tableView, setTableView] = useState(false);

  const filtered = MENU_ITEMS.filter(item => {
    if (category === 'Popular') return item.popular;
    if (category !== 'All') return item.category === category;
    if (search) return item.name.toLowerCase().includes(search.toLowerCase());
    return true;
  });

  const tabs = [
    { id: 'dine', label: 'Dine In' },
    { id: 'takeaway', label: 'Takeaway' },
  ];

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden', fontFamily: 'var(--font-body)' }}>
      {/* Left Nav */}
      <nav style={{ width: 72, background: 'var(--espresso)', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '16px 0', gap: 6 }}>
        <div style={{ fontSize: 22, marginBottom: 12 }}>🍽️</div>
        {[
          { id: 'menu', icon: '📋', label: 'Menu' },
          { id: 'tables', icon: '🪑', label: 'Tables' },
          { id: 'orders', icon: '📦', label: 'Orders' },
          { id: 'customers', icon: '👥', label: 'Guests' },
          { id: 'reports', icon: '📊', label: 'Reports' },
          { id: 'settings', icon: '⚙️', label: 'Settings' },
        ].map(n => (
          <button key={n.id} onClick={() => setNavTab(n.id)} style={{
            width: 52, height: 52, borderRadius: 12, border: 'none', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 2,
            background: navTab === n.id ? 'rgba(255,255,255,0.15)' : 'transparent',
            color: navTab === n.id ? '#fff' : 'rgba(255,255,255,0.4)',
          }}>
            <span style={{ fontSize: 16 }}>{n.icon}</span>
            <span style={{ fontSize: 8 }}>{n.label}</span>
          </button>
        ))}
        <div style={{ flex: 1 }} />
        <button onClick={() => setCurrentScreen('home')} style={{ width: 52, height: 52, borderRadius: 12, border: 'none', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'transparent', color: 'rgba(255,255,255,0.4)' }}>
          <Home size={16} />
          <span style={{ fontSize: 8 }}>Home</span>
        </button>
        <div style={{ padding: '8px 0', borderTop: '1px solid rgba(255,255,255,0.1)', width: '100%', display: 'flex', justifyContent: 'center' }}>
          <div style={{ width: 8, height: 8, borderRadius: 4, background: isOnline ? '#4ADE80' : '#FBBF24' }} />
        </div>
      </nav>

      {/* Menu area */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', background: 'var(--cream)' }}>
        {/* Top bar */}
        <div style={{ background: '#fff', borderBottom: '1px solid var(--border)', padding: '12px 20px', display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ display: 'flex', gap: 2, background: 'var(--cream)', borderRadius: 10, padding: 3 }}>
            {['Dine In', 'Takeaway'].map(t => (
              <button key={t} onClick={() => setOrderType(t)} style={{
                padding: '6px 16px', borderRadius: 8, border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: 600, fontFamily: 'var(--font-body)',
                background: orderType === t ? '#fff' : 'transparent',
                color: orderType === t ? 'var(--espresso)' : 'var(--text-muted)',
                boxShadow: orderType === t ? 'var(--shadow-sm)' : 'none',
              }}>{t}</button>
            ))}
          </div>
          {orderType === 'Dine In' && (
            <button onClick={() => setTableView(true)} style={{
              display: 'flex', alignItems: 'center', gap: 6, padding: '7px 14px', borderRadius: 8,
              border: '1.5px solid var(--border)', background: selectedTable ? 'var(--terracotta-pale)' : '#fff',
              cursor: 'pointer', fontSize: 12, fontWeight: 600, fontFamily: 'var(--font-body)',
              color: selectedTable ? 'var(--terracotta)' : 'var(--text-secondary)',
            }}>
              🪑 {selectedTable ? selectedTable.number : 'Select Table'}
            </button>
          )}
          <div style={{ flex: 1, position: 'relative' }}>
            <Search size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search menu..."
              style={{ width: '100%', padding: '8px 10px 8px 32px', borderRadius: 8, border: '1.5px solid var(--border)', fontSize: 13, fontFamily: 'var(--font-body)', background: 'var(--cream)', outline: 'none', color: 'var(--espresso)' }} />
          </div>
          <OnlineBadge />
          <button style={{ background: 'var(--terracotta)', color: '#fff', border: 'none', borderRadius: 8, padding: '8px 14px', cursor: 'pointer', fontSize: 12, fontWeight: 700, fontFamily: 'var(--font-body)', display: 'flex', alignItems: 'center', gap: 5 }}>
            <Plus size={13} /> New Order
          </button>
        </div>

        {/* Header */}
        <div style={{ background: '#fff', padding: '8px 20px 12px', borderBottom: '1px solid var(--border)' }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 18, color: 'var(--espresso)', marginBottom: 10 }}>Menu</h2>
          <div style={{ display: 'flex', gap: 6, overflowX: 'auto' }}>
            {CATEGORIES.map(cat => (
              <button key={cat} onClick={() => { setCategory(cat); setSearch(''); }} style={{
                padding: '5px 14px', borderRadius: 16, border: '1.5px solid transparent', cursor: 'pointer',
                fontSize: 12, fontWeight: 600, fontFamily: 'var(--font-body)', whiteSpace: 'nowrap',
                background: category === cat ? 'var(--terracotta)' : 'var(--cream)',
                color: category === cat ? '#fff' : 'var(--text-secondary)',
              }}>{cat}</button>
            ))}
          </div>
        </div>

        {/* Menu grid */}
        <div style={{ flex: 1, overflow: 'auto', padding: 16 }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 12 }}>
            {filtered.map((item, i) => (
              <div key={item.id} style={{
                background: '#fff', borderRadius: 14, border: '1.5px solid var(--border)',
                padding: 14, cursor: 'pointer', transition: 'all 0.2s', position: 'relative',
                animation: `fadeIn 0.3s ease ${i * 0.03}s both`,
              }}
                onClick={() => item.modifiers.length > 0 ? setModalItem(item) : addToCart(item)}
                onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--terracotta)'}
                onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
              >
                {item.popular && <span style={{ position: 'absolute', top: 8, right: 8, fontSize: 14 }}>🔥</span>}
                <div style={{ fontSize: 34, marginBottom: 8, textAlign: 'center' }}>{item.emoji}</div>
                <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--espresso)', marginBottom: 2, lineHeight: 1.3 }}>{item.name}</div>
                <div style={{ fontSize: 10, color: 'var(--text-muted)', marginBottom: 8, lineHeight: 1.4 }}>{item.description}</div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--terracotta)', fontFamily: 'var(--font-display)' }}>GH₵ {item.price}</span>
                  <div style={{ width: 24, height: 24, borderRadius: 6, background: 'var(--terracotta)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Plus size={13} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Cart panel */}
      <div style={{ width: 300, background: '#fff', borderLeft: '1px solid var(--border)', display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '16px 18px', borderBottom: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--espresso)' }}>
                {selectedTable ? selectedTable.number : 'Takeaway'} · {orderType}
              </div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Server: Kwame</div>
            </div>
            <div style={{ width: 28, height: 28, borderRadius: 8, background: 'var(--cream)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ fontSize: 11, fontWeight: 700 }}>👥 2</span>
            </div>
          </div>
        </div>

        {/* Cart items */}
        <div style={{ flex: 1, overflow: 'auto', padding: 14 }}>
          {cart.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-muted)' }}>
              <div style={{ fontSize: 36, marginBottom: 10 }}>🛒</div>
              <div style={{ fontSize: 13 }}>Your cart is empty</div>
              <div style={{ fontSize: 11, marginTop: 4 }}>Add items from the menu</div>
            </div>
          ) : cart.map((item, idx) => (
            <div key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, marginBottom: 12, padding: '8px 0', borderBottom: '1px solid var(--border)' }}>
              <span style={{ fontSize: 20 }}>{item.emoji}</span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--espresso)' }}>{item.name}</div>
                {item.modifiers.length > 0 && <div style={{ fontSize: 10, color: 'var(--terracotta)' }}>{item.modifiers.join(', ')}</div>}
                {item.note && <div style={{ fontSize: 10, color: 'var(--text-muted)', fontStyle: 'italic' }}>Note: {item.note}</div>}
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 4 }}>
                  <button onClick={() => updateCartQty(idx, -1)} style={{ width: 20, height: 20, borderRadius: 4, border: '1px solid var(--border)', background: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Minus size={10} /></button>
                  <span style={{ fontSize: 12, fontWeight: 700, width: 16, textAlign: 'center' }}>{item.qty}</span>
                  <button onClick={() => updateCartQty(idx, 1)} style={{ width: 20, height: 20, borderRadius: 4, border: 'none', background: 'var(--terracotta)', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Plus size={10} /></button>
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--espresso)' }}>GH₵ {(item.price * item.qty).toFixed(0)}</div>
                <button onClick={() => removeFromCart(idx)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', marginTop: 4 }}><Trash2 size={12} /></button>
              </div>
            </div>
          ))}
        </div>

        {/* Totals + checkout */}
        {cart.length > 0 && (
          <div style={{ borderTop: '1px solid var(--border)', padding: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 4, color: 'var(--text-secondary)' }}>
              <span>Subtotal</span><span>GH₵ {cartTotal}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 10, color: 'var(--text-secondary)' }}>
              <span>Service Charge (5%)</span><span>GH₵ {serviceCharge}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 16, fontWeight: 800, color: 'var(--espresso)', fontFamily: 'var(--font-display)', marginBottom: 14 }}>
              <span>Total</span><span>GH₵ {cartGrandTotal}</span>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button style={{ flex: 1, background: 'var(--cream)', color: 'var(--espresso)', border: '1.5px solid var(--border)', borderRadius: 10, padding: '12px', cursor: 'pointer', fontSize: 13, fontWeight: 700, fontFamily: 'var(--font-body)' }}>
                Pay
              </button>
              <button onClick={sendOrderToKitchen} style={{
                flex: 2, background: 'var(--terracotta)', color: '#fff', border: 'none', borderRadius: 10,
                padding: '12px', cursor: 'pointer', fontSize: 13, fontWeight: 700, fontFamily: 'var(--font-body)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
              }}>
                <ChefHat size={14} /> Send to Kitchen
              </button>
            </div>
            <div style={{ textAlign: 'center', marginTop: 8, fontSize: 10, color: 'var(--text-muted)' }}>
              {!isOnline && '⚠️ Offline — will sync when back online'}
            </div>
          </div>
        )}
      </div>

      {/* Modifier modal */}
      {modalItem && <ModifierModal item={modalItem} onClose={() => setModalItem(null)} onAdd={addToCart} />}

      {/* Table selector */}
      {tableView && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: '#fff', borderRadius: 'var(--radius-xl)', padding: 28, width: '90%', maxWidth: 500, animation: 'scaleIn 0.2s ease' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 18, color: 'var(--espresso)' }}>Select Table</h3>
              <button onClick={() => setTableView(false)} style={{ background: 'var(--cream)', border: 'none', borderRadius: 8, padding: 6, cursor: 'pointer' }}><X size={16} /></button>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10 }}>
              {TABLES.map(t => (
                <button key={t.id} onClick={() => { setSelectedTable(t); setTableView(false); }} style={{
                  padding: '14px 8px', borderRadius: 12, border: '2px solid', cursor: t.status === 'occupied' ? 'not-allowed' : 'pointer',
                  borderColor: t.status === 'available' ? 'var(--border)' : t.status === 'occupied' ? 'var(--terracotta)' : 'var(--warning)',
                  background: t.status === 'available' ? '#fff' : t.status === 'occupied' ? 'var(--terracotta-pale)' : 'var(--warning-bg)',
                  fontFamily: 'var(--font-body)', fontSize: 12, fontWeight: 600, opacity: t.status === 'occupied' ? 0.6 : 1,
                  color: 'var(--espresso)',
                }}>
                  <div style={{ fontSize: 16, marginBottom: 2 }}>🪑</div>
                  <div>{t.number}</div>
                  <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>{t.seats} seats</div>
                  <div style={{ fontSize: 9, fontWeight: 700, marginTop: 2, textTransform: 'capitalize', color: t.status === 'available' ? 'var(--success)' : t.status === 'occupied' ? 'var(--terracotta)' : 'var(--warning)' }}>
                    {t.status}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
