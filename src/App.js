import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Notification } from './components/Shared';
import HomeScreen from './screens/HomeScreen';
import DashboardScreen from './screens/DashboardScreen';
import POSScreen from './screens/POSScreen';
import KDSScreen from './screens/KDSScreen';
import QROrderingScreen from './screens/QROrderingScreen';
import OrderHistoryScreen from './screens/OrderHistoryScreen';
import OfflineScreen from './screens/OfflineScreen';
import './index.css';

function Router() {
  const { currentScreen } = useApp();
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
