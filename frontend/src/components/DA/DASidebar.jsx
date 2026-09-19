import { useTranslation } from 'react-i18next';
import {
  LayoutGrid,
  Folder,
  ClipboardCheck,
  FileText,
  FileCheck,
  MapPin,
  Settings,
  ShieldCheck,
  AlertTriangle,
  Flame,
} from 'lucide-react';

export default function DASidebar({ activeTab, setActiveTab }) {
  const { t } = useTranslation();

  const navItems = [
    {
      id: 'dashboard',
      label: t('da_portal.tab_dashboard', 'Dashboard'),
      icon: LayoutGrid,
      desc: t('da_portal.tab_dashboard_desc', 'District Management Overview'),
    },
    {
      id: 'pipeline',
      label: t('da_portal.tab_portfolio', 'Project Portfolio'),
      secondaryLabel: t('da_portal.tab_pipeline_desc', 'Proposal Pipeline'),
      icon: Folder,
      desc: t('da_portal.tab_sla_clearance', '45-Day SLA Clearance Inbox'),
      badge: t('da_portal.urgent_badge', { count: 3, defaultValue: '3 Critical' }),
      badgeColor: 'bg-red-500 text-white',
    },
    {
      id: 'inspections',
      label: t('da_portal.tab_inspections', 'Site Inspections'),
      secondaryLabel: t('da_portal.tab_inspections_desc', 'Site Verifications'),
      icon: ClipboardCheck,
      desc: t('da_portal.tab_exif_desc', 'Anti-Morphing EXIF Checks'),
      badge: t('da_portal.flagged_badge', { count: 5, defaultValue: '5 Flagged' }),
      badgeColor: 'bg-amber-400 text-slate-900',
    },
    {
      id: 'work-orders',
      label: t('da_portal.tab_work_orders', 'Work Order Status'),
      secondaryLabel: t('da_portal.tab_boq_desc', 'AI Scrutiny & BOQ'),
      icon: FileText,
      desc: t('da_portal.tab_work_orders_desc', 'Technical Sanctions (TS)'),
    },
    {
      id: 'utilization',
      label: t('da_portal.tab_utilization', 'Utilization Certificate'),
      secondaryLabel: t('da_portal.tab_utilization_desc', 'Fund Releases'),
      icon: FileCheck,
      desc: t('da_portal.tab_milestone_auth', 'Milestone Authorization'),
    },
    {
      id: 'maps',
      label: t('da_portal.tab_maps', 'Local Maps'),
      secondaryLabel: t('da_portal.tab_maps_desc', 'GIS Radar'),
      icon: MapPin,
      desc: t('da_portal.tab_maps_full_desc', 'GIS Duplicate Asset Radar'),
    },
    {
      id: 'settings',
      label: t('da_portal.tab_settings', 'System Settings'),
      icon: Settings,
      desc: t('da_portal.tab_settings_desc', 'District Config & Quotas'),
    },
  ];

  return (
    <aside className="w-64 bg-[#0f4a40] text-white flex flex-col justify-between border-r border-[#0b3830] flex-shrink-0 min-h-[calc(100vh-53px)] select-none">
      {/* Navigation Links */}
      <div className="p-3 space-y-1">
        <div className="px-3 py-2 text-[10px] font-black uppercase tracking-widest text-teal-200/60">
          {t('da_portal.operational_workflow', 'OPERATIONAL WORKFLOW')}
        </div>

        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all duration-200 cursor-pointer ${
                isActive
                  ? 'bg-[#175b4e] text-white shadow-xs font-bold'
                  : 'text-teal-100/75 hover:bg-[#134e43] hover:text-white'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon
                  className={`w-4 h-4 flex-shrink-0 ${
                    isActive ? 'text-[#34d399]' : 'text-teal-300/80'
                  }`}
                />
                <div className="text-left">
                  <div className="leading-tight">{item.label}</div>
                  {item.secondaryLabel && (
                    <div className="text-[10px] text-teal-200/50 font-normal leading-none mt-0.5">
                      {item.secondaryLabel}
                    </div>
                  )}
                </div>
              </div>

              {item.badge && (
                <span
                  className={`text-[9px] font-black px-1.5 py-0.5 rounded-full ${item.badgeColor} shadow-xs`}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Collectorate Statutory Badge & SLA Enforcement Box */}
      <div className="p-3 m-3 rounded-xl bg-[#0b3830] border border-teal-900/50 text-[11px] text-teal-100/80 space-y-2">
        <div className="flex items-center gap-1.5 font-bold text-white">
          <ShieldCheck className="w-3.5 h-3.5 text-[#34d399]" />
          <span>{t('da_portal.statutory_authority_title', 'Statutory Authority')}</span>
        </div>
        <p className="text-[10px] text-teal-200/70 leading-relaxed">
          {t('da_portal.statutory_authority_desc', 'Under MPLADS 2023 Guidelines Clause 4.2, the District Authority is mandated to sanction eligible works within 45 days.')}
        </p>
        <div className="pt-1 flex items-center justify-between text-[10px] text-teal-300 font-mono">
          <span>{t('da_portal.active_quota_label', 'Active Quota: 16.2% SC / 8.1% ST')}</span>
        </div>
      </div>
    </aside>
  );
}
