import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Card, Badge, useViewport } from '../components/Shared';
import {
  AlertTriangle, ClipboardList, Package, Plus, ShieldAlert,
  Sparkles, Trash2, ArrowUpRight, TrendingUp, CheckCircle, RefreshCw
} from 'lucide-react';

export default function InventoryScreen() {
  const { showNotification } = useApp();
  const { isMobile, isTablet } = useViewport();

  // 1. Initial State for Inventory items
  const [items, setItems] = useState([
    { id: 1, name: 'Tilapia Fish', category: 'Proteins', stock: 6, unit: 'portions', reorder: 20, status: 'low stock', affectedMenu: ['Banku & Tilapia', 'Grilled Tilapia'] },
    { id: 2, name: 'Sobolo Leaves', category: 'Beverages', stock: 1.2, unit: 'kg', reorder: 5, status: 'low stock', affectedMenu: ['Sobolo'] },
    { id: 3, name: 'Banku Mix', category: 'Carbs', stock: 0, unit: 'kg', reorder: 10, status: 'out of stock', affectedMenu: ['Banku & Tilapia', 'Banku & Tilapia (with banku)', 'Traditional Banku'] },
    { id: 4, name: 'Perfume Rice', category: 'Carbs', stock: 12, unit: 'kg', reorder: 20, status: 'low stock', affectedMenu: ['Jollof Rice', 'Fried Rice'] },
    { id: 5, name: 'Chicken Breast', category: 'Proteins', stock: 35, unit: 'kg', reorder: 15, status: 'good', affectedMenu: [] },
    { id: 6, name: 'Yam', category: 'Carbs', stock: 18, unit: 'tubers', reorder: 15, status: 'good', affectedMenu: [] },
    { id: 7, name: 'Shito Sauce Batch', category: 'Sauces', stock: 4.5, unit: 'L', reorder: 3, status: 'needs review', affectedMenu: ['All Mains'] },
    { id: 8, name: 'Cooking Oil', category: 'Pantry', stock: 25, unit: 'L', reorder: 10, status: 'good', affectedMenu: [] }
  ]);

  // 2. Initial State for Waste Log
  const [wasteLog, setWasteLog] = useState([
    { id: 1, item: 'Prepared Rice', qty: '4.5 kg', reason: 'Spoilage (Leftover)', loss: 120, staff: 'Kofi Mensah', time: 'Yesterday' },
    { id: 2, item: 'Tilapia Fish', qty: '2 portions', reason: 'Burnt in grill', loss: 80, staff: 'Yaw Addo', time: 'Today, 10:15 AM' },
    { id: 3, item: 'Sobolo Drink', qty: '1.5 L', reason: 'Spillage', loss: 25, staff: 'Ama Osei', time: 'Today, 09:30 AM' }
  ]);

  // Menu items status tracker (mock state for menu availability connection)
  const [menuAvailability, setMenuAvailability] = useState({
    'Banku & Tilapia': 'Available',
    'Grilled Tilapia': 'Available',
    'Traditional Banku': 'Available',
    'Sobolo': 'Available'
  });

  // Modal control for adding waste
  const [showWasteModal, setShowWasteModal] = useState(false);
  const [newWaste, setNewWaste] = useState({
    item: 'Tilapia Fish',
    qty: '',
    reason: 'Spoilage',
    loss: '',
    staff: 'Kwame Asante'
  });

  // Dynamic statistics
  const lowStockCount = items.filter(i => i.status === 'low stock').length;
  const outOfStockCount = items.filter(i => i.status === 'out of stock').length;
  const totalWasteToday = wasteLog
    .filter(w => w.time.includes('Today'))
    .reduce((sum, w) => sum + Number(w.loss || 0), 0);

  // Sum affected menu items
  const totalAffectedMenuItems = items
    .filter(i => i.status === 'out of stock' || i.status === 'low stock')
    .reduce((acc, curr) => acc + curr.affectedMenu.length, 0);

  // Restock action
  const handleRestock = (id, name) => {
    setItems(prev => prev.map(i => {
      if (i.id === id) {
        return { ...i, stock: i.reorder * 2, status: 'good' };
      }
      return i;
    }));
    showNotification(`Restocked ${name} successfully!`, 'success');
  };

  // Mark menu items as unavailable due to ingredient depletion
  const markMenuUnavailable = (itemNames) => {
    setMenuAvailability(prev => {
      const updated = { ...prev };
      itemNames.forEach(name => {
        updated[name] = 'Unavailable';
      });
      return updated;
    });
    showNotification(`Flagged affected items (${itemNames.join(', ')}) as UNAVAILABLE on menu`, 'warning');
  };

  // Mark single menu item status back to available (for interactive toggles)
  const toggleMenuSingle = (name) => {
    setMenuAvailability(prev => ({
      ...prev,
      [name]: prev[name] === 'Available' ? 'Unavailable' : 'Available'
    }));
    showNotification(`${name} is now ${menuAvailability[name] === 'Available' ? 'UNAVAILABLE' : 'AVAILABLE'}`, 'info');
  };

  // Add Waste Log Action
  const submitWasteLog = (e) => {
    e.preventDefault();
    if (!newWaste.qty || !newWaste.loss) {
      showNotification('Please fill in quantity and estimated loss.', 'error');
      return;
    }

    const logEntry = {
      id: Date.now(),
      item: newWaste.item,
      qty: newWaste.qty,
      reason: newWaste.reason,
      loss: Number(newWaste.loss),
      staff: newWaste.staff,
      time: 'Today, Just Now'
    };

    setWasteLog([logEntry, ...wasteLog]);
    setShowWasteModal(false);
    setNewWaste({
      item: 'Tilapia Fish',
      qty: '',
      reason: 'Spoilage',
      loss: '',
      staff: 'Kwame Asante'
    });
    showNotification(`Logged GH₵ ${logEntry.loss} waste entry for ${logEntry.item}`, 'success');
  };

  const statusColors = {
    'good': 'green',
    'low stock': 'amber',
    'out of stock': 'red',
    'needs review': 'blue'
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
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 18, color: 'var(--espresso)', margin: 0 }}>Inventory Dashboard</h2>
          <p style={{ fontSize: 11, color: 'var(--text-muted)', margin: '2px 0 0 0' }}>Real-time stock quantities, menu links, and waste analytics</p>
        </div>
        <button
          onClick={() => setShowWasteModal(true)}
          style={{
            background: 'var(--terracotta)', color: '#fff', border: 'none',
            borderRadius: 8, padding: '10px 16px', cursor: 'pointer', fontSize: 12,
            fontWeight: 600, fontFamily: 'var(--font-body)', display: 'flex', alignItems: 'center', gap: 6
          }}
        >
          <Plus size={14} /> Log Waste / Loss
        </button>
      </div>

      {/* OVERVIEW CARDS */}
      <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : isTablet ? '1fr 1fr' : 'repeat(4, 1fr)', gap: 14 }}>
        {/* Low Stock Items */}
        <Card style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{ width: 44, height: 44, borderRadius: 10, background: 'var(--warning-bg)', color: 'var(--warning)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <AlertTriangle size={22} />
          </div>
          <div>
            <div style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: 600 }}>LOW STOCK ITEMS</div>
            <div style={{ fontSize: 24, fontWeight: 700, color: 'var(--espresso)', fontFamily: 'var(--font-display)', marginTop: 2 }}>{lowStockCount} items</div>
          </div>
        </Card>

        {/* Out of Stock Items */}
        <Card style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 14, border: outOfStockCount > 0 ? '1.5px solid var(--terracotta)' : '1px solid var(--border)' }}>
          <div style={{ width: 44, height: 44, borderRadius: 10, background: 'var(--terracotta-pale)', color: 'var(--terracotta)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <ShieldAlert size={22} />
          </div>
          <div>
            <div style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: 600 }}>OUT OF STOCK</div>
            <div style={{ fontSize: 24, fontWeight: 700, color: outOfStockCount > 0 ? 'var(--terracotta)' : 'var(--espresso)', fontFamily: 'var(--font-display)', marginTop: 2 }}>{outOfStockCount} items</div>
          </div>
        </Card>

        {/* Waste Logged Today */}
        <Card style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{ width: 44, height: 44, borderRadius: 10, background: '#EAF4EB', color: 'var(--success)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Trash2 size={22} />
          </div>
          <div>
            <div style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: 600 }}>WASTE LOSS TODAY</div>
            <div style={{ fontSize: 24, fontWeight: 700, color: 'var(--espresso)', fontFamily: 'var(--font-display)', marginTop: 2 }}>GH₵ {totalWasteToday}</div>
          </div>
        </Card>

        {/* Restocks & Menu Affected */}
        <Card style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{ width: 44, height: 44, borderRadius: 10, background: '#EEF4FC', color: '#1A56A0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Package size={22} />
          </div>
          <div>
            <div style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: 600 }}>AFFECTED MENU ITEMS</div>
            <div style={{ fontSize: 24, fontWeight: 700, color: 'var(--espresso)', fontFamily: 'var(--font-display)', marginTop: 2 }}>{totalAffectedMenuItems} active</div>
          </div>
        </Card>
      </div>

      {/* MID SECTION: Needs Attention & AI Insights */}
      <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : isTablet ? '1fr' : '1fr 1fr', gap: 16 }}>
        {/* Needs Attention Panel */}
        <Card style={{ padding: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 15, color: 'var(--espresso)', margin: 0, display: 'flex', alignItems: 'center', gap: 6 }}>
              <ShieldAlert size={16} style={{ color: 'var(--terracotta)' }} /> Needs Attention
            </h3>
            <Badge color="red">Action Required</Badge>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {/* Alert: Tilapia */}
            <div style={{ padding: '10px 14px', borderRadius: 8, background: 'var(--warning-bg)', borderLeft: '4px solid var(--warning)', fontSize: 12 }}>
              <div style={{ fontWeight: 700, color: 'var(--espresso)' }}>Tilapia is low</div>
              <p style={{ color: 'var(--text-secondary)', margin: '3px 0 0' }}>Only <strong>6 portions left</strong> in active stock. Kitchen will stop taking Tilapia orders soon.</p>
            </div>

            {/* Alert: Sobolo */}
            <div style={{ padding: '10px 14px', borderRadius: 8, background: 'var(--warning-bg)', borderLeft: '4px solid var(--warning)', fontSize: 12 }}>
              <div style={{ fontWeight: 700, color: 'var(--espresso)' }}>Sobolo dinner rush risk</div>
              <p style={{ color: 'var(--text-secondary)', margin: '3px 0 0' }}>Leaves quantity (1.2 kg) is low. Projection warns Sobolo stock may run out during the 7PM dinner rush.</p>
            </div>

            {/* Alert: Banku Out of stock -> Menu unavailability connection */}
            <div style={{ padding: '12px 14px', borderRadius: 8, background: 'var(--terracotta-pale)', borderLeft: '4px solid var(--terracotta)', fontSize: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
                <div>
                  <div style={{ fontWeight: 700, color: 'var(--espresso)' }}>Banku is out of stock</div>
                  <p style={{ color: 'var(--text-secondary)', margin: '3px 0' }}>Ingredient depleted. Related menu items should be marked unavailable.</p>
                  <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginTop: 6 }}>
                    {['Banku & Tilapia', 'Traditional Banku'].map(item => (
                      <span key={item} style={{
                        fontSize: 9, padding: '2px 6px', borderRadius: 4,
                        background: menuAvailability[item] === 'Unavailable' ? 'var(--terracotta-pale)' : '#fff',
                        border: `1px solid ${menuAvailability[item] === 'Unavailable' ? 'var(--terracotta)' : 'var(--border)'}`,
                        color: menuAvailability[item] === 'Unavailable' ? 'var(--terracotta)' : 'var(--text-secondary)',
                        fontWeight: 600
                      }}>
                        {item}: {menuAvailability[item]}
                      </span>
                    ))}
                  </div>
                </div>
                <button
                  onClick={() => markMenuUnavailable(['Banku & Tilapia', 'Traditional Banku'])}
                  style={{
                    alignSelf: 'center', background: 'var(--terracotta)', color: '#fff',
                    border: 'none', borderRadius: 6, padding: '6px 10px', fontSize: 10,
                    fontWeight: 700, cursor: 'pointer', transition: 'all 0.15s'
                  }}
                >
                  Mark Menu Items Unavailable
                </button>
              </div>
            </div>

            {/* Alert: Rice */}
            <div style={{ padding: '10px 14px', borderRadius: 8, background: 'var(--warning-bg)', borderLeft: '4px solid var(--warning)', fontSize: 12 }}>
              <div style={{ fontWeight: 700, color: 'var(--espresso)' }}>Rice below reorder level</div>
              <p style={{ color: 'var(--text-secondary)', margin: '3px 0' }}>12 kg remaining (Minimum reorder point: 20 kg).</p>
            </div>
          </div>
        </Card>

        {/* AI Inventory Insights Box */}
        <Card style={{
          padding: 20,
          background: 'linear-gradient(135deg, rgba(44, 24, 16, 0.03), rgba(192, 69, 42, 0.03))',
          border: '1.5px solid var(--nude)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between'
        }}>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 15, color: 'var(--espresso)', margin: 0, display: 'flex', alignItems: 'center', gap: 6 }}>
                <Sparkles size={16} style={{ color: 'var(--terracotta)' }} /> AI Operations Intelligence
              </h3>
              <span style={{ fontSize: 9, background: 'var(--terracotta-pale)', color: 'var(--terracotta)', padding: '2px 8px', borderRadius: 10, fontWeight: 700, letterSpacing: '0.04em' }}>
                LEARNING PATTERNS
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {/* Insight 1 */}
              <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: 2 }}>
                  <TrendingUp size={16} style={{ color: 'var(--success)' }} />
                </div>
                <div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--espresso)' }}>Tilapia sales spike detected</div>
                  <p style={{ fontSize: 11, color: 'var(--text-secondary)', marginTop: 2, lineHeight: 1.4 }}>
                    Tilapia is selling <strong>42% faster</strong> than usual today. At the current consumption rate, existing stock (6 portions) will run out before <strong>7:45 PM</strong>. Suggest ordering emergency delivery or directing customer focus to Jollof Rice.
                  </p>
                </div>
              </div>

              {/* Insight 2 */}
              <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: 2 }}>
                  <Trash2 size={16} style={{ color: 'var(--text-secondary)' }} />
                </div>
                <div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--espresso)' }}>Prepared Rice waste patterns</div>
                  <p style={{ fontSize: 11, color: 'var(--text-secondary)', marginTop: 2, lineHeight: 1.4 }}>
                    Waste is highest on **prepared rice** on Tuesdays. Historically, demand drops by 20% on mid-week slow days. Recommendation: Adjust lunch preparation batch size from 15 kg down to 10 kg on Tuesdays to cut estimated loss by GH₵ 40/week.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div style={{
            marginTop: 18, borderTop: '1px dashed var(--border)', paddingTop: 12,
            fontSize: 10, color: 'var(--text-muted)', lineHeight: 1.4
          }}>
            <strong><Sparkles size={11} style={{ display: 'inline', marginRight: 2, verticalAlign: 'middle', color: 'var(--terracotta)' }} /> AI Future Note:</strong> TableMind AI models are accumulating operational data. Over time, the AI will learn your seasonal cycles, predict stockouts 3 days in advance, and automatically generate purchase orders for review.
          </div>
        </Card>
      </div>

      {/* INVENTORY ITEMS TABLE */}
      <Card style={{ padding: 20, maxWidth: '100%', overflow: 'hidden' }}>
        <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 16, color: 'var(--espresso)', marginBottom: 14 }}>
          Inventory Stock Ledger
        </h3>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12, textAlign: 'left', minWidth: 650 }}>
            <thead>
              <tr style={{ borderBottom: '1.5px solid var(--border)', color: 'var(--text-muted)' }}>
                <th style={{ padding: '8px 4px' }}>Item Name</th>
                <th style={{ padding: '8px 4px' }}>Category</th>
                <th style={{ padding: '8px 4px' }}>Stock Level</th>
                <th style={{ padding: '8px 4px' }}>Reorder Threshold</th>
                <th style={{ padding: '8px 4px' }}>Status</th>
                <th style={{ padding: '8px 4px' }}>Affected Menu</th>
                <th style={{ padding: '8px 4px', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map(item => (
                <tr key={item.id} style={{ borderBottom: '1px solid var(--border)' }}>
                  <td style={{ padding: '10px 4px', fontWeight: 600 }}>{item.name}</td>
                  <td style={{ padding: '10px 4px' }}>{item.category}</td>
                  <td style={{ padding: '10px 4px', fontWeight: 700, color: item.status === 'out of stock' ? 'var(--terracotta)' : item.status === 'low stock' ? 'var(--warning)' : 'inherit' }}>
                    {item.stock} {item.unit}
                  </td>
                  <td style={{ padding: '10px 4px' }}>{item.reorder} {item.unit}</td>
                  <td style={{ padding: '10px 4px' }}>
                    <Badge color={statusColors[item.status]}>
                      {item.status.toUpperCase()}
                    </Badge>
                  </td>
                  <td style={{ padding: '10px 4px', color: 'var(--text-secondary)' }}>
                    {item.affectedMenu.length > 0 ? (
                      <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                        {item.affectedMenu.map(m => (
                          <button
                            key={m}
                            onClick={() => toggleMenuSingle(m)}
                            style={{
                              fontSize: 9, border: 'none', borderRadius: 4, padding: '1px 5px',
                              cursor: 'pointer', fontWeight: 600,
                              background: menuAvailability[m] === 'Unavailable' ? 'var(--terracotta-pale)' : 'var(--cream)',
                              color: menuAvailability[m] === 'Unavailable' ? 'var(--terracotta)' : 'var(--text-secondary)'
                            }}
                            title="Click to toggle menu availability"
                          >
                            {m}
                            <span style={{
                              display: 'inline-block',
                              width: 6,
                              height: 6,
                              borderRadius: '50%',
                              background: menuAvailability[m] === 'Unavailable' ? 'var(--terracotta)' : 'var(--success)',
                              marginLeft: 5,
                              verticalAlign: 'middle'
                            }} />
                          </button>
                        ))}
                      </div>
                    ) : 'None'}
                  </td>
                  <td style={{ padding: '10px 4px', textAlign: 'right' }}>
                    {item.status !== 'good' && (
                      <button
                        onClick={() => handleRestock(item.id, item.name)}
                        style={{
                          background: 'var(--terracotta-pale)', border: 'none', borderRadius: 4,
                          padding: '4px 8px', fontSize: 10, cursor: 'pointer', fontWeight: 700,
                          color: 'var(--terracotta)', transition: 'all 0.15s'
                        }}
                      >
                        Restock
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* WASTE & LOSS LOG */}
      <Card style={{ padding: 20, maxWidth: '100%', overflow: 'hidden' }}>
        <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 16, color: 'var(--espresso)', marginBottom: 12 }}>
          Waste & Loss Ledger Log
        </h3>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12, textAlign: 'left', minWidth: 600 }}>
            <thead>
              <tr style={{ borderBottom: '1.5px solid var(--border)', color: 'var(--text-muted)' }}>
                <th style={{ padding: '8px 4px' }}>Waste Item</th>
                <th style={{ padding: '8px 4px' }}>Quantity</th>
                <th style={{ padding: '8px 4px' }}>Reason for Loss</th>
                <th style={{ padding: '8px 4px' }}>Est. Loss (Ghc)</th>
                <th style={{ padding: '8px 4px' }}>Logged Staff</th>
                <th style={{ padding: '8px 4px' }}>Timestamp</th>
              </tr>
            </thead>
            <tbody>
              {wasteLog.map((log) => (
                <tr key={log.id} style={{ borderBottom: '1px solid var(--border)' }}>
                  <td style={{ padding: '10px 4px', fontWeight: 600 }}>{log.item}</td>
                  <td style={{ padding: '10px 4px' }}>{log.qty}</td>
                  <td style={{ padding: '10px 4px', color: 'var(--text-secondary)' }}>{log.reason}</td>
                  <td style={{ padding: '10px 4px', fontWeight: 700, color: 'var(--terracotta)' }}>GH₵ {log.loss}</td>
                  <td style={{ padding: '10px 4px' }}>{log.staff}</td>
                  <td style={{ padding: '10px 4px', color: 'var(--text-muted)', fontSize: 10 }}>{log.time}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* LOG WASTE MODAL */}
      {showWasteModal && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(26,15,10,0.45)',
          backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center',
          justifyContent: 'center', zIndex: 1000, padding: 16
        }}>
          <form onSubmit={submitWasteLog} className="fade-in" style={{
            background: '#fff', borderRadius: 'var(--radius-lg)',
            width: '100%', maxWidth: 450, border: '1px solid var(--border)',
            boxShadow: 'var(--shadow-lg)', overflow: 'hidden'
          }}>
            <div style={{ background: 'var(--espresso)', color: '#fff', padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h4 style={{ margin: 0, fontFamily: 'var(--font-display)', fontSize: 16 }}>Log Waste / Loss Entry</h4>
              <button
                type="button"
                onClick={() => setShowWasteModal(false)}
                style={{ background: 'transparent', border: 'none', color: '#fff', cursor: 'pointer' }}
              >
                <X size={18} />
              </button>
            </div>
            <div style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                <label style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-secondary)' }}>Select Ingredient</label>
                <select
                  value={newWaste.item}
                  onChange={e => setNewWaste(prev => ({ ...prev, item: e.target.value }))}
                  style={{ width: '100%', padding: 8, border: '1px solid var(--border)', borderRadius: 6, background: '#fff', fontSize: 12 }}
                >
                  {items.map(i => (
                    <option key={i.id} value={i.name}>{i.name}</option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: 12 }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  <label style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-secondary)' }}>Quantity (e.g. 3 portions, 2 kg)</label>
                  <input
                    type="text"
                    required
                    placeholder="2 kg"
                    value={newWaste.qty}
                    onChange={e => setNewWaste(prev => ({ ...prev, qty: e.target.value }))}
                    style={{ width: '100%', padding: 8, border: '1px solid var(--border)', borderRadius: 6, fontSize: 12 }}
                  />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  <label style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-secondary)' }}>Est. Loss Amount (Ghc)</label>
                  <input
                    type="number"
                    required
                    placeholder="60"
                    value={newWaste.loss}
                    onChange={e => setNewWaste(prev => ({ ...prev, loss: e.target.value }))}
                    style={{ width: '100%', padding: 8, border: '1px solid var(--border)', borderRadius: 6, fontSize: 12 }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                <label style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-secondary)' }}>Reason for Loss</label>
                <select
                  value={newWaste.reason}
                  onChange={e => setNewWaste(prev => ({ ...prev, reason: e.target.value }))}
                  style={{ width: '100%', padding: 8, border: '1px solid var(--border)', borderRadius: 6, background: '#fff', fontSize: 12 }}
                >
                  <option value="Spoilage">Spoilage / Expired</option>
                  <option value="Prepared Excess">Prepared Excess (Leftover)</option>
                  <option value="Burnt/Dropped">Dropped / Burnt / Damaged</option>
                  <option value="Customer Return">Customer Return (Incorrect Prep)</option>
                </select>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                <label style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-secondary)' }}>Logged Staff</label>
                <select
                  value={newWaste.staff}
                  onChange={e => setNewWaste(prev => ({ ...prev, staff: e.target.value }))}
                  style={{ width: '100%', padding: 8, border: '1px solid var(--border)', borderRadius: 6, background: '#fff', fontSize: 12 }}
                >
                  <option value="Kwame Asante">Kwame Asante (Admin)</option>
                  <option value="Kofi Mensah">Kofi Mensah (Server)</option>
                  <option value="Yaw Addo">Yaw Addo (Chef)</option>
                  <option value="Esi Boateng">Esi Boateng (Chef)</option>
                </select>
              </div>
            </div>
            <div style={{ background: 'var(--cream)', padding: '12px 20px', display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
              <button
                type="button"
                onClick={() => setShowWasteModal(false)}
                style={{
                  background: '#fff', color: 'var(--espresso)', border: '1px solid var(--border)',
                  borderRadius: 6, padding: '8px 14px', fontSize: 12, fontWeight: 600, cursor: 'pointer'
                }}
              >
                Cancel
              </button>
              <button
                type="submit"
                style={{
                  background: 'var(--terracotta)', color: '#fff', border: 'none',
                  borderRadius: 6, padding: '8px 14px', fontSize: 12, fontWeight: 600, cursor: 'pointer'
                }}
              >
                Log Waste Entry
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

// Mock X icon definition for the waste modal close button in case it isn't imported correctly
function X({ size = 18 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="6" x2="6" y2="18"></line>
      <line x1="6" y1="6" x2="18" y2="18"></line>
    </svg>
  );
}
