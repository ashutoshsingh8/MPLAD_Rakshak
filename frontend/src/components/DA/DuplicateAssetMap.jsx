import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { MapPin, AlertTriangle, Layers, Navigation } from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { mockDuplicateAssets } from '../../mock/daDashboardData';
import { getDistrictCoordinates } from '../GISMapViewer';
import { getLocalizedDistrict } from '../../utils/geoTranslations';

function MapCenterController({ coords }) {
  const map = useMap();
  useEffect(() => {
    if (coords) {
      map.setView([coords.lat, coords.lng], coords.zoom || 13);
    }
  }, [coords, map]);
  return null;
}

const collisionPin = new L.DivIcon({
  className: 'collision-pin',
  html: `
    <div style="position: relative; width: 28px; height: 36px;">
      <svg viewBox="0 0 28 36" width="28" height="36" fill="none">
        <path d="M14 0 C6.3 0 0 6.3 0 14 C0 23 12 34.5 13.5 36 C14.5 36 28 23 28 14 C28 6.3 21.7 0 14 0 Z" fill="#b91c1c" stroke="#ffffff" stroke-width="2"/>
        <circle cx="14" cy="14" r="5" fill="#ffffff"/>
      </svg>
    </div>
  `,
  iconSize: [28, 36],
  iconAnchor: [14, 36],
  popupAnchor: [0, -34],
});

const INDIA_BOUNDS = [
  [6.5, 68.0],
  [37.5, 97.5],
];

export default function DuplicateAssetMap({ district = 'Pune' }) {
  const { t, i18n } = useTranslation();
  const localizedDistrict = getLocalizedDistrict(district, i18n.language);
  const geo = getDistrictCoordinates(district) || { lat: 18.5204, lng: 73.8567, zoom: 13 };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4 shadow-xs">
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <div>
          <h3 className="text-sm font-black text-slate-900 uppercase tracking-wide flex items-center gap-2">
            <MapPin className="w-4 h-4 text-red-600" />
            <span>
              {t('da_portal.duplicate_radar.title', {
                district: localizedDistrict,
                defaultValue: `Duplicate Asset Proximity Radar — ${localizedDistrict} Jurisdiction`,
              })}
            </span>
          </h3>
          <p className="text-xs text-slate-500">
            {t('da_portal.duplicate_radar.subtitle', {
              district: localizedDistrict,
              defaultValue: `Automated detection of overlapping infrastructure within 50m statutory buffer zone in ${localizedDistrict}`,
            })}
          </p>
        </div>
        <span className="px-2 py-0.5 rounded-full bg-red-100 text-red-800 text-[10px] font-bold">
          {t('da_portal.duplicate_radar.collisions_flagged', {
            count: mockDuplicateAssets.length,
            defaultValue: `${mockDuplicateAssets.length} Collisions Flagged`,
          })}
        </span>
      </div>

      {/* Map Container */}
      <div className="h-64 rounded-xl overflow-hidden border border-slate-200 relative z-0 isolate shadow-inner">
        <MapContainer
          center={[geo.lat, geo.lng]}
          zoom={geo.zoom || 13}
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
          <MapCenterController coords={geo} />

          {mockDuplicateAssets.map((asset) => (
            <div key={asset.id}>
              {/* 50m Proximity Alert Buffer Circle */}
              <Circle
                center={asset.proposedCoords}
                radius={50}
                pathOptions={{
                  color: '#dc2626',
                  fillColor: '#ef4444',
                  fillOpacity: 0.25,
                  weight: 2,
                  dashArray: '4,4',
                }}
              />

              <Marker position={asset.proposedCoords} icon={collisionPin}>
                <Popup>
                  <div className="text-xs p-1 max-w-xs space-y-1">
                    <span className="text-[10px] font-bold text-red-700 uppercase">
                      {t('da_portal.duplicate_radar.proximity_collision', {
                        dist: asset.distanceMeters,
                        defaultValue: `Proximity Collision: ${asset.distanceMeters}m`,
                      })}
                    </span>
                    <p className="font-bold text-slate-900 leading-tight">
                      {t(`da_portal.mock_assets.${asset.id}`, asset.proposedTitle)}
                    </p>
                    <p className="text-[10px] text-slate-600">
                      {t('da_portal.duplicate_radar.conflicts_with', 'Conflicts with:')}{' '}
                      <strong>
                        {t(`da_portal.mock_assets.${asset.id}-conflict`, asset.conflictTitle)}
                      </strong>
                    </p>
                  </div>
                </Popup>
              </Marker>
            </div>
          ))}
        </MapContainer>

        {/* Legend */}
        <div className="absolute bottom-2 left-2 bg-white/95 backdrop-blur-xs p-2 rounded-lg text-[10px] space-y-1 border border-slate-200 z-10 shadow-sm">
          <div className="flex items-center gap-1.5 font-bold text-slate-700">
            <span className="w-2.5 h-2.5 rounded-full bg-red-600" />
            <span>
              {t('da_portal.duplicate_radar.red_marker_legend', 'Red Marker: Proposed Site with Nearby Asset')}
            </span>
          </div>
          <div className="text-slate-500 font-mono text-[9px]">
            {t('da_portal.duplicate_radar.buffer_zone_legend', 'Red Dashed Circle = 50m Statutory Buffer Zone')}
          </div>
        </div>
      </div>

      {/* Flagged Collisions List */}
      <div className="space-y-2 text-xs">
        {mockDuplicateAssets.map((item) => (
          <div
            key={item.id}
            className="p-2.5 rounded-lg bg-red-50/70 border border-red-200/80 flex items-center justify-between"
          >
            <div>
              <div className="font-bold text-slate-900">
                {t(`da_portal.mock_assets.${item.id}`, item.proposedTitle)}
              </div>
              <div className="text-[10px] text-slate-500">
                {t('da_portal.duplicate_radar.coincides_with', 'Coincides with:')}{' '}
                <strong className="text-red-700">
                  {t(`da_portal.mock_assets.${item.id}-conflict`, item.conflictTitle)}
                </strong>
              </div>
            </div>
            <span className="font-mono font-bold text-[11px] text-red-700 bg-red-100 px-2 py-0.5 rounded">
              Δ {item.distanceMeters}m
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
