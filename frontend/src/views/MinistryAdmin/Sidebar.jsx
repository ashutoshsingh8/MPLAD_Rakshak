import React from 'react';
import { useTranslation } from 'react-i18next';
import {
  LayoutGrid,
  ShieldAlert,
  Scale,
  TrendingUp,
  ChevronRight,
  Shield
} from 'lucide-react';

export default function Sidebar({ activeTab, onTabChange, alertCount = 3 }) {
  const { t } = useTranslation();

  const menuItems = [
    {
      id: 'overview',
      label: t('dashboard.overview', 'Global Overview'),
      icon: LayoutGrid,
      desc: t('ministry_portal.sidebar_desc_overview', 'Performance Indicators & Fund Heatmap'),
    },
    {
      id: 'fraud',
      label: t('dashboard.reports_audit', 'Reports & Audit'),
      icon: ShieldAlert,
      badge: alertCount,
      desc: t('ministry_portal.sidebar_desc_fraud', 'AI Fraud & Anomaly Feed'),
    },
    {
      id: 'policy',
      label: t('dashboard.policy_updates', 'Policy Updates'),
      icon: Scale,
      desc: t('ministry_portal.sidebar_desc_policy', '45-Day SLA & Quotas'),
    },
    {
      id: 'financials',
      label: t('dashboard.financials_forecast', 'Financials & Forecast'),
      icon: TrendingUp,
      desc: t('ministry_portal.sidebar_desc_financials', 'Outlay & Cost Overrun Radar'),
    },
  ];

  return (
    <aside className="w-64 bg-[#1b3a5d] text-white flex flex-col justify-between shrink-0 shadow-xl select-none min-h-[calc(100vh-64px)] border-r border-white/10">
      {/* Navigation Links */}
      <div className="p-3.5 space-y-1.5">
        <div className="px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-slate-300">
          {t('dashboard.command_modules', 'MoSPI Command Modules')}
        </div>

        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl text-sm font-medium transition-all duration-200 cursor-pointer text-left ${isActive
                  ? 'bg-white/15 text-white shadow-inner font-semibold border-l-4 border-amber-400 pl-3'
                  : 'text-slate-200 hover:text-white hover:bg-white/10'
                }`}
            >
              <div className="flex items-center gap-3">
                <Icon className={`w-5 h-5 shrink-0 ${isActive ? 'text-amber-300' : 'text-slate-300'}`} />
                <span className="truncate">{item.label}</span>
              </div>

              {item.badge ? (
                <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-red-600 text-white shadow-sm">
                  {item.badge}
                </span>
              ) : (
                isActive && <ChevronRight className="w-4 h-4 text-slate-300 shrink-0" />
              )}
            </button>
          );
        })}
      </div>

      {/* Official Bottom Emblem / Notice */}
      <div className="p-4 m-3 rounded-xl bg-black/20 border border-white/10 text-[11px] text-slate-300 space-y-1.5">
        <div className="flex items-center gap-2 font-bold text-white">
          <Shield className="w-4 h-4 text-amber-300" />
          <span>{t('ministry_portal.secure_enclave', 'MoSPI Secure Enclave')}</span>
        </div>
        <p className="text-[10px] text-slate-300 leading-tight">
          {t('ministry_portal.enclave_desc', 'MPLADS 2023 Real-time Decision Support System. Authorized ministry access only.')}
        </p>
      </div>
    </aside>
  );
}
