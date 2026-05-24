import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { INITIAL_KDS_ORDERS, ORDER_HISTORY } from '../data';

const AppContext = createContext();

export function AppProvider({ children }) {
  const [currentScreen, setCurrentScreen] = useState('home');
  const [isOnline, setIsOnline] = useState(true);
  const [kdsOrders, setKdsOrders] = useState(INITIAL_KDS_ORDERS);
  const [orderHistory, setOrderHistory] = useState(ORDER_HISTORY);
  const [pendingSyncOrders, setPendingSyncOrders] = useState([]);
  const [cart, setCart] = useState([]);
  const [selectedTable, setSelectedTable] = useState(null);
  const [orderType, setOrderType] = useState('Dine In');
  const [nextOrderId, setNextOrderId] = useState(1025);
  const [dashboardStats, setDashboardStats] = useState({
    liveOrders: 24,
    totalSales: 18540,
    inventory: 7,
    waste: 12,
    customers: 156,
    peakHours: '7PM - 9PM',
  });
  const [notification, setNotification] = useState(null);
  const timerRef = useRef({});

  // Tick timers every second
  const [tick, setTick] = useState(0);
  useEffect(() => {
    const interval = setInterval(() => setTick(t => t + 1), 1000);
    return () => clearInterval(interval);
  }, []);

  const getElapsedMins = (placedAt) => Math.floor((Date.now() - placedAt) / 60000);

  const showNotification = (msg, type = 'success') => {
    setNotification({ msg, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const addToCart = (item, qty = 1, modifiers = [], note = '') => {
    setCart(prev => {
      const existing = prev.find(c => c.id === item.id && c.note === note && JSON.stringify(c.modifiers) === JSON.stringify(modifiers));
      if (existing) {
        return prev.map(c => c.id === item.id && c.note === note ? { ...c, qty: c.qty + qty } : c);
      }
      return [...prev, { ...item, qty, modifiers, note }];
    });
  };

  const removeFromCart = (idx) => setCart(prev => prev.filter((_, i) => i !== idx));

  const updateCartQty = (idx, delta) => {
    setCart(prev => {
      const updated = prev.map((c, i) => i === idx ? { ...c, qty: Math.max(0, c.qty + delta) } : c);
      return updated.filter(c => c.qty > 0);
    });
  };

  const cartTotal = cart.reduce((sum, c) => sum + c.price * c.qty, 0);
  const serviceCharge = Math.round(cartTotal * 0.05);
  const cartGrandTotal = cartTotal + serviceCharge;

  const sendOrderToKitchen = () => {
    if (cart.length === 0) return;
    const newOrder = {
      id: nextOrderId,
      status: 'new',
      table: selectedTable ? selectedTable.number : 'Takeaway',
      type: orderType,
      placedAt: Date.now(),
      items: cart.map(c => ({
        name: c.name,
        qty: c.qty,
        note: c.modifiers.length > 0 ? c.modifiers.join(', ') : c.note || undefined,
      })),
      targetMins: 12,
    };

    if (!isOnline) {
      setPendingSyncOrders(prev => [...prev, { ...newOrder, syncStatus: 'pending' }]);
      showNotification(`Order #${nextOrderId} saved offline — will sync when connected`, 'warning');
    } else {
      setKdsOrders(prev => [newOrder, ...prev]);
      setDashboardStats(prev => ({ ...prev, liveOrders: prev.liveOrders + 1, totalSales: prev.totalSales + cartGrandTotal }));
      showNotification(`Order #${nextOrderId} sent to kitchen!`, 'success');
    }

    setNextOrderId(prev => prev + 1);
    setCart([]);
  };

  const updateKdsStatus = (orderId, newStatus) => {
    setKdsOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus, readyAt: newStatus === 'ready' ? Date.now() : o.readyAt } : o));
    if (newStatus === 'completed') {
      const order = kdsOrders.find(o => o.id === orderId);
      if (order) {
        const serviceTime = getElapsedMins(order.placedAt);
        const historyEntry = {
          id: order.id,
          table: order.table,
          type: order.type,
          items: order.items.map(i => `${i.name} x${i.qty}`),
          total: 0,
          payment: 'Pending',
          syncStatus: 'Synced',
          serviceTime,
          placedAt: new Date(order.placedAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
          servedAt: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
        };
        setOrderHistory(prev => [historyEntry, ...prev]);
        setDashboardStats(prev => ({ ...prev, liveOrders: Math.max(0, prev.liveOrders - 1) }));
      }
      setTimeout(() => setKdsOrders(prev => prev.filter(o => o.id !== orderId)), 2000);
    }
  };

  const toggleOnline = () => {
    if (!isOnline) {
      // Going back online — sync pending orders
      setIsOnline(true);
      if (pendingSyncOrders.length > 0) {
        pendingSyncOrders.forEach(o => {
          setKdsOrders(prev => {
            if (prev.find(k => k.id === o.id)) return prev;
            return [{ ...o, syncStatus: 'synced' }, ...prev];
          });
        });
        showNotification(`${pendingSyncOrders.length} offline order(s) synced successfully!`, 'success');
        setPendingSyncOrders([]);
      } else {
        showNotification('Back online!', 'success');
      }
    } else {
      setIsOnline(false);
      showNotification('Offline mode — orders will be saved locally', 'warning');
    }
  };

  return (
    <AppContext.Provider value={{
      currentScreen, setCurrentScreen,
      isOnline, toggleOnline,
      kdsOrders, updateKdsStatus,
      orderHistory,
      pendingSyncOrders,
      cart, addToCart, removeFromCart, updateCartQty, cartTotal, serviceCharge, cartGrandTotal,
      selectedTable, setSelectedTable,
      orderType, setOrderType,
      sendOrderToKitchen,
      dashboardStats,
      nextOrderId,
      notification,
      showNotification,
      getElapsedMins,
      tick,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export const useApp = () => useContext(AppContext);
