import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { MoreVertical, Calendar, Info, FileText, CheckCircle2, AlertCircle, MapPin, ExternalLink } from 'lucide-react';

export default function DistrictManagementCards({
  onOpenProposal,
  onOpenBoq,
  onOpenExif,
  onOpenMap,
}) {
  const { t } = useTranslation();

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
      {/* ── CARD 1: PROJECT 01 (Project Confirmation - Pending) ── */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-xs flex flex-col justify-between hover:shadow-md transition">
        <div className="space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 tracking-wider uppercase">
              {t('da_portal.cards.project_01', 'PROJECT 01')}
            </span>
            <span className="px-2.5 py-0.5 rounded-md bg-[#fef3c7] text-[#92400e] text-[11px] font-bold">
              {t('da_portal.cards.pending', 'Pending')}
            </span>
          </div>

          <h3 className="text-base font-black text-slate-900 leading-tight">
            {t('da_portal.cards.confirmation_title', 'Project Confirmation')}
          </h3>

          <p className="text-xs font-semibold text-slate-600">
            {t('da_portal.cards.confirmation_title', 'Project Confirmation')}
          </p>

          <div className="text-[11px] text-slate-500 leading-relaxed font-normal">
            <p>{t('da_portal.cards.dev_desc', 'Project development project deneliopement')}</p>
            <p>{t('da_portal.cards.nomination_cert', 'Project Domination: ovr poanment certificate...')}</p>
          </div>
        </div>

        <div className="pt-4 flex items-center gap-3">
          <button
            onClick={() => onOpenProposal && onOpenProposal('MPLAD-2026-PN-014')}
            className="flex-1 py-1.5 px-3 bg-[#e6f4f1] text-[#1f7a6b] border border-[#a3ded2] rounded-md text-xs font-bold hover:bg-[#d7eee9] transition cursor-pointer text-center"
          >
            {t('da_portal.cards.proposed', 'Proposed')}
          </button>
          <button
            onClick={() => onOpenProposal && onOpenProposal('MPLAD-2026-PN-014')}
            className="flex-1 py-1.5 px-3 bg-[#fee2e2] text-[#dc2626] border border-[#fecaca] rounded-md text-xs font-bold hover:bg-[#fdd0d0] transition cursor-pointer text-center"
          >
            {t('da_portal.cards.pending', 'Pending')}
          </button>
        </div>
      </div>

      {/* ── CARD 2: PROJECT 02 (Work Order Status - Approved [Mint Highlighted]) ── */}
      <div className="bg-[#eaf4f0] rounded-2xl p-5 border border-[#b8dfd1] shadow-xs flex flex-col justify-between hover:shadow-md transition">
        <div className="space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-700 tracking-wider uppercase">
              {t('da_portal.cards.project_02', 'PROJECT 02')}
            </span>
            <span className="px-2.5 py-0.5 rounded-md bg-[#dcfce7] text-[#166534] text-[11px] font-bold">
              {t('da_portal.cards.approved', 'Approved')}
            </span>
          </div>

          <h3 className="text-base font-black text-slate-900 leading-tight">
            {t('da_portal.cards.work_order_title', 'Work Order Status')}
          </h3>

          <p className="text-xs font-semibold text-slate-700">
            {t('da_portal.cards.project_dev', 'Project Development')}
          </p>

          <div className="text-[11px] text-slate-600 leading-relaxed font-normal">
            <p>{t('da_portal.cards.dev_desc', 'Project development project trommmanagement')}</p>
            <p>{t('da_portal.cards.nomination_cert', 'Project Domination: nu-womuralited:hutaez')}</p>
          </div>
        </div>

        <div className="pt-4 flex items-center gap-3">
          <button
            onClick={() => onOpenBoq && onOpenBoq('MPLAD-2026-PN-014')}
            className="flex-1 py-1.5 px-3 bg-[#1f7a6b] text-white rounded-md text-xs font-bold hover:bg-[#186054] transition cursor-pointer text-center shadow-xs"
          >
            {t('da_portal.cards.approved', 'Approved')}
          </button>
          <button
            onClick={() => onOpenBoq && onOpenBoq('MPLAD-2026-PN-014')}
            className="flex-1 py-1.5 px-3 bg-[#16a34a] text-white rounded-md text-xs font-bold hover:bg-[#15803d] transition cursor-pointer text-center shadow-xs"
          >
            {t('da_portal.cards.approved', 'Approved')}
          </button>
        </div>
      </div>

      {/* ── CARD 3: PROJECT 03 (Site Visit - Pending) ── */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-xs flex flex-col justify-between hover:shadow-md transition">
        <div className="space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 tracking-wider uppercase">
              {t('da_portal.cards.project_03', 'PROJECT 03')}
            </span>
            <span className="px-2.5 py-0.5 rounded-md bg-[#fef3c7] text-[#92400e] text-[11px] font-bold">
              {t('da_portal.cards.pending', 'Pending')}
            </span>
          </div>

          <h3 className="text-base font-black text-slate-900 leading-tight">
            {t('da_portal.cards.site_visit_title', 'Site Visit')}
          </h3>

          <p className="text-xs font-semibold text-slate-600">
            {t('da_portal.cards.project_mgmt', 'Project Management')}
          </p>

          <div className="text-[11px] text-slate-500 leading-relaxed font-normal">
            <p>{t('da_portal.cards.dev_desc', 'Project development project aamlingement')}</p>
            <p>{t('da_portal.cards.nomination_cert', 'Project Domination: ovr poanment certifiicate...')}</p>
          </div>
        </div>

        <div className="pt-4 flex items-center gap-3">
          <button
            onClick={() => onOpenExif && onOpenExif('MPLAD-2026-PN-018')}
            className="flex-1 py-1.5 px-3 bg-[#e6f4f1] text-[#1f7a6b] border border-[#a3ded2] rounded-md text-xs font-bold hover:bg-[#d7eee9] transition cursor-pointer text-center"
          >
            {t('da_portal.cards.proposed', 'Proposed')}
          </button>
          <button
            onClick={() => onOpenExif && onOpenExif('MPLAD-2026-PN-018')}
            className="flex-1 py-1.5 px-3 bg-[#fee2e2] text-[#dc2626] border border-[#fecaca] rounded-md text-xs font-bold hover:bg-[#fdd0d0] transition cursor-pointer text-center"
          >
            {t('da_portal.cards.pending', 'Pending')}
          </button>
        </div>
      </div>

      {/* ── CARD 4: PROJECT 01 (Row 2 Col 1: Site Visit - Projected & Pending) ── */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-xs flex flex-col justify-between hover:shadow-md transition">
        <div className="space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 tracking-wider uppercase">
              {t('da_portal.cards.project_01', 'PROJECT 01')}
            </span>
            <span className="px-2.5 py-0.5 rounded-md bg-[#fef3c7] text-[#92400e] text-[11px] font-bold">
              {t('da_portal.cards.pending', 'Pending')}
            </span>
          </div>

          <h3 className="text-base font-black text-slate-900 leading-tight">
            {t('da_portal.cards.site_visit_title', 'Site Visit')}
          </h3>

          <p className="text-xs font-semibold text-slate-600">
            {t('da_portal.cards.confirmation_title', 'Project Confirmation')}
          </p>

          <div className="text-[11px] text-slate-500 leading-relaxed font-normal">
            <p>{t('da_portal.cards.dev_desc', 'Project denfirmatiion project denaitmenoed')}</p>
            <p>{t('da_portal.cards.nomination_cert', 'proinnarmmunifanvi ovr utilization certificate...')}</p>
          </div>
        </div>

        <div className="pt-4 flex items-center gap-3">
          <button
            onClick={() => onOpenProposal && onOpenProposal('MPLAD-2026-PN-022')}
            className="flex-1 py-1.5 px-3 bg-[#e6f4f1] text-[#1f7a6b] border border-[#a3ded2] rounded-md text-xs font-bold hover:bg-[#d7eee9] transition cursor-pointer text-center"
          >
            {t('da_portal.cards.projected', 'Projected')}
          </button>
          <button
            onClick={() => onOpenProposal && onOpenProposal('MPLAD-2026-PN-022')}
            className="flex-1 py-1.5 px-3 bg-[#fee2e2] text-[#dc2626] border border-[#fecaca] rounded-md text-xs font-bold hover:bg-[#fdd0d0] transition cursor-pointer text-center"
          >
            {t('da_portal.cards.pending', 'Pending')}
          </button>
        </div>
      </div>

      {/* ── CARD 5: PROJECT 03 (Row 2 Col 2: Site Inspections - Approved) ── */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-xs flex flex-col justify-between hover:shadow-md transition">
        <div className="space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 tracking-wider uppercase">
              {t('da_portal.cards.project_03', 'PROJECT 03')}
            </span>
            <span className="px-2.5 py-0.5 rounded-md bg-[#dcfce7] text-[#166534] text-[11px] font-bold">
              {t('da_portal.cards.approved', 'Approved')}
            </span>
          </div>

          <h3 className="text-base font-black text-slate-900 leading-tight">
            {t('da_portal.cards.site_inspections_title', 'Site Inspections')}
          </h3>

          <p className="text-xs font-semibold text-slate-600">
            {t('da_portal.cards.project_dev', 'Project Densineserment')}
          </p>

          <div className="flex items-center gap-4 text-[11px] text-slate-500 pt-1">
            <span className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              <span>{t('da_portal.cards.dev_desc', 'Uittzir pean')}</span>
            </span>
            <span className="flex items-center gap-1.5">
              <Info className="w-3.5 h-3.5 text-slate-400" />
              <span>{t('da_portal.cards.nomination_cert', 'Project status')}</span>
            </span>
          </div>
        </div>

        <div className="pt-4 flex items-center gap-3">
          <button
            onClick={() => onOpenExif && onOpenExif('MPLAD-2026-PN-018')}
            className="flex-1 py-1.5 px-3 bg-white text-[#1f7a6b] border border-[#1f7a6b] rounded-md text-xs font-bold hover:bg-[#e6f4f1] transition cursor-pointer text-center"
          >
            {t('da_portal.cards.approved', 'Approved')}
          </button>
          <button
            onClick={() => onOpenExif && onOpenExif('MPLAD-2026-PN-018')}
            className="flex-1 py-1.5 px-3 bg-[#16a34a] text-white rounded-md text-xs font-bold hover:bg-[#15803d] transition cursor-pointer text-center shadow-xs"
          >
            {t('da_portal.cards.approved', 'Approved')}
          </button>
        </div>
      </div>

      {/* ── CARD 6: LOCAL MAPS (Row 2 Col 3: Real Leaflet Map with Custom Pin) ── */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-xs flex flex-col justify-between overflow-hidden hover:shadow-md transition">
        <div className="flex items-center justify-between pb-2">
          <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
            <MapPin className="w-4 h-4 text-[#1f7a6b]" />
            <span>{t('da_portal.cards.local_maps', 'LOCAL MAPS')}</span>
          </h3>
          <button
            onClick={onOpenMap}
            className="text-[11px] font-bold text-[#1f7a6b] hover:underline flex items-center gap-1 cursor-pointer"
          >
            <span>{t('da_portal.cards.expand_map', 'Expand')}</span>
            <ExternalLink className="w-3 h-3" />
          </button>
        </div>

        {/* Map Preview matching reference screenshot media_1788984565280.png */}
        <div
          onClick={onOpenMap}
          className="rounded-xl overflow-hidden h-44 relative border border-slate-200 shadow-inner bg-[#eef3ef] cursor-pointer group"
        >
          {/* Vector Map Illustration */}
          <svg viewBox="0 0 400 240" className="w-full h-full object-cover">
            {/* Base land background */}
            <rect width="400" height="240" fill="#f4f4ec" />

            {/* River / Water body on east */}
            <path
              d="M 320 0 C 340 50, 360 80, 400 110 L 400 240 L 290 240 C 310 180, 330 160, 310 120 C 300 90, 310 40, 320 0 Z"
              fill="#cce2f4"
            />
            {/* Green park / nature patch */}
            <path
              d="M 330 180 C 350 170, 380 185, 390 210 C 370 230, 340 225, 330 180 Z"
              fill="#d4ebd2"
            />

            {/* White minor street grid */}
            <path d="M 0 40 L 320 40" stroke="#ffffff" strokeWidth="4" />
            <path d="M 0 90 L 300 90" stroke="#ffffff" strokeWidth="3" />
            <path d="M 0 140 L 280 140" stroke="#ffffff" strokeWidth="3.5" />
            <path d="M 0 190 L 290 190" stroke="#ffffff" strokeWidth="4" />
            <path d="M 60 0 L 60 240" stroke="#ffffff" strokeWidth="3.5" />
            <path d="M 120 0 L 120 240" stroke="#ffffff" strokeWidth="3" />
            <path d="M 180 0 L 180 240" stroke="#ffffff" strokeWidth="4" />
            <path d="M 240 0 L 240 240" stroke="#ffffff" strokeWidth="3.5" />

            {/* Yellow / Orange Primary Arterial Highway (curving diagonally) */}
            <path
              d="M 20 180 L 120 175 L 200 160 L 240 140 L 280 110 L 340 50 L 380 0"
              stroke="#f6c268"
              strokeWidth="7"
              fill="none"
              strokeLinecap="round"
            />
            <path
              d="M 20 180 L 120 175 L 200 160 L 240 140 L 280 110 L 340 50 L 380 0"
              stroke="#ffffff"
              strokeWidth="3"
              fill="none"
              strokeLinecap="round"
            />

            {/* Secondary Yellow Highway Branch (going south-east) */}
            <path
              d="M 240 140 L 260 170 L 300 210 L 340 240"
              stroke="#f6c268"
              strokeWidth="6"
              fill="none"
              strokeLinecap="round"
            />

            {/* Route Shield Badges (Red & Orange) */}
            <rect x="230" y="175" width="14" height="12" rx="2" fill="#ef4444" />
            <text x="237" y="184" fill="#ffffff" fontSize="8" fontWeight="bold" textAnchor="middle">8</text>

            <circle cx="218" cy="136" r="7" fill="#f97316" />
            <text x="218" y="139" fill="#ffffff" fontSize="8" fontWeight="bold" textAnchor="middle">11</text>

            <circle cx="348" cy="150" r="7" fill="#f97316" />
            <text x="348" y="153" fill="#ffffff" fontSize="8" fontWeight="bold" textAnchor="middle">9</text>

            {/* Neighborhood Labels matching reference screenshot */}
            <text x="15" y="150" fill="#78716c" fontSize="10" fontWeight="bold">Baat-baca</text>
            <text x="340" y="40" fill="#78716c" fontSize="9" fontWeight="bold">BANNAINFARHN</text>
            <text x="240" y="205" fill="#78716c" fontSize="9" fontWeight="bold">Varal Bahal</text>
            <text x="350" y="170" fill="#78716c" fontSize="9" fontWeight="bold">Damibogs</text>
            <text x="345" y="228" fill="#15803d" fontSize="9" fontWeight="bold">Koaparid Udamt</text>

            {/* Prominent Dark Teal Pin at Centroid */}
            <g transform="translate(230, 115)">
              {/* Drop Shadow */}
              <ellipse cx="14" cy="38" rx="7" ry="3" fill="#000000" opacity="0.2" />
              {/* Pin Path */}
              <path
                d="M 14 0 C 6 0 0 6 0 14 C 0 23 11 34 13 36 C 13.5 36.5 14.5 36.5 15 36 C 17 34 28 23 28 14 C 28 6 22 0 14 0 Z"
                fill="#134e43"
                stroke="#ffffff"
                strokeWidth="2"
              />
              <circle cx="14" cy="14" r="5" fill="#ffffff" />
            </g>
          </svg>

          {/* Map Branding Overlay matching reference screenshot */}
          <div className="absolute bottom-1 left-2 text-[10px] font-bold text-slate-600 tracking-tight select-none">
            <span className="text-[#4285f4]">G</span>
            <span className="text-[#ea4335]">o</span>
            <span className="text-[#fbbc05]">o</span>
            <span className="text-[#4285f4]">g</span>
            <span className="text-[#34a853]">l</span>
            <span className="text-[#ea4335]">e</span>
          </div>

          <div className="absolute bottom-1 right-2 bg-white/80 backdrop-blur-xs px-1.5 py-0.5 rounded text-[8px] text-slate-500 font-mono border border-slate-200/60">
            Map data ©2026 Google
          </div>

          {/* Hover hint */}
          <div className="absolute inset-0 bg-teal-900/10 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
            <span className="px-3 py-1 bg-slate-900/80 backdrop-blur-xs text-white text-[11px] font-bold rounded-lg shadow-sm">
              {t('da_portal.cards.click_open_gis', 'Click to Open Full GIS Proximity Radar')}
            </span>
          </div>
        </div>
      </div>

      {/* ── CARD 7: PROJECT 017 (Row 3 Col 1: Project Contract Management) ── */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-xs flex flex-col justify-between hover:shadow-md transition">
        <div className="space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 tracking-wider uppercase">
              {t('da_portal.cards.project_017', 'PROJECT 017')}
            </span>
            <button className="text-slate-400 hover:text-slate-600 p-1 rounded hover:bg-slate-100 transition cursor-pointer">
              <MoreVertical className="w-4 h-4" />
            </button>
          </div>

          <h3 className="text-base font-black text-slate-900 leading-tight">
            {t('da_portal.cards.contract_mgmt_title', 'Project Contract Management')}
          </h3>

          <p className="text-xs font-semibold text-slate-600">
            {t('da_portal.cards.project_dev', 'Project Domintion')}
          </p>

          <div className="flex items-center gap-4 text-[11px] text-slate-500 pt-1">
            <span className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              <span>{t('da_portal.cards.dev_desc', 'Project plate')}</span>
            </span>
            <span className="flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-slate-400" />
              <span>{t('da_portal.cards.nomination_cert', 'Approvement')}</span>
            </span>
          </div>
        </div>

        <div className="pt-4">
          <button
            onClick={() => onOpenBoq && onOpenBoq('MPLAD-2026-PN-014')}
            className="w-full py-1.5 px-3 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 rounded-md text-xs font-bold transition cursor-pointer text-center"
          >
            {t('da_portal.cards.review_contracts_btn', 'Review Tender Contracts')}
          </button>
        </div>
      </div>

      {/* ── CARD 8: LOCAL MAPS (Row 3 Col 2: Utilization Certificate) ── */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-xs flex flex-col justify-between hover:shadow-md transition">
        <div className="space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 tracking-wider uppercase">
              {t('da_portal.cards.local_maps', 'LOCAL MAPS')}
            </span>
            <button className="text-slate-400 hover:text-slate-600 p-1 rounded hover:bg-slate-100 transition cursor-pointer">
              <MoreVertical className="w-4 h-4" />
            </button>
          </div>

          <h3 className="text-base font-black text-slate-900 leading-tight">
            {t('da_portal.cards.utilization_cert_title', 'Utilization Certificate')}
          </h3>

          <p className="text-xs font-semibold text-slate-600">
            {t('da_portal.cards.project_dev', 'Project Project Imnet / Project')}
          </p>

          <div className="flex items-center gap-4 text-[11px] text-slate-500 pt-1">
            <span className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              <span>{t('da_portal.cards.dev_desc', 'Project plate')}</span>
            </span>
            <span className="flex items-center gap-1.5">
              <Info className="w-3.5 h-3.5 text-slate-400" />
              <span>{t('da_portal.cards.nomination_cert', 'Approved next')}</span>
            </span>
          </div>
        </div>

        <div className="pt-4">
          <button
            onClick={() => onOpenProposal && onOpenProposal('MPLAD-2026-PN-014')}
            className="w-full py-1.5 px-3 bg-[#e6f4f1] hover:bg-[#d5eee8] border border-[#a3ded2] text-[#1f7a6b] rounded-md text-xs font-bold transition cursor-pointer text-center"
          >
            {t('da_portal.cards.inspect_uc_btn', 'Inspect Milestone UC (Form III)')}
          </button>
        </div>
      </div>
    </div>
  );
}
