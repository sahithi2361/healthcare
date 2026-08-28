import React, { useState, useMemo, useEffect } from "react";
import {
  Building2,
  MapPin,
  PhoneCall,
  Navigation,
  Clock,
  CheckCircle,
  Search,
  Filter,
  Sparkles,
  ShieldCheck,
  Compass,
  List,
  Map as MapIcon,
  Columns,
  Pill,
  Heart,
  Baby,
  LocateFixed,
  Route,
  ArrowUpDown,
  AlertCircle,
} from "lucide-react";
import { Language, HealthcareFacility } from "../types";
import { HealthcareMap } from "./HealthcareMap";

interface HealthcareLocatorProps {
  facilities: HealthcareFacility[];
  language: Language;
  onBookAppointment?: (facility: HealthcareFacility) => void;
}

// Preset rural locations for instant simulation
const RURAL_LOCATION_PRESETS = [
  { id: "bhoothpur", name: "Bhoothpur Village (Lakshmi Devi)", lat: 16.6984, lng: 77.9654 },
  { id: "jadcherla", name: "Jadcherla Town", lat: 16.7667, lng: 78.1333 },
  { id: "mbnr_city", name: "Mahabubnagar District HQ", lat: 16.7488, lng: 77.9866 },
  { id: "shadnagar", name: "Shadnagar Mandal", lat: 17.0682, lng: 78.2078 },
  { id: "nagarkurnool", name: "Nagarkurnool Rural", lat: 16.4862, lng: 78.3094 },
  { id: "wanaparthy", name: "Wanaparthy Sub-Division", lat: 16.3622, lng: 78.0628 },
];

// Haversine formula to compute great-circle distance between two points in km
function computeDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10;
}

export const HealthcareLocator: React.FC<HealthcareLocatorProps> = ({
  facilities,
  language,
  onBookAppointment,
}) => {
  const [selectedFilter, setSelectedFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [viewMode, setViewMode] = useState<"split" | "map" | "list">("split");
  const [sortBy, setSortBy] = useState<"distance" | "match" | "emergency">("distance");
  const [maxRadiusKm, setMaxRadiusKm] = useState<number>(50);

  // User location state
  const [userLocation, setUserLocation] = useState<{
    lat: number;
    lng: number;
    label: string;
    isGpsActive: boolean;
  }>({
    lat: 16.6984,
    lng: 77.9654,
    label: "Bhoothpur Village (Telangana)",
    isGpsActive: false,
  });

  const [isLocating, setIsLocating] = useState<boolean>(false);
  const [gpsMessage, setGpsMessage] = useState<string | null>(null);

  const [activeFacility, setActiveFacility] = useState<HealthcareFacility | null>(
    facilities[0] || null
  );

  const filterOptions = [
    { id: "all", labelEn: "All Facilities", labelTe: "అన్ని కేంద్రాలు", labelHi: "सभी केंद्र" },
    { id: "phc", labelEn: "PHC / CHC", labelTe: "ప్రాథమిక ఆరోగ్య కేంద్రాలు", labelHi: "प्राथमिक केंद्र (PHC)" },
    { id: "emergency", labelEn: "24x7 Emergency", labelTe: "అత్యవసర చికిత్స", labelHi: "आपातकालीन सेवाएं" },
    { id: "pharmacy", labelEn: "Jan Aushadhi (Medicines)", labelTe: "జన్ ఔషధి (మందులు)", labelHi: "जन औषधि केंद्र" },
    { id: "maternal", labelEn: "Maternal & Child", labelTe: "తల్లీబిడ్డల సంరక్షణ", labelHi: "मातृ एवं शिशु" },
  ];

  // Request real device GPS location
  const handleGetGpsLocation = () => {
    if (!navigator.geolocation) {
      setGpsMessage("Geolocation is not supported by your browser.");
      return;
    }

    setIsLocating(true);
    setGpsMessage("Acquiring GPS coordinates...");

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setUserLocation({
          lat: latitude,
          lng: longitude,
          label: `Live GPS: ${latitude.toFixed(4)}°N, ${longitude.toFixed(4)}°E`,
          isGpsActive: true,
        });
        setIsLocating(false);
        setGpsMessage("GPS location updated successfully!");
        setTimeout(() => setGpsMessage(null), 3000);
      },
      (error) => {
        setIsLocating(false);
        setGpsMessage(
          `Could not get GPS location (${error.message}). Using regional rural reference.`
        );
        setTimeout(() => setGpsMessage(null), 4000);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
    );
  };

  // Calculate dynamic distances and travel times for all facilities based on active user coordinates
  const dynamicFacilities = useMemo(() => {
    return facilities.map((f) => {
      const dist = computeDistanceKm(userLocation.lat, userLocation.lng, f.latitude, f.longitude);
      // Estimate rural travel time (~35km/h road speed)
      const travelTime = Math.max(3, Math.round(dist * 2.1));
      return {
        ...f,
        dynamicDistanceKm: dist,
        dynamicTravelTimeMin: travelTime,
      };
    });
  }, [facilities, userLocation.lat, userLocation.lng]);

  // Filter and sort facilities
  const filteredFacilities = useMemo(() => {
    const list = dynamicFacilities.filter((f) => {
      // Radius filter
      if (maxRadiusKm < 50 && f.dynamicDistanceKm > maxRadiusKm) {
        return false;
      }

      // Type / Feature filter
      if (selectedFilter === "phc") {
        if (
          f.type !== "Primary Health Centre (PHC)" &&
          f.type !== "Community Health Centre (CHC)" &&
          f.type !== "Sub-Centre / Health & Wellness Centre"
        )
          return false;
      } else if (selectedFilter === "emergency") {
        if (!f.hasEmergencyServices && f.type !== "Emergency Facility" && f.type !== "District Hospital")
          return false;
      } else if (selectedFilter === "pharmacy") {
        if (f.type !== "Jan Aushadhi Pharmacy") return false;
      } else if (selectedFilter === "maternal") {
        const hasMaternal = f.services.some(
          (s) =>
            s.toLowerCase().includes("maternal") ||
            s.toLowerCase().includes("delivery") ||
            s.toLowerCase().includes("antenatal")
        );
        if (!hasMaternal) return false;
      }

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matches =
          f.name.toLowerCase().includes(q) ||
          (f.nameTe && f.nameTe.toLowerCase().includes(q)) ||
          (f.nameHi && f.nameHi.toLowerCase().includes(q)) ||
          f.address.toLowerCase().includes(q) ||
          f.type.toLowerCase().includes(q);
        if (!matches) return false;
      }

      return true;
    });

    // Apply Sorting
    return list.sort((a, b) => {
      if (sortBy === "distance") {
        return a.dynamicDistanceKm - b.dynamicDistanceKm;
      }
      if (sortBy === "match") {
        return (b.matchScore || 0) - (a.matchScore || 0);
      }
      if (sortBy === "emergency") {
        if (a.hasEmergencyServices && !b.hasEmergencyServices) return -1;
        if (!a.hasEmergencyServices && b.hasEmergencyServices) return 1;
        return a.dynamicDistanceKm - b.dynamicDistanceKm;
      }
      return 0;
    });
  }, [dynamicFacilities, selectedFilter, searchQuery, maxRadiusKm, sortBy]);

  // Dynamically calculate the Top Match based on distance & capabilities
  const bestMatch = useMemo(() => {
    if (filteredFacilities.length === 0) return null;
    return [...filteredFacilities].sort((a, b) => {
      // Score = matchScore - distance penalty
      const scoreA = (a.matchScore || 80) - a.dynamicDistanceKm * 1.5;
      const scoreB = (b.matchScore || 80) - b.dynamicDistanceKm * 1.5;
      return scoreB - scoreA;
    })[0];
  }, [filteredFacilities]);

  // Set default active facility on list change
  useEffect(() => {
    if (filteredFacilities.length > 0 && (!activeFacility || !filteredFacilities.some((f) => f.id === activeFacility.id))) {
      setActiveFacility(filteredFacilities[0]);
    }
  }, [filteredFacilities]);

  const getFacilityName = (f: HealthcareFacility) => {
    if (language === "te") return f.nameTe || f.name;
    if (language === "hi") return f.nameHi || f.name;
    return f.name;
  };

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-8 space-y-6 animate-in fade-in duration-200">
      {/* Header Banner with Location & Mode Switcher */}
      <div className="bg-white border border-slate-200/80 rounded-3xl p-6 sm:p-8 shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-blue-600 bg-blue-50 px-3 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-1.5">
              <Compass className="w-3.5 h-3.5" />
              Dynamic Google Maps Locator
            </span>
            {userLocation.isGpsActive && (
              <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
                Live GPS Active
              </span>
            )}
          </div>

          <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 tracking-tight">
            {language === "te"
              ? "గూగుల్ మ్యాప్స్ ఆరోగ్య కేంద్రాల నావిగేషన్"
              : language === "hi"
              ? "गूगल मैप्स स्वास्थ्य केंद्र नेविगेशन"
              : "Healthcare Facility Locator"}
          </h1>

          <p className="text-xs sm:text-sm text-slate-500 font-medium max-w-2xl">
            {language === "te"
              ? "మీ ప్రత్యక్ష లొకేషన్ ఆధారంగా సమీప PHC, CHC, జన్ ఔషధి మరియు ప్రభుత్వ ఆసుపత్రులను కనుగొనండి."
              : language === "hi"
              ? "अपने लाइव स्थान के अनुसार निकटतम सरकारी अस्पताल, PHC और जन औषधि केंद्र खोजें।"
              : "Locate nearby government Primary Health Centres, Jan Aushadhi pharmacies, and 24x7 trauma hospitals with interactive Google Maps and real-time turn-by-turn routes."}
          </p>
        </div>

        {/* View Toggle */}
        <div className="flex items-center bg-slate-100 p-1.5 rounded-2xl border border-slate-200 gap-1 shrink-0 self-start lg:self-auto">
          <button
            onClick={() => setViewMode("split")}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
              viewMode === "split"
                ? "bg-blue-600 text-white shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
            title="Split Map + List View"
          >
            <Columns className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Split View</span>
          </button>
          <button
            onClick={() => setViewMode("map")}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
              viewMode === "map"
                ? "bg-blue-600 text-white shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
            title="Full Map View"
          >
            <MapIcon className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Full Map</span>
          </button>
          <button
            onClick={() => setViewMode("list")}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
              viewMode === "list"
                ? "bg-blue-600 text-white shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
            title="List Directory"
          >
            <List className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">List View</span>
          </button>
        </div>
      </div>

      {/* User Location Bar with GPS & Presets */}
      <div className="bg-blue-50/70 border border-blue-200/80 rounded-3xl p-4 sm:p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="w-10 h-10 rounded-2xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-xs">
            <MapPin className="w-5 h-5" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-[11px] font-bold text-blue-700 uppercase tracking-wider">
              Current Patient Origin Point
            </div>
            <div className="text-sm font-bold text-slate-800 truncate">
              {userLocation.label}
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          {/* GPS Locate Button */}
          <button
            onClick={handleGetGpsLocation}
            disabled={isLocating}
            className="flex-1 sm:flex-none bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white text-xs font-bold px-3.5 py-2 rounded-xl flex items-center justify-center gap-1.5 shadow-xs transition-colors cursor-pointer"
          >
            <LocateFixed className={`w-4 h-4 ${isLocating ? "animate-spin" : ""}`} />
            <span>{isLocating ? "Detecting GPS..." : "Use My Device GPS"}</span>
          </button>

          {/* Quick Village Presets Selector */}
          <div className="flex-1 sm:flex-none">
            <select
              value={
                RURAL_LOCATION_PRESETS.find(
                  (p) =>
                    Math.abs(p.lat - userLocation.lat) < 0.001 &&
                    Math.abs(p.lng - userLocation.lng) < 0.001
                )?.id || ""
              }
              onChange={(e) => {
                const preset = RURAL_LOCATION_PRESETS.find((p) => p.id === e.target.value);
                if (preset) {
                  setUserLocation({
                    lat: preset.lat,
                    lng: preset.lng,
                    label: preset.name,
                    isGpsActive: false,
                  });
                }
              }}
              className="w-full bg-white border border-blue-200 text-slate-700 font-semibold text-xs py-2 px-3 rounded-xl outline-hidden focus:ring-2 focus:ring-blue-400 cursor-pointer"
            >
              <option value="" disabled>
                Switch Village / District...
              </option>
              {RURAL_LOCATION_PRESETS.map((p) => (
                <option key={p.id} value={p.id}>
                  📍 {p.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* GPS Feedback Notice if available */}
      {gpsMessage && (
        <div className="bg-slate-800 text-white text-xs font-medium px-4 py-2.5 rounded-2xl flex items-center gap-2 shadow-sm animate-in fade-in">
          <AlertCircle className="w-4 h-4 text-blue-400 shrink-0" />
          <span>{gpsMessage}</span>
        </div>
      )}

      {/* Best Match AI ML Spotlight Card */}
      {bestMatch && selectedFilter === "all" && !searchQuery && (
        <div className="bg-white border-2 border-blue-200 rounded-3xl p-6 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 bg-blue-600 text-white text-[11px] font-bold px-4 py-1 rounded-bl-2xl uppercase tracking-wider flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Optimal Match for Location ({bestMatch.matchScore || 96}%)</span>
          </div>

          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mt-2 md:mt-0">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold bg-blue-50 text-blue-700 px-2.5 py-0.5 rounded-full">
                  {bestMatch.type}
                </span>
                <span className="text-xs font-semibold text-slate-600 flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-blue-600" />
                  <strong>{bestMatch.dynamicDistanceKm} km away</strong> (~{bestMatch.dynamicTravelTimeMin} mins from your coordinates)
                </span>
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-slate-800">
                {getFacilityName(bestMatch)}
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 font-medium">
                {bestMatch.recommendationReason}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
              <a
                href={`tel:${bestMatch.phone}`}
                className="flex-1 md:flex-none bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs py-2.5 px-4 rounded-xl flex items-center justify-center gap-1.5 shadow-xs transition-colors"
              >
                <PhoneCall className="w-4 h-4" />
                <span>Call ({bestMatch.phone})</span>
              </a>

              <a
                href={`https://www.google.com/maps/dir/?api=1&origin=${userLocation.lat},${userLocation.lng}&destination=${bestMatch.latitude},${bestMatch.longitude}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 md:flex-none bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs py-2.5 px-4 rounded-xl flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <Navigation className="w-4 h-4 text-blue-600" />
                <span>Directions</span>
              </a>

              {onBookAppointment && (
                <button
                  onClick={() => onBookAppointment(bestMatch)}
                  className="flex-1 md:flex-none bg-white hover:bg-blue-50 text-blue-600 border border-blue-200 font-bold text-xs py-2.5 px-4 rounded-xl transition-colors cursor-pointer"
                >
                  Book Appointment
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Search, Filter & Radius Controls Bar */}
      <div className="bg-white border border-slate-200/80 rounded-3xl p-5 shadow-sm space-y-4">
        <div className="flex flex-col lg:flex-row items-center gap-3">
          {/* Search Input */}
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 absolute left-4 top-3.5 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by facility name, village, doctor specialty, or treatments..."
              className="w-full pl-11 pr-4 py-2.5 bg-slate-50 focus:bg-white rounded-full border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-hidden text-xs sm:text-sm text-slate-800 font-medium transition-all"
            />
          </div>

          {/* Sort Selector */}
          <div className="flex items-center gap-2 w-full lg:w-auto">
            <div className="flex items-center gap-1.5 bg-slate-100 px-3 py-2 rounded-2xl border border-slate-200 text-xs font-semibold text-slate-700 shrink-0">
              <ArrowUpDown className="w-3.5 h-3.5 text-blue-600" />
              <span>Sort:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="bg-transparent font-bold text-slate-800 outline-hidden cursor-pointer"
              >
                <option value="distance">Nearest Distance</option>
                <option value="match">Match Score</option>
                <option value="emergency">Emergency First</option>
              </select>
            </div>

            {/* Radius Filter */}
            <div className="flex items-center gap-1.5 bg-slate-100 px-3 py-2 rounded-2xl border border-slate-200 text-xs font-semibold text-slate-700 shrink-0">
              <span>Radius:</span>
              <select
                value={maxRadiusKm}
                onChange={(e) => setMaxRadiusKm(Number(e.target.value))}
                className="bg-transparent font-bold text-slate-800 outline-hidden cursor-pointer"
              >
                <option value={50}>Any Distance</option>
                <option value={5}>Within 5 km</option>
                <option value={15}>Within 15 km</option>
                <option value={30}>Within 30 km</option>
              </select>
            </div>

            <div className="text-xs text-slate-500 font-medium whitespace-nowrap hidden sm:block">
              Found <strong className="text-slate-800">{filteredFacilities.length}</strong>
            </div>
          </div>
        </div>

        {/* Filter Category Chips */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
          {filterOptions.map((opt) => (
            <button
              key={opt.id}
              onClick={() => setSelectedFilter(opt.id)}
              className={`px-3.5 py-1.5 rounded-full font-bold whitespace-nowrap transition-all cursor-pointer ${
                selectedFilter === opt.id
                  ? "bg-blue-600 text-white shadow-xs"
                  : "bg-slate-100 hover:bg-slate-200 text-slate-700"
              }`}
            >
              {language === "te" ? opt.labelTe : language === "hi" ? opt.labelHi : opt.labelEn}
            </button>
          ))}
        </div>
      </div>

      {/* Main Content Area based on View Mode */}
      {viewMode === "split" ? (
        /* Split View: Interactive Google Map on Left, Nearby Facilities List on Right */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Map Column (7 cols) */}
          <div className="lg:col-span-7 sticky top-4">
            <HealthcareMap
              facilities={filteredFacilities}
              userLocation={userLocation}
              selectedFacility={activeFacility}
              onSelectFacility={setActiveFacility}
              language={language}
              onBookAppointment={onBookAppointment}
              heightClass="h-[480px] lg:h-[620px]"
            />
          </div>

          {/* Cards Column (5 cols) */}
          <div className="lg:col-span-5 space-y-4 max-h-[620px] overflow-y-auto pr-1">
            <div className="text-xs font-bold text-slate-500 uppercase tracking-wider px-1">
              Interactive Facilities ({filteredFacilities.length}) • Click to Focus on Map
            </div>

            {filteredFacilities.map((f) => {
              const isSelected = activeFacility?.id === f.id;
              return (
                <div
                  key={f.id}
                  onClick={() => setActiveFacility(f)}
                  className={`bg-white border rounded-3xl p-5 shadow-xs transition-all cursor-pointer ${
                    isSelected
                      ? "border-blue-500 ring-2 ring-blue-100 shadow-md bg-blue-50/20"
                      : "border-slate-200/80 hover:border-slate-300 hover:shadow-xs"
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <span
                      className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                        f.hasEmergencyServices
                          ? "bg-red-50 text-red-700 border border-red-200"
                          : f.type === "Jan Aushadhi Pharmacy"
                          ? "bg-amber-50 text-amber-800 border border-amber-200"
                          : "bg-blue-50 text-blue-700 border border-blue-200"
                      }`}
                    >
                      {f.type}
                    </span>

                    <div className="text-right shrink-0">
                      <span className="text-xs font-bold text-slate-900">
                        {f.dynamicDistanceKm} km away
                      </span>
                      <div className="text-[10px] text-slate-500 font-medium">
                        ~{f.dynamicTravelTimeMin} mins route
                      </div>
                    </div>
                  </div>

                  <h3 className="text-sm font-bold text-slate-800 mt-2 leading-tight">
                    {getFacilityName(f)}
                  </h3>

                  <p className="text-xs text-slate-500 mt-1 flex items-center gap-1 truncate">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>{f.address}</span>
                  </p>

                  <div className="mt-2.5 flex flex-wrap gap-1">
                    {f.services.slice(0, 2).map((srv, idx) => (
                      <span
                        key={idx}
                        className="text-[10px] bg-slate-50 text-slate-600 px-2 py-0.5 rounded-md border border-slate-100 font-medium"
                      >
                        ✓ {srv}
                      </span>
                    ))}
                  </div>

                  {/* Actions */}
                  <div className="mt-3 pt-3 border-t border-slate-100 flex items-center gap-2">
                    <a
                      href={`tel:${f.phone}`}
                      onClick={(e) => e.stopPropagation()}
                      className="flex-1 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold py-1.5 px-2.5 rounded-xl flex items-center justify-center gap-1 shadow-xs"
                    >
                      <PhoneCall className="w-3.5 h-3.5" />
                      <span>Call</span>
                    </a>

                    <a
                      href={`https://www.google.com/maps/dir/?api=1&origin=${userLocation.lat},${userLocation.lng}&destination=${f.latitude},${f.longitude}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold py-1.5 px-2.5 rounded-xl flex items-center justify-center gap-1 cursor-pointer"
                    >
                      <Navigation className="w-3.5 h-3.5 text-blue-600" />
                      <span>Google Route</span>
                    </a>

                    {onBookAppointment && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onBookAppointment(f);
                        }}
                        className="bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-bold py-1.5 px-2.5 rounded-xl transition-colors cursor-pointer"
                      >
                        Book
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : viewMode === "map" ? (
        /* Full Map View */
        <div className="space-y-4">
          <HealthcareMap
            facilities={filteredFacilities}
            userLocation={userLocation}
            selectedFacility={activeFacility}
            onSelectFacility={setActiveFacility}
            language={language}
            onBookAppointment={onBookAppointment}
            heightClass="h-[550px] sm:h-[650px]"
          />

          {/* Bottom active facility detail drawer */}
          {activeFacility && (
            <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold bg-blue-50 text-blue-700 px-2.5 py-0.5 rounded-full">
                    {activeFacility.type}
                  </span>
                  <span className="text-xs font-bold text-slate-700">
                    {activeFacility.dynamicDistanceKm ?? activeFacility.distanceKm} km away (~{activeFacility.dynamicTravelTimeMin ?? activeFacility.travelTimeMin} mins)
                  </span>
                </div>
                <h3 className="text-lg font-bold text-slate-900">
                  {getFacilityName(activeFacility)}
                </h3>
                <p className="text-xs text-slate-500">{activeFacility.address}</p>
              </div>

              <div className="flex items-center gap-2">
                <a
                  href={`tel:${activeFacility.phone}`}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs py-2.5 px-4 rounded-xl flex items-center gap-1.5 shadow-xs"
                >
                  <PhoneCall className="w-4 h-4" />
                  <span>Call ({activeFacility.phone})</span>
                </a>
                <a
                  href={`https://www.google.com/maps/dir/?api=1&origin=${userLocation.lat},${userLocation.lng}&destination=${activeFacility.latitude},${activeFacility.longitude}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs py-2.5 px-4 rounded-xl flex items-center gap-1.5 cursor-pointer"
                >
                  <Navigation className="w-4 h-4 text-blue-600" />
                  <span>Open Directions in Google Maps</span>
                </a>
              </div>
            </div>
          )}
        </div>
      ) : (
        /* List View */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {filteredFacilities.map((f) => (
            <div
              key={f.id}
              className="bg-white border border-slate-200/80 hover:border-blue-300 rounded-3xl p-6 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <span
                    className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full ${
                      f.hasEmergencyServices
                        ? "bg-red-50 text-red-700 border border-red-200"
                        : f.type === "Jan Aushadhi Pharmacy"
                        ? "bg-amber-50 text-amber-800 border border-amber-200"
                        : "bg-blue-50 text-blue-700 border border-blue-200"
                    }`}
                  >
                    {f.type}
                  </span>

                  <div className="text-right shrink-0">
                    <span className="text-xs font-bold text-slate-800">
                      {f.dynamicDistanceKm} km
                    </span>
                    <div className="text-[11px] text-slate-400">~{f.dynamicTravelTimeMin} mins</div>
                  </div>
                </div>

                <h3 className="text-base font-bold text-slate-800 mt-2 leading-snug">
                  {getFacilityName(f)}
                </h3>
                <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span>{f.address}</span>
                </p>

                {/* Services Pills */}
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {f.services.slice(0, 3).map((srv, idx) => (
                    <span
                      key={idx}
                      className="text-[10px] font-medium bg-slate-50 text-slate-600 px-2 py-0.5 rounded-md border border-slate-100"
                    >
                      ✓ {srv}
                    </span>
                  ))}
                  {f.services.length > 3 && (
                    <span className="text-[10px] text-slate-400 px-1 py-0.5">
                      +{f.services.length - 3} more
                    </span>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-5 pt-3 border-t border-slate-100 flex items-center gap-2">
                <a
                  href={`tel:${f.phone}`}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold py-2 px-3 rounded-xl flex items-center justify-center gap-1.5 transition-colors shadow-xs"
                >
                  <PhoneCall className="w-3.5 h-3.5" />
                  <span>Call ({f.phone})</span>
                </a>

                {onBookAppointment && (
                  <button
                    onClick={() => onBookAppointment(f)}
                    className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold py-2 px-3 rounded-xl transition-colors cursor-pointer"
                  >
                    Appointment
                  </button>
                )}

                <a
                  href={`https://www.google.com/maps/dir/?api=1&origin=${userLocation.lat},${userLocation.lng}&destination=${f.latitude},${f.longitude}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl cursor-pointer"
                  title="Open Google Maps Directions"
                >
                  <Navigation className="w-4 h-4 text-blue-600" />
                </a>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
