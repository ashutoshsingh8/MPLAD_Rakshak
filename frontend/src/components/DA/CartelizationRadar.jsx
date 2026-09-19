import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { AlertTriangle, Users, TrendingUp, ShieldAlert, Award, FileSpreadsheet } from 'lucide-react';
import { mockCartelizationWatch } from '../../mock/daDashboardData';

export default function CartelizationRadar() {
  const { t } = useTranslation();

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 space-y-4">
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <div>
          <h3 className="text-sm font-black text-slate-900 uppercase tracking-wide flex items-center gap-2">
            <Users className="w-4 h-4 text-amber-600" />
            <span>{t('da_portal.cartelization.title', 'Cartelization & Tender Splitting Watch')}</span>
          </h3>
          <p className="text-xs text-slate-500">
            {t('da_portal.cartelization.subtitle', 'Automated monitoring of contractor win concentrations and contract splitting below ₹50L threshold')}
          </p>
        </div>
        <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[10px] font-bold">
          {t('da_portal.cartelization.agencies_monitored', { count: mockCartelizationWatch.length, defaultValue: `${mockCartelizationWatch.length} Agencies Monitored` })}
        </span>
      </div>

      <div className="space-y-3">
        {mockCartelizationWatch.map((item, idx) => (
          <div
            key={idx}
            className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2 hover:bg-slate-100/60 transition"
          >
            <div className="flex items-start justify-between gap-2">
              <div>
                <h4 className="font-bold text-xs text-slate-900 leading-tight">
                  {item.agency}
                </h4>
                <div className="flex items-center gap-3 text-[10px] text-slate-500 mt-1">
                  <span>
                    {t('da_portal.cartelization.win_rate', 'Win Rate:')}{' '}
                    <strong className="text-slate-800">{item.winRate}</strong>{' '}
                    {t('da_portal.cartelization.tenders_ratio', { wins: item.wins, total: item.totalBids, defaultValue: `(${item.wins}/${item.totalBids} Tenders)` })}
                  </span>
                  <span>•</span>
                  <span>
                    {t('da_portal.cartelization.total_awarded', 'Total Awarded:')}{' '}
                    <strong className="text-slate-800">{item.totalAwarded}</strong>
                  </span>
                </div>
              </div>

              <span
                className={`text-[10px] font-black px-2 py-0.5 rounded-full flex-shrink-0 ${
                  item.riskLevel === 'CRITICAL'
                    ? 'bg-red-100 text-red-800 border border-red-200'
                    : 'bg-amber-100 text-amber-800 border border-amber-200'
                }`}
              >
                {item.flagType.replace('_', ' ')}
              </span>
            </div>

            <p className="text-[11px] text-slate-600 leading-relaxed">
              {item.description}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
