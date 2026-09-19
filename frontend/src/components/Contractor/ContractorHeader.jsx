
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Bell, ChevronDown, LogOut, ArrowLeft, RotateCw, HardHat, ShieldCheck } from 'lucide-react';
import { contractorProfile } from '../../mock/contractorDashboardData';
import mpladLogo from '../../assets/mplad_rakshak_logo.jpeg';
import LanguageSelector from '../LanguageSelector';

export default function ContractorHeader({ onExitToPublic, onLogout, onRefresh, isRefreshing }) {
  const { t } = useTranslation();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  return (
    <header className="bg-[#d96b1b] text-white px-4 sm:px-6 py-2.5 flex items-center justify-between shadow-sm border-b border-[#b8540d] sticky top-0 z-50">
      {/* Left: State Seal & Portal Title */}
      <div className="flex items-center gap-3">
        {/* MPLAD Rakshak Official Logo */}
        <div className="w-10 h-10 flex items-center justify-center bg-white rounded-lg p-0.5 border border-white/30 shadow-xs overflow-hidden flex-shrink-0">
          <img
            src={mpladLogo}
            alt="MPLAD Rakshak Logo"
            className="w-full h-full object-contain"
          />
        </div>

        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-sm sm:text-base font-black tracking-wider uppercase text-white">
              {t('contractor_portal.portal_title', 'CONTRACTOR PORTAL')}
            </h1>
            <span className="hidden md:inline-block px-2 py-0.5 rounded-full bg-white/20 text-[10px] font-bold text-white tracking-wide border border-white/20">
              {contractorProfile.companyName.split('Pvt')[0]}
            </span>
          </div>
          <p className="text-[11px] text-amber-100/90 font-medium hidden sm:block">
            MPLAD Rakshak • {t('contractor_portal.portal_subtitle', 'Implementing Agency Milestone Reporting & Geo-Verification Workbench')}
          </p>
        </div>
      </div>

      {/* Right Controls: Sync, Notifications, Profile Avatar */}
      <div className="flex items-center gap-3">
        {/* Refresh Sync */}
        <button
          onClick={onRefresh}
          title={t('contractor_portal.refresh_ledger', 'Refresh milestone ledger')}
          className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white transition cursor-pointer"
        >
          <RotateCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
        </button>

        {/* Notification Bell with Red Badge matching reference image */}
        <div className="relative">
          <button
            onClick={() => setNotificationsOpen(!notificationsOpen)}
            className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white transition relative cursor-pointer"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-600 text-white text-[9px] font-black rounded-full flex items-center justify-center shadow-xs">
              2
            </span>
          </button>

          {notificationsOpen && (
            <div className="absolute right-0 mt-2 w-72 bg-white rounded-xl shadow-xl border border-slate-200 text-slate-800 p-3 z-[60] text-xs space-y-2">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <span className="font-bold text-slate-800 uppercase tracking-wider text-[11px]">
                  {t('contractor_portal.tab_notifications', 'Authority Notifications')}
                </span>
                <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-1.5 py-0.5 rounded">
                  {t('contractor_portal.notif_pending_count', { count: 2, defaultValue: '2 Pending' })}
                </span>
              </div>
              <div className="space-y-1.5">
                <div className="p-2 rounded-lg bg-amber-50 border border-amber-200 text-amber-900">
                  <div className="font-bold text-xs">
                    {t('contractor_portal.notif_1_title', 'Flagged Physical Inspection — Shirur Link Road')}
                  </div>
                  <p className="text-[11px] text-amber-700 mt-0.5">
                    {t('contractor_portal.notif_1_desc', 'District Collector office requested high-resolution live camera re-capture for the embankment sub-base layer. Disbursal on hold until re-submitted.')}
                  </p>
                </div>
                <div className="p-2 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-900">
                  <div className="font-bold text-xs">
                    {t('contractor_portal.notif_2_title', 'Escrow Release Authorized — Velhe Link Road')}
                  </div>
                  <p className="text-[11px] text-emerald-700 mt-0.5">
                    {t('contractor_portal.notif_2_desc', '₹12.50 Lakh released to bank escrow account under sanction MPLAD-2026-PN-022.')}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Exit to Public Portal link */}
        {onExitToPublic && (
          <button
            onClick={onExitToPublic}
            className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs font-semibold transition border border-white/20 cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>{t('login_page.back_to_portal', 'Exit to Public')}</span>
          </button>
        )}

        {/* Multilingual Selector */}
        <LanguageSelector variant="dark" />

        {/* Profile Avatar Pill & Dropdown matching reference image */}
        <div className="relative">
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-2 p-1.5 pr-2.5 rounded-full bg-white/10 hover:bg-white/20 transition cursor-pointer border border-white/15"
          >
            <img
              src={contractorProfile.avatar}
              alt={contractorProfile.directorName}
              className="w-7 h-7 rounded-full object-cover border border-white/40"
              onError={(e) => {
                e.target.src = 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=300';
              }}
            />
            <div className="hidden sm:block text-left">
              <p className="text-xs font-bold text-white leading-tight">
                {contractorProfile.directorName}
              </p>
              <p className="text-[10px] text-amber-100/75 leading-none">{t('contractor_portal.portal_title', 'Contractor')}</p>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-white/80" />
          </button>

          {dropdownOpen && (
            <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-slate-200 text-slate-800 py-2 z-[60] text-xs font-medium">
              <div className="px-4 py-2 border-b border-slate-100">
                <p className="font-bold text-slate-900">{contractorProfile.companyName}</p>
                <p className="text-[11px] text-slate-500">
                  {t('contractor_portal.director_role_val', contractorProfile.directorRole)}
                </p>
                <p className="text-[10px] font-mono text-orange-700 mt-0.5">{contractorProfile.licenseNo}</p>
              </div>

              {onExitToPublic && (
                <button
                  onClick={() => {
                    setDropdownOpen(false);
                    onExitToPublic();
                  }}
                  className="w-full text-left px-4 py-2 hover:bg-slate-50 flex items-center gap-2 text-slate-700 cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4 text-slate-400" />
                  <span>{t('login_page.back_to_portal', 'Exit to Public Portal')}</span>
                </button>
              )}

              <div className="border-t border-slate-100 my-1" />

              <button
                onClick={() => {
                  setDropdownOpen(false);
                  onLogout && onLogout();
                }}
                className="w-full text-left px-4 py-2 hover:bg-red-50 text-red-600 flex items-center gap-2 cursor-pointer font-semibold"
              >
                <LogOut className="w-4 h-4 text-red-500" />
                <span>{t('nav.logout', 'Sign Out')}</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
