import React, { useEffect } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Notification } from './components/Shared';
import { TABLES } from './data';
import HomeScreen from './screens/HomeScreen';
import DashboardScreen from './screens/DashboardScreen';
import POSScreen from './screens/POSScreen';
import KDSScreen from './screens/KDSScreen';
import QROrderingScreen from './screens/QROrderingScreen';
import OrderHistoryScreen from './screens/OrderHistoryScreen';
import OfflineScreen from './screens/OfflineScreen';
import './index.css';

function Router() {
  const { currentScreen, setCurrentScreen, setSelectedTable, setOrderType } = useApp();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const screen = params.get('screen');
    const table = params.get('table');

    if (screen === 'qr') {
      setCurrentScreen('qr');
      setOrderType('Dine In');

      if (table) {
        const normalizedTable = String(Number.parseInt(table, 10)).padStart(2, '0');
        const matchedTable = TABLES.find(t => t.number.endsWith(normalizedTable));
        setSelectedTable(matchedTable || { id: Number.parseInt(table, 10) || 12, number: `Table ${normalizedTable}` });
      }
    }
  }, [setCurrentScreen, setOrderType, setSelectedTable]);

  const screens = {
    home: <HomeScreen />,
    dashboard: <DashboardScreen />,
    pos: <POSScreen />,
    kds: <KDSScreen />,
    qr: <QROrderingScreen />,
    history: <OrderHistoryScreen />,
    offline: <OfflineScreen />,
  };

  return (
    <>
      <Notification />
      {screens[currentScreen] || <HomeScreen />}
    </>
  );
}

export default function App() {
  return (
    <AppProvider>
      <Router />
    </AppProvider>
  );
}
