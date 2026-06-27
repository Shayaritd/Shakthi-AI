import { useState } from 'react';
import { LandingScreen } from './screens/LandingScreen';
import { LoginScreen } from './screens/LoginScreen';
import { RegisterScreen } from './screens/RegisterScreen';
import { DashboardScreen } from './screens/DashboardScreen';
import { MentorsScreen } from './screens/MentorsScreen';
import { GrantsScreen } from './screens/GrantsScreen';
import { SafetyScreen } from './screens/SafetyScreen';
import { ProfileScreen } from './screens/ProfileScreen';
import { AiChat } from './components/AiChat';
import { BottomNav } from './components/BottomNav';
import type { Screen, Tab, Role } from './types';

export default function App() {
  const [screen, setScreen] = useState<Screen>('landing');
  const [activeTab, setActiveTab] = useState<Tab>('home');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showAiChat, setShowAiChat] = useState(false);

  function handleLogin(role: Role) {
    setIsLoggedIn(true);
    setScreen('dashboard');
    setActiveTab('home');
  }

  function handleLogout() {
    setIsLoggedIn(false);
    setScreen('landing');
    setActiveTab('home');
  }

  function handleTabChange(tab: Tab) {
    setActiveTab(tab);
  }

  function renderContent() {
    if (!isLoggedIn) {
      if (screen === 'landing') return <LandingScreen onLogin={() => setScreen('login')} onRegister={() => setScreen('register')} />;
      if (screen === 'login') return <LoginScreen onLogin={handleLogin} onBack={() => setScreen('landing')} />;
      if (screen === 'register') return <RegisterScreen onComplete={() => handleLogin('ATHLETE')} onBack={() => setScreen('landing')} />;
      return <LandingScreen onLogin={() => setScreen('login')} onRegister={() => setScreen('register')} />;
    }

    switch (activeTab) {
      case 'home': return <DashboardScreen onAiChat={() => setShowAiChat(true)} />;
      case 'mentors': return <MentorsScreen />;
      case 'grants': return <GrantsScreen />;
      case 'safety': return <SafetyScreen />;
      case 'profile': return <ProfileScreen onLogout={handleLogout} />;
      default: return <DashboardScreen onAiChat={() => setShowAiChat(true)} />;
    }
  }

  return (
    <div className="app-container">
      {renderContent()}
      {isLoggedIn && <BottomNav activeTab={activeTab} onTabChange={handleTabChange} />}
      {showAiChat && <AiChat onClose={() => setShowAiChat(false)} />}
    </div>
  );
}
