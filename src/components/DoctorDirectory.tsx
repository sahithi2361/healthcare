import React, { useState, useMemo } from "react";
import {
  Stethoscope,
  Search,
  Filter,
  Star,
  Clock,
  MapPin,
  PhoneCall,
  Calendar,
  Video,
  CheckCircle2,
  Sparkles,
  ShieldCheck,
  Building2,
  Languages,
  Award,
} from "lucide-react";
import { Doctor, Language, HealthcareFacility } from "../types";

interface DoctorDirectoryProps {
  doctors: Doctor[];
  language: Language;
  onBookAppointment: (doctor: Doctor) => void;
  onStartTeleconsult: (doctor: Doctor) => void;
}

export const DoctorDirectory: React.FC<DoctorDirectoryProps> = ({
  doctors,
  language,
  onBookAppointment,
  onStartTeleconsult,
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSpecialty, setSelectedSpecialty] = useState("all");
  const [onlyTelemedicine, setOnlyTelemedicine] = useState(false);
  const [onlyAvailableToday, setOnlyAvailableToday] = useState(false);

  const specialties = [
    { id: "all", labelEn: "All Specialties", labelTe: "అన్ని విభాగాలు", labelHi: "सभी विभाग" },
    { id: "General Physician", labelEn: "General Physician", labelTe: "జనరల్ ఫిజీషియన్", labelHi: "सामान्य चिकित्सक" },
    { id: "Cardiologist (Heart Specialist)", labelEn: "Cardiology", labelTe: "హృద్రోగ నిపుణులు", labelHi: "हृदय रोग" },
    { id: "Pediatrician (Child Specialist)", labelEn: "Pediatrics (Child)", labelTe: "పిల్లల వైద్యం", labelHi: "बाल रोग" },
    { id: "Gynecologist & Obstetrician", labelEn: "Gynecology & Maternity", labelTe: "స్త్రీల వైద్యం", labelHi: "स्त्री रोग" },
    { id: "Orthopedic Surgeon", labelEn: "Orthopedics (Bone)", labelTe: "ఎముకల వైద్యం", labelHi: "हड्डी रोग" },
    { id: "ENT Specialist", labelEn: "ENT (Ear, Nose, Throat)", labelTe: "ఈఎన్‌టీ", labelHi: "ईएनटी" },
  ];

  const filteredDoctors = useMemo(() => {
    return doctors.filter((doc) => {
      if (selectedSpecialty !== "all" && doc.specialty !== selectedSpecialty) {
        return false;
      }
      if (onlyTelemedicine && !doc.isTelemedicineAvailable) {
        return false;
      }
      if (onlyAvailableToday && !doc.isAvailableToday) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matches =
          doc.name.toLowerCase().includes(q) ||
          (doc.nameTe && doc.nameTe.toLowerCase().includes(q)) ||
          doc.specialty.toLowerCase().includes(q) ||
          doc.facilityName.toLowerCase().includes(q) ||
          (doc.matchSymptoms && doc.matchSymptoms.some((s) => s.toLowerCase().includes(q)));
        if (!matches) return false;
      }
      return true;
    });
  }, [doctors, selectedSpecialty, onlyTelemedicine, onlyAvailableToday, searchQuery]);

  const getDoctorName = (doc: Doctor) => {
    if (language === "te") return doc.nameTe || doc.name;
    if (language === "hi") return doc.nameHi || doc.name;
    return doc.name;
  };

  const getDoctorSpecialty = (doc: Doctor) => {
    if (language === "te") return doc.specialtyTe || doc.specialty;
    if (language === "hi") return doc.specialtyHi || doc.specialty;
    return doc.specialty;
  };

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-8 space-y-6 animate-in fade-in duration-200">
      {/* Header Banner */}
      <div className="bg-white border border-slate-200/80 rounded-3xl p-6 sm:p-8 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs font-bold text-blue-600 bg-blue-50 px-3 py-0.5 rounded-full uppercase tracking-wider">
              Rural & District Medical Network
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 tracking-tight">
            {language === "te"
              ? "వైద్య నిపుణుల జాబితా & సంప్రదింపులు"
              : language === "hi"
              ? "डॉक्टर खोज व टेली-परामर्श"
              : "Find Doctors & Teleconsultation"}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 font-medium max-w-2xl mt-1">
            {language === "te"
              ? "ప్రాథమిక ఆరోగ్య కేంద్రాలు, జిల్లా ఆసుపత్రులు మరియు టెలిమెడిసిన్ ద్వారా ఉచిత లేదా నామమాత్రపు ఫీజుతో స్పెషలిస్ట్ వైద్యులను సంప్రదించండి."
              : language === "hi"
              ? "सरकारी अस्पताल एवं प्राथमिक स्वास्थ्य केंद्रों के योग्य विशेषज्ञ डॉक्टरों से परामर्श लें।"
              : "Connect with verified government medical officers, specialist physicians, and teleconsultation doctors."}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="bg-slate-50 border border-slate-200/80 rounded-2xl px-4 py-2 text-center">
            <div className="text-xs text-slate-500 font-semibold">Available Today</div>
            <div className="text-lg font-bold text-blue-600">
              {doctors.filter((d) => d.isAvailableToday).length} Doctors
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white border border-slate-200/80 rounded-3xl p-5 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 absolute left-4 top-3.5 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by doctor name, specialty, symptom (fever, chest pain, knee pain)..."
              className="w-full pl-11 pr-4 py-2.5 bg-slate-50 focus:bg-white rounded-full border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-hidden text-xs sm:text-sm text-slate-800 font-medium transition-all"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={() => setOnlyTelemedicine(!onlyTelemedicine)}
              className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                onlyTelemedicine
                  ? "bg-blue-600 text-white"
                  : "bg-slate-100 text-slate-700 hover:bg-slate-200"
              }`}
            >
              <Video className="w-3.5 h-3.5" />
              <span>Telemedicine</span>
            </button>

            <button
              onClick={() => setOnlyAvailableToday(!onlyAvailableToday)}
              className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                onlyAvailableToday
                  ? "bg-blue-600 text-white"
                  : "bg-slate-100 text-slate-700 hover:bg-slate-200"
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>On Duty Today</span>
            </button>
          </div>
        </div>

        {/* Specialty Filter Chips */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
          {specialties.map((spec) => (
            <button
              key={spec.id}
              onClick={() => setSelectedSpecialty(spec.id)}
              className={`px-3.5 py-1.5 rounded-full font-bold whitespace-nowrap transition-all cursor-pointer ${
                selectedSpecialty === spec.id
                  ? "bg-blue-600 text-white shadow-xs"
                  : "bg-slate-100 hover:bg-slate-200 text-slate-700"
              }`}
            >
              {language === "te" ? spec.labelTe : language === "hi" ? spec.labelHi : spec.labelEn}
            </button>
          ))}
        </div>
      </div>

      {/* Doctor Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredDoctors.map((doc) => (
          <div
            key={doc.id}
            className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-4"
          >
            <div>
              {/* Top Row: Avatar & Basic Info */}
              <div className="flex items-start gap-3.5 mb-3">
                <img
                  src={doc.avatarUrl || "https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=150"}
                  alt={doc.name}
                  className="w-14 h-14 rounded-2xl object-cover border border-slate-200 shrink-0"
                />
                <div className="space-y-0.5">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-[10px] font-bold bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full">
                      {doc.qualification}
                    </span>
                    {doc.isTelemedicineAvailable && (
                      <span className="text-[10px] font-bold bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full flex items-center gap-1">
                        <Video className="w-2.5 h-2.5" />
                        Teleconsult
                      </span>
                    )}
                  </div>
                  <h3 className="font-bold text-slate-800 text-base">{getDoctorName(doc)}</h3>
                  <p className="text-xs font-semibold text-blue-600">{getDoctorSpecialty(doc)}</p>
                </div>
              </div>

              {/* Bio & Hospital Affiliation */}
              <div className="space-y-2 text-xs text-slate-600 font-medium">
                <div className="flex items-center gap-1.5 text-slate-700">
                  <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span className="truncate">{doc.facilityName}</span>
                </div>

                <div className="flex items-center gap-1.5 text-slate-700">
                  <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span>{doc.opdTimings}</span>
                </div>

                <div className="flex items-center gap-1.5 text-slate-700">
                  <Languages className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span>Languages: {doc.languages.join(", ")}</span>
                </div>

                <div className="flex items-center justify-between pt-1 border-t border-slate-100 text-xs">
                  <div className="flex items-center gap-1 text-amber-500 font-bold">
                    <Star className="w-3.5 h-3.5 fill-amber-400" />
                    <span>{doc.rating}</span>
                    <span className="text-slate-400 font-normal">({doc.reviewCount} reviews)</span>
                  </div>
                  <div className="text-emerald-600 font-bold">
                    {doc.consultationFee === 0 ? "Free Government OPD" : `₹${doc.consultationFee}`}
                  </div>
                </div>

                {doc.bio && (
                  <p className="text-[11px] text-slate-500 line-clamp-2 pt-1">
                    {doc.bio}
                  </p>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="pt-2 border-t border-slate-100 flex items-center gap-2">
              <a
                href={`tel:${doc.phone}`}
                className="p-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition-colors cursor-pointer"
                title="Call Doctor"
              >
                <PhoneCall className="w-4 h-4" />
              </a>

              {doc.isTelemedicineAvailable && (
                <button
                  onClick={() => onStartTeleconsult(doc)}
                  className="flex-1 py-2.5 px-3 bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Video className="w-3.5 h-3.5" />
                  <span>Teleconsult</span>
                </button>
              )}

              <button
                onClick={() => onBookAppointment(doc)}
                className="flex-1 py-2.5 px-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 shadow-xs transition-colors cursor-pointer"
              >
                <Calendar className="w-3.5 h-3.5" />
                <span>Book OPD</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
