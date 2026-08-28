import React from "react";
import {
  Mic,
  Building2,
  Pill,
  Calendar,
  FileText,
  AlertTriangle,
  Stethoscope,
  Heart,
  ChevronRight,
  Sparkles,
  PhoneCall,
  Clock,
  CheckCircle2,
  MapPin,
  Flame,
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
  accessScore: HealthAccessScoreData;
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
  accessScore,
  language,
  onNavigate,
  onOpenEmergency,
  onMarkMedTaken,
}) => {
  const t = (key: string) => TRANSLATIONS[key]?.[language] || TRANSLATIONS[key]?.["en"] || key;

  const nextAppointment = appointments.find((a) => a.status === "Scheduled") || appointments[0];
  const untakenMedication = medications.find((m) => !m.isTakenToday);
  const nearestFacility = facilities[0];

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-8 space-y-8 animate-in fade-in duration-200">
      {/* Header Greeting & Health Access Score Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-sm">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-xs font-bold text-blue-600 bg-blue-50 px-3 py-0.5 rounded-full uppercase tracking-wider">
              {userProfile.location}
            </span>
            <span className="text-xs text-slate-400 font-medium">
              ABHA: {userProfile.abhaId || "91-4820-9921-3412"}
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-800">
            {language === "te"
              ? `నమస్కారం, ${userProfile.name}`
              : language === "hi"
              ? `नमस्ते, ${userProfile.name}`
              : `Namaste, ${userProfile.name}`}
          </h2>
          <p className="text-slate-500 text-sm sm:text-base mt-1">
            "From confusion to the right care."
          </p>
        </div>

        <div className="flex items-center gap-6 self-start md:self-auto pt-2 md:pt-0 border-t md:border-t-0 border-slate-100">
          <div className="text-left md:text-right">
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Health Access Score
            </div>
            <div className="text-3xl sm:text-4xl font-black text-blue-600">
              {accessScore.overallScore}
              <span className="text-lg font-medium text-slate-400">/100</span>
            </div>
          </div>
          <button
            onClick={() => onNavigate("assistant")}
            className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-3 rounded-2xl font-bold text-sm shadow-md shadow-blue-600/20 flex items-center gap-2.5 transition-all active:scale-95 cursor-pointer shrink-0"
          >
            <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center">
              <Mic className="w-3.5 h-3.5" />
            </div>
            <span>{t("askVoice")}</span>
          </button>
        </div>
      </div>

      {/* Quick Action Grid (3 Cards) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 sm:gap-6">
        <div
          onClick={() => onNavigate("healthcare")}
          className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm hover:shadow-md cursor-pointer flex flex-col items-center text-center space-y-4 transition-all group"
        >
          <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center group-hover:scale-105 transition-transform">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          </div>
          <div>
            <span className="font-bold text-slate-800 text-lg block">Find Hospitals</span>
            <span className="text-xs text-slate-500 mt-0.5 block">PHC, CHC & Jan Aushadhi</span>
          </div>
        </div>

        <div
          onClick={() => onNavigate("appointments")}
          className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm hover:shadow-md cursor-pointer flex flex-col items-center text-center space-y-4 transition-all group"
        >
          <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center group-hover:scale-105 transition-transform">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <span className="font-bold text-slate-800 text-lg block">Appointments</span>
            <span className="text-xs text-slate-500 mt-0.5 block">Care Bundle & Checklists</span>
          </div>
        </div>

        <div
          onClick={() => onNavigate("passport")}
          className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm hover:shadow-md cursor-pointer flex flex-col items-center text-center space-y-4 transition-all group"
        >
          <div className="w-16 h-16 bg-purple-50 text-purple-600 rounded-2xl flex items-center justify-center group-hover:scale-105 transition-transform">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <div>
            <span className="font-bold text-slate-800 text-lg block">Health Passport</span>
            <span className="text-xs text-slate-500 mt-0.5 block">Offline QR & Token</span>
          </div>
        </div>
      </div>

      {/* Today's Care Block */}
      <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/80 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-slate-800">Today's Care Plan</h3>
            <p className="text-xs text-slate-500">Essential scheduled medications & health visits</p>
          </div>
          <span className="text-xs font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-full uppercase tracking-wider">
            {untakenMedication ? "Action Pending" : "Up To Date"}
          </span>
        </div>

        <div className="space-y-3">
          {/* Medication Item */}
          {untakenMedication ? (
            <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-200/60 gap-3">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-white rounded-xl shadow-xs flex items-center justify-center text-amber-500 mr-4 shrink-0 border border-slate-100">
                  <Pill className="w-6 h-6" />
                </div>
                <div>
                  <p className="font-bold text-slate-800 text-sm sm:text-base">
                    {untakenMedication.name} {untakenMedication.dosage}
                  </p>
                  <p className="text-xs text-slate-500">
                    {untakenMedication.instructions} • Scheduled for {untakenMedication.timing || "Morning"}
                  </p>
                </div>
              </div>
              <button
                onClick={() => onMarkMedTaken(untakenMedication)}
                className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-4 py-2.5 rounded-xl transition-colors cursor-pointer self-start sm:self-auto shrink-0 shadow-xs"
              >
                MARK TAKEN
              </button>
            </div>
          ) : (
            <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                <span className="text-sm font-semibold text-emerald-800">
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
                <div className="w-12 h-12 bg-white rounded-xl shadow-xs flex items-center justify-center text-blue-600 mr-4 shrink-0 border border-slate-100">
                  <Calendar className="w-6 h-6" />
                </div>
                <div>
                  <p className="font-bold text-slate-800 text-sm sm:text-base">
                    {nextAppointment.facilityName}
                  </p>
                  <p className="text-xs text-slate-500">
                    {nextAppointment.doctorName} • {nextAppointment.date} at {nextAppointment.time}
                  </p>
                </div>
              </div>
              <button
                onClick={() => onNavigate("appointments")}
                className="bg-white hover:bg-blue-50 text-blue-600 border border-blue-200 text-xs font-bold px-4 py-2.5 rounded-xl transition-colors cursor-pointer self-start sm:self-auto shrink-0"
              >
                VIEW PATHWAY
              </button>
            </div>
          )}
        </div>
      </div>

      {/* 6 Additional Navigation Tools */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Healthcare Services & Tools
          </h3>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <button
            onClick={() => onNavigate("assistant")}
            className="p-4 rounded-2xl bg-white hover:bg-slate-50 border border-slate-200/80 text-center space-y-2 transition-all cursor-pointer shadow-xs active:scale-95 group"
          >
            <div className="w-10 h-10 mx-auto rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center text-lg group-hover:scale-105 transition-transform">
              🎙️
            </div>
            <div className="text-xs font-bold text-slate-800">Saathi Voice</div>
            <div className="text-[10px] text-slate-400">Care Pathway</div>
          </button>

          <button
            onClick={() => onNavigate("healthcare")}
            className="p-4 rounded-2xl bg-white hover:bg-slate-50 border border-slate-200/80 text-center space-y-2 transition-all cursor-pointer shadow-xs active:scale-95 group"
          >
            <div className="w-10 h-10 mx-auto rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center text-lg group-hover:scale-105 transition-transform">
              🏥
            </div>
            <div className="text-xs font-bold text-slate-800">PHC & Clinics</div>
            <div className="text-[10px] text-slate-400">Resource Finder</div>
          </button>

          <button
            onClick={() => onNavigate("medicines")}
            className="p-4 rounded-2xl bg-white hover:bg-slate-50 border border-slate-200/80 text-center space-y-2 transition-all cursor-pointer shadow-xs active:scale-95 group"
          >
            <div className="w-10 h-10 mx-auto rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center text-lg group-hover:scale-105 transition-transform">
              💊
            </div>
            <div className="text-xs font-bold text-slate-800">Medicines</div>
            <div className="text-[10px] text-slate-400">Reminders & Streak</div>
          </button>

          <button
            onClick={() => onNavigate("passport")}
            className="p-4 rounded-2xl bg-white hover:bg-slate-50 border border-slate-200/80 text-center space-y-2 transition-all cursor-pointer shadow-xs active:scale-95 group"
          >
            <div className="w-10 h-10 mx-auto rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center text-lg group-hover:scale-105 transition-transform">
              🪪
            </div>
            <div className="text-xs font-bold text-slate-800">Health Passport</div>
            <div className="text-[10px] text-slate-400">Doctor QR Code</div>
          </button>

          <button
            onClick={() => onNavigate("documents")}
            className="p-4 rounded-2xl bg-white hover:bg-slate-50 border border-slate-200/80 text-center space-y-2 transition-all cursor-pointer shadow-xs active:scale-95 group"
          >
            <div className="w-10 h-10 mx-auto rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center text-lg group-hover:scale-105 transition-transform">
              📁
            </div>
            <div className="text-xs font-bold text-slate-800">Documents</div>
            <div className="text-[10px] text-slate-400">AI OCR Extractor</div>
          </button>

          <button
            onClick={() => onNavigate("doctor")}
            className="p-4 rounded-2xl bg-white hover:bg-slate-50 border border-slate-200/80 text-center space-y-2 transition-all cursor-pointer shadow-xs active:scale-95 group"
          >
            <div className="w-10 h-10 mx-auto rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center text-lg group-hover:scale-105 transition-transform">
              👨‍⚕️
            </div>
            <div className="text-xs font-bold text-slate-800">Doctor Handoff</div>
            <div className="text-[10px] text-slate-400">Clinical Summary</div>
          </button>
        </div>
      </div>
    </div>
  );
};
