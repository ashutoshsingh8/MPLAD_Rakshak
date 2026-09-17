import { useState } from 'react';
import { RotateCw, Bell, ChevronDown, LogOut, ArrowLeft, Shield, AlertTriangle, CheckCircle } from 'lucide-react';
import { daOfficerProfile } from '../../mock/daDashboardData';
import mpladLogo from '../../assets/mplad_rakshak_logo.jpeg';

export default function DAHeader({ onExitToPublic, onLogout, onRefresh, isRefreshing }) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  return (
    <header className="bg-[#1f7a6b] text-white px-4 sm:px-6 py-2.5 flex items-center justify-between shadow-sm border-b border-[#186054] sticky top-0 z-50">
      {/* Left: State Seal & District Authority Title */}
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
              DISTRICT AUTHORITY PORTAL
            </h1>
            <span className="hidden md:inline-block px-2 py-0.5 rounded-full bg-white/20 text-[10px] font-bold text-white tracking-wide border border-white/20">
              PUNE DISTRICT (DM OFFICE)
            </span>
          </div>
          <p className="text-[11px] text-teal-100/80 font-medium hidden sm:block">
            MPLAD Rakshak • Operational Scrutiny, Technical Sanctions & Anti-Fraud Workbench
          </p>
        </div>
      </div>

      {/* Right Controls: Refresh, Notifications, Profile Avatar */}
      <div className="flex items-center gap-3">
        {/* Refresh / Sync Button */}
        <button
          onClick={onRefresh}
          title="Refresh live pipeline data"
          className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white transition cursor-pointer"
        >
          <RotateCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
        </button>

        {/* Notification Bell with Badge (matches reference image) */}
        <div className="relative">
          <button
            onClick={() => setNotificationsOpen(!notificationsOpen)}
            className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white transition relative cursor-pointer"
          >
            <Bell className="w-4 h-4" />
            {/* Red Alert Badge */}
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[9px] font-black rounded-full flex items-center justify-center shadow-sm">
              3
            </span>
          </button>

          {/* Notifications Dropdown */}
          {notificationsOpen && (
            <div className="absolute right-0 mt-2 w-72 bg-white rounded-xl shadow-xl border border-slate-200 text-slate-800 p-3 z-[60] animate-fade-in space-y-2">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-700">Action Alerts</span>
                <span className="text-[10px] bg-red-100 text-red-700 px-1.5 py-0.5 rounded font-bold">3 Urgent</span>
              </div>
              <div className="space-y-1.5 text-xs">
                <div className="p-2 rounded-lg bg-red-50 border border-red-200 text-red-800">
                  <div className="font-bold flex items-center gap-1">
                    <AlertTriangle className="w-3.5 h-3.5 text-red-600" />
                    <span>45-Day SLA Breached</span>
                  </div>
                  <p className="text-[11px] text-red-700 mt-0.5">Khed PHC Sub-Center proposal pending for 52 days.</p>
                </div>
                <div className="p-2 rounded-lg bg-amber-50 border border-amber-200 text-amber-800">
                  <div className="font-bold">BOQ Inflation Warning</div>
                  <p className="text-[11px] text-amber-700 mt-0.5">Shirur Solar Grid quotes exceed SoR by +37.1%.</p>
                </div>
                <div className="p-2 rounded-lg bg-purple-50 border border-purple-200 text-purple-800">
                  <div className="font-bold">EXIF Tamper Detected</div>
                  <p className="text-[11px] text-purple-700 mt-0.5">Chakan photo displaced 3.4km from official site.</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Exit to Public Portal quick link */}
        {onExitToPublic && (
          <button
            onClick={onExitToPublic}
            className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs font-semibold transition border border-white/20 cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Exit to Public</span>
          </button>
        )}

        {/* Profile Avatar Pill & Dropdown */}
        <div className="relative">
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-2 p-1.5 pr-2.5 rounded-full bg-white/10 hover:bg-white/20 transition cursor-pointer border border-white/15"
          >
            <img
              src={daOfficerProfile.avatar}
              alt={daOfficerProfile.name}
              className="w-7 h-7 rounded-full object-cover border border-white/40"
              onError={(e) => {
                e.target.src = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300';
              }}
            />
            <div className="hidden sm:block text-left">
              <p className="text-xs font-bold text-white leading-tight">
                {daOfficerProfile.name.split(',')[0]}
              </p>
              <p className="text-[10px] text-teal-100/75 leading-none">DM Pune</p>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-white/80" />
          </button>

          {dropdownOpen && (
            <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-slate-200 text-slate-800 py-2 z-[60] animate-fade-in text-xs">
              <div className="px-4 py-2 border-b border-slate-100">
                <p className="font-bold text-slate-900">{daOfficerProfile.name}</p>
                <p className="text-[11px] text-slate-500">{daOfficerProfile.designation}</p>
                <p className="text-[10px] font-mono text-emerald-700 mt-0.5">{daOfficerProfile.district}</p>
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
                  <span>Exit to Public Portal</span>
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
                <span>Sign Out</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
