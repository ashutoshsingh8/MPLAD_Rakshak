import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Menu, X, LogIn, LogOut, LayoutDashboard, ShieldCheck } from 'lucide-react';
import LanguageSelector from './LanguageSelector';
import mpladLogo from '../assets/mplad_rakshak_logo.jpeg';
import mpladText from '../assets/mplad_rakshak_text.jpeg';

export default function PublicNavbar({
  activeTab = 'home',
  onTabChange,
  onOpenLogin,
  authenticatedUser,
  onLogout,
  onOpenDashboard,
}) {
  const { t } = useTranslation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { key: 'home', label: t('nav.home', 'Home') },
    { key: 'projects', label: t('nav.projects', 'Projects (search)') },
    { key: 'map', label: t('nav.map', 'Analytics Map') },
    { key: 'guidelines', label: t('nav.guidelines', 'Guidelines') },
    { key: 'about', label: t('nav.about', 'About') },
    { key: 'contact', label: t('nav.contact', 'Contact') },
  ];

  return (
    <header className="gov-navy-header text-white sticky top-0 z-50 shadow-md">
      {/* Top Tricolor Strip */}
      <div className="h-1 w-full bg-gradient-to-r from-orange-500 via-white to-green-600 opacity-90" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-18">
          {/* Brand Emblem Logo & Title Image */}
          <div
            onClick={() => onTabChange && onTabChange('home')}
            className="flex items-center gap-2 sm:gap-3 cursor-pointer group bg-white px-2.5 py-1 rounded-xl shadow-xs border border-white/30 transition select-none"
            title="MPLAD Rakshak"
          >
            {/* MPLAD Rakshak Logo */}
            <img
              src={mpladLogo}
              alt="MPLAD Rakshak Logo"
              className="h-10 sm:h-11 w-auto object-contain flex-shrink-0"
              style={{ minWidth: '50px', height: '40px' }}
            />
            {/* MPLAD Rakshak Image */}
            <img
              src={mpladText}
              alt="MPLAD Rakshak"
              className="h-8 sm:h-9 w-auto object-contain flex-shrink-0"
              style={{ minWidth: '70px', height: '34px' }}
            />
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center space-x-1 lg:space-x-3">
            {navItems.map((item) => {
              const isActive = activeTab === item.key;
              return (
                <button
                  key={item.key}
                  onClick={() => onTabChange && onTabChange(item.key)}
                  className={`relative px-3 py-2 text-sm font-medium transition-colors hover:text-white ${
                    isActive ? 'text-white' : 'text-slate-200 hover:text-white'
                  }`}
                >
                  {item.label}
                  {/* Underline bar matching image */}
                  {isActive && (
                    <span className="absolute bottom-0 left-2 right-2 h-1 bg-white rounded-full transition-all" />
                  )}
                </button>
              );
            })}
          </nav>

          {/* Right Action: Language Selector & Login */}
          <div className="hidden md:flex items-center gap-2.5">
            <LanguageSelector variant="dark" />

            {authenticatedUser ? (
              <div className="flex items-center gap-2">
                <button
                  onClick={onOpenDashboard}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md bg-emerald-600/80 hover:bg-emerald-600 text-white border border-emerald-400/50 shadow transition cursor-pointer"
                  title="Open Role Dashboard"
                >
                  <LayoutDashboard className="w-3.5 h-3.5" />
                  <span>{authenticatedUser.role.replace('_', ' ')}</span>
                </button>
                <button
                  onClick={onLogout}
                  className="flex items-center gap-1 px-2.5 py-1.5 text-xs text-slate-300 hover:text-white hover:bg-white/10 rounded-md border border-white/20 transition cursor-pointer"
                  title="Logout"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <button
                id="navbar-login-button"
                onClick={onOpenLogin}
                className={`flex items-center gap-2 px-4 py-1.5 text-sm font-medium rounded-md transition duration-200 shadow-sm cursor-pointer ${
                  activeTab === 'login'
                    ? 'bg-white text-[#0f2e52] border-2 border-white font-semibold'
                    : 'text-white border-2 border-white/90 hover:bg-white hover:text-[#0f2e52]'
                }`}
              >
                <LogIn className="w-4 h-4" />
                <span>{t('nav.login', 'Login')}</span>
              </button>
            )}
          </div>

          {/* Mobile Menu Button & Language Switcher */}
          <div className="flex md:hidden items-center gap-2">
            <LanguageSelector variant="dark" />

            {!authenticatedUser && (
              <button
                id="mobile-login-button"
                onClick={onOpenLogin}
                className={`px-2.5 py-1 text-xs font-medium rounded transition cursor-pointer ${
                  activeTab === 'login'
                    ? 'bg-white text-[#0f2e52] font-semibold'
                    : 'text-white border border-white/80 hover:bg-white hover:text-[#0f2e52]'
                }`}
              >
                {t('nav.login', 'Login')}
              </button>
            )}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-1.5 rounded-md text-slate-200 hover:text-white hover:bg-white/10"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[#0a2340] border-t border-white/10 px-4 pt-2 pb-4 space-y-1">
          {navItems.map((item) => (
            <button
              key={item.key}
              onClick={() => {
                onTabChange && onTabChange(item.key);
                setMobileMenuOpen(false);
              }}
              className={`w-full text-left px-3 py-2 rounded-md text-sm font-medium ${
                activeTab === item.key
                  ? 'bg-white/15 text-white font-semibold'
                  : 'text-slate-300 hover:bg-white/10 text-slate-100'
              }`}
            >
              {item.label}
            </button>
          ))}
          {authenticatedUser && (
            <div className="pt-2 border-t border-white/10 flex items-center justify-between px-3">
              <span className="text-xs text-emerald-300 font-medium">
                {authenticatedUser.full_name} ({authenticatedUser.role})
              </span>
              <button
                onClick={() => {
                  onLogout();
                  setMobileMenuOpen(false);
                }}
                className="text-xs text-red-300 hover:underline flex items-center gap-1"
              >
                <LogOut className="w-3.5 h-3.5" /> Logout
              </button>
            </div>
          )}
        </div>
      )}
    </header>
  );
}
