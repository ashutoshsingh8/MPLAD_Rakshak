import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  X,
  FileText,
  AlertTriangle,
  CheckCircle2,
  ShieldAlert,
  Sparkles,
  BookOpen,
  ArrowRight,
  Printer,
  Download,
  Send,
} from 'lucide-react';
import { mockProposalsPipeline } from '../../mock/daDashboardData';

export default function ProposalRAGViewer({ projectId, onClose, onSanction, onReject }) {
  const { t } = useTranslation();
  if (!projectId) return null;

  const proposal = mockProposalsPipeline.find((p) => p.id === projectId) || mockProposalsPipeline[0];
  const [activeCitationTab, setActiveCitationTab] = useState('ALL');
  const [rejectReason, setRejectReason] = useState('');
  const [showRejectForm, setShowRejectForm] = useState(false);

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-xs">
      <div className="bg-white w-full max-w-5xl h-full flex flex-col shadow-2xl overflow-hidden">
        {/* Drawer Header */}
        <div className="px-6 py-4 bg-[#1f7a6b] text-white flex items-center justify-between border-b border-[#186054]">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-white/10">
              <Sparkles className="w-5 h-5 text-[#34d399]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-black uppercase tracking-wide">
                  {t('da_portal.rag_viewer.title', 'AI GUIDELINE COPILOT & PROPOSAL SCRUTINY')}
                </h2>
                <span className="px-2 py-0.5 rounded bg-white/20 text-xs font-mono font-bold">
                  {proposal.id}
                </span>
              </div>
              <p className="text-xs text-teal-100/80">
                {t('da_portal.rag_viewer.subtitle', 'Statutory NLP Evaluation against MPLADS 2023 Guidelines & Land Title Verification')}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Split Screen Body: Left = Proposal Doc, Right = AI Findings */}
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 overflow-hidden">
          {/* ── LEFT PANE: EMBEDDED PROPOSAL DOCUMENT VIEWER ── */}
          <div className="border-r border-slate-200 overflow-y-auto p-6 bg-slate-50 space-y-4 font-sans text-xs text-slate-800">
            <div className="flex items-center justify-between border-b border-slate-200 pb-2">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-slate-600" />
                <span>{t('da_portal.rag_viewer.recommendation_letter', 'Submitted MP Recommendation Letter (Form 1A)')}</span>
              </span>
              <div className="flex items-center gap-2 text-[10px] text-slate-500">
                <span className="font-mono">Ref: LOK/2026/PN/042</span>
                <span>•</span>
                <span>{t('da_portal.rag_viewer.pdf_signed', 'PDF (Digitally Signed)')}</span>
              </div>
            </div>

            {/* Official Letterhead Mock Paper */}
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
              <div className="text-center border-b border-slate-100 pb-4 space-y-1">
                <h3 className="text-sm font-black tracking-wide text-slate-900 uppercase">
                  {t('da_portal.rag_viewer.parliament_heading', 'PARLIAMENT OF INDIA • LOK SABHA')}
                </h3>
                <p className="font-bold text-xs text-slate-800">{t('da_portal.rag_viewer.office_heading', "OFFICE OF SHRI VIJAY PATIL, HON'BLE MP")}</p>
                <p className="text-[10px] text-slate-500">
                  {t('da_portal.rag_viewer.liaison_heading', 'Pune Parliamentary Constituency • Khurshid Lal Bhawan Liaison')}
                </p>
              </div>

              <div className="flex justify-between text-[11px] text-slate-600">
                <div>
                  <strong>{t('da_portal.rag_viewer.to_label', 'To: District Magistrate & Collector, Pune')}</strong>
                </div>
                <div>
                  <strong>{t('da_portal.rag_viewer.date_label', 'Date:')}</strong> {proposal.recommendedDate}
                </div>
              </div>

              <div className="p-3 bg-teal-50/50 rounded-lg border border-teal-100">
                <span className="font-bold text-slate-900">{t('da_portal.rag_viewer.subject_label', 'Subject: ')}</span>
                <span className="text-slate-800 font-semibold">{t(`da_portal.mock_assets.${proposal.id}`, proposal.assetTitle)}</span>
              </div>

              <div className="space-y-2 text-slate-700 leading-relaxed text-xs">
                <p>
                  {t('da_portal.rag_viewer.letter_body_1', 'Sir / Madam, Under Clause 3.1 of the revised MPLADS 2023 Guidelines, I hereby formally recommend the execution of the following durable capital community asset:')}
                </p>

                <div className="p-3 bg-slate-50 rounded border border-slate-200 space-y-1 font-mono text-[11px]">
                  <div>• {t('da_portal.rag_viewer.est_cost_label', 'Estimated Project Cost:')} <strong>{proposal.estCost}</strong></div>
                  <div>• {t('da_portal.rag_viewer.agency_label', 'Proposed Implementing Agency:')} <strong>{t('da_portal.rag_viewer.agency_val', 'Executive Engineer, PWD Division Pune')}</strong></div>
                  <div>• {t('da_portal.rag_viewer.location_label', 'Location:')} <strong>{t('da_portal.rag_viewer.location_val', 'Survey No. 142/B, Khed Taluka, Pune District')}</strong></div>
                  <div>• {t('da_portal.rag_viewer.beneficiary_label', 'Beneficiary Population:')} <strong>{t('da_portal.rag_viewer.beneficiary_val', 'Approx. 14,500 Rural Residents')}</strong></div>
                </div>

                <p className="text-[11px] text-slate-600 italic">
                  {t('da_portal.rag_viewer.letter_quote', '"The proposed work involves construction of clinic OPD wings, staff rest quarters, and a boundary wall enclosing the community medical campus adjacent to the Shree Khed Trust premises."')}
                </p>
              </div>

              <div className="pt-4 border-t border-slate-100 flex justify-between items-center text-[10px] text-slate-500">
                <span>{t('da_portal.rag_viewer.digisign_verified', 'Digital Signature Verified • Aadhaar e-Sign')}</span>
                <span className="font-mono text-emerald-700 font-bold">{t('da_portal.rag_viewer.valid_nic', '✓ Valid NIC Certificate')}</span>
              </div>
            </div>
          </div>

          {/* ── RIGHT PANE: AI FINDINGS & STATUTORY CLAUSE CITATIONS ── */}
          <div className="overflow-y-auto p-6 space-y-5 bg-white">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="text-xs font-black uppercase text-slate-900 tracking-wider flex items-center gap-1.5">
                  <ShieldAlert className="w-4 h-4 text-red-600" />
                  <span>{t('da_portal.rag_viewer.report_title', 'AI Scrutiny & Statutory Admissibility Report')}</span>
                </span>
                <p className="text-[11px] text-slate-500">
                  {t('da_portal.rag_viewer.report_engine', 'Google Gemini + Qdrant Guidelines RAG Engine output')}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold text-slate-500">{t('da_portal.rag_viewer.risk_score_label', 'Risk Score:')}</span>
                <span
                  className={`text-xs font-black px-2.5 py-0.5 rounded-full ${
                    proposal.riskLevel === 'HIGH'
                      ? 'bg-red-100 text-red-700 border border-red-200'
                      : 'bg-emerald-100 text-emerald-700 border border-emerald-200'
                  }`}
                >
                  {proposal.riskScore}% {proposal.riskLevel === 'HIGH' ? t('da_portal.pipeline.high_risk', 'High') : t('da_portal.pipeline.low_risk', 'Low')}
                </span>
              </div>
            </div>

            {/* Statutory Violations Feed */}
            <div className="space-y-3">
              {proposal.violations.length > 0 ? (
                proposal.violations.map((violation, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-900 space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <span className="px-2 py-0.5 rounded bg-red-200 text-red-900 font-mono text-[10px] font-black">
                        {violation.clause} • {t('da_portal.rag_viewer.prohibited_badge', 'PROHIBITED')}
                      </span>
                      <span className="text-[10px] font-bold text-red-700">{t('da_portal.rag_viewer.high_confidence', 'High Confidence (94%)')}</span>
                    </div>

                    <h4 className="text-xs font-bold text-red-900">{violation.title}</h4>

                    <p className="text-[11px] text-red-800 leading-relaxed">
                      {violation.description}
                    </p>

                    <div className="p-2.5 bg-white/80 rounded-lg border border-red-200/60 text-[10px] text-slate-700 font-mono space-y-1">
                      <div className="font-bold text-red-700">{t('da_portal.rag_viewer.guideline_ref_title', 'Official 2023 Guideline Reference:')}</div>
                      <div>
                        {t('da_portal.rag_viewer.guideline_ref_text', '"Works on land belonging to religious bodies, private trusts, or un-regularized private societies are strictly non-permissible under any circumstances." (Page 24, Clause 3.2.4)')}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 space-y-1">
                  <div className="font-bold text-xs flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>{t('da_portal.rag_viewer.no_violations_title', 'No Statutory Guideline Violations Detected')}</span>
                  </div>
                  <p className="text-[11px] text-emerald-800">
                    {t('da_portal.rag_viewer.no_violations_desc', 'The proposed asset complies with eligible sectors under MPLADS 2023 Annexure-II.')}
                  </p>
                </div>
              )}
            </div>

            {/* SLA Status Card */}
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-800">{t('da_portal.rag_viewer.countdown_title', '45-Day Statutory Countdown:')}</span>
                <span className="font-mono font-bold text-red-600">
                  {t('da_portal.rag_viewer.days_elapsed', { elapsed: proposal.daysElapsed, defaultValue: `${proposal.daysElapsed} Days Elapsed` })} ({proposal.daysRemaining < 0 ? t('da_portal.rag_viewer.days_overdue', { days: Math.abs(proposal.daysRemaining), defaultValue: `${Math.abs(proposal.daysRemaining)} Days Overdue` }) : t('da_portal.pipeline.days_left', { days: proposal.daysRemaining, defaultValue: `${proposal.daysRemaining} Days Left` })})
                </span>
              </div>
              <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                <div
                  className={`h-full ${proposal.daysElapsed > 45 ? 'bg-red-500' : 'bg-emerald-500'}`}
                  style={{ width: `${Math.min(100, (proposal.daysElapsed / 45) * 100)}%` }}
                />
              </div>
            </div>

            {/* Reject with Clause Citation Form */}
            {showRejectForm ? (
              <div className="p-4 rounded-xl bg-red-50 border border-red-200 space-y-3">
                <div className="font-bold text-xs text-red-900">
                  {t('da_portal.rag_viewer.issue_notice_title', "Issue Statutory Rejection Notice to Hon'ble MP:")}
                </div>
                <textarea
                  rows={3}
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  placeholder={t('da_portal.rag_viewer.reject_placeholder', 'Enter rejection rationale citing MPLADS 2023 Guidelines Clause...')}
                  className="w-full p-2 text-xs bg-white border border-red-200 rounded-lg text-slate-800 focus:outline-none focus:ring-1 focus:ring-red-500"
                />
                <div className="flex items-center justify-end gap-2">
                  <button
                    onClick={() => setShowRejectForm(false)}
                    className="px-3 py-1.5 bg-white border border-slate-200 text-slate-700 rounded-lg text-xs font-semibold cursor-pointer"
                  >
                    {t('da_portal.rag_viewer.cancel_btn', 'Cancel')}
                  </button>
                  <button
                    onClick={() => {
                      onReject && onReject(proposal.id, rejectReason);
                      onClose();
                    }}
                    className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-bold transition cursor-pointer"
                  >
                    {t('da_portal.rag_viewer.confirm_rejection_btn', 'Confirm Rejection')}
                  </button>
                </div>
              </div>
            ) : null}

            {/* Action Buttons Toolbar */}
            <div className="pt-4 border-t border-slate-100 flex flex-wrap items-center gap-3">
              <button
                onClick={() => {
                  onSanction && onSanction(proposal.id);
                  onClose();
                }}
                className="flex-1 py-2.5 px-4 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold transition shadow-xs cursor-pointer flex items-center justify-center gap-2"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>{t('da_portal.rag_viewer.grant_ts_btn', 'Grant Technical Sanction (AS/TS)')}</span>
              </button>

              <button
                onClick={() => {
                  setRejectReason(
                    proposal.violations.length > 0
                      ? `Proposal violates MPLADS 2023 ${proposal.violations[0].clause}: ${proposal.violations[0].title}`
                      : 'Land title verification pending.'
                  );
                  setShowRejectForm(true);
                }}
                className="py-2.5 px-4 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5"
              >
                <AlertTriangle className="w-4 h-4 text-red-600" />
                <span>{t('da_portal.rag_viewer.reject_with_citation_btn', 'Reject with Clause Citation')}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
