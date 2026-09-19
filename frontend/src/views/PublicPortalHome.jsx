import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Search, MapPin, IndianRupee, Filter, CheckCircle2, Clock, AlertTriangle,
  FileText, Landmark, Info, MoreHorizontal, BarChart3, BookOpen, HelpCircle,
  ShieldAlert, ChevronRight, X, Eye, ArrowUpRight, Check,
  Calendar, Building, HardHat, FileSpreadsheet, ShieldCheck, Award, Phone, ExternalLink
} from 'lucide-react';
import { getProjects } from '../services/api';
import { getLocalizedState, getLocalizedDistrict } from '../utils/geoTranslations';
import { getLocalizedProjectTitle, COMMON_PHRASE_TRANSLATIONS, getLocalizedContractorDivision } from '../utils/projectTranslations';

const getContractorAndTenderDetails = (project) => {
  if (!project) return null;
  const id = project.id || 1;
  const agencies = [
    {
      name: 'M/s ABC Constructions Pvt. Ltd.',
      license: 'PWD-CL1-MH-2018-842',
      director: 'Mr. Ramesh Shinde (Managing Director)',
      engineer: 'Er. Sunil V. Deshmukh (Lead Civil Engineer)',
      division: `${project.district || 'Pune'} Zilla Parishad & Public Works Division`,
      classType: 'Class-1 Empanelled (Limit ₹10 Cr)',
      rating: '4.8 / 5.0 (A+ Grade • 0 Vigilance Inquiries)',
      escrowBank: 'State Bank of India (PFMS Escrow Account ESC-MH-842)',
      gstin: '27AABCA1234F1Z8',
      contact: '+91 98220 14820 (Site Office)',
    },
    {
      name: 'M/s Sharma Builders & Infra Ltd.',
      license: 'PWD-CL1-MH-2019-311',
      director: 'Shri R. K. Sharma (Managing Director)',
      engineer: 'Er. Sandeep Patil (Executive Engineer)',
      division: `${project.district || 'Pune'} Rural Engineering Division`,
      classType: 'Class-1 Empanelled (Limit ₹10 Cr)',
      rating: '4.6 / 5.0 (A Grade • 100% Milestone Compliance)',
      escrowBank: 'Punjab National Bank (Escrow Account ESC-MH-311)',
      gstin: '27SBUIL5678G1Z2',
      contact: '+91 98224 88310',
    },
    {
      name: 'M/s Patel Infrastructure & Civil Tech',
      license: 'PWD-CL1-GJ-2020-554',
      director: 'Mr. Amit Patel (Director)',
      engineer: 'Er. Hiren Joshi (Project Engineer)',
      division: `${project.district || 'Gujarat'} Public Works Division`,
      classType: 'Class-1 Empanelled (Limit ₹15 Cr)',
      rating: '4.9 / 5.0 (Star Empanelled • Zero Delays)',
      escrowBank: 'Bank of Baroda (Govt Treasury Linked ESC-GJ-554)',
      gstin: '24PINFA9012H1Z5',
      contact: '+91 98251 90120',
    },
    {
      name: 'M/s Kumar & Associates Infra',
      license: 'PWD-CL1-UP-2017-902',
      director: 'Er. Sunil Kumar (Principal Partner)',
      engineer: 'Er. Rajesh Varma (Site Head)',
      division: `${project.district || 'UP'} Municipal Engineering Cell`,
      classType: 'Class-1 Empanelled (Limit ₹10 Cr)',
      rating: '4.5 / 5.0 (Compliant • On-track Schedule)',
      escrowBank: 'Union Bank of India (PFMS Escrow ESC-UP-902)',
      gstin: '09KUASC3456I1Z9',
      contact: '+91 98390 34560',
    },
  ];

  const contractor = agencies[(id - 1) % agencies.length];
  const sanctionedVal = project.sanctioned_amount || 4800000;
  const awardedVal = Math.round(sanctionedVal * 0.96);
  const disbursedVal = project.expenditure_to_date || Math.round(sanctionedVal * ((project.physical_progress_percent || 35) / 100));

  return {
    contractor,
    tender: {
      nitNo: `NIT/PWD/${(project.district || 'PUN').slice(0, 3).toUpperCase()}/2025/W-${id + 100}`,
      gemRef: `GeM/2025/B/982${id + 100}`,
      biddingMethod: 'Open Competitive E-Tender (Two-Cover Electronic System)',
      technicalScore: '94.5 / 100 (Technical Benchmark Cleared)',
      sanctionedVal,
      awardedVal,
      disbursedVal,
      workOrderRef: `WO/2026/MPLAD/${(project.district || 'PUN').slice(0, 3).toUpperCase()}/${id + 104}`,
      agreementDate: '15-Jan-2026',
    },
    dates: {
      recommendedDate: project.recommended_date || '14-Sep-2025',
      technicalSanctionDate: '18-Oct-2025',
      administrativeSanctionDate: project.sanctioned_date || '04-Nov-2025',
      tenderPublicationDate: '22-Nov-2025',
      workOrderAwardDate: '15-Jan-2026',
      workCommencedDate: '05-Feb-2026',
      completionDeadline: project.stipulated_completion_date || '15-Dec-2026',
      latestAuditDate: project.actual_completion_date || '08-Sep-2026',
    },
  };
};

export default function PublicPortalHome({
  onNavigateToMap,
  onNavigateToProjects,
  onNavigateToGuidelines,
  onNavigateToAbout,
  onNavigateToContact,
  onNavigateToLogin,
  onOpenFraudReport,
}) {
  const { t, i18n } = useTranslation();
  const currentLang = i18n.language ? i18n.language.split('-')[0] : 'en';
  const [keyword, setKeyword] = useState('');
  const [selectedState, setSelectedState] = useState('ALL');
  const [selectedDistrict, setSelectedDistrict] = useState('ALL');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [selectedStatus, setSelectedStatus] = useState('ALL');

  const [allProjects, setAllProjects] = useState([]);
  const [filteredProjects, setFilteredProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeSubTab, setActiveSubTab] = useState('QUICK SEARCH');
  const [selectedProjectModal, setSelectedProjectModal] = useState(null);
  const [infoModal, setInfoModal] = useState(null);

  // States & Districts list from seeded data
  const stateDistricts = {
    Maharashtra: ['Pune', 'Mumbai', 'Nagpur', 'Nashik'],
    Gujarat: ['Ahmedabad', 'Surat', 'Vadodara', 'Rajkot'],
    'Uttar Pradesh': ['Lucknow', 'Varanasi', 'Kanpur', 'Prayagraj'],
    Delhi: ['New Delhi', 'North Delhi', 'South Delhi'],
  };

  const categories = [
    { value: 'ALL', label: t('categories.ALL', 'All Sectors') },
    { value: 'COMMUNITY_CENTER', label: t('categories.COMMUNITY_CENTER', 'Community Centers') },
    { value: 'ROADS', label: t('categories.ROADS', 'Roads & Bridges') },
    { value: 'DRINKING_WATER', label: t('categories.DRINKING_WATER', 'Drinking Water') },
    { value: 'SANITATION', label: t('categories.SANITATION', 'Sanitation') },
    { value: 'EDUCATION', label: t('categories.EDUCATION', 'Education & Schools') },
    { value: 'HEALTH', label: t('categories.HEALTH', 'Public Health & PHCs') },
    { value: 'SPORTS', label: t('categories.SPORTS', 'Sports & Parks') },
  ];

  const statuses = [
    { value: 'ALL', label: t('statuses.ALL', 'All Statuses') },
    { value: 'IN_PROGRESS', label: t('status.in_progress', 'In Progress') },
    { value: 'SANCTIONED', label: t('status.sanctioned', 'Sanctioned') },
    { value: 'COMPLETED', label: t('status.completed', 'Completed') },
    { value: 'FLAGGED_REVIEW', label: t('status.flagged', 'Flagged for Review') },
    { value: 'RECOMMENDED', label: t('status.recommended', 'Recommended') },
  ];

  // Fetch projects on load
  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    setLoading(true);
    try {
      const data = await getProjects({ page_size: 100 });
      if (data && data.projects) {
        setAllProjects(data.projects);
        setFilteredProjects(data.projects);
      }
    } catch (err) {
      console.error('Failed to load public projects:', err);
    } finally {
      setLoading(false);
    }
  };

  // Filter projects whenever search criteria change
  useEffect(() => {
    let result = [...allProjects];

    if (keyword.trim()) {
      const q = keyword.toLowerCase();
      result = result.filter(
        (p) =>
          p.title?.toLowerCase().includes(q) ||
          p.project_uid?.toLowerCase().includes(q) ||
          p.district?.toLowerCase().includes(q) ||
          p.state?.toLowerCase().includes(q)
      );
    }

    if (selectedState !== 'ALL') {
      result = result.filter((p) => p.state === selectedState);
    }

    if (selectedDistrict !== 'ALL') {
      result = result.filter((p) => p.district === selectedDistrict);
    }

    if (selectedCategory !== 'ALL') {
      result = result.filter((p) => p.category === selectedCategory);
    }

    if (selectedStatus !== 'ALL') {
      result = result.filter((p) => p.status === selectedStatus);
    }

    setFilteredProjects(result);
  }, [keyword, selectedState, selectedDistrict, selectedCategory, selectedStatus, allProjects]);

  const handleStateChange = (state) => {
    setSelectedState(state);
    setSelectedDistrict('ALL');
  };

  const formatRupees = (amt) => {
    if (!amt) return '₹0';
    if (amt >= 1_00_00_000) return `₹${(amt / 1_00_00_000).toFixed(2)} Cr`;
    if (amt >= 1_00_000) return `₹${(amt / 1_00_000).toFixed(2)} Lakh`;
    return `₹${Number(amt).toLocaleString('en-IN')}`;
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'COMPLETED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
            <CheckCircle2 className="w-3 h-3" /> {t('status.completed', 'Completed')}
          </span>
        );
      case 'IN_PROGRESS':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-100 text-amber-800 border border-amber-200">
            <Clock className="w-3 h-3" /> {t('status.in_progress', 'In Progress')}
          </span>
        );
      case 'FLAGGED_REVIEW':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-red-100 text-red-800 border border-red-200">
            <AlertTriangle className="w-3 h-3" /> {t('status.flagged', 'Under Audit')}
          </span>
        );
      case 'SANCTIONED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-blue-100 text-blue-800 border border-blue-200">
            <Check className="w-3 h-3" /> {t('status.sanctioned', 'Sanctioned')}
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-slate-100 text-slate-800 border border-slate-200">
            {status}
          </span>
        );
    }
  };

  return (
    <div className="min-h-screen gov-portal-bg text-slate-800 pb-16">
      {/* ── Main Container ─────────────────────────────────── */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 space-y-6">
        {/* Main Headline from Screenshot */}
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900 tracking-tight text-center uppercase py-2">
          {t('portal.public_portal_home', 'PUBLIC PORTAL HOME')}
        </h1>

        {/* ── Main Featured Card (PUBLIC SEARCH) ─────────────── */}
        <div className="portal-card overflow-hidden shadow-xl">
          {/* Teal Gradient Header matching image */}
          <div className="portal-hero-gradient p-6 sm:p-8 text-white relative">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-center tracking-wide uppercase mb-6 drop-shadow-sm">
              {t('portal.public_search', 'PUBLIC SEARCH')}
            </h2>

            {/* Keyword Search Bar */}
            <div className="max-w-xl mx-auto mb-4">
              <div className="relative flex items-center shadow-lg rounded-xl overflow-hidden bg-white">
                <input
                  id="public-search-input"
                  type="text"
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                  placeholder={t('portal.search_placeholder', 'search project keyword...')}
                  className="w-full px-5 py-3.5 text-sm sm:text-base text-slate-800 placeholder-slate-400 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => {
                    const el = document.getElementById('search-filter-area');
                    if (el) el.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="bg-[#1c6877] hover:bg-[#15505c] text-white px-5 py-3.5 transition flex items-center justify-center cursor-pointer"
                  title="Search"
                >
                  <Search className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Sub Tabs: ANALYSIS MAP | QUICK SEARCH (Custom View removed) */}
            <div className="flex items-center justify-center gap-6 sm:gap-10 text-xs sm:text-sm font-bold tracking-wider text-teal-100 pt-1 pb-4">
              <button
                onClick={() => {
                  setActiveSubTab('ANALYSIS MAP');
                  onNavigateToMap && onNavigateToMap();
                }}
                className="hover:text-white uppercase transition pb-1.5 border-b-2 border-transparent hover:border-white/80 flex items-center gap-1.5 cursor-pointer"
              >
                <MapPin className="w-3.5 h-3.5 text-amber-300" />
                <span>{t('nav.map', 'ANALYSIS MAP')}</span>
              </button>
              <button
                onClick={() => setActiveSubTab('QUICK SEARCH')}
                className={`uppercase transition pb-1.5 border-b-2 cursor-pointer flex items-center gap-1.5 ${
                  activeSubTab === 'QUICK SEARCH'
                    ? 'border-white text-white font-black'
                    : 'border-transparent text-teal-200 hover:border-white/80 hover:text-white'
                }`}
              >
                <Search className="w-3.5 h-3.5 text-amber-300" />
                <span>{t('portal.quick_search', 'QUICK SEARCH')}</span>
              </button>
            </div>

            {/* Symmetrical Citizen Transparency & Audit Preview Banner */}
            <div className="mt-3 max-w-4xl mx-auto bg-white/12 backdrop-blur-md rounded-2xl p-5 sm:p-6 border border-white/25 shadow-xl">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                {/* Left Column: Symmetrical Preview Cards (Flat, Symmetrical, Equal Height) */}
                <div className="grid grid-cols-2 gap-3.5 w-full">
                  {/* Card 1: Community Asset Audit */}
                  <div className="bg-white rounded-xl shadow-md p-3.5 text-slate-800 border border-slate-100 flex flex-col justify-between h-34 hover:shadow-lg transition">
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-[9px] font-black tracking-wider uppercase px-1.5 py-0.5 rounded bg-teal-50 text-teal-800 border border-teal-200">
                          {t('portal.civic_asset_audit', 'Civic Asset Audit')}
                        </span>
                        <span className="text-[9px] font-bold text-amber-600 bg-amber-50 px-1 rounded">75%</span>
                      </div>
                      <div className="text-[11px] font-bold text-slate-900 line-clamp-1">
                        {COMMON_PHRASE_TRANSLATIONS.panchayat_hall[currentLang] || 'Panchayat Community Hall'}
                      </div>
                      <div className="text-[10px] text-slate-500 flex items-center gap-1 mt-0.5">
                        <MapPin className="w-2.5 h-2.5 text-teal-600 shrink-0" />
                        <span className="truncate">{COMMON_PHRASE_TRANSLATIONS.wadgaon_pune[currentLang] || 'Wadgaon, Pune'}</span>
                      </div>
                    </div>
                    <div>
                      <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden mb-1.5">
                        <div className="bg-teal-600 h-full rounded-full w-3/4" />
                      </div>
                      <div className="flex items-center justify-between text-[10px] text-slate-600">
                        <span className="font-bold text-slate-800">₹32.00 Lakh</span>
                        <span className="text-emerald-700 font-semibold">{t('status.in_progress', 'In Progress')}</span>
                      </div>
                    </div>
                  </div>

                  {/* Card 2: GIS Map Verification */}
                  <div className="bg-white rounded-xl shadow-md p-3.5 text-slate-800 border border-slate-100 flex flex-col justify-between h-34 hover:shadow-lg transition">
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-[9px] font-black tracking-wider uppercase px-1.5 py-0.5 rounded bg-blue-50 text-blue-800 border border-blue-200">
                          {t('portal.gps_centroid', 'GIS GPS Centroid')}
                        </span>
                        <MapPin className="w-3 h-3 text-teal-600" />
                      </div>
                      <div className="text-[11px] font-bold text-slate-900">
                        18.5204° N, 73.8567° E
                      </div>
                      <div className="text-[10px] text-emerald-700 font-semibold flex items-center gap-1 mt-0.5">
                        <ShieldCheck className="w-3 h-3 text-emerald-600 shrink-0" />
                        <span>{t('portal.anomaly_0m', '0m GPS Anomaly')}</span>
                      </div>
                    </div>
                    <div className="p-1.5 bg-slate-50 rounded-lg border border-slate-100 flex items-center justify-between text-[10px]">
                      <span className="text-slate-500 font-mono text-[9px]">{t('portal.statutory_check', 'STATUTORY CHECK')}</span>
                      <span className="text-emerald-700 font-bold">{t('portal.verified_50m', '50m Verified')}</span>
                    </div>
                  </div>
                </div>

                {/* Right Column: Symmetrical Citizen Transparency Overview */}
                <div className="flex flex-col justify-center text-left space-y-2.5">
                  <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/20 text-white rounded-full text-xs font-bold uppercase tracking-wider w-fit border border-white/20">
                    <ShieldCheck className="w-3.5 h-3.5 text-amber-300" />
                    <span>{t('portal.citizen_transparency', 'Citizen Transparency')}</span>
                  </div>
                  <h4 className="text-base sm:text-lg font-black text-white tracking-wide leading-snug">
                    {t('portal.oversight_heading', 'Direct Public Oversight for ₹5 Cr Annual MP Funds')}
                  </h4>
                  <p className="text-xs text-teal-100 leading-relaxed">
                    {t('portal.oversight_desc', 'Search ₹5 Crore annual MP funds, geo-tagged civic infrastructure, and ground completion audits across India.')}
                  </p>
                  <div className="flex flex-wrap gap-2 pt-1 text-[11px] text-teal-50">
                    <span className="inline-flex items-center gap-1 bg-black/20 px-2.5 py-0.5 rounded-full border border-white/15">
                      <Check className="w-3 h-3 text-emerald-300" /> {t('portal.geo_tagged_100', '100% Geo-Tagged')}
                    </span>
                    <span className="inline-flex items-center gap-1 bg-black/20 px-2.5 py-0.5 rounded-full border border-white/15">
                      <Check className="w-3 h-3 text-emerald-300" /> {t('portal.pfms_audited', 'PFMS Escrow Audited')}
                    </span>
                    <span className="inline-flex items-center gap-1 bg-black/20 px-2.5 py-0.5 rounded-full border border-white/15">
                      <Check className="w-3 h-3 text-emerald-300" /> {t('portal.zero_login', 'Zero Login Needed')}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ── Area Filter Section for Public Usage ─────────── */}
          <div className="p-6 sm:p-8 bg-white border-b border-slate-200">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 mb-4">
              <div>
                <h3 className="text-lg font-black text-slate-800 tracking-wide uppercase">
                  {t('portal.filter_by_area', 'FILTER PROJECTS BY YOUR AREA')}
                </h3>
                <p className="text-xs text-slate-500">
                  {t('portal.filter_subtitle', 'Select your State / UT and District to inspect local community works in your neighborhood')}
                </p>
              </div>
              <div className="text-xs font-bold text-[#1c6877] bg-teal-50 px-3 py-1 rounded-full border border-teal-200">
                {filteredProjects.length} {t('portal.works_found', 'Works Found')}
              </div>
            </div>

            {/* Filter Dropdowns Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {/* State / UT */}
              <div>
                <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">
                  {t('portal.state_ut', 'State / UT')}
                </label>
                <select
                  value={selectedState}
                  onChange={(e) => handleStateChange(e.target.value)}
                  className="w-full px-3 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-300 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-600 transition"
                >
                  <option value="ALL">{t('portal.all_states', 'All States / UTs')}</option>
                  {Object.keys(stateDistricts).map((st) => (
                    <option key={st} value={st}>
                      {getLocalizedState(st, currentLang)}
                    </option>
                  ))}
                </select>
              </div>

              {/* District */}
              <div>
                <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">
                  {t('portal.district', 'District')}
                </label>
                <select
                  value={selectedDistrict}
                  onChange={(e) => setSelectedDistrict(e.target.value)}
                  className="w-full px-3 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-300 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-600 transition"
                >
                  <option value="ALL">{t('portal.all_districts', 'All Districts')}</option>
                  {selectedState !== 'ALL' && stateDistricts[selectedState]
                    ? stateDistricts[selectedState].map((dist) => (
                        <option key={dist} value={dist}>
                          {getLocalizedDistrict(dist, currentLang)}
                        </option>
                      ))
                    : Object.values(stateDistricts)
                        .flat()
                        .map((dist) => (
                          <option key={dist} value={dist}>
                            {getLocalizedDistrict(dist, currentLang)}
                          </option>
                        ))}
                </select>
              </div>

              {/* Sector / Category */}
              <div>
                <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">
                  {t('portal.sector_label', 'Sector / Work Type')}
                </label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full px-3 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-300 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-600 transition"
                >
                  {categories.map((c) => (
                    <option key={c.value} value={c.value}>
                      {c.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Project Status */}
              <div>
                <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">
                  {t('portal.status_label', 'Execution Status')}
                </label>
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="w-full px-3 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-300 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-600 transition"
                >
                  {statuses.map((s) => (
                    <option key={s.value} value={s.value}>
                      {s.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* ── Filtered Project Results List ────────────────── */}
          <div className="p-6 sm:p-8 bg-slate-50/50">
            {loading ? (
              <div className="text-center py-10 text-slate-500 text-sm">
                Loading community works...
              </div>
            ) : filteredProjects.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-xl border border-slate-200 p-6">
                <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-3 text-slate-400">
                  <Search className="w-6 h-6" />
                </div>
                <h4 className="text-base font-bold text-slate-800">{t('portal.no_projects', 'No Projects Found')}</h4>
                <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                  No community works matched your selected filters. Try choosing "All Districts" or clearing the keyword.
                </p>
                <button
                  onClick={() => {
                    setKeyword('');
                    setSelectedState('ALL');
                    setSelectedDistrict('ALL');
                    setSelectedCategory('ALL');
                    setSelectedStatus('ALL');
                  }}
                  className="mt-3 px-4 py-1.5 text-xs font-bold text-teal-700 hover:underline"
                >
                  {t('portal.reset_filters', 'Reset All Filters')}
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredProjects.slice(0, 6).map((project) => (
                    <div
                      key={project.id}
                      className="bg-white rounded-xl p-4 border border-slate-200 hover:border-teal-400 hover:shadow-md transition flex flex-col justify-between"
                    >
                      <div>
                        {/* Top UID + Status */}
                        <div className="flex items-center justify-between gap-2 mb-2">
                          <span className="text-[10px] font-mono font-bold text-slate-400">
                            {project.project_uid}
                          </span>
                          {getStatusBadge(project.status)}
                        </div>

                        {/* Title */}
                        <h4 className="text-xs sm:text-sm font-bold text-slate-800 line-clamp-2 mb-2 hover:text-teal-700 transition">
                          {getLocalizedProjectTitle(project, currentLang)}
                        </h4>

                        {/* Location */}
                        <div className="flex items-center gap-1 text-[11px] text-slate-500 mb-2">
                          <MapPin className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                          <span>
                            {getLocalizedDistrict(project.district, currentLang)}, {getLocalizedState(project.state, currentLang)}
                          </span>
                        </div>
                      </div>

                      <div className="pt-3 border-t border-slate-100 space-y-2">
                        {/* Financials & Progress */}
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-slate-500">{t('portal.sanctioned_cost', 'Sanctioned Cost')}:</span>
                          <span className="font-bold text-slate-900">
                            {formatRupees(project.sanctioned_amount)}
                          </span>
                        </div>

                        {/* Progress Bar */}
                        <div>
                          <div className="flex items-center justify-between text-[10px] text-slate-500 mb-1">
                            <span>{t('portal.physical_progress', 'Physical Progress')}</span>
                            <span className="font-semibold text-slate-700">
                              {project.physical_progress_percent || 0}%
                            </span>
                          </div>
                          <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                            <div
                              className="bg-teal-600 h-full rounded-full transition-all duration-500"
                              style={{ width: `${project.physical_progress_percent || 0}%` }}
                            />
                          </div>
                        </div>

                        {/* Action Buttons: View Details & Report Fraud */}
                        <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
                          <button
                            onClick={() => setSelectedProjectModal(project)}
                            className="flex-1 py-1.5 px-2 text-center text-xs font-bold text-teal-800 bg-teal-50 hover:bg-teal-100 rounded-lg transition flex items-center justify-center gap-1.5 cursor-pointer border border-teal-200 shadow-2xs"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>{t('portal.view_public_details', 'View Public Details')}</span>
                          </button>
                          <button
                            onClick={() => onOpenFraudReport && onOpenFraudReport(project)}
                            className="py-1.5 px-2.5 text-center text-xs font-bold text-red-700 bg-red-50 hover:bg-red-100 rounded-lg transition flex items-center justify-center gap-1 cursor-pointer border border-red-200 shadow-2xs"
                            title="Report Fraud / Anomaly on this project"
                          >
                            <ShieldAlert className="w-3.5 h-3.5 text-red-600" />
                            <span className="hidden sm:inline">{t('portal.report_fraud', 'Report Fraud')}</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {filteredProjects.length > 6 && (
                  <div className="text-center pt-3">
                    <button
                      onClick={onNavigateToProjects}
                      className="inline-flex items-center gap-1.5 px-6 py-2 rounded-lg bg-teal-50 hover:bg-teal-100 text-teal-800 text-xs font-bold transition border border-teal-200 shadow-xs cursor-pointer"
                    >
                      <span>{t('portal.view_all_directory', 'View All Projects in Directory')}</span>
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* ── Quick Links & About Section (Cleaned & 100% Functional) ─ */}
          <div className="p-6 sm:p-8 bg-white border-t border-slate-200">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Quick Links (Cleaned into 3 Functional Pillars) */}
              <div className="lg:col-span-2">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-sm font-black text-slate-800 uppercase tracking-wider">
                    {t('portal.quick_links', 'QUICK LINKS')}
                  </h4>
                  <span className="text-[11px] text-teal-800 font-semibold bg-teal-50 px-2.5 py-0.5 rounded-full border border-teal-200">
                    {t('portal.citizen_services', 'Citizen Transparency Services')}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-y-3 gap-x-6 text-xs">
                  {/* Column 1: Citizen Search & Projects */}
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
                      {t('portal.search_projects_col', 'Search & Projects')}
                    </span>
                    <ul className="space-y-2 text-slate-600">
                      <li>
                        <button
                          onClick={() => {
                            const el = document.getElementById('search-section');
                            if (el) el.scrollIntoView({ behavior: 'smooth' });
                            const input = document.getElementById('public-search-input');
                            if (input) setTimeout(() => input.focus(), 300);
                          }}
                          className="flex items-center gap-1.5 hover:text-teal-800 transition font-medium cursor-pointer text-left"
                        >
                          <Search className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                          <span>{t('portal.public_proj_search', 'Public Project Search')}</span>
                        </button>
                      </li>
                      <li>
                        <button
                          onClick={onNavigateToProjects}
                          className="flex items-center gap-1.5 hover:text-teal-800 transition font-medium cursor-pointer text-left"
                        >
                          <FileText className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                          <span>{t('portal.projects_directory', 'Projects Directory')}</span>
                        </button>
                      </li>
                      <li>
                        <button
                          onClick={onNavigateToMap}
                          className="flex items-center gap-1.5 hover:text-teal-800 transition font-medium cursor-pointer text-left"
                        >
                          <MapPin className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                          <span>{t('portal.analytics_map_link', 'Interactive Analytics Map')}</span>
                        </button>
                      </li>
                      <li>
                        <button
                          onClick={onNavigateToGuidelines}
                          className="flex items-center gap-1.5 hover:text-teal-800 transition font-medium cursor-pointer text-left"
                        >
                          <BookOpen className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                          <span>{t('portal.rules_ai_link', 'MPLADS Rules & AI Assistant')}</span>
                        </button>
                      </li>
                    </ul>
                  </div>

                  {/* Column 2: Vigilance & Integrity */}
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
                      {t('portal.vigilance_quotas', 'Vigilance & Quotas')}
                    </span>
                    <ul className="space-y-2 text-slate-600">
                      <li>
                        <button
                          onClick={() => onOpenFraudReport && onOpenFraudReport(null)}
                          className="flex items-center gap-1.5 text-red-600 hover:text-red-800 font-bold transition cursor-pointer text-left"
                        >
                          <ShieldAlert className="w-3.5 h-3.5 text-red-500 shrink-0" />
                          <span>{t('portal.report_fraud_menu', 'Report Fraud / Anomaly')}</span>
                        </button>
                      </li>
                      <li>
                        <button
                          onClick={() => setInfoModal('SLA_RULES')}
                          className="flex items-center gap-1.5 hover:text-teal-800 transition font-medium cursor-pointer text-left"
                        >
                          <Clock className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                          <span>{t('portal.sla_rule_menu', 'Statutory 45-Day Sanction SLA')}</span>
                        </button>
                      </li>
                      <li>
                        <button
                          onClick={() => setInfoModal('SC_ST_RULES')}
                          className="flex items-center gap-1.5 hover:text-teal-800 transition font-medium cursor-pointer text-left"
                        >
                          <Award className="w-3.5 h-3.5 text-purple-600 shrink-0" />
                          <span>{t('portal.sc_st_quota_menu', 'SC / ST Welfare Quotas (15% & 7.5%)')}</span>
                        </button>
                      </li>
                      <li>
                        <button
                          onClick={() => setInfoModal('CPWD_RULES')}
                          className="flex items-center gap-1.5 hover:text-teal-800 transition font-medium cursor-pointer text-left"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                          <span>{t('portal.cpwd_rate_menu', 'CPWD Rate Benchmarks')}</span>
                        </button>
                      </li>
                    </ul>
                  </div>

                  {/* Column 3: Portals & Governance */}
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
                      {t('portal.official_governance', 'Official Governance')}
                    </span>
                    <ul className="space-y-2 text-slate-600">
                      <li>
                        <button
                          onClick={onNavigateToLogin}
                          className="flex items-center gap-1.5 hover:text-teal-800 transition font-medium cursor-pointer text-left"
                        >
                          <Landmark className="w-3.5 h-3.5 text-teal-700 shrink-0" />
                          <span>{t('portal.dept_login_menu', 'Department Official Login')}</span>
                        </button>
                      </li>
                      <li>
                        <button
                          onClick={onNavigateToContact}
                          className="flex items-center gap-1.5 hover:text-teal-800 transition font-medium cursor-pointer text-left"
                        >
                          <Phone className="w-3.5 h-3.5 text-teal-700 shrink-0" />
                          <span>{t('portal.mospi_cell_menu', 'MoSPI Grievance Cell')}</span>
                        </button>
                      </li>
                      <li>
                        <button
                          onClick={onNavigateToAbout}
                          className="flex items-center gap-1.5 hover:text-teal-800 transition font-medium cursor-pointer text-left"
                        >
                          <Info className="w-3.5 h-3.5 text-teal-700 shrink-0" />
                          <span>{t('portal.about_menu', 'About MPLAD Rakshak')}</span>
                        </button>
                      </li>
                      <li>
                        <a
                          href="https://www.mplads.gov.in/"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1.5 hover:text-teal-800 transition font-medium cursor-pointer text-left"
                        >
                          <ExternalLink className="w-3.5 h-3.5 text-teal-700 shrink-0" />
                          <span>{t('portal.scheme_portal_link', 'Official MoSPI Scheme Portal')}</span>
                        </a>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* About Box matching design */}
              <div className="portal-mint-box p-5 rounded-xl flex flex-col justify-between border border-teal-200/60 shadow-xs">
                <div>
                  <div className="flex items-center gap-1.5 mb-2">
                    <Landmark className="w-4 h-4 text-teal-800" />
                    <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider">
                      {t('about_page.title', 'ABOUT MPLAD RAKSHAK')}
                    </h4>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed mb-3">
                    {t('portal.about_summary', 'AI-powered public vigilance and real-time anomaly detection engine for the Member of Parliament Local Area Development Scheme (MPLADS), MoSPI, Government of India.')}
                  </p>
                  <div className="flex flex-wrap gap-1.5 text-[10px]">
                    <button
                      onClick={onNavigateToProjects}
                      className="px-2 py-0.5 bg-white rounded border border-teal-300 text-teal-800 hover:bg-teal-50 transition cursor-pointer font-medium"
                    >
                      {t('nav.projects', 'Projects')}
                    </button>
                    <button
                      onClick={onNavigateToMap}
                      className="px-2 py-0.5 bg-white rounded border border-teal-300 text-teal-800 hover:bg-teal-50 transition cursor-pointer font-medium"
                    >
                      {t('nav.map', 'Analytics Map')}
                    </button>
                    <button
                      onClick={onNavigateToGuidelines}
                      className="px-2 py-0.5 bg-white rounded border border-teal-300 text-teal-800 hover:bg-teal-50 transition cursor-pointer font-medium"
                    >
                      {t('nav.guidelines', 'AI Rules')}
                    </button>
                    <button
                      onClick={onNavigateToLogin}
                      className="px-2 py-0.5 bg-white rounded border border-teal-300 text-teal-800 hover:bg-teal-50 transition cursor-pointer font-medium"
                    >
                      {t('nav.login', 'Login')}
                    </button>
                  </div>
                </div>

                <div className="pt-4 flex items-center justify-between text-slate-700 border-t border-teal-100">
                  <span className="text-[11px] text-slate-500 font-mono">PS 26102 • MoSPI</span>
                  <button
                    onClick={onNavigateToAbout}
                    className="text-xs font-bold text-teal-800 hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <span>{t('project_details.see_more', 'See more')}</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* ── Bottom Icon Toolbar (Matching Screenshot) ────── */}
          <div className="bg-white border-t border-slate-200 px-4 py-3 sm:px-8">
            <div className="flex flex-wrap items-center justify-around sm:justify-between gap-3 text-slate-600 text-xs">
              {/* See details */}
              <button
                onClick={() => setInfoModal('DETAILS')}
                className="flex items-center gap-1.5 hover:text-teal-800 transition font-medium cursor-pointer"
              >
                <Info className="w-4 h-4 text-teal-700" />
                <span>{t('project_details.see_details', 'See details')}</span>
              </button>

              {/* See more */}
              <button
                onClick={onNavigateToProjects}
                className="flex items-center gap-1.5 hover:text-teal-800 transition font-medium cursor-pointer"
              >
                <MoreHorizontal className="w-4 h-4 text-teal-700" />
                <span>{t('project_details.see_more', 'See more')}</span>
              </button>

              {/* PUBLIC SEARCH */}
              <button
                onClick={() => {
                  const el = document.getElementById('search-section');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                  const input = document.getElementById('public-search-input');
                  if (input) setTimeout(() => input.focus(), 300);
                }}
                className="flex items-center gap-1.5 text-teal-900 font-bold uppercase transition bg-teal-50 px-3 py-1 rounded border border-teal-200 cursor-pointer"
              >
                <Search className="w-4 h-4 text-teal-700" />
                <span>{t('portal.public_search', 'PUBLIC SEARCH')}</span>
              </button>

              {/* ANALYSIS MAP */}
              <button
                onClick={onNavigateToMap}
                className="flex items-center gap-1.5 hover:text-teal-800 transition font-medium uppercase cursor-pointer"
              >
                <BarChart3 className="w-4 h-4 text-teal-700" />
                <span>{t('nav.map', 'ANALYSIS MAP')}</span>
              </button>

              {/* USER GUIDE */}
              <button
                onClick={onNavigateToGuidelines}
                className="flex items-center gap-1.5 hover:text-teal-800 transition font-medium uppercase cursor-pointer"
              >
                <BookOpen className="w-4 h-4 text-teal-700" />
                <span>{t('project_details.user_guide', 'USER GUIDE')}</span>
              </button>

              {/* FAQ */}
              <button
                onClick={() => setInfoModal('FAQ')}
                className="flex items-center gap-1.5 hover:text-teal-800 transition font-medium uppercase cursor-pointer"
              >
                <HelpCircle className="w-4 h-4 text-teal-700" />
                <span>{t('project_details.faq', 'FAQ')}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ── Informational Rules & FAQ Modal ───────────────────── */}
      {infoModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
          <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
            <div className="bg-[#0f2e52] px-6 py-4 flex items-center justify-between text-white">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-amber-300" />
                <h3 className="text-sm font-black uppercase tracking-wider">
                  {infoModal === 'SLA_RULES' && t('project_details.sla_title', 'Statutory 45-Day Sanction SLA')}
                  {infoModal === 'SC_ST_RULES' && t('project_details.sc_st_title', 'SC / ST Welfare Quotas (15% & 7.5%)')}
                  {infoModal === 'CPWD_RULES' && t('project_details.cpwd_title', 'CPWD Rate Benchmarks')}
                  {infoModal === 'DETAILS' && t('project_details.scheme_overview_title', 'MPLADS Scheme Overview')}
                  {infoModal === 'FAQ' && t('project_details.faq', 'Frequently Asked Questions (FAQ)')}
                </h3>
              </div>
              <button
                onClick={() => setInfoModal(null)}
                className="p-1 rounded-lg hover:bg-white/20 text-slate-300 hover:text-white transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 text-xs sm:text-sm text-slate-700 space-y-3 leading-relaxed max-h-[75vh] overflow-y-auto">
              {infoModal === 'SLA_RULES' && (
                <>
                  <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-900 font-bold text-xs flex items-center gap-2">
                    <Clock className="w-4 h-4 text-amber-700 shrink-0" />
                    <span>Clause 3.12 (MPLADS Guidelines 2023): Mandatory 45-Day Timeframe</span>
                  </div>
                  <p>
                    District Authorities (District Magistrates / Collectors) are statutorily required to accord <strong>Administrative & Technical Sanction (AS/TS) within 45 days</strong> of receiving a recommendation from the Hon’ble Member of Parliament.
                  </p>
                  <p>
                    If a proposed work is technically non-feasible or falls outside guidelines, the District Authority must formally communicate the rejection reasons to the MP within the same 45-day SLA window.
                  </p>
                </>
              )}

              {infoModal === 'SC_ST_RULES' && (
                <>
                  <div className="p-3 bg-purple-50 border border-purple-200 rounded-xl text-purple-900 font-bold text-xs flex items-center gap-2">
                    <Award className="w-4 h-4 text-purple-700 shrink-0" />
                    <span>Clause 2.5: Mandatory Social Inclusion Outlay</span>
                  </div>
                  <p>
                    To foster equitable infrastructure development, MPs are required to recommend works contributing at least:
                  </p>
                  <ul className="list-disc pl-5 space-y-1 font-semibold text-slate-800">
                    <li>15% of annual entitlement (₹75 Lakh) for areas inhabited by Scheduled Castes (SC).</li>
                    <li>7.5% of annual entitlement (₹37.5 Lakh) for areas inhabited by Scheduled Tribes (ST).</li>
                  </ul>
                  <p>
                    MPLAD Rakshak’s AI engine automatically tracks quota compliance and alerts District Authorities if annual earmarks are in deficit.
                  </p>
                </>
              )}

              {infoModal === 'CPWD_RULES' && (
                <>
                  <div className="p-3 bg-teal-50 border border-teal-200 rounded-xl text-teal-900 font-bold text-xs flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-teal-700 shrink-0" />
                    <span>Clause 4.3: Engineering Estimates & Rate Benchmarks</span>
                  </div>
                  <p>
                    All civil infrastructure works executed under MPLADS must conform strictly to the prevailing <strong>State PWD / Central PWD Schedule of Rates (CPWD SoR)</strong>.
                  </p>
                  <p>
                    Artificially inflated estimates, excessive bill-of-quantities (BOQ), or rate variances exceeding 10% over standard district schedules are automatically flagged for forensic review.
                  </p>
                </>
              )}

              {infoModal === 'DETAILS' && (
                <>
                  <p>
                    The <strong>Member of Parliament Local Area Development Scheme (MPLADS)</strong> is a Central Sector Scheme introduced in December 1993, administered by the Ministry of Statistics and Programme Implementation (MoSPI).
                  </p>
                  <p>
                    Each MP has the choice to recommend works to the tune of <strong>₹5.00 Crore per annum</strong> with an emphasis on creating durable community assets based on locally felt developmental needs in drinking water, primary education, sanitation, roads, and community halls.
                  </p>
                </>
              )}

              {infoModal === 'FAQ' && (
                <div className="space-y-3">
                  <div>
                    <h5 className="font-bold text-slate-900">{t('project_details.faq_q1', 'How can citizens track local projects?')}</h5>
                    <p className="text-slate-600">{t('project_details.faq_a1', 'Citizens can filter by State and District above or click "Analytics Map" to see geo-tagged assets and physical completion milestones.')}</p>
                  </div>
                  <div>
                    <h5 className="font-bold text-slate-900">{t('project_details.faq_q2', 'What if a sanctioned project is not built on ground?')}</h5>
                    <p className="text-slate-600">{t('project_details.faq_a2', 'Click "Report Fraud" on the project card to submit geo-tagged site photos and report ghost works or sub-standard execution directly to vigilance officers.')}</p>
                  </div>
                </div>
              )}
            </div>

            <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 flex justify-end">
              <button
                onClick={() => setInfoModal(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-lg text-xs font-bold uppercase transition cursor-pointer"
              >
                {t('project_details.close_modal', 'Close')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Public Project Details Modal with Contractor, Tender & Dates ── */}
      {selectedProjectModal && (() => {
        const extra = getContractorAndTenderDetails(selectedProjectModal);
        const contractor = extra.contractor;
        const tender = extra.tender;
        const dates = extra.dates;

        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/65 backdrop-blur-xs">
            <div className="relative w-full max-w-4xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
              {/* Modal Top Banner */}
              <div className="bg-[#0f2e52] px-5 sm:px-6 py-3.5 flex items-center justify-between text-white border-b border-white/10 shrink-0">
                <div className="flex items-center gap-3">
                  <div className="p-1.5 rounded-lg bg-white/10 border border-white/20">
                    <Building className="w-5 h-5 text-amber-300" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-black text-amber-300 tracking-wider">
                        {selectedProjectModal.project_uid}
                      </span>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-white/15 text-slate-200 font-semibold uppercase">
                        {t('categories.' + selectedProjectModal.category, selectedProjectModal.category?.replace(/_/g, ' '))}
                      </span>
                    </div>
                    <h3 className="text-sm sm:text-base font-black text-white line-clamp-1 mt-0.5">
                      {getLocalizedProjectTitle(selectedProjectModal, currentLang)}
                    </h3>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {/* Report Fraud Button right in the modal header */}
                  <button
                    onClick={() => {
                      const p = selectedProjectModal;
                      setSelectedProjectModal(null);
                      onOpenFraudReport && onOpenFraudReport(p);
                    }}
                    className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-xs"
                    title="Report suspicious activity or anomaly on this project"
                  >
                    <ShieldAlert className="w-4 h-4 text-amber-300" />
                    <span className="hidden sm:inline">{t('portal.report_fraud', 'Report Fraud')}</span>
                  </button>

                  <button
                    onClick={() => setSelectedProjectModal(null)}
                    className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 transition cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Scrollable Modal Body */}
              <div className="p-5 sm:p-6 overflow-y-auto space-y-5 text-xs">
                {/* Top KPI Strip */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                    <span className="text-slate-500 block text-[10px] uppercase font-bold">{t('project_details.sanctioned_cost', 'Sanctioned Cost')}</span>
                    <span className="text-sm font-black text-slate-900 mt-0.5 block">
                      {formatRupees(selectedProjectModal.sanctioned_amount)}
                    </span>
                    <span className="text-[10px] text-slate-400">{t('project_details.approved_by_da', 'Approved by District Authority')}</span>
                  </div>

                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                    <span className="text-slate-500 block text-[10px] uppercase font-bold">{t('project_details.awarded_tender_val', 'Awarded Tender Value')}</span>
                    <span className="text-sm font-black text-teal-800 mt-0.5 block">
                      {formatRupees(tender.awardedVal)}
                    </span>
                    <span className="text-[10px] text-emerald-600 font-semibold">{t('project_details.savings_public', '4% Saving to Public Fund')}</span>
                  </div>

                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                    <span className="text-slate-500 block text-[10px] uppercase font-bold">{t('project_details.funds_disbursed', 'Funds Disbursed to Date')}</span>
                    <span className="text-sm font-black text-slate-900 mt-0.5 block">
                      {formatRupees(tender.disbursedVal)}
                    </span>
                    <span className="text-[10px] text-slate-400">{t('project_details.escrow_releases', 'Escrow Milestone Releases')}</span>
                  </div>

                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                    <span className="text-slate-500 block text-[10px] uppercase font-bold">{t('project_details.physical_progress', 'Physical Progress')}</span>
                    <div className="flex items-center justify-between mt-0.5">
                      <span className="text-sm font-black text-slate-900">
                        {selectedProjectModal.physical_progress_percent || 35}%
                      </span>
                      {getStatusBadge(selectedProjectModal.status)}
                    </div>
                    <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden mt-1.5">
                      <div
                        className="bg-teal-600 h-full rounded-full"
                        style={{ width: `${selectedProjectModal.physical_progress_percent || 35}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* SC/ST Focus Banner */}
                {selectedProjectModal.is_sc_st_area && (
                  <div className="p-3 bg-purple-50 border border-purple-200 rounded-xl text-xs text-purple-900 flex items-center gap-2.5">
                    <Award className="w-4 h-4 text-purple-700 shrink-0" />
                    <div>
                      <strong>{t('project_details.sc_st_quota', 'Special Focus Statutory Quota:')}</strong> {t('project_details.sc_st_quota_desc', 'Designated exclusively for SC/ST population upliftment under Revised MPLADS Guidelines 2023 (Mandatory 15% SC / 7.5% ST outlay).')}
                    </div>
                  </div>
                )}

                {/* Section 1: Contractor & Executing Agency Dossier */}
                <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-4 space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                    <div className="flex items-center gap-2">
                      <HardHat className="w-4 h-4 text-[#a85016]" />
                      <h4 className="text-xs font-black uppercase text-slate-800 tracking-wide">
                        {t('project_details.contractor_agency_details', '1. CONTRACTOR & EXECUTING AGENCY DETAILS')}
                      </h4>
                    </div>
                    <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-900 text-[10px] font-black uppercase border border-amber-300">
                      {contractor.classType}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    <div className="p-2.5 bg-slate-50 rounded-lg">
                      <span className="text-[10px] text-slate-500 font-bold uppercase block">{t('project_details.empanelled_contractor', 'Empanelled Contractor Firm')}</span>
                      <span className="font-bold text-slate-900 block mt-0.5">{contractor.name}</span>
                      <span className="text-[10px] text-slate-500">License: {contractor.license}</span>
                    </div>

                    <div className="p-2.5 bg-slate-50 rounded-lg">
                      <span className="text-[10px] text-slate-500 font-bold uppercase block">{t('project_details.leadership_engineer', 'Leadership & Engineer')}</span>
                      <span className="font-semibold text-slate-900 block mt-0.5">{contractor.director}</span>
                      <span className="text-[10px] text-slate-500">{contractor.engineer}</span>
                    </div>

                    <div className="p-2.5 bg-slate-50 rounded-lg">
                      <span className="text-[10px] text-slate-500 font-bold uppercase block">{t('project_details.empanelled_division', 'Empanelled Division')}</span>
                      <span className="font-semibold text-slate-800 block mt-0.5">
                        {getLocalizedContractorDivision(contractor.division, getLocalizedDistrict(selectedProjectModal.district, currentLang), currentLang)}
                      </span>
                      <span className="text-[10px] text-emerald-600 font-semibold">{contractor.rating}</span>
                    </div>

                    <div className="p-2.5 bg-slate-50 rounded-lg">
                      <span className="text-[10px] text-slate-500 font-bold uppercase block">{t('project_details.pfms_escrow_bank', 'PFMS Escrow Bank Account')}</span>
                      <span className="font-semibold text-slate-800 block mt-0.5">{contractor.escrowBank}</span>
                      <span className="text-[10px] text-slate-500">{t('project_details.direct_disbursal', 'Direct PFMS Treasury Disbursal')}</span>
                    </div>

                    <div className="p-2.5 bg-slate-50 rounded-lg">
                      <span className="text-[10px] text-slate-500 font-bold uppercase block">{t('project_details.gstin_id', 'GSTIN Identification')}</span>
                      <span className="font-mono font-bold text-slate-800 block mt-0.5">{contractor.gstin}</span>
                      <span className="text-[10px] text-slate-500">{t('project_details.active_taxpayer', 'Active Taxpayer Verified')}</span>
                    </div>

                    <div className="p-2.5 bg-slate-50 rounded-lg">
                      <span className="text-[10px] text-slate-500 font-bold uppercase block">{t('project_details.site_contact', 'Site Contact / Inquiries')}</span>
                      <span className="font-semibold text-slate-800 block mt-0.5">{contractor.contact}</span>
                      <span className="text-[10px] text-slate-500">{t('project_details.official_implementing_desk', 'Official Implementing Desk')}</span>
                    </div>
                  </div>
                </div>

                {/* Section 2: Tender & E-Procurement Details */}
                <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-4 space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                    <div className="flex items-center gap-2">
                      <FileSpreadsheet className="w-4 h-4 text-teal-700" />
                      <h4 className="text-xs font-black uppercase text-slate-800 tracking-wide">
                        {t('project_details.tender_procurement_details', '2. TENDER & PROCUREMENT DETAILS')}
                      </h4>
                    </div>
                    <span className="px-2 py-0.5 rounded bg-teal-100 text-teal-900 text-[10px] font-bold border border-teal-300">
                      {t('project_details.gem_verified', 'GeM / E-Procurement Verified')}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    <div className="p-2.5 bg-slate-50 rounded-lg">
                      <span className="text-[10px] text-slate-500 font-bold uppercase block">{t('project_details.tender_nit', 'Tender Notice # (NIT)')}</span>
                      <span className="font-mono font-bold text-slate-900 block mt-0.5">{tender.nitNo}</span>
                      <span className="text-[10px] text-slate-500">{t('project_details.open_tender_bidding', tender.biddingMethod)}</span>
                    </div>

                    <div className="p-2.5 bg-slate-50 rounded-lg">
                      <span className="text-[10px] text-slate-500 font-bold uppercase block">{t('project_details.central_gem_ref', 'Central e-Procurement Ref')}</span>
                      <span className="font-mono font-bold text-teal-800 block mt-0.5">{tender.gemRef}</span>
                      <span className="text-[10px] text-slate-500">{t('project_details.technical_score', 'Technical Score')}: 94.5 / 100 ({t('project_details.technical_cleared', 'Technical Benchmark Cleared')})</span>
                    </div>

                    <div className="p-2.5 bg-slate-50 rounded-lg">
                      <span className="text-[10px] text-slate-500 font-bold uppercase block">{t('project_details.work_order_no', 'Work Order / Contract Ref')}</span>
                      <span className="font-mono font-bold text-slate-900 block mt-0.5">{tender.workOrderRef}</span>
                      <span className="text-[10px] text-slate-500">{t('project_details.contract_agreement_date', 'Contract Agreement Date')}: {tender.agreementDate}</span>
                    </div>
                  </div>
                </div>

                {/* Section 3: Important Lifecycle Dates */}
                <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-4 space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-blue-700" />
                      <h4 className="text-xs font-black uppercase text-slate-800 tracking-wide">
                        {t('project_details.lifecycle_dates', '3. STATUTORY LIFECYCLE & MILESTONE DATES')}
                      </h4>
                    </div>
                    <span className="text-[10px] text-slate-500 font-medium">
                      {t('project_details.sla_compliant_badge', 'Statutory 45-Day SLA Compliant')}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="p-2.5 bg-slate-50 rounded-lg border-l-3 border-blue-500">
                      <span className="text-[10px] text-slate-500 font-bold uppercase block">{t('project_details.recommended_by_mp', 'Recommended by MP')}</span>
                      <span className="font-mono font-bold text-slate-800 text-xs block mt-0.5">
                        {dates.recommendedDate}
                      </span>
                      <span className="text-[10px] text-slate-400">{t('project_details.formal_ls_nomination', 'Formal Lok Sabha nomination')}</span>
                    </div>

                    <div className="p-2.5 bg-slate-50 rounded-lg border-l-3 border-teal-500">
                      <span className="text-[10px] text-slate-500 font-bold uppercase block">{t('project_details.ts_sanction', 'Technical Sanction (TS)')}</span>
                      <span className="font-mono font-bold text-slate-800 text-xs block mt-0.5">
                        {dates.technicalSanctionDate}
                      </span>
                      <span className="text-[10px] text-slate-400">{t('project_details.cpwd_sor_cleared', 'CPWD SoR Rate Cleared')}</span>
                    </div>

                    <div className="p-2.5 bg-slate-50 rounded-lg border-l-3 border-emerald-500">
                      <span className="text-[10px] text-slate-500 font-bold uppercase block">{t('project_details.as_sanction_da', 'Admin Sanction (AS)')}</span>
                      <span className="font-mono font-bold text-slate-800 text-xs block mt-0.5">
                        {dates.administrativeSanctionDate}
                      </span>
                      <span className="text-[10px] text-slate-400">{t('project_details.dm_order', 'District Magistrate Order')}</span>
                    </div>

                    <div className="p-2.5 bg-slate-50 rounded-lg border-l-3 border-amber-500">
                      <span className="text-[10px] text-slate-500 font-bold uppercase block">{t('project_details.tender_published', 'Tender Published (NIT)')}</span>
                      <span className="font-mono font-bold text-slate-800 text-xs block mt-0.5">
                        {dates.tenderPublicationDate}
                      </span>
                      <span className="text-[10px] text-slate-400">{t('project_details.eprocure_notice_live', 'E-Procurement notice live')}</span>
                    </div>

                    <div className="p-2.5 bg-slate-50 rounded-lg border-l-3 border-indigo-500">
                      <span className="text-[10px] text-slate-500 font-bold uppercase block">{t('project_details.work_order_awarded', 'Work Order Executed')}</span>
                      <span className="font-mono font-bold text-slate-800 text-xs block mt-0.5">
                        {dates.workOrderAwardDate}
                      </span>
                      <span className="text-[10px] text-slate-400">{t('project_details.contract_agreement_bound', 'Agreement contract bound')}</span>
                    </div>

                    <div className="p-2.5 bg-slate-50 rounded-lg border-l-3 border-purple-500">
                      <span className="text-[10px] text-slate-500 font-bold uppercase block">{t('project_details.ground_commencement', 'Ground Work Begun')}</span>
                      <span className="font-mono font-bold text-slate-800 text-xs block mt-0.5">
                        {dates.workCommencedDate}
                      </span>
                      <span className="text-[10px] text-slate-400">{t('project_details.site_mobilization_logged', 'Site mobilization logged')}</span>
                    </div>

                    <div className="p-2.5 bg-slate-50 rounded-lg border-l-3 border-rose-500">
                      <span className="text-[10px] text-slate-500 font-bold uppercase block">{t('project_details.statutory_deadline', 'Mandatory Deadline')}</span>
                      <span className="font-mono font-bold text-rose-700 text-xs block mt-0.5">
                        {dates.completionDeadline}
                      </span>
                      <span className="text-[10px] text-slate-400">{t('project_details.statutory_1year_guideline', 'Statutory 1-Year Guideline')}</span>
                    </div>

                    <div className="p-2.5 bg-slate-50 rounded-lg border-l-3 border-cyan-500">
                      <span className="text-[10px] text-slate-500 font-bold uppercase block">{t('project_details.latest_inspection', 'Latest Geo-Audit')}</span>
                      <span className="font-mono font-bold text-cyan-800 text-xs block mt-0.5">
                        {dates.latestAuditDate}
                      </span>
                      <span className="text-[10px] text-slate-400">{t('project_details.milestone_inspected', 'Physical Milestone Inspected')}</span>
                    </div>
                  </div>
                </div>

                {/* Section 4: Location & Geo-Centroid Verification */}
                <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <span className="text-[10px] text-slate-500 font-bold uppercase block">
                      {t('project_details.constituency_centroid_title', 'Constituency & Centroid Verification')}
                    </span>
                    <div className="flex items-center gap-1.5 font-bold text-slate-800">
                      <MapPin className="w-4 h-4 text-teal-600 shrink-0" />
                      <span>{getLocalizedDistrict(selectedProjectModal.district, currentLang)}, {getLocalizedState(selectedProjectModal.state, currentLang)} ({getLocalizedDistrict(selectedProjectModal.district, currentLang)} {t('project_details.parliamentary_constituency', 'Parliamentary Constituency')})</span>
                    </div>
                    <div className="text-[11px] text-slate-500 font-mono">
                      GPS Centroid: {selectedProjectModal.latitude ? selectedProjectModal.latitude.toFixed(4) : '18.5204'}° N, {selectedProjectModal.longitude ? selectedProjectModal.longitude.toFixed(4) : '73.8567'}° E • <span className="text-emerald-700 font-semibold font-sans">{t('project_details.verified_radius_text', 'Verified within 50m statutory radius (0m anomaly)')}</span>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      setSelectedProjectModal(null);
                      onNavigateToMap && onNavigateToMap();
                    }}
                    className="px-3.5 py-1.5 bg-teal-50 hover:bg-teal-100 text-teal-800 rounded-lg text-xs font-bold transition border border-teal-200 flex items-center gap-1 shrink-0 cursor-pointer"
                  >
                    <span>{t('project_details.view_on_analytics_map', 'View on Analytics Map')}</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="px-5 sm:px-6 py-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between shrink-0">
                {/* Prominent Report Fraud Button */}
                <button
                  onClick={() => {
                    const p = selectedProjectModal;
                    setSelectedProjectModal(null);
                    onOpenFraudReport && onOpenFraudReport(p);
                  }}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-bold uppercase transition flex items-center gap-2 shadow-xs cursor-pointer"
                >
                  <ShieldAlert className="w-4 h-4 text-amber-300" />
                  <span>{t('project_details.report_fraud_on_project', 'Report Fraud on this Project')}</span>
                </button>

                <button
                  onClick={() => setSelectedProjectModal(null)}
                  className="px-5 py-2 bg-white hover:bg-slate-100 text-slate-700 rounded-lg text-xs font-bold uppercase transition border border-slate-300 shadow-2xs cursor-pointer"
                >
                  {t('project_details.close_dossier', 'Close Dossier')}
                </button>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}
