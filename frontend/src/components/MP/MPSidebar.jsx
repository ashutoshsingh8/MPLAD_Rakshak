import React from 'react';
import { useTranslation } from 'react-i18next';
import {
  Users,
  CheckSquare,
  Wallet,
  ShieldCheck,
  MapPin,
  Camera,
  HelpCircle,
  Clock,
  ChevronRight,
  Landmark
} from 'lucide-react';

export default function MPSidebar({ activeTab, onTabChange, pendingBreachCount = 1 }) {
  const { t } = useTranslation();

  const menuItems = [
    {
      id: 'nominations',
      label: t('mp_portal.tab_nominations', 'MP NOMINATIONS'),
      icon: Users,
      desc: t('mp_portal.tab_nominations_desc', 'Track recommended works & letters'),
    },
    {
      id: 'approved',
      label: t('mp_portal.tab_approved', 'APPROVED WORKS'),
      icon: CheckSquare,
      desc: t('mp_portal.tab_approved_desc', 'AS & TS sanctioned infrastructure'),
    },
    {
      id: 'funding',
      label: t('mp_portal.tab_funding', 'FUNDING SUMMARY'),
      icon: Wallet,
      desc: t('mp_portal.tab_funding_desc', '₹5 Crore allocation & disbursal'),
    },
    {
      id: 'prerequisites',
      label: t('mp_portal.tab_prerequisites', 'PRE-REQUISITES CHECKS'),
      icon: ShieldCheck,
      badge: pendingBreachCount ? t('mp_portal.sla_alert_badge', 'SLA Alert') : null,
      desc: t('mp_portal.tab_prerequisites_desc', '45-day countdown & SC/ST quota'),
    },
    {
      id: 'map',
      label: t('mp_portal.tab_map', 'CONSTITUENCY MAP'),
      icon: MapPin,
      desc: t('mp_portal.tab_map_desc', 'GIS spatial asset tracking'),
    },
    {
      id: 'photos',
      label: t('mp_portal.tab_photos', 'SITE UPDATES (PHOTOS)'),
      icon: Camera,
      desc: t('mp_portal.tab_photos_desc', 'EXIF verified contractor photos'),
    },
    {
      id: 'help',
      label: t('mp_portal.tab_help', 'HELP'),
      icon: HelpCircle,
      desc: t('mp_portal.tab_help_desc', 'DM & MoSPI escalation desk'),
    },
  ];

  return (
    <aside className="w-64 bg-[#0d2f41] text-white flex flex-col justify-between shrink-0 shadow-xl select-none min-h-[calc(100vh-64px)] border-r border-[#144b61]/40">
      <div className="p-3.5 space-y-3">
        <div className="px-3 pt-1 text-[10px] font-bold uppercase tracking-wider text-teal-200/60">
          {t('mp_portal.constituency_oversight', 'Constituency Oversight')}
        </div>

        {/* Navigation Items */}
        <div className="space-y-1.5">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id)}
                className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl text-xs font-bold tracking-wider transition-all duration-200 cursor-pointer text-left uppercase ${
                  isActive
                    ? 'bg-[#1a475a] text-white shadow-xs border-l-4 border-cyan-400 pl-3'
                    : 'text-[#93afbd] hover:text-white hover:bg-white/5'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-cyan-300' : 'text-[#678b9c]'}`} />
                  <span className="truncate">{item.label}</span>
                </div>

                {item.badge ? (
                  <span className="px-1.5 py-0.5 text-[9px] font-bold rounded bg-cyan-500/20 text-cyan-300 border border-cyan-400/30">
                    {item.badge}
                  </span>
                ) : (
                  isActive && <ChevronRight className="w-3.5 h-3.5 text-cyan-200 shrink-0" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Institutional Footer */}
      <div className="p-4 m-3 rounded-xl bg-[#062432]/60 border border-white/10 text-[11px] text-teal-200 space-y-1">
        <div className="flex items-center gap-1.5 font-bold text-white">
          <Landmark className="w-4 h-4 text-cyan-300" />
          <span>{t('mp_portal.lok_sabha_secretariat', 'Lok Sabha Secretariat')}</span>
        </div>
        <p className="text-[10px] text-teal-300/80 leading-tight">
          {t('mp_portal.footer_guidelines', 'MPLADS 2023 Guidelines • 45-Day Statutory Approval Enforced.')}
        </p>
      </div>
    </aside>
  );
}
