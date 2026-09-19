import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Users,
  IndianRupee,
  TrendingUp,
  MapPin,
  Building2,
  CheckCircle2,
  Clock,
  ChevronRight,
  Sparkles,
  Layers,
  BarChart3,
  Globe2,
  ExternalLink,
  ShieldCheck,
  AlertTriangle
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area
} from 'recharts';
import GISMapViewer from '../../components/GISMapViewer';
import {
  mockKpiData,
  mockStateUtilization,
  mockAgencyPerformance
} from './mockMinistryData';
import { getLocalizedState } from '../../utils/geoTranslations';

export default function NationalCommandCenter({ projects = [], summary }) {
  const { t, i18n } = useTranslation();
  const [subView, setSubView] = useState('heatmap'); // 'heatmap' is default per user request
  const [selectedState, setSelectedState] = useState(mockStateUtilization[0]);

  // Mini sparkline renderer using SVG
  const renderSparkline = (points, color = '#247b93') => {
    const min = Math.min(...points);
    const max = Math.max(...points);
    const range = max - min || 1;
    const width = 100;
    const height = 28;
    const step = width / (points.length - 1);

    const pathD = points
      .map((pt, idx) => {
        const x = idx * step;
        const y = height - ((pt - min) / range) * (height - 6) - 3;
        return `${idx === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)}`;
      })
      .join(' ');

    return (
      <svg width={width} height={height} className="overflow-visible">
        <path d={pathD} fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" />
      </svg>
    );
  };

  return (
    <div className="space-y-6 animate-fade-in text-slate-800">
      {/* ── Top Header Row Matching Screenshot ──────────────── */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-4 sm:p-5 rounded-2xl shadow-xs border border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 uppercase">
              {t('ministry_portal.portal_title', 'MINISTRY DASHBOARD')}
            </h1>
            <span className="hidden md:inline-flex items-center gap-1 text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
              {t('ministry_portal.live_datastream', 'LIVE DATASTREAM')}
            </span>
          </div>
          <p className="text-xs text-slate-500">
            {t('ministry_portal.portal_subtitle', 'National MPLADS Infrastructure & Fund Oversight • MoSPI Executive Dashboard')}
          </p>
        </div>

        <div className="flex items-center gap-3 self-end sm:self-auto">
          {/* Sub-View Switcher Pills */}
          <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs font-semibold">
            <button
              onClick={() => setSubView('heatmap')}
              className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${
                subView === 'heatmap'
                  ? 'bg-white text-slate-900 shadow-xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {t('ministry_portal.fund_heatmap', 'Fund Heatmap')}
            </button>
            <button
              onClick={() => setSubView('executive')}
              className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${
                subView === 'executive'
                  ? 'bg-white text-slate-900 shadow-xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {t('ministry_portal.performance_indicators', 'Performance Indicators')}
            </button>
            <button
              onClick={() => setSubView('agencies')}
              className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${
                subView === 'agencies'
                  ? 'bg-white text-slate-900 shadow-xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {t('ministry_portal.agencies_matrix', 'Agencies Matrix')}
            </button>
          </div>

          <div className="text-xs font-mono font-bold text-slate-600 bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200 hidden lg:block">
            {mockKpiData.date}
          </div>

          <div className="px-3.5 py-1.5 bg-[#257e85] text-white text-xs font-bold rounded-lg shadow-xs flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-amber-300" />
            <span>{mockKpiData.userRole}</span>
          </div>
        </div>
      </div>

      {/* ── Real-Time Nationwide Scheme Tracker (Module A Top Row) ─ */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              {t('ministry_portal.works_recommended', 'Works Recommended (FY26)')}
            </p>
            <h3 className="text-2xl font-black text-slate-900 mt-1">2,480</h3>
            <span className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1 mt-0.5">
              <span>+18.4%</span>
              <span className="text-slate-400 font-normal">vs last quarter</span>
            </span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100">
            <Building2 className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              {t('mp_portal.sanctioned_works', 'Works Sanctioned (45d SLA)')}
            </p>
            <h3 className="text-2xl font-black text-slate-900 mt-1">1,942</h3>
            <span className="text-[11px] text-teal-600 font-semibold flex items-center gap-1 mt-0.5">
              <span>88.2%</span>
              <span className="text-slate-400 font-normal">district compliance</span>
            </span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center border border-teal-100">
            <Clock className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              {t('ministry_portal.completion_velocity', 'Works Completed & Geo-Tagged')}
            </p>
            <h3 className="text-2xl font-black text-slate-900 mt-1">1,234</h3>
            <span className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1 mt-0.5">
              <span>92.0%</span>
              <span className="text-slate-400 font-normal">utilization efficiency</span>
            </span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center border border-emerald-100">
            <CheckCircle2 className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* ── VIEW 1: EXECUTIVE OVERVIEW (EXACT SCREENSHOT LAYOUT) ── */}
      {subView === 'executive' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* LEFT 2-COL: OVERALL KPIS */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200 shadow-xs space-y-6">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="text-sm font-black tracking-wider text-slate-800 uppercase">
                  OVERALL PERFORMANCE INDICATORS
                </h3>
                <span className="text-xs text-slate-400 font-medium">FY 2026-27 Multi-Metric Analytics</span>
              </div>

              {/* 1. Multi-Metric Dual Bar Chart */}
              <div className="h-56 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={mockKpiData.barMetrics} barGap={4} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="label" stroke="#64748b" fontSize={11} tickLine={false} />
                    <YAxis stroke="#64748b" fontSize={11} tickLine={false} domain={[0, 1000]} />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#0f2e52', color: '#fff', borderRadius: '8px', border: 'none', fontSize: '11px' }}
                    />
                    <Bar dataKey="val1" fill="#1b5c74" radius={[4, 4, 0, 0]} name="Planned" isAnimationActive={false} />
                    <Bar dataKey="val2" fill="#247b93" radius={[4, 4, 0, 0]} name="Actual" isAnimationActive={false} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* 2. Donut Chart + Spline Wave */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-slate-100 items-center">
                {/* Donut Chart */}
                <div className="flex items-center justify-center gap-3">
                  <div className="w-32 h-32 relative">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={mockKpiData.schemesDistribution}
                          innerRadius={34}
                          outerRadius={58}
                          paddingAngle={3}
                          dataKey="value"
                          isAnimationActive={false}
                        >
                          {mockKpiData.schemesDistribution.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="text-[11px] space-y-1 text-slate-600">
                    {mockKpiData.schemesDistribution.map((s) => (
                      <div key={s.name} className="flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-sm shrink-0" style={{ backgroundColor: s.color }} />
                        <span className="truncate max-w-[130px]">{s.name}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Spline Wave Mini Chart (Jan - May) */}
                <div className="h-32 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={mockKpiData.miniWaveTrend} margin={{ top: 5, right: 10, left: -25, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorWave1" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#247b93" stopOpacity={0.4} />
                          <stop offset="95%" stopColor="#247b93" stopOpacity={0.0} />
                        </linearGradient>
                        <linearGradient id="colorWave2" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#38a169" stopOpacity={0.4} />
                          <stop offset="95%" stopColor="#38a169" stopOpacity={0.0} />
                        </linearGradient>
                      </defs>
                      <XAxis dataKey="month" stroke="#94a3b8" fontSize={10} tickLine={false} />
                      <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} domain={[0, 1000]} />
                      <Tooltip />
                      <Area type="monotone" dataKey="val1" stroke="#247b93" fill="url(#colorWave1)" strokeWidth={2} isAnimationActive={false} />
                      <Area type="monotone" dataKey="val2" stroke="#38a169" fill="url(#colorWave2)" strokeWidth={2} isAnimationActive={false} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* 3. Bottom Row of 3 Stat KPI Cards with Progress Bars */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 border-t border-slate-100">
                {/* Stat 1 */}
                <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                  <div className="flex items-center justify-between text-slate-500">
                    <Users className="w-4 h-4 text-teal-700" />
                    <span className="text-[10px] font-bold text-teal-700">82% of Cap</span>
                  </div>
                  <div className="h-1.5 w-full bg-slate-200 rounded-full overflow-hidden">
                    <div className="h-full bg-teal-600 rounded-full w-[82%]" />
                  </div>
                  <div>
                    <div className="text-xl font-black text-slate-900 leading-tight">1,234</div>
                    <div className="text-[11px] text-slate-500 font-medium">Projects Approved</div>
                  </div>
                </div>

                {/* Stat 2 */}
                <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                  <div className="flex items-center justify-between text-slate-500">
                    <IndianRupee className="w-4 h-4 text-teal-700" />
                    <span className="text-[10px] font-bold text-teal-700">94% Disbursed</span>
                  </div>
                  <div className="h-1.5 w-full bg-slate-200 rounded-full overflow-hidden">
                    <div className="h-full bg-teal-600 rounded-full w-[94%]" />
                  </div>
                  <div>
                    <div className="text-xl font-black text-slate-900 leading-tight">₹1.2B</div>
                    <div className="text-[11px] text-slate-500 font-medium">Budget Allocated</div>
                  </div>
                </div>

                {/* Stat 3 */}
                <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                  <div className="flex items-center justify-between text-slate-500">
                    <TrendingUp className="w-4 h-4 text-emerald-600" />
                    <span className="text-[10px] font-bold text-emerald-600">+4.2% MoM</span>
                  </div>
                  <div className="h-1.5 w-full bg-slate-200 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-600 rounded-full w-[92%]" />
                  </div>
                  <div>
                    <div className="text-xl font-black text-slate-900 leading-tight">92%</div>
                    <div className="text-[11px] text-slate-500 font-medium">Efficiency Rating</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: RECENT ACTIVITY, REVIEWS & RECENT DATA */}
          <div className="space-y-6">
            {/* 1. Recent Activity Card */}
            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-3">
              <h3 className="text-xs font-black tracking-wider text-slate-800 uppercase">
                RECENT ACTIVITY
              </h3>
              <div className="h-36 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={mockKpiData.recentActivityData} margin={{ top: 5, right: 10, left: -25, bottom: 0 }}>
                    <defs>
                      <linearGradient id="actGrad1" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#247b93" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="#247b93" stopOpacity={0.0} />
                      </linearGradient>
                      <linearGradient id="actGrad2" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#a855f7" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#a855f7" stopOpacity={0.0} />
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="month" stroke="#94a3b8" fontSize={10} tickLine={false} />
                    <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} domain={[0, 80]} />
                    <Tooltip />
                    <Area type="monotone" dataKey="val1" stroke="#247b93" fill="url(#actGrad1)" strokeWidth={2} isAnimationActive={false} />
                    <Area type="monotone" dataKey="val2" stroke="#a855f7" fill="url(#actGrad2)" strokeWidth={2} isAnimationActive={false} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* 2. Recent Reviews Card */}
            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-3">
              <h3 className="text-xs font-black tracking-wider text-slate-800 uppercase">
                RECENT REVIEWS
              </h3>
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3.5 rounded-xl bg-[#e2f0f4] border border-[#cbe3ea]">
                  <div className="text-[11px] font-semibold text-slate-600">Contractor Ratings</div>
                  <div className="text-xl font-black text-slate-900 mt-1">1,348</div>
                  <div className="text-[10px] text-teal-800 font-medium">★ 4.8 / 5.0 Avg</div>
                </div>

                <div className="p-3.5 rounded-xl bg-[#e2f0f4] border border-[#cbe3ea]">
                  <div className="text-[11px] font-semibold text-slate-600">Scheme Efficiency</div>
                  <div className="text-xl font-black text-slate-900 mt-1">9.2%</div>
                  <div className="text-[10px] text-teal-800 font-medium">Top Quintile</div>
                </div>
              </div>
            </div>

            {/* 3. Recent Data Streams with Sparklines */}
            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-3">
              <h3 className="text-xs font-black tracking-wider text-slate-800 uppercase">
                RECENT DATA
              </h3>
              <div className="space-y-3">
                {mockKpiData.recentDataFeeds.map((feed, idx) => (
                  <div key={idx} className="flex items-center justify-between border-b border-slate-100 last:border-0 pb-2">
                    <div>
                      <div className="text-xs font-bold text-slate-800">{feed.title}</div>
                      <div className="text-[10px] text-slate-400">Processed 14m ago • {feed.change}</div>
                    </div>
                    <div>{renderSparkline(feed.trend, feed.color)}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── VIEW 2: FUND UTILIZATION HEATMAP & GIS MAP ──────── */}
      {subView === 'heatmap' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 uppercase">
                    {t('ministry_portal.fund_heatmap', 'National Fund Utilization Heatmap')}
                  </h3>
                  <p className="text-xs text-slate-500">{t('ministry_portal.state_utilization_title', 'Expenditure efficiency by state & district geo-boundary')}</p>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> &gt;85% Optimal</span>
                  <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-amber-500" /> 75-85% Normal</span>
                  <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-red-500" /> &lt;75% High Risk</span>
                </div>
              </div>

              {/* GIS Map Component */}
              <div className="h-96 rounded-xl overflow-hidden border border-slate-200">
                <GISMapViewer projects={projects} />
              </div>
            </div>

            {/* State Ranking Table */}
            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-3">
              <h3 className="text-xs font-bold text-slate-900 uppercase">{t('ministry_portal.state_utilization_title', 'State Utilization Ranking')}</h3>
              <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
                {mockStateUtilization.map((st) => (
                  <div
                    key={st.state}
                    onClick={() => setSelectedState(st)}
                    className={`p-3 rounded-xl border text-xs transition cursor-pointer flex items-center justify-between ${
                      selectedState.state === st.state
                        ? 'bg-teal-50 border-teal-500 shadow-xs'
                        : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    <div>
                      <div className="font-bold text-slate-800">{getLocalizedState(st.state, i18n.language)}</div>
                      <div className="text-[10px] text-slate-500">₹{st.spent} Cr spent / ₹{st.allocated} Cr</div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-slate-900">{st.percent}%</div>
                      <span className={`text-[9px] font-semibold px-1.5 py-0.5 rounded ${
                        st.risk === 'Low' ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {st.risk} Risk
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── VIEW 3: IMPLEMENTING AGENCY MATRIX ───────────────── */}
      {subView === 'agencies' && (
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h3 className="text-base font-bold text-slate-900 uppercase">
                Implementing Agency Performance Matrix
              </h3>
              <p className="text-xs text-slate-500">
                Cross-regional completion rates identifying systemic bottlenecks across state PWDs and rural agencies
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-center">
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={mockAgencyPerformance} layout="vertical" margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                  <XAxis type="number" domain={[0, 100]} unit="%" fontSize={11} stroke="#64748b" />
                  <YAxis type="category" dataKey="agency" width={140} fontSize={10} stroke="#64748b" tickLine={false} />
                  <Tooltip />
                  <Bar dataKey="rate" fill="#1b5c74" radius={[0, 6, 6, 0]} name="Completion Rate %" isAnimationActive={false} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="space-y-3">
              {mockAgencyPerformance.map((agency) => (
                <div key={agency.agency} className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">{agency.agency}</h4>
                    <p className="text-[11px] text-slate-500">
                      {agency.completed} of {agency.totalWorks} works completed • {agency.delayed} delayed
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-black text-teal-800">{agency.rate}%</div>
                    <div className="text-[10px] text-slate-400">Success Index</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
