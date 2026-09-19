import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  X,
  Camera,
  MapPin,
  AlertTriangle,
  CheckCircle2,
  ShieldAlert,
  FileCheck,
  Compass,
  Maximize2,
  Clock,
  Layers,
} from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { mockExifInspectionData } from '../../mock/daDashboardData';

const INDIA_BOUNDS = [
  [6.5, 68.0],
  [37.5, 97.5],
];

// Custom Map Pins for Official Site vs Photo Location
const greenOfficialPin = new L.DivIcon({
  className: 'green-official-pin',
  html: `
    <div style="position: relative; width: 30px; height: 38px;">
      <svg viewBox="0 0 30 38" width="30" height="38" fill="none">
        <path d="M15 0 C6.7 0 0 6.7 0 15 C0 24.5 13 36.5 14.5 38 C15.5 38 30 24.5 30 15 C30 6.7 23.3 0 15 0 Z" fill="#16a34a" stroke="#ffffff" stroke-width="2"/>
        <circle cx="15" cy="15" r="5" fill="#ffffff"/>
      </svg>
    </div>
  `,
  iconSize: [30, 38],
  iconAnchor: [15, 38],
  popupAnchor: [0, -36],
});

const redPhotoPin = new L.DivIcon({
  className: 'red-photo-pin',
  html: `
    <div style="position: relative; width: 30px; height: 38px;">
      <svg viewBox="0 0 30 38" width="30" height="38" fill="none">
        <path d="M15 0 C6.7 0 0 6.7 0 15 C0 24.5 13 36.5 14.5 38 C15.5 38 30 24.5 30 15 C30 6.7 23.3 0 15 0 Z" fill="#dc2626" stroke="#ffffff" stroke-width="2"/>
        <circle cx="15" cy="15" r="5" fill="#ffffff"/>
      </svg>
    </div>
  `,
  iconSize: [30, 38],
  iconAnchor: [15, 38],
  popupAnchor: [0, -36],
});

export default function EXIFInspectorModal({ projectId, onClose, onAuthorize, onRejectMilestone }) {
  const { t } = useTranslation();
  const data = mockExifInspectionData;
  const [photoError, setPhotoError] = useState(false);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-5xl w-full max-h-[92vh] flex flex-col overflow-hidden border border-slate-200">
        {/* Header */}
        <div className="px-6 py-4 bg-[#1f7a6b] text-white flex items-center justify-between border-b border-[#186054]">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-white/10">
              <Camera className="w-5 h-5 text-[#34d399]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-black uppercase tracking-wide">
                  {t('da_portal.exif.title', 'ANTI-MORPHING PHOTO INSPECTOR & GEO-VERIFICATION')}
                </h3>
                <span className="px-2 py-0.5 rounded bg-red-500 text-white text-xs font-mono font-bold">
                  {t('da_portal.exif.tamper_risk', { score: data.aiTamperScore, defaultValue: `${data.aiTamperScore}% TAMPER RISK` })}
                </span>
              </div>
              <p className="text-xs text-teal-100/80">
                {t('da_portal.exif.subtitle', 'EXIF Metadata Extraction • GPS Coordinate Tolerance Audit • Milestone Release Scrutiny')}
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

        {/* Milestone Claim Context Banner */}
        <div className="px-6 py-3 bg-red-50 border-b border-red-200 flex flex-wrap items-center justify-between gap-3 text-xs text-red-900">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-red-600 flex-shrink-0" />
            <span>
              <strong>{t('da_portal.exif.claim_flagged', 'Milestone Claim Flagged:')}</strong> {data.milestone} ({data.claimedAmount}) {t('da_portal.exif.by_contractor', { contractor: data.contractor, defaultValue: `by ${data.contractor}` })}
            </span>
          </div>
          <div className="flex items-center gap-3 text-[11px]">
            <span className="font-bold text-red-700">
              {t('da_portal.exif.displacement', { km: (data.displacementMeters / 1000).toFixed(1), limit: data.maxToleranceMeters, defaultValue: `Displacement: ${(data.displacementMeters / 1000).toFixed(1)} km (Limit: ${data.maxToleranceMeters}m)` })}
            </span>
            <span className="bg-red-200 text-red-900 px-2 py-0.5 rounded font-bold">
              {t('da_portal.exif.violation_detected', 'VIOLATION DETECTED')}
            </span>
          </div>
        </div>

        {/* Body Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {/* Top Section: High-Res Photo Preview with Warning Overlay */}
          <div className="relative rounded-2xl overflow-hidden bg-slate-900 h-64 sm:h-72 border border-slate-200 shadow-inner group">
            <img
              src={photoError ? data.fallbackPhotoUrl : data.photoUrl}
              alt="Site inspection submission"
              className="w-full h-full object-cover group-hover:scale-102 transition duration-500"
              onError={() => setPhotoError(true)}
            />

            {/* AI Warning Box in Top Right */}
            <div className="absolute top-3 right-3 bg-red-900/90 backdrop-blur-md text-white p-3 rounded-xl border border-red-500/50 max-w-sm space-y-1 shadow-lg">
              <div className="flex items-center gap-1.5 text-xs font-bold text-red-300">
                <ShieldAlert className="w-4 h-4 text-red-400" />
                <span>{t('da_portal.exif.tamper_findings', 'Forensic Tamper Findings')}</span>
              </div>
              <ul className="text-[10px] text-white/90 space-y-0.5 list-disc list-inside">
                {data.tamperFlags.map((flag, idx) => (
                  <li key={idx}>{flag}</li>
                ))}
              </ul>
            </div>

            {/* Photo Metadata Watermark in Bottom Left */}
            <div className="absolute bottom-3 left-3 bg-black/75 backdrop-blur-md text-white px-3 py-1.5 rounded-lg text-[10px] font-mono border border-white/20">
              <span>{t('da_portal.exif.photo_hash', 'Photo Hash:')} {data.exifTags[8]?.value}</span>
              <span className="mx-2">•</span>
              <span>{t('da_portal.exif.submitted', 'Submitted:')} {data.submittedAt}</span>
            </div>
          </div>

          {/* Bottom Split Section: EXIF Metadata Table vs Geo-Verification Map */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {/* Left: EXIF Metadata Table */}
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
              <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                <h4 className="text-xs font-bold uppercase text-slate-800 tracking-wider flex items-center gap-1.5">
                  <Camera className="w-3.5 h-3.5 text-[#1f7a6b]" />
                  <span>{t('da_portal.exif.extracted_tags', 'Extracted Image EXIF Tags')}</span>
                </h4>
                <span className="text-[10px] font-mono text-slate-500">{t('da_portal.exif.exif_standard', 'EXIF v2.32 / IPTC')}</span>
              </div>

              <div className="space-y-1.5 text-xs">
                {data.exifTags.map((tag, idx) => (
                  <div
                    key={idx}
                    className={`flex items-center justify-between p-2 rounded-lg ${
                      tag.alert
                        ? 'bg-red-100/75 border border-red-200 text-red-900 font-bold'
                        : 'bg-white border border-slate-200/80 text-slate-700'
                    }`}
                  >
                    <span className="text-[11px] text-slate-500 font-medium">{tag.key}</span>
                    <span className="font-mono text-[11px]">{tag.value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Right: Geo-Verification Mini Map with Displacement Line */}
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3 flex flex-col justify-between">
              <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                <h4 className="text-xs font-bold uppercase text-slate-800 tracking-wider flex items-center gap-1.5">
                  <Compass className="w-3.5 h-3.5 text-[#1f7a6b]" />
                  <span>{t('da_portal.exif.geo_displacement_map', 'Geo-Displacement Map')}</span>
                </h4>
                <span className="text-[10px] font-bold text-red-600 bg-red-100 px-2 py-0.5 rounded">
                  {t('da_portal.exif.displaced_delta', { km: '3.4', defaultValue: 'Δ 3.4 km Displaced' })}
                </span>
              </div>

              {/* Mini Map */}
              <div className="h-52 rounded-xl overflow-hidden border border-slate-200 relative z-0 isolate">
                <MapContainer
                  center={[18.5331, 73.8680]}
                  zoom={12}
                  minZoom={5}
                  maxZoom={19}
                  maxBounds={INDIA_BOUNDS}
                  maxBoundsViscosity={1.0}
                  scrollWheelZoom={false}
                  className="h-full w-full"
                >
                  <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    noWrap={true}
                    bounds={INDIA_BOUNDS}
                  />

                  {/* Sanctioned Site Pin (Green) */}
                  <Marker
                    position={[data.sanctionedSite.lat, data.sanctionedSite.lng]}
                    icon={greenOfficialPin}
                  >
                    <Popup>
                      <div className="text-xs p-1">
                        <strong className="text-emerald-700">{t('da_portal.exif.official_site', 'Official Sanctioned Site')}</strong>
                        <p className="text-[10px] text-slate-600">{data.sanctionedSite.name}</p>
                      </div>
                    </Popup>
                  </Marker>

                  {/* Uploaded Photo GPS Pin (Red) */}
                  <Marker
                    position={[data.photoLocation.lat, data.photoLocation.lng]}
                    icon={redPhotoPin}
                  >
                    <Popup>
                      <div className="text-xs p-1">
                        <strong className="text-red-700">{t('da_portal.exif.photo_location', 'Photo EXIF Coordinates')}</strong>
                        <p className="text-[10px] text-slate-600">{data.photoLocation.name}</p>
                      </div>
                    </Popup>
                  </Marker>

                  {/* Polyline showing displacement distance */}
                  <Polyline
                    positions={[
                      [data.sanctionedSite.lat, data.sanctionedSite.lng],
                      [data.photoLocation.lat, data.photoLocation.lng],
                    ]}
                    color="#dc2626"
                    weight={3}
                    dashArray="6,6"
                  />
                </MapContainer>

                <div className="absolute top-2 left-2 bg-white/90 backdrop-blur-xs p-2 rounded-lg text-[10px] space-y-1 shadow-sm border border-slate-200 z-10">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 inline-block" />
                    <span>{t('da_portal.exif.official_site', 'Official Sanctioned Site')}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-red-600 inline-block" />
                    <span>{t('da_portal.exif.photo_location', 'Photo EXIF Coordinates (Tampered)')}</span>
                  </div>
                </div>
              </div>

              <div className="text-[11px] text-slate-600 leading-tight">
                {t('da_portal.exif.verification_rule', 'Ground Verification Rule: Photos taken outside a 50m radius of the official GPS centroid cannot be used to authorize milestone disbursements.')}
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-xs text-slate-500">
            {t('da_portal.exif.audit_trail_note', 'Action will be logged in National MoSPI Vigilance Audit Trail.')}
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button
              onClick={() => {
                onRejectMilestone && onRejectMilestone(data.projectId);
                onClose();
              }}
              className="flex-1 sm:flex-none px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold transition shadow-xs cursor-pointer flex items-center justify-center gap-1.5"
            >
              <AlertTriangle className="w-4 h-4" />
              <span>{t('da_portal.exif.reject_milestone_btn', 'Reject Milestone & Issue Show-Cause')}</span>
            </button>

            <button
              onClick={() => {
                onAuthorize && onAuthorize(data.projectId);
                onClose();
              }}
              className="flex-1 sm:flex-none px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold transition shadow-xs cursor-pointer flex items-center justify-center gap-1.5"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{t('da_portal.exif.authorize_release_btn', { amount: data.claimedAmount, defaultValue: `Authorize Release (${data.claimedAmount})` })}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
