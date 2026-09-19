import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { X, FileSpreadsheet, CheckCircle2, AlertTriangle, IndianRupee, ShieldCheck } from 'lucide-react';

export default function BOQSubmissionModal({ onClose, onSubmitInvoice }) {
  const { t } = useTranslation();
  const [invoiceRef, setInvoiceRef] = useState('INV-2026-074');
  const [selectedProject, setSelectedProject] = useState('MPLAD-2026-PN-022');
  const [milestone, setMilestone] = useState('Milestone 2: Sub-base & WMM Layer');
  const [amount, setAmount] = useState('14.80');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      onSubmitInvoice &&
        onSubmitInvoice({
          invoiceNo: invoiceRef,
          projectUid: selectedProject,
          claimedAmount: `₹${amount} Lakh`,
          milestone,
        });
      onClose();
    }, 500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-xl w-full flex flex-col overflow-hidden border border-slate-200">
        {/* Header */}
        <div className="px-6 py-4 bg-[#d96b1b] text-white flex items-center justify-between border-b border-[#b8540d]">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-white/10">
              <FileSpreadsheet className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-base font-black uppercase tracking-wide">
                {t('contractor_portal.boq_modal_title', 'SUBMIT MILESTONE INVOICE BILL (FORM-IV)')}
              </h3>
              <p className="text-xs text-amber-100/90 font-medium">
                {t('contractor_portal.boq_modal_subtitle', 'Bill of Quantities & CPWD Schedule of Rates Compliance')}
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

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          <div>
            <label className="block font-bold text-slate-800 mb-1">
              {t('contractor_portal.select_contract_work', 'Select Active Contract Work:')}
            </label>
            <select
              value={selectedProject}
              onChange={(e) => setSelectedProject(e.target.value)}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#d96b1b]"
            >
              <option value="MPLAD-2026-PN-022">
                MPLAD-2026-PN-022 — {t('contractor_portal.mock_works.work-01', 'Construction of New Link Road (Velhe)')}
              </option>
              <option value="MPLAD-2026-PN-018">
                MPLAD-2026-PN-018 — {t('contractor_portal.mock_works.work-02', 'Construction of New Road (Shirur)')}
              </option>
              <option value="MPLAD-2026-PN-014">
                MPLAD-2026-PN-014 — {t('contractor_portal.mock_works.work-03', 'Construction of Project Road (Khed)')}
              </option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-800 mb-1">
                {t('contractor_portal.invoice_ref_no', 'Invoice Reference No:')}
              </label>
              <input
                type="text"
                value={invoiceRef}
                onChange={(e) => setInvoiceRef(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg font-mono text-slate-800"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-800 mb-1">
                {t('contractor_portal.claim_amount_label', 'Claim Amount (₹ Lakh):')}
              </label>
              <input
                type="number"
                step="0.1"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg font-mono font-bold text-slate-900"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-800 mb-1">
              {t('contractor_portal.milestone_desc_label', 'Milestone Description:')}
            </label>
            <input
              type="text"
              value={milestone}
              onChange={(e) => setMilestone(e.target.value)}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800"
            />
          </div>

          <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-[11px] text-amber-900 space-y-1">
            <div className="font-bold flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-amber-700" />
              <span>{t('contractor_portal.sor_notice_title', 'CPWD SoR Rate Cap Notice')}</span>
            </div>
            <p>
              {t('contractor_portal.sor_notice_desc', 'Invoices will be automatically cross-checked by District Authority AI against CPWD Schedule of Rates. Unit cost inflation above 10% will be rejected automatically.')}
            </p>
          </div>

          {/* Footer */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-semibold cursor-pointer"
            >
              {t('rag_viewer.cancel_btn', 'Cancel')}
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 bg-[#d96b1b] hover:bg-[#b8540d] text-white rounded-lg font-bold transition shadow-xs cursor-pointer"
            >
              {isSubmitting
                ? t('contractor_portal.submitting_invoice_btn', 'Submitting Invoice...')
                : t('contractor_portal.submit_to_da_btn', 'Submit to District Authority')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
