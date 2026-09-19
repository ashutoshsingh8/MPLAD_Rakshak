import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { X, ShieldAlert, Upload, CheckCircle2, MapPin } from 'lucide-react';
import { STATE_DISTRICTS, getLocalizedState, getLocalizedDistrict } from '../utils/geoTranslations';
import { getLocalizedProjectTitle } from '../utils/projectTranslations';

export default function ReportFraudModal({ isOpen, onClose, targetProject = null, allProjects = [] }) {
  const { t, i18n } = useTranslation();
  const currentLang = i18n.language ? i18n.language.split('-')[0] : 'en';

  const [selectedState, setSelectedState] = useState('Maharashtra');
  const [selectedDistrict, setSelectedDistrict] = useState('Pune');
  const [isCustomDistrict, setIsCustomDistrict] = useState(false);
  const [customDistrict, setCustomDistrict] = useState('');

  const [selectedProjectUid, setSelectedProjectUid] = useState('');
  const [isCustomProject, setIsCustomProject] = useState(false);
  const [customProjectTitle, setCustomProjectTitle] = useState('');

  const [category, setCategory] = useState('WORK_NOT_FOUND');
  const [description, setDescription] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [photoName, setPhotoName] = useState('');
  const [grievanceRef, setGrievanceRef] = useState('');

  useEffect(() => {
    if (targetProject) {
      const st = targetProject.state || 'Maharashtra';
      const dist = targetProject.district || 'Pune';
      setSelectedState(st);
      setSelectedDistrict(dist);
      setIsCustomDistrict(false);
      setCustomDistrict('');
      setSelectedProjectUid(targetProject.project_uid || (targetProject.id ? `PRJ-${targetProject.id}` : ''));
      setIsCustomProject(false);
      setCustomProjectTitle('');
    } else {
      setSelectedState('Maharashtra');
      setSelectedDistrict('Pune');
      setIsCustomDistrict(false);
      setCustomDistrict('');
      setSelectedProjectUid('');
      setIsCustomProject(false);
      setCustomProjectTitle('');
    }
  }, [targetProject, isOpen]);

  if (!isOpen) return null;

  // Filter projects for selected state & district
  const effectiveDistrict = isCustomDistrict ? customDistrict : selectedDistrict;
  const districtProjects = allProjects.filter((p) => {
    const stateMatch = p.state === selectedState;
    if (isCustomDistrict) return stateMatch;
    return stateMatch && p.district?.toLowerCase() === selectedDistrict.toLowerCase();
  });

  // Determine active project title
  let activeProject = null;
  if (targetProject) {
    activeProject = targetProject;
  } else if (selectedProjectUid && !isCustomProject) {
    activeProject = allProjects.find(
      (p) => p.project_uid === selectedProjectUid || String(p.id) === selectedProjectUid
    );
  }

  const localizedActiveTitle = activeProject
    ? getLocalizedProjectTitle(activeProject, currentLang)
    : customProjectTitle;

  const handleStateChange = (newState) => {
    setSelectedState(newState);
    const districtsForState = STATE_DISTRICTS[newState] || ['Pune'];
    setSelectedDistrict(districtsForState[0] || '');
    setIsCustomDistrict(false);
    setCustomDistrict('');
    setSelectedProjectUid('');
    setIsCustomProject(false);
  };

  const handleDistrictChange = (val) => {
    if (val === 'OTHER') {
      setIsCustomDistrict(true);
      setCustomDistrict('');
    } else {
      setIsCustomDistrict(false);
      setSelectedDistrict(val);
    }
    setSelectedProjectUid('');
    setIsCustomProject(false);
  };

  const handleProjectSelect = (val) => {
    if (val === 'CUSTOM') {
      setIsCustomProject(true);
      setSelectedProjectUid('');
    } else {
      setIsCustomProject(false);
      setSelectedProjectUid(val);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const ref = `GRV-2026-${Math.floor(100000 + Math.random() * 900000)}`;
    setGrievanceRef(ref);
    setSubmitted(true);
  };

  const handleReset = () => {
    setSubmitted(false);
    setDescription('');
    setPhotoName('');
    setGrievanceRef('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="absolute inset-0" onClick={onClose} />

      <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden z-10 animate-scale-up max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-red-700 via-rose-700 to-red-800 px-6 py-4 flex items-center justify-between text-white shrink-0 shadow-sm">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 bg-white/15 rounded-lg border border-white/20">
              <ShieldAlert className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <span className="text-sm font-bold tracking-wide uppercase block leading-tight">
                {t('modals.report_fraud_title', 'Citizen Fraud & Anomaly Reporting')}
              </span>
              <span className="text-[10px] text-red-100 font-medium">
                MPLADS Statutory Public Oversight Channel
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-white/80 hover:text-white hover:bg-white/15 transition cursor-pointer"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto space-y-4">
          {submitted ? (
            <div className="py-6 text-center space-y-4">
              <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <div>
                <h3 className="text-lg sm:text-xl font-bold text-slate-800">
                  {t('modals.report_submitted', 'Grievance Dispatched Successfully!')}
                </h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
                  {t('modals.report_desc', 'Your report has been securely registered in the audit queue and routed to District Authorities.')}
                </p>
              </div>

              {/* Submission Receipt Pill */}
              <div className="bg-slate-50 rounded-xl p-4 border border-slate-200/80 text-left space-y-2 text-xs">
                <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                  <span className="text-slate-500 font-medium">Reference ID:</span>
                  <span className="font-mono font-bold text-red-700 bg-red-50 px-2 py-0.5 rounded border border-red-200">
                    {grievanceRef}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 font-medium">{t('modals.project_title_label', 'Project')}:</span>
                  <span className="font-bold text-slate-800 text-right max-w-[220px] truncate">
                    {localizedActiveTitle || customProjectTitle || 'General Project'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 font-medium">{t('modals.state_label', 'State')}:</span>
                  <span className="font-semibold text-slate-700">
                    {getLocalizedState(selectedState, currentLang)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 font-medium">{t('modals.district_label', 'District')}:</span>
                  <span className="font-semibold text-slate-700">
                    {getLocalizedDistrict(effectiveDistrict, currentLang)}
                  </span>
                </div>
              </div>

              <button
                onClick={handleReset}
                className="mt-2 px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold uppercase tracking-wider transition cursor-pointer shadow-md"
              >
                {t('projects_page.back_home', 'Done')}
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <p className="text-xs text-slate-500 leading-relaxed">
                {t('portal.oversight_desc', 'Direct citizen channel to report ghost works, private property misuse, substandard materials, or inflated project costs under MPLADS.')}
              </p>

              {/* ── Verified Target Project Card (If opened from a specific project) ── */}
              {targetProject && (
                <div className="bg-amber-50/70 border border-amber-200 rounded-xl p-3.5 space-y-1.5 text-xs animate-fade-in">
                  <div className="flex items-center justify-between">
                    <span className="inline-flex items-center gap-1 font-bold text-amber-800 text-[11px] uppercase tracking-wider">
                      <ShieldAlert className="w-3.5 h-3.5 text-amber-600" />
                      {t('modals.verified_target_project', 'Verified Scheme Project')}
                    </span>
                    <span className="font-mono font-bold text-slate-700 bg-white px-2 py-0.5 rounded border border-amber-200 shadow-2xs">
                      {targetProject.project_uid || `PRJ-${targetProject.id}`}
                    </span>
                  </div>
                  <h4 className="font-bold text-slate-900 leading-snug">
                    {getLocalizedProjectTitle(targetProject, currentLang)}
                  </h4>
                  <div className="flex items-center gap-2 text-[11px] text-slate-600">
                    <MapPin className="w-3 h-3 text-teal-600 shrink-0" />
                    <span>
                      {getLocalizedDistrict(targetProject.district, currentLang)}, {getLocalizedState(targetProject.state, currentLang)}
                    </span>
                  </div>
                </div>
              )}

              {/* ── State & District Dropdowns in Selected Language ── */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* State Dropdown */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    {t('modals.state_label', 'State')}
                  </label>
                  <select
                    value={selectedState}
                    onChange={(e) => handleStateChange(e.target.value)}
                    disabled={!!targetProject}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg text-slate-800 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-red-600 disabled:opacity-75 disabled:cursor-not-allowed transition"
                  >
                    {Object.keys(STATE_DISTRICTS).map((st) => (
                      <option key={st} value={st}>
                        {getLocalizedState(st, currentLang)}
                      </option>
                    ))}
                  </select>
                </div>

                {/* District Dropdown */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    {t('modals.district_label', 'District')}
                  </label>
                  {targetProject ? (
                    <input
                      type="text"
                      readOnly
                      value={getLocalizedDistrict(targetProject.district, currentLang)}
                      className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg text-slate-700 bg-slate-100 font-semibold cursor-not-allowed"
                    />
                  ) : (
                    <select
                      value={isCustomDistrict ? 'OTHER' : selectedDistrict}
                      onChange={(e) => handleDistrictChange(e.target.value)}
                      className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg text-slate-800 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-red-600 transition"
                    >
                      {(STATE_DISTRICTS[selectedState] || []).map((dist) => (
                        <option key={dist} value={dist}>
                          {getLocalizedDistrict(dist, currentLang)}
                        </option>
                      ))}
                      <option value="OTHER">{t('modals.other_district', 'Other / Custom District')}</option>
                    </select>
                  )}
                </div>
              </div>

              {/* Custom District Input if "OTHER" selected */}
              {!targetProject && isCustomDistrict && (
                <div className="animate-fade-in">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    {t('modals.enter_district', 'Enter District Name')} *
                  </label>
                  <input
                    type="text"
                    value={customDistrict}
                    onChange={(e) => setCustomDistrict(e.target.value)}
                    placeholder="e.g. Kolhapur, Solapur, etc."
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-red-600"
                    required
                  />
                </div>
              )}

              {/* ── Project Selection / Custom Input in Selected Language ── */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  {t('modals.project_title_label', 'Project Title / UID')} *
                </label>

                {targetProject ? (
                  <input
                    type="text"
                    readOnly
                    value={`${getLocalizedProjectTitle(targetProject, currentLang)} (${targetProject.project_uid || `PRJ-${targetProject.id}`})`}
                    className="w-full px-3 py-2 text-xs sm:text-sm border border-slate-300 rounded-lg text-slate-700 bg-slate-100 font-medium cursor-not-allowed"
                  />
                ) : districtProjects.length > 0 && !isCustomProject ? (
                  <div className="space-y-1.5">
                    <select
                      value={selectedProjectUid}
                      onChange={(e) => handleProjectSelect(e.target.value)}
                      className="w-full px-3 py-2 text-xs sm:text-sm border border-slate-300 rounded-lg text-slate-800 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-red-600 transition"
                      required={!isCustomProject && !customProjectTitle}
                    >
                      <option value="">-- {t('modals.select_project', 'Select Project from District...')} --</option>
                      {districtProjects.map((p) => (
                        <option key={p.project_uid || p.id} value={p.project_uid || String(p.id)}>
                          {getLocalizedProjectTitle(p, currentLang)} ({p.project_uid || `PRJ-${p.id}`})
                        </option>
                      ))}
                      <option value="CUSTOM">{t('modals.unlisted_project', 'Other / Unlisted Project (Enter Manually)')}</option>
                    </select>

                    <button
                      type="button"
                      onClick={() => setIsCustomProject(true)}
                      className="text-[11px] text-teal-700 hover:underline flex items-center gap-1 cursor-pointer font-medium"
                    >
                      <span>+ {t('modals.unlisted_project', 'Other / Unlisted Project (Enter Manually)')}</span>
                    </button>
                  </div>
                ) : (
                  <div className="space-y-1.5">
                    <input
                      type="text"
                      value={customProjectTitle}
                      onChange={(e) => setCustomProjectTitle(e.target.value)}
                      placeholder="e.g. Construction of Culvert at Link Road or School Boundary Wall"
                      className="w-full px-3 py-2 text-xs sm:text-sm border border-slate-300 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-red-600"
                      required
                    />
                    {districtProjects.length > 0 && (
                      <button
                        type="button"
                        onClick={() => {
                          setIsCustomProject(false);
                          setSelectedProjectUid('');
                        }}
                        className="text-[11px] text-teal-700 hover:underline cursor-pointer font-medium"
                      >
                        &larr; {t('modals.select_project', 'Select Project from District...')}
                      </button>
                    )}
                  </div>
                )}
              </div>

              {/* Anomaly Category */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  {t('modals.category_label', 'Anomaly / Fraud Category')}
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg text-slate-800 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-red-600 transition"
                >
                  <option value="WORK_NOT_FOUND">{t('modals.cat_work_not_started', 'No Work on Ground (Ghost Project)')}</option>
                  <option value="PRIVATE_ASSET">{t('modals.cat_private_property', 'Work on Private Property (Inadmissible)')}</option>
                  <option value="SUBSTANDARD">{t('modals.cat_substandard', 'Substandard Construction Quality')}</option>
                  <option value="DUPLICATE">{t('modals.cat_duplicate', 'Duplicate / Ghost Project')}</option>
                  <option value="OTHER">{t('modals.cat_other', 'Other Guideline Violation')}</option>
                </select>
              </div>

              {/* Description & Evidence */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  {t('modals.desc_label', 'Description & Ground Evidence')}
                </label>
                <textarea
                  rows="3"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder={t('modals.desc_placeholder', 'Provide exact details, date noticed, and why you believe guidelines were violated...')}
                  className="w-full px-3 py-2 text-xs sm:text-sm border border-slate-300 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-red-600"
                  required
                />
              </div>

              {/* Photo Upload Box */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  {t('modals.photo_label', 'Attach Photo Evidence (Geo-tagged preferred)')}
                </label>
                <div className="border-2 border-dashed border-slate-300 hover:border-red-500 rounded-xl p-3.5 text-center cursor-pointer transition bg-slate-50">
                  <input
                    type="file"
                    id="fraudPhoto"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      if (e.target.files?.[0]) setPhotoName(e.target.files[0].name);
                    }}
                  />
                  <label htmlFor="fraudPhoto" className="cursor-pointer flex flex-col items-center justify-center gap-1">
                    <Upload className="w-5 h-5 text-slate-400" />
                    <span className="text-xs text-slate-600 font-medium">
                      {photoName ? photoName : t('modals.choose_photo', 'Upload geo-tagged site photo (optional)')}
                    </span>
                    <span className="text-[10px] text-slate-400">JPG, PNG up to 10MB</span>
                  </label>
                </div>
              </div>

              {/* Modal Action Buttons */}
              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition cursor-pointer"
                >
                  {t('modals.cancel', 'Cancel')}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold uppercase tracking-wider bg-red-700 hover:bg-red-800 text-white rounded-lg transition shadow-md flex items-center gap-1.5 cursor-pointer"
                >
                  <ShieldAlert className="w-4 h-4 text-amber-300" />
                  <span>{t('modals.submit_report', 'Submit Citizen Report')}</span>
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
