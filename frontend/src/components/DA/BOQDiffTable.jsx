import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { X, Calculator, AlertTriangle, CheckCircle2, ArrowUpRight, Scale, ShieldCheck } from 'lucide-react';
import { mockBoqDiffData } from '../../mock/daDashboardData';

export default function BOQDiffTable({ projectId, onClose }) {
  const { t } = useTranslation();
  const data = mockBoqDiffData;
  const [capEnforced, setCapEnforced] = useState(false);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] flex flex-col overflow-hidden border border-slate-200">
        {/* Modal Header */}
        <div className="px-6 py-4 bg-[#1f7a6b] text-white flex items-center justify-between border-b border-[#186054]">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-white/10">
              <Scale className="w-5 h-5 text-[#34d399]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-black uppercase tracking-wide">
                  {t('da_portal.boq.title', 'BILL OF QUANTITIES (BOQ) BENCHMARK AUDIT')}
                </h3>
                <span className="px-2 py-0.5 rounded bg-white/20 text-xs font-mono font-bold">
                  {data.projectId}
                </span>
              </div>
              <p className="text-xs text-teal-100/80">
                {t('da_portal.boq.subtitle', 'Automated Row-by-Row Comparison vs. CPWD / State PWD Schedule of Rates (SoR 2026)')}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Project & Contractor Info Banner */}
        <div className="p-5 bg-slate-50 border-b border-slate-200 grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div>
            <span className="text-slate-500 font-medium">{t('da_portal.boq.work_title', 'Work Title:')}</span>
            <p className="font-bold text-slate-900 mt-0.5">
              {t(`da_portal.mock_assets.${data.projectId}`, data.projectTitle)}
            </p>
          </div>
          <div>
            <span className="text-slate-500 font-medium">{t('da_portal.boq.contractor_agency', 'Contractor Agency:')}</span>
            <p className="font-bold text-slate-900 mt-0.5">{data.contractor}</p>
          </div>
          <div>
            <span className="text-slate-500 font-medium">{t('da_portal.boq.cost_inflation', 'Total Cost Inflation:')}</span>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-sm font-black text-red-600 font-mono">
                +₹{(data.totalVariance / 100000).toFixed(2)} Lakh (+{data.variancePercent}%)
              </span>
              <span className="px-2 py-0.5 rounded bg-red-100 text-red-800 font-bold text-[10px]">
                {t('da_portal.boq.audit_flagged', 'AUDIT FLAGGED')}
              </span>
            </div>
          </div>
        </div>

        {/* Table Content */}
        <div className="flex-1 overflow-y-auto p-5">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-100 border-b border-slate-200 text-[11px] font-black text-slate-700 uppercase tracking-wider">
                <th className="py-2.5 px-3">{t('da_portal.boq.th_item_code', 'Item Code')}</th>
                <th className="py-2.5 px-3">{t('da_portal.boq.th_description', 'CPWD Description')}</th>
                <th className="py-2.5 px-2 text-center">{t('da_portal.boq.th_unit', 'Unit')}</th>
                <th className="py-2.5 px-3 text-right">{t('da_portal.boq.th_qty', 'Qty')}</th>
                <th className="py-2.5 px-3 text-right">{t('da_portal.boq.th_contractor_rate', 'Contractor Rate')}</th>
                <th className="py-2.5 px-3 text-right">{t('da_portal.boq.th_sor_benchmark', 'SoR Benchmark')}</th>
                <th className="py-2.5 px-3 text-right">{t('da_portal.boq.th_variance', 'Variance')}</th>
                <th className="py-2.5 px-3 text-right">{t('da_portal.boq.th_excess_total', 'Excess Total')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {data.items.map((row, idx) => (
                <tr
                  key={idx}
                  className={`transition ${
                    row.flagged ? 'bg-red-50/50 hover:bg-red-50' : 'hover:bg-slate-50'
                  }`}
                >
                  <td className="py-3 px-3 font-mono font-bold text-slate-800">
                    {row.itemCode}
                  </td>
                  <td className="py-3 px-3 max-w-xs text-slate-700 leading-snug">
                    {row.description}
                  </td>
                  <td className="py-3 px-2 text-center font-mono text-slate-500">
                    {row.unit}
                  </td>
                  <td className="py-3 px-3 text-right font-mono text-slate-800">
                    {row.quantity.toLocaleString()}
                  </td>
                  <td
                    className={`py-3 px-3 text-right font-mono font-bold ${
                      row.flagged ? 'text-red-700 bg-red-100/50 rounded' : 'text-slate-800'
                    }`}
                  >
                    ₹{row.contractorRate.toLocaleString()}
                  </td>
                  <td className="py-3 px-3 text-right font-mono text-slate-700">
                    ₹{row.benchmarkRate.toLocaleString()}
                  </td>
                  <td className="py-3 px-3 text-right">
                    {row.diffPercent > 10 ? (
                      <span className="inline-flex items-center gap-1 font-mono font-bold text-red-600 bg-red-100 px-1.5 py-0.5 rounded text-[11px]">
                        +{row.diffPercent}% <ArrowUpRight className="w-3 h-3" />
                      </span>
                    ) : (
                      <span className="font-mono text-emerald-600 font-semibold">
                        +{row.diffPercent}%
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-3 text-right font-mono font-bold text-slate-900">
                    {row.flagged ? (
                      <span className="text-red-600">+₹{row.excess.toLocaleString()}</span>
                    ) : (
                      <span className="text-slate-400">₹{row.excess.toLocaleString()}</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="border-t-2 border-slate-300 font-bold bg-slate-50">
                <td colSpan={4} className="py-3 px-3 text-slate-800 uppercase tracking-wider text-[11px]">
                  {t('da_portal.boq.totals_label', 'Totals: Claimed vs Benchmark')}
                </td>
                <td className="py-3 px-3 text-right font-mono text-red-700">
                  ₹{(data.totalClaimed / 100000).toFixed(2)} Lakh
                </td>
                <td className="py-3 px-3 text-right font-mono text-emerald-700">
                  ₹{(data.totalBenchmark / 100000).toFixed(2)} Lakh
                </td>
                <td colSpan={2} className="py-3 px-3 text-right font-mono text-red-600 font-black">
                  {t('da_portal.boq.excess_label', 'Excess:')} +₹{(data.totalVariance / 100000).toFixed(2)} Lakh
                </td>
              </tr>
            </tfoot>
          </table>
        </div>

        {/* Modal Footer Controls */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs text-slate-600">
            <AlertTriangle className="w-4 h-4 text-red-600 flex-shrink-0" />
            <span>
              {t('da_portal.boq.tolerance_footnote', 'Rows highlighted in red exceed the statutory 10% tolerance ceiling under PWD Manual Clause 14.')}
            </span>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button
              onClick={() => setCapEnforced(true)}
              className="flex-1 sm:flex-none px-4 py-2 bg-[#1f7a6b] hover:bg-[#186054] text-white rounded-xl text-xs font-bold transition shadow-xs cursor-pointer flex items-center justify-center gap-1.5"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>{capEnforced ? t('da_portal.boq.cap_enforced_btn', '✓ SoR Cap Enforced') : t('da_portal.boq.enforce_cap_btn', 'Enforce SoR Benchmark Cap')}</span>
            </button>
            <button
              onClick={onClose}
              className="flex-1 sm:flex-none px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-xl text-xs font-semibold transition cursor-pointer"
            >
              {t('da_portal.boq.close_btn', 'Close')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
