import { useState, useEffect } from 'react';
import {
  ChevronDown,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Camera,
  ShieldAlert,
  Percent,
  Layers,
  ArrowRight,
  Filter,
  MapPin,
} from 'lucide-react';

import DAHeader from '../../components/DA/DAHeader';
import DASidebar from '../../components/DA/DASidebar';
import DistrictManagementCards from '../../components/DA/DistrictManagementCards';
import ProposalPipelineTable from '../../components/DA/ProposalPipelineTable';
import ProposalRAGViewer from '../../components/DA/ProposalRAGViewer';
import BOQDiffTable from '../../components/DA/BOQDiffTable';
import EXIFInspectorModal from '../../components/DA/EXIFInspectorModal';
import CartelizationRadar from '../../components/DA/CartelizationRadar';
import DuplicateAssetMap from '../../components/DA/DuplicateAssetMap';
import GISMapViewer from '../../components/GISMapViewer';

import { daUrgentKPIs, daOfficerProfile } from '../../mock/daDashboardData';
import { getProjects } from '../../services/api';

export default function DADashboard({ onExitToPublic, onLogout, currentUser }) {
  const userDistrict = currentUser?.district || (currentUser?.username?.includes('lucknow') ? 'Lucknow' : 'Pune');
  const userState = currentUser?.state || (currentUser?.username?.includes('lucknow') ? 'Uttar Pradesh' : 'Maharashtra');

  const [mapSubTab, setMapSubTab] = useState('gis');
  const [daProjects, setDaProjects] = useState([]);

  useEffect(() => {
    loadDaProjects();
  }, []);

  const loadDaProjects = async () => {
    try {
      const res = await getProjects({ page_size: 50 });
      if (res && res.projects) setDaProjects(res.projects);
    } catch (e) {
      console.error('Failed to load DA projects:', e);
    }
  };

  // Navigation tab state
  const [activeTab, setActiveTab] = useState(() => {
    if (typeof window !== 'undefined') {
      const hash = window.location.hash.replace('#', '');
      if (['pipeline', 'scrutiny', 'inspections', 'work-orders', 'utilization', 'maps', 'local-maps', 'settings'].includes(hash)) {
        return hash === 'local-maps' ? 'maps' : hash;
      }
    }
    return 'dashboard';
  });

  // Switcher between Overview Grid (matches media_1788984565280.png) & Forensic Workbench
  const [viewMode, setViewMode] = useState(() => {
    if (typeof window !== 'undefined') {
      const hash = window.location.hash.replace('#', '');
      if (['pipeline', 'scrutiny', 'work-orders', 'utilization', 'workbench'].includes(hash)) {
        return 'workbench';
      }
    }
    return 'grid';
  });
  const [dropdownOpen, setDropdownOpen] = useState(false);

  // Forensic Modals & Drawers State
  const [selectedProposalId, setSelectedProposalId] = useState(() => {
    if (typeof window !== 'undefined') {
      const hash = window.location.hash.replace('#', '');
      if (hash === 'scrutiny' || hash === 'rag-copilot') return 'MPLAD-2026-PN-014';
    }
    return null;
  });
  const [selectedBoqId, setSelectedBoqId] = useState(() => {
    if (typeof window !== 'undefined') {
      const hash = window.location.hash.replace('#', '');
      if (hash === 'boq' || hash === 'boq-audit') return 'MPLAD-2026-PN-014';
    }
    return null;
  });
  const [selectedExifId, setSelectedExifId] = useState(() => {
    if (typeof window !== 'undefined') {
      const hash = window.location.hash.replace('#', '');
      if (hash === 'exif' || hash === 'exif-tamper') return 'MPLAD-2026-PN-018';
    }
    return null;
  });
  const [actionNotice, setActionNotice] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
      showNotice('Pipeline data refreshed from MoSPI Central Database.');
    }, 600);
  };

  const showNotice = (msg) => {
    setActionNotice(msg);
    setTimeout(() => setActionNotice(null), 4000);
  };

  const handleSanction = (id) => {
    showNotice(`✓ Technical Sanction (AS/TS) granted for ${id}. Dispatched to Implementing Agency.`);
    setSelectedProposalId(null);
  };

  const handleReject = (id, reason) => {
    showNotice(`Statutory Rejection issued for ${id} citing MPLADS 2023 Guidelines.`);
    setSelectedProposalId(null);
  };

  const handleAuthorizeMilestone = (id) => {
    showNotice(`✓ Milestone payment released for ${id}. Funds credited to escrow.`);
    setSelectedExifId(null);
  };

  const handleRejectMilestone = (id) => {
    showNotice(`Milestone payment withheld for ${id}. Show-cause issued for GPS/EXIF discrepancy.`);
    setSelectedExifId(null);
  };

  return (
    <div className="min-h-screen bg-[#eef4f2] text-slate-800 flex flex-col font-sans select-none">
      {/* ── TOP HEADER (Forest Emerald Teal #1f7a6b) ──────── */}
      <DAHeader
        onExitToPublic={onExitToPublic}
        onLogout={onLogout}
        onRefresh={handleRefresh}
        isRefreshing={isRefreshing}
      />

      {/* ── NOTICE TOAST ──────────────────────────────────── */}
      {actionNotice && (
        <div className="fixed top-16 right-6 z-50 bg-[#1f7a6b] text-white px-4 py-2.5 rounded-xl shadow-lg border border-teal-400/30 text-xs font-semibold flex items-center gap-2 animate-bounce">
          <CheckCircle2 className="w-4 h-4 text-[#34d399]" />
          <span>{actionNotice}</span>
        </div>
      )}

      {/* ── MAIN WORKSPACE CONTAINER ──────────────────────── */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar (Deep Jungle Green #0f4a40) */}
        <DASidebar activeTab={activeTab} setActiveTab={setActiveTab} />

        {/* Right Main Content Canvas (Pale Mint Slate #eef4f2) */}
        <main className="flex-1 overflow-y-auto p-5 sm:p-7 space-y-6">
          {/* ── TOP TITLE & CONTROLS (matches reference image) ── */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight uppercase">
                DISTRICT MANAGEMENT
              </h2>
              <p className="text-xs text-slate-500 font-medium">
                Pune District Collectorate • Executive Approval & Forensic Verification Portal
              </p>
            </div>

            {/* View Switcher Dropdown (matches 'Dirashboard ∨' pill from reference image) */}
            <div className="relative">
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center gap-2 px-4 py-2 bg-[#1f7a6b] hover:bg-[#186054] text-white rounded-xl text-xs font-bold transition shadow-xs cursor-pointer"
              >
                <span>{viewMode === 'grid' ? 'District Management' : 'Operational Workbench'}</span>
                <ChevronDown className="w-4 h-4 text-white/80" />
              </button>

              {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-slate-200 text-slate-800 py-1.5 z-30 text-xs animate-fade-in font-medium">
                  <button
                    onClick={() => {
                      setViewMode('grid');
                      setActiveTab('dashboard');
                      setDropdownOpen(false);
                    }}
                    className={`w-full text-left px-4 py-2 hover:bg-slate-50 flex items-center justify-between cursor-pointer ${
                      viewMode === 'grid' ? 'font-bold text-[#1f7a6b] bg-teal-50/50' : ''
                    }`}
                  >
                    <span>District Management (Grid)</span>
                    {viewMode === 'grid' && <CheckCircle2 className="w-3.5 h-3.5 text-[#1f7a6b]" />}
                  </button>
                  <button
                    onClick={() => {
                      setViewMode('workbench');
                      setActiveTab('pipeline');
                      setDropdownOpen(false);
                    }}
                    className={`w-full text-left px-4 py-2 hover:bg-slate-50 flex items-center justify-between cursor-pointer ${
                      viewMode === 'workbench' ? 'font-bold text-[#1f7a6b] bg-teal-50/50' : ''
                    }`}
                  >
                    <span>Operational Workbench</span>
                    {viewMode === 'workbench' && <CheckCircle2 className="w-3.5 h-3.5 text-[#1f7a6b]" />}
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* ── ROW 1: URGENT ACTION KPIS (4 CARDS) ───────────── */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* KPI 1: 45-Day SLA Breaches */}
            <div
              onClick={() => {
                setViewMode('workbench');
                setActiveTab('pipeline');
              }}
              className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs hover:border-red-300 hover:shadow-md transition cursor-pointer flex items-center justify-between"
            >
              <div className="space-y-1">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  45-DAY SLA BREACHES
                </span>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-black text-red-600 font-mono">
                    {daUrgentKPIs.slaBreaches.count}
                  </span>
                  <span className="text-[10px] text-red-600 font-bold bg-red-100 px-1.5 py-0.5 rounded">
                    CRITICAL
                  </span>
                </div>
                <p className="text-[10px] text-slate-400">
                  {daUrgentKPIs.slaBreaches.subtext}
                </p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center text-red-600">
                <Clock className="w-5 h-5" />
              </div>
            </div>

            {/* KPI 2: Pending Technical Sanctions */}
            <div
              onClick={() => {
                setViewMode('workbench');
                setActiveTab('pipeline');
              }}
              className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs hover:border-amber-300 hover:shadow-md transition cursor-pointer flex items-center justify-between"
            >
              <div className="space-y-1">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  PENDING AS / TS
                </span>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-black text-amber-600 font-mono">
                    {daUrgentKPIs.pendingSanctions.count}
                  </span>
                  <span className="text-[10px] text-amber-700 font-bold bg-amber-100 px-1.5 py-0.5 rounded">
                    ACTION NEEDED
                  </span>
                </div>
                <p className="text-[10px] text-slate-400">
                  {daUrgentKPIs.pendingSanctions.subtext}
                </p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600">
                <AlertTriangle className="w-5 h-5" />
              </div>
            </div>

            {/* KPI 3: Failed Image Verifications */}
            <div
              onClick={() => setSelectedExifId('MPLAD-2026-PN-018')}
              className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs hover:border-purple-300 hover:shadow-md transition cursor-pointer flex items-center justify-between"
            >
              <div className="space-y-1">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  FAILED IMAGE EXIF
                </span>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-black text-purple-700 font-mono">
                    {daUrgentKPIs.failedImageVerifications.count}
                  </span>
                  <span className="text-[10px] text-purple-700 font-bold bg-purple-100 px-1.5 py-0.5 rounded">
                    GPS MISMATCH
                  </span>
                </div>
                <p className="text-[10px] text-slate-400">
                  {daUrgentKPIs.failedImageVerifications.subtext}
                </p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center text-purple-700">
                <Camera className="w-5 h-5" />
              </div>
            </div>

            {/* KPI 4: SC/ST Quota Status */}
            <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs flex flex-col justify-between">
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    SC / ST QUOTA STATUS
                  </span>
                  <span className="text-[10px] text-emerald-700 font-bold bg-emerald-100 px-1.5 py-0.5 rounded">
                    LEGAL PASS
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs pt-1">
                  <span>SC (15.0% Min): <strong className="text-emerald-700">{daUrgentKPIs.scStQuota.scPercent}%</strong></span>
                  <span>ST (7.5% Min): <strong className="text-emerald-700">{daUrgentKPIs.scStQuota.stPercent}%</strong></span>
                </div>
              </div>

              {/* Progress Bars */}
              <div className="space-y-1 pt-2">
                <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-emerald-600 h-full rounded-full" style={{ width: '85%' }} />
                </div>
                <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-teal-600 h-full rounded-full" style={{ width: '92%' }} />
                </div>
              </div>
            </div>
          </div>

          {/* ── MAIN CONTENT VIEW SWITCHER ───────────────────────── */}
          {viewMode === 'grid' && activeTab === 'dashboard' ? (
            /* 3x3 Card Grid matching media_1788984565280.png 1-to-1 */
            <div className="space-y-6">
              <DistrictManagementCards
                onOpenProposal={(id) => setSelectedProposalId(id)}
                onOpenBoq={(id) => setSelectedBoqId(id)}
                onOpenExif={(id) => setSelectedExifId(id)}
                onOpenMap={() => setActiveTab('maps')}
              />
            </div>
          ) : activeTab === 'maps' ? (
            /* Full Local Maps GIS Radar & District Infrastructure */
            <div className="space-y-6">
              <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4 shadow-xs">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 pb-3 gap-2">
                  <div>
                    <h3 className="text-base font-black uppercase text-slate-900 flex items-center gap-2">
                      <MapPin className="w-5 h-5 text-teal-600" />
                      <span>{userDistrict} District Geo-Spatial & Proximity Radar</span>
                    </h3>
                    <p className="text-xs text-slate-500">
                      Auto-zoomed to assigned jurisdiction ({userDistrict}, {userState}) with ground works & 50m statutory buffer check
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="px-3 py-1 rounded-full bg-teal-50 text-teal-800 border border-teal-200 text-xs font-bold shadow-2xs flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-teal-500" />
                      Assigned District: {userDistrict}
                    </span>
                  </div>
                </div>

                {/* Sub-Tab Selector */}
                <div className="flex gap-2 border-b border-slate-200 pb-2">
                  <button
                    onClick={() => setMapSubTab('gis')}
                    className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                      mapSubTab === 'gis'
                        ? 'bg-slate-900 text-white shadow-xs'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    <Layers className="w-3.5 h-3.5" />
                    <span>District GIS Infrastructure Map</span>
                  </button>
                  <button
                    onClick={() => setMapSubTab('radar')}
                    className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                      mapSubTab === 'radar'
                        ? 'bg-slate-900 text-white shadow-xs'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    <AlertTriangle className="w-3.5 h-3.5 text-red-500" />
                    <span>Duplicate Asset Proximity Radar</span>
                  </button>
                </div>

                {mapSubTab === 'gis' ? (
                  <div className="rounded-xl overflow-hidden border border-slate-200 shadow-inner">
                    <GISMapViewer
                      projects={daProjects}
                      focusDistrict={userDistrict}
                      focusState={userState}
                      userRole="DISTRICT_AUTHORITY"
                      height="540px"
                    />
                  </div>
                ) : (
                  <DuplicateAssetMap district={userDistrict} />
                )}
              </div>
            </div>
          ) : activeTab === 'inspections' ? (
            /* Site Inspections & Photo Verifications Queue */
            <div className="space-y-6">
              <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div>
                    <h3 className="text-base font-black uppercase text-slate-900">
                      CONTRACTOR SITE INSPECTIONS & MILESTONE QUEUE
                    </h3>
                    <p className="text-xs text-slate-500">
                      Click any inspection to launch the Anti-Morphing EXIF & GPS Verification tool
                    </p>
                  </div>
                  <span className="px-3 py-1 rounded-full bg-purple-100 text-purple-800 text-xs font-bold">
                    5 Photos Flagged
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div
                    onClick={() => setSelectedExifId('MPLAD-2026-PN-018')}
                    className="p-4 rounded-xl bg-red-50 border border-red-200 space-y-3 cursor-pointer hover:shadow-md transition"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs font-bold text-red-900">MPLAD-2026-PN-018</span>
                      <span className="px-2 py-0.5 rounded bg-red-200 text-red-900 font-bold text-[10px]">
                        3.4 km Displaced
                      </span>
                    </div>
                    <p className="font-bold text-xs text-slate-900">
                      Installation of High-Capacity Solar Micro-Grid in Shirur
                    </p>
                    <div className="text-[11px] text-slate-600 space-y-0.5">
                      <p>Claimed: <strong>₹15.00 Lakh</strong> (Plinth / Superstructure)</p>
                      <p>Agency: <strong>M/s Apex Rural Builders</strong></p>
                    </div>
                    <button className="w-full py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-bold transition">
                      Inspect EXIF Metadata & Map
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* Operational Workbench: Table & Anomaly Radar */
            <div className="space-y-6">
              {/* Row 2: Active Scrutiny Pipeline Table */}
              <ProposalPipelineTable
                onOpenProposal={(id) => setSelectedProposalId(id)}
                onOpenBoq={(id) => setSelectedBoqId(id)}
                onSanction={handleSanction}
                onReject={handleReject}
              />

              {/* Row 3: Live Anomaly Radar (Split View) */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <CartelizationRadar />
                <DuplicateAssetMap district={userDistrict} />
              </div>
            </div>
          )}
        </main>
      </div>

      {/* ── FORENSIC MODALS & DRAWERS ─────────────────────────── */}
      {selectedProposalId && (
        <ProposalRAGViewer
          projectId={selectedProposalId}
          onClose={() => setSelectedProposalId(null)}
          onSanction={handleSanction}
          onReject={handleReject}
        />
      )}

      {selectedBoqId && (
        <BOQDiffTable
          projectId={selectedBoqId}
          onClose={() => setSelectedBoqId(null)}
        />
      )}

      {selectedExifId && (
        <EXIFInspectorModal
          projectId={selectedExifId}
          onClose={() => setSelectedExifId(null)}
          onAuthorize={handleAuthorizeMilestone}
          onRejectMilestone={handleRejectMilestone}
        />
      )}
    </div>
  );
}
