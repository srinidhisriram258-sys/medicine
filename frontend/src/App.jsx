import React, { useEffect, useState, useCallback } from 'react';
import { api } from './services/api';

import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import Footer from './components/Footer';
import VaultAuthModal from './components/VaultAuthModal';

import Dashboard from './pages/Dashboard';
import Medicines from './pages/Medicines';
import Reminders from './pages/Reminders';
import TodaysDoses from './pages/TodaysDoses';
import Adherence from './pages/Adherence';
import Analytics from './pages/Analytics';
import AIInsights from './pages/AIInsights';
import PrescriptionAI from './pages/PrescriptionAI';
import Caregiver from './pages/Caregiver';
import History from './pages/History';
import NotificationCenter from './pages/NotificationCenter';
import ModelStatus from './pages/ModelStatus';
import MedicationVault from './pages/MedicationVault';
import Settings from './pages/Settings';

function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export default function App() {
  const [currentPage, setCurrentPage] = useState('dashboard');
  
  const [vaultUnlocked, setVaultUnlocked] = useState(false);
  const [vaultModalOpen, setVaultModalOpen] = useState(false);
  const [pendingPage, setPendingPage] = useState(null);

  const [installPrompt, setInstallPrompt] = useState(null);

  const [health, setHealth] = useState(null);
  const [aiStatus, setAIStatus] = useState(null);
  const [medicines, setMedicines] = useState([]);
  const [reminders, setReminders] = useState([]);
  const [stats, setStats] = useState(null);
  const [aiPrediction, setAIPrediction] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  
  const [loading, setLoading] = useState(true);
  const [backendError, setBackendError] = useState(null);

  useEffect(() => {
    const handleBeforeInstall = (e) => {
      e.preventDefault();
      setInstallPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handleBeforeInstall);

    if ('serviceWorker' in navigator) {
      const swUrl = `${import.meta.env.BASE_URL}sw.js`;
      navigator.serviceWorker.register(swUrl)
        .then(async (reg) => {
          if ('Notification' in window && Notification.permission !== 'granted') {
            try {
              await Notification.requestPermission();
            } catch (e) {}
          }

          if ('PushManager' in window && Notification.permission === 'granted') {
            try {
              const vapidRes = await api.getVapidPublicKey();
              if (vapidRes?.public_key) {
                const applicationServerKey = urlBase64ToUint8Array(vapidRes.public_key);
                let sub = await reg.pushManager.getSubscription();
                if (!sub) {
                  sub = await reg.pushManager.subscribe({
                    userVisibleOnly: true,
                    applicationServerKey: applicationServerKey
                  });
                }
                const subJSON = sub.toJSON();
                await api.subscribePush({
                  endpoint: subJSON.endpoint,
                  keys: {
                    p256dh: subJSON.keys.p256dh,
                    auth: subJSON.keys.auth
                  }
                });
              }
            } catch (err) {
              console.warn('[WEB PUSH] Subscription error:', err);
            }
          }
        })
        .catch((err) => console.warn('[PWA] SW registration failed:', err));
    }

    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
  }, []);

  const handleInstallPWA = async () => {
    if (!installPrompt) return;
    installPrompt.prompt();
    const { outcome } = await installPrompt.userChoice;
    if (outcome === 'accepted') {
      setInstallPrompt(null);
    }
  };

  const loadAllData = useCallback(async () => {
    setLoading(true);
    setBackendError(null);
    try {
      const healthRes = await api.getHealth().catch(() => ({ status: 'offline' }));
      setHealth(healthRes);

      const aiStatusRes = await api.getAIStatus().catch(() => null);
      setAIStatus(aiStatusRes);

      if (healthRes.status !== 'online') {
        setBackendError('Backend API server is offline. Please check FastAPI backend connection.');
        setLoading(false);
        return;
      }

      const [medsRes, remsRes, statsRes, aiPredRes, anaRes] = await Promise.all([
        api.getMedicines().catch(() => []),
        api.getReminders().catch(() => []),
        api.getAdherence().catch(() => null),
        api.predictRisk().catch(() => null),
        api.getAnalytics().catch(() => null),
      ]);

      setMedicines(medsRes);
      setReminders(remsRes);
      setStats(statsRes);
      setAIPrediction(aiPredRes);
      setAnalytics(anaRes);
    } catch (err) {
      console.error("App load error:", err);
      setBackendError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAllData();
  }, [loadAllData]);

  // Protected Vault Navigation Guard
  const protectedPages = ['medicines', 'adherence', 'analytics', 'ai-insights', 'caregiver', 'history', 'medication-vault'];

  const handleNavigate = (page) => {
    if (protectedPages.includes(page) && !vaultUnlocked) {
      setPendingPage(page);
      setVaultModalOpen(true);
    } else {
      setCurrentPage(page);
    }
  };

  const handleVaultUnlocked = () => {
    setVaultUnlocked(true);
    setVaultModalOpen(false);
    if (pendingPage) {
      setCurrentPage(pendingPage);
      setPendingPage(null);
    }
  };

  // Action handlers
  const handleMarkTaken = async (id) => {
    try {
      await api.markTaken(id);
      await loadAllData();
    } catch (err) {
      alert(`Action failed: ${err.message}`);
    }
  };

  const handleMarkMissed = async (id) => {
    try {
      await api.markMissed(id);
      await loadAllData();
    } catch (err) {
      alert(`Action failed: ${err.message}`);
    }
  };

  const handleSnooze = async (id) => {
    try {
      await api.snoozeReminder(id, 15);
      await loadAllData();
    } catch (err) {
      alert(`Action failed: ${err.message}`);
    }
  };

  const handleCreateMedicine = async (medData) => {
    try {
      await api.createMedicine(medData);
      await loadAllData();
    } catch (err) {
      alert(`Create failed: ${err.message}`);
    }
  };

  const handleDeleteMedicine = async (id) => {
    try {
      await api.deleteMedicine(id);
      await loadAllData();
    } catch (err) {
      alert(`Delete failed: ${err.message}`);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#08080C] text-[#F8FAFC]">
      
      {/* NAVBAR */}
      <Navbar
        health={health}
        aiStatus={aiStatus}
        vaultUnlocked={vaultUnlocked}
        onLockVault={() => setVaultUnlocked(false)}
        onOpenVaultModal={() => setVaultModalOpen(true)}
        onRefresh={loadAllData}
        installPrompt={installPrompt}
        onInstallPWA={handleInstallPWA}
      />

      {/* BACKEND OFFLINE BANNER */}
      {backendError && (
        <div className="w-full bg-rose-500/20 border-b border-rose-500/40 px-6 py-3 flex items-center justify-between text-xs font-mono text-rose-300">
          <span><strong>AI ENGINE OFFLINE:</strong> {backendError}</span>
          <button
            onClick={loadAllData}
            className="px-3 py-1 rounded bg-rose-500 text-slate-950 font-bold hover:bg-rose-400 transition-all"
          >
            RETRY CONNECTION
          </button>
        </div>
      )}

      {/* MAIN LAYOUT */}
      <div className="flex-1 flex max-w-[1600px] w-full mx-auto">
        <Sidebar
          currentPage={currentPage}
          setCurrentPage={handleNavigate}
        />

        <main className="flex-1 p-6 md:p-8 overflow-y-auto max-w-full">
          {loading ? (
            <div className="w-full h-96 glass-panel rounded-2xl flex flex-col items-center justify-center space-y-4">
              <div className="w-12 h-12 rounded-full border-4 border-[#00D2FF] border-t-transparent animate-spin" />
              <p className="text-sm font-mono text-[#00D2FF]">
                Connecting to AURA-MED PyTorch AI Engine & PWA Scheduler...
              </p>
            </div>
          ) : (
            <>
              {currentPage === 'dashboard' && (
                <Dashboard
                  stats={stats}
                  aiPrediction={aiPrediction}
                  reminders={reminders}
                  onMarkTaken={handleMarkTaken}
                  onMarkMissed={handleMarkMissed}
                  onSnooze={handleSnooze}
                  onNavigate={handleNavigate}
                  vaultUnlocked={vaultUnlocked}
                  onOpenVault={() => setVaultModalOpen(true)}
                />
              )}

              {currentPage === 'medicines' && (
                <Medicines
                  medicines={medicines}
                  onCreateMedicine={handleCreateMedicine}
                  onDeleteMedicine={handleDeleteMedicine}
                />
              )}

              {currentPage === 'reminders' && (
                <Reminders
                  reminders={reminders}
                  onMarkTaken={handleMarkTaken}
                  onMarkMissed={handleMarkMissed}
                  onSnooze={handleSnooze}
                />
              )}

              {currentPage === 'todays-doses' && (
                <TodaysDoses
                  reminders={reminders}
                  onMarkTaken={handleMarkTaken}
                  onMarkMissed={handleMarkMissed}
                  onSnooze={handleSnooze}
                />
              )}

              {currentPage === 'adherence' && (
                <Adherence
                  stats={stats}
                  aiPrediction={aiPrediction}
                />
              )}

              {currentPage === 'analytics' && (
                <Analytics
                  analytics={analytics}
                />
              )}

              {currentPage === 'ai-insights' && (
                <AIInsights
                  aiPrediction={aiPrediction}
                  stats={stats}
                />
              )}

              {currentPage === 'prescription-ai' && (
                <PrescriptionAI
                  onAddParsedMedicine={(med) => {
                    handleCreateMedicine({
                      name: med.name,
                      dosage: med.dosage,
                      frequency: med.frequency,
                      scheduled_times: med.scheduled_times,
                      start_date: new Date().toISOString().split('T')[0],
                      notes: 'Parsed via Smart Prescription AI'
                    });
                    setCurrentPage('medicines');
                  }}
                />
              )}

              {currentPage === 'caregiver' && (
                <Caregiver />
              )}

              {currentPage === 'history' && (
                <History />
              )}

              {currentPage === 'notification-center' && (
                <NotificationCenter />
              )}

              {currentPage === 'model-status' && (
                <ModelStatus
                  aiStatus={aiStatus}
                />
              )}

              {currentPage === 'medication-vault' && (
                <MedicationVault
                  medicines={medicines}
                  vaultUnlocked={vaultUnlocked}
                  onOpenVaultModal={() => setVaultModalOpen(true)}
                />
              )}

              {currentPage === 'settings' && (
                <Settings
                  onRefreshData={loadAllData}
                />
              )}
            </>
          )}
        </main>
      </div>

      {/* VAULT AUTHENTICATION SECURITY MODAL */}
      <VaultAuthModal
        isOpen={vaultModalOpen}
        onSuccess={handleVaultUnlocked}
        onClose={() => setVaultModalOpen(false)}
      />

      {/* FOOTER */}
      <Footer />

    </div>
  );
}
