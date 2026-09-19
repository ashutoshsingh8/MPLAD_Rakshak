import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Shield, Bell, Menu, X, Search, LogOut } from 'lucide-react';
import LanguageSelector from './LanguageSelector';

export default function Navbar({ currentRole, onNavigate, activeView }) {
  const { t } = useTranslation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const navItems = [
    { label: t('dashboard.dashboard_tab', 'Dashboard'), key: 'dashboard' },
    { label: t('dashboard.projects_tab', 'Projects'), key: 'projects' },
    { label: t('dashboard.anomalies_tab', 'Anomalies'), key: 'anomalies' },
    { label: t('dashboard.reports_tab', 'Reports'), key: 'reports' },
  ];

  const roleLabel = {
    MINISTRY_ADMIN: t('dashboard.role_ministry', 'Ministry Admin'),
    DISTRICT_AUTHORITY: t('dashboard.role_da', 'District Authority'),
    MP: t('dashboard.role_mp', 'Member of Parliament'),
    CONTRACTOR: t('dashboard.role_contractor', 'Contractor'),
  };

  const roleColor = {
    MINISTRY_ADMIN: 'from-purple-500 to-indigo-600',
    DISTRICT_AUTHORITY: 'from-blue-500 to-cyan-600',
    MP: 'from-saffron-500 to-orange-600',
    CONTRACTOR: 'from-emerald-500 to-teal-600',
  };

  return (
    <nav className="sticky top-0 z-50 bg-surface-900/80 backdrop-blur-xl border-b border-white/10">
      <div className="max-w-[1440px] mx-auto px-4 lg:px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo + Brand */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg gradient-primary flex items-center justify-center shadow-lg shadow-primary-500/20">
              <Shield size={20} className="text-white" />
            </div>
            <div className="hidden sm:block">
              <h1 className="text-base font-bold text-white tracking-tight">MPLAD Rakshak</h1>
              <p className="text-[10px] text-gray-500 -mt-0.5 tracking-wider uppercase">
                {t('dashboard.title', 'AI Monitoring Platform')}
              </p>
            </div>
          </div>

          {/* Desktop Nav Links */}
          <div className="hidden md:flex items-center gap-1">
            {navItems.map((item) => (
              <button
                key={item.key}
                onClick={() => onNavigate?.(item.key)}
                className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  activeView === item.key
                    ? 'bg-white/10 text-white'
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>

          {/* Right Side */}
          <div className="flex items-center gap-3">
            {/* Language Selector */}
            <LanguageSelector variant="dark" />

            {/* Role Badge */}
            <div className={`hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-full bg-gradient-to-r ${roleColor[currentRole] || roleColor.MINISTRY_ADMIN} bg-opacity-20`}>
              <div className="w-2 h-2 rounded-full bg-white animate-pulse" />
              <span className="text-xs font-semibold text-white">
                {roleLabel[currentRole] || 'Admin'}
              </span>
            </div>

            {/* Search */}
            <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10">
              <Search size={14} className="text-gray-500" />
              <input
                type="text"
                placeholder={t('dashboard.search_placeholder', 'Search...')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-transparent text-sm text-white placeholder-gray-500 outline-none w-32 focus:w-48 transition-all duration-300"
              />
            </div>

            {/* Notifications */}
            <button className="relative p-2 rounded-lg hover:bg-white/5 transition-colors group">
              <Bell size={18} className="text-gray-400 group-hover:text-white transition-colors" />
              <span className="absolute top-1 right-1 w-2.5 h-2.5 rounded-full bg-red-500 border-2 border-surface-900 animate-pulse" />
            </button>

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="md:hidden p-2 rounded-lg hover:bg-white/5"
            >
              {mobileOpen ? <X size={20} className="text-white" /> : <Menu size={20} className="text-gray-400" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-white/5 bg-surface-900/95 backdrop-blur-xl animate-slide-up">
          <div className="px-4 py-3 space-y-1">
            {navItems.map((item) => (
              <button
                key={item.key}
                onClick={() => { onNavigate?.(item.key); setMobileOpen(false); }}
                className={`w-full text-left px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  activeView === item.key
                    ? 'bg-white/10 text-white'
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </nav>
  );
}
