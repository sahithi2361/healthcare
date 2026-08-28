import React from "react";
import {
  Mic,
  Pill,
  Calendar,
  CheckCircle2,
  MapPin,
  Stethoscope,
  FolderLock,
  Users,
  Building2,
  ArrowRight,
} from "lucide-react";
import {
  Language,
  UserProfile,
  Medication,
  Appointment,
  HealthcareFacility,
  HealthAccessScoreData,
} from "../types";
import { TRANSLATIONS } from "../data/initialData";

interface HomeOverviewProps {
  userProfile: UserProfile;
  medications: Medication[];
  appointments: Appointment[];
  facilities: HealthcareFacility[];
  accessScore?: HealthAccessScoreData;
  language: Language;
  onNavigate: (tab: string) => void;
  onOpenEmergency: () => void;
  onMarkMedTaken: (med: Medication) => void;
}

export const HomeOverview: React.FC<HomeOverviewProps> = ({
  userProfile,
  medications,
  appointments,
  facilities,
  language,
  onNavigate,
  onOpenEmergency,
  onMarkMedTaken,
}) => {
  const t = (key: string) => TRANSLATIONS[key]?.[language] || TRANSLATIONS[key]?.["en"] || key;

  const nextAppointment = appointments.find((a) => a.status === "Scheduled") || appointments[0];
  const untakenMedication = medications.find((m) => !m.isTakenToday);

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-8 space-y-6 animate-in fade-in duration-200">
      {/* Clean Header Greeting */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 sm:p-7 rounded-3xl border border-slate-200/90 shadow-2xs">
        <div className="space-y-1">
          <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2.5 py-0.5 rounded-full inline-block">
            {userProfile.location || "Telangana"}
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">
            {language === "te"
              ? `నమస్కారం, ${userProfile.name}`
              : language === "hi"
              ? `नमस्ते, ${userProfile.name}`
              : `Namaste, ${userProfile.name}`}
          </h2>
          <p className="text-slate-500 text-sm">
            {language === "te"
              ? "మీ ఆరోగ్య సమాచారం మరియు నిపుణుల మార్గదర్శకత్వం"
              : language === "hi"
              ? "आपकी स्वास्थ्य जानकारी और सही देखभाल"
              : "Your rural healthcare guide and care companion"}
          </p>
        </div>

        <button
          onClick={() => onNavigate("assistant")}
          className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-3 rounded-2xl font-bold text-sm shadow-2xs flex items-center gap-2 transition-all active:scale-95 cursor-pointer shrink-0 self-start sm:self-auto"
        >
          <Mic className="w-4 h-4" />
          <span>{t("askVoice")}</span>
        </button>
      </div>

      {/* Quick 3 Hero Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div
          onClick={() => onNavigate("healthcare")}
          className="bg-white p-5 rounded-3xl border border-slate-200/90 shadow-2xs hover:shadow-xs hover:border-blue-300 cursor-pointer flex items-center gap-4 transition-all group"
        >
          <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center group-hover:scale-105 transition-transform shrink-0">
            <Building2 className="w-6 h-6" />
          </div>
          <div>
            <span className="font-bold text-slate-900 text-base block">Find Facilities</span>
            <span className="text-xs text-slate-500 mt-0.5 block">PHC, CHC & Hospitals</span>
          </div>
        </div>

        <div
          onClick={() => onNavigate("doctors")}
          className="bg-white p-5 rounded-3xl border border-slate-200/90 shadow-2xs hover:shadow-xs hover:border-rose-300 cursor-pointer flex items-center gap-4 transition-all group"
        >
          <div className="w-12 h-12 bg-rose-50 text-rose-600 rounded-2xl flex items-center justify-center group-hover:scale-105 transition-transform shrink-0">
            <Stethoscope className="w-6 h-6" />
          </div>
          <div>
            <span className="font-bold text-slate-900 text-base block">Consult Doctors</span>
            <span className="text-xs text-slate-500 mt-0.5 block">Tele-OPD & Consultations</span>
          </div>
        </div>

        <div
          onClick={() => onNavigate("appointments")}
          className="bg-white p-5 rounded-3xl border border-slate-200/90 shadow-2xs hover:shadow-xs hover:border-emerald-300 cursor-pointer flex items-center gap-4 transition-all group"
        >
          <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center group-hover:scale-105 transition-transform shrink-0">
            <Calendar className="w-6 h-6" />
          </div>
          <div>
            <span className="font-bold text-slate-900 text-base block">Appointments</span>
            <span className="text-xs text-slate-500 mt-0.5 block">Scheduled Clinic Visits</span>
          </div>
        </div>
      </div>

      {/* Today's Schedule Card */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-2xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900">Today's Health Schedule</h3>
            <p className="text-xs text-slate-500">Essential scheduled medications & health visits</p>
          </div>
          <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full">
            {untakenMedication ? "1 Action Pending" : "Up to Date"}
          </span>
        </div>

        <div className="space-y-3">
          {/* Medication Item */}
          {untakenMedication ? (
            <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-200/60 gap-3">
              <div className="flex items-center">
                <div className="w-10 h-10 bg-white rounded-xl shadow-2xs flex items-center justify-center text-amber-500 mr-3.5 shrink-0 border border-slate-100">
                  <Pill className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-bold text-slate-900 text-sm">
                    {untakenMedication.name} {untakenMedication.dosage}
                  </p>
                  <p className="text-xs text-slate-500">
                    {untakenMedication.instructions} • Scheduled for {untakenMedication.timing || "Morning"}
                  </p>
                </div>
              </div>
              <button
                onClick={() => onMarkMedTaken(untakenMedication)}
                className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-3.5 py-2 rounded-xl transition-colors cursor-pointer self-start sm:self-auto shrink-0 shadow-2xs"
              >
                Mark Taken
              </button>
            </div>
          ) : (
            <div className="p-3.5 bg-emerald-50 rounded-2xl border border-emerald-100 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span className="text-xs font-semibold text-emerald-800">
                  All daily medications taken for today!
                </span>
              </div>
              <button
                onClick={() => onNavigate("medicines")}
                className="text-xs font-bold text-emerald-700 hover:underline"
              >
                View Tracker
              </button>
            </div>
          )}

          {/* Appointment Item */}
          {nextAppointment && (
            <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-200/60 gap-3">
              <div className="flex items-center">
                <div className="w-10 h-10 bg-white rounded-xl shadow-2xs flex items-center justify-center text-blue-600 mr-3.5 shrink-0 border border-slate-100">
                  <Calendar className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-bold text-slate-900 text-sm">
                    {nextAppointment.facilityName}
                  </p>
                  <p className="text-xs text-slate-500">
                    {nextAppointment.doctorName} • {nextAppointment.date} at {nextAppointment.time}
                  </p>
                </div>
              </div>
              <button
                onClick={() => onNavigate("appointments")}
                className="bg-white hover:bg-blue-50 text-blue-600 border border-blue-200 text-xs font-bold px-3.5 py-2 rounded-xl transition-colors cursor-pointer self-start sm:self-auto shrink-0"
              >
                View Details
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Quick Services Grid */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            All Health Tools
          </h3>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <button
            onClick={() => onNavigate("assistant")}
            className="p-3.5 rounded-2xl bg-white hover:bg-slate-50 border border-slate-200/90 text-center space-y-1.5 transition-all cursor-pointer shadow-2xs group"
          >
            <div className="w-9 h-9 mx-auto rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center group-hover:scale-105 transition-transform">
              <Mic className="w-4 h-4" />
            </div>
            <div className="text-xs font-bold text-slate-900">Saathi Voice</div>
            <div className="text-[10px] text-slate-400">AI Triage</div>
          </button>

          <button
            onClick={() => onNavigate("healthcare")}
            className="p-3.5 rounded-2xl bg-white hover:bg-slate-50 border border-slate-200/90 text-center space-y-1.5 transition-all cursor-pointer shadow-2xs group"
          >
            <div className="w-9 h-9 mx-auto rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:scale-105 transition-transform">
              <MapPin className="w-4 h-4" />
            </div>
            <div className="text-xs font-bold text-slate-900">Facilities</div>
            <div className="text-[10px] text-slate-400">Map & Beds</div>
          </button>

          <button
            onClick={() => onNavigate("doctors")}
            className="p-3.5 rounded-2xl bg-white hover:bg-slate-50 border border-slate-200/90 text-center space-y-1.5 transition-all cursor-pointer shadow-2xs group"
          >
            <div className="w-9 h-9 mx-auto rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center group-hover:scale-105 transition-transform">
              <Stethoscope className="w-4 h-4" />
            </div>
            <div className="text-xs font-bold text-slate-900">Doctors</div>
            <div className="text-[10px] text-slate-400">Tele-OPD</div>
          </button>

          <button
            onClick={() => onNavigate("medicines")}
            className="p-3.5 rounded-2xl bg-white hover:bg-slate-50 border border-slate-200/90 text-center space-y-1.5 transition-all cursor-pointer shadow-2xs group"
          >
            <div className="w-9 h-9 mx-auto rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center group-hover:scale-105 transition-transform">
              <Pill className="w-4 h-4" />
            </div>
            <div className="text-xs font-bold text-slate-900">Medicines</div>
            <div className="text-[10px] text-slate-400">Tracker</div>
          </button>

          <button
            onClick={() => onNavigate("records")}
            className="p-3.5 rounded-2xl bg-white hover:bg-slate-50 border border-slate-200/90 text-center space-y-1.5 transition-all cursor-pointer shadow-2xs group"
          >
            <div className="w-9 h-9 mx-auto rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center group-hover:scale-105 transition-transform">
              <FolderLock className="w-4 h-4" />
            </div>
            <div className="text-xs font-bold text-slate-900">Records</div>
            <div className="text-[10px] text-slate-400">Health Locker</div>
          </button>

          <button
            onClick={() => onNavigate("caregivers")}
            className="p-3.5 rounded-2xl bg-white hover:bg-slate-50 border border-slate-200/90 text-center space-y-1.5 transition-all cursor-pointer shadow-2xs group"
          >
            <div className="w-9 h-9 mx-auto rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center group-hover:scale-105 transition-transform">
              <Users className="w-4 h-4" />
            </div>
            <div className="text-xs font-bold text-slate-900">Care Circle</div>
            <div className="text-[10px] text-slate-400">Family Care</div>
          </button>
        </div>
      </div>
    </div>
  );
};
