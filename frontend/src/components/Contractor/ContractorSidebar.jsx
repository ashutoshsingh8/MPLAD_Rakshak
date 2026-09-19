import { useTranslation } from 'react-i18next';
import {
  User,
  CheckCircle2,
  FileText,
  CreditCard,
  Bell,
  LogOut,
  HardHat,
  ShieldAlert,
} from 'lucide-react';
import { contractorProfile } from '../../mock/contractorDashboardData';

export default function ContractorSidebar({ activeTab, setActiveTab, onLogout }) {
  const { t } = useTranslation();
  const navItems = [
    {
      id: 'profile',
      label: t('contractor_portal.tab_profile', 'PROFILE'),
      icon: User,
    },
    {
      id: 'dashboard',
      label: t('contractor_portal.tab_dashboard', 'MY DASHBOARD'),
      icon: CheckCircle2,
    },
    {
      id: 'active-projects',
      label: t('contractor_portal.tab_active_works', 'ACTIVE PROJECTS'),
      icon: FileText,
    },
    {
      id: 'payments',
      label: t('contractor_portal.tab_payments', 'PAYMENTS'),
      icon: CreditCard,
    },
    {
      id: 'notifications',
      label: t('contractor_portal.tab_notifications', 'NOTIFICATIONS'),
      icon: Bell,
      badge: '2',
    },
  ];

  return (
    <aside className="w-56 bg-[#a85016] text-white flex flex-col justify-between border-r border-[#8c3b0d] flex-shrink-0 min-h-[calc(100vh-53px)] select-none">
      <div className="p-4 space-y-5">
        {/* Top Profile Block with Circular Avatar matching reference image */}
        <div className="flex flex-col items-center justify-center pt-2 pb-3 border-b border-white/15">
          <div className="w-16 h-16 rounded-full border-3 border-white/60 p-0.5 shadow-md overflow-hidden bg-white/20 mb-2">
            <img
              src={contractorProfile.avatar}
              alt={contractorProfile.directorName}
              className="w-full h-full rounded-full object-cover"
              onError={(e) => {
                e.target.src = 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=300';
              }}
            />
          </div>
          <p className="text-xs font-black uppercase text-white tracking-wider text-center">
            {contractorProfile.companyName.split(' ')[0]} {contractorProfile.companyName.split(' ')[1]}
          </p>
          <span className="text-[10px] text-amber-100/75 text-center mt-0.5">
            {t('contractor_portal.empanelled_class1', 'Empanelled Class-1')}
          </span>
        </div>

        {/* Navigation Items matching reference layout exactly */}
        <nav className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center justify-between px-3.5 py-3 rounded-lg text-xs tracking-wider transition-all duration-150 cursor-pointer ${
                  isActive
                    ? 'bg-[#7c320a] text-white font-black shadow-xs border border-white/20'
                    : 'text-amber-100/85 hover:bg-[#8c3b0d] hover:text-white font-semibold'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 flex-shrink-0 ${isActive ? 'text-white' : 'text-amber-200'}`} />
                  <span>{item.label}</span>
                </div>

                {item.badge && (
                  <span className="w-4 h-4 rounded-full bg-red-600 text-white text-[9px] font-black flex items-center justify-center">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Bottom Logout Button matching reference layout */}
      <div className="p-4 border-t border-white/15">
        <button
          onClick={onLogout}
          className="w-full flex items-center gap-3 px-3.5 py-3 rounded-lg text-xs font-bold text-amber-100 hover:bg-[#7c320a] hover:text-white transition cursor-pointer"
        >
          <LogOut className="w-4 h-4 text-amber-200" />
          <span>{t('nav.logout', 'LOGOUT')}</span>
        </button>
      </div>
    </aside>
  );
}
