import { useTranslation } from 'react-i18next';
import {
  ResponsiveContainer,
  ComposedChart,
  Area,
  Bar,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
import { mockPaymentStatusesTimeline } from '../../mock/contractorDashboardData';

export default function PaymentStatusChart() {
  const { t } = useTranslation();

  const formatYAxis = (val) => {
    if (val === 0) return '0';
    return `₹ ${(val / 1000).toFixed(0)}k`;
  };

  return (
    <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs space-y-3">
      {/* Header & Legend matching reference image */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <h3 className="text-sm sm:text-base font-black uppercase text-slate-800 tracking-wide">
          {t('contractor_portal.payment_statuses_title', 'PAYMENT STATUSES')}
        </h3>

        <div className="flex items-center gap-5 text-xs font-semibold">
          <span className="flex items-center gap-1.5 text-slate-700">
            <span className="w-2.5 h-2.5 bg-[#2b7a82] rounded-xs" />
            <span>{t('contractor_portal.in_progress_legend', 'In Progress')}</span>
          </span>
          <span className="flex items-center gap-1.5 text-slate-700">
            <span className="w-2.5 h-2.5 bg-[#a85016] rounded-xs" />
            <span>{t('contractor_portal.phase_legend', 'Phase')}</span>
          </span>
        </div>
      </div>

      {/* Recharts Composed Chart */}
      <div className="h-72 w-full">
        <ResponsiveContainer width="100%" height={280}>
          <ComposedChart
            data={mockPaymentStatusesTimeline}
            margin={{ top: 15, right: 15, left: -10, bottom: 5 }}
          >
            <defs>
              <linearGradient id="contractorTealGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#2b7a82" stopOpacity={0.35} />
                <stop offset="95%" stopColor="#2b7a82" stopOpacity={0.02} />
              </linearGradient>
            </defs>

            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />

            <XAxis
              dataKey="month"
              tick={{ fontSize: 11, fill: '#64748b', fontWeight: 500 }}
              axisLine={{ stroke: '#cbd5e1' }}
              tickLine={false}
            />

            <YAxis
              tickFormatter={formatYAxis}
              domain={[0, 20000]}
              ticks={[0, 5000, 10000, 15000, 20000]}
              tick={{ fontSize: 11, fill: '#64748b', fontWeight: 500 }}
              axisLine={{ stroke: '#cbd5e1' }}
              tickLine={false}
            />

            <Tooltip
              content={({ active, payload, label }) => {
                if (!active || !payload || !payload.length) return null;
                return (
                  <div className="bg-slate-900 text-white p-2.5 rounded-lg text-xs shadow-xl border border-slate-700 space-y-1">
                    <div className="font-bold text-amber-300">{label}</div>
                    <div className="flex items-center justify-between gap-3 text-teal-300">
                      <span>{t('contractor_portal.in_progress_tooltip', 'In Progress:')}</span>
                      <strong className="font-mono">₹{payload[0]?.value?.toLocaleString()}</strong>
                    </div>
                    <div className="flex items-center justify-between gap-3 text-orange-300">
                      <span>{t('contractor_portal.phase_expenditure_tooltip', 'Phase Expenditure:')}</span>
                      <strong className="font-mono">₹{payload[1]?.value?.toLocaleString()}</strong>
                    </div>
                  </div>
                );
              }}
            />

            {/* Smooth projected cost Area curve */}
            <Area
              type="monotone"
              dataKey="projectedCost"
              stroke="#2b7a82"
              strokeWidth={2}
              fill="url(#contractorTealGrad)"
              isAnimationActive={false}
            />

            {/* Bar: In Progress (Teal) */}
            <Bar
              dataKey="inProgress"
              fill="#2b7a82"
              barSize={12}
              radius={[2, 2, 0, 0]}
              isAnimationActive={false}
            />

            {/* Bar: Phase (Rust Orange) */}
            <Bar
              dataKey="phase"
              fill="#a85016"
              barSize={12}
              radius={[2, 2, 0, 0]}
              isAnimationActive={false}
            />

            {/* Line curve connecting Phase payments */}
            <Line
              type="monotone"
              dataKey="actualCost"
              stroke="#a85016"
              strokeWidth={2}
              dot={false}
              isAnimationActive={false}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
