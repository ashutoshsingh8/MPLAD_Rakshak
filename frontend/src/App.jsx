import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import PublicNavbar from './components/PublicNavbar';
import LanguageSelector from './components/LanguageSelector';
import LoginModal from './components/LoginModal';
import ReportFraudModal from './components/ReportFraudModal';
import PublicPortalHome from './views/PublicPortalHome';

import MinistryDashboard from './views/MinistryDashboard';
import DistrictAuthorityDashboard from './views/DistrictAuthorityDashboard';
import MPDashboard from './views/MPDashboard';
import ContractorPortal from './views/ContractorPortal';
import LoginPage from './views/LoginPage';
import GISMapViewer from './components/GISMapViewer';

import { getProjects, queryGuidelines } from './services/api';
import { getLocalizedState, getLocalizedDistrict } from './utils/geoTranslations';
import { getLocalizedProjectTitle } from './utils/projectTranslations';
import {
  Search, MapPin, Building, FileText, Send, Sparkles, AlertCircle,
  Phone, Mail, Globe, CheckCircle2, Shield, ArrowLeft, LayoutDashboard,
  ExternalLink, Github
} from 'lucide-react';

const ROLE_VIEWS = {
  MINISTRY_ADMIN: MinistryDashboard,
  DISTRICT_AUTHORITY: DistrictAuthorityDashboard,
  MP: MPDashboard,
  CONTRACTOR: ContractorPortal,
};

export default function App() {
  const { t, i18n } = useTranslation();
  const currentLang = i18n.language ? i18n.language.split('-')[0] : 'en';
  const [activeTab, setActiveTab] = useState(() => {
    if (typeof window !== 'undefined') {
      const hash = window.location.hash.replace('#', '');
      if (['login', 'projects', 'map', 'guidelines', 'about', 'contact'].includes(hash)) {
        return hash;
      }
      const params = new URLSearchParams(window.location.search);
      if (params.get('tab')) return params.get('tab');
    }
    return 'home';
  });

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    if (typeof window !== 'undefined') {
      window.location.hash = tab === 'home' ? '' : tab;
    }
  };

  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isFraudModalOpen, setIsFraudModalOpen] = useState(false);
  const [selectedFraudProject, setSelectedFraudProject] = useState(null);

  // Authenticated department session
  const [authenticatedUser, setAuthenticatedUser] = useState(() => {
    if (typeof window !== 'undefined') {
      const hash = window.location.hash.replace('#', '');
      if (['ministry-admin', 'dashboard', 'fraud', 'policy', 'financials', 'health', 'users', 'settings'].includes(hash)) {
        return {
          username: 'ministry_admin',
          role: 'MINISTRY_ADMIN',
          full_name: 'Dr. Rajesh Kumar',
          access_token: 'demo-token',
        };
      }
      if (['mp', 'mp-dashboard', 'mp-portal', 'nominations', 'mp-nominations', 'approved', 'approved-works', 'funding', 'prerequisites', 'mp-map', 'photos', 'site-updates', 'help', 'new-proposal', 'pre-check'].includes(hash)) {
        return {
          username: 'mp_pune',
          role: 'MP',
          full_name: 'Shri Vijay Patil',
          district: 'Pune',
          state: 'Maharashtra',
          constituency: 'Pune (Maharashtra)',
          access_token: 'demo-token-mp',
        };
      }
      if (['da', 'da-dashboard', 'district-authority', 'pipeline', 'scrutiny', 'inspections', 'work-orders', 'utilization', 'local-maps', 'boq', 'exif'].includes(hash)) {
        return {
          username: 'da_pune',
          role: 'DISTRICT_AUTHORITY',
          full_name: 'Smt. Priya Sharma, IAS',
          district: 'Pune',
          state: 'Maharashtra',
          constituency: 'Pune',
          designation: 'District Magistrate & Collector (Pune)',
          access_token: 'demo-token-da',
        };
      }
      if (['contractor', 'contractor-dashboard', 'contractor-portal', 'tenders', 'active-works', 'evidence', 'payments', 'billing', 'profile'].includes(hash)) {
        return {
          username: 'contractor_abc',
          role: 'CONTRACTOR',
          full_name: 'Mr. Ramesh Shinde',
          companyName: 'M/s ABC Constructions Pvt. Ltd.',
          access_token: 'demo-token-contractor',
        };
      }
    }
    const saved = localStorage.getItem('mplad_user');
    return saved ? JSON.parse(saved) : null;
  });

  const [showRoleDashboard, setShowRoleDashboard] = useState(() => {
    if (typeof window !== 'undefined') {
      const hash = window.location.hash.replace('#', '');
      if ([
        'ministry-admin', 'dashboard', 'fraud', 'policy', 'financials', 'health', 'users', 'settings',
        'mp', 'mp-dashboard', 'mp-portal', 'nominations', 'mp-nominations', 'approved', 'approved-works', 'funding', 'prerequisites', 'mp-map', 'photos', 'site-updates', 'help', 'new-proposal', 'pre-check',
        'da', 'da-dashboard', 'district-authority', 'pipeline', 'scrutiny', 'inspections', 'work-orders', 'utilization', 'local-maps', 'boq', 'exif',
        'contractor', 'contractor-dashboard', 'contractor-portal', 'tenders', 'active-works', 'evidence', 'payments', 'billing', 'profile'
      ].includes(hash)) return true;
    }
    return false;
  });
  const [allProjects, setAllProjects] = useState([]);

  // Guidelines AI search state
  const [guidelineQuery, setGuidelineQuery] = useState('');
  const [guidelineAnswer, setGuidelineAnswer] = useState(null);
  const [guidelineLoading, setGuidelineLoading] = useState(false);

  useEffect(() => {
    loadAllProjects();
  }, []);

  const loadAllProjects = async () => {
    try {
      const res = await getProjects({ page_size: 100 });
      if (res && res.projects) setAllProjects(res.projects);
    } catch (e) {
      console.error('Error fetching projects:', e);
    }
  };

  const handleLoginSuccess = (userData) => {
    const enrichedUser = {
      ...userData,
      district: userData.district || (userData.username?.includes('lucknow') ? 'Lucknow' : 'Pune'),
      state: userData.state || (userData.username?.includes('lucknow') ? 'Uttar Pradesh' : 'Maharashtra'),
      constituency: userData.constituency || `${userData.district || (userData.username?.includes('lucknow') ? 'Lucknow' : 'Pune')} Lok Sabha`,
    };
    setAuthenticatedUser(enrichedUser);
    localStorage.setItem('mplad_user', JSON.stringify(enrichedUser));
    setShowRoleDashboard(true);
  };

  const handleLogout = () => {
    setAuthenticatedUser(null);
    setShowRoleDashboard(false);
    localStorage.removeItem('mplad_user');
    localStorage.removeItem('mplad_token');
  };

  const handleAskGuidelines = async (e) => {
    e.preventDefault();
    if (!guidelineQuery.trim()) return;
    setGuidelineLoading(true);
    try {
      const res = await queryGuidelines(guidelineQuery.trim());
      setGuidelineAnswer(res);
    } catch (err) {
      console.error('Guideline query failed:', err);
      setGuidelineAnswer({
        answer: 'Failed to query guideline intelligence engine. Please ensure backend is running.',
        source_chunks: [],
      });
    } finally {
      setGuidelineLoading(false);
    }
  };

  // If department official is logged in AND chose to view their workspace
  if (authenticatedUser && showRoleDashboard) {
    if (authenticatedUser.role === 'MINISTRY_ADMIN') {
      return (
        <MinistryDashboard
          onExitToPublic={() => setShowRoleDashboard(false)}
          onLogout={handleLogout}
          currentUser={authenticatedUser}
        />
      );
    }

    if (authenticatedUser.role === 'MP') {
      return (
        <MPDashboard
          onExitToPublic={() => setShowRoleDashboard(false)}
          onLogout={handleLogout}
          currentUser={authenticatedUser}
        />
      );
    }

    if (authenticatedUser.role === 'DISTRICT_AUTHORITY') {
      return (
        <DistrictAuthorityDashboard
          onExitToPublic={() => setShowRoleDashboard(false)}
          onLogout={handleLogout}
          currentUser={authenticatedUser}
        />
      );
    }

    if (authenticatedUser.role === 'CONTRACTOR') {
      return (
        <ContractorPortal
          onExitToPublic={() => setShowRoleDashboard(false)}
          onLogout={handleLogout}
          currentUser={authenticatedUser}
        />
      );
    }

    const DashboardView = ROLE_VIEWS[authenticatedUser.role] || MinistryDashboard;

    return (
      <div className="min-h-screen bg-slate-950 text-white">
        {/* Department Top Control Bar */}
        <div className="bg-[#0b1f36] border-b border-white/10 px-4 sm:px-6 py-2.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowRoleDashboard(false)}
              className="flex items-center gap-1.5 px-3 py-1 bg-white/10 hover:bg-white/20 text-white text-xs font-semibold rounded-lg transition cursor-pointer border border-white/15"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>{t('nav.exit_to_public', 'Exit to Public Portal')}</span>
            </button>
            <div className="h-4 w-px bg-white/20 hidden sm:block" />
            <div className="hidden sm:flex items-center gap-2 text-xs text-slate-300">
              <span className="font-bold text-white">{authenticatedUser.full_name}</span>
              <span>•</span>
              <span className="bg-teal-500/20 text-teal-300 px-2 py-0.5 rounded border border-teal-400/30 text-[11px] font-semibold uppercase">
                {authenticatedUser.role.replace('_', ' ')}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <LanguageSelector variant="dark" />
            <button
              onClick={handleLogout}
              className="text-xs text-red-300 hover:text-red-100 hover:underline cursor-pointer"
            >
              {t('nav.sign_out', 'Sign Out')}
            </button>
          </div>
        </div>

        {/* Render Authenticated Role Dashboard */}
        <main className="max-w-[1440px] mx-auto px-4 lg:px-6 py-6">
          <DashboardView />
        </main>
      </div>
    );
  }

  // If user navigated to official department login page
  if (activeTab === 'login') {
    return (
      <LoginPage
        onBackToPublic={() => handleTabChange('home')}
        onLoginSuccess={(userData) => {
          handleLoginSuccess(userData);
        }}
      />
    );
  }

  return (
    <div className="min-h-screen gov-portal-bg text-slate-800 flex flex-col justify-between">
      {/* ── Top Navigation Bar matching reference design ─────── */}
      <PublicNavbar
        activeTab={activeTab}
        onTabChange={handleTabChange}
        onOpenLogin={() => handleTabChange('login')}
        authenticatedUser={authenticatedUser}
        onLogout={handleLogout}
        onOpenDashboard={() => setShowRoleDashboard(true)}
      />

      {/* ── Main View Content ────────────────────────────────── */}
      <main className="flex-1">
        {/* VIEW 1: HOME (Default Public Portal Home Page) */}
        {activeTab === 'home' && (
          <PublicPortalHome
            onNavigateToMap={() => handleTabChange('map')}
            onNavigateToProjects={() => handleTabChange('projects')}
            onNavigateToGuidelines={() => handleTabChange('guidelines')}
            onNavigateToAbout={() => handleTabChange('about')}
            onNavigateToContact={() => handleTabChange('contact')}
            onNavigateToLogin={() => handleTabChange('login')}
            onOpenFraudReport={(proj) => {
              setSelectedFraudProject(proj || null);
              setIsFraudModalOpen(true);
            }}
          />
        )}

        {/* VIEW 2: PROJECTS (SEARCH) */}
        {activeTab === 'projects' && (
          <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-black text-slate-900 tracking-tight uppercase">
                  {t('projects_page.title', 'PROJECT DIRECTORY & CITIZEN AUDIT')}
                </h2>
                <p className="text-xs text-slate-500">
                  {t('projects_page.subtitle', 'Searchable database of sanctioned, active, and completed infrastructure works across India')}
                </p>
              </div>
              <button
                onClick={() => setActiveTab('home')}
                className="text-xs font-semibold text-teal-700 hover:underline flex items-center gap-1 cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" /> {t('projects_page.back_home', 'Back to Home')}
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {allProjects.map((p) => (
                <div
                  key={p.id}
                  className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs hover:border-teal-500 hover:shadow-md transition flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 mb-2">
                      <span>{p.project_uid}</span>
                      <span className="font-semibold text-teal-700 uppercase">{p.status}</span>
                    </div>
                    <h3 className="text-sm font-bold text-slate-900 mb-2">{getLocalizedProjectTitle(p, currentLang)}</h3>
                    <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-3">
                      <MapPin className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                      <span>{getLocalizedDistrict(p.district, currentLang)}, {getLocalizedState(p.state, currentLang)}</span>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-100 text-xs flex items-center justify-between">
                    <div>
                      <span className="text-slate-400 block text-[10px]">{t('projects_page.sanctioned_cost', 'Sanctioned Cost')}</span>
                      <span className="font-bold text-slate-800">
                        ₹{(p.sanctioned_amount / 100000).toFixed(2)} {t('common.lakh', 'Lakh')}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-slate-400 block text-[10px]">{t('projects_page.progress', 'Progress')}</span>
                      <span className="font-bold text-teal-700">{p.physical_progress_percent || 0}%</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* VIEW 3: ANALYTICS MAP */}
        {activeTab === 'map' && (
          <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-black text-slate-900 tracking-tight uppercase">
                  {t('map.title', 'GEO-SPATIAL INFRASTRUCTURE MAP')}
                </h2>
                <p className="text-xs text-slate-500">
                  {t('map.subtitle', 'Interactive GIS map visualizing verified civic works and asset clustering')}
                </p>
              </div>
              <button
                onClick={() => setActiveTab('home')}
                className="text-xs font-semibold text-teal-700 hover:underline flex items-center gap-1 cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" /> {t('map.back_home', 'Back to Home')}
              </button>
            </div>

            <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-md relative z-0 isolate">
              <GISMapViewer projects={allProjects} height="560px" />
            </div>
          </div>
        )}

        {/* VIEW 4: GUIDELINES (AI RAG POWERED) */}
        {activeTab === 'guidelines' && (
          <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-black text-slate-900 tracking-tight uppercase">
                  {t('portal.guidelines_title', 'MPLADS GUIDELINES & AI ASSISTANT')}
                </h2>
                <p className="text-xs text-slate-500">
                  {t('portal.guidelines_subtitle', 'Powered by Google Gemini 3.6 Flash & Qdrant Vector Semantic Search')}
                </p>
              </div>
              <button
                onClick={() => setActiveTab('home')}
                className="text-xs font-semibold text-teal-700 hover:underline flex items-center gap-1 cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" /> {t('map.back_home', 'Back to Home')}
              </button>
            </div>

            {/* Interactive Question Box */}
            <div className="portal-card p-6 bg-white">
              <form onSubmit={handleAskGuidelines} className="space-y-3">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                  {t('guidelines_page.ask_title', 'Ask Any Question About MPLADS Rules & Eligibility')}
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={guidelineQuery}
                    onChange={(e) => setGuidelineQuery(e.target.value)}
                    placeholder={t('guidelines_page.input_placeholder', 'e.g. Can MPLADS funds be used for solar street lights in villages?')}
                    className="flex-1 px-4 py-2.5 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-600"
                  />
                  <button
                    type="submit"
                    disabled={guidelineLoading}
                    className="px-5 py-2.5 bg-[#1c6877] hover:bg-[#15505c] text-white rounded-lg text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition disabled:opacity-50 cursor-pointer"
                  >
                    <Sparkles className="w-4 h-4" />
                    <span>{guidelineLoading ? t('guidelines_page.analyzing', 'Analyzing...') : t('guidelines_page.ask_ai', 'Ask AI')}</span>
                  </button>
                </div>
              </form>

              {/* Sample Prompts */}
              <div className="mt-3 flex flex-wrap gap-2 text-[11px] text-slate-500">
                <span className="font-semibold">{t('guidelines_page.quick_questions', 'Quick questions:')}</span>
                <button
                  type="button"
                  onClick={() => setGuidelineQuery('What are the rules for SC and ST quota allocations?')}
                  className="hover:text-teal-700 hover:underline cursor-pointer"
                >
                  • {t('guidelines_page.q_sc_st', 'SC/ST Quotas')}
                </button>
                <button
                  type="button"
                  onClick={() => setGuidelineQuery('What is the deadline for District Authority to sanction projects?')}
                  className="hover:text-teal-700 hover:underline cursor-pointer"
                >
                  • {t('guidelines_page.q_sla', '45-Day Sanction Rule')}
                </button>
                <button
                  type="button"
                  onClick={() => setGuidelineQuery('Can MPLADS funds be used for religious or private buildings?')}
                  className="hover:text-teal-700 hover:underline cursor-pointer"
                >
                  • {t('guidelines_page.q_inadmissible', 'Inadmissible Works')}
                </button>
              </div>

              {/* AI Answer Display */}
              {guidelineAnswer && (
                <div className="mt-6 p-4 bg-teal-50/70 border border-teal-200 rounded-xl space-y-3 animate-fade-in">
                  <div className="flex items-center gap-2 text-teal-900 font-bold text-xs uppercase tracking-wider">
                    <Sparkles className="w-4 h-4 text-teal-700" />
                    <span>{t('guidelines_page.verified_answer', 'Gemini AI Verified Answer')}</span>
                  </div>
                  <div className="text-xs sm:text-sm text-slate-800 leading-relaxed whitespace-pre-line">
                    {guidelineAnswer.answer}
                  </div>
                  {guidelineAnswer.source_chunks?.length > 0 && (
                    <div className="pt-2 border-t border-teal-200 text-[11px] text-slate-500">
                      <strong>{t('guidelines_page.cited_clauses', 'Cited Clauses:')}</strong>
                      <ul className="list-disc pl-4 mt-1 space-y-0.5">
                        {guidelineAnswer.source_chunks.map((c, i) => (
                          <li key={i} className="line-clamp-1">{c}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Official Key Rules Summary */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="portal-card p-5 bg-white space-y-2">
                <h4 className="text-xs font-black text-slate-900 uppercase">{t('guidelines_page.core_params', 'Core Scheme Parameters')}</h4>
                <ul className="text-xs text-slate-600 space-y-1.5 list-disc pl-4">
                  <li>{t('guidelines_page.entitlement_rule', 'Entitlement: ₹5 Crore per MP per annum.')}</li>
                  <li>{t('guidelines_page.sanction_rule', 'Sanction Window: Strict 45 days for District Authority.')}</li>
                  <li>{t('guidelines_page.completion_rule', 'Completion Limit: 1 year from sanction date.')}</li>
                  <li>{t('guidelines_page.social_welfare_rule', 'Social Welfare: Min 15% in SC areas & 7.5% in ST areas.')}</li>
                </ul>
              </div>

              <div className="portal-card p-5 bg-white space-y-2">
                <h4 className="text-xs font-black text-slate-900 uppercase">{t('guidelines_page.inadmissible_title', 'Strictly Inadmissible Works')}</h4>
                <ul className="text-xs text-slate-600 space-y-1.5 list-disc pl-4">
                  <li>{t('guidelines_page.inadmissible_1', 'Private property, individual residential houses or walls.')}</li>
                  <li>{t('guidelines_page.inadmissible_2', 'Places of religious worship or shrines of any faith.')}</li>
                  <li>{t('guidelines_page.inadmissible_3', 'Recurring repairs and routine maintenance.')}</li>
                  <li>{t('guidelines_page.inadmissible_4', 'Commercial assets owned by private entities.')}</li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* VIEW 5: ABOUT */}
        {activeTab === 'about' && (
          <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-black text-slate-900 tracking-tight uppercase">
                  {t('about_page.title', 'ABOUT MPLAD RAKSHAK')}
                </h2>
                <p className="text-xs text-slate-500">
                  {t('about_page.subtitle', 'AI-Powered Monitoring & Anomaly Detection for MPLADS (Smart India Hackathon 2024 PS 26102)')}
                </p>
              </div>
              <button
                onClick={() => setActiveTab('home')}
                className="text-xs font-semibold text-teal-700 hover:underline flex items-center gap-1 cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" /> {t('projects_page.back_home', 'Back to Home')}
              </button>
            </div>

            <div className="portal-card p-6 sm:p-8 bg-white space-y-4 leading-relaxed text-xs sm:text-sm text-slate-700">
              <h3 className="text-base font-bold text-slate-900">{t('about_page.platform_objective', 'Platform Objective')}</h3>
              <p>
                {t('about_page.objective_p1', 'MPLAD Rakshak is a specialized decision-support and fraud detection platform built for the Member of Parliament Local Area Development Scheme (MPLADS). Under the revised 2023 Guidelines, every MP is entitled to recommend durable community works worth ₹5 Crore annually.')}
              </p>
              <p>
                {t('about_page.objective_p2', 'This portal combines modern data engineering, EXIF image tamper detection, Google Gemini RAG guidelines intelligence, and automated CPWD Schedule of Rates (SoR) audits to ensure that public funds create lasting social infrastructure with complete transparency.')}
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4">
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                  <div className="text-teal-700 font-bold text-sm mb-1">{t('about_page.pillar1_title', 'Citizen Transparency')}</div>
                  <p className="text-[11px] text-slate-500">{t('about_page.pillar1_desc', 'Public search and geo-mapping of every recommended, sanctioned, and executed asset.')}</p>
                </div>
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                  <div className="text-teal-700 font-bold text-sm mb-1">{t('about_page.pillar2_title', 'AI Audit Engine')}</div>
                  <p className="text-[11px] text-slate-500">{t('about_page.pillar2_desc', 'Automatic detection of cost inflation, contractor cartelization, and duplicate assets.')}</p>
                </div>
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                  <div className="text-teal-700 font-bold text-sm mb-1">{t('about_page.pillar3_title', '45-Day SLA Tracking')}</div>
                  <p className="text-[11px] text-slate-500">{t('about_page.pillar3_desc', 'Automated countdown timer enforcing District Authority sanction decisions.')}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* VIEW 6: CONTACT */}
        {activeTab === 'contact' && (
          <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-black text-slate-900 tracking-tight uppercase">
                  {t('contact_page.title', 'OFFICIAL CONTACT & CITIZEN HELPDESK')}
                </h2>
                <p className="text-xs text-slate-500">
                  {t('contact_page.subtitle', 'Ministry of Statistics and Programme Implementation (MoSPI) • Government of India')}
                </p>
              </div>
              <button
                onClick={() => setActiveTab('home')}
                className="text-xs font-semibold text-teal-700 hover:underline flex items-center gap-1 cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" /> {t('projects_page.back_home', 'Back to Home')}
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="portal-card p-6 bg-white space-y-4">
                <h3 className="text-sm font-bold text-slate-900 uppercase">{t('contact_page.nodal_ministry', 'National Nodal Ministry')}</h3>
                <div className="space-y-2 text-xs text-slate-600">
                  <p className="font-semibold text-slate-800">{t('contact_page.ministry_name', 'Ministry of Statistics and Programme Implementation')}</p>
                  <p>{t('contact_page.address', 'Khurshid Lal Bhawan, Janpath, New Delhi - 110001')}</p>
                  <div className="pt-2 space-y-1.5">
                    <div className="flex items-center gap-2">
                      <Phone className="w-3.5 h-3.5 text-teal-700" />
                      <span>{t('contact_page.helpline', 'Toll Free Citizen Helpline: 1800-11-8080')}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Mail className="w-3.5 h-3.5 text-teal-700" />
                      <span>mplads-support@nic.in</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Globe className="w-3.5 h-3.5 text-teal-700" />
                      <span>https://mplads.mospi.gov.in</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="portal-card p-6 bg-white space-y-4">
                <h3 className="text-sm font-bold text-slate-900 uppercase">{t('contact_page.grievance_title', 'Grievances & Anomaly Reports')}</h3>
                <p className="text-xs text-slate-600">
                  {t('contact_page.grievance_desc', 'Citizens may submit formal complaints regarding delayed projects, substandard construction, or private property violations directly through this portal.')}
                </p>
                <button
                  onClick={() => setIsFraudModalOpen(true)}
                  className="w-full py-2.5 px-4 bg-red-700 hover:bg-red-800 text-white rounded-lg text-xs font-bold uppercase tracking-wider transition shadow-sm cursor-pointer"
                >
                  {t('contact_page.submit_grievance', 'Submit Citizen Grievance / Report Fraud')}
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* ── Official Government & SIH Hackathon Footer ────────────── */}
      <footer className="gov-navy-header text-white mt-16 border-t border-white/10 pt-12 pb-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-10">
          
          {/* Col 1: System Branding & Problem Statement */}
          <div className="space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-md bg-amber-400/20 border border-amber-400/40 flex items-center justify-center text-amber-300 font-bold text-sm">
                🛡️
              </div>
              <div>
                <h3 className="text-base font-bold tracking-tight text-white">MPLAD Rakshak</h3>
                <p className="text-[11px] text-amber-300 font-medium">AI Fraud & Anomaly Audit Platform</p>
              </div>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Autonomous statutory intelligence and forensic anomaly detection system for the Member of Parliament Local Area Development Scheme (MPLADS).
            </p>
            <div className="p-3 bg-white/5 border border-white/10 rounded-lg space-y-1.5">
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-slate-400">Initiative:</span>
                <a
                  href="https://www.sih.gov.in"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-amber-300 hover:text-amber-200 font-semibold inline-flex items-center gap-1 hover:underline"
                >
                  Smart India Hackathon 2026
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-slate-400">Problem Statement:</span>
                <a
                  href="https://www.sih.gov.in"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-white font-mono bg-white/10 px-1.5 py-0.5 rounded text-[10px] hover:bg-amber-400/20 hover:text-amber-300 transition"
                  title="PS 26102: AI-powered system to detect anomalies, fraud, and inefficiencies in MPLAD Scheme"
                >
                  PS ID 26102 (MoSPI)
                </a>
              </div>
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-slate-400">Team Name:</span>
                <span className="font-semibold text-emerald-300">The-LOLgorithms</span>
              </div>
            </div>
          </div>

          {/* Col 2: Official Government Portals & Guidelines */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-amber-300 flex items-center gap-1.5">
              <Building className="w-3.5 h-3.5" />
              Official Portals & References
            </h4>
            <ul className="space-y-2 text-xs text-slate-300">
              <li>
                <a
                  href="https://www.mospi.gov.in"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-amber-300 transition flex items-center justify-between group"
                >
                  <span>MoSPI (Ministry of Statistics)</span>
                  <ExternalLink className="w-3 h-3 text-slate-400 group-hover:text-amber-300" />
                </a>
              </li>
              <li>
                <a
                  href="https://mplads.gov.in"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-amber-300 transition flex items-center justify-between group"
                >
                  <span>MPLADS Official Portal</span>
                  <ExternalLink className="w-3 h-3 text-slate-400 group-hover:text-amber-300" />
                </a>
              </li>
              <li>
                <a
                  href="https://mplads.mospi.gov.in"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-amber-300 transition flex items-center justify-between group"
                >
                  <span>e-SAKSHI Implementation Engine</span>
                  <ExternalLink className="w-3 h-3 text-slate-400 group-hover:text-amber-300" />
                </a>
              </li>
              <li>
                <a
                  href="https://cpwd.gov.in"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-amber-300 transition flex items-center justify-between group"
                >
                  <span>CPWD Schedule of Rates (SoR)</span>
                  <ExternalLink className="w-3 h-3 text-slate-400 group-hover:text-amber-300" />
                </a>
              </li>
              <li>
                <a
                  href="https://www.niti.gov.in"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-amber-300 transition flex items-center justify-between group"
                >
                  <span>NITI Aayog (Development Monitoring)</span>
                  <ExternalLink className="w-3 h-3 text-slate-400 group-hover:text-amber-300" />
                </a>
              </li>
              <li>
                <a
                  href="https://data.gov.in"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-amber-300 transition flex items-center justify-between group"
                >
                  <span>Data.gov.in (Open Government Data)</span>
                  <ExternalLink className="w-3 h-3 text-slate-400 group-hover:text-amber-300" />
                </a>
              </li>
            </ul>
          </div>

          {/* Col 3: Development Team & GitHub Profiles */}
          <div className="space-y-3 lg:col-span-2">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold uppercase tracking-wider text-amber-300 flex items-center gap-1.5">
                <Github className="w-3.5 h-3.5" />
                Developers & Engineering Team (The-LOLgorithms)
              </h4>
              <span className="text-[10px] text-slate-400 bg-white/10 px-2 py-0.5 rounded hidden sm:inline">
                University of Lucknow (FoET)
              </span>
            </div>
            <p className="text-[11px] text-slate-300">
              Department of Computer Science & Engineering (AI):
            </p>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
              {/* Ashutosh Singh */}
              <a
                href="https://github.com/ashutoshsingh8"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between p-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 hover:border-amber-400/40 transition group"
              >
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-amber-400/20 flex items-center justify-center text-[11px] font-bold text-amber-300">
                    AS
                  </div>
                  <div>
                    <span className="text-xs font-semibold text-white group-hover:text-amber-300 block">
                      Ashutosh Singh
                    </span>
                    <span className="text-[10px] text-emerald-400 block font-medium">Team Leader</span>
                  </div>
                </div>
                <div className="flex items-center gap-1 text-[11px] text-slate-400 group-hover:text-white">
                  <span>@ashutoshsingh8</span>
                  <ExternalLink className="w-3 h-3" />
                </div>
              </a>

              {/* Ayush Arya */}
              <a
                href="https://github.com/ayusharya"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between p-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 hover:border-amber-400/40 transition group"
              >
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-blue-400/20 flex items-center justify-center text-[11px] font-bold text-blue-300">
                    AA
                  </div>
                  <div>
                    <span className="text-xs font-semibold text-white group-hover:text-amber-300 block">
                      Ayush Arya
                    </span>
                    <span className="text-[10px] text-slate-400 block">Developer</span>
                  </div>
                </div>
                <div className="flex items-center gap-1 text-[11px] text-slate-400 group-hover:text-white">
                  <span>@ayusharya</span>
                  <ExternalLink className="w-3 h-3" />
                </div>
              </a>

              {/* Amartya Singh */}
              <a
                href="https://github.com/AmartyaSingh"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between p-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 hover:border-amber-400/40 transition group"
              >
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-purple-400/20 flex items-center justify-center text-[11px] font-bold text-purple-300">
                    AS
                  </div>
                  <div>
                    <span className="text-xs font-semibold text-white group-hover:text-amber-300 block">
                      Amartya Singh
                    </span>
                    <span className="text-[10px] text-slate-400 block">Developer</span>
                  </div>
                </div>
                <div className="flex items-center gap-1 text-[11px] text-slate-400 group-hover:text-white">
                  <span>@AmartyaSingh</span>
                  <ExternalLink className="w-3 h-3" />
                </div>
              </a>

              {/* Md. Saklain Khan */}
              <a
                href="https://github.com/saklainkhan"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between p-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 hover:border-amber-400/40 transition group"
              >
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-emerald-400/20 flex items-center justify-center text-[11px] font-bold text-emerald-300">
                    SK
                  </div>
                  <div>
                    <span className="text-xs font-semibold text-white group-hover:text-amber-300 block">
                      Md. Saklain Khan
                    </span>
                    <span className="text-[10px] text-slate-400 block">Developer</span>
                  </div>
                </div>
                <div className="flex items-center gap-1 text-[11px] text-slate-400 group-hover:text-white">
                  <span>@saklainkhan</span>
                  <ExternalLink className="w-3 h-3" />
                </div>
              </a>

              {/* Akarsh Gupta */}
              <a
                href="https://github.com/Akarshxai"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between p-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 hover:border-amber-400/40 transition group"
              >
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-rose-400/20 flex items-center justify-center text-[11px] font-bold text-rose-300">
                    AG
                  </div>
                  <div>
                    <span className="text-xs font-semibold text-white group-hover:text-amber-300 block">
                      Akarsh Gupta
                    </span>
                    <span className="text-[10px] text-slate-400 block">Developer</span>
                  </div>
                </div>
                <div className="flex items-center gap-1 text-[11px] text-slate-400 group-hover:text-white">
                  <span>@Akarshxai</span>
                  <ExternalLink className="w-3 h-3" />
                </div>
              </a>

              {/* Alisha Rahman */}
              <a
                href="https://github.com/alisharahman"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between p-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 hover:border-amber-400/40 transition group"
              >
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-pink-400/20 flex items-center justify-center text-[11px] font-bold text-pink-300">
                    AR
                  </div>
                  <div>
                    <span className="text-xs font-semibold text-white group-hover:text-amber-300 block">
                      Alisha Rahman
                    </span>
                    <span className="text-[10px] text-slate-400 block">Developer</span>
                  </div>
                </div>
                <div className="flex items-center gap-1 text-[11px] text-slate-400 group-hover:text-white">
                  <span>@alisharahman</span>
                  <ExternalLink className="w-3 h-3" />
                </div>
              </a>
            </div>
          </div>
        </div>

        {/* ── Bottom Sub-Bar: Copyright, Government Disclaimer & Quick Links ── */}
        <div className="max-w-7xl mx-auto pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          <div className="flex flex-wrap items-center gap-2 text-center sm:text-left">
            <span className="font-semibold text-white">© 2026 Team The-LOLgorithms</span>
            <span>•</span>
            <span className="text-slate-300">Smart India Hackathon (SIH 2026)</span>
            <span>•</span>
            <span className="text-amber-300/90 font-medium">Under Ministry of Statistics & Programme Implementation (MoSPI)</span>
          </div>

          <div className="flex items-center gap-4 text-[11px]">
            <a
              href="https://github.com/ashutoshsingh8/MPLAD_Rakshak"
              target="_blank"
              rel="noopener noreferrer"
              className="text-slate-300 hover:text-white flex items-center gap-1 transition"
            >
              <Github className="w-3.5 h-3.5" />
              <span>GitHub Repository</span>
            </a>
            <span>•</span>
            <button
              id="footer-login-button"
              onClick={() => setActiveTab('login')}
              className="text-amber-300 hover:underline font-semibold cursor-pointer"
            >
              {t('nav.login', 'Official Login')}
            </button>
          </div>
        </div>
      </footer>

      {/* ── Login Modal (Matching exact LOGIN FORM diagram) ─── */}
      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        onLoginSuccess={handleLoginSuccess}
      />

      {/* ── Report Fraud Modal ──────────────────────────────── */}
      <ReportFraudModal
        isOpen={isFraudModalOpen}
        onClose={() => {
          setIsFraudModalOpen(false);
          setSelectedFraudProject(null);
        }}
        targetProject={selectedFraudProject}
        allProjects={allProjects}
      />
    </div>
  );
}
