import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Clock,
  AlertTriangle,
  FileSearch,
  CheckCircle2,
  XCircle,
  Calculator,
  Search,
  Filter,
  ExternalLink,
  ShieldAlert,
} from 'lucide-react';
import { mockProposalsPipeline } from '../../mock/daDashboardData';

export default function ProposalPipelineTable({ onOpenProposal, onOpenBoq, onSanction, onReject }) {
  const { t } = useTranslation();
  const [filterRisk, setFilterRisk] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');

  const filtered = mockProposalsPipeline.filter((p) => {
    const matchesSearch =
      p.assetTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.mpName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.id.toLowerCase().includes(searchTerm.toLowerCase());

    if (filterRisk === 'ALL') return matchesSearch;
    if (filterRisk === 'BREACHED') return matchesSearch && p.slaStatus === 'BREACHED';
    if (filterRisk === 'HIGH') return matchesSearch && p.riskLevel === 'HIGH';
    return matchesSearch;
  });

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
      {/* Table Header Controls */}
      <div className="p-4 sm:p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50/50">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-sm sm:text-base font-black text-slate-900 uppercase tracking-wide">
              {t('da_portal.pipeline.title', 'ACTIVE SCRUTINY & SANCTION PIPELINE')}
            </h3>
            <span className="px-2 py-0.5 rounded-full bg-[#1f7a6b]/10 text-[#1f7a6b] font-bold text-[10px]">
              {t('da_portal.works_under_review', { count: filtered.length, defaultValue: `${filtered.length} Works Under Review` })}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            {t('da_portal.pipeline.subtitle', 'Proposals sorted by statutory 45-day SLA countdown under MPLADS 2023 Guidelines')}
          </p>
        </div>

        {/* Search & Risk Filter Buttons */}
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder={t('da_portal.pipeline.search_placeholder', 'Search ID, MP, or asset...')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8 pr-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-[#1f7a6b] w-48 sm:w-56"
            />
          </div>

          <div className="flex items-center bg-slate-200/60 p-0.5 rounded-lg text-xs font-semibold">
            <button
              onClick={() => setFilterRisk('ALL')}
              className={`px-2.5 py-1 rounded-md transition cursor-pointer ${
                filterRisk === 'ALL' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {t('da_portal.pipeline.filter_all', 'All')}
            </button>
            <button
              onClick={() => setFilterRisk('BREACHED')}
              className={`px-2.5 py-1 rounded-md transition cursor-pointer ${
                filterRisk === 'BREACHED'
                  ? 'bg-red-500 text-white shadow-xs'
                  : 'text-red-700 hover:text-red-900'
              }`}
            >
              {t('da_portal.pipeline.filter_breached', 'Breached')}
            </button>
            <button
              onClick={() => setFilterRisk('HIGH')}
              className={`px-2.5 py-1 rounded-md transition cursor-pointer ${
                filterRisk === 'HIGH'
                  ? 'bg-amber-500 text-white shadow-xs'
                  : 'text-amber-700 hover:text-amber-900'
              }`}
            >
              {t('da_portal.pipeline.filter_high', 'High Risk')}
            </button>
          </div>
        </div>
      </div>

      {/* Dense Forensic Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs text-slate-600 border-collapse">
          <thead>
            <tr className="bg-slate-100/75 border-b border-slate-200 text-[11px] font-black text-slate-700 uppercase tracking-wider">
              <th className="py-3 px-4">{t('da_portal.pipeline.th_id', 'Project ID')}</th>
              <th className="py-3 px-4">{t('da_portal.pipeline.th_mp', 'MP & Constituency')}</th>
              <th className="py-3 px-4">{t('da_portal.pipeline.th_asset', 'Proposed Asset Title')}</th>
              <th className="py-3 px-4">{t('da_portal.pipeline.th_cost', 'Est. Cost')}</th>
              <th className="py-3 px-4">{t('da_portal.pipeline.th_sla', '45-Day SLA Countdown')}</th>
              <th className="py-3 px-4">{t('da_portal.pipeline.th_risk', 'AI Risk Score')}</th>
              <th className="py-3 px-4 text-right">{t('da_portal.pipeline.th_actions', 'Forensic Actions')}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 font-medium">
            {filtered.map((item) => {
              const isBreached = item.slaStatus === 'BREACHED';
              const isCritical = item.slaStatus === 'CRITICAL';

              return (
                <tr
                  key={item.id}
                  className={`hover:bg-slate-50/80 transition ${
                    isBreached ? 'bg-red-50/30' : ''
                  }`}
                >
                  {/* Project ID */}
                  <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                    <span className="text-[#1f7a6b]">{item.id}</span>
                  </td>

                  {/* MP & Constituency */}
                  <td className="py-3.5 px-4">
                    <div className="font-bold text-slate-900">{item.mpName}</div>
                    <div className="text-[10px] text-slate-400 font-semibold">{item.constituency}</div>
                  </td>

                  {/* Proposed Asset */}
                  <td className="py-3.5 px-4 max-w-xs">
                    <div className="font-bold text-slate-800 line-clamp-1">{t(`da_portal.mock_assets.${item.id}`, item.assetTitle)}</div>
                    <div className="text-[10px] text-slate-400">{item.category}</div>
                    {item.violations.length > 0 && (
                      <div className="flex items-center gap-1 text-[10px] text-red-600 mt-0.5">
                        <AlertTriangle className="w-3 h-3 flex-shrink-0" />
                        <span className="line-clamp-1">{item.violations[0].title}</span>
                      </div>
                    )}
                  </td>

                  {/* Est. Cost */}
                  <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                    {item.estCost}
                  </td>

                  {/* SLA Countdown Badge */}
                  <td className="py-3.5 px-4">
                    {isBreached ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-red-100 text-red-800 font-bold text-[11px] border border-red-200">
                        <Clock className="w-3 h-3 text-red-600" />
                        <span>{t('da_portal.pipeline.breached_badge', { days: item.daysElapsed, defaultValue: `BREACHED (${item.daysElapsed}d)` })}</span>
                      </span>
                    ) : isCritical ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-100 text-amber-800 font-bold text-[11px] border border-amber-200">
                        <Clock className="w-3 h-3 text-amber-600" />
                        <span>{t('da_portal.pipeline.days_left', { days: item.daysRemaining, defaultValue: `${item.daysRemaining} Days Left` })}</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-bold text-[11px]">
                        <Clock className="w-3 h-3 text-slate-400" />
                        <span>{t('da_portal.pipeline.days_left', { days: item.daysRemaining, defaultValue: `${item.daysRemaining} Days Left` })}</span>
                      </span>
                    )}
                  </td>

                  {/* AI Risk Score */}
                  <td className="py-3.5 px-4">
                    {item.riskLevel === 'HIGH' ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-red-100 text-red-800 font-bold text-[11px]">
                        <ShieldAlert className="w-3 h-3 text-red-600" />
                        <span>{item.riskScore}% {t('da_portal.pipeline.high_risk', 'High')}</span>
                      </span>
                    ) : item.riskLevel === 'MEDIUM' ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 font-bold text-[11px]">
                        <span>{item.riskScore}% {t('da_portal.pipeline.medium_risk', 'Medium')}</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[11px]">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        <span>{item.riskScore}% {t('da_portal.pipeline.low_risk', 'Low')}</span>
                      </span>
                    )}
                  </td>

                  {/* Actions */}
                  <td className="py-3.5 px-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => onOpenProposal && onOpenProposal(item.id)}
                        className="px-2.5 py-1 bg-[#e6f4f1] text-[#1f7a6b] hover:bg-[#d5eee8] rounded-md font-bold text-[11px] border border-[#a3ded2] transition cursor-pointer flex items-center gap-1"
                        title={t('da_portal.pipeline.action_review', 'Review')}
                      >
                        <FileSearch className="w-3 h-3" />
                        <span>{t('da_portal.pipeline.action_review', 'Review')}</span>
                      </button>

                      {item.hasBoqIssue && (
                        <button
                          onClick={() => onOpenBoq && onOpenBoq(item.id)}
                          className="px-2 py-1 bg-amber-50 text-amber-700 hover:bg-amber-100 rounded-md font-bold text-[11px] border border-amber-200 transition cursor-pointer flex items-center gap-1"
                          title={t('da_portal.pipeline.action_boq', 'BOQ')}
                        >
                          <Calculator className="w-3 h-3 text-amber-600" />
                          <span>{t('da_portal.pipeline.action_boq', 'BOQ')}</span>
                        </button>
                      )}

                      <button
                        onClick={() => onSanction && onSanction(item.id)}
                        className="p-1 text-emerald-700 hover:bg-emerald-50 rounded-md transition cursor-pointer"
                        title={t('da_portal.pipeline.grant_ts', 'Grant Technical Sanction')}
                      >
                        <CheckCircle2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => onReject && onReject(item.id)}
                        className="p-1 text-red-600 hover:bg-red-50 rounded-md transition cursor-pointer"
                        title={t('da_portal.pipeline.reject_citation', 'Reject with Guideline Citation')}
                      >
                        <XCircle className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
