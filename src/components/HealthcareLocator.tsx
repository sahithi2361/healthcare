import React, { useState, useMemo } from "react";
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
  Pill,
  Heart,
  Baby,
} from "lucide-react";
import { Language, HealthcareFacility, FacilityType } from "../types";

interface HealthcareLocatorProps {
  facilities: HealthcareFacility[];
  language: Language;
  onBookAppointment?: (facility: HealthcareFacility) => void;
}

export const HealthcareLocator: React.FC<HealthcareLocatorProps> = ({
  facilities,
  language,
  onBookAppointment,
}) => {
  const [selectedFilter, setSelectedFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [viewMode, setViewMode] = useState<"list" | "map">("list");
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

  const filteredFacilities = useMemo(() => {
    return facilities.filter((f) => {
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
          (s) => s.toLowerCase().includes("maternal") || s.toLowerCase().includes("delivery") || s.toLowerCase().includes("antenatal")
        );
        if (!hasMaternal) return false;
      }

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matches =
          f.name.toLowerCase().includes(q) ||
          f.nameTe.toLowerCase().includes(q) ||
          f.nameHi.toLowerCase().includes(q) ||
          f.address.toLowerCase().includes(q) ||
          f.type.toLowerCase().includes(q);
        if (!matches) return false;
      }

      return true;
    });
  }, [facilities, selectedFilter, searchQuery]);

  const bestMatch = useMemo(() => {
    return [...facilities].sort((a, b) => (b.matchScore || 0) - (a.matchScore || 0))[0];
  }, [facilities]);

  const getFacilityName = (f: HealthcareFacility) => {
    if (language === "te") return f.nameTe || f.name;
    if (language === "hi") return f.nameHi || f.name;
    return f.name;
  };

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-8 space-y-6 animate-in fade-in duration-200">
      {/* Header Banner */}
      <div className="bg-white border border-slate-200/80 rounded-3xl p-6 sm:p-8 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs font-bold text-blue-600 bg-blue-50 px-3 py-0.5 rounded-full uppercase tracking-wider">
              Rural Healthcare Access
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 tracking-tight">
            {language === "te"
              ? "స్మార్ట్ ఆరోగ్య కేంద్రాల శోధన"
              : language === "hi"
              ? "स्मार्ट स्वास्थ्य केंद्र खोज"
              : "Healthcare Resource Locator"}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 font-medium max-w-2xl mt-1">
            {language === "te"
              ? "మీ సమీప ప్రాథమిక ఆరోగ్య కేంద్రాలు (PHC), జన్ ఔషధి మందుల షాపులు మరియు 24x7 ఆసుపత్రులు."
              : language === "hi"
              ? "निकटतम सरकारी स्वास्थ्य केंद्र, जन औषधि मेडिकल स्टोर और आपातकालीन अस्पताल।"
              : "Discover nearby government PHCs, CHCs, affordable Jan Aushadhi pharmacies & trauma facilities."}
          </p>
        </div>

        {/* View Toggle */}
        <div className="flex items-center bg-slate-100 p-1 rounded-full border border-slate-200 gap-1 shrink-0 self-start sm:self-auto">
          <button
            onClick={() => setViewMode("list")}
            className={`px-4 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
              viewMode === "list"
                ? "bg-blue-600 text-white shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <List className="w-3.5 h-3.5" />
            <span>List View</span>
          </button>
          <button
            onClick={() => setViewMode("map")}
            className={`px-4 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
              viewMode === "map"
                ? "bg-blue-600 text-white shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <MapIcon className="w-3.5 h-3.5" />
            <span>Map View</span>
          </button>
        </div>
      </div>

      {/* Best Match AI ML Spotlight Card */}
      {bestMatch && selectedFilter === "all" && !searchQuery && (
        <div className="bg-white border-2 border-blue-200 rounded-3xl p-6 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 bg-blue-600 text-white text-[11px] font-bold px-4 py-1 rounded-bl-2xl uppercase tracking-wider flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Top Match ({bestMatch.matchScore || 96}%)</span>
          </div>

          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mt-2 md:mt-0">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold bg-blue-50 text-blue-700 px-2.5 py-0.5 rounded-full">
                  {bestMatch.type}
                </span>
                <span className="text-xs font-semibold text-slate-500 flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-blue-600" />
                  {bestMatch.distanceKm} km away (~{bestMatch.travelTimeMin} mins)
                </span>
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-slate-800">
                {getFacilityName(bestMatch)}
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 font-medium">
                {bestMatch.recommendationReason}
              </p>
            </div>

            <div className="flex items-center gap-2 w-full md:w-auto">
              <a
                href={`tel:${bestMatch.phone}`}
                className="flex-1 md:flex-none bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs py-2.5 px-4 rounded-xl flex items-center justify-center gap-1.5 shadow-xs transition-colors"
              >
                <PhoneCall className="w-4 h-4" />
                <span>Call ({bestMatch.phone})</span>
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

      {/* Search & Filter Bar */}
      <div className="bg-white border border-slate-200/80 rounded-3xl p-5 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row items-center gap-3">
          {/* Search Input */}
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 absolute left-4 top-3.5 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by facility name, village, mandal, or doctor specialty..."
              className="w-full pl-11 pr-4 py-2.5 bg-slate-50 focus:bg-white rounded-full border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-hidden text-xs sm:text-sm text-slate-800 font-medium transition-all"
            />
          </div>

          <div className="text-xs text-slate-500 font-medium whitespace-nowrap self-end sm:self-auto">
            Showing <strong className="text-slate-800">{filteredFacilities.length}</strong> facilities
          </div>
        </div>

        {/* Filter Chips */}
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

      {/* View Mode: Map View vs List View */}
      {viewMode === "map" ? (
        <div className="bg-white border border-slate-200/80 rounded-3xl overflow-hidden shadow-sm">
          {/* Simulated Rural Healthcare Map Canvas */}
          <div className="h-96 sm:h-[450px] bg-slate-900 relative flex items-center justify-center overflow-hidden">
            {/* Background Grid Lines simulating Map */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-40"></div>

            {/* Map Top Bar */}
            <div className="absolute top-4 left-4 bg-slate-900/90 backdrop-blur-md text-white px-3.5 py-1.5 rounded-full border border-slate-700 text-xs flex items-center gap-2 z-10">
              <Compass className="w-3.5 h-3.5 text-blue-400 animate-spin" />
              <span>Center: Mahabubnagar District, Telangana (16.7488° N, 77.9866° E)</span>
            </div>

            {/* Facility Pins positioned on map */}
            <div className="relative w-full h-full p-8 flex items-center justify-center">
              {filteredFacilities.map((f, idx) => {
                const posX = 20 + ((idx * 27) % 65);
                const posY = 20 + ((idx * 33) % 60);
                const isSelected = activeFacility?.id === f.id;

                return (
                  <div
                    key={f.id}
                    style={{ left: `${posX}%`, top: `${posY}%` }}
                    onClick={() => setActiveFacility(f)}
                    className="absolute cursor-pointer group transition-transform active:scale-95"
                  >
                    <div
                      className={`relative flex items-center justify-center rounded-2xl p-2.5 transition-all ${
                        isSelected
                          ? "bg-blue-600 text-white ring-4 ring-blue-300 scale-125 z-20 shadow-xl"
                          : f.hasEmergencyServices
                          ? "bg-red-600 text-white ring-2 ring-white/50"
                          : "bg-slate-800 text-blue-400 border border-blue-500/50 hover:scale-110"
                      }`}
                    >
                      {f.type === "Jan Aushadhi Pharmacy" ? (
                        <Pill className="w-4 h-4" />
                      ) : f.hasEmergencyServices ? (
                        <Building2 className="w-4 h-4" />
                      ) : (
                        <MapPin className="w-4 h-4" />
                      )}
                    </div>
                    <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 whitespace-nowrap bg-slate-900/90 text-white text-[10px] font-bold px-2 py-0.5 rounded-md border border-slate-700 shadow-md pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity">
                      {getFacilityName(f).split(",")[0]} ({f.distanceKm} km)
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Map Selected Bottom Drawer */}
            {activeFacility && (
              <div className="absolute bottom-4 left-4 right-4 sm:left-auto sm:right-4 sm:w-96 bg-white/95 backdrop-blur-md border border-slate-200 rounded-2xl p-4 shadow-xl z-20">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold bg-blue-50 text-blue-700 px-2 py-0.5 rounded-md">
                    {activeFacility.type}
                  </span>
                  <span className="text-xs font-bold text-slate-800">
                    {activeFacility.distanceKm} km (~{activeFacility.travelTimeMin} mins)
                  </span>
                </div>
                <h4 className="text-sm font-bold text-slate-800 mt-1">
                  {getFacilityName(activeFacility)}
                </h4>
                <p className="text-xs text-slate-500 mt-0.5">{activeFacility.address}</p>

                <div className="mt-3 flex items-center gap-2">
                  <a
                    href={`tel:${activeFacility.phone}`}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold py-2 px-2 rounded-xl flex items-center justify-center gap-1"
                  >
                    <PhoneCall className="w-3.5 h-3.5" />
                    <span>Call</span>
                  </a>
                  <button
                    onClick={() =>
                      alert(`Navigating to ${activeFacility.name} via rural road route.`)
                    }
                    className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold py-2 px-2 rounded-xl flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <Navigation className="w-3.5 h-3.5 text-blue-600" />
                    <span>Directions</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* List View of Facilities */
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
                      {f.distanceKm} km
                    </span>
                    <div className="text-[11px] text-slate-400">~{f.travelTimeMin} mins</div>
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

                <button
                  onClick={() =>
                    alert(`Starting GPS navigation to ${f.name} (Latitude: ${f.latitude}, Longitude: ${f.longitude})`)
                  }
                  className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl cursor-pointer"
                  title="Directions"
                >
                  <Navigation className="w-4 h-4 text-blue-600" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
