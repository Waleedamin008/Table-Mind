import React, { useEffect, useMemo, useState } from 'react';
import { QRCodeCanvas } from 'qrcode.react';
import { useApp } from '../context/AppContext';
import { MENU_ITEMS, CATEGORIES, TABLES } from '../data';
import {
  Plus, Minus, ShoppingCart, X, Check, Home, QrCode,
  Utensils, TableProperties, Sparkles, CupSoda, Sandwich, Dessert
} from 'lucide-react';

// Helper category icon mapping component
function ItemIcon({ category, size = 24, color = 'var(--terracotta)' }) {
  const props = { size, color, strokeWidth: 2 };
  if (category === 'Drinks') return <CupSoda {...props} />;
  if (category === 'Sides') return <Sandwich {...props} />;
  if (category === 'Desserts') return <Dessert {...props} />;
  return <Utensils {...props} />;
}

export default function QROrderingScreen() {
  const {
    sendOrderToKitchen,
    addToCart,
    setCurrentScreen,
    setSelectedTable,
    selectedTable,
    setOrderType,
  } = useApp();

  const [category, setCategory] = useState('All');
  const [localCart, setLocalCart] = useState([]);
  const [showCart, setShowCart] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [modItem, setModItem] = useState(null);
  const [selectedMods, setSelectedMods] = useState([]);
  const [note, setNote] = useState('');
  const [showQrCode, setShowQrCode] = useState(true);

  const params = new URLSearchParams(window.location.search);
  const tableParam = params.get('table');
  const normalizedTable = tableParam ? String(Number.parseInt(tableParam, 10) || 12).padStart(2, '0') : null;
  const fallbackTable = normalizedTable
    ? TABLES.find(t => t.number.endsWith(normalizedTable)) || { id: Number.parseInt(tableParam, 10) || 12, number: `Table ${normalizedTable}` }
    : { id: 12, number: 'Table 12' };
  const activeTable = selectedTable || fallbackTable;
  const tableNumber = activeTable?.number || 'Table 12';

  useEffect(() => {
    setOrderType('Dine In');
    if (!selectedTable) {
      setSelectedTable(fallbackTable);
    }
  }, [fallbackTable, selectedTable, setOrderType, setSelectedTable]);

  const qrValue = useMemo(() => {
    const url = new URL(window.location.href);
    const tableId = activeTable?.id || Number.parseInt(tableParam, 10) || 12;
    url.searchParams.set('screen', 'qr');
    url.searchParams.set('table', String(tableId));
    return url.toString();
  }, [activeTable, tableParam]);

  const localTotal = localCart.reduce((s, i) => s + i.price * i.qty, 0);
  const localCharge = Math.round(localTotal * 0.05);
  const localGrand = localTotal + localCharge;

  const filtered = MENU_ITEMS.filter(i => {
    if (category === 'Popular') return i.popular;
    if (category !== 'All') return i.category === category;
    return true;
  });

  const addItem = (item, qty = 1, mods = [], n = '') => {
    setLocalCart(prev => {
      const ex = prev.find(c => c.id === item.id && JSON.stringify(c.modifiers || []) === JSON.stringify(mods) && c.note === n);
      if (ex) {
        return prev.map(c => c === ex ? { ...c, qty: c.qty + qty } : c);
      }
      return [...prev, { ...item, qty, modifiers: mods, note: n }];
    });
  };

  const updateQty = (id, delta) => {
    setLocalCart(prev => prev.map(c => c.id === id ? { ...c, qty: Math.max(0, c.qty + delta) } : c).filter(c => c.qty > 0));
  };

  const submitOrder = () => {
    if (localCart.length === 0) return;
    setSelectedTable(activeTable);
    setOrderType('Dine In');
    localCart.forEach(item => addToCart(item, item.qty, item.modifiers || [], item.note || ''));
    sendOrderToKitchen();
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div style={{
        minHeight: '100vh', background: 'linear-gradient(160deg, #FDF6EE 0%, #F0E4D0 100%)',
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        padding: 32, fontFamily: 'var(--font-body)', textAlign: 'center',
      }}>
        <div style={{ animation: 'scaleIn 0.4s ease' }}>
          <div style={{ width: 80, height: 80, borderRadius: 40, background: 'var(--success-bg)', border: '3px solid var(--success)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
            <Check size={40} style={{ color: 'var(--success)' }} />
          </div>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 28, color: 'var(--espresso)', marginBottom: 10 }}>Order Placed!</h2>
          <p style={{ fontSize: 15, color: 'var(--text-secondary)', marginBottom: 8 }}>Your order has been sent to the kitchen.</p>
          <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 6 }}>{tableNumber} · {localCart.length} items</p>
          <p style={{ fontSize: 18, fontWeight: 800, color: 'var(--terracotta)', fontFamily: 'var(--font-display)', marginBottom: 32 }}>GH₵ {localGrand}</p>
          <div style={{ background: '#fff', borderRadius: 16, padding: 20, marginBottom: 24, border: '1px solid var(--border)', maxWidth: 300 }}>
            {localCart.map((item, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', fontSize: 13, borderBottom: i < localCart.length - 1 ? '1px solid var(--border)' : 'none' }}>
                <span style={{ color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: 6 }}><ItemIcon category={item.category} size={13} /> {item.name} x{item.qty}</span>
                <span style={{ fontWeight: 600 }}>GH₵ {item.price * item.qty}</span>
              </div>
            ))}
          </div>
          <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 24 }}>Sit back and relax. Your food is on its way!</p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
            <button onClick={() => { setSubmitted(false); setLocalCart([]); }} style={{ background: 'var(--terracotta)', color: '#fff', border: 'none', borderRadius: 12, padding: '12px 20px', cursor: 'pointer', fontSize: 13, fontWeight: 700, fontFamily: 'var(--font-body)' }}>
              Order More
            </button>
            <button onClick={() => setCurrentScreen('home')} style={{ background: 'var(--cream)', color: 'var(--espresso)', border: '1.5px solid var(--border)', borderRadius: 12, padding: '12px 20px', cursor: 'pointer', fontSize: 13, fontWeight: 600, fontFamily: 'var(--font-body)' }}>
              Back to Demo
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: '#FAF5EE', fontFamily: 'var(--font-body)', maxWidth: 430, margin: '0 auto', position: 'relative' }}>
      <div style={{ background: '#fff', padding: '14px 18px', borderBottom: '1px solid var(--border)', position: 'sticky', top: 0, zIndex: 10, boxShadow: '0 2px 10px rgba(0,0,0,0.06)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 32, height: 32, borderRadius: 8, background: 'linear-gradient(135deg, var(--terracotta), var(--espresso))', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
              <Utensils size={18} />
            </div>
            <div>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 16, fontWeight: 700, color: 'var(--espresso)' }}>Table<span style={{ color: 'var(--terracotta)' }}>Mind</span></div>
              <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>ordermenu.tablemind.com</div>
            </div>
          </div>
          <button onClick={() => setCurrentScreen('home')} style={{ background: 'var(--cream)', border: '1px solid var(--border)', borderRadius: 8, padding: '5px 10px', cursor: 'pointer', fontSize: 11, fontFamily: 'var(--font-body)', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 4 }}>
            <Home size={11} /> Demo
          </button>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--espresso)', display: 'flex', alignItems: 'center', gap: 4 }}><TableProperties size={13} /> {tableNumber}</span>
            <span style={{ fontSize: 10, background: 'var(--cream)', color: 'var(--text-muted)', padding: '2px 8px', borderRadius: 10 }}>Dine In</span>
          </div>
          <button
            onClick={() => setShowQrCode(prev => !prev)}
            style={{
              background: '#fff',
              border: '1px solid var(--border)',
              borderRadius: 10,
              padding: '6px 10px',
              cursor: 'pointer',
              fontSize: 11,
              fontWeight: 700,
              fontFamily: 'var(--font-body)',
              color: 'var(--text-secondary)',
              display: 'flex',
              alignItems: 'center',
              gap: 5,
            }}
          >
            <QrCode size={13} /> {showQrCode ? 'Hide QR' : 'Show QR'}
          </button>
        </div>
      </div>

      {showQrCode && (
        <div style={{ padding: '16px 16px 0' }}>
          <div style={{
            background: '#fff',
            borderRadius: 18,
            border: '1px solid var(--border)',
            boxShadow: 'var(--shadow-sm)',
            padding: 18,
            textAlign: 'center',
          }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--espresso)', marginBottom: 6 }}>
              Scan to open this table menu
            </div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 14 }}>
              Deep link: {tableNumber} QR ordering
            </div>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 12 }}>
              <div style={{ background: '#fff', padding: 10, borderRadius: 16, border: '1px solid var(--border)' }}>
                <QRCodeCanvas value={qrValue} size={180} includeMargin bgColor="#FFFFFF" fgColor="#2C1810" level="M" />
              </div>
            </div>
            <div style={{ fontSize: 10, color: 'var(--text-muted)', wordBreak: 'break-all', lineHeight: 1.5 }}>
              {qrValue}
            </div>
          </div>
        </div>
      )}

      <div style={{ background: 'linear-gradient(135deg, var(--terracotta), #A03018)', padding: '20px 18px', color: '#fff', position: 'relative', overflow: 'hidden', marginTop: 16 }}>
        <div style={{ fontSize: 18, fontWeight: 700, fontFamily: 'var(--font-display)', marginBottom: 4 }}>Craving made simple.</div>
        <div style={{ fontSize: 12, opacity: 0.85 }}>Good food, great experience.</div>
      </div>

      <div style={{ padding: '14px 16px 8px', background: '#fff', borderBottom: '1px solid var(--border)' }}>
        <div style={{ display: 'flex', gap: 6, overflowX: 'auto' }}>
          {CATEGORIES.map(cat => (
            <button key={cat} onClick={() => setCategory(cat)} style={{
              padding: '5px 12px', borderRadius: 16, border: 'none', cursor: 'pointer', whiteSpace: 'nowrap',
              fontSize: 12, fontWeight: 600, fontFamily: 'var(--font-body)',
              background: category === cat ? 'var(--terracotta)' : 'var(--cream)',
              color: category === cat ? '#fff' : 'var(--text-secondary)',
            }}>{cat}</button>
          ))}
        </div>
      </div>

      <div style={{ padding: '12px 14px', paddingBottom: localCart.length > 0 ? 100 : 20 }}>
        {filtered.map((item, i) => {
          const inCart = localCart.find(c => c.id === item.id);
          return (
            <div key={item.id} style={{
              background: '#fff', borderRadius: 14, border: '1px solid var(--border)',
              padding: '14px', marginBottom: 10, display: 'flex', gap: 12, alignItems: 'center',
              animation: `fadeIn 0.3s ease ${i * 0.04}s both`,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 36, height: 36, flexShrink: 0 }}>
                <ItemIcon category={item.category} size={30} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 2 }}>
                  <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--espresso)' }}>{item.name}</span>
                  {item.popular && <Sparkles size={11} style={{ color: 'var(--warning)' }} />}
                </div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', lineHeight: 1.4, marginBottom: 6 }}>{item.description}</div>
                <span style={{ fontSize: 14, fontWeight: 800, color: 'var(--terracotta)', fontFamily: 'var(--font-display)' }}>GH₵ {item.price}</span>
              </div>
              <div>
                {inCart ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <button onClick={() => updateQty(item.id, -1)} style={{ width: 28, height: 28, borderRadius: 8, border: '1.5px solid var(--border)', background: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Minus size={12} /></button>
                    <span style={{ fontSize: 14, fontWeight: 700, width: 20, textAlign: 'center' }}>{inCart.qty}</span>
                    <button onClick={() => updateQty(item.id, 1)} style={{ width: 28, height: 28, borderRadius: 8, border: 'none', background: 'var(--terracotta)', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Plus size={12} /></button>
                  </div>
                ) : (
                  <button onClick={() => item.modifiers.length > 0 ? setModItem(item) : addItem(item)} style={{
                    background: 'var(--terracotta)', color: '#fff', border: 'none', borderRadius: 10,
                    padding: '8px 14px', cursor: 'pointer', fontSize: 12, fontWeight: 700, fontFamily: 'var(--font-body)',
                    display: 'flex', alignItems: 'center', gap: 4,
                  }}>
                    <Plus size={12} /> Add
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {localCart.length > 0 && (
        <div style={{
          position: 'fixed', bottom: 0, left: '50%', transform: 'translateX(-50%)',
          width: '100%', maxWidth: 430, background: '#fff', borderTop: '1px solid var(--border)',
          padding: '12px 16px', zIndex: 20, boxShadow: '0 -4px 20px rgba(0,0,0,0.1)',
        }}>
          {showCart && (
            <div style={{ marginBottom: 12, maxHeight: 200, overflow: 'auto' }}>
              {localCart.map((item, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '5px 0', fontSize: 13, borderBottom: i < localCart.length - 1 ? '1px solid var(--border)' : 'none' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}><ItemIcon category={item.category} size={13} /> {item.name} x{item.qty}</span>
                  <span style={{ fontWeight: 700 }}>GH₵ {item.price * item.qty}</span>
                </div>
              ))}
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', fontSize: 12, color: 'var(--text-muted)' }}>
                <span>Service Charge (5%)</span><span>GH₵ {localCharge}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', fontSize: 15, fontWeight: 800, color: 'var(--espresso)', fontFamily: 'var(--font-display)' }}>
                <span>Total</span><span>GH₵ {localGrand}</span>
              </div>
            </div>
          )}
          <div style={{ display: 'flex', gap: 10 }}>
            <button onClick={() => setShowCart(s => !s)} style={{
              flex: 1, background: 'var(--cream)', border: '1.5px solid var(--border)', borderRadius: 12,
              padding: '12px', cursor: 'pointer', fontSize: 13, fontWeight: 600, fontFamily: 'var(--font-body)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, color: 'var(--espresso)',
            }}>
              <ShoppingCart size={15} />
              Cart ({localCart.reduce((s, i) => s + i.qty, 0)}) · GH₵ {localTotal}
            </button>
            <button onClick={submitOrder} style={{
              flex: 1, background: 'var(--terracotta)', color: '#fff', border: 'none', borderRadius: 12,
              padding: '12px', cursor: 'pointer', fontSize: 13, fontWeight: 700, fontFamily: 'var(--font-body)',
            }}>
              Checkout →
            </button>
          </div>
        </div>
      )}

      {modItem && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 100, display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}>
          <div style={{ background: '#fff', borderRadius: '20px 20px 0 0', padding: 24, width: '100%', maxWidth: 430, animation: 'fadeIn 0.2s ease' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
              <div>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: 18, color: 'var(--espresso)' }}>{modItem.name}</div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>GH₵ {modItem.price}</div>
              </div>
              <button onClick={() => { setModItem(null); setSelectedMods([]); setNote(''); }} style={{ background: 'var(--cream)', border: 'none', borderRadius: 8, padding: 6, cursor: 'pointer' }}><X size={16} /></button>
            </div>
            {modItem.modifiers.map(m => (
              <div key={m} onClick={() => setSelectedMods(prev => prev.includes(m) ? prev.filter(x => x !== m) : [...prev, m])} style={{
                display: 'flex', justifyContent: 'space-between', padding: '10px 12px', borderRadius: 10, cursor: 'pointer', marginBottom: 6,
                background: selectedMods.includes(m) ? 'var(--terracotta-pale)' : 'var(--cream)',
                border: `1.5px solid ${selectedMods.includes(m) ? 'var(--terracotta)' : 'transparent'}`,
              }}>
                <span style={{ fontSize: 13, fontWeight: 500 }}>{m}</span>
                {selectedMods.includes(m) && <Check size={14} style={{ color: 'var(--terracotta)' }} />}
              </div>
            ))}
            <input value={note} onChange={e => setNote(e.target.value)} placeholder="Special instructions..."
              style={{ width: '100%', padding: '10px 12px', borderRadius: 10, border: '1.5px solid var(--border)', fontSize: 13, fontFamily: 'var(--font-body)', marginTop: 8, marginBottom: 14, outline: 'none', background: 'var(--cream)' }} />
            <button onClick={() => { addItem(modItem, 1, selectedMods, note); setModItem(null); setSelectedMods([]); setNote(''); }} style={{
              width: '100%', background: 'var(--terracotta)', color: '#fff', border: 'none', borderRadius: 12,
              padding: '13px', cursor: 'pointer', fontSize: 14, fontWeight: 700, fontFamily: 'var(--font-body)',
            }}>Add to Cart</button>
          </div>
        </div>
      )}

      <div style={{ textAlign: 'center', padding: '8px 0 80px', fontSize: 11, color: 'var(--text-muted)' }}>Made for Ghana</div>
    </div>
  );
}
