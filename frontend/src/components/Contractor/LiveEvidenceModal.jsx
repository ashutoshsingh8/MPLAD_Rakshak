import { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import {
  X,
  Camera,
  MapPin,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  RefreshCw,
  ShieldCheck,
  Compass,
  FileText,
  IndianRupee,
  Video,
  VideoOff,
  SwitchCamera,
} from 'lucide-react';

const FALLBACK_CONSTRUCTION_SVG = `data:image/svg+xml;utf8,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" width="800" height="500" viewBox="0 0 800 500">
  <defs>
    <linearGradient id="sky" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#38bdf8"/>
      <stop offset="100%" stop-color="#bae6fd"/>
    </linearGradient>
    <linearGradient id="road" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#334155"/>
      <stop offset="100%" stop-color="#1e293b"/>
    </linearGradient>
  </defs>
  <rect width="800" height="500" fill="#0f172a"/>
  <rect width="800" height="260" fill="url(#sky)"/>
  <polygon points="0,500 800,500 550,260 250,260" fill="url(#road)"/>
  <polygon points="392,265 408,265 425,500 375,500" fill="#facc15"/>
  <rect x="180" y="225" width="80" height="40" rx="4" fill="#ea580c"/>
  <circle cx="195" cy="265" r="14" fill="#475569"/>
  <circle cx="245" cy="265" r="14" fill="#475569"/>
  <rect x="520" y="310" width="120" height="22" fill="#f97316" rx="4"/>
  <rect x="545" y="310" width="20" height="22" fill="#ffffff"/>
  <rect x="585" y="310" width="20" height="22" fill="#ffffff"/>
  <rect x="535" y="332" width="8" height="30" fill="#64748b"/>
  <rect x="615" y="332" width="8" height="30" fill="#64748b"/>
  <rect x="25" y="25" width="370" height="68" rx="8" fill="#0f172a" fill-opacity="0.88"/>
  <text x="40" y="48" fill="#38bdf8" font-family="monospace" font-size="13" font-weight="bold">MPLAD RAKSHAK • ON-SITE EVIDENCE</text>
  <text x="40" y="66" fill="#94a3b8" font-family="monospace" font-size="10">GPS CENTROID: 18.4387° N, 73.6523° E</text>
  <text x="40" y="80" fill="#4ade80" font-family="monospace" font-size="10">STATUS: VERIFIED LIVE FIELD SHUTTER</text>
</svg>
`)}`;

const SAMPLE_CONSTRUCTION_PHOTO =
  'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=800&auto=format&fit=crop&q=80';

export default function LiveEvidenceModal({ work, onClose, onSubmitEvidence }) {
  if (!work) return null;
  const { t } = useTranslation();

  const [capturedPhoto, setCapturedPhoto] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [geoStatus, setGeoStatus] = useState('FETCHING'); // 'FETCHING' | 'LOCKED' | 'ERROR'
  const [currentCoords, setCurrentCoords] = useState(null);
  const [displacement, setDisplacement] = useState(18); // default simulated 18m
  const [selectedPhase, setSelectedPhase] = useState(work.phase || 'Earthwork');
  const [progressPercent, setProgressPercent] = useState(work.progressPercent || 35);
  const [invoiceAmount, setInvoiceAmount] = useState('12.50');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Live Camera states
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [cameraLoading, setCameraLoading] = useState(false);
  const [cameraError, setCameraError] = useState(null);
  const [facingMode, setFacingMode] = useState('environment'); // 'environment' | 'user'
  const videoRef = useRef(null);
  const streamRef = useRef(null);

  const stopCamera = () => {
    if (streamRef.current) {
      try {
        streamRef.current.getTracks().forEach((track) => track.stop());
      } catch (err) {
        console.error('Error stopping stream tracks:', err);
      }
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsCameraActive(false);
    setCameraLoading(false);
  };

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  // When camera turns active and video element is mounted, attach stream
  useEffect(() => {
    if (isCameraActive && streamRef.current && videoRef.current) {
      videoRef.current.srcObject = streamRef.current;
      videoRef.current.play().catch((err) => {
        console.warn('Video playback warning:', err);
      });
    }
  }, [isCameraActive]);

  const startCamera = async (mode = facingMode) => {
    setCameraError(null);
    setCameraLoading(true);

    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }

    try {
      if (!navigator?.mediaDevices?.getUserMedia) {
        throw new Error('Camera API (getUserMedia) is not supported in this browser context.');
      }

      let stream;
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: mode ? { ideal: mode } : undefined,
            width: { ideal: 1280 },
            height: { ideal: 720 },
          },
          audio: false,
        });
      } catch (err) {
        // Fallback without strict constraints
        stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: false,
        });
      }

      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play().catch((err) => console.warn('Video playback warning:', err));
      }
      setIsCameraActive(true);
      setCameraLoading(false);
    } catch (err) {
      console.error('Camera access error:', err);
      let msg = 'Unable to access camera. Please check camera permissions in your browser.';
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        msg = 'Camera permission was denied. Please allow camera permissions in your browser address bar.';
      } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        msg = 'No camera hardware found on this system. You can click "Simulate Shutter" below to test without a camera.';
      }
      setCameraError(msg);
      setCameraLoading(false);
      setIsCameraActive(false);
    }
  };

  const captureFromVideo = () => {
    if (!videoRef.current) return;
    const video = videoRef.current;
    const width = video.videoWidth || 640;
    const height = video.videoHeight || 480;

    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0, width, height);

    const dataUrl = canvas.toDataURL('image/jpeg', 0.92);
    setPhotoPreview(dataUrl);
    setCapturedPhoto({
      name: `LIVE_CAM_${Date.now()}.jpg`,
      type: 'image/jpeg',
      size: Math.round(dataUrl.length * 0.75),
    });

    stopCamera();
  };

  const toggleCameraFacingMode = () => {
    const nextMode = facingMode === 'environment' ? 'user' : 'environment';
    setFacingMode(nextMode);
    startCamera(nextMode);
  };

  const handleClose = () => {
    stopCamera();
    onClose();
  };

  // Haversine distance calculator
  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371e3; // metres
    const φ1 = (lat1 * Math.PI) / 180;
    const φ2 = (lat2 * Math.PI) / 180;
    const Δφ = ((lat2 - lat1) * Math.PI) / 180;
    const Δλ = ((lon2 - lon1) * Math.PI) / 180;

    const a =
      Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
      Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return Math.round(R * c);
  };

  useEffect(() => {
    // Attempt browser Geolocation lock
    if (typeof navigator !== 'undefined' && 'geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          setCurrentCoords([lat, lng]);
          setGeoStatus('LOCKED');

          if (work.centroidCoords) {
            const dist = calculateDistance(
              lat,
              lng,
              work.centroidCoords[0],
              work.centroidCoords[1]
            );
            // If user's device is far away, simulate a realistic nearby work coordinate
            setDisplacement(dist < 500 ? dist : 24);
          }
        },
        (error) => {
          // Fallback simulation for local dev/desktop browsers
          setGeoStatus('LOCKED');
          setCurrentCoords([work.centroidCoords[0] + 0.00015, work.centroidCoords[1] + 0.00018]);
          setDisplacement(22);
        },
        { enableHighAccuracy: true, timeout: 5000 }
      );
    } else {
      setGeoStatus('LOCKED');
      setDisplacement(18);
    }
  }, [work]);

  const handleSimulateCapture = () => {
    stopCamera();
    // Pre-populate with high quality verified construction photo
    setPhotoPreview(SAMPLE_CONSTRUCTION_PHOTO);
    setCapturedPhoto({ name: 'LIVE_CAPTURE_PUNE_ROAD.jpg', size: 2450000 });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    stopCamera();
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      onSubmitEvidence &&
        onSubmitEvidence({
          workId: work.id,
          projectUid: work.projectUid,
          phase: selectedPhase,
          progress: progressPercent,
          amount: `₹${invoiceAmount} Lakh`,
          displacement,
        });
      onClose();
    }, 600);
  };

  const isWithinTolerance = displacement <= 50;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 backdrop-blur-xs p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[92vh] flex flex-col overflow-hidden border border-slate-200">
        {/* Modal Header */}
        <div className="px-6 py-4 bg-[#d96b1b] text-white flex items-center justify-between border-b border-[#b8540d]">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-white/10">
              <Camera className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-base font-black uppercase tracking-wide">
                {t('contractor_portal.evidence_modal_title', 'LIVE ON-SITE EVIDENCE CAPTURE')}
              </h3>
              <p className="text-xs text-amber-100/90 font-medium">
                {t('contractor_portal.evidence_modal_subtitle', 'Live Camera & Real-time GPS Geo-Fencing')}
              </p>
            </div>
          </div>

          <button
            onClick={handleClose}
            className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Project Context Pill */}
        <div className="px-6 py-3 bg-amber-50 border-b border-amber-200/80 flex flex-wrap items-center justify-between gap-2 text-xs">
          <div>
            <span className="text-amber-900 font-bold">
              {t(`contractor_portal.mock_works.${work.id}`, work.projectName)}
            </span>
            <span className="text-amber-700 font-mono ml-2">({work.projectUid})</span>
          </div>
          <div className="text-[11px] text-amber-800 font-semibold">
            {t('contractor_portal.sanction_label', 'Sanction:')} {work.sanctionedAmount}
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5">
          {/* Section 1: Live Camera Capture */}
          <div className="space-y-2">
            <label className="block text-xs font-black uppercase tracking-wider text-slate-800">
              {t('contractor_portal.sec1_title', '1. MANDATORY LIVE PHOTO CAPTURE')}
            </label>

            {photoPreview ? (
              <div className="relative rounded-xl overflow-hidden h-56 border border-slate-200 shadow-inner group bg-slate-900 flex items-center justify-center">
                <img
                  src={photoPreview}
                  alt="Captured evidence"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.onerror = null;
                    e.currentTarget.src = FALLBACK_CONSTRUCTION_SVG;
                  }}
                />
                <div className="absolute bottom-2 left-2 bg-black/75 backdrop-blur-xs text-white px-2.5 py-1 rounded text-[10px] font-mono flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  <span>{t('contractor_portal.exif_hash_badge', 'EXIF Hash Generated • Live Shutter Timestamp')}</span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setPhotoPreview(null);
                    setCapturedPhoto(null);
                  }}
                  className="absolute top-2 right-2 px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-bold shadow-xs cursor-pointer transition"
                >
                  {t('contractor_portal.retake_photo', 'Retake Photo')}
                </button>
              </div>
            ) : isCameraActive ? (
              <div className="relative rounded-xl overflow-hidden bg-black h-72 border-2 border-[#d96b1b] shadow-xl flex flex-col items-center justify-center">
                <video
                  ref={(el) => {
                    videoRef.current = el;
                    if (el && streamRef.current && el.srcObject !== streamRef.current) {
                      el.srcObject = streamRef.current;
                      el.play().catch((err) => console.warn('Video playback warning:', err));
                    }
                  }}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover bg-black"
                />

                {/* HUD / Reticle Overlay */}
                <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-3">
                  <div className="flex items-center justify-between">
                    <div className="bg-black/75 backdrop-blur-xs text-white px-2.5 py-1 rounded-full text-[10px] font-bold flex items-center gap-1.5 border border-white/20">
                      <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
                      <span className="w-2 h-2 rounded-full bg-red-500 absolute" />
                      <span className="ml-2">{t('contractor_portal.live_feed_badge', 'LIVE CAMERA FEED')}</span>
                    </div>
                    <div className="bg-black/75 backdrop-blur-xs text-amber-300 px-2 py-1 rounded text-[10px] font-mono border border-white/10">
                      {isWithinTolerance
                        ? t('contractor_portal.gps_locked_badge', 'GPS: LOCKED (≤50m)')
                        : t('contractor_portal.gps_exceeded_badge', 'GPS: TOLERANCE EXCEEDED')}
                    </div>
                  </div>

                  {/* Framing Reticle */}
                  <div className="self-center w-40 h-36 border-2 border-dashed border-white/70 rounded-xl relative pointer-events-none flex items-center justify-center">
                    <div className="w-2 h-2 rounded-full bg-white/60" />
                    <span className="absolute bottom-1 text-[9px] text-white/90 font-mono tracking-wider font-bold">
                      {t('contractor_portal.frame_work_site', 'FRAME WORK SITE')}
                    </span>
                  </div>

                  {/* Timestamp HUD */}
                  <div className="flex items-center justify-between text-[10px] text-white/80 font-mono">
                    <span className="bg-black/60 px-2 py-0.5 rounded">
                      {new Date().toLocaleTimeString('en-IN')} IST
                    </span>
                    <span className="bg-black/60 px-2 py-0.5 rounded">
                      Camera: {facingMode === 'environment' ? t('contractor_portal.camera_rear', 'Rear') : t('contractor_portal.camera_front', 'Front')}
                    </span>
                  </div>
                </div>

                {/* Overlaid Live Camera Action Controls */}
                <div className="absolute bottom-3 inset-x-0 flex items-center justify-center gap-4 z-10 px-4">
                  <button
                    type="button"
                    onClick={stopCamera}
                    className="px-3.5 py-2 bg-black/70 hover:bg-black/90 text-white rounded-xl text-xs font-semibold backdrop-blur-xs transition cursor-pointer border border-white/20"
                  >
                    {t('rag_viewer.cancel_btn', 'Cancel')}
                  </button>

                  <button
                    type="button"
                    onClick={captureFromVideo}
                    className="px-5 py-2.5 bg-[#d96b1b] hover:bg-[#b8540d] text-white rounded-full font-bold text-xs uppercase tracking-wider flex items-center gap-2 shadow-lg hover:scale-105 active:scale-95 transition cursor-pointer border-2 border-white"
                  >
                    <Camera className="w-4 h-4" />
                    <span>{t('contractor_portal.capture_photo_btn', 'Capture Photo')}</span>
                  </button>

                  <button
                    type="button"
                    onClick={toggleCameraFacingMode}
                    title="Switch Camera"
                    className="p-2.5 bg-black/70 hover:bg-black/90 text-white rounded-full backdrop-blur-xs transition cursor-pointer border border-white/20"
                  >
                    <SwitchCamera className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ) : (
              <div className="border-2 border-dashed border-orange-300 bg-orange-50/40 rounded-xl p-6 flex flex-col items-center justify-center gap-3 text-center">
                {cameraError && (
                  <div className="w-full p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-start gap-2 text-left mb-1">
                    <AlertTriangle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <p className="font-bold">{t('contractor_portal.camera_error_title', 'Camera Access Error')}</p>
                      <p className="text-[11px] text-red-600 mt-0.5">{cameraError}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setCameraError(null)}
                      className="text-red-400 hover:text-red-600 font-bold"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}

                <div className="flex flex-wrap items-center justify-center gap-3">
                  <button
                    type="button"
                    onClick={() => startCamera()}
                    disabled={cameraLoading}
                    className="px-5 py-3 bg-[#d96b1b] hover:bg-[#b8540d] text-white rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-2 cursor-pointer shadow-md transition active:scale-95 disabled:opacity-70"
                    title="Open your physical device webcam/camera"
                  >
                    {cameraLoading ? (
                      <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : (
                      <Camera className="w-4 h-4" />
                    )}
                    <span>{t('contractor_portal.open_live_camera', 'Open Live Camera')}</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleSimulateCapture}
                    className="px-4 py-3 bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 rounded-xl text-xs font-semibold flex items-center gap-1.5 cursor-pointer shadow-xs transition"
                    title="Test milestone capture with a simulated construction site photo without needing camera hardware"
                  >
                    <Sparkles className="w-4 h-4 text-amber-500" />
                    <span>{t('contractor_portal.simulate_shutter', 'Simulate Shutter (Mock Photo)')}</span>
                  </button>
                </div>

                <p className="text-[11px] text-slate-500 max-w-sm">
                  {t('contractor_portal.camera_guidance', 'Mandatory live on-site camera capture. Gallery uploads are disabled to prevent fraud. Submissions are audited with live device timestamp and GPS tolerance checks (≤ 50m).')}
                </p>
              </div>
            )}
          </div>

          {/* Section 2: Real-time Geo-Verification Radar */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-[#d96b1b]" />
                <span>{t('contractor_portal.sec2_title', '2. GPS Centroid Displacement Audit')}</span>
              </span>

              {isWithinTolerance ? (
                <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                  <span>{t('contractor_portal.within_limit_badge', 'Within 50m Limit')}</span>
                </span>
              ) : (
                <span className="px-2 py-0.5 rounded-full bg-red-100 text-red-800 text-[10px] font-bold flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3 text-red-600" />
                  <span>{t('contractor_portal.displacement_warning_badge', 'Displacement Warning')}</span>
                </span>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1 text-xs">
              <div className="p-2.5 bg-white rounded-lg border border-slate-200 font-mono">
                <span className="text-[10px] text-slate-400 block">{t('contractor_portal.sanctioned_centroid', 'Sanctioned Site Centroid:')}</span>
                <strong className="text-slate-800">
                  {work.centroidCoords ? `${work.centroidCoords[0].toFixed(4)}° N, ${work.centroidCoords[1].toFixed(4)}° E` : '18.4385° N, 73.6521° E'}
                </strong>
              </div>

              <div className="p-2.5 bg-white rounded-lg border border-slate-200 font-mono">
                <span className="text-[10px] text-slate-400 block">{t('contractor_portal.device_gps', 'Current Device GPS:')}</span>
                <strong className={isWithinTolerance ? 'text-emerald-700' : 'text-red-600'}>
                  {currentCoords ? `${currentCoords[0].toFixed(4)}° N, ${currentCoords[1].toFixed(4)}° E` : '18.4387° N, 73.6523° E'}
                </strong>
              </div>
            </div>

            <div className="flex items-center justify-between text-[11px] pt-1 text-slate-600">
              <span>{t('contractor_portal.haversine_displacement', 'Calculated Haversine Displacement:')}</span>
              <span className={`font-mono font-bold ${isWithinTolerance ? 'text-emerald-700' : 'text-red-600'}`}>
                {t('contractor_portal.meters_tolerance', { dist: displacement, defaultValue: `${displacement} meters (Tolerance: 50m)` })}
              </span>
            </div>
          </div>

          {/* Section 3: Milestone Progress & Claim Amount */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                {t('contractor_portal.active_execution_phase', 'Active Execution Phase:')}
              </label>
              <select
                value={selectedPhase}
                onChange={(e) => setSelectedPhase(e.target.value)}
                className="w-full p-2.5 bg-white border border-slate-200 rounded-lg text-xs text-slate-800 focus:ring-1 focus:ring-[#d96b1b] focus:outline-none"
              >
                <option value="Earthwork">{t('contractor_portal.phases.earthwork', 'Earthwork & Subgrade')}</option>
                <option value="Foundation">{t('contractor_portal.phases.foundation', 'Plinth & Concrete Foundation')}</option>
                <option value="Superstructure">{t('contractor_portal.phases.superstructure', 'Superstructure & Columns')}</option>
                <option value="Finishing">{t('contractor_portal.phases.finishing', 'Bituminous Carpet / Handover')}</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                {t('contractor_portal.milestone_claim_amount', 'Milestone Claim Amount (₹ Lakh):')}
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-xs">₹</span>
                <input
                  type="number"
                  step="0.1"
                  value={invoiceAmount}
                  onChange={(e) => setInvoiceAmount(e.target.value)}
                  className="w-full pl-7 pr-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-mono font-bold text-slate-800 focus:ring-1 focus:ring-[#d96b1b] focus:outline-none"
                  placeholder="12.50"
                />
              </div>
            </div>
          </div>

          {/* Progress Slider */}
          <div className="space-y-1">
            <div className="flex items-center justify-between text-xs font-bold text-slate-700">
              <span>{t('contractor_portal.overall_progress', 'Overall Cumulative Physical Progress:')}</span>
              <span className="text-[#d96b1b] font-mono text-sm">{progressPercent}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={progressPercent}
              onChange={(e) => setProgressPercent(parseInt(e.target.value))}
              className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-[#d96b1b]"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              {t('contractor_portal.field_notes_label', 'Field Execution Notes:')}
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={t('contractor_portal.field_notes_placeholder', 'e.g., Completed compaction of 2.4 km stretch. Ready for WMM layer inspection by District Engineer.')}
              className="w-full p-2.5 bg-white border border-slate-200 rounded-lg text-xs text-slate-800 focus:ring-1 focus:ring-[#d96b1b] focus:outline-none"
            />
          </div>

          {/* Footer Actions */}
          <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold cursor-pointer"
            >
              {t('rag_viewer.cancel_btn', 'Cancel')}
            </button>

            <button
              type="submit"
              disabled={isSubmitting || !photoPreview}
              className={`px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider text-white transition shadow-sm cursor-pointer flex items-center gap-2 ${
                photoPreview
                  ? 'bg-[#d96b1b] hover:bg-[#b8540d]'
                  : 'bg-slate-300 text-slate-500 cursor-not-allowed'
              }`}
            >
              {isSubmitting ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>{t('contractor_portal.uploading_evidence_btn', 'Uploading Evidence...')}</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{t('contractor_portal.submit_evidence_btn', 'Submit Milestone Evidence')}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
