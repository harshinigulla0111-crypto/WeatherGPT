import React, { useState } from 'react';
import { DemoToolbar } from './components/common/DemoToolbar';
import { Header } from './components/common/Header';
import { Navigation } from './components/common/Navigation';
import type { NavTab } from './components/common/Navigation';
import { NotificationPanel } from './components/common/NotificationPanel';
import { Sidebar } from './components/common/Sidebar';

import { DangerTriageModal } from './components/disaster/DangerTriageModal';
import { FamilySafetyCircle } from './components/disaster/FamilySafetyCircle';
import { SafeSheltersCard } from './components/disaster/SafeSheltersCard';
import { NovaOrb } from './components/nova/NovaOrb';
import { NovaPanel } from './components/nova/NovaPanel';
import { AuthModal } from './components/profile/AuthModal';

import { AuthProvider } from './contexts/AuthContext';
import { NovaProvider } from './contexts/NovaContext';
import { useWeather, WeatherProvider } from './contexts/WeatherContext';
import { ProtectedRoute } from './auth/ProtectedRoute';

import { HomePage } from './pages/HomePage';
import { InsightsPage } from './pages/InsightsPage';
import { MapPage } from './pages/MapPage';
import { ProfilePage } from './pages/ProfilePage';
import { SafetyPage } from './pages/SafetyPage';

import { initProximityEngine } from './utils/proximityEngine';

const AppContent: React.FC = () => {
  const [activeTab, setActiveTab] = useState<NavTab>('HOME');
  const [isNotifOpen, setIsNotifOpen] = useState<boolean>(false);
  const [isDangerWizardOpen, setIsDangerWizardOpen] = useState<boolean>(false);

  const { appMode } = useWeather();
  const isDisaster = appMode === 'DISASTER';

  React.useEffect(() => {
    document.title = 'WeatherGPT';
    initProximityEngine();
  }, []);

  const renderTabContent = () => {
    switch (activeTab) {
      case 'MAP':
        return <MapPage />;
      case 'INSIGHTS':
        return <InsightsPage />;
      case 'SAFETY':
        return <SafetyPage />;
      case 'PROFILE':
        return <ProfilePage />;
      case 'SHELTERS':
        return <SafeSheltersCard />;
      case 'FAMILY':
        return <FamilySafetyCircle />;
      case 'HOME':
      default:
        return <HomePage onTriggerDangerWizard={() => setIsDangerWizardOpen(true)} />;
    }
  };

  return (
    <div className={`min-h-screen flex flex-col font-sans transition-colors duration-500 ${
      isDisaster ? 'rescue-mode-active text-red-50' : 'bg-[#080c14] text-slate-100'
    }`}>
      {/* Floating Demo Control Bar */}
      <DemoToolbar />

      {/* Primary Header */}
      <Header onOpenNotifications={() => setIsNotifOpen(true)} />

      {/* Main Container with Desktop Sidebar & Mobile Bottom Navigation */}
      <div className="flex-1 flex w-full">
        <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

        <main className="flex-1 px-4 sm:px-6 lg:px-8 py-6 pb-24 md:pb-12 min-w-0">
          {renderTabContent()}
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      <Navigation activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Signature N.O.V.A Floating Orb */}
      <NovaOrb />

      {/* N.O.V.A Expanded Interaction Panel */}
      <NovaPanel onTriggerDangerWizard={() => setIsDangerWizardOpen(true)} />

      {/* Danger Triage Wizard Modal */}
      <DangerTriageModal isOpen={isDangerWizardOpen} onClose={() => setIsDangerWizardOpen(false)} />

      {/* Notification Drawer */}
      <NotificationPanel isOpen={isNotifOpen} onClose={() => setIsNotifOpen(false)} />

      {/* Auth Modal */}
      <AuthModal />
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <WeatherProvider>
        <NovaProvider>
          <ProtectedRoute>
            <AppContent />
          </ProtectedRoute>
        </NovaProvider>
      </WeatherProvider>
    </AuthProvider>
  );
}
