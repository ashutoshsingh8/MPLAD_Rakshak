import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup, Tooltip, useMap } from 'react-leaflet';

const STATUS_CONFIG = {
  COMPLETED: {
    label: 'Completed',
    color: '#10B981', // Emerald green
    badgeBg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    dotBg: 'bg-emerald-500',
  },
  IN_PROGRESS: {
    label: 'In Progress',
    color: '#F59E0B', // Amber
    badgeBg: 'bg-amber-50 text-amber-700 border-amber-200',
    dotBg: 'bg-amber-500',
  },
  FLAGGED_REVIEW: {
    label: 'Flagged Review',
    color: '#EF4444', // Red
    badgeBg: 'bg-rose-50 text-rose-700 border-rose-200',
    dotBg: 'bg-rose-500',
  },
  SANCTIONED: {
    label: 'Sanctioned',
    color: '#3B82F6', // Blue
    badgeBg: 'bg-blue-50 text-blue-700 border-blue-200',
    dotBg: 'bg-blue-500',
  },
  RECOMMENDED: {
    label: 'Recommended',
    color: '#8B5CF6', // Purple
    badgeBg: 'bg-purple-50 text-purple-700 border-purple-200',
    dotBg: 'bg-purple-500',
  },
};

const RISK_LEGEND = [
  { label: 'Completed', color: '#10B981' },
  { label: 'In Progress', color: '#F59E0B' },
  { label: 'Flagged Alert', color: '#EF4444' },
  { label: 'Sanctioned', color: '#3B82F6' },
  { label: 'Recommended', color: '#8B5CF6' },
];

function formatCurrency(amount) {
  if (!amount && amount !== 0) return '₹0';
  if (amount >= 10000000) {
    return `₹${(amount / 10000000).toFixed(2)} Cr`;
  }
  if (amount >= 100000) {
    return `₹${(amount / 100000).toFixed(2)} Lakh`;
  }
  return `₹${Number(amount).toLocaleString('en-IN')}`;
}

// District / Constituency Geocoding Database for MP & DA Jurisdiction Auto-Zoom
export const DISTRICT_COORDINATES = {
  pune: { lat: 18.5204, lng: 73.8567, zoom: 12, name: 'Pune', state: 'Maharashtra', constituency: 'Pune Lok Sabha Constituency' },
  lucknow: { lat: 26.8467, lng: 80.9462, zoom: 12, name: 'Lucknow', state: 'Uttar Pradesh', constituency: 'Lucknow Lok Sabha Constituency' },
  varanasi: { lat: 25.3176, lng: 82.9739, zoom: 12, name: 'Varanasi', state: 'Uttar Pradesh', constituency: 'Varanasi Lok Sabha Constituency' },
  nagpur: { lat: 21.1458, lng: 79.0882, zoom: 12, name: 'Nagpur', state: 'Maharashtra', constituency: 'Nagpur Lok Sabha Constituency' },
  bengaluru: { lat: 12.9716, lng: 77.5946, zoom: 12, name: 'Bengaluru', state: 'Karnataka', constituency: 'Bangalore South Lok Sabha' },
  bangalore: { lat: 12.9716, lng: 77.5946, zoom: 12, name: 'Bangalore', state: 'Karnataka', constituency: 'Bangalore South Lok Sabha' },
  ahmedabad: { lat: 23.0225, lng: 72.5714, zoom: 12, name: 'Ahmedabad', state: 'Gujarat', constituency: 'Ahmedabad East Lok Sabha' },
  jaipur: { lat: 26.9124, lng: 75.7873, zoom: 12, name: 'Jaipur', state: 'Rajasthan', constituency: 'Jaipur Lok Sabha Constituency' },
  bhopal: { lat: 23.2599, lng: 77.4126, zoom: 12, name: 'Bhopal', state: 'Madhya Pradesh', constituency: 'Bhopal Lok Sabha Constituency' },
  patna: { lat: 25.5941, lng: 85.1376, zoom: 12, name: 'Patna', state: 'Bihar', constituency: 'Patna Sahib Lok Sabha' },
  thane: { lat: 19.2183, lng: 72.9781, zoom: 12, name: 'Thane', state: 'Maharashtra', constituency: 'Thane Lok Sabha Constituency' },
  nashik: { lat: 19.9975, lng: 73.7898, zoom: 12, name: 'Nashik', state: 'Maharashtra', constituency: 'Nashik Lok Sabha Constituency' },
  indore: { lat: 22.7196, lng: 75.8577, zoom: 12, name: 'Indore', state: 'Madhya Pradesh', constituency: 'Indore Lok Sabha Constituency' },
  delhi: { lat: 28.6139, lng: 77.2090, zoom: 11, name: 'Delhi', state: 'Delhi', constituency: 'New Delhi Lok Sabha' },
  mumbai: { lat: 19.0760, lng: 72.8777, zoom: 12, name: 'Mumbai', state: 'Maharashtra', constituency: 'Mumbai South Lok Sabha' },
  kolkata: { lat: 22.5726, lng: 88.3639, zoom: 12, name: 'Kolkata', state: 'West Bengal', constituency: 'Kolkata South Lok Sabha' },
  chennai: { lat: 13.0827, lng: 80.2707, zoom: 12, name: 'Chennai', state: 'Tamil Nadu', constituency: 'Chennai Central Lok Sabha' },
  hyderabad: { lat: 17.3850, lng: 78.4867, zoom: 12, name: 'Hyderabad', state: 'Telangana', constituency: 'Hyderabad Lok Sabha' },
};

export function getDistrictCoordinates(districtName) {
  if (!districtName) return null;
  const key = districtName.toLowerCase().trim();
  if (DISTRICT_COORDINATES[key]) return DISTRICT_COORDINATES[key];
  for (const [k, v] of Object.entries(DISTRICT_COORDINATES)) {
    if (key.includes(k) || k.includes(key)) return v;
  }
  return null;
}

// Strict Republic of India Bounding Box
const INDIA_BOUNDS = [
  [6.5, 68.0],   // Southwest coordinates (Kanyakumari / Indian Ocean border)
  [37.5, 97.5],  // Northeast coordinates (Kashmir / Arunachal border)
];
const INDIA_CENTER = [22.3511, 78.6677];

function MapController({ projects, focusDistrict, viewMode, onMapReady }) {
  const map = useMap();

  useEffect(() => {
    if (onMapReady) onMapReady(map);
  }, [map, onMapReady]);

  useEffect(() => {
    if (!map) return;

    // When focusDistrict is specified and viewMode is 'constituency'
    if (focusDistrict && viewMode === 'constituency') {
      const cleanDistrict = focusDistrict.toLowerCase().trim();
      const districtProjects = projects.filter(
        (p) => p.latitude && p.longitude && p.district && p.district.toLowerCase().includes(cleanDistrict)
      );

      if (districtProjects.length > 0) {
        const bounds = districtProjects.map((p) => [p.latitude, p.longitude]);
        if (bounds.length === 1) {
          map.setView(bounds[0], 13, { animate: true });
        } else {
          map.fitBounds(bounds, { padding: [40, 40], maxZoom: 13, animate: true });
        }
        return;
      }

      // If no project markers in district, zoom to district geographic centroid
      const geo = getDistrictCoordinates(focusDistrict);
      if (geo) {
        map.setView([geo.lat, geo.lng], geo.zoom || 12, { animate: true });
        return;
      }
    }

    // National All-India View
    if (projects.length > 0) {
      const bounds = projects
        .filter((p) => p.latitude && p.longitude)
        .map((p) => [p.latitude, p.longitude]);
      if (bounds.length > 0) {
        map.fitBounds(bounds, { padding: [50, 50], maxZoom: 8, animate: true });
      }
    } else {
      map.fitBounds(INDIA_BOUNDS, { padding: [20, 20], animate: true });
    }
  }, [projects, focusDistrict, viewMode, map]);

  return null;
}

export default function GISMapViewer({
  projects = [],
  onProjectClick,
  height = '400px',
  focusDistrict = null,
  focusState = null,
  userRole = null,
}) {
  const [viewMode, setViewMode] = useState(() => (focusDistrict ? 'constituency' : 'national'));
  const [filterDistrictOnly, setFilterDistrictOnly] = useState(false);
  const [mapInstance, setMapInstance] = useState(null);

  const cleanDistrict = focusDistrict ? focusDistrict.toLowerCase().trim() : '';

  // Filter projects if requested
  const displayedProjects = filterDistrictOnly && focusDistrict
    ? projects.filter((p) => p.district && p.district.toLowerCase().includes(cleanDistrict))
    : projects;

  const validProjects = displayedProjects.filter((p) => p.latitude && p.longitude);
  const districtProjectCount = projects.filter(
    (p) => p.district && p.district.toLowerCase().includes(cleanDistrict)
  ).length;

  const handleZoomToDistrict = () => {
    setViewMode('constituency');
    if (!mapInstance) return;
    const districtProjects = projects.filter(
      (p) => p.latitude && p.longitude && p.district && p.district.toLowerCase().includes(cleanDistrict)
    );
    if (districtProjects.length > 0) {
      const bounds = districtProjects.map((p) => [p.latitude, p.longitude]);
      if (bounds.length === 1) {
        mapInstance.setView(bounds[0], 13, { animate: true });
      } else {
        mapInstance.fitBounds(bounds, { padding: [40, 40], maxZoom: 13, animate: true });
      }
    } else {
      const geo = getDistrictCoordinates(focusDistrict);
      if (geo) mapInstance.setView([geo.lat, geo.lng], geo.zoom || 12, { animate: true });
    }
  };

  const handleZoomToNational = () => {
    setViewMode('national');
    if (!mapInstance) return;
    const allBounds = projects
      .filter((p) => p.latitude && p.longitude)
      .map((p) => [p.latitude, p.longitude]);
    if (allBounds.length > 0) {
      mapInstance.fitBounds(allBounds, { padding: [50, 50], maxZoom: 8, animate: true });
    } else {
      mapInstance.fitBounds(INDIA_BOUNDS, { padding: [20, 20], animate: true });
    }
  };

  return (
    <div className="rounded-2xl overflow-hidden relative z-0 isolate shadow-md border border-slate-200" style={{ height }}>
      {/* ── Top Left: Constituency / District Focus Control (When MP or DA is logged in) ── */}
      {focusDistrict && (
        <div className="absolute top-3 left-12 z-20 bg-white/95 backdrop-blur-md px-3 py-2 rounded-xl border border-slate-200 shadow-lg flex flex-wrap items-center gap-2 max-w-[calc(100%-160px)]">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-teal-500 animate-pulse" />
            <span className="text-[10px] uppercase font-extrabold tracking-wider text-slate-500">
              {userRole === 'MP' ? 'Elected Constituency:' : 'Assigned Jurisdiction:'}
            </span>
            <span className="text-xs font-black text-slate-900 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
              {focusDistrict}
            </span>
          </div>

          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={handleZoomToDistrict}
              className={`px-2 py-1 rounded text-[11px] font-bold transition flex items-center gap-1 cursor-pointer ${
                viewMode === 'constituency'
                  ? 'bg-teal-700 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
              title={`Zoom and focus map on ${focusDistrict}`}
            >
              <span>🎯 Refocus {focusDistrict}</span>
            </button>

            <button
              type="button"
              onClick={handleZoomToNational}
              className={`px-2 py-1 rounded text-[11px] font-bold transition flex items-center gap-1 cursor-pointer ${
                viewMode === 'national'
                  ? 'bg-slate-800 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
              title="Zoom out to All-India View"
            >
              <span>🇮🇳 All India</span>
            </button>

            {districtProjectCount > 0 && (
              <button
                type="button"
                onClick={() => setFilterDistrictOnly(!filterDistrictOnly)}
                className={`px-2 py-1 rounded text-[11px] font-bold transition cursor-pointer ${
                  filterDistrictOnly
                    ? 'bg-amber-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
                title="Filter markers to only constituency projects"
              >
                {filterDistrictOnly ? `Showing: ${focusDistrict} Only (${districtProjectCount})` : 'Show All Works'}
              </button>
            )}
          </div>
        </div>
      )}

      {/* Legend */}
      <div className="absolute top-3 right-3 z-20 bg-white/95 backdrop-blur-xs p-2.5 rounded-xl border border-slate-200 shadow-md flex flex-col gap-1.5">
        <div className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 mb-0.5">Status Key</div>
        {RISK_LEGEND.map((item) => (
          <div key={item.label} className="flex items-center gap-2 text-xs font-semibold text-slate-700">
            <div className="w-2.5 h-2.5 rounded-full shrink-0 shadow-2xs" style={{ backgroundColor: item.color }} />
            <span>{item.label}</span>
          </div>
        ))}
      </div>

      <MapContainer
        center={
          focusDistrict && getDistrictCoordinates(focusDistrict)
            ? [getDistrictCoordinates(focusDistrict).lat, getDistrictCoordinates(focusDistrict).lng]
            : INDIA_CENTER
        }
        zoom={focusDistrict && getDistrictCoordinates(focusDistrict) ? getDistrictCoordinates(focusDistrict).zoom || 12 : 5}
        minZoom={4}
        maxZoom={18}
        maxBounds={INDIA_BOUNDS}
        maxBoundsViscosity={1.0}
        style={{ height: '100%', width: '100%' }}
        zoomControl={true}
        scrollWheelZoom={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          noWrap={true}
          bounds={INDIA_BOUNDS}
        />
        <MapController
          projects={validProjects}
          focusDistrict={focusDistrict}
          viewMode={viewMode}
          onMapReady={setMapInstance}
        />

        {validProjects.map((project) => {
          const statusKey = project.status || 'RECOMMENDED';
          const statusInfo = STATUS_CONFIG[statusKey] || STATUS_CONFIG.RECOMMENDED;
          const isFlagged = statusKey === 'FLAGGED_REVIEW';
          const projectId = project.project_uid || (project.id ? `PRJ-${project.id}` : 'N/A');

          return (
            <CircleMarker
              key={project.id || project.project_uid}
              center={[project.latitude, project.longitude]}
              radius={isFlagged ? 10 : 8}
              pathOptions={{
                color: statusInfo.color,
                fillColor: statusInfo.color,
                fillOpacity: 0.85,
                weight: isFlagged ? 3 : 2,
              }}
              eventHandlers={{
                click: () => onProjectClick?.(project),
              }}
            >
              {/* ── Hover Feature: Show Project ID & Title ── */}
              <Tooltip
                direction="top"
                offset={[0, -10]}
                opacity={1}
                className="gis-marker-tooltip"
              >
                <div className="flex flex-col gap-0.5 pointer-events-none">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-teal-400">
                      ID:
                    </span>
                    <span className="font-mono text-xs font-bold text-white tracking-wide">
                      {projectId}
                    </span>
                  </div>
                  {project.title && (
                    <div className="text-[11px] text-slate-300 font-medium max-w-[220px] truncate leading-tight mt-0.5">
                      {project.title}
                    </div>
                  )}
                </div>
              </Tooltip>

              {/* ── Click Popup Window: Clean Landscape UI ── */}
              <Popup className="gis-landscape-popup" maxWidth={560} minWidth={440}>
                <div className="text-slate-900 font-sans p-0 overflow-hidden rounded-2xl w-full">
                  {/* Top Status Color Accent Strip */}
                  <div
                    className="h-1.5 w-full"
                    style={{ backgroundColor: statusInfo.color }}
                  />

                  <div className="p-4 space-y-3">
                    {/* Header: Project ID + Category + Status Pill (Unwrapped, Clean Row) */}
                    <div className="flex items-center justify-between gap-3 pr-8 pb-1.5 border-b border-slate-100">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="inline-flex items-center gap-1.5 font-mono text-xs font-bold px-2.5 py-1 rounded-md bg-slate-100 text-slate-800 border border-slate-200 shadow-2xs whitespace-nowrap">
                          <span className="text-slate-400 font-sans font-medium text-[10px]">ID:</span>
                          <span className="tracking-wide">{projectId}</span>
                        </span>

                        {project.category && (
                          <span className="text-[10px] font-bold tracking-wider uppercase text-teal-700 bg-teal-50 px-2 py-0.5 rounded border border-teal-200 whitespace-nowrap">
                            {project.category.replace(/_/g, ' ')}
                          </span>
                        )}

                        {project.sc_st_category && project.sc_st_category !== 'GENERAL' && (
                          <span className="text-[10px] font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded border border-purple-200 whitespace-nowrap">
                            {project.sc_st_category} Area
                          </span>
                        )}
                      </div>

                      <span
                        className={`inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1 rounded-full border whitespace-nowrap shrink-0 shadow-2xs ${statusInfo.badgeBg}`}
                      >
                        <span className={`w-2 h-2 rounded-full ${statusInfo.dotBg}`} />
                        <span>{statusInfo.label}</span>
                      </span>
                    </div>

                    {/* Middle: 2-Column Landscape Split */}
                    <div className="grid grid-cols-12 gap-3.5 items-start">
                      {/* Left: Title & Agency & Compliance Alert (7 cols) */}
                      <div className="col-span-7 space-y-2">
                        <div>
                          <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Project Title</div>
                          <h4 className="text-sm font-bold text-slate-950 leading-snug tracking-tight line-clamp-3 mt-0.5">
                            {project.title}
                          </h4>
                        </div>

                        {project.implementing_agency && (
                          <div className="text-[11px] text-slate-600 flex items-center gap-1.5 bg-slate-50 px-2.5 py-1.5 rounded-lg border border-slate-200/70">
                            <span className="text-slate-400 font-medium shrink-0">🏢 Agency:</span>
                            <span className="font-bold text-slate-800 truncate">
                              {project.implementing_agency}
                            </span>
                          </div>
                        )}

                        {isFlagged && (
                          <div className="p-2 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-[11px] flex items-start gap-1.5 leading-tight">
                            <span className="text-rose-600 shrink-0 font-bold">⚠️</span>
                            <div>
                              <span className="font-bold">Compliance Flag:</span> Marked for inspection and audit review.
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Right: Location & Budget Cards (5 cols) */}
                      <div className="col-span-5 space-y-2">
                        {/* Location Box */}
                        <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200/80">
                          <div className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1 mb-0.5">
                            <span>📍</span> Location
                          </div>
                          <div
                            className="font-bold text-slate-900 text-xs truncate"
                            title={`${project.district}, ${project.state}`}
                          >
                            {project.district || 'District N/A'}
                          </div>
                          <div className="text-[10px] text-slate-500 truncate">
                            {project.state || 'State N/A'}
                          </div>
                        </div>

                        {/* Sanctioned Budget Box */}
                        <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200/80">
                          <div className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1 mb-0.5">
                            <span>💰</span> Sanctioned
                          </div>
                          <div className="font-extrabold text-slate-950 text-xs">
                            {formatCurrency(project.sanctioned_amount || 0)}
                          </div>
                          {project.sanctioned_amount > 0 && (
                            <div className="text-[10px] text-slate-500 font-mono truncate">
                              ₹{Number(project.sanctioned_amount).toLocaleString('en-IN')}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Bottom: Physical Progress Bar (Full Width) */}
                    {project.physical_progress_percent !== undefined && (
                      <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200/80 space-y-1">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-semibold text-slate-600 text-[11px]">Physical Progress</span>
                          <span className="font-bold text-slate-900 text-[11px]">
                            {project.physical_progress_percent}%
                          </span>
                        </div>
                        <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all duration-300"
                            style={{
                              width: `${Math.min(100, Math.max(0, project.physical_progress_percent))}%`,
                              backgroundColor: statusInfo.color,
                            }}
                          />
                        </div>
                      </div>
                    )}

                    {/* Interactive Action Button */}
                    {onProjectClick && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onProjectClick(project);
                        }}
                        className="w-full text-center py-2 px-3 rounded-xl text-xs font-bold bg-slate-900 hover:bg-slate-800 text-white transition shadow-xs flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <span>View Full Project Details</span>
                        <span>&rarr;</span>
                      </button>
                    )}
                  </div>
                </div>
              </Popup>
            </CircleMarker>
          );
        })}
      </MapContainer>
    </div>
  );
}
