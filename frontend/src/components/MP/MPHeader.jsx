import React, { useState } from 'react';
import { Search, User, ChevronDown, ArrowLeft, LogOut, Bell, Shield, CheckCircle } from 'lucide-react';
import { mockMpProfile } from '../../mock/mpDashboardData';
import mpladLogo from '../../assets/mplad_rakshak_logo.jpeg';

export default function MPHeader({ onExitToPublic, onLogout, onSearch }) {
  const [searchValue, setSearchValue] = useState('');
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (onSearch) onSearch(searchValue);
  };

  return (
    <header className="bg-[#0c455b] text-white px-4 sm:px-6 py-3 shadow-md flex items-center justify-between sticky top-0 z-50 border-b border-[#155a75]/50 select-none">
      {/* ── Left: Parliament / Sansad Emblem & Title ───────── */}
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
              MEMBER OF PARLIAMENT PORTAL
            </h1>
            <span className="hidden lg:inline-flex items-center text-[10px] font-bold bg-[#145a75] text-teal-100 border border-teal-300/30 px-2 py-0.5 rounded-full">
              {mockMpProfile.constituency}
            </span>
          </div>
          <p className="text-[10px] text-teal-100/70 tracking-wider">
            MPLAD Rakshak • Constitutional Decision & Recommendation Support System
          </p>
        </div>
      </div>

      {/* ── Center-Right: Dark Teal Search Bar ─────────────── */}
      <div className="flex items-center gap-4">
        <form onSubmit={handleSearchSubmit} className="relative hidden md:block">
          <Search className="w-4 h-4 text-teal-200/80 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="Search projects, sanctions, works..."
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            className="bg-[#13556d]/50 hover:bg-[#13556d]/70 focus:bg-[#13556d]/90 text-white placeholder-teal-100/60 text-xs rounded-xl pl-9 pr-4 py-2 w-64 lg:w-80 outline-none border border-white/15 focus:border-cyan-300 transition shadow-inner"
          />
        </form>

        {/* Exit to Public Portal Action */}
        {onExitToPublic && (
          <button
            onClick={onExitToPublic}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#083040]/70 hover:bg-[#083040] text-white text-xs font-semibold rounded-lg transition border border-white/15 cursor-pointer shadow-xs"
            title="Return to public portal"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Exit to Public Portal</span>
          </button>
        )}

        {/* MP Profile Avatar & Dropdown */}
        <div className="relative">
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-2 bg-[#083040]/70 hover:bg-[#083040] p-1.5 sm:px-3 sm:py-1.5 rounded-xl border border-white/15 transition cursor-pointer"
          >
            <div className="w-7 h-7 rounded-full bg-white text-[#0c455b] font-black text-xs flex items-center justify-center border border-white/40 shadow-xs">
              <User className="w-4 h-4 text-[#0c455b]" />
            </div>
            <div className="text-left hidden lg:block">
              <div className="text-xs font-bold text-white leading-none">{mockMpProfile.name}</div>
              <div className="text-[10px] text-teal-200/70 leading-none mt-0.5">Hon'ble MP (Pune)</div>
            </div>
            <ChevronDown className="w-4 h-4 text-teal-200" />
          </button>

          {/* Profile Dropdown Menu */}
          {dropdownOpen && (
            <div className="absolute right-0 mt-2 w-60 bg-white rounded-xl shadow-2xl border border-slate-200 p-3 text-slate-800 z-[60] text-xs space-y-2">
              <div className="p-2 bg-teal-50 rounded-lg border border-teal-100">
                <div className="font-bold text-teal-950">{mockMpProfile.name}</div>
                <div className="text-[10px] text-teal-700">{mockMpProfile.role}</div>
                <div className="text-[10px] text-slate-500 font-mono mt-1">
                  Annual Entitlement: ₹{mockMpProfile.entitlementCr} Cr
                </div>
              </div>

              <div className="pt-1 space-y-1">
                <button
                  onClick={() => { setDropdownOpen(false); onExitToPublic && onExitToPublic(); }}
                  className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-slate-100 text-slate-700 flex items-center gap-2"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Public Transparency Portal</span>
                </button>

                {onLogout && (
                  <button
                    onClick={() => { setDropdownOpen(false); onLogout(); }}
                    className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-red-50 text-red-600 font-semibold flex items-center gap-2"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Sign Out</span>
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
