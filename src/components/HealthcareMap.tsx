import React, { useState, useEffect } from "react";
import {
  APIProvider,
  Map,
  AdvancedMarker,
  Pin,
  InfoWindow,
  useMap,
} from "@vis.gl/react-google-maps";
import {
  MapPin,
  PhoneCall,
  Navigation,
  Clock,
  Building2,
  Pill,
  Sparkles,
  ExternalLink,
  LocateFixed,
  Layers,
  Compass,
} from "lucide-react";
import { Language, HealthcareFacility } from "../types";

interface HealthcareMapProps {
  facilities: (HealthcareFacility & { dynamicDistanceKm?: number; dynamicTravelTimeMin?: number })[];
  userLocation: { lat: number; lng: number; label: string };
  selectedFacility: HealthcareFacility | null;
  onSelectFacility: (facility: HealthcareFacility) => void;
  language: Language;
  onBookAppointment?: (facility: HealthcareFacility) => void;
  heightClass?: string;
}

// Controller to smoothly pan/zoom map when user changes selection or location
const MapRecenterController: React.FC<{
  center: { lat: number; lng: number };
  zoom?: number;
}> = ({ center, zoom }) => {
  const map = useMap();

  useEffect(() => {
    if (!map) return;
    map.panTo(center);
    if (zoom) {
      map.setZoom(zoom);
    }
  }, [map, center.lat, center.lng, zoom]);

  return null;
};

export const HealthcareMap: React.FC<HealthcareMapProps> = ({
  facilities,
  userLocation,
  selectedFacility,
  onSelectFacility,
  language,
  onBookAppointment,
  heightClass = "h-[450px] sm:h-[520px]",
}) => {
  const [activeMarkerFacility, setActiveMarkerFacility] = useState<HealthcareFacility | null>(
    selectedFacility
  );
  const [mapType, setMapType] = useState<"roadmap" | "terrain" | "hybrid">("roadmap");
  const [hasMapError, setHasMapError] = useState<boolean>(false);

  // Sync prop changes
  useEffect(() => {
    if (selectedFacility) {
      setActiveMarkerFacility(selectedFacility);
    }
  }, [selectedFacility]);

  const mapsApiKey =
    (typeof import.meta !== "undefined" && (import.meta as Record<string, any>).env?.VITE_GOOGLE_MAPS_API_KEY) || "";

  const getFacilityName = (f: HealthcareFacility) => {
    if (language === "te") return f.nameTe || f.name;
    if (language === "hi") return f.nameHi || f.name;
    return f.name;
  };

  const getPinColor = (f: HealthcareFacility) => {
    if (f.hasEmergencyServices || f.type === "District Hospital" || f.type === "Emergency Facility") {
      return { background: "#dc2626", glyph: "#ffffff", border: "#991b1b" }; // Red
    }
    if (f.type === "Jan Aushadhi Pharmacy") {
      return { background: "#d97706", glyph: "#ffffff", border: "#b45309" }; // Amber
    }
    if (f.type === "Community Health Centre (CHC)") {
      return { background: "#2563eb", glyph: "#ffffff", border: "#1d4ed8" }; // Blue
    }
    return { background: "#059669", glyph: "#ffffff", border: "#047857" }; // Emerald for PHC
  };

  return (
    <div className={`relative w-full ${heightClass} rounded-3xl overflow-hidden border border-slate-200 shadow-sm bg-slate-100`}>
      <APIProvider
        apiKey={mapsApiKey}
        onError={() => setHasMapError(true)}
      >
        <Map
          defaultZoom={11}
          defaultCenter={{ lat: userLocation.lat, lng: userLocation.lng }}
          mapId="bf51a910020fa25a"
          mapTypeId={mapType}
          gestureHandling="greedy"
          disableDefaultUI={false}
          zoomControl={true}
          mapTypeControl={false}
          streetViewControl={false}
          fullscreenControl={true}
          internalUsageAttributionIds={["gmp_mcp_codeassist_v1_aistudio"]}
          className="w-full h-full"
        >
          {/* Recenter controller */}
          <MapRecenterController
            center={
              activeMarkerFacility
                ? { lat: activeMarkerFacility.latitude, lng: activeMarkerFacility.longitude }
                : { lat: userLocation.lat, lng: userLocation.lng }
            }
          />

          {/* User Location Marker (Pulse Beacon) */}
          <AdvancedMarker
            position={{ lat: userLocation.lat, lng: userLocation.lng }}
            title={`Your Location: ${userLocation.label}`}
          >
            <div className="relative flex items-center justify-center">
              <span className="animate-ping absolute inline-flex h-8 w-8 rounded-full bg-blue-400 opacity-75"></span>
              <div className="relative bg-blue-600 text-white p-2 rounded-full ring-4 ring-white shadow-xl flex items-center justify-center">
                <LocateFixed className="w-4 h-4" />
              </div>
            </div>
          </AdvancedMarker>

          {/* Healthcare Facility Advanced Markers */}
          {facilities.map((f) => {
            const colors = getPinColor(f);
            const isSelected = activeMarkerFacility?.id === f.id;

            return (
              <AdvancedMarker
                key={f.id}
                position={{ lat: f.latitude, lng: f.longitude }}
                onClick={() => {
                  setActiveMarkerFacility(f);
                  onSelectFacility(f);
                }}
                title={f.name}
              >
                <div className={`transition-transform duration-200 ${isSelected ? "scale-125 z-30" : "hover:scale-110"}`}>
                  <Pin
                    background={colors.background}
                    borderColor={colors.border}
                    glyphColor={colors.glyph}
                    scale={isSelected ? 1.3 : 1.0}
                  />
                </div>
              </AdvancedMarker>
            );
          })}

          {/* Interactive InfoWindow for selected facility */}
          {activeMarkerFacility && (
            <InfoWindow
              position={{
                lat: activeMarkerFacility.latitude,
                lng: activeMarkerFacility.longitude,
              }}
              onCloseClick={() => setActiveMarkerFacility(null)}
              pixelOffset={[0, -35]}
              maxWidth={320}
              className="p-0 rounded-2xl"
            >
              <div className="p-3 text-slate-800 space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      activeMarkerFacility.hasEmergencyServices
                        ? "bg-red-50 text-red-700 border border-red-200"
                        : activeMarkerFacility.type === "Jan Aushadhi Pharmacy"
                        ? "bg-amber-50 text-amber-800 border border-amber-200"
                        : "bg-blue-50 text-blue-700 border border-blue-200"
                    }`}
                  >
                    {activeMarkerFacility.type}
                  </span>
                  <span className="text-xs font-bold text-slate-700">
                    {activeMarkerFacility.dynamicDistanceKm ?? activeMarkerFacility.distanceKm} km
                  </span>
                </div>

                <h4 className="font-bold text-sm text-slate-900 leading-tight">
                  {getFacilityName(activeMarkerFacility)}
                </h4>

                <p className="text-[11px] text-slate-500 line-clamp-2">
                  {activeMarkerFacility.address}
                </p>

                <div className="flex items-center gap-1.5 text-[11px] text-emerald-700 font-semibold bg-emerald-50 px-2 py-1 rounded-lg">
                  <Clock className="w-3.5 h-3.5" />
                  <span>
                    Open Now • Est. Travel:{" "}
                    {activeMarkerFacility.dynamicTravelTimeMin ?? activeMarkerFacility.travelTimeMin} mins
                  </span>
                </div>

                {/* Direct Action Buttons */}
                <div className="pt-2 border-t border-slate-100 flex items-center gap-1.5">
                  <a
                    href={`tel:${activeMarkerFacility.phone}`}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white text-[11px] font-bold py-1.5 px-2 rounded-xl flex items-center justify-center gap-1 shadow-xs"
                  >
                    <PhoneCall className="w-3 h-3" />
                    <span>Call</span>
                  </a>

                  <a
                    href={`https://www.google.com/maps/dir/?api=1&origin=${userLocation.lat},${userLocation.lng}&destination=${activeMarkerFacility.latitude},${activeMarkerFacility.longitude}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-800 text-[11px] font-bold py-1.5 px-2 rounded-xl flex items-center justify-center gap-1"
                  >
                    <Navigation className="w-3 h-3 text-blue-600" />
                    <span>Route</span>
                  </a>

                  {onBookAppointment && (
                    <button
                      onClick={() => onBookAppointment(activeMarkerFacility)}
                      className="bg-blue-50 hover:bg-blue-100 text-blue-700 text-[11px] font-bold py-1.5 px-2 rounded-xl"
                    >
                      Book
                    </button>
                  )}
                </div>
              </div>
            </InfoWindow>
          )}
        </Map>
      </APIProvider>

      {/* Floating Top Controls Overlay */}
      <div className="absolute top-3 left-3 right-3 flex items-center justify-between gap-2 pointer-events-none z-10">
        <div className="bg-white/95 backdrop-blur-md px-3 py-1.5 rounded-full border border-slate-200 shadow-md text-xs font-semibold text-slate-800 flex items-center gap-2 pointer-events-auto">
          <div className="w-2.5 h-2.5 rounded-full bg-blue-600 animate-pulse"></div>
          <span className="truncate max-w-[200px] sm:max-w-xs">
            {userLocation.label}
          </span>
        </div>

        {/* Map Type Switcher */}
        <div className="bg-white/95 backdrop-blur-md p-1 rounded-full border border-slate-200 shadow-md flex items-center gap-1 pointer-events-auto text-xs">
          <button
            onClick={() => setMapType("roadmap")}
            className={`px-2.5 py-1 rounded-full font-bold transition-colors cursor-pointer ${
              mapType === "roadmap" ? "bg-blue-600 text-white" : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Roads
          </button>
          <button
            onClick={() => setMapType("terrain")}
            className={`px-2.5 py-1 rounded-full font-bold transition-colors cursor-pointer ${
              mapType === "terrain" ? "bg-blue-600 text-white" : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Terrain
          </button>
          <button
            onClick={() => setMapType("hybrid")}
            className={`px-2.5 py-1 rounded-full font-bold transition-colors cursor-pointer ${
              mapType === "hybrid" ? "bg-blue-600 text-white" : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Satellite
          </button>
        </div>
      </div>

      {/* Map Legend on bottom left */}
      <div className="absolute bottom-3 left-3 bg-white/95 backdrop-blur-md px-3 py-2 rounded-2xl border border-slate-200 shadow-md text-[10px] font-semibold text-slate-700 hidden sm:flex items-center gap-3 z-10">
        <div className="flex items-center gap-1">
          <span className="w-2.5 h-2.5 rounded-full bg-red-600"></span>
          <span>Emergency / Hospital</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-600"></span>
          <span>PHC Clinic</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="w-2.5 h-2.5 rounded-full bg-blue-600"></span>
          <span>CHC Centre</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-600"></span>
          <span>Jan Aushadhi</span>
        </div>
      </div>
    </div>
  );
};
