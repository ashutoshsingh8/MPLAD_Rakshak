import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Bell,
  User,
  LogOut,
  ArrowLeft,
  Shield,
  Search
} from 'lucide-react';
import Sidebar from './Sidebar';
import NationalCommandCenter from './NationalCommandCenter';
import FraudRiskIntelligence from './FraudRiskIntelligence';
import FinancialsForecasting from './FinancialsForecasting';
import PolicyComplianceEngine from './PolicyComplianceEngine';
import { getDashboardSummary, getProjects, getAnomalies } from '../../services/api';
import mpladLogo from '../../assets/mplad_rakshak_logo.jpeg';
import LanguageSelector from '../../components/LanguageSelector';

export default function MinistryDashboard({ onExitToPublic, onLogout, currentUser }) {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState(() => {
    if (typeof window !== 'undefined') {
      const hash = window.location.hash.replace('#', '');
      if (['overview', 'fraud', 'policy', 'financials'].includes(hash)) {
        return hash;
      }
      const params = new URLSearchParams(window.location.search);
      if (params.get('tab')) return params.get('tab');
    }
    return 'overview';
  });

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    if (typeof window !== 'undefined') {
      window.location.hash = tab;
    }
  };
  const [projects, setProjects] = useState([]);
  const [summary, setSummary] = useState(null);
  const [anomalies, setAnomalies] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [sumRes, projRes, anomRes] = await Promise.allSettled([
        getDashboardSummary(),
        getProjects({ page_size: 100 }),
        getAnomalies({ page_size: 20 }),
      ]);
      if (sumRes.status === 'fulfilled') setSummary(sumRes.value);
      if (projRes.status === 'fulfilled') setProjects(projRes.value.projects || []);
      if (anomRes.status === 'fulfilled') setAnomalies(anomRes.value);
    } catch (err) {
      console.error('Error fetching ministry data:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f1f5f9] text-slate-800 flex flex-col select-none font-sans">
      {/* ── Top Blue Header Bar Matching Screenshot ─────────── */}
      <header className="bg-[#2f6ea6] text-white px-4 sm:px-6 py-2.5 shadow-md flex items-center justify-between sticky top-0 z-50">
        {/* Left: Ashoka Emblem + Title */}
        <div className="flex items-center gap-3">
          {/* MPLAD Rakshak Official Logo */}
          <div className="w-10 h-10 flex items-center justify-center bg-white rounded-lg p-0.5 border border-white/30 shadow-xs overflow-hidden shrink-0">
            <img
              src={mpladLogo}
              alt="MPLAD Rakshak Logo"
              className="w-full h-full object-contain"
            />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base sm:text-lg font-black tracking-tight text-white uppercase">
                {t('ministry_portal.portal_title', 'MINISTRY OF STATISTICS & PROGRAMME IMPLEMENTATION')}
              </h1>
            </div>
            <p className="text-[10px] text-blue-100 tracking-wider">
              MPLAD Rakshak • {t('ministry_portal.portal_subtitle', 'National AI Anomaly Detection & Monitoring Command Portal')}
            </p>
          </div>
        </div>

        {/* Right Action Icons matching screenshot */}
        <div className="flex items-center gap-3">
          {/* Exit to Public Portal Button */}
          {onExitToPublic && (
            <button
              onClick={onExitToPublic}
              className="flex items-center gap-1.5 px-3 py-1 bg-black/15 hover:bg-black/25 text-white text-xs font-semibold rounded-lg transition border border-white/20 cursor-pointer"
              title={t('login_page.back_to_portal', 'Exit to Public Portal')}
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span className="hidden md:inline">{t('login_page.back_to_portal', 'Exit to Public Portal')}</span>
            </button>
          )}

          {/* Multilingual Selector */}
          <LanguageSelector variant="dark" />

          {/* Notification Bell with Badge (1) */}
          <button
            onClick={() => setActiveTab('fraud')}
            className="p-2 rounded-full hover:bg-white/15 text-blue-100 hover:text-white transition relative cursor-pointer"
            title={t('ministry_portal.critical_fraud_alert_pending', '1 Critical Fraud Alert Pending')}
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-1 right-1 w-4 h-4 bg-red-600 text-white rounded-full text-[9px] font-bold flex items-center justify-center border-2 border-[#2f6ea6]">
              1
            </span>
          </button>

          {/* User Profile Avatar with Admin User Pill */}
          <div className="flex items-center gap-2 pl-2 border-l border-white/20">
            <div className="w-8 h-8 rounded-full bg-white/20 border border-white/30 flex items-center justify-center text-white">
              <User className="w-4 h-4" />
            </div>

            <button
              onClick={() => setActiveTab('overview')}
              className="px-3 py-1 bg-[#1b5c74] hover:bg-[#154b5f] text-white text-xs font-bold rounded-md shadow-xs border border-white/20 transition cursor-pointer"
            >
              {t('dashboard.role_ministry', 'Ministry Admin')}
            </button>

            {onLogout && (
              <button
                onClick={onLogout}
                className="p-1.5 text-blue-200 hover:text-white hover:bg-white/10 rounded-md transition cursor-pointer"
                title={t('nav.logout', 'Sign Out')}
              >
                <LogOut className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </header>

      {/* ── Main Body with Sidebar + Dynamic Content ─────────── */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar */}
        <Sidebar
          activeTab={activeTab}
          onTabChange={handleTabChange}
          alertCount={4}
        />

        {/* Center Main View Area */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-6">
          {activeTab === 'overview' && (
            <NationalCommandCenter projects={projects} summary={summary} />
          )}

          {activeTab === 'fraud' && (
            <FraudRiskIntelligence />
          )}

          {activeTab === 'policy' && (
            <PolicyComplianceEngine />
          )}

          {activeTab === 'financials' && (
            <FinancialsForecasting />
          )}
        </main>
      </div>
    </div>
  );
}
