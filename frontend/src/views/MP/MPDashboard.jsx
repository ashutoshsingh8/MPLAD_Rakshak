import React, { useState, useEffect } from 'react';
import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  IndianRupee,
  MapPin,
  Camera,
  Layers,
  Send,
  ExternalLink,
  ChevronRight,
  Shield,
  FileCheck,
  TrendingUp,
  Sparkles,
  HelpCircle,
  Building2,
  UserCheck
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from 'recharts';
import MPHeader from '../../components/MP/MPHeader';
import MPSidebar from '../../components/MP/MPSidebar';
import GISMapViewer from '../../components/GISMapViewer';
import {
  mockMpProfile,
  mockVerificationCards,
  mockNominatedWorksTrend,
  mockNominatedWorksMonthly,
  mockPendingProposals,
  mockApprovedWorks,
  mockPreRequisites
} from '../../mock/mpDashboardData';
import { getProjects } from '../../services/api';

export default function MPDashboard({ onExitToPublic, onLogout, currentUser }) {
  const userDistrict = currentUser?.district || (currentUser?.username?.includes('lucknow') ? 'Lucknow' : 'Pune');
  const userState = currentUser?.state || (currentUser?.username?.includes('lucknow') ? 'Uttar Pradesh' : 'Maharashtra');
  const constituencyName = currentUser?.constituency || `${userDistrict} Lok Sabha Constituency`;

  const [activeTab, setActiveTab] = useState(() => {
    if (typeof window !== 'undefined') {
      const hash = window.location.hash.replace('#', '');
      if (['approved', 'approved-works'].includes(hash)) return 'approved';
      if (['funding', 'funding-summary'].includes(hash)) return 'funding';
      if (['prerequisites', 'pre-requisites'].includes(hash)) return 'prerequisites';
      if (['map', 'constituency-map'].includes(hash)) return 'map';
      if (['photos', 'site-updates'].includes(hash)) return 'photos';
      if (['help', 'escalation'].includes(hash)) return 'help';
    }
    return 'nominations';
  });
  const [liveProjects, setLiveProjects] = useState([]);
  const [escalatedMessage, setEscalatedMessage] = useState('');

  useEffect(() => {
    loadLiveProjects();
  }, []);

  const loadLiveProjects = async () => {
    try {
      const res = await getProjects({ page_size: 50 });
      if (res && res.projects) setLiveProjects(res.projects);
    } catch (e) {
      console.error('Failed to fetch projects for MP view:', e);
    }
  };

  const handleEscalateSla = (proposal) => {
    setEscalatedMessage(`Official notice dispatched to District Magistrate (Pune) regarding SLA breach on "${proposal.title}".`);
    setTimeout(() => setEscalatedMessage(''), 5000);
  };

  return (
    <div className="min-h-screen bg-[#f0f3f6] text-slate-800 flex flex-col select-none font-sans">
      {/* ── Top Dark Petrol Teal Header Bar Matching Reference ────────── */}
      <MPHeader
        onExitToPublic={onExitToPublic}
        onLogout={onLogout}
        onSearch={(query) => console.log('MP Search:', query)}
      />

      <div className="flex-1 flex overflow-hidden">
        {/* ── Left Dark Petrol Teal Sidebar Matching Reference ─────────────────── */}
        <MPSidebar
          activeTab={activeTab}
          onTabChange={setActiveTab}
          pendingBreachCount={mockPendingProposals.filter(p => p.slaBreached).length}
        />

        {/* ── Main Content Area ──────────────────────────────── */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-6">
          {/* 45-Day SLA Breach Alert Banner (Conditional) */}
          {mockPendingProposals.some(p => p.slaBreached) && (
            <div className="bg-amber-500/10 border-l-4 border-amber-500 p-4 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-amber-500/20 text-amber-600 flex items-center justify-center shrink-0">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs font-bold text-amber-900 uppercase tracking-wider">
                    Statutory 45-Day SLA Breach Notice
                  </div>
                  <p className="text-xs text-amber-800">
                    Proposal <strong>"{mockPendingProposals[0].title}"</strong> has been pending with the District Authority for <strong>52 days</strong> (exceeding the 45-day statutory limit under MPLADS 2023 Guidelines Clause 4.2).
                  </p>
                </div>
              </div>
              <button
                onClick={() => handleEscalateSla(mockPendingProposals[0])}
                className="px-3.5 py-1.5 bg-[#0c455b] hover:bg-[#083040] text-white rounded-lg text-xs font-bold uppercase tracking-wider transition shrink-0 cursor-pointer shadow-xs"
              >
                Escalate to DM (Pune)
              </button>
            </div>
          )}

          {escalatedMessage && (
            <div className="p-3 bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs rounded-xl flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{escalatedMessage}</span>
            </div>
          )}

          {/* ═══════════════════════════════════════════════════ */}
          {/* VIEW 1: MP PROJECTS OVERVIEW (EXACT SCREENSHOT LAYOUT) */}
          {/* ═══════════════════════════════════════════════════ */}
          {activeTab === 'nominations' && (
            <div className="space-y-6 animate-fade-in">
              {/* Header Title Bar matching screenshot */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div>
                  <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight uppercase">
                    MP PROJECTS OVERVIEW
                  </h1>
                  <p className="text-xs text-slate-500">
                    Real-time status of recommended infrastructure works across Pune Lok Sabha Constituency
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-xs font-bold bg-white px-3 py-1.5 rounded-lg border border-slate-200 text-slate-600 shadow-xs hidden sm:block">
                    Entitlement: ₹{mockMpProfile.entitlementCr}.00 Cr
                  </div>
                </div>
              </div>

              {/* ── ROW 1: ACTIVE PROGRESS & VISUAL VERIFICATION CARDS (3 CARDS) ── */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Card 1: MY NOMINATIONS */}
                <div className="bg-white rounded-2xl shadow-xs border border-slate-200 overflow-hidden flex flex-col justify-between hover:shadow-md transition">
                  <div className="p-5 space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider">
                        {mockVerificationCards.myNominations.title}
                      </h3>
                      <span className="text-[10px] font-mono font-bold text-[#15acaf]">
                        {mockVerificationCards.myNominations.progressPercent}% Complete
                      </span>
                    </div>

                    {/* Dual-tone Progress Bar */}
                    <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-[#0c455b] to-[#15acaf] rounded-full"
                        style={{ width: `${mockVerificationCards.myNominations.progressPercent}%` }}
                      />
                    </div>

                    <p className="text-xs text-slate-500 font-medium line-clamp-1">
                      {mockVerificationCards.myNominations.subtitle}
                    </p>

                    {/* Media Preview Image */}
                    <div className="rounded-xl overflow-hidden h-40 bg-slate-100 relative group">
                      <img
                        src="https://images.unsplash.com/photo-1476820865390-c52aeebb9891?w=800&auto=format&fit=crop&q=80"
                        alt="Single-lane road in Shirur Taluka"
                        className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                        onError={(e) => {
                          e.target.src = 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=800';
                        }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition flex items-end p-3 text-white text-[11px]">
                        <span>Letter Ref: {mockVerificationCards.myNominations.letterRef}</span>
                      </div>
                    </div>
                  </div>

                  <div className="px-5 py-2.5 bg-slate-50 border-t border-slate-100 text-[11px] text-slate-500 flex justify-between items-center">
                    <span>Sanctioned: <strong className="text-slate-800">{mockVerificationCards.myNominations.sanctionedAmount}</strong></span>
                    <span className="text-[#0c455b] font-semibold">{mockVerificationCards.myNominations.agency}</span>
                  </div>
                </div>

                {/* Card 2: APPROVED WORKS */}
                <div className="bg-white rounded-2xl shadow-xs border border-slate-200 overflow-hidden flex flex-col justify-between hover:shadow-md transition">
                  <div className="p-5 space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider">
                        {mockVerificationCards.approvedWorks.title}
                      </h3>
                      <span className="text-[10px] font-mono font-bold text-[#15acaf]">
                        {mockVerificationCards.approvedWorks.progressPercent}% Complete
                      </span>
                    </div>

                    {/* Dual-tone Progress Bar */}
                    <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-[#0c455b] to-[#15acaf] rounded-full"
                        style={{ width: `${mockVerificationCards.approvedWorks.progressPercent}%` }}
                      />
                    </div>

                    <p className="text-xs text-slate-500 font-medium line-clamp-1">
                      {mockVerificationCards.approvedWorks.subtitle}
                    </p>

                    {/* Media Preview Image */}
                    <div className="rounded-xl overflow-hidden h-40 bg-slate-100 relative group">
                      <img
                        src="https://images.unsplash.com/photo-1590069261209-f8e9b8642343?w=800&auto=format&fit=crop&q=80"
                        alt="Panchayat Community Hall Construction"
                        className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                        onError={(e) => {
                          e.target.src = 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=800';
                        }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition flex items-end p-3 text-white text-[11px]">
                        <span>Order Ref: {mockVerificationCards.approvedWorks.asOrderRef}</span>
                      </div>
                    </div>
                  </div>

                  <div className="px-5 py-2.5 bg-slate-50 border-t border-slate-100 text-[11px] text-slate-500 flex justify-between items-center">
                    <span>Sanctioned: <strong className="text-slate-800">{mockVerificationCards.approvedWorks.sanctionedAmount}</strong></span>
                    <span className="text-[#0c455b] font-semibold">{mockVerificationCards.approvedWorks.status}</span>
                  </div>
                </div>

                {/* Card 3: SITE UPDATES (PHOTOS) - 2x2 Grid matching reference image */}
                <div className="bg-white rounded-2xl shadow-xs border border-slate-200 overflow-hidden flex flex-col justify-between hover:shadow-md transition">
                  <div className="p-5 space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider">
                        {mockVerificationCards.siteUpdates.title}
                      </h3>
                      <span className="text-[10px] font-mono font-bold text-[#15acaf]">
                        {mockVerificationCards.siteUpdates.progressPercent}% Complete
                      </span>
                    </div>

                    {/* Dual-tone Progress Bar */}
                    <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-[#0c455b] to-[#15acaf] rounded-full"
                        style={{ width: `${mockVerificationCards.siteUpdates.progressPercent}%` }}
                      />
                    </div>

                    <p className="text-xs text-slate-500 font-medium line-clamp-1">
                      {mockVerificationCards.siteUpdates.subtitle}
                    </p>

                    {/* 2x2 Grid of Verified Contractor Photos matching screenshot */}
                    <div className="grid grid-cols-2 gap-2 h-40">
                      {mockVerificationCards.siteUpdates.photos.slice(0, 4).map((p, idx) => (
                        <div key={idx} className="rounded-lg overflow-hidden bg-slate-100 relative group">
                          <img
                            src={p.url}
                            alt={p.caption}
                            className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                            onError={(e) => {
                              e.target.src = 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=600';
                            }}
                          />
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="px-5 py-2.5 bg-slate-50 border-t border-slate-100 text-[10px] text-slate-500 flex justify-between items-center">
                    <span>GPS: <strong className="text-slate-800">{mockVerificationCards.siteUpdates.coordinates}</strong></span>
                    <span className="text-emerald-700 font-semibold">{mockVerificationCards.siteUpdates.status}</span>
                  </div>
                </div>
              </div>

              {/* ── ROW 2: ANALYTICS & DELIVERY VISUALIZATIONS (2 COLUMNS) ── */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Left Chart: NOMINATED WORKS (Trend Analysis) */}
                <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider">
                      NOMINATED WORKS
                    </h3>
                    <div className="flex items-center gap-4 text-xs font-semibold">
                      <span className="flex items-center gap-1.5 text-[#1966a6]">
                        <span className="w-2.5 h-2.5 rounded-sm bg-[#1966a6]" />
                        Nominate works
                      </span>
                      <span className="flex items-center gap-1.5 text-[#15acaf]">
                        <span className="w-2.5 h-2.5 rounded-sm bg-[#15acaf]" />
                        Data charts
                      </span>
                    </div>
                  </div>

                  <div className="h-64 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={mockNominatedWorksTrend} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                        <defs>
                          <linearGradient id="areaNominate" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#1966a6" stopOpacity={0.45} />
                            <stop offset="95%" stopColor="#1966a6" stopOpacity={0.05} />
                          </linearGradient>
                          <linearGradient id="areaDataChart" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#15acaf" stopOpacity={0.5} />
                            <stop offset="95%" stopColor="#15acaf" stopOpacity={0.05} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis dataKey="month" stroke="#64748b" fontSize={11} tickLine={false} />
                        <YAxis stroke="#64748b" fontSize={11} tickLine={false} domain={[0, 8000]} />
                        <Tooltip
                          contentStyle={{ backgroundColor: '#0c374a', color: '#fff', borderRadius: '8px', border: 'none', fontSize: '11px' }}
                        />
                        <Area type="monotone" dataKey="nominatedWorks" stroke="#1966a6" fill="url(#areaNominate)" strokeWidth={2.5} isAnimationActive={false} name="Nominate works" />
                        <Area type="monotone" dataKey="dataCharts" stroke="#15acaf" fill="url(#areaDataChart)" strokeWidth={2.5} isAnimationActive={false} name="Data charts" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Right Chart: NOMINATED WORKS (Monthly Execution Distribution) */}
                <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider">
                      NOMINATED WORKS
                    </h3>
                    <div className="flex items-center gap-4 text-xs font-semibold">
                      <span className="flex items-center gap-1.5 text-[#1966a6]">
                        <span className="w-2.5 h-2.5 rounded-sm bg-[#1966a6]" />
                        Nominated Works
                      </span>
                      <span className="flex items-center gap-1.5 text-[#15acaf]">
                        <span className="w-2.5 h-2.5 rounded-sm bg-[#15acaf]" />
                        Data chart
                      </span>
                    </div>
                  </div>

                  <div className="h-64 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={mockNominatedWorksMonthly} barGap={4} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis dataKey="month" stroke="#64748b" fontSize={11} tickLine={false} />
                        <YAxis stroke="#64748b" fontSize={11} tickLine={false} domain={[0, 1500]} />
                        <Tooltip
                          contentStyle={{ backgroundColor: '#0c374a', color: '#fff', borderRadius: '8px', border: 'none', fontSize: '11px' }}
                        />
                        <Bar dataKey="nominatedWorks" fill="#1966a6" radius={[4, 4, 0, 0]} name="Nominated Works" isAnimationActive={false} />
                        <Bar dataKey="dataChart" fill="#15acaf" radius={[4, 4, 0, 0]} name="Data chart" isAnimationActive={false} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ═══════════════════════════════════════════════════ */}
          {/* VIEW 2: APPROVED WORKS DIRECTORY                   */}
          {/* ═══════════════════════════════════════════════════ */}
          {activeTab === 'approved' && (
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-5">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div>
                  <h2 className="text-lg font-black text-slate-900 uppercase">
                    Administrative & Technical Sanctions (AS / TS) Directory
                  </h2>
                  <p className="text-xs text-slate-500">
                    Works officially sanctioned by the District Authority and assigned to executing agencies
                  </p>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] font-bold">
                    <tr>
                      <th className="p-3 rounded-l-lg">Project UID</th>
                      <th className="p-3">Work Description</th>
                      <th className="p-3">Sanctioned Outlay</th>
                      <th className="p-3">Executing Agency</th>
                      <th className="p-3">Orders (AS / TS)</th>
                      <th className="p-3 rounded-r-lg">Progress</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {mockApprovedWorks.map((w) => (
                      <tr key={w.uid} className="hover:bg-slate-50/70 transition">
                        <td className="p-3 font-mono font-bold text-purple-900">{w.uid}</td>
                        <td className="p-3 font-semibold text-slate-800 max-w-xs">{w.title}</td>
                        <td className="p-3 font-mono font-bold text-slate-900">{w.sanctionedAmount}</td>
                        <td className="p-3 text-slate-600">{w.agency}</td>
                        <td className="p-3 font-mono text-[11px] text-slate-500">
                          <div>AS: {w.asOrder}</div>
                          <div>TS: {w.tsOrder}</div>
                        </td>
                        <td className="p-3">
                          <div className="flex items-center gap-2">
                            <div className="w-16 h-2 bg-slate-200 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-teal-600 rounded-full"
                                style={{ width: `${w.completionPercent}%` }}
                              />
                            </div>
                            <span className="font-mono font-bold text-teal-700">{w.completionPercent}%</span>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ═══════════════════════════════════════════════════ */}
          {/* VIEW 3: FUNDING SUMMARY                            */}
          {/* ═══════════════════════════════════════════════════ */}
          {activeTab === 'funding' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                <div className="bg-white rounded-2xl p-6 border-l-4 border-purple-700 border-t border-r border-b border-slate-200 shadow-sm">
                  <div className="flex items-center justify-between">
                    <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">Annual Entitlement</div>
                    <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-700 flex items-center justify-center">
                      <IndianRupee className="w-4 h-4" />
                    </div>
                  </div>
                  <div className="text-3xl font-black text-slate-900 mt-2">₹5.00 Crore</div>
                  <div className="text-xs text-slate-500 mt-1">₹2.5 Cr in 2 equal installments per fiscal year</div>
                </div>

                <div className="bg-white rounded-2xl p-6 border-l-4 border-teal-600 border-t border-r border-b border-slate-200 shadow-sm">
                  <div className="flex items-center justify-between">
                    <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">Sanctioned & Disbursed</div>
                    <div className="w-8 h-8 rounded-lg bg-teal-50 text-teal-700 flex items-center justify-center">
                      <TrendingUp className="w-4 h-4" />
                    </div>
                  </div>
                  <div className="text-3xl font-black text-teal-800 mt-2">₹3.85 Crore</div>
                  <div className="text-xs text-teal-700 font-semibold mt-1">77.0% Scheme Utilization Rate</div>
                </div>

                <div className="bg-white rounded-2xl p-6 border-l-4 border-amber-500 border-t border-r border-b border-slate-200 shadow-sm">
                  <div className="flex items-center justify-between">
                    <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">Available for Recommendation</div>
                    <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
                      <FileCheck className="w-4 h-4" />
                    </div>
                  </div>
                  <div className="text-3xl font-black text-amber-700 mt-2">₹1.15 Crore</div>
                  <div className="text-xs text-slate-500 mt-1">23.0% Balance Entitlement Available</div>
                </div>
              </div>

              {/* Fund Utilization Progress & Tranche Details */}
              <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-black text-slate-900 uppercase tracking-wide">
                    FY 2025–26 Tranche Release & Statutory Utilization Status
                  </h3>
                  <span className="text-xs font-bold px-2.5 py-1 bg-teal-100 text-teal-800 rounded-full">
                    Sufficient Utilization (Clause 3.1 Compliant)
                  </span>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-xs font-semibold text-slate-600">
                    <span>Disbursed: ₹3.85 Cr of ₹5.00 Cr Entitlement</span>
                    <span>77.0%</span>
                  </div>
                  <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden p-0.5 border border-slate-200">
                    <div className="h-full bg-gradient-to-r from-teal-500 to-emerald-500 rounded-full" style={{ width: '77%' }} />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                  <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                    <div className="text-xs font-bold text-slate-800">Tranche 1 (₹2.50 Cr)</div>
                    <div className="text-xs text-slate-500 mt-0.5">Credited to Single Nodal Agency (SNA) Account: 15 Apr 2025</div>
                    <div className="text-xs font-semibold text-teal-700 mt-2">Status: 100% Utilized & UC Submitted</div>
                  </div>
                  <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                    <div className="text-xs font-bold text-slate-800">Tranche 2 (₹2.50 Cr)</div>
                    <div className="text-xs text-slate-500 mt-0.5">Credited to SNA Account: 12 Nov 2025</div>
                    <div className="text-xs font-semibold text-amber-700 mt-2">Status: 54% Committed & In Progress</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ═══════════════════════════════════════════════════ */}
          {/* VIEW 4: PRE-REQUISITES & QUOTA SCREENING           */}
          {/* ═══════════════════════════════════════════════════ */}
          {activeTab === 'prerequisites' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
                <h3 className="text-sm font-bold text-slate-900 uppercase">
                  Social Justice Statutory Quotas
                </h3>
                <div className="space-y-4">
                  <div className="p-4 rounded-xl bg-purple-50 border border-purple-100 space-y-2">
                    <div className="flex justify-between text-xs font-bold">
                      <span>Scheduled Caste (SC) Quota</span>
                      <span className="text-purple-900">{mockPreRequisites.scAllocated}% / Target: {mockPreRequisites.scTarget}%</span>
                    </div>
                    <div className="h-2.5 w-full bg-slate-200 rounded-full overflow-hidden">
                      <div className="h-full bg-purple-600 rounded-full" style={{ width: `${(mockPreRequisites.scAllocated / 20) * 100}%` }} />
                    </div>
                    <span className="text-[10px] text-emerald-700 font-semibold">✓ Mandatory 15% quota fulfilled</span>
                  </div>

                  <div className="p-4 rounded-xl bg-teal-50 border border-teal-100 space-y-2">
                    <div className="flex justify-between text-xs font-bold">
                      <span>Scheduled Tribe (ST) Quota</span>
                      <span className="text-teal-900">{mockPreRequisites.stAllocated}% / Target: {mockPreRequisites.stTarget}%</span>
                    </div>
                    <div className="h-2.5 w-full bg-slate-200 rounded-full overflow-hidden">
                      <div className="h-full bg-teal-600 rounded-full" style={{ width: `${(mockPreRequisites.stAllocated / 12) * 100}%` }} />
                    </div>
                    <span className="text-[10px] text-emerald-700 font-semibold">✓ Mandatory 7.5% quota fulfilled</span>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
                <h3 className="text-sm font-bold text-slate-900 uppercase">
                  45-Day Statutory Sanction Countdown
                </h3>
                <div className="space-y-3">
                  {mockPendingProposals.map((p) => (
                    <div key={p.id} className="p-3.5 rounded-xl border border-slate-200 flex items-center justify-between">
                      <div>
                        <div className="font-bold text-xs text-slate-900">{p.title}</div>
                        <div className="text-[11px] text-slate-500">Submitted: {p.submittedDate} • Outlay: {p.estimatedCost}</div>
                      </div>
                      <div className="text-right">
                        <span className={`text-xs font-mono font-bold px-2 py-0.5 rounded ${
                          p.slaBreached ? 'bg-red-100 text-red-700' : 'bg-teal-100 text-teal-800'
                        }`}>
                          {p.daysPending} Days Pending
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ═══════════════════════════════════════════════════ */}
          {/* VIEW 5: CONSTITUENCY MAP                           */}
          {/* ═══════════════════════════════════════════════════ */}
          {activeTab === 'map' && (
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold text-slate-900 uppercase flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-teal-600" />
                    <span>{constituencyName} GIS Map</span>
                  </h2>
                  <p className="text-xs text-slate-500">
                    Auto-focused on your elected jurisdiction ({userDistrict}, {userState}) with ground progress markers
                  </p>
                </div>
                <span className="text-xs font-bold px-3 py-1 bg-teal-50 text-teal-800 rounded-full border border-teal-200 flex items-center gap-1.5 shadow-2xs">
                  <MapPin className="w-3.5 h-3.5 text-teal-600" />
                  Elected Constituency: {userDistrict}
                </span>
              </div>
              <div className="h-[520px] rounded-xl overflow-hidden border border-slate-200 shadow-inner">
                <GISMapViewer
                  projects={liveProjects}
                  focusDistrict={userDistrict}
                  focusState={userState}
                  userRole="MP"
                  height="520px"
                />
              </div>
            </div>
          )}

          {/* ═══════════════════════════════════════════════════ */}
          {/* VIEW 6: SITE UPDATES & EXIF VERIFIED PHOTOS       */}
          {/* ═══════════════════════════════════════════════════ */}
          {activeTab === 'photos' && (
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-6">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div>
                  <h2 className="text-lg font-black text-slate-900 uppercase">
                    Field Verification & EXIF Photo Stream
                  </h2>
                  <p className="text-xs text-slate-500">
                    High-resolution physical progress photos uploaded by empanelled agencies with cryptographic EXIF metadata
                  </p>
                </div>
                <span className="text-xs font-bold px-3 py-1 bg-emerald-100 text-emerald-800 rounded-full flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5" /> 100% EXIF Tamper-Checked
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {mockVerificationCards.siteUpdates.photos.map((photo, idx) => (
                  <div key={idx} className="bg-slate-50 rounded-xl overflow-hidden border border-slate-200 group hover:shadow-md transition">
                    <div className="relative h-48 bg-slate-200">
                      <img
                        src={photo.url}
                        alt={photo.caption}
                        className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                      />
                      <div className="absolute top-2.5 right-2.5 bg-emerald-600/90 backdrop-blur-xs text-white text-[10px] font-bold px-2 py-0.5 rounded shadow-xs flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" /> EXIF Verified
                      </div>
                    </div>
                    <div className="p-4 space-y-2">
                      <div className="text-xs font-bold text-slate-800">{photo.caption}</div>
                      <div className="text-[11px] text-slate-500 font-mono flex items-center justify-between">
                        <span>GPS: {mockVerificationCards.siteUpdates.coordinates}</span>
                        <span className="text-teal-700 font-bold">{mockVerificationCards.siteUpdates.status}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ═══════════════════════════════════════════════════ */}
          {/* VIEW 7: HELP & GRIEVANCES                          */}
          {/* ═══════════════════════════════════════════════════ */}
          {activeTab === 'help' && (
            <div className="max-w-2xl bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
              <h2 className="text-lg font-bold text-slate-900 uppercase">
                Direct Escalation to District Authority
              </h2>
              <p className="text-xs text-slate-500">
                Send priority parliamentary communications directly to District Magistrate & Nodal Officer
              </p>
              <form onSubmit={(e) => { e.preventDefault(); setEscalatedMessage('Parliamentary communication logged with District Collector.'); }} className="space-y-3">
                <input
                  type="text"
                  placeholder="Subject / Work Reference"
                  className="w-full p-2.5 border border-slate-300 rounded-lg text-xs"
                  required
                />
                <textarea
                  rows={4}
                  placeholder="Official message to District Collector regarding delays or site issues..."
                  className="w-full p-2.5 border border-slate-300 rounded-lg text-xs"
                  required
                />
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#5b21b6] text-white font-bold rounded-lg text-xs hover:bg-[#4c1d95] cursor-pointer"
                >
                  Send Official Notice
                </button>
              </form>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
